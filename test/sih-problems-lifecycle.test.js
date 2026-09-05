/* SIH26136 — GOVERNMENT PROBLEM lifecycle tests (additive).
   Covers the problem state machine end-to-end over the real HTTP router:
   create → edit (status preserved) → submit-review → approve → publish →
   unpublish → archive, transition enforcement on PATCH, safe draft-only
   deletion (blocked when a challenge references the problem or when the
   problem has left DRAFT), RBAC gating for PROBLEM_DELETE, orphaned reads
   returning 404 after delete, and the full audit trail.

   Run with:  node --test test/
*/

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./sih-helper.js";

let serverCtx;

beforeEach(async () => {
  const app = buildTestApp();
  serverCtx = await startServer(app);
  serverCtx.client = http(serverCtx.base);
});

afterEach(async () => {
  if (serverCtx) await serverCtx.close();
});

/* ───────── fixtures ───────── */

async function seedGov(client, userId = "admin-a") {
  const r = await client("POST", "/organizations", {
    userId,
    body: { orgType: "GOVERNMENT", name: "Maharashtra Health Innovation Cell", state: "Maharashtra", ministry: "Health" },
  });
  assert.equal(r.status, 201, "org created");
  return r.body;
}

async function seedProblem(client, orgId, title = "Reduce waiting time in rural clinics") {
  const r = await client("POST", "/problems", {
    userId: "admin-a",
    body: { organizationId: orgId, title, problemStatement: "Rural facilities have long queues and delays.", sector: "health", estimatedBudget: 1000000 },
  });
  assert.equal(r.status, 201, "problem created");
  return r.body;
}

async function seedChallenge(client, orgId, problemId) {
  const r = await client("POST", "/challenges", {
    userId: "admin-a",
    body: {
      organizationId: orgId,
      problemId,
      challengeCode: "SIH26136-LFC-001",
      title: "AI-assisted patient flow optimization",
      description: "Optimize patient flow in rural healthcare.",
      budgetMin: 500000,
      budgetMax: 2000000,
      challengeStatus: "APPLICATIONS_OPEN",
    },
  });
  assert.equal(r.status, 201, "challenge created");
  return r.body;
}

async function approveProblem(client, problem) {
  const s = await client("POST", `/problems/${problem.id}/submit-review`, { userId: "admin-a" });
  assert.equal(s.status, 200);
  const a = await client("POST", `/problems/${problem.id}/approve`, { userId: "admin-a" });
  assert.equal(a.status, 200);
  return a.body;
}

/* ───────── tests ───────── */

test("problems: PATCH preserves status unless explicitly changed", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);
  const problem = await seedProblem(client, org.id);

  const draftEdited = await client("PATCH", `/problems/${problem.id}`, {
    userId: "admin-a",
    body: { title: "Renamed draft problem" },
  });
  assert.equal(draftEdited.status, 200);
  assert.equal(draftEdited.body.title, "Renamed draft problem", "edit applied");
  assert.equal(draftEdited.body.status, "DRAFT", "status preserved for drafts");

  const approved = await approveProblem(client, problem);
  const published = await client("PATCH", `/problems/${approved.id}`, {
    userId: "admin-a",
    body: { status: "PUBLISHED" },
  });
  assert.equal(published.status, 200);

  const publishedEdited = await client("PATCH", `/problems/${approved.id}`, {
    userId: "admin-a",
    body: { title: "Renamed after publish" },
  });
  assert.equal(publishedEdited.status, 200);
  assert.equal(publishedEdited.body.status, "PUBLISHED", "editing a live problem does not reset it to DRAFT");
});

test("problems: PATCH enforces the transition map (DRAFT -> PUBLISHED rejected)", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);
  const problem = await seedProblem(client, org.id);

  const jump = await client("PATCH", `/problems/${problem.id}`, {
    userId: "admin-a",
    body: { status: "PUBLISHED" },
  });
  assert.equal(jump.status, 409);
  assert.equal(jump.body.code, "INVALID_TRANSITION");

  const archived = await client("PATCH", `/problems/${problem.id}`, {
    userId: "admin-a",
    body: { status: "ARCHIVED" },
  });
  assert.equal(archived.status, 200, "DRAFT -> ARCHIVED is a legal transition");
});

test("problems: publish / unpublish / archive lifecycle over dedicated endpoints", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);
  const problem = await seedProblem(client, org.id);
  const approved = await approveProblem(client, problem);
  assert.equal(approved.status, "APPROVED");

  const published = await client("PATCH", `/problems/${approved.id}`, {
    userId: "admin-a",
    body: { status: "PUBLISHED" },
  });
  assert.equal(published.status, 200);
  assert.equal(published.body.status, "PUBLISHED");

  const unpublish = await client("POST", `/problems/${approved.id}/unpublish`, { userId: "admin-a" });
  assert.equal(unpublish.status, 200);
  assert.equal(unpublish.body.status, "APPROVED", "unpublish returns the problem to APPROVED");

  const archive = await client("POST", `/problems/${approved.id}/archive`, { userId: "admin-a" });
  assert.equal(archive.status, 200);
  assert.equal(archive.body.status, "ARCHIVED");

  const archiveAgain = await client("POST", `/problems/${approved.id}/archive`, { userId: "admin-a" });
  assert.equal(archiveAgain.status, 200, "re-archiving an archived problem is idempotent");
});

test("problems: unpublishing a DRAFT is rejected (transition map)", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);
  const problem = await seedProblem(client, org.id);

  const unpublish = await client("POST", `/problems/${problem.id}/unpublish`, { userId: "admin-a" });
  assert.equal(unpublish.status, 409);
  assert.equal(unpublish.body.code, "PROBLEM_NOT_PUBLISHED");
});

test("problems: draft-only deletion with in-use guard", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);

  const draft = await seedProblem(client, org.id, "Draft to delete");
  const del = await client("DELETE", `/problems/${draft.id}`, { userId: "admin-a" });
  assert.equal(del.status, 200, "draft deleted");
  assert.equal(del.body.ok, true);

  const gone = await client("GET", `/problems/${draft.id}`, { userId: "admin-a" });
  assert.equal(gone.status, 404, "deleted problem no longer readable");

  const inUse = await seedProblem(client, org.id, "Draft referenced by a challenge");
  await seedChallenge(client, org.id, inUse.id);
  const delInUse = await client("DELETE", `/problems/${inUse.id}`, { userId: "admin-a" });
  assert.equal(delInUse.status, 409);
  assert.equal(delInUse.body.code, "PROBLEM_IN_USE");
});

test("problems: non-draft problems cannot be deleted", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);
  const problem = await seedProblem(client, org.id);
  await client("POST", `/problems/${problem.id}/submit-review`, { userId: "admin-a" });

  const del = await client("DELETE", `/problems/${problem.id}`, { userId: "admin-a" });
  assert.equal(del.status, 409);
  assert.equal(del.body.code, "PROBLEM_DELETE_FORBIDDEN");
});

test("problems: deletion is RBAC-gated (VIEWER is denied)", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);
  const problem = await seedProblem(client, org.id);

  await client("POST", `/organizations/${org.id}/members`, {
    userId: "admin-a",
    body: { userId: "viewer-x", role: "VIEWER" },
  });
  const del = await client("DELETE", `/problems/${problem.id}`, { userId: "viewer-x" });
  assert.equal(del.status, 403);
});

test("problems: full lifecycle writes the audit trail", async () => {
  const { client } = serverCtx;
  const org = await seedGov(client);
  const problem = await seedProblem(client, org.id);

  await approveProblem(client, problem);
  await client("PATCH", `/problems/${problem.id}`, { userId: "admin-a", body: { status: "PUBLISHED" } });
  await client("POST", `/problems/${problem.id}/unpublish`, { userId: "admin-a" });
  await client("POST", `/problems/${problem.id}/archive`, { userId: "admin-a" });
  const deleted = await seedProblem(client, org.id, "Audit draft");
  await client("DELETE", `/problems/${deleted.id}`, { userId: "admin-a" });

  const audit = await client("GET", `/audit?organizationId=${org.id}`, { userId: "admin-a" });
  assert.equal(audit.status, 200);
  const actions = (audit.body.events || []).map((e) => e.action);
  assert.ok(actions.includes("PROBLEM_CREATED"), "creation audited");
  assert.ok(actions.includes("PROBLEM_SUBMITTED_FOR_REVIEW"), "submit audited");
  assert.ok(actions.includes("PROBLEM_APPROVED"), "approve audited");
  assert.ok(actions.includes("PROBLEM_UNPUBLISHED"), "unpublish audited");
  assert.ok(actions.includes("PROBLEM_ARCHIVED"), "archive audited");
  assert.ok(actions.includes("PROBLEM_DELETED"), "delete audited");
});