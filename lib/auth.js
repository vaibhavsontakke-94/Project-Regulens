import { scryptSync, timingSafeEqual, verify, X509Certificate } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AppError } from "./errors.js";
import * as db from "./supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const usersFile = path.join(dataDir, "users.json");

/* Firebase Auth password-hash config — used when importing existing users from data/users.json into Firebase (scrypt). */
export const HASH_CONFIG = {
  algorithm: "SCRYPT",
  base64_signer_key: "DTcTUte79C4kDvqh3uYy1/HFoJXsDYMWXZIkoe0AYdaZLg2bdhEslg77hTBT3BJLlxuqmwXjJeF4R3a1PfPzVw==",
  base64_salt_separator: "Bw==",
  rounds: 8,
  mem_cost: 14,
};

/* ───────── Firebase ID-token verification (no Admin SDK) ───────── */

const CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const CERTS_TTL = 12 * 60 * 60 * 1000;
let certCache = { keys: null, fetchedAt: 0 };

function projectId() {
  return process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
}

function base64UrlDecode(input) {
  const b64 = String(input).replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (b64.length % 4)) % 4;
  return Buffer.from(b64.padEnd(b64.length + pad, "="), "base64");
}

async function getSigningKeys() {
  if (certCache.keys && Date.now() - certCache.fetchedAt < CERTS_TTL) return certCache.keys;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error("Unable to fetch Firebase signing keys");
  const keys = await res.json();
  certCache = { keys, fetchedAt: Date.now() };
  return keys;
}

export async function verifyIdToken(token) {
  const pid = projectId();
  if (!pid) {
    throw new AppError(503, "NOT_CONFIGURED", "Firebase is not configured. Set FIREBASE_PROJECT_ID in .env");
  }
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [headerB64, payloadB64, signatureB64] = parts;

  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlDecode(headerB64).toString("utf8"));
    payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf8"));
  } catch {
    throw new Error("Malformed token");
  }

  if (header.alg !== "RS256") throw new Error("Unexpected token algorithm");
  if (!header.kid) throw new Error("Missing token key id");
  if (payload.aud !== pid) throw new Error("Invalid token audience");
  if (payload.iss !== `https://securetoken.google.com/${pid}`) throw new Error("Invalid token issuer");
  if (!payload.sub) throw new Error("Token missing subject");
  if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error("Token expired");

  const keys = await getSigningKeys();
  const certPem = keys[header.kid];
  if (!certPem) throw new Error("Unknown Firebase signing key");
  const publicKey = new X509Certificate(certPem).publicKey;
  const ok = verify("sha256", Buffer.from(`${headerB64}.${payloadB64}`), publicKey, base64UrlDecode(signatureB64));
  if (!ok) throw new Error("Invalid token signature");
  return payload;
}

/* ───────── user store (keyed by Firebase uid) ───────── */

async function readUsers() {
  try {
    return JSON.parse(await readFile(usersFile, "utf8"));
  } catch {
    return [];
  }
}

let queue = Promise.resolve();
function writeUsers(users) {
  queue = queue.then(async () => {
    await mkdir(dataDir, { recursive: true });
    await writeFile(usersFile, JSON.stringify(users, null, 2));
  });
  return queue;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || "",
    settings: user.settings || {},
    createdAt: user.createdAt,
  };
}

async function ensureUser(uid, { email, name, photoURL }) {
  const normEmail = String(email || "").toLowerCase();

  if (db.isConfigured()) {
    try {
      return await db.upsertProfile({
        id: uid,
        email: normEmail,
        name: name || normEmail.split("@")[0],
        photoURL: photoURL || "",
      });
    } catch (err) {
      if (!/could not find the table/i.test(err.detail || "")) throw err;
      /* profiles table isn't provisioned yet — fall back to the local file store */
    }
  }

  const users = await readUsers();
  const now = new Date().toISOString();
  const found = users.find((u) => u.id === uid);

  if (!found) {
    const legacy = users.find((u) => u.email === normEmail && u.id !== uid);
    const user = {
      id: uid,
      name: name || (legacy && legacy.name) || normEmail.split("@")[0],
      email: normEmail,
      photoURL: photoURL || "",
      settings: legacy && legacy.settings ? legacy.settings : {},
      createdAt: legacy ? legacy.createdAt : now,
    };
    users.push(user);
    await writeUsers(users);
    return publicUser(user);
  }

  let changed = false;
  if (email && found.email !== normEmail) {
    found.email = normEmail;
    changed = true;
  }
  if (name && found.name !== name) {
    found.name = name;
    changed = true;
  }
  if (photoURL && found.photoURL !== photoURL) {
    found.photoURL = photoURL;
    changed = true;
  }
  if (changed) await writeUsers(users);
  return publicUser(found);
}

export async function userFromIdToken(token) {
  const claims = await verifyIdToken(token);
  return ensureUser(claims.sub, {
    email: claims.email || "",
    name: claims.name || "",
    photoURL: claims.picture || "",
  });
}

export async function getSettings(user) {
  return user.settings || {};
}

export async function saveSettings(userId, settings) {
  const clean = settings && typeof settings === "object" ? settings : {};
  if (db.isConfigured()) {
    try {
      const saved = await db.updateProfileSettings(userId, clean);
      if (saved != null) return saved;
    } catch (err) {
      if (!/could not find the table/i.test(err.detail || "")) throw err;
      /* fall back to the local file store */
    }
  }
  const users = await readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  user.settings = clean;
  await writeUsers(users);
  return user.settings;
}

/* ───────── legacy scrypt verification (one-time migration) ───────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashPassword(password, salt) {
  return scryptSync(String(password), salt, 64).toString("hex");
}

function verifyPassword(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(String(expectedHash), "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* minimal in-memory throttle: 5 failed attempts per email within 15 minutes */
const attempts = new Map();
function throttleCheck(email) {
  const rec = attempts.get(email);
  if (!rec) return;
  if (Date.now() > rec.resetAt) {
    attempts.delete(email);
    return;
  }
  if (rec.count >= 5) {
    throw new AppError(429, "RATE_LIMITED", "Too many attempts. Try again in a few minutes.");
  }
}
function recordFailure(email) {
  const rec = attempts.get(email);
  if (!rec || Date.now() > rec.resetAt) {
    attempts.set(email, { count: 1, resetAt: Date.now() + 15 * 60 * 1000 });
  } else {
    rec.count += 1;
  }
}

export async function verifyLegacyUser({ email, password }) {
  const normEmail = String(email || "").trim().toLowerCase();
  if (!normEmail || !EMAIL_RE.test(normEmail)) return null;
  const users = await readUsers();
  const user = users.find((u) => u.email === normEmail);
  if (!user) return null;
  throttleCheck(normEmail);
  if (!verifyPassword(String(password || ""), user.salt, user.passwordHash)) {
    recordFailure(normEmail);
    return null;
  }
  attempts.delete(normEmail);
  return publicUser(user);
}
