import { AppError } from "./errors.js";

/* ───────── Vercel REST API client (server-side only) ─────────
   OAuth access tokens are obtained through the Vercel integration
   consent screen and are NEVER sent to the browser. Every Vercel
   API call the app makes goes through this module. */

const AUTH_URL = "https://vercel.com/oauth/authorize";
const TOKEN_URL = "https://api.vercel.com/v2/oauth/access_token";
const API = "https://api.vercel.com";

function clientId() {
  return process.env.VERCEL_CLIENT_ID || "";
}

function clientSecret() {
  return process.env.VERCEL_CLIENT_SECRET || "";
}

export function oauthConfigured() {
  return Boolean(clientId() && clientSecret());
}

export function authorizeUrl({ redirectUri, state }) {
  if (!oauthConfigured()) {
    throw new AppError(503, "VERCEL_NOT_CONFIGURED", "Vercel deployment is not configured on this server yet.");
  }
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode({ code, redirectUri }) {
  let res;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId(),
        client_secret: clientSecret(),
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
  } catch {
    throw new AppError(504, "VERCEL_NETWORK", "Could not reach Vercel to complete sign-in. Check your network and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new AppError(401, "VERCEL_AUTH_FAILED", "Vercel rejected the sign-in attempt. Please try connecting again.");
  }
  return { accessToken: data.access_token, teamId: data.team_id || null };
}

function withTeam(path, teamId) {
  if (!teamId) return path;
  return `${path}${path.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(teamId)}`;
}

async function request(token, path, { method = "GET", body, teamId, errorMsg } = {}) {
  let res;
  try {
    res = await fetch(`${API}${withTeam(path, teamId)}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AppError(504, "VERCEL_NETWORK", errorMsg || "Could not reach Vercel. Check your connection and try again.");
  }

  if (res.status === 204) return {};

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = data?.error?.code || "";
    if (res.status === 401) {
      throw new AppError(401, "VERCEL_AUTH_EXPIRED", "Your Vercel connection has expired. Please reconnect your account.");
    }
    if (res.status === 403) {
      throw new AppError(403, code === "rate_limited" ? "VERCEL_RATE_LIMITED" : "VERCEL_FORBIDDEN", code === "rate_limited" ? "Vercel rate limit reached. Wait a moment and try again." : "The connected Vercel account does not have permission for this action.");
    }
    if (code === "not_found" || res.status === 404) {
      throw new AppError(404, "VERCEL_NOT_FOUND", "That project could not be found in the connected Vercel account.");
    }
    throw new AppError(502, "VERCEL_API_ERROR", errorMsg || `A Vercel API request failed (${res.status}).`);
  }
  return data;
}

export async function getAccount(token) {
  const data = await request(token, "/v2/user", { errorMsg: "Could not load your Vercel account details." });
  const u = data.user || {};
  return { username: u.username || u.name || "", email: u.email || "" };
}

export async function listProjects(token, teamId) {
  const data = await request(token, "/v9/projects?limit=100", { teamId, errorMsg: "Could not load your Vercel projects." });
  return (data.projects || []).map((p) => ({ id: p.id, name: p.name }));
}

export async function createProject(token, name, teamId) {
  const data = await request(token, "/v10/projects", {
    method: "POST",
    body: { name },
    teamId,
    errorMsg: "Vercel rejected creating a new project.",
  });
  return { id: data.id, name: data.name };
}

export async function createDeployment(token, { projectId, target = "production", files, teamId }) {
  return request(token, "/v13/deployments?skipAutoDetectionConfirmation=1", {
    method: "POST",
    body: {
      name: projectId,
      target,
      files,
      projectSettings: { framework: null },
    },
    teamId,
    errorMsg: "Vercel rejected the deployment request.",
  });
}

export async function getDeployment(token, id, teamId) {
  return request(token, `/v13/deployments/${encodeURIComponent(id)}`, { teamId, errorMsg: "Could not fetch the deployment status from Vercel." });
}

/* QUEUED | INITIALIZING | BUILDING | READY | ERROR | CANCELED */
export function mapReadyState(readyState) {
  switch (readyState) {
    case "READY":
      return "ready";
    case "ERROR":
      return "error";
    case "CANCELED":
      return "canceled";
    case "BUILDING":
    case "INITIALIZING":
      return "building";
    default:
      return "queued";
  }
}
