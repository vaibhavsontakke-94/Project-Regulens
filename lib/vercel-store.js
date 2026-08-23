import crypto from "node:crypto";
import { AppError } from "./errors.js";

/* ───────── encrypted per-user storage of Vercel credentials ─────────
   Access tokens are AES-256-GCM encrypted with VERCEL_TOKEN_SECRET
   before they touch storage. Production uses the vercel_integrations
   table in Supabase (service-role key stays on the server). When
   Supabase is not configured — e.g. local development — records fall
   back to in-memory storage for the lifetime of the process. */

const TABLE = "vercel_integrations";
const memory = new Map();

export function storageReady() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function encryptionKey() {
  const secret = process.env.VERCEL_TOKEN_SECRET || "";
  if (!secret) {
    throw new AppError(503, "VERCEL_NOT_CONFIGURED", "Set VERCEL_TOKEN_SECRET on the server to enable Vercel connections.");
  }
  return crypto.scryptSync(secret, "regulens-vercel-v1", 32);
}

function encrypt(obj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(obj), "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), ct.toString("base64")].join(".");
}

function decrypt(payload) {
  try {
    const [ivB64, tagB64, ctB64] = String(payload).split(".");
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]).toString("utf8"));
  } catch {
    throw new AppError(503, "VERCEL_STORE_ERROR", "Stored Vercel credentials could not be read. Please reconnect your account.");
  }
}

async function supabaseRest(method, params = {}, opts = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) query.append(key, value);
  const qs = query.toString();
  const url = `${process.env.SUPABASE_URL}/rest/v1/${TABLE}${qs ? `?${qs}` : ""}`;
  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (opts.upsert) headers.Prefer = "resolution=merge-duplicates";

  let res;
  try {
    res = await fetch(url, { method, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  } catch {
    throw new AppError(504, "VERCEL_STORE_ERROR", "The credentials store is temporarily unreachable. Try again shortly.");
  }
  if (!res.ok && res.status !== 406) {
    const detail = await res.text().catch(() => "");
    const err = new AppError(502, "VERCEL_STORE_ERROR", "Saving or reading the Vercel connection failed. Try again shortly.");
    err.detail = detail;
    throw err;
  }
  if (res.status === 204) return null;
  const text = await res.text().catch(() => "");
  return text ? JSON.parse(text) : null;
}

export async function getRecord(uid) {
  if (!uid) return null;
  if (!storageReady()) return memory.get(uid) || null;
  const rows = await supabaseRest("GET", { uid: `eq.${uid}`, select: "enc,meta" });
  const row = rows && rows[0];
  if (!row) return null;
  return { tokens: decrypt(row.enc), meta: row.meta || {} };
}

export async function saveTokens(uid, tokens) {
  const current = await getRecord(uid).catch(() => null);
  const meta = current?.meta || {};
  const enc = encrypt(tokens);
  if (!storageReady()) {
    memory.set(uid, { tokens, meta });
    return;
  }
  await supabaseRest(
    "POST",
    {},
    {
      upsert: true,
      body: { uid, enc, meta, updated_at: new Date().toISOString() },
    }
  );
}

export async function saveMeta(uid, patch) {
  const current = (await getRecord(uid).catch(() => null)) || {};
  const meta = { ...(current.meta || {}), ...patch };
  if (!storageReady()) {
    memory.set(uid, { tokens: current.tokens, meta });
    return meta;
  }
  /* Without stored tokens there is nothing to preserve — skip rather
     than overwrite a possibly-existing row with an empty payload. */
  if (!current.tokens) return meta;
  await supabaseRest(
    "POST",
    {},
    {
      upsert: true,
      body: { uid, enc: encrypt(current.tokens), meta, updated_at: new Date().toISOString() },
    }
  );
  return meta;
}

export async function clearRecord(uid) {
  if (!storageReady()) {
    memory.delete(uid);
    return;
  }
  await supabaseRest("DELETE", { uid: `eq.${uid}` });
}
