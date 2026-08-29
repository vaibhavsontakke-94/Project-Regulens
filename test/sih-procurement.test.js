/* SIH26136 — Innovation Procurement workflow tests.
   Exercises the additive problem→challenge→approval→publish workflow
   through the real HTTP router + in-memory store (no Supabase, no AI).

   Run with:  node --test test/
*/

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./sih-helper.js";
import * as proc from "../lib/sih-procurement.js";
import { validateEvaluationWeights, parseStructureJson, qualityCheck } from "../lib/sih-procurement.js";

let serverCtx;

beforeEach(async () => {
  const app = buildTestApp();
  serverCtx = await startServer(app);
  serverCtx.client = http(serverCtx.base);
});

afterEach(async () => {
  if (serverCtx) await serverCtx.close();
});

async function seedOrg(client, name, userId = "admin-a") {
  const r = await client("POST", "/organizations", { userId, body: { orgType: "GOVERNMENT", name } });
  assert.equal(r.status, 201);
  return r.body.id;
}

async function seedProblem(client, orgId, extra = {}) {
  const r = await client("POST", "/problems", {
    userId: "admin-a",
    body: {
      organizationId: orgId,
      title: "Reduce patient waiting time in rural healthcare",
      problemStatement: "Rural facilities have long queues and delays.",
      currentState: "Manual queue management with ~45 min waiting.",
      desiredState: "Reduce waiting time and raise throughput.",
      affectedUsers: "Patients, healthcare workers",
      geography: "Rural Maharashtra",
      sector: "health",
      estimatedBudget: 1000000,
      ...extra,
    },
  });
  assert.equal(r.status, 201);
  return r.body;
}

/* ═════════ 1. Problem quality check ═════════ */
test("procurement: qualityCheck flags incomplete problems via HTTP + domain", async () => {
  const { client } = serverCtx;
  // domain-level check on an incomplete draft (no DB round trip needed)
  const incomplete = qualityCheck({ title: "", problemStatement: "" });
  assert.ok(incomplete.completeness >= 0 && incomplete.completeness <= 100);
  assert.ok(incomplete.blocking.some((b) => b.key === "title"), "missing title is a blocking issue");
  assert.equal(incomplete.canCreateChallenge, false);

  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  const r = await client("POST", `/problems/${p.id}/quality-check`, { userId: "admin-a" });
  assert.equal(r.status, 200);
  assert.ok(r.body.completeness >= 0 && r.body.completeness <= 100);
  assert.equal(r.body.canCreateChallenge, true);
});

test("procurement: complete problem yields canCreateChallenge true", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  const r = await client("POST", `/problems/${p.id}/quality-check`, { userId: "admin-a" });
  assert.equal(r.status, 200);
  assert.equal(r.body.canCreateChallenge, true);
});

/* ═════════ 2. AI structuring (deterministic via memory store) ═════════ */
test("procurement: ai-structure returns grounded structure + provenance", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA, {
    baselineMetrics: { metric: "Average Waiting Time", value: 45 },
    desiredOutcomes: { value: 15 },
    technologyPreferences: ["ai", "data-analytics"],
  });
  const r = await client("POST", `/problems/${p.id}/ai-structure`, { userId: "admin-a", body: { lang: "en" } });
  assert.equal(r.status, 201);
  assert.ok(r.body.structure.problem_summary, "summary populated");
  assert.ok(Array.isArray(r.body.structure.objectives));
  assert.ok(r.body.provenance, "provenance present");
  assert.equal(typeof r.body.provenance.problem_summary.provenance, "string");
  assert.ok(r.body.record.id, "structure record persisted");
  // record retrievable
  const list = await client("GET", `/problems/${p.id}/ai-structures`, { userId: "admin-a" });
  assert.equal(list.status, 200);
  assert.ok(list.body.structures.length >= 1);
});

test("procurement: ai-structure falls back gracefully when AI unavailable (manual flow continues)", async () => {
  // memory store + no GROQ key => ai.isConfigured() is false => deterministic
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  const r = await client("POST", `/problems/${p.id}/ai-structure`, { userId: "admin-a" });
  assert.equal(r.status, 201);
  assert.equal(r.body.record.mode, "DETERMINISTIC");
  assert.equal(r.body.structure.problem_summary, "Rural facilities have long queues and delays.");
});

/* ═════════ 3. AI output validation (parse) ═════════ */
test("procurement: parseStructureJson handles valid and wrapped JSON", () => {
  const good = parseStructureJson(JSON.stringify({ problem_summary: "x", objectives: ["a"], potential_kpis: [{ name: "k", baseline: "1" }] }));
  assert.equal(good.problem_summary, "x");
  assert.equal(good.objectives[0], "a");
  const wrapped = parseStructureJson('```json\n{"problem_summary":"y"}\n```');
  assert.equal(wrapped.problem_summary, "y");
});

test("procurement: parseStructureJson returns null for invalid JSON", () => {
  assert.equal(parseStructureJson("not json at all"), null);
  assert.equal(parseStructureJson(""), null);
});

/* ═════════ 4. Challenge generation ═════════ */
test("procurement: generate-challenge produces an outcome+criterion oriented preview", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  const r = await client("POST", `/problems/${p.id}/generate-challenge`, { userId: "admin-a" });
  assert.equal(r.status, 200);
  assert.ok(r.body.preview.title);
  assert.ok(Array.isArray(r.body.preview.technicalCapabilities));
  // technology-neutral: must be capabilities, not brand lock-in
  assert.ok(!/TensorFlow|Python|React|GPT/i.test(r.body.preview.technicalCapabilities.join(" ")));
  assert.ok(r.body.preview.needsConfirmation === false, "budget present so no confirmation needed");
});

test("procurement: generate-challenge persist creates a DRAFT challenge", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  const r = await client("POST", `/problems/${p.id}/generate-challenge`, {
    userId: "admin-a",
    body: { persist: true, challengeCode: "REG-IC-2026-TEST" },
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.draft.challengeStatus, "DRAFT");
  assert.equal(r.body.draft.challengeCode, "REG-IC-2026-TEST");
  assert.equal(r.body.draft.problemId, p.id);
  assert.ok(Array.isArray(r.body.draft.successMetrics));
});

/* ═════════ 5. Evaluation weight validation ═════════ */
test("procurement: evaluation weights must sum to 100", () => {
  const ok = [{ key: "a", weight: 50 }, { key: "b", weight: 50 }];
  assert.doesNotThrow(() => validateEvaluationWeights(ok));
  const bad = [{ key: "a", weight: 50 }, { key: "b", weight: 10 }];
  assert.throws(() => validateEvaluationWeights(bad));
});

/* ═════════ 6. Approval workflow (no AI auto-publish) ═════════ */
test("procurement: challenge cannot be published without approve; approval chain enforced", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  // create a challenge in DRAFT
  const chall = await client("POST", "/challenges", {
    userId: "admin-a",
    body: {
      organizationId: orgA,
      problemId: p.id,
      title: "AI patient flow",
      description: "Optimize patient flow.",
      objective: "Cut waiting time",
      successMetrics: [{ name: "Average Waiting Time", baseline: 45, target: 15 }],
      expectedOutcomes: ["Lower wait", "Higher throughput"],
      budgetMin: 500000,
      budgetMax: 1000000,
      challengeStatus: "DRAFT",
    },
  });
  assert.equal(chall.status, 201);
  const cid = chall.body.id;

  // Direct DRAFT -> PUBLISHED must be blocked
  const direct = await client("POST", `/challenges/${cid}/publish`, { userId: "admin-a" });
  assert.equal(direct.status, 409);
  assert.match(String(direct.body.error), /APPROVED/i);

  // submit for review
  const review = await client("POST", `/challenges/${cid}/submit-review`, { userId: "admin-a" });
  assert.equal(review.status, 200);
  assert.equal(review.body.challengeStatus, "REVIEW");

  // APPROVED
  const approved = await client("POST", `/challenges/${cid}/approve`, { userId: "admin-a" });
  assert.equal(approved.status, 200);
  assert.equal(approved.body.challengeStatus, "APPROVED");

  // now publish works
  const published = await client("POST", `/challenges/${cid}/publish`, { userId: "admin-a" });
  assert.equal(published.status, 200);
  assert.equal(published.body.challengeStatus, "PUBLISHED");
  assert.ok(published.body.publishedAt);
  assert.equal(published.body.validation.canPublish, true);
});

test("procurement: publish blocked when required fields missing", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  // a challenge that omits objective/expectedOutcomes => publish-time validation fails
  const chall = await client("POST", "/challenges", {
    userId: "admin-a",
    body: { organizationId: orgA, problemId: p.id, title: "T", description: "D", challengeStatus: "DRAFT" },
  });
  assert.equal(chall.status, 201);
  const cid = chall.body.id;
  // force through review + approve so only publish-time validation matters
  await client("POST", `/challenges/${cid}/submit-review`, { userId: "admin-a" });
  await client("POST", `/challenges/${cid}/approve`, { userId: "admin-a" });
  const r = await client("POST", `/challenges/${cid}/publish`, { userId: "admin-a" });
  assert.equal(r.status, 409);
  assert.equal(r.body.code, "PUBLISH_BLOCKED");
});

/* ═════════ 7. Problem status transitions ═════════ */
test("procurement: problem approve requires authorized role + valid transition", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const orgB = await seedOrg(client, "Other dept", "admin-b");
  const p = await seedProblem(client, orgA);

  // cross-department user cannot approve
  const denied = await client("POST", `/problems/${p.id}/approve`, { userId: "admin-b" });
  assert.equal(denied.status, 403);

  // own admin can approve
  const ok = await client("POST", `/problems/${p.id}/approve`, { userId: "admin-a" });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.status, "APPROVED");

  // approve again is a no-op / idempotent (already APPROVED)
  const again = await client("POST", `/problems/${p.id}/approve`, { userId: "admin-a" });
  assert.ok(again.status === 200 || again.status === 409, "approve is idempotent or blocked");
});

/* ═════════ 8. Authorization for challenge modifications ═════════ */
test("procurement: unauthorized user cannot modify or publish another dept's challenge", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  await seedOrg(client, "Water Board", "admin-b");
  const p = await seedProblem(client, orgA);
  const chall = await client("POST", "/challenges", {
    userId: "admin-a",
    body: { organizationId: orgA, problemId: p.id, title: "X", description: "D", challengeStatus: "DRAFT" },
  });
  const cid = chall.body.id;

  const edit = await client("PATCH", `/challenges/${cid}`, { userId: "admin-b", body: { title: "Hacked" } });
  assert.equal(edit.status, 403);

  const review = await client("POST", `/challenges/${cid}/submit-review`, { userId: "admin-b" });
  assert.equal(review.status, 403);
});

/* ═════════ 9. Audit events recorded ═════════ */
test("procurement: workflow actions create audit events", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  await client("POST", `/problems/${p.id}/ai-structure`, { userId: "admin-a" });
  // generate a complete draft challenge so publish passes
  const gen = await client("POST", `/problems/${p.id}/generate-challenge`, {
    userId: "admin-a",
    body: { persist: true, challengeCode: "REG-IC-2026-AUD" },
  });
  assert.equal(gen.status, 201);
  const cid = gen.body.draft.id;
  await client("POST", `/challenges/${cid}/submit-review`, { userId: "admin-a" });
  await client("POST", `/challenges/${cid}/approve`, { userId: "admin-a" });
  const pub = await client("POST", `/challenges/${cid}/publish`, { userId: "admin-a" });
  assert.equal(pub.status, 200, "publish should succeed for a complete generated challenge");

  const audit = await client("GET", `/audit?organizationId=${orgA}&entityType=INNOVATION_CHALLENGE&entityId=${cid}`, { userId: "admin-a" });
  assert.equal(audit.status, 200);
  const actions = audit.body.events.map((e) => e.action);
  assert.ok(actions.includes("CHALLENGE_GENERATED"));
  assert.ok(actions.includes("CHALLENGE_SUBMITTED_FOR_REVIEW"));
  assert.ok(actions.includes("CHALLENGE_APPROVED"));
  assert.ok(actions.includes("CHALLENGE_PUBLISHED"));
});

test("procurement: AI structuring writes a PROBLEM_AI_STRUCTURE audit event", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Health Cell");
  const p = await seedProblem(client, orgA);
  await client("POST", `/problems/${p.id}/ai-structure`, { userId: "admin-a" });
  const pAudit = await client("GET", `/audit?organizationId=${orgA}&entityType=PROBLEM_AI_STRUCTURE`, { userId: "admin-a" });
  assert.ok(pAudit.body.events.some((e) => e.action === "AI_STRUCTURING_COMPLETED"));
});

/* ═════════ 10. Publish validation (domain) ═════════ */
test("procurement: publishValidation blocks missing critical fields", () => {
  const v = proc.publishValidation({ title: "", description: "", objective: "", organizationId: "" }, { owner: "u" });
  assert.equal(v.canPublish, false);
  assert.ok(v.errors.length >= 3);
});

test("procurement: publishValidation passes for a complete challenge", () => {
  const c = {
    title: "T", description: "D", objective: "O",
    expectedOutcomes: ["o1"], successMetrics: [{ name: "k" }],
    organizationId: "org", budgetMin: 0, budgetMax: 100,
  };
  const v = proc.publishValidation(c, { owner: "u", evaluationFramework: [] });
  assert.equal(v.canPublish, true);
});

/* ═════════ 11. Multilingual AI prompt (structureProblem respects lang) ═════════ */
test("procurement: structureProblem builds a multilingual, grounded prompt", async () => {
  // capture the messages passed to ai.complete via a fake
  let captured = null;
  const fakeAi = {
    isConfigured: () => true,
    complete: async ({ messages }) => {
      captured = messages;
      return JSON.stringify({ problem_summary: "resumen", objectives: ["obj"], potential_kpis: [] });
    },
    model: () => "fake-model",
  };
  const p = seedProblemHttp().plain;
  const result = await proc.structureProblem({
    ai: fakeAi,
    problem: { problemStatement: "P" },
    lang: "es",
    endpoint: "/x",
  });
  assert.equal(result.mode, "ai");
  assert.equal(result.model, "fake-model");
  assert.ok(String(captured[0].content).includes("es"), "system prompt mentions language code es");
  assert.equal(result.structure.problem_summary, "resumen");
});

// minimal plain problem for direct service calls (not via HTTP)
function seedProblemHttp() {
  return {
    plain: {
      id: "p1",
      organizationId: "o1",
      title: "Test",
      problemStatement: "A problem",
      currentState: "state",
      desiredState: "desired",
      affectedUsers: "users",
      geography: "geo",
      sector: "health",
      estimatedBudget: 100,
      baselineMetrics: {},
      desiredOutcomes: {},
      technologyPreferences: [],
    },
  };
}

/* ═════════ 12. Technology lock-in avoidance ═════════ */
test("procurement: buildChallengeFromProblem prefers capabilities over brands", () => {
  const problem = {
    id: "p", organizationId: "o", title: "Smart water",
    problemStatement: "Noise", currentState: "s", desiredState: "d",
    sector: "water", estimatedBudget: 0,
    baselineMetrics: {}, desiredOutcomes: {}, technologyPreferences: [],
  };
  const structure = {
    problem_summary: "Reduce water loss",
    current_state: "Leaks", desired_state: "Low loss",
    affected_users: ["Residents"], objectives: ["Cut leaks"], outcomes: ["Low loss"],
    potential_kpis: [], constraints: ["No IoT yet"],
    required_capabilities: ["Real-time leak detection", "Multilingual alerting"],
    technology_categories: [], data_requirements: ["Flow meters"], pilot_considerations: [],
    missing_information: [], assumptions: [], confidence: 50, warnings: [],
  };
  const c = proc.buildChallengeFromProblem(problem, { structure });
  assert.ok(c.technicalCapabilities.includes("Real-time leak detection"));
  // budget is 0 => needs confirmation, no fabricated value
  assert.equal(c.needsConfirmation, true);
  assert.equal(c.budgetText, "To be determined");
});
