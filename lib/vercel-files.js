import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AppError } from "./errors.js";

/* ───────── project file collection for deployments ─────────
   Reads the deployable sources of this app (server + frontend)
   from disk so they can be uploaded as an inline-files deployment.
   Works both locally (repo root) and inside the bundled Vercel
   Function (files land at the same relative paths). */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_BYTES = 24 * 1024 * 1024;

const SKIP_DIRS = new Set(["node_modules", ".git", ".opencode", ".vercel", ".netlify", "data", "supabase", "netlify"]);
const SKIP_FILE = /(^|\/)(\.env(\..*)?|\.DS_Store|server_(out|err)\.txt|.*\.log)$/i;

const ROOTS = ["package.json", "server.js", "api", "lib", "public"];

export function collectProjectFiles() {
  const files = [];
  let total = 0;

  for (const entry of ROOTS) {
    const abs = path.join(ROOT, entry);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile()) pushFile(entry, abs);
    else walk(entry, abs);
  }

  if (!files.length) {
    throw new AppError(503, "VERCEL_FILES_UNAVAILABLE", "Deployment sources could not be read on the server. Contact the administrator.");
  }
  return files;

  function pushFile(rel, abs) {
    if (SKIP_FILE.test(rel)) return;
    let buf;
    try {
      buf = fs.readFileSync(abs);
    } catch {
      return;
    }
    if (buf.length > MAX_FILE_BYTES || total + buf.length > MAX_TOTAL_BYTES) return;
    total += buf.length;
    files.push({ file: rel.replace(/\\/g, "/"), data: buf.toString("base64"), encoding: "base64" });
  }

  function walk(relBase, absBase) {
    let entries;
    try {
      entries = fs.readdirSync(absBase, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of entries) {
      if (item.name.startsWith(".") && item.name !== ".well-known") continue;
      const rel = `${relBase}/${item.name}`;
      const abs = path.join(absBase, item.name);
      if (item.isDirectory()) {
        if (SKIP_DIRS.has(item.name)) continue;
        walk(rel, abs);
      } else if (item.isFile()) {
        pushFile(rel, abs);
      }
    }
  }
}
