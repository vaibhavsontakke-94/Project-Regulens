import { AppError } from "./errors.js";

/* ───────── server-side Supabase REST client ─────────
   Used ONLY by the server (lib/store.js). The service-role key never
   leaves this process and is never exposed to the browser. Every query
   is filtered by the Firebase uid that the server derived from a
   verified ID token — the client never supplies user_id. */

function baseUrl() {
  return process.env.SUPABASE_URL || "";
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function isConfigured() {
  return !!(baseUrl() && serviceKey());
}

function assertConfigured() {
  if (!isConfigured()) {
    throw new AppError(
      503,
      "NOT_CONFIGURED",
      "Chat history is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
    );
  }
}

const TABLE = "chat_history";

function authHeaders() {
  return {
    apikey: serviceKey(),
    Authorization: `Bearer ${serviceKey()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function tableRest(table, method, params = {}, { body, prefer = "return=representation", errorMsg = "Chat history is temporarily unavailable." } = {}) {
  assertConfigured();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) query.append(key, value);
  const qs = query.toString();
  const url = `${baseUrl()}/rest/v1/${table}${qs ? `?${qs}` : ""}`;
  const headers = authHeaders();
  if (body) headers.Prefer = prefer;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new AppError(502, "SUPABASE_ERROR", errorMsg);
    err.detail = detail;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

async function rest(method, params = {}, opts = {}) {
  return tableRest(TABLE, method, params, opts);
}

function mapRow(row) {
  return {
    id: row.id,
    ownerId: row.user_id,
    title: row.title,
    messages: row.messages || [],
    documents: row.documents || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ephemeral: false,
  };
}

function summaryRow(row) {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listChats(uid) {
  if (!uid) return [];
  const rows = await rest("GET", {
    select: "id,title,created_at,updated_at",
    user_id: `eq.${uid}`,
    order: "updated_at.desc",
  });
  return (rows || []).map(summaryRow);
}

export async function getChat(uid, id) {
  if (!uid) return null;
  const rows = await rest("GET", {
    select: "*",
    id: `eq.${id}`,
    user_id: `eq.${uid}`,
  });
  return rows && rows[0] ? mapRow(rows[0]) : null;
}

export async function createChat({ uid, title, messages, documents }) {
  if (!uid) throw new Error("Cannot persist chat without an account");
  const rows = await rest(
    "POST",
    {},
    {
      body: {
        user_id: uid,
        title: title || "New conversation",
        messages: messages || [],
        documents: documents || [],
      },
    }
  );
  return mapRow(rows[0]);
}

export async function saveChat(uid, id, patch) {
  if (!uid) return null;
  const rows = await rest(
    "PATCH",
    { id: `eq.${id}`, user_id: `eq.${uid}` },
    { body: { ...patch, updated_at: new Date().toISOString() } }
  );
  return rows && rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteChat(uid, id) {
  if (!uid) return;
  await rest("DELETE", { id: `eq.${id}`, user_id: `eq.${uid}` });
}

export async function clearChats(uid) {
  if (!uid) return;
  await rest("DELETE", { user_id: `eq.${uid}` });
}

/* ───────── user profiles (used by lib/auth.js) ─────────
   Profiles mirror the old data/users.json store so accounts, names, and
   settings survive on serverless (Netlify), where the filesystem is
   read-only. id = the Firebase uid from a verified ID token. */

function mapProfile(row) {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    photoURL: row.photo_url || "",
    settings: row.settings || {},
    createdAt: row.created_at,
  };
}

export async function upsertProfile({ id, email, name, photoURL }) {
  const rows = await tableRest("profiles", "GET", { id: `eq.${id}`, select: "*" }, { errorMsg: "Account data is temporarily unavailable." });
  const existing = rows && rows[0];
  if (existing) {
    const patch = {};
    if (email && existing.email !== email) patch.email = email;
    if (name && existing.name !== name) patch.name = name;
    if (photoURL && existing.photo_url !== photoURL) patch.photo_url = photoURL;
    if (!Object.keys(patch).length) return mapProfile(existing);
    const updated = await tableRest("profiles", "PATCH", { id: `eq.${id}` }, { body: patch, errorMsg: "Account data is temporarily unavailable." });
    return updated && updated[0] ? mapProfile(updated[0]) : mapProfile(existing);
  }
  const created = await tableRest(
    "profiles",
    "POST",
    {},
    {
      body: { id, email: email || "", name: name || "", photo_url: photoURL || "" },
      errorMsg: "Account data is temporarily unavailable.",
    }
  );
  return created && created[0]
    ? mapProfile(created[0])
    : { id, email, name, photoURL, settings: {}, createdAt: new Date().toISOString() };
}

export async function updateProfileSettings(id, settings) {
  const rows = await tableRest("profiles", "PATCH", { id: `eq.${id}` }, { body: { settings: settings || {} }, errorMsg: "Account data is temporarily unavailable." });
  return rows && rows[0] ? rows[0].settings : null;
}
