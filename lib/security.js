import { randomBytes } from "node:crypto";
import { AppError } from "./errors.js";

/* ═══════════════ rate limiting ═══════════════ */

const buckets = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of buckets) {
    if (rec.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();

export function rateLimit({ windowMs, max, key = (req) => req.ip || "unknown" }) {
  return (req, res, next) => {
    const k = `${req.ip || "unknown"}|${key(req)}`;
    const now = Date.now();
    const rec = buckets.get(k);
    if (!rec || rec.resetAt <= now) {
      buckets.set(k, { count: 1, resetAt: now + windowMs });
    } else {
      rec.count += 1;
      if (rec.count > max) {
        return next(
          new AppError(429, "RATE_LIMITED", "Too many requests. Please wait a moment and try again.")
        );
      }
    }
    next();
  };
}

/* ═══════════════ security headers ═══════════════ */

function buildCsp(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "media-src 'self' blob: data:",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function securityHeaders(req, res, next) {
  const nonce = randomBytes(16).toString("base64");
  res.locals.nonce = nonce;
  res.setHeader("Content-Security-Policy", buildCsp(nonce));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  if (process.env.ENABLE_HSTS === "true") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.removeHeader("X-Powered-By");
  next();
}

/* ═══════════════ input validation ═══════════════ */

const UUID_RE = /^[0-9a-fA-F-]{8,64}$/;

export function validateChatId(id) {
  const value = String(id || "");
  if (!value || !UUID_RE.test(value)) {
    throw new AppError(400, "INVALID_REQUEST", "Unable to complete the request right now.");
  }
  return value;
}

export function safeString(value, max) {
  const s = String(value ?? "");
  return s.trim().slice(0, max);
}

export function validateImage(image) {
  if (image == null) return null;
  const str = String(image);
  if (!/^data:image\/(png|jpe?g|webp|gif|avif);base64,[A-Za-z0-9+/=\s]+$/.test(str)) {
    throw new AppError(400, "INVALID_REQUEST", "Unable to complete the request right now.");
  }
  if (str.length > 6_500_000) {
    throw new AppError(400, "INVALID_REQUEST", "Unable to complete the request right now.");
  }
  return str;
}

export function validateMessages(messages) {
  if (messages == null) return [];
  if (!Array.isArray(messages)) {
    throw new AppError(400, "INVALID_REQUEST", "Unable to complete the request right now.");
  }
  const out = [];
  for (const m of messages.slice(0, 200)) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const content = String(m?.content ?? "").slice(0, 20000);
    if (content.trim()) out.push({ role, content });
  }
  return out;
}

export function validateAudioMime(mime) {
  const t = String(mime || "");
  if (!t) return true;
  return /^(audio|video)\//i.test(t) || t.startsWith("application/octet-stream");
}

/* ═══════════════ settings whitelist ═══════════════ */

const LANGS = ["en", "es", "fr", "hi"];
const DENSITIES = ["comfortable", "compact", "spacious"];
const BOOL_KEYS = ["enterToSend", "autoScroll", "rememberConversations", "storeLocally"];

export function sanitizeSettings(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out = {};
  if (LANGS.includes(String(input.lang))) out.lang = String(input.lang);
  if (DENSITIES.includes(String(input.density))) out.density = String(input.density);
  for (const k of BOOL_KEYS) {
    if (typeof input[k] === "boolean") out[k] = input[k];
  }
  return out;
}
