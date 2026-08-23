import { AppError } from "./errors.js";
import { logError, logWarn, newRef } from "./log.js";

function base() {
  return process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
}

function apiKey() {
  return process.env.GROQ_API_KEY || "";
}

/* Fallback chain: primary model first, then known-good smaller model.
   Used only when the provider reports a specific model is unavailable
   (404 model_not_found). Never used for auth/rate-limit failures. */
function modelChain(messages) {
  const hasImage = (messages || []).some((m) => Array.isArray(m.content));
  if (hasImage) return [process.env.GROQ_MODEL_VISION || "meta-llama/llama-4-scout-17b-16e-instruct"];
  const primary = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const fallbacks = (process.env.GROQ_MODEL_FALLBACKS || "llama-3.1-8b-instant")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [primary, ...fallbacks.filter((m) => m !== primary)];
}

function chatModel(messages) {
  return modelChain(messages)[0];
}

export function isConfigured() {
  return !!apiKey();
}

export function model() {
  return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
}

export function configuredInfo() {
  return { configured: isConfigured(), model: model() };
}

const CATEGORIES = {
  ai: { code: "AI_UNAVAILABLE", message: "The AI is temporarily unavailable. Please try again." },
  translate: { code: "TRANSLATION_FAILED", message: "Couldn't complete the translation. Please try again." },
  voice: { code: "VOICE_UNAVAILABLE", message: "Voice service is temporarily unavailable." },
};

function providerFail(category, cause, endpoint, meta) {
  const m = meta || {};
  const appMeta = {
    status: m.status ?? 502,
    errorCode: m.errorCode || "PROVIDER_UNAVAILABLE",
    retryable: m.retryable !== false,
    safeMessage: m.safeMessage || "The AI is temporarily unavailable. Please try again.",
  };
  const ref = newRef();
  logError({
    ref,
    type: `AI_PROVIDER_${appMeta.errorCode}`,
    endpoint,
    cause: String(cause || "provider request failed"),
  });
  const err = new AppError(502, CATEGORIES[category]?.code || "AI_UNAVAILABLE", appMeta.safeMessage);
  err.meta = appMeta;
  return err;
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

/* ═════════════ structured provider failure classification ═════════════
   Maps an upstream HTTP failure to a safe, actionable error contract:
   { status, errorCode, retryable, safeMessage }. Never includes secrets. */
function classifyProviderFailure(status, body) {
  const text = String(body || "");
  let providerCode = "";
  let model = "";
  try {
    const j = JSON.parse(text);
    providerCode = j?.error?.code || "";
    model = j?.error?.message?.match(/`([^`]+)`/)?.[1] || "";
  } catch {}

  if (status === 401 || status === 403) {
    return {
      status,
      errorCode: "PROVIDER_AUTH_REJECTED",
      retryable: false,
      safeMessage: "The AI provider rejected the request (credentials or permissions).",
    };
  }
  if (status === 404 && (providerCode === "model_not_found" || /does not exist|do not have access/i.test(text))) {
    return {
      status,
      errorCode: "PROVIDER_MODEL_UNAVAILABLE",
      retryable: true,
      safeMessage: `The configured AI model${model ? ` (${model})` : ""} is not available on this account.`,
      failedModel: model,
    };
  }
  if (status === 404) {
    return { status, errorCode: "PROVIDER_NOT_FOUND", retryable: false, safeMessage: "The AI provider endpoint was not found." };
  }
  if (status === 429) {
    return { status, errorCode: "RATE_LIMITED", retryable: true, safeMessage: "The AI provider rate limit was reached." };
  }
  if (status >= 500) {
    return { status, errorCode: "PROVIDER_ERROR", retryable: true, safeMessage: "The AI provider had an internal error." };
  }
  return { status, errorCode: "PROVIDER_REQUEST_FAILED", retryable: false, safeMessage: "The AI provider rejected the request." };
}

function withTimeout(ms) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  return null;
}

async function completion({ messages, stream, signal, model }) {
  const res = await fetch(`${base()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({ model: model || chatModel(messages), messages, temperature: 0.7, stream }),
    signal: signal || withTimeout(stream ? 120000 : 60000),
  });
  return res;
}

export async function complete({ messages, signal, category = "ai", endpoint = "/api", _retries = 3 }) {
  const models = modelChain(messages);
  let lastNetworkErr = null;

  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    for (let attempt = 0; ; attempt++) {
      let res;
      try {
        res = await completion({ messages, stream: false, signal, model });
      } catch (err) {
        lastNetworkErr = err;
        const meta = { status: 0, errorCode: "PROVIDER_UNREACHABLE", retryable: true, safeMessage: "Could not reach the AI provider." };
        if (mi < models.length - 1) break; // try fallback model on network errors too
        throw providerFail(category, err.message, endpoint, meta);
      }
      if (res.status === 429 && attempt < _retries) {
        const body = await safeText(res);
        const match = body.match(/Please try again in ([\d.]+)s/);
        const wait = match ? Number(match[1]) + 1 : 5;
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) {
        const cls = classifyProviderFailure(res.status, await safeText(res));
        /* Model unavailable → transparently fall back to the next model in the chain.
           Auth rejections are NEVER retried blindly. */
        if (cls.errorCode === "PROVIDER_MODEL_UNAVAILABLE" && mi < models.length - 1) {
          logWarn({ ref: newRef(), type: "AI_MODEL_FALLBACK", endpoint, cause: `model=${cls.failedModel || model} → falling back` });
          break;
        }
        throw providerFail(category, `${res.status}: ${await safeText(res)}`, endpoint, cls);
      }
      let json;
      try {
        json = await res.json();
      } catch {
        throw providerFail(category, "invalid provider response", endpoint, {
          status: 502, errorCode: "MALFORMED_RESPONSE", retryable: true, safeMessage: "The AI provider returned an unreadable response.",
        });
      }
      return json.choices?.[0]?.message?.content ?? "";
    }
  }
  /* only reachable when a network error exhausted the chain */
  throw providerFail(category, lastNetworkErr?.message || "provider request failed", endpoint, {
    status: 0, errorCode: "PROVIDER_UNREACHABLE", retryable: true, safeMessage: "Could not reach the AI provider.",
  });
}

export async function streamChat({ messages, onDelta, signal }) {
  let res;
  try {
    res = await completion({ messages, stream: true, signal });
  } catch (err) {
    throw providerFail("ai", err.message, "/api/chats/:id/messages");
  }
  if (!res.ok) {
    throw providerFail("ai", `${res.status}: ${await safeText(res)}`, "/api/chats/:id/messages");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    let done = false;
    let chunk;
    try {
      ({ done, value: chunk } = await reader.read());
    } catch (err) {
      throw providerFail("ai", err.message, "/api/chats/:id/messages");
    }
    if (done) break;
    buffer += decoder.decode(chunk, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta || {};
        if (delta.content) onDelta?.(delta.content);
      } catch {
        /* ignore partial payloads */
      }
    }
  }
}

export async function synthesizeSpeech({ text, voice, lang, signal }) {
  const isArabic = (lang || "en").toLowerCase().startsWith("ar");
  const model = isArabic
    ? process.env.GROQ_MODEL_TTS_AR || "canopylabs/orpheus-arabic-saudi"
    : process.env.GROQ_MODEL_TTS || "canopylabs/orpheus-v1-english";
  const defaultVoice = isArabic ? "noura" : "hannah";
  let res;
  try {
    res = await fetch(`${base()}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        model,
        voice: voice || defaultVoice,
        input: String(text || "").slice(0, 200),
        response_format: "wav",
      }),
      signal: signal || withTimeout(30000),
    });
  } catch (err) {
    throw providerFail("voice", err.message, "/api/speech");
  }
  if (!res.ok) {
    throw providerFail("voice", `${res.status}: ${await safeText(res)}`, "/api/speech");
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function transcribeAudio(bodyBuffer, mime, signal) {
  const form = new FormData();
  form.append("model", process.env.GROQ_MODEL_WHISPER || "whisper-large-v3-turbo");
  form.append(
    "file",
    new Blob([bodyBuffer], { type: mime || "audio/webm" }),
    "recording.webm"
  );

  let res;
  try {
    res = await fetch(`${base()}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}` },
      body: form,
      signal: signal || withTimeout(60000),
    });
  } catch (err) {
    throw providerFail("voice", err.message, "/api/transcribe");
  }
  if (!res.ok) {
    throw providerFail("voice", `${res.status}: ${await safeText(res)}`, "/api/transcribe");
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw providerFail("voice", "invalid provider response", "/api/transcribe");
  }
  return json.text ?? "";
}

export async function probe() {
  if (!isConfigured()) {
    return { configured: false, reachable: false, model: model() };
  }
  try {
    const out = await complete({
      messages: [{ role: "user", content: "Reply with exactly: ok" }],
      endpoint: "/api/health",
    });
    return {
      configured: true,
      reachable: true,
      model: model(),
      sample: String(out).slice(0, 40),
    };
  } catch (err) {
    logError({ ref: newRef(), type: "AI_PROBE_FAILED", endpoint: "/api/health", cause: err.message });
    return { configured: true, reachable: false, model: model() };
  }
}
