import crypto from "node:crypto";
import express from "express";
import * as client from "./vercel-client.js";
import * as store from "./vercel-store.js";
import { collectProjectFiles } from "./vercel-files.js";
import { AppError } from "./errors.js";

/* ───────── /api/vercel routes ─────────
   The browser never sees Vercel credentials: it only talks to this
   router, which proxies every Vercel API call server-side using the
   encrypted access token stored for the signed-in Firebase user.
   OAuth state is HMAC-signed (VERCEL_TOKEN_SECRET) so the callback
   works across stateless Function instances in production. */

const STATE_TTL_MS = 15 * 60 * 1000;
const PROJECT_NAME = /^[a-z0-9][a-z0-9._-]{0,99}$/;

function sign(payload) {
  return crypto.createHmac("sha256", process.env.VERCEL_TOKEN_SECRET || "").update(payload).digest("base64url");
}

function createSignedState(uid) {
  const body = Buffer.from(JSON.stringify({ uid, ts: Date.now() }), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

function verifySignedState(state) {
  if (!process.env.VERCEL_TOKEN_SECRET) throw new AppError(503, "VERCEL_NOT_CONFIGURED", "Set VERCEL_TOKEN_SECRET on the server to enable Vercel connections.");
  const dot = String(state || "").indexOf(".");
  if (dot < 1) throw new AppError(400, "VERCEL_STATE_INVALID", "The Vercel connection attempt was invalid or has expired.");
  const body = state.slice(0, dot);
  const expected = sign(body);
  const given = state.slice(dot + 1);
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new AppError(400, "VERCEL_STATE_INVALID", "The Vercel connection attempt was invalid or has expired.");
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    throw new AppError(400, "VERCEL_STATE_INVALID", "The Vercel connection attempt was invalid or has expired.");
  }
  if (!payload.uid || Date.now() - Number(payload.ts) > STATE_TTL_MS) {
    throw new AppError(400, "VERCEL_STATE_INVALID", "The Vercel connection attempt expired. Please try again.");
  }
  return payload;
}

export function createVercelRouter({ tokenFrom, userFromIdToken }) {
  const router = express.Router();
  const usedStates = new Set();

  function wrap(handler) {
    return async (req, res) => {
      try {
        await handler(req, res);
      } catch (err) {
        if (res.headersSent) return;
        if (err instanceof AppError) {
          res.status(err.status).json({ error: err.publicMessage, code: err.code });
        } else {
          res.status(500).json({ error: "Unable to complete the Vercel request right now.", code: "REQUEST_FAILED" });
        }
      }
    };
  }

  async function requireUser(req) {
    let uid = null;
    try {
      const user = await userFromIdToken(tokenFrom(req));
      uid = user ? user.id : null;
    } catch {
      uid = null;
    }
    if (!uid) throw new AppError(401, "NOT_SIGNED_IN", "Sign in to your account before connecting Vercel.");
    return uid;
  }

  async function requireConnection(req) {
    const uid = await requireUser(req);
    const record = await store.getRecord(uid);
    if (!record?.tokens?.accessToken) {
      throw new AppError(400, "VERCEL_NOT_CONNECTED", "Connect your Vercel account first.");
    }
    return { uid, ...record };
  }

  /* Production-safe origin: honors proxy headers so callbacks never
     point at localhost when deployed. */
  function originOf(req) {
    const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
    const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    return `${proto}://${host}`;
  }

  function callbackUri(req) {
    return process.env.VERCEL_REDIRECT_URI || `${originOf(req)}/api/vercel/callback`;
  }

  router.get("/status", wrap(async (req, res) => {
    const configured = client.oauthConfigured() && Boolean(process.env.VERCEL_TOKEN_SECRET);
    const base = { configured, connected: false };
    let uid = null;
    try {
      uid = await requireUser(req);
    } catch {
      res.json({ ...base, signInRequired: true });
      return;
    }
    const record = await store.getRecord(uid).catch(() => null);
    if (!record?.tokens?.accessToken) {
      res.json(base);
      return;
    }
    try {
      const account = await client.getAccount(record.tokens.accessToken);
      res.json({
        ...base,
        connected: true,
        account,
        project: record.meta.projectId ? { id: record.meta.projectId, name: record.meta.projectName } : null,
        lastDeployment: record.meta.lastDeployment || null,
      });
    } catch (err) {
      if (err instanceof AppError && err.code === "VERCEL_AUTH_EXPIRED") {
        res.json({ ...base, expired: true });
        return;
      }
      throw err;
    }
  }));

  /* Returns the consent-screen URL; the browser navigates to it. */
  router.post("/start", wrap(async (req, res) => {
    const uid = await requireUser(req);
    const url = client.authorizeUrl({ redirectUri: callbackUri(req), state: createSignedState(uid) });
    res.json({ url });
  }));

  router.get("/callback", wrap(async (req, res) => {
    const origin = originOf(req);
    const back = (flag) => `${origin}/?vercel=${encodeURIComponent(flag)}`;
    const finish = (flag) => {
      if (!res.headersSent) res.redirect(302, back(flag));
    };
    try {
      const code = String(req.query.code || "");
      const state = String(req.query.state || "");
      if (!code || !state) return finish("auth_failed");
      const payload = verifySignedState(state);
      if (usedStates.has(state)) return finish("auth_failed");
      usedStates.add(state);
      if (usedStates.size > 500) usedStates.clear();

      const exchange = await client.exchangeCode({ code, redirectUri: callbackUri(req) });
      const account = await client.getAccount(exchange.accessToken).catch(() => ({ username: "", email: "" }));
      await store.saveTokens(payload.uid, {
        accessToken: exchange.accessToken,
        teamId: exchange.teamId || req.query.teamId || null,
        account,
        connectedAt: new Date().toISOString(),
      });
      return finish("connected");
    } catch (err) {
      const code = err instanceof AppError ? err.code : "REQUEST_FAILED";
      return finish(code === "VERCEL_STATE_INVALID" ? "invalid_state" : "auth_failed");
    }
  }));

  router.post("/disconnect", wrap(async (req, res) => {
    const uid = await requireUser(req);
    await store.clearRecord(uid);
    res.json({ ok: true });
  }));

  router.get("/projects", wrap(async (req, res) => {
    const conn = await requireConnection(req);
    const projects = await client.listProjects(conn.tokens.accessToken, conn.tokens.teamId || conn.meta.teamId || null);
    res.json({ projects });
  }));

  /* Select an existing project or create a new one. */
  router.post("/project", wrap(async (req, res) => {
    const conn = await requireConnection(req);
    const body = req.body || {};
    const teamId = conn.tokens.teamId || conn.meta.teamId || null;

    let project;
    if (body.action === "create") {
      const name = String(body.name || "").trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
      if (!PROJECT_NAME.test(name)) {
        throw new AppError(400, "INVALID_PROJECT_NAME", "Project names may only contain lowercase letters, numbers, dots, dashes and underscores.");
      }
      project = await client.createProject(conn.tokens.accessToken, name, teamId);
    } else {
      const id = String(body.id || "");
      const name = String(body.name || "");
      if (!id || !name) throw new AppError(400, "INVALID_PROJECT", "Choose a project before deploying.");
      project = { id, name };
    }

    const meta = await store.saveMeta(conn.uid, { projectId: project.id, projectName: project.name });
    res.json({ project: { id: meta.projectId, name: meta.projectName } });
  }));

  router.post("/deploy", wrap(async (req, res) => {
    const conn = await requireConnection(req);
    const projectId = conn.meta.projectId;
    if (!projectId) throw new AppError(400, "NO_PROJECT_SELECTED", "Choose a Vercel project before deploying.");

    const files = collectProjectFiles();
    const teamId = conn.tokens.teamId || conn.meta.teamId || null;
    const deployment = await client.createDeployment(conn.tokens.accessToken, { projectId, files, teamId });

    const info = {
      id: deployment.id,
      url: deployment.url ? `https://${deployment.url}` : "",
      state: client.mapReadyState(deployment.readyState),
      createdAt: new Date().toISOString(),
    };
    await store.saveMeta(conn.uid, { lastDeployment: info });
    res.json({ deployment: info, fileCount: files.length });
  }));

  router.get("/deploy/:id/status", wrap(async (req, res) => {
    const conn = await requireConnection(req);
    const teamId = conn.tokens.teamId || conn.meta.teamId || null;
    const d = await client.getDeployment(conn.tokens.accessToken, req.params.id, teamId);
    const info = {
      id: d.id,
      url: d.url ? `https://${d.url}` : "",
      alias: Array.isArray(d.alias) && d.alias.length ? `https://${String(d.alias[d.alias.length - 1]).replace(/^https?:\/\//, "")}` : "",
      state: client.mapReadyState(d.readyState),
      message: d.readyStateLabel || "",
    };
    if (conn.meta.lastDeployment?.id === d.id) {
      await store.saveMeta(conn.uid, { lastDeployment: info }).catch(() => {});
    }
    res.json({ deployment: info });
  }));

  return router;
}
