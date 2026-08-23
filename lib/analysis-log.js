/* ═══════════════════════════════════════════════════════════
   ReguLens — analysis pipeline logging
   Every analysis gets a durable id: ANL-YYYY-NNNNN
   All stage transitions are appended to data/analysis.log
   ═══════════════════════════════════════════════════════════ */
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const counterFile = path.join(dataDir, "analysis-counter.json");
const logFile = path.join(dataDir, "analysis.log");

export async function nextAnalysisId() {
  const year = new Date().getFullYear();
  let n = 0;
  try {
    const raw = JSON.parse(await readFile(counterFile, "utf8"));
    if (raw && raw.year === year) n = raw.n || 0;
  } catch {
    /* first run or unreadable counter — start at 0 */
  }
  n += 1;
  try {
    await mkdir(dataDir, { recursive: true });
    await writeFile(counterFile, JSON.stringify({ year, n }), "utf8");
  } catch {
    /* counter persistence is best-effort; id uniqueness within a run is enough */
  }
  return `ANL-${year}-${String(n).padStart(5, "0")}`;
}

export async function logAnalysisEvent(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  console.log(`[analysis] ${line}`);
  try {
    await mkdir(dataDir, { recursive: true });
    await appendFile(logFile, line + "\n", "utf8");
  } catch {
    /* logging must never crash the pipeline */
  }
}
