import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as store from "./lib/store.js";
import * as ai from "./lib/groq.js";
import * as auth from "./lib/auth.js";
import { migratePasswordUser } from "./lib/migrate.js";
import { toPublicError } from "./lib/errors.js";
import { nextAnalysisId, logAnalysisEvent } from "./lib/analysis-log.js";

/* Shared deterministic engines — ONE source of truth (also served to the browser).
   Static imports so serverless bundlers (Vercel NFT) always trace them. */
import core from "./lib/regulens-core.cjs";
import gov from "./lib/gov-engine.cjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  /* .env is optional */
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ type: "application/json", limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* Serve the shared core to the browser as a classic script (window.RegulensCore). */
app.get("/core/regulens-core.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.sendFile(path.join(__dirname, "lib", "regulens-core.cjs"));
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ai: ai.isConfigured(), time: new Date().toISOString() });
});

/* ───────── input sanitization ───────── */
const MAX_STR_LEN = 200;
function sanitizeStr(v, max = MAX_STR_LEN) {
  return String(v || "").trim().slice(0, max);
}
function sanitizeObj(obj, keys, max = MAX_STR_LEN) {
  const out = {};
  for (const k of keys) out[k] = sanitizeStr(obj[k], max);
  return out;
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

const STYLES = {
  friendly: "warm, friendly, and supportive, like a helpful conversation partner",
  professional: "clear, professional, and precise",
  creative: "imaginative and creative in your phrasing",
  concise: "brief and to the point",
};

function buildSystemPrompt({ personality }) {
  const style = STYLES[personality] || STYLES.friendly;
  return `You are Synora, a friendly, honest, genuine, and intelligent AI assistant.
Adopt a ${style} tone.
Answer the user in the same language they write in.
Be honest: if you are uncertain or don't know something, say so clearly. Never fabricate facts, sources, or statistics. Give direct, useful answers without unnecessary preamble or filler.`;
}

function toAPIMessage({ role, content, image }) {
  const r = role === "user" ? "user" : "assistant";
  if (image) {
    return {
      role: r,
      content: [
        { type: "text", text: content || "" },
        { type: "image_url", image_url: { url: image } },
      ],
    };
  }
  return { role: r, content };
}

function buildMessages(chat, personality) {
  const history = chat.messages.map(toAPIMessage);
  const system = [{ role: "system", content: buildSystemPrompt({ personality }) }];
  const docs = chat.documents || [];
  if (docs.length) {
    const block = docs
      .map((d) => `Document "${d.name}":\n${d.text}`)
      .join("\n\n-----\n\n");
    system.push({
      role: "system",
      content: `The user attached the following document(s). Use them to answer questions about the documents. Never invent content that is not present in them.\n\n${block}`,
    });
  }
  return [...system, ...history];
}

function sse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/* ───────── auth helpers ───────── */
function tokenFrom(req) {
  const h = req.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

async function ownerId(req) {
  const token = tokenFrom(req);
  if (!token) return null;
  const user = await auth.userFromIdToken(token);
  return user ? user.id : null;
}

/* ───────── firebase public config (never includes hash secrets) ───────── */
function firebasePublicConfig() {
  const map = {
    apiKey: "FIREBASE_API_KEY",
    authDomain: "FIREBASE_AUTH_DOMAIN",
    projectId: "FIREBASE_PROJECT_ID",
    storageBucket: "FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
    appId: "FIREBASE_APP_ID",
  };
  const cfg = {};
  for (const [key, envName] of Object.entries(map)) {
    if (process.env[envName]) cfg[key] = process.env[envName];
  }
  return cfg;
}

/* ───────── health ───────── */
app.get("/api/health", async (req, res) => {
  if (req.query.probe) {
    res.json({ ok: true, ...(await ai.probe()) });
  } else {
    res.json({ ok: true, ...ai.configuredInfo() });
  }
});

/* ───────── firebase client config ───────── */
app.get("/api/firebase-config", (req, res) => {
  res.json(firebasePublicConfig());
});

/* ───────── auth ───────── */
app.post("/api/auth/migrate", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const result = await migratePasswordUser({ email, password });
    res.json(result);
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const user = await auth.userFromIdToken(tokenFrom(req));
    if (!user) return res.status(401).json({ error: "Not signed in" });
    res.json({ user });
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message });
  }
});

/* ───────── settings (account-synced) ───────── */
app.get("/api/settings", async (req, res) => {
  try {
    const user = await auth.userFromIdToken(tokenFrom(req));
    if (!user) return res.status(401).json({ error: "Not signed in" });
    res.json(await auth.getSettings(user));
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const user = await auth.userFromIdToken(tokenFrom(req));
    if (!user) return res.status(401).json({ error: "Not signed in" });
    const settings = await auth.saveSettings(user.id, req.body);
    res.json(settings);
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message });
  }
});

/* ───────── chats (scoped to the signed-in account) ───────── */
app.get("/api/chats", async (req, res) => {
  res.json(await store.listChats(await ownerId(req)));
});

app.post("/api/chats", async (req, res) => {
  const { title, documents, messages, ephemeral } = req.body || {};
  const chat = await store.createChat({
    ownerId: await ownerId(req),
    title,
    documents,
    messages,
    ephemeral: !!ephemeral,
  });
  res.status(201).json(chat);
});

app.get("/api/chats/:id", async (req, res) => {
  const chat = await store.getChat(req.params.id, await ownerId(req));
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  res.json(chat);
});

app.delete("/api/chats", async (req, res) => {
  await store.clearChats(await ownerId(req));
  res.json({ ok: true });
});

app.delete("/api/chats/:id", async (req, res) => {
  await store.deleteChat(req.params.id, await ownerId(req));
  res.json({ ok: true });
});

app.post("/api/chats/:id/documents", async (req, res) => {
  const { documents } = req.body || {};
  const chat = await store.addDocuments(req.params.id, documents, {
    ownerId: await ownerId(req),
  });
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  res.json(chat);
});

/* ───────── chat message (SSE streaming) ───────── */
app.post("/api/chats/:id/messages", async (req, res) => {
  const { content, image } = req.body || {};
  if ((!content || !content.trim()) && !image) {
    return res.status(400).json({ error: "content is required" });
  }
  if (!ai.isConfigured()) {
    return res.status(503).json({ error: "AI is not configured. Set GROQ_API_KEY in .env" });
  }

  const owner = await ownerId(req);
  const chat = await store.pushUserMessage(req.params.id, content.trim(), image, { ownerId: owner });
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let full = "";
  const finish = (type, payload) => {
    try {
      sse(res, { type, ...payload });
      res.end();
    } catch {
      /* client went away */
    }
  };

  try {
    await ai.streamChat({
      messages: buildMessages(chat, "friendly"),
      onDelta: (content) => {
        full += content;
        sse(res, { type: "delta", content });
      },
    });
    await store.appendAssistantMessage(chat.id, full, { ownerId: owner });
    finish("done", { content: full });
  } catch (err) {
    finish("error", { message: "AI response failed" });
  }
});

/* ───────── translation ───────── */
function extractJson(text) {
  const t = String(text || "").trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : t;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

app.post("/api/translate", async (req, res) => {
  const { text, source, target } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "text is required" });
  if (!ai.isConfigured()) {
    return res.status(503).json({ error: "AI is not configured. Set GROQ_API_KEY in .env" });
  }

  const isAuto = !source || String(source).toLowerCase() === "auto";
  const tgtLabel = target || "English";
  try {
    if (isAuto) {
      const out = await ai.complete({
        messages: [
          {
            role: "system",
            content: `You are a precise translation engine with language detection. Detect the language of the user's text, then translate it into ${tgtLabel}. Preserve meaning, tone, and formatting. Respond ONLY with valid JSON of the form {"detected": "Language Name", "translation": "..."} where "detected" is the detected language's name in English (e.g. "English", "Hindi", "Marathi"). Return nothing but the JSON object.`,
          },
          { role: "user", content: text },
        ],
      });
      const parsed = extractJson(out);
      if (parsed && parsed.translation) {
        res.json({ text: parsed.translation, detected: parsed.detected || "" });
      } else {
        res.json({ text: out, detected: "" });
      }
    } else {
      const srcLabel = source;
      const out = await ai.complete({
        messages: [
          {
            role: "system",
            content: `You are a precise translation engine. Translate the user's text from ${srcLabel} to ${tgtLabel}. Preserve meaning, tone, and formatting. Return only the translation, nothing else.`,
          },
          { role: "user", content: text },
        ],
      });
      res.json({ text: out });
    }
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/* ───────── text-to-speech (neural, human voice) ───────── */
app.post("/api/speech", async (req, res) => {
  const { text, voice, lang } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }
  if (!ai.isConfigured()) {
    return res.status(503).json({ error: "AI is not configured. Set GROQ_API_KEY in .env" });
  }
  try {
    const audio = await ai.synthesizeSpeech({ text: text.trim(), voice, lang });
    res.setHeader("Content-Type", "audio/wav");
    res.send(audio);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/* ───────── speech-to-text ───────── */
app.post(
  "/api/transcribe",
  express.raw({ type: () => true, limit: "25mb" }),
  async (req, res) => {
    if (!ai.isConfigured()) {
      return res.status(503).json({ error: "AI is not configured. Set GROQ_API_KEY in .env" });
    }
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: "audio is required" });
    }
    try {
      const text = await ai.transcribeAudio(Buffer.from(req.body), req.get("content-type"));
      res.json({ text });
    } catch (err) {
      res.status(502).json({ error: err.message });
    }
  }
);

/* ───────── market-readiness analysis (multi-agent SSE workflow) ───────── */

/* ───────── markets & industries lookup ───────── */
const DROPDOWN_DATA = {
  markets: [
    { id: "in", name: "🇮🇳 India" },
    { id: "us", name: "🇺🇸 United States" },
    { id: "uk", name: "🇬🇧 United Kingdom" },
    { id: "ae", name: "🇦🇪 UAE" },
    { id: "de", name: "🇩🇪 Germany" },
    { id: "sg", name: "🇸🇬 Singapore" },
    { id: "au", name: "🇦🇺 Australia" },
    { id: "ca", name: "🇨🇦 Canada" },
    { id: "jp", name: "🇯🇵 Japan" },
    { id: "eu", name: "🇪🇺 European Union" },
    { id: "fr", name: "🇫🇷 France" },
    { id: "cn", name: "🇨🇳 China" },
    { id: "br", name: "🇧🇷 Brazil" },
    { id: "kr", name: "🇰🇷 South Korea" },
    { id: "sa", name: "🇸🇦 Saudi Arabia" },
    { id: "mx", name: "🇲🇽 Mexico" },
    { id: "it", name: "🇮🇹 Italy" },
    { id: "es", name: "🇪🇸 Spain" },
    { id: "nl", name: "🇳🇱 Netherlands" },
    { id: "se", name: "🇸🇪 Sweden" },
    { id: "ch", name: "🇨🇭 Switzerland" },
  ],
  industries: [
    { id: "fintech", name: "FinTech" },
    { id: "banking-financial", name: "Banking & Financial Services" },
    { id: "healthcare", name: "Healthcare" },
    { id: "healthtech", name: "HealthTech" },
    { id: "edtech", name: "EdTech" },
    { id: "ecommerce", name: "E-commerce" },
    { id: "saas", name: "SaaS" },
    { id: "ai-ml", name: "AI & Machine Learning" },
    { id: "manufacturing", name: "Manufacturing" },
    { id: "retail", name: "Retail" },
    { id: "food-beverage", name: "Food & Beverage" },
    { id: "logistics", name: "Logistics & Supply Chain" },
    { id: "energy", name: "Energy" },
    { id: "automotive", name: "Automotive" },
    { id: "telecommunications", name: "Telecommunications" },
    { id: "insurance", name: "Insurance" },
    { id: "pharmaceuticals", name: "Pharmaceuticals" },
    { id: "travel-tourism", name: "Travel & Tourism" },
    { id: "general", name: "General / Other" },
  ],
};

app.get("/api/markets", (_req, res) => {
  res.json(DROPDOWN_DATA);
});

function extractJSON(text) {
  const t = String(text || "").trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : t;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(candidate.slice(start, end + 1)); } catch { return null; }
}

const MARKET_NAMES = {
  de: "Germany", fr: "France", us: "United States", uk: "United Kingdom",
  jp: "Japan", cn: "China", in: "India", br: "Brazil", au: "Australia",
  ca: "Canada", kr: "South Korea", sg: "Singapore", ae: "UAE",
  sa: "Saudi Arabia", mx: "Mexico", it: "Italy", es: "Spain",
  nl: "Netherlands", se: "Sweden", ch: "Switzerland", eu: "European Union",
};

app.post("/api/analysis", async (req, res) => {
  if (!ai.isConfigured()) {
    return res.status(503).json({
      success: false,
      errorCode: "AI_NOT_CONFIGURED",
      message: "AI is not configured. Set GROQ_API_KEY in .env",
      retryable: false,
    });
  }

  const raw = req.body || {};
  const company = sanitizeStr(raw.company, 100);
  const product = sanitizeStr(raw.product, 100);
  const origin = sanitizeStr(raw.origin, 50) || "India";
  const target = sanitizeStr(raw.target, 10);
  const industry = sanitizeStr(raw.industry, 50);

  if (!company || !product || !target || !industry) {
    const missing = [
      !company && "company", !product && "product",
      !target && "target", !industry && "industry",
    ].filter(Boolean);
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION_FAILED",
      message: `Missing required field(s): ${missing.join(", ")}`,
      retryable: false,
    });
  }

  const analysisId = await nextAnalysisId();
  const marketName = MARKET_NAMES[target] || target;
  const ctx = { company, product, origin, target: marketName, industry };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  if (res.socket) res.socket.setNoDelay(true);

  let completedStages = [];
  let currentStage = "initialization";
  let clientDisconnected = false;
  req.on("close", () => { clientDisconnected = true; });
  const sse = (payload) => {
    if (clientDisconnected) return;
    try {
      const data = `data: ${JSON.stringify({ analysisId, ...payload })}\n\n`;
      res.write(data);
      if (res.socket && !res.socket.destroyed) {
        res.socket.cork();
        res.socket.uncork();
      }
    } catch {}
  };
  const done = (type, payload) => { if (clientDisconnected) return; try { sse({ type, ...payload }); res.end(); } catch {} };

  /* Recommended action per error code — shown verbatim in the UI (safe text only). */
  const RECOMMENDED = {
    PROVIDER_AUTH_REJECTED: "Check the configured provider API key and account permissions, then retry.",
    PROVIDER_MODEL_UNAVAILABLE: "Retry — the system automatically falls back to an available model.",
    RATE_LIMITED: "Wait a moment and retry (provider rate limit).",
    PROVIDER_ERROR: "Retry in a few seconds.",
    PROVIDER_UNREACHABLE: "Check network connectivity and retry.",
    MALFORMED_RESPONSE: "Retry the analysis.",
  };

  /* Structured stage failure: logs the event and emits the error contract. */
  const failStage = (stage, err) => {
    const meta = (err && err.meta) || {};
    const details = String((err && err.message) || err || "unknown error").slice(0, 300);
    const errorCode = meta.errorCode || "STAGE_FAILED";
    const payload = {
      type: "error",
      analysisId,
      stage,
      stageLabel: currentStage,
      errorCode,
      message: meta.safeMessage || "This stage could not be completed.",
      retryable: meta.retryable !== false,
      recommendedAction: RECOMMENDED[errorCode] || "Please retry the analysis. If it keeps failing, check the AI configuration.",
      details,
    };
    logAnalysisEvent({
      analysisId, event: "stage_failed", stage, stageLabel: currentStage,
      providerStatus: meta.status ?? null, errorCode, retryable: payload.retryable, cause: details,
    });
    sse({ type: "stage", stage, status: "error", error: payload.message });
    done("error", payload);
  };

  /* Typed parse failure so the UI can distinguish it from provider outages. */
  const parseError = (what) => {
    const e = new Error(`Could not parse ${what}`);
    e.meta = { errorCode: "MALFORMED_RESPONSE", retryable: true, safeMessage: `The ${what} response could not be parsed.` };
    return e;
  };

  /* Stage output shape validation — a parseable but wrong-shaped response
     must fail fast with a clear contract, not crash the next stage. */
  const requireArray = (obj, key, what) => {
    if (!obj || !Array.isArray(obj[key])) throw parseError(what);
    return obj[key];
  };

  logAnalysisEvent({ analysisId, event: "analysis_started", input: { company, product, origin, target: marketName, industry } });

  try {
    /* ── Stage 1: Regulatory Research Agent ── */
    currentStage = "Researching applicable regulations";
    sse({ type: "stage", stage: "research", status: "running", label: currentStage });
    logAnalysisEvent({ analysisId, event: "stage_started", stage: "research" });
    const researchPrompt = `You are a Regulatory Research Agent. Identify regulations that MAY apply to this product launch.

Company: ${ctx.company}
Product: ${ctx.product}
Origin Country: ${ctx.origin}
Target Market: ${ctx.target}
Industry: ${ctx.industry}

CRITICAL RULES:
- Only list regulations you are confident about based on your training data.
- If you are uncertain whether a regulation applies, include it but set "confidence" to "low".
- For each regulation, cite the official source name and reference code.
- Never fabricate regulation names, codes, or authority names.
- If you cannot identify specific regulations for this market/industry, say so explicitly in the data.
- Every regulation MUST include a "source" field with the official issuing body name.

Return ONLY valid JSON (no markdown fencing, no explanation) with this exact structure:
{
  "regulations": [
    {
      "id": "reg-1",
      "title": "Regulation Name",
      "authority": "Issuing Authority",
      "kind": "New|Amendment|Update",
      "date": "YYYY-MM-DD",
      "summary": "Brief summary",
      "source": "Official source name (REQUIRED)",
      "code": "Regulation code/reference number",
      "confidence": "high|medium|low",
      "flag": "country flag emoji",
      "watch": true,
      "update": false,
      "updateDesc": "",
      "sim": null,
      "costImpact": 0,
      "impact": "high|medium|low",
      "impactTitle": "Short title",
      "impactDesc": "Description"
    }
  ],
  "riskLevel": "Low|Medium|High",
  "estimatedDays": 90,
  "estimatedCost": 15000,
  "confidenceNote": "Overall confidence in this research"
}`;

    let researchResult;
    try {
      const researchText = await ai.complete({
        messages: [
          { role: "system", content: "You are a regulatory intelligence system. Return ONLY valid JSON. No markdown, no explanation. Never fabricate regulation names or codes." },
          { role: "user", content: researchPrompt },
        ],
        endpoint: "/api/analysis",
      });
      researchResult = extractJSON(researchText);
      if (!researchResult) throw parseError("research");
      requireArray(researchResult, "regulations", "research");
    } catch (err) {
      failStage("research", err);
      return;
    }
    completedStages.push("research");
    sse({ type: "stage", stage: "research", status: "done", data: researchResult });
    logAnalysisEvent({ analysisId, event: "stage_completed", stage: "research", regulations: (researchResult.regulations || []).length });

    /* ── Stage 2: Requirements Agent ── */
    currentStage = "Building compliance requirements";
    sse({ type: "stage", stage: "requirements", status: "running", label: currentStage });
    const reqPrompt = `You are a Compliance Requirements Agent. Based on the regulatory research, generate specific compliance requirements.

Company: ${ctx.company}
Product: ${ctx.product}
Target Market: ${ctx.target}
Industry: ${ctx.industry}
Regulations found: ${JSON.stringify(researchResult.regulations.map(r => r.title))}

Return ONLY valid JSON with this exact structure:
{
  "requirements": [
    {
      "id": "req-1",
      "name": "Requirement name",
      "authority": "Issuing authority",
      "priority": "critical|important|standard",
      "status": "pending",
      "due": "Q1 2026",
      "dueDays": 45,
      "desc": "Detailed description of what needs to be done",
      "actionTitle": "Short action title for timeline",
      "gapTitle": "Gap analysis title",
      "gapDesc": "Gap analysis description"
    }
  ],
  "total": 10,
  "critical": 3,
  "important": 4,
  "standard": 3
}`;

    let reqResult;
    try {
      const reqText = await ai.complete({
        messages: [
          { role: "system", content: "You are a compliance requirements system. Return ONLY valid JSON. No markdown, no explanation." },
          { role: "user", content: reqPrompt },
        ],
        endpoint: "/api/analysis",
      });
      reqResult = extractJSON(reqText);
      if (!reqResult) throw parseError("requirements");
      requireArray(reqResult, "requirements", "requirements");
    } catch (err) {
      failStage("requirements", err);
      return;
    }
    completedStages.push("requirements");
    sse({ type: "stage", stage: "requirements", status: "done", data: reqResult });
    logAnalysisEvent({ analysisId, event: "stage_completed", stage: "requirements", requirements: (reqResult.requirements || []).length });

    /* ── Stage 3: Gap Analysis Agent ── */
    currentStage = "Identifying compliance gaps";
    sse({ type: "stage", stage: "gaps", status: "running", label: currentStage });
    const gapPrompt = `You are a Gap Analysis Agent. Analyze the compliance gaps between current state and requirements.

Company: ${ctx.company}
Product: ${ctx.product}
Target Market: ${ctx.target}
Requirements: ${JSON.stringify(reqResult.requirements.map(r => ({ name: r.name, priority: r.priority, status: r.status })))}

Return ONLY valid JSON with this exact structure:
{
  "gaps": [
    {
      "reqId": "req-1",
      "title": "Gap title",
      "description": "Description of the compliance gap",
      "priority": "critical|important|standard",
      "severity": "high|medium|low"
    }
  ],
  "openGaps": 8,
  "closedGaps": 2,
  "inProgressGaps": 1
}`;

    let gapResult;
    try {
      const gapText = await ai.complete({
        messages: [
          { role: "system", content: "You are a compliance gap analysis system. Return ONLY valid JSON. No markdown, no explanation." },
          { role: "user", content: gapPrompt },
        ],
        endpoint: "/api/analysis",
      });
      gapResult = extractJSON(gapText);
      if (!gapResult) throw parseError("gap analysis");
      requireArray(gapResult, "gaps", "gap analysis");
    } catch (err) {
      failStage("gaps", err);
      return;
    }
    completedStages.push("gaps");
    sse({ type: "stage", stage: "gaps", status: "done", data: gapResult });
    logAnalysisEvent({ analysisId, event: "stage_completed", stage: "gaps", gaps: (gapResult.gaps || []).length });

    /* ── Stage 4: Risk & Impact Agent ── */
    currentStage = "Assessing risks & impact";
    sse({ type: "stage", stage: "risks", status: "running", label: currentStage });
    logAnalysisEvent({ analysisId, event: "stage_started", stage: "risks" });
    const riskPrompt = `You are a Risk & Impact Agent. Assess compliance risks and business impact for this market entry.

Company: ${ctx.company}
Product: ${ctx.product}
Target Market: ${ctx.target}
Industry: ${ctx.industry}
Requirements: ${JSON.stringify(reqResult.requirements.map(r => ({ id: r.id, name: r.name, priority: r.priority })))}

Return ONLY valid JSON with this exact structure:
{
  "risks": [
    {
      "id": "RISK-001",
      "title": "Risk title",
      "category": "Legal|Operational|Financial|Technical|Reputational",
      "probability": 3,
      "impact": 4,
      "severity": "Critical|High|Medium|Low",
      "affectedRequirement": "req-1",
      "businessConsequence": "Business consequence",
      "regulatoryConsequence": "Regulatory consequence",
      "mitigation": "Mitigation strategy",
      "status": "Open"
    }
  ],
  "riskLevel": "Low|Medium|High",
  "impactAnalysis": {
    "legal": { "score": 70, "level": "High", "description": "..." },
    "operational": { "score": 60, "level": "Medium", "description": "..." },
    "financial": { "score": 50, "level": "Medium", "description": "..." },
    "technical": { "score": 40, "level": "Medium", "description": "..." },
    "market": { "score": 30, "level": "Low", "description": "..." },
    "reputation": { "score": 45, "level": "Medium", "description": "..." }
  },
  "industryAnalysis": {
    "totalRegulations": 5,
    "regulatoryBurden": "High",
    "complianceBurden": "Moderate",
    "requirementDensity": 2.5,
    "complianceComplexity": "Medium",
    "marketReadiness": 40,
    "growthImpact": "...",
    "keyTrends": ["..."]
  }
}`;

    let riskResult;
    try {
      const riskText = await ai.complete({
        messages: [
          { role: "system", content: "You are a compliance risk assessment system. Return ONLY valid JSON. No markdown, no explanation." },
          { role: "user", content: riskPrompt },
        ],
        endpoint: "/api/analysis",
      });
      riskResult = extractJSON(riskText);
      if (!riskResult) throw parseError("risk & impact");
      requireArray(riskResult, "risks", "risk & impact");
      if (!riskResult.impactAnalysis || typeof riskResult.impactAnalysis !== "object") riskResult.impactAnalysis = {};
      if (!riskResult.industryAnalysis || typeof riskResult.industryAnalysis !== "object") riskResult.industryAnalysis = {};
      for (const r of riskResult.risks) {
        r.id = r.id || `RISK-${String(Math.abs(hashStr(String(r.title || ""))) % 900 + 100)}`;
        r.probability = Math.min(5, Math.max(1, Math.round(Number(r.probability) || 3)));
        r.impact = Math.min(5, Math.max(1, Math.round(Number(r.impact) || 3)));
        if (!r.severity) {
          const sc = r.probability * r.impact;
          r.severity = sc >= 16 ? "Critical" : sc >= 10 ? "High" : sc >= 5 ? "Medium" : "Low";
        }
        r.status = r.status || "Open";
      }
    } catch (err) {
      failStage("risks", err);
      return;
    }
    completedStages.push("risks");
    sse({ type: "stage", stage: "risks", status: "done", data: { risks: riskResult.risks } });
    logAnalysisEvent({ analysisId, event: "stage_completed", stage: "risks", risks: (riskResult.risks || []).length });

    /* ── Stage 5: Action Plan Agent ── */
    currentStage = "Creating action plan";
    sse({ type: "stage", stage: "actions", status: "running", label: currentStage });
    const actionPrompt = `You are an Action Plan Agent. Create a prioritized action plan for market entry.

Company: ${ctx.company}
Product: ${ctx.product}
Target Market: ${ctx.target}
Requirements: ${JSON.stringify(reqResult.requirements.map(r => ({ name: r.name, priority: r.priority, dueDays: r.dueDays })))}
Top Risks: ${JSON.stringify((riskResult.risks || []).slice(0, 5).map(r => ({ title: r.title, severity: r.severity })))}

Return ONLY valid JSON with this exact structure:
{
  "actions": [
    {
      "reqId": "req-1",
      "title": "Action title",
      "description": "What needs to be done",
      "priority": "critical|important|standard",
      "dueDays": 30,
      "owner": "Suggested responsible party",
      "estimatedCost": 5000,
      "estimatedDays": 30
    }
  ],
  "costItems": [
    {
      "name": "Item name",
      "amount": 5000,
      "days": 30,
      "reqId": "req-1",
      "category": "Certification|Testing|Legal|Documentation"
    }
  ]
}`;

    let actionResult;
    try {
      const actionText = await ai.complete({
        messages: [
          { role: "system", content: "You are a compliance action planning system. Return ONLY valid JSON. No markdown, no explanation." },
          { role: "user", content: actionPrompt },
        ],
        endpoint: "/api/analysis",
      });
      actionResult = extractJSON(actionText);
      if (!actionResult) throw parseError("action plan");
      requireArray(actionResult, "actions", "action plan");
      if (!Array.isArray(actionResult.costItems)) actionResult.costItems = [];
    } catch (err) {
      failStage("actions", err);
      return;
    }
    completedStages.push("actions");
    sse({ type: "stage", stage: "actions", status: "done", data: actionResult });
    logAnalysisEvent({ analysisId, event: "stage_completed", stage: "actions", actions: (actionResult.actions || []).length });

    /* ── Stage 6: Canonicalize + shared readiness engine ── */
    currentStage = "Calculating readiness score";
    sse({ type: "stage", stage: "readiness", status: "running", label: currentStage });
    logAnalysisEvent({ analysisId, event: "stage_started", stage: "readiness" });

    const requirements = Array.isArray(reqResult.requirements) ? reqResult.requirements : [];
    const gaps = Array.isArray(gapResult.gaps) ? gapResult.gaps : [];
    const regulations = Array.isArray(researchResult.regulations) ? researchResult.regulations : [];
    const risks = Array.isArray(riskResult.risks) ? riskResult.risks : [];

    /* Defensive defaults — derive priority counts when the model omitted them */
    const countByPriority = (p) => requirements.filter((r) => String(r.priority || "").toLowerCase() === p).length;
    const total = requirements.length;

    /* Normalize gap fields */
    for (const g of gaps) {
      if (!g.status) g.status = g.currentStatus || "open";
      if (!g.severity) g.severity = String(g.priority) === "critical" ? "high" : String(g.priority) === "important" ? "medium" : "low";
      g.id = g.id || `GAP-${hashStr(String(g.title || g.reqId || "")) % 9000 + 1000}`;
    }
    for (const r of requirements) r.id = r.id || `req-${r.name ? hashStr(r.name) % 900 + 1 : 0}`;
    for (const reg of regulations) {
      reg.id = reg.id || `reg-${hashStr(String(reg.title || "")) % 900 + 1}`;
      if (!reg.source && reg.authority) reg.source = reg.authority;
      reg.watch = reg.watch !== false;
    }

    actionResult.costItems = Array.isArray(actionResult.costItems) ? actionResult.costItems : [];

    /* Shared engines — same code path as demo mode and the browser */
    const enriched = core.enrichActionPlan(Array.isArray(actionResult.actions) ? actionResult.actions : [], { requirements, gaps, risks });
    if (enriched.dependencyIssues.length) {
      logAnalysisEvent({ analysisId, event: "dependency_issues_fixed", issues: enriched.dependencyIssues.slice(0, 10) });
    }
    const actions = enriched.actions;
    const timeline = core.computeTimeline(actions);
    const sources = core.collectSources(regulations, { targetCountry: marketName });
    const readinessBreakdown = core.calculateReadiness({ requirements, gaps, risks });
    const launch = core.canLaunch({ readinessBreakdown, requirements, gaps, risks });

    const totalCost = actionResult.costItems.reduce((s, c) => s + (Number(c.amount) || 0), 0);
    const estimatedDays = Number(researchResult.estimatedDays) || timeline.totalDays;
    const estimatedCost = Number(researchResult.estimatedCost) || totalCost;

    const analysisData = {
      company,
      product,
      origin,
      target: marketName,
      targetId: target,
      industry,
      /* legacy numeric field preserved for existing consumers */
      readiness: readinessBreakdown.score,
      readinessStatus: readinessBreakdown.status,
      riskLevel: riskResult.riskLevel || researchResult.riskLevel || "Medium",
      estimatedDays,
      estimatedCost,
      confidenceNote: researchResult.confidenceNote || "",
      regulations,
      requirements,
      gaps,
      actions,
      costItems: actionResult.costItems,
      stats: {
        total,
        critical: reqResult.critical ?? countByPriority("critical"),
        important: reqResult.important ?? countByPriority("important"),
        standard: reqResult.standard ?? countByPriority("standard"),
        completed: 0,
        inProgress: 0,
        pending: requirements.length,
        nA: 0,
      },
      gapStats: {
        open: gapResult.openGaps ?? gaps.length,
        closed: gapResult.closedGaps ?? 0,
        inProgress: gapResult.inProgressGaps ?? 0,
      },
      riskMatrix: risks,
      costBreakdown: [],
      impactAnalysis: riskResult.impactAnalysis || {},
      industryAnalysis: riskResult.industryAnalysis || {},
      policySimulation: null,
      scenarios: [],
      completedStages: [...completedStages],
      /* canonical additions */
      analysisId,
      input: { company, product, origin, target: marketName, industry },
      research: {
        regulationsCount: regulations.length,
        riskLevel: researchResult.riskLevel || null,
        confidenceNote: researchResult.confidenceNote || "",
        estimatedDays,
        estimatedCost,
      },
      timeline,
      cost: { currency: "EUR", items: actionResult.costItems, total: totalCost },
      sources,
      readinessBreakdown,
      canLaunch: launch,
      metadata: { engine: "regulens-core@1", mode: "live", generatedAt: new Date().toISOString() },
    };

    completedStages.push("readiness");
    sse({ type: "stage", stage: "readiness", status: "done", data: { readiness: readinessBreakdown.score, readinessStatus: readinessBreakdown.status } });
    logAnalysisEvent({ analysisId, event: "stage_completed", stage: "readiness", readiness: readinessBreakdown.score });
    logAnalysisEvent({
      analysisId, event: "analysis_completed", stages: completedStages,
      readiness: readinessBreakdown.score, canLaunch: launch.state,
      counts: { regulations: regulations.length, requirements: requirements.length, gaps: gaps.length, risks: risks.length, actions: actions.length },
    });
    done("done", { data: analysisData });
  } catch (err) {
    logAnalysisEvent({ analysisId, event: "analysis_failed", stage: currentStage, cause: String((err && err.message) || err).slice(0, 300) });
    done("error", {
      analysisId,
      stage: currentStage,
      errorCode: "PIPELINE_FAILED",
      message: "Analysis failed at " + currentStage,
      retryable: true,
      recommendedAction: "Please retry the analysis. If it keeps failing, check the AI configuration.",
      details: String((err && err.message) || err).slice(0, 300),
    });
  }
});

/* ───────── demo analysis (no AI required) ───────── */
import { runDemoAnalysis } from "./lib/demo-engine.js";

app.post("/api/analysis/demo", async (req, res) => {
  const raw = req.body || {};
  const company = sanitizeStr(raw.company, 100);
  const product = sanitizeStr(raw.product, 100);
  const origin = sanitizeStr(raw.origin, 50) || "India";
  const target = sanitizeStr(raw.target, 10);
  const industry = sanitizeStr(raw.industry, 50);

  if (!company || !product || !target || !industry) {
    return res.status(400).json({ error: "company, product, target, and industry are required" });
  }

  try {
    const analysisId = await nextAnalysisId();
    const data = runDemoAnalysis({ company, product, origin, target, industry, analysisId });
    logAnalysisEvent({
      analysisId, event: "analysis_completed", mode: "demo",
      readiness: data.readiness, canLaunch: data.canLaunch ? data.canLaunch.state : null,
      counts: {
        regulations: data.regulations.length, requirements: data.requirements.length,
        gaps: data.gaps.length, risks: (data.riskMatrix || []).length, actions: data.actions.length,
      },
    });
    res.json(data);
  } catch (err) {
    console.error("[demo] analysis error:", err);
    logAnalysisEvent({ event: "analysis_failed", mode: "demo", cause: String((err && err.message) || err).slice(0, 300) });
    res.status(500).json({ error: "Demo analysis failed" });
  }
});

/* ───────── demo report (no AI required) ───────── */
app.post("/api/report/demo", (req, res) => {
  const { analysis, lang } = req.body || {};
  if (!analysis || !analysis.company || !analysis.product) {
    return res.status(400).json({ error: "analysis data is required" });
  }

  const stats = analysis.stats || {};
  const readiness = analysis.readiness || 0;

  const execSummary = `${analysis.company} is analyzing the regulatory landscape for ${analysis.product} in ${analysis.target || "the target market"}. Based on the ${analysis.regulations?.length || 0} applicable regulations identified across ${analysis.industry || "the"} industry, the current market readiness score stands at ${readiness}%. ${stats.critical || 0} critical and ${stats.important || 0} important compliance requirements have been identified, with ${stats.pending || 0} items pending resolution. The estimated compliance cost is €${(analysis.estimatedCost || 0).toLocaleString()} over ${analysis.estimatedDays || 0} days. Key regulatory areas requiring immediate attention include data protection, licensing requirements, and consumer protection frameworks applicable to ${analysis.target || "the target market"}.`;

  const recommendation = readiness >= 70
    ? { recommendation: "Proceed", verdict: `${analysis.company} is sufficiently prepared to launch ${analysis.product} in ${analysis.target}. Minor compliance items should be monitored.`, prerequisites: [], timeline: (analysis.estimatedDays || 0) + " days" }
    : readiness >= 40
    ? { recommendation: "Conditional", verdict: `${analysis.company} should address critical compliance gaps before launching ${analysis.product} in ${analysis.target}.`, prerequisites: (analysis.requirements || []).filter((r) => r.priority === "critical").map((r) => r.name).slice(0, 3), timeline: (analysis.estimatedDays || 0) + " days" }
    : { recommendation: "Delay", verdict: `Significant compliance work is required before ${analysis.company} can launch ${analysis.product} in ${analysis.target}.`, prerequisites: (analysis.requirements || []).filter((r) => r.priority === "critical").map((r) => r.name).slice(0, 5), timeline: (analysis.estimatedDays || 0) + " days" };

  res.json({ executiveSummary: execSummary, recommendation });
});

/* ═══════════ GOVERNMENT INTELLIGENCE (canonical policy engine) ═══════════
   All government modules share ONE payload: buildGovernmentPackage().
   Scenario/compare endpoints rebuild the package under modified policy
   assumptions, so every number stays consistent across the whole UI. */
const GOV_LANG_LABEL = {
  en: "English", es: "Spanish", fr: "French", hi: "Hindi", de: "German",
  pt: "Portuguese", ru: "Russian", ja: "Japanese", zh: "Chinese",
  ko: "Korean", mr: "Marathi",
};

function sanitizeGovContext(raw) {
  const body = raw || {};
  return {
    originId: sanitizeStr(body.originId, 8).toLowerCase(),
    targetId: sanitizeStr(body.targetId, 8).toLowerCase(),
    industryId: sanitizeStr(body.industryId, 40).toLowerCase(),
    company: sanitizeStr(body.company, 120),
    product: sanitizeStr(body.product, 160),
  };
}

app.get("/api/gov/meta", (_req, res) => {
  res.json({
    engineVersion: gov.GOV_VERSION,
    countries: Object.values(gov.GOV_COUNTRIES),
    industries: gov.INDUSTRIES,
  });
});

app.post("/api/gov/package", (req, res) => {
  try {
    const pkg = gov.buildGovernmentPackage(sanitizeGovContext(req.body));
    res.json(pkg);
  } catch (err) {
    console.error("[gov] package error:", err);
    res.status(500).json({ error: "Government analysis failed" });
  }
});

app.post("/api/gov/simulate", (req, res) => {
  const body = req.body || {};
  const spec = {
    changeType: sanitizeStr(body.changeType, 20),
    policyId: sanitizeStr(body.policyId, 60),
    implementationLevel: Number(body.implementationLevel),
    horizonDays: Number(body.horizonDays),
  };
  const result = gov.simulateScenario(sanitizeGovContext(body.context), spec);
  if (result && result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

app.post("/api/gov/compare", (req, res) => {
  const body = req.body || {};
  const specs = Array.isArray(body.scenarios) ? body.scenarios.slice(0, 3).map((s) => ({
    changeType: sanitizeStr((s || {}).changeType, 20),
    policyId: sanitizeStr((s || {}).policyId, 60),
    implementationLevel: Number((s || {}).implementationLevel),
    horizonDays: Number((s || {}).horizonDays),
  })) : [];
  res.json(gov.compareScenarios(sanitizeGovContext(body.context), specs));
});

app.post("/api/gov/copilot", async (req, res) => {
  const body = req.body || {};
  const question = sanitizeStr(body.question, 500);
  if (!question) return res.status(400).json({ error: "question is required" });
  const langLabel = GOV_LANG_LABEL[String(body.lang || "en").toLowerCase()] || "English";

  let pkg;
  try {
    pkg = gov.buildGovernmentPackage(sanitizeGovContext(body.context));
  } catch (err) {
    console.error("[gov] copilot context error:", err);
    return res.status(500).json({ error: "Could not build government context" });
  }

  /* Deterministic grounded fallback — used when AI is off or fails. */
  const respondFallback = () =>
    res.json({ ...gov.copilotFallback(question, pkg), lang: langLabel });

  if (!ai.isConfigured()) return respondFallback();

  /* Compact, faithful context extract — the model may ONLY use this. */
  const ctx = pkg.context;
  const compact = {
    context: {
      company: ctx.company, product: ctx.product,
      origin: ctx.originName, target: ctx.targetName, industry: ctx.industryName,
    },
    dashboard: pkg.dashboard.totals,
    readiness: { score: pkg.dashboard.readiness.score, status: pkg.dashboard.readiness.status },
    verdict: { state: pkg.dashboard.verdict.state, reasons: (pkg.dashboard.verdict.reasons || []).map((r) => r.label) },
    policies: pkg.policies.map((p) => ({
      code: p.code, title: p.title, authority: p.authority, type: p.policyType,
      status: p.status, effectiveDate: p.effectiveDate, impact: p.overall,
      impactLevel: p.impactLevel, relevance: p.relevance,
      obligationsCount: p.obligationsCount,
      sourceVerified: !!(p.source && p.source.verified && p.source.url),
    })),
    topRisks: pkg.dashboard.topRisks.map((r) => ({ title: r.title, severity: r.severity, probability: r.probability, impact: r.impact, mitigation: r.mitigation })),
    stakeholderGroups: pkg.stakeholders.groups.slice(0, 6).map((g) => ({ group: g.group, maxImpact: g.maxImpact, level: g.impactLevel, concern: g.concerns[0] || "" })),
    outcomesShortTerm: pkg.outcomes.shortTerm.slice(0, 4).map((o) => ({ title: o.title, likelihood: o.probability, severity: o.severity })),
    industryTop: [...pkg.industryMatrix].sort((a, b) => b.burdenScore - a.burdenScore).slice(0, 5).map((m) => ({ industry: m.industryName, burden: m.burdenScore, level: m.riskLevel })),
    actionPlan: {
      totalCostUSD: pkg.actionPlan.totalCost, totalDays: pkg.actionPlan.timeline.totalDays,
      actions: pkg.actionPlan.actions.length,
      criticalPath: (pkg.actionPlan.timeline.criticalPath || []).slice(0, 5).map((c) => c.title),
    },
    workloadAssumptions: pkg.actionPlan.assumptions,
    consultations: pkg.consultations.records.map((c) => ({ title: c.title, status: c.status, window: c.window, authority: c.authority })),
    sourceIntegrity: pkg.dashboard.sourceIntegrity,
    disclaimers: pkg.meta.disclaimers,
  };

  try {
    const answer = await ai.complete({
      messages: [
        {
          role: "system",
          content:
            `You are ReguLens Government Copilot, an executive policy-intelligence assistant for ${ctx.targetName}.\n` +
            `Answer STRICTLY from the JSON dataset below — it is derived from ReguLens's verified policy database and deterministic engines.\n` +
            `RULES:\n` +
            `- NEVER invent laws, authorities, URLs, statistics or dates not present in the dataset.\n` +
            `- Modelled estimates (costs, days, probabilities, scores) must be presented as MODELLED ESTIMATES, never as facts.\n` +
            `- Cite instruments with their [CODE] when you use them.\n` +
            `- If the dataset does not contain the answer, say so plainly and suggest what to check next.\n` +
            `- Be concise, executive-grade, structured with short bullets where helpful.\n` +
            `- WRITE THE ENTIRE ANSWER IN ${langLabel}.\n\nDATASET:\n` +
            JSON.stringify(compact),
        },
        { role: "user", content: question },
      ],
      endpoint: "/api/gov/copilot",
    });
    /* Citations = any known policy codes the answer references. */
    const citations = pkg.policies
      .filter((p) => p.code && answer.includes(p.code))
      .map((p) => ({ code: p.code, title: p.title }));
    res.json({ answer: String(answer).trim(), citations, mode: "ai", grounded: true, lang: langLabel });
  } catch (err) {
    console.error("[gov] copilot AI failure, using deterministic fallback:", err.message);
    respondFallback();
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    try { res.end(); } catch {}
    return;
  }
  const p = toPublicError(err, req);
  res.status(p.status).json({ error: p.message, code: p.code, ref: p.ref });
});

/* ───────── report generation (AI executive summary + launch recommendation) ───────── */
app.post("/api/report", async (req, res) => {
  if (!ai.isConfigured()) {
    return res.status(503).json({ error: "AI is not configured. Set GROQ_API_KEY in .env" });
  }

  const { analysis, lang } = req.body || {};
  if (!analysis || !analysis.company || !analysis.product) {
    return res.status(400).json({ error: "analysis data is required" });
  }

  const stats = analysis.stats || { total: 0, critical: 0, important: 0, standard: 0, completed: 0, inProgress: 0, pending: 0, nA: 0 };
  const gapStats = analysis.gapStats || { open: 0, closed: 0, inProgress: 0 };
  const regs = Array.isArray(analysis.regulations) ? analysis.regulations : [];

  const langLabel = { en: "English", es: "Spanish", fr: "French", hi: "Hindi" }[lang] || "English";

  const summaryPrompt = `You are a regulatory compliance analyst writing an executive summary for a market readiness report.

Write in ${langLabel}. Be professional, concise, and data-driven.

Company: ${analysis.company}
Product: ${analysis.product}
Origin: ${analysis.origin}
Target Market: ${analysis.target}
Industry: ${analysis.industry}
Readiness Score: ${analysis.readiness || 0}%
Risk Level: ${analysis.riskLevel || "Unknown"}
Total Requirements: ${stats.total}
Critical: ${stats.critical} | Important: ${stats.important} | Standard: ${stats.standard}
Pending: ${stats.pending} | In Progress: ${stats.inProgress} | Completed: ${stats.completed}
Open Gaps: ${gapStats.open}
Estimated Cost: €${analysis.estimatedCost || 0}
Estimated Timeline: ${analysis.estimatedDays || 0} days
Regulations Identified: ${regs.length}

Write a 2-3 paragraph executive summary covering:
1. Overall compliance posture and readiness level
2. Key risks and critical gaps that must be addressed
3. Recommended path to market readiness

Return ONLY the plain text summary. No markdown, no headers, no JSON.`;

  const recommendationPrompt = `You are a market entry advisor writing a launch recommendation.

Write in ${langLabel}. Be decisive and actionable.

Company: ${analysis.company}
Product: ${analysis.product}
Target Market: ${analysis.target}
Readiness Score: ${analysis.readiness || 0}%
Risk Level: ${analysis.riskLevel || "Unknown"}
Pending Requirements: ${stats.pending}
Open Gaps: ${gapStats.open}
Estimated Cost: €${analysis.estimatedCost || 0}
Estimated Timeline: ${analysis.estimatedDays || 0} days

Based on this data, provide a clear launch recommendation:
- If readiness >= 80: Recommend proceeding with launch, note minor items to monitor
- If readiness >= 50: Recommend conditional launch with specific prerequisites
- If readiness < 50: Recommend delaying launch until critical requirements are met

Return a JSON object with this exact structure (no markdown fencing):
{
  "recommendation": "Proceed|Conditional|Delay",
  "verdict": "One sentence verdict",
  "prerequisites": ["list of must-complete items before launch"],
  "timeline": "Expected timeline to full readiness"
}`;

  try {
    const [summaryText, recText] = await Promise.all([
      ai.complete({
        messages: [
          { role: "system", content: "You are a professional regulatory analyst. Write clearly and concisely. Return only the requested content." },
          { role: "user", content: summaryPrompt },
        ],
        endpoint: "/api/report",
      }),
      ai.complete({
        messages: [
          { role: "system", content: "You are a market entry advisor. Return ONLY valid JSON. No markdown, no explanation." },
          { role: "user", content: recommendationPrompt },
        ],
        endpoint: "/api/report",
      }),
    ]);

    let recommendation;
    try {
      recommendation = extractJSON(recText);
    } catch {
      const r = analysis.readiness || 0;
      recommendation = {
        recommendation: r >= 80 ? "Proceed" : r >= 50 ? "Conditional" : "Delay",
        verdict: summaryText.slice(0, 200),
        prerequisites: [],
        timeline: (analysis.estimatedDays || 0) + " days",
      };
    }

    res.json({
      executiveSummary: summaryText.trim(),
      recommendation,
    });
  } catch (err) {
    res.status(502).json({ error: "Report generation failed" });
  }
});

if (process.env.NETLIFY || process.env.VERCEL) {
  /* Running as a serverless Function (Netlify or Vercel) — the platform
     invokes the wrapped `app` instead of a long-lived server. */
} else {
  app.listen(PORT, () => {
    const status = ai.isConfigured() ? "AI connected" : "AI NOT configured (.env)";
    console.log(`Synora server on http://localhost:${PORT} — ${status}`);
  });
}

export default app;
