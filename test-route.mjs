import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.get("/api/health", (req, res) => {
  console.log("[TEST] /api/health called");
  res.json({ ok: true, ai: false, time: new Date().toISOString() });
});

app.get("/", (req, res) => {
  console.log("[TEST] / called");
  res.send("Hello World");
});

app.use((err, _req, res, _next) => {
  console.error("[TEST] error:", err);
  res.status(500).json({ error: err.message });
});

app.listen(3001, () => {
  console.log("[TEST] Server on port 3001");
});