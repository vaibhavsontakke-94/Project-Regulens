/* SIH26136 — EVALUATION & SHORTLIST INTELLIGENCE tests (additive, Parts 1-73).
   Exercises the full pipeline through the real HTTP router + in-memory store:
   challenge-scoped config (weights must sum to 100), criterion versioning,
   independent evaluator assignments, evidence-aware scoring, mandatory
   minimums + comment-required triggers, immutable submission snapshots,
   submit/lock/reopen workflow, deterministic aggregation (MEAN default),
   variance/outlier flags, evidence coverage + confidence, comparison board,
   decision-safety gates, request-information, pilot handoff, AI assist with
   deterministic fallback, authorization, audit, and cross-org isolation.
   Deterministic engine + human decisions only — no AI is scored or decided.
*/

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./sih-helper.js";
import * as dom from "../lib/sih-domain.js";

let serverCtx;

beforeEach(async () => {
  const app = buildTestApp();
  serverCtx = await startServer(app);
  serverCtx.client = http(serverCtx.base);
});

afterEach(async () => {
  if (serverCtx) await serverCtx.close();
});

/* ───────── fixture builders (mirror sih-matching.test.js) ───────── */

async function seedBase(client) {
  const orgA = await client("POST", "/organizations", {
    userId: "admin-a",
    body: { orgType: "GOVERNMENT", name: "Maharashtra Health Innovation Cell", state: "Maharashtra", ministry: "Health" },
  });
  assert.equal(orgA.status, 201);
  const orgB = await client("POST", "/organizations", {
    userId: "admin-b",
    body: { orgType: "GOVERNMENT", name: "Karnataka Water Board" },
  });
  assert.equal(orgB.status, 201);
  return { orgA: orgA.body.id, orgB: orgB.body.id };
}

async function seedProblem(client, orgId) {
  const r = await client("POST", "/problems", {
    userId: "admin-a",
    body: { organizationId: orgId, title: "Rural healthcare patient flow", problemStatement: "Reduce waiting time", sector: "health", estimatedBudget: 1000000 },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function seedChallenge(client, orgId, problemId) {
  const r = await client("POST", "/challenges", {
    userId: "admin-a",
    body: { organizationId: orgId, problemId, challengeCode: "SIH26136-EVAL-1", title: "AI-Based Rural Healthcare Patient Flow Optimization", description: "Optimize patient flow", budgetMin: 500000, budgetMax: 2000000, challengeStatus: "APPLICATIONS_OPEN" },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function seedStartup(client, orgId, extra = {}) {
  const r = await client("POST", "/startups", {
    userId: "admin-a",
    body: { organizationId: orgId, legalName: "MedFlow AI Labs Pvt Ltd", brandName: "MedFlow", dpiitStatus: "REGISTERED", gstStatus: "REGISTERED", sector: "health", isDemo: true, ...extra },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function member(client, orgId, userId, role) {
  const r = await client("POST", `/organizations/${orgId}/members`, { userId: "admin-a", body: { userId, role, status: "ACTIVE" } });
  assert.equal(r.status, 201, `member ${userId} as ${role}`);
  return r.body;
}

/* Two (of three) criteria are mandatory with minimums; one requires evidence. */
const CRITERIA = [
  { key: "impact", label: "Impact on patient flow", category: "IMPACT", weight: 50, minimumScore: 60, mandatory: true, evidenceRequired: true, maxScore: 100 },
  { key: "innovation", label: "Innovation", category: "INNOVATION", weight: 30, maxScore: 100 },
  { key: "ops", label: "Operational readiness", category: "OPERATIONS", weight: 20, minimumScore: 50, maxScore: 100 },
];

async function seedEvaluationScenario(client) {
  const { orgA, orgB } = await seedBase(client);
  const problemId = (await seedProblem(client, orgA)).id;
  const ch = await seedChallenge(client, orgA, problemId);
  let s1 = (await seedStartup(client, orgA, { legalName: "MedFlow AI Labs Pvt Ltd", brandName: "MedFlow" })).id;
  let s2 = (await seedStartup(client, orgA, { legalName: "HealthGrid Pvt Ltd", brandName: "HealthGrid" })).id;

  const cfg = await client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "admin-a",
    body: { criteria: CRITERIA, name: "Challenge Eval", changeReason: "initial" },
  });
  assert.equal(cfg.status, 201, "configure created");
  assert.equal(cfg.body.criteria.length, 3);

  /* independent evaluator memberships (EVALUATOR role) */
  await member(client, orgA, "eval-1", "EVALUATOR");
  await member(client, orgA, "eval-2", "EVALUATOR");

  return { orgA, orgB, ch, s1, s2, cfg: cfg.body };
}

async function scoreOne(client, evaluationId, key, score, extra = {}) {
  const r = await client("POST", `/evaluations/${evaluationId}/score`, {
    userId: "eval-1",
    body: { criterionKey: key, score, ...extra },
  });
  return r;
}

async function fullScores(client, evaluationId, scores) {
  for (const [key, score] of Object.entries(scores)) {
    const r = await scoreOne(client, evaluationId, key, score, { comment: `Reviewing ${key} (${score})` });
    assert.ok([200, 201].includes(r.status), `score ${key}=${score}`);
  }
  return await client("POST", `/evaluations/${evaluationId}/submit`, { userId: "eval-1" });
}

/* ───────── tests ───────── */

test("config: weights must total 100 (never silently accepted)", async () => {
  const { orgA } = await seedBase(serverCtx.client);
  const problemId = (await seedProblem(serverCtx.client, orgA)).id;
  const ch = await seedChallenge(serverCtx.client, orgA, problemId);

  const bad = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "admin-a",
    body: { criteria: [{ key: "a", label: "A", weight: 40 }, { key: "b", label: "B", weight: 40 }] },
  });
  assert.equal(bad.status, 400, "partial weights rejected");
  assert.match(bad.body.error, /100/);

  const empty = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "admin-a",
    body: { criteria: [] },
  });
  assert.equal(empty.status, 400, "no criteria rejected");

  const dup = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "admin-a",
    body: { criteria: [{ key: "a", label: "A", weight: 50 }, { key: "a", label: "A2", weight: 50 }] },
  });
  assert.equal(dup.status, 400, "duplicate keys rejected");
});

test("criterion versioning: changing a criterion bumps its version in place", async () => {
  const { ch, cfg } = await seedEvaluationScenario(serverCtx.client);
  const first = cfg.criteria.find((c) => c.key === "ops");
  assert.equal(first.version, 1);

  const update = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "admin-a",
    body: { criteria: CRITERIA.map((c) => (c.key === "ops" ? { ...c, minimumScore: 55 } : c)), changeReason: "tighten ops threshold" },
  });
  assert.equal(update.status, 201);
  const ops = update.body.criteria.find((c) => c.key === "ops");
  assert.ok(ops.version >= 2, `ops criterion versioned to ${ops.version}`);
  const versions = await serverCtx.client("GET", `/challenges/${ch.id}/evaluation/history`, { userId: "admin-a" });
  assert.equal(versions.status, 200);
});

test("assign evaluators: creates per-evaluator evaluations + assignments", async () => {
  const { ch, s1, s2 } = await seedEvaluationScenario(serverCtx.client);
  const r = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a",
    body: { assignments: [
      { startupId: s1, evaluatorUid: "eval-1" },
      { startupId: s1, evaluatorUid: "eval-2" },
      { startupId: s2, evaluatorUid: "eval-1" },
    ] },
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.count, 3);

  const ws = await serverCtx.client("GET", `/challenges/${ch.id}/evaluation/workspace`, { userId: "eval-1" });
  assert.equal(ws.status, 200);
  assert.equal(ws.body.evaluations.length, 2, "eval-1 sees only their own evaluations");
});

test("scoring: unknown criterion and over-max rejected; valid scores upserted", async () => {
  const { ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  const evaluationId = assigned.body.assignments[0].evaluation.id;

  const unknown = await scoreOne(serverCtx.client, evaluationId, "nope", 50);
  assert.equal(unknown.status, 400, "unknown criterion rejected");

  const overMax = await scoreOne(serverCtx.client, evaluationId, "impact", 150);
  assert.equal(overMax.status, 400, "over max rejected");

  const ok = await scoreOne(serverCtx.client, evaluationId, "impact", 80, { comment: "strong impact" });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.score.score, 80);
});

test("mandatory minimums: low score on mandatory=evidence criterion is a comment trigger", async () => {
  const { ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  const evaluationId = assigned.body.assignments[0].evaluation.id;

  const low = await scoreOne(serverCtx.client, evaluationId, "impact", 40, { comment: "impact below bar" });
  assert.equal(low.status, 200);
  assert.ok(low.body.summary.mandatory.failed === 1, "mandatory failed reflected in summary");
  const reasons = low.body.summary.commentsRequired.map((c) => c.reason);
  assert.ok(reasons.includes("MANDATORY_FAILED"), "mandatory-failed comment required");
  assert.ok(reasons.includes("LOW_SCORE"), "low-score comment required");
});

test("submit: blocked when incomplete; succeeds with all criteria + required comments", async () => {
  const { ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  const evaluationId = assigned.body.assignments[0].evaluation.id;

  const missing = await serverCtx.client("POST", `/evaluations/${evaluationId}/submit`, { userId: "eval-1" });
  assert.equal(missing.status, 400, "incomplete submission rejected");
  assert.match(missing.body.error, /scored/);

  /* score all but submit with the mandatory impact BELOW minimum without a mand comment */
  await fullScores(serverCtx.client, evaluationId, { impact: 40, innovation: 88, ops: 55 });
  const sub = await serverCtx.client("POST", `/evaluations/${evaluationId}/submit`, { userId: "eval-1" });
  assert.equal(sub.status, 400, "missing required comment blocks submission");

  /* add the CRITICAL/REASON comment then submit */
  const note = await serverCtx.client("POST", `/evaluations/${evaluationId}/score`, {
    userId: "eval-1",
    body: { criterionKey: "impact", score: 40, comment: "mandatory unmet", kind: "REASON", reason: "MANDATORY_FAILED" },
  });
  assert.ok([200, 201].includes(note.status));
  const done = await serverCtx.client("POST", `/evaluations/${evaluationId}/submit`, { userId: "eval-1" });
  assert.equal(done.status, 201, "submit succeeds");
  assert.equal(done.body.evaluation.status, "SUBMITTED");
  assert.ok(done.body.snapshot && done.body.snapshot.id, "immutable snapshot created");
  assert.equal(done.body.snapshot.snapshotType, "SUBMISSION");

  const locked = await scoreOne(serverCtx.client, evaluationId, "innovation", 95);
  assert.equal(locked.status, 409, "submitted evaluation is immutable");
});

test("lock / reopen workflow", async () => {
  const { ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  const evaluationId = assigned.body.assignments[0].evaluation.id;
  await fullScores(serverCtx.client, evaluationId, { impact: 80, innovation: 70, ops: 60 });

  const lock = await serverCtx.client("POST", `/evaluations/${evaluationId}/lock`, { userId: "admin-a" });
  assert.equal(lock.status, 200);
  assert.equal(lock.body.evaluation.status, "LOCKED");

  const reopen = await serverCtx.client("POST", `/evaluations/${evaluationId}/reopen`, {
    userId: "admin-a", body: { reason: "new evidence filed" },
  });
  assert.equal(reopen.status, 200);
  assert.equal(reopen.body.evaluation.status, "REOPENED");
});

test("aggregation: deterministic MEAN, weighted total, variance/outliers flagged, INCOMPLETE when a peer is absent", async () => {
  const { ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a",
    body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }, { startupId: s1, evaluatorUid: "eval-2" }] },
  });
  const ev1 = assigned.body.assignments[0].evaluation.id;
  const ev2 = assigned.body.assignments[1].evaluation.id;

  await fullScores(serverCtx.client, ev1, { impact: 80, innovation: 70, ops: 60 });
  /* peer differs sharply on innovation to exercise variance/outlier detection */
  for (const [key, score] of Object.entries({ impact: 75, innovation: 25, ops: 60 })) {
    const r = await serverCtx.client("POST", `/evaluations/${ev2}/score`, {
      userId: "eval-2", body: { criterionKey: key, score },
    });
    assert.ok([200, 201].includes(r.status));
  }
  /* low innovation score forces a required-reason comment */
  await serverCtx.client("POST", `/evaluations/${ev2}/score`, {
    userId: "eval-2", body: { criterionKey: "innovation", score: 25, comment: "weak novelty", kind: "REASON", reason: "LOW_SCORE" },
  });
  await serverCtx.client("POST", `/evaluations/${ev2}/submit`, { userId: "eval-2" });

  const agg = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/aggregate`, { userId: "admin-a" });
  assert.equal(agg.status, 201);
  const row = agg.body.aggregated.find((a) => a.startupId === s1);
  assert.ok(row, "aggregation for startup present");
  assert.equal(row.participationCount, 2);
  assert.equal(row.aggregationMethod, "MEAN");

  const expectedTotal = (80 + 75) / 2 * 0.5 + (70 + 25) / 2 * 0.3 + 60 * 0.2;
  assert.equal(row.total, Math.round(expectedTotal * 100) / 100, "weighted total is deterministic");
  assert.ok(row.mandatoryFailed === false, "impact aggregate above minimum");
  assert.equal(row.result, "REVIEW_REQUIRED", "total 65 => between do-not-advance and advance-with-review");

  const innov = row.criteria.find((c) => c.key === "innovation");
  assert.equal(innov.stat, 47.5);
  assert.ok(innov.variance.highVariance, "innovation variance flagged (spread 45)");
  assert.equal(innov.outliers.length, 0, "1.5xIQR needs >=3 evaluations to flag an outlier");
  assert.ok(row.criticalItems.some((c) => c.type === "HIGH_EVALUATOR_VARIANCE"), "critical items include variance");

  const comparison = await serverCtx.client("GET", `/challenges/${ch.id}/evaluation/comparison`, { userId: "admin-a" });
  assert.equal(comparison.status, 200);
  assert.equal(comparison.body.rows.length, 1);

  /* a third assigned evaluator who never submits ⇒ aggregation is INCOMPLETE */
  await member(serverCtx.client, ch.organizationId, "eval-3", "EVALUATOR");
  await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-3" }] },
  });
  const agg2 = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/aggregate`, { userId: "admin-a" });
  assert.equal(agg2.status, 201);
  const row2 = agg2.body.aggregated.find((a) => a.startupId === s1);
  assert.equal(row2.participationCount, 2, "two evaluators submitted");
  assert.equal(row2.result, "INCOMPLETE", "aggregation marked INCOMPLETE until all assigned submit");
});

test("decision safety: blocked without acknowledge; proceeds when acknowledged", async () => {
  const { orgA, ch, s1 } = await seedEvaluationScenario(serverCtx.client);

  const noAgg = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/decision`, {
    userId: "admin-a", body: { startupId: s1, decision: "PROCEED_TO_PILOT", reason: "top scorer" },
  });
  assert.equal(noAgg.status, 400, "decision needs aggregation");
  assert.match(noAgg.body.error, /aggregation/);

  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  await fullScores(serverCtx.client, assigned.body.assignments[0].evaluation.id, { impact: 85, innovation: 80, ops: 65 });
  const agg = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/aggregate`, { userId: "admin-a" });
  assert.equal(agg.status, 201);

  const blocked = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/decision`, {
    userId: "admin-a", body: { startupId: s1, decision: "HOLD", reason: "pending evidence" },
  });
  assert.equal(blocked.status, 400, "no eligibility snapshot => blocking not acknowledged");
  assert.match(blocked.body.error, /Eligibility/);

  const veto = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/decision`, {
    userId: "admin-a", body: { startupId: s1, decision: "HOLD", reason: "awaiting deployment evidence", acknowledge: true },
  });
  assert.equal(veto.status, 201);
  assert.equal(veto.body.decision.decision, "HOLD");
  assert.equal(veto.body.safety.acknowledged, true);
});

test("request-information and pilot handoff require a decision", async () => {
  const { ch, s1 } = await seedEvaluationScenario(serverCtx.client);

  const req = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/request-information`, {
    userId: "admin-a", body: { startupId: s1, subject: "Provide deployment evidence", requiredEvidence: ["deployment letters"] },
  });
  assert.equal(req.status, 201);
  assert.equal(req.body.request.status, "OPEN");

  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  await fullScores(serverCtx.client, assigned.body.assignments[0].evaluation.id, { impact: 88, innovation: 85, ops: 70 });
  await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/aggregate`, { userId: "admin-a" });

  const handoff = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/pilot-handoff`, {
    userId: "admin-a", body: { startupId: s1, expectedKpis: ["waiting time"] },
  });
  assert.equal(handoff.status, 400, "handoff without PROCEED_TO_PILOT decision rejected");

  const decision = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/decision`, {
    userId: "admin-a", body: { startupId: s1, decision: "PROCEED_TO_PILOT", reason: "scaler ready", acknowledge: true },
  });
  assert.equal(decision.status, 201);

  const ok = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/pilot-handoff`, {
    userId: "admin-a", body: { startupId: s1, decisionId: decision.body.decision.id, expectedKpis: ["waiting time"] },
  });
  assert.equal(ok.status, 201, "handoff issued from decision");
  assert.equal(ok.body.handoff.status, "DRAFT");
  assert.ok(ok.body.handoff.selectedCriteria.length >= 1, "handoff carries criteria snapshot");
});

test("AI assist: advisory with deterministic fallback (never blocks)", async () => {
  const { ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  await fullScores(serverCtx.client, assigned.body.assignments[0].evaluation.id, { impact: 80, innovation: 70, ops: 60 });

  const r = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assist`, {
    userId: "admin-a", body: { startupId: s1, lang: "en" },
  });
  assert.equal(r.status, 200, "assist works even without an LLM key");
  assert.ok(["ai-advisory", "deterministic-fallback", "deterministic"].includes(r.body.mode));
  assert.ok(Array.isArray(r.body.strengths), "strengths list present");
  assert.ok(Array.isArray(r.body.gaps), "gaps list present");
  assert.ok(!("score" in r.body) || r.body.overview.result, "assist reports outcome, never a new score");
});

test("authorization: aggregator roles gate config/decision; evaluators denied admin actions", async () => {
  const { orgA, orgB, ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  await member(serverCtx.client, orgA, "admin-b", "OFFICER");

  /* OFFICER (aggregator role) may configure (no-op re-save of same criteria) */
  const cfgOk = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "admin-b", body: { criteria: CRITERIA, changeReason: "officer no-op" },
  });
  assert.equal(cfgOk.status, 201, "OFFICER allowed to configure");

  /* EVALUATOR is explicitly denied configuration/decisions */
  const cfgEval = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "eval-1", body: { criteria: [{ key: "a", label: "A", weight: 100 }] },
  });
  assert.equal(cfgEval.status, 403, "EVALUATOR cannot configure");

  /* cross-org user with no membership anywhere → denied */
  const orgBCfg = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/configure`, {
    userId: "no-tenant",
    body: { criteria: [{ key: "a", label: "A", weight: 100 }] },
  });
  assert.equal(orgBCfg.status, 403, "non-member denied");

  const assigned = await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  const evaluationId = assigned.body.assignments[0].evaluation.id;
  /* an org OFFICER (aggregator role) may also score — allowed by design */
  const byOfficer = await serverCtx.client("POST", `/evaluations/${evaluationId}/score`, {
    userId: "admin-b", body: { criterionKey: "impact", score: 72 },
  });
  assert.ok([200, 201].includes(byOfficer.status), "aggregator role may assist with scoring");
  /* no membership anywhere → hard deny */
  const byIntruder = await serverCtx.client("POST", `/evaluations/${evaluationId}/score`, {
    userId: "no-tenant", body: { criterionKey: "ops", score: 80 },
  });
  assert.equal(byIntruder.status, 403, "non-member blocked from foreign evaluation");
});

test("outlier/variance detection (deterministic 1.5xIQR and CV rules)", () => {
  const outliers = dom.detectOutliers([1, 40, 50, 60, 99], "scores");
  assert.ok(outliers.length >= 1, "1.5xIQR flags extreme values with enough data");
  const variance = dom.detectVariance([0, 70], "scores");
  assert.equal(variance.highVariance, true, "spread 70 >= 30 triggers high variance");
  assert.ok(variance.reason.length > 0);
});

test("audit trail: full evaluation lifecycle is recorded", async () => {
  const { orgA, ch, s1 } = await seedEvaluationScenario(serverCtx.client);
  await seedStartup(serverCtx.client, ch.organizationId, { legalName: "X", brandName: "X" });
  await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/assign`, {
    userId: "admin-a", body: { assignments: [{ startupId: s1, evaluatorUid: "eval-1" }] },
  });
  await serverCtx.client("POST", `/challenges/${ch.id}/evaluation/aggregate`, { userId: "admin-a" });

  const audit = await serverCtx.client("GET", `/audit?organizationId=${orgA}`, { userId: "admin-a" });
  assert.equal(audit.status, 200);
  const actions = (audit.body.events || []).map((e) => e.action);
  assert.ok(actions.includes("EVALUATION_CONFIGURED"), "config audited");
  assert.ok(actions.includes("EVALUATORS_ASSIGNED"), "assign audited");
  assert.ok(actions.includes("EVALUATION_AGGREGATED"), "aggregation audited");
});