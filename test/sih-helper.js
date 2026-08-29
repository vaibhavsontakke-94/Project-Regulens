/* Test helper for the SIH26136 API layer.
   Boots an isolated Express app on an ephemeral port with:
     * an in-memory SIH store (no Supabase, no network)
     * a fake auth resolver keyed off the "x-user" header
     * the same AppError -> JSON error middleware used by server.js
   Then talks to it with Node's global fetch. */

import express from "express";
import { createSihRouter } from "../lib/sih-router.js";
import { createSihStore } from "../lib/sih-store.js";
import { toPublicError } from "../lib/errors.js";

export function buildTestApp({ resolveUser } = {}) {
  const store = createSihStore({ adapter: "memory" });
  const router = createSihRouter({
    resolveUser:
      resolveUser ||
      ((req) => {
        const id = req.headers["x-user"] || "";
        return id ? { id } : null;
      }),
    store,
  });
  const app = express();
  app.use(express.json());
  app.use("/api/sih", router);
  app.use((err, _req, res, _next) => {
    if (res.headersSent) {
      try {
        res.end();
      } catch {}
      return;
    }
    const p = toPublicError(err, { requestId: "" });
    res.status(p.status).json({ error: p.message, code: p.code });
  });
  return app;
}

export async function startServer(app) {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}/api/sih`;
  return { server, base, close: () => new Promise((r) => server.close(r)) };
}

/* HTTP helper: authKey is the x-user header value (acts as the Firebase uid). */
export function http(base) {
  return async function request(method, path, { userId, body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (userId) headers["x-user"] = userId;
    const res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { status: res.status, body: json };
  };
}
