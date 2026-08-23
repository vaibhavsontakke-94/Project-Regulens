import { appendFile, mkdir, stat, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, "..", "data");
const logFile = path.join(logDir, "error.log");
const MAX_LOG_BYTES = 1024 * 1024;

const isDev = process.env.NODE_ENV === "development";

const SECRET_PATTERNS = [
  /(bearer\s+[A-Za-z0-9._\-=]+)/gi,
  /(authorization[=:]\s*[^\s,;"']+)/gi,
  /(cookie[=:]\s*[^\s,;"']+)/gi,
  /((?:api[_-]?key|secret|password|token|private[_-]?key|access[_-]?token|jwt)[=:]\s*[^\s,;"']+)/gi,
  /(data:image\/[^;\s]+;base64,[A-Za-z0-9+/=]{16,})/gi,
];

export function redact(text) {
  let out = String(text ?? "");
  for (const re of SECRET_PATTERNS) out = out.replace(re, "[redacted]");
  return out.slice(0, 2000);
}

export function newRef(prefix = "ERR") {
  return `${prefix}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function newRequestId() {
  return randomBytes(4).toString("hex").toUpperCase();
}

let queue = Promise.resolve();

function rotateIfNeeded() {
  return stat(logFile)
    .then((s) => {
      if (s.size > MAX_LOG_BYTES) {
        return rename(logFile, `${logFile}.old`).catch(() => {});
      }
    })
    .catch(() => {});
}

function writeLine(line) {
  queue = queue.then(async () => {
    try {
      await mkdir(logDir, { recursive: true });
      await rotateIfNeeded();
      await appendFile(logFile, `${line}\n`, "utf8");
    } catch {
      /* logging must never crash the app */
    }
  });
}

export function logError({ ref, type, endpoint, requestId, cause }) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ref,
    type,
    endpoint,
    requestId,
    cause: redact(cause),
  });
  console.error(`[aurora:error] ${line}`);
  writeLine(line);
}

export function logWarn({ ref, type, endpoint, requestId, cause }) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ref,
    type,
    endpoint,
    requestId,
    cause: redact(cause),
  });
  if (isDev) console.warn(`[aurora:warn] ${line}`);
  writeLine(line);
}

export function logInfo(message) {
  console.log(`[aurora] ${redact(message).slice(0, 1000)}`);
}
