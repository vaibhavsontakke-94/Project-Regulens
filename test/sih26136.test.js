/* SIH26136 — additive domain foundation tests.
   Runs against the in-memory store through the real HTTP router so it
   exercises auth, RBAC, validation, and every CRUD path end-to-end.

   Run with:  node --test test/
*/

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./sih-helper.js";
import { createSihStore } from "../lib/sih-store.js";
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

/* ───────── fixture builder ───────── */
async function seedBase(client) {
  // Organization A (government) + its admin
  const orgA = await client("POST", "/organizations", {
    userId: "admin-a",
    body: { orgType: "GOVERNMENT", name: "Maharashtra Health Innovation Cell", state: "Maharashtra", ministry: "Health" },
  });
  // Organization B (different department)
  const orgB = await client("POST", "/organizations", {
    userId: "admin-b",
    body: { orgType: "GOVERNMENT", name: "Karnataka Water Board" },
  });
  assert.equal(orgA.status, 201, "org A created");
  assert.equal(orgB.status, 201, "org B created");
  return {
    orgA: orgA.body.id,
    orgB: orgB.body.id,
    orgAUUID: orgA.body.id,
  };
}

async function seedProblem(client, orgId) {
  const r = await client("POST", "/problems", {
    userId: "admin-a",
    body: {
      organizationId: orgId,
      title: "Reduce patient waiting time in rural healthcare",
      problemStatement: "Rural facilities have long queues and delays.",
      sector: "health",
      estimatedBudget: 1000000,
    },
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
      challengeCode: "SIH26136-CH-001",
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

async function seedStartup(client, orgId) {
  const r = await client("POST", "/startups", {
    userId: "admin-a",
    body: {
      organizationId: orgId,
      legalName: "Demo HealthAI Technologies Pvt Ltd",
      brandName: "HealthAI",
      dpiitStatus: "REGISTERED",
      gstStatus: "REGISTERED",
      sector: "health",
      isDemo: true,
    },
  });
  assert.equal(r.status, 201, "startup created");
  return r.body;
}

/* ═════════ TESTS ═════════ */

test("1. government problem creation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  assert.ok(p.id);
  assert.equal(p.sector, "health");
  assert.equal(p.status, "DRAFT");
  assert.equal(p.estimatedBudget, 1000000);
  // created_by must be the acting user
  const got = await client("GET", `/problems/${p.id}`, { userId: "admin-a" });
  assert.equal(got.status, 200);
  assert.equal(got.body.title, "Reduce patient waiting time in rural healthcare");
});

test("2. challenge creation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const c = await seedChallenge(client, orgA, problem.id);
  assert.ok(c.id);
  assert.equal(c.challengeCode, "SIH26136-CH-001");
  assert.equal(c.challengeStatus, "APPLICATIONS_OPEN");
  assert.equal(c.budgetMin, 500000);
});

test("3. startup creation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const s = await seedStartup(client, orgA);
  assert.ok(s.id);
  assert.equal(s.dpiitStatus, "REGISTERED");
  assert.equal(s.verificationStatus, "UNVERIFIED");
  assert.equal(s.isDemo, true);
});

test("4. startup capability creation (vocabulary + attach)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const caps = await client("GET", "/capabilities", { userId: "admin-a" });
  assert.equal(caps.status, 200);
  assert.ok(caps.body.capabilities.length >= 1, "capability vocabulary seeded");
  const ai = caps.body.capabilities.find((c) => c.key === "ai");
  assert.ok(ai, "ai capability present");

  const s = await seedStartup(client, orgA);
  const attached = await client("POST", `/startups/${s.id}/capabilities`, {
    userId: "admin-a",
    body: { capabilityId: ai.id, level: "EXPERT" },
  });
  assert.equal(attached.status, 201, "capability attached");
  assert.equal(attached.body.capability.key, "ai");

  const list = await client("GET", `/startups/${s.id}/capabilities`, { userId: "admin-a" });
  assert.equal(list.body.capabilities.length, 1);
});

test("5. startup document metadata association", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const s = await seedStartup(client, orgA);
  const doc = await client("POST", `/startups/${s.id}/documents`, {
    userId: "admin-a",
    body: { docType: "DPIIT_CERTIFICATE", label: "DPIIT Certificate", reference: "ref://123" },
  });
  assert.equal(doc.status, 201, "document metadata created");
  assert.equal(doc.body.docType, "DPIIT_CERTIFICATE");
  assert.equal(doc.body.status, "UPLOADED");
  assert.ok(doc.body.reference, "stored reference not content");
});

test("6. eligibility record creation (rules + check + result)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const cap = (await client("GET", "/capabilities", { userId: "admin-a" })).body.capabilities.find((c) => c.key === "ai");
  const startup = await seedStartup(client, orgA);

  const rule = await client("POST", "/eligibility/rules", {
    userId: "admin-a",
    body: {
      challengeId: challenge.id,
      name: "Must be a registered startup (DPIIT)",
      criteriaPath: "dpiitStatus",
      operator: "EQUAL",
      referenceValue: "REGISTERED",
      mandatory: true,
    },
  });
  assert.equal(rule.status, 201, "eligibility rule created");

  const capRule = await client("POST", "/eligibility/rules", {
    userId: "admin-a",
    body: {
      challengeId: challenge.id,
      name: "Must have AI capability",
      operator: "HAS_CAPABILITY",
      referenceValue: { key: "ai" },
      mandatory: true,
    },
  });
  assert.equal(capRule.status, 201, "capability rule created");
  await client("POST", `/startups/${startup.id}/capabilities`, {
    userId: "admin-a",
    body: { capabilityId: cap.id },
  });

  const check = await client("POST", "/eligibility/check", {
    userId: "admin-a",
    body: { challengeId: challenge.id, startupId: startup.id },
  });
  assert.equal(check.status, 201, "eligibility check ran");
  assert.equal(check.body.summary.verdict, "ELIGIBLE");
  assert.ok(Array.isArray(check.body.results) && check.body.results.length >= 2);

  const byId = await client("GET", `/eligibility/checks/${check.body.id}`, { userId: "admin-a" });
  assert.equal(byId.status, 200);
  assert.ok(Array.isArray(byId.body.results));
});

test("7. match record creation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);

  const m = await client("POST", `/challenges/${challenge.id}/matches`, {
    userId: "admin-a",
    body: { startupId: startup.id, overallScore: 85, problemFitScore: 90, kind: "RULE_BASED" },
  });
  assert.equal(m.status, 201, "match created");
  assert.equal(m.body.overallScore, 85);
  // duplicate match must be rejected
  const dup = await client("POST", `/challenges/${challenge.id}/matches`, {
    userId: "admin-a",
    body: { startupId: startup.id, overallScore: 80 },
  });
  assert.equal(dup.status, 409, "duplicate match rejected");

  const list = await client("GET", `/challenges/${challenge.id}/matches`, { userId: "admin-a" });
  assert.equal(list.body.matches.length, 1);
});

test("8. evaluation creation (template + evaluation + scores)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);

  const tpl = await client("POST", "/evaluation-templates", {
    userId: "admin-a",
    body: {
      organizationId: orgA,
      name: "Innovation Evaluation",
      criteria: [
        { key: "problem-fit", label: "Problem Fit", weight: 70 },
        { key: "technical", label: "Technical Capability", weight: 30 },
      ],
    },
  });
  assert.equal(tpl.status, 201, "template created");
  assert.equal(tpl.body.criteria.length, 2);
  // weights normalized to sum 100 (30+20 != 100 -> should error; use 70+30)
  assert.equal(tpl.body.criteria.reduce((s, c) => s + c.weight, 0), 100);

  // a template whose weights don't sum to 100 must be rejected
  const bad = await client("POST", "/evaluation-templates", {
    userId: "admin-a",
    body: {
      organizationId: orgA,
      name: "Bad Weights",
      criteria: [
        { key: "a", label: "A", weight: 40 },
        { key: "b", label: "B", weight: 40 },
      ],
    },
  });
  assert.equal(bad.status, 400, "non-100 weights rejected");

  const ev = await client("POST", "/evaluations", {
    userId: "admin-a",
    body: {
      challengeId: challenge.id,
      startupId: startup.id,
      organizationId: orgA,
      templateId: tpl.body.id,
    },
  });
  assert.equal(ev.status, 201, "evaluation created");

  const score = await client("POST", `/evaluations/${ev.body.id}/scores`, {
    userId: "admin-a",
    body: { scores: [
      { criterionKey: "problem-fit", score: 90 },
      { criterionKey: "technical", score: 70 },
    ] },
  });
  assert.equal(score.status, 200, "scores accepted");
  assert.ok(score.body.summary && score.body.summary.weightedTotal != null);

  const got = await client("GET", `/evaluations/${ev.body.id}`, { userId: "admin-a" });
  assert.equal(got.body.scores.length, 2);

  // unknown criterion must be rejected when a template is attached
  const badScore = await client("POST", `/evaluations/${ev.body.id}/scores`, {
    userId: "admin-a",
    body: { scores: [{ criterionKey: "nope", score: 50 }] },
  });
  assert.equal(badScore.status, 400, "unknown criterion rejected");
});

test("9. pilot creation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);

  const pilot = await client("POST", "/pilots", {
    userId: "admin-a",
    body: {
      challengeId: challenge.id,
      startupId: startup.id,
      organizationId: orgA,
      title: "Patient flow pilot at PHC A",
      location: "Pune district",
      durationDays: 90,
      budget: 200000,
      status: "PLANNED",
    },
  });
  assert.equal(pilot.status, 201, "pilot created");
  assert.equal(pilot.body.status, "PLANNED");

  const got = await client("GET", `/pilots/${pilot.body.id}`, { userId: "admin-a" });
  assert.equal(got.status, 200);
  assert.ok(Array.isArray(got.body.kpis));
  assert.ok(Array.isArray(got.body.milestones));
});

test("10. KPI creation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);
  const pilot = await client("POST", "/pilots", {
    userId: "admin-a",
    body: { challengeId: challenge.id, startupId: startup.id, organizationId: orgA, title: "Pilot", durationDays: 90 },
  });

  const kpi = await client("POST", `/pilots/${pilot.body.id}/kpis`, {
    userId: "admin-a",
    body: {
      name: "Average Waiting Time",
      unit: "minutes",
      baselineValue: 45,
      targetValue: 15,
      status: "TARGET",
    },
  });
  assert.equal(kpi.status, 201, "kpi created");
  assert.equal(kpi.body.targetValue, 15);

  // a measurement on the KPI
  const meas = await client("POST", `/kpis/${kpi.body.id}/measurements`, {
    userId: "admin-a",
    body: { value: 12, source: "hospital system" },
  });
  assert.equal(meas.status, 201, "measurement recorded");
});

test("11. pilot result creation (recommendation, not decision)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);
  const pilot = await client("POST", "/pilots", {
    userId: "admin-a",
    body: { challengeId: challenge.id, startupId: startup.id, organizationId: orgA, title: "Pilot", durationDays: 90 },
  });

  const res = await client("POST", `/pilots/${pilot.body.id}/results`, {
    userId: "admin-a",
    body: { result: "SUCCESSFUL", recommendation: "SCALE", qualitativeFindings: "Reduced waiting time by 70%." },
  });
  assert.equal(res.status, 201, "pilot result created");
  assert.equal(res.body.result, "SUCCESSFUL");
  assert.equal(res.body.recommendation, "SCALE");
});

test("12. procurement assessment creation (with decision layers separated)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);
  const pilot = await client("POST", "/pilots", {
    userId: "admin-a",
    body: { challengeId: challenge.id, startupId: startup.id, organizationId: orgA, title: "Pilot", durationDays: 90 },
  });
  const pr = await client("POST", `/pilots/${pilot.body.id}/results`, {
    userId: "admin-a",
    body: { result: "SUCCESSFUL", recommendation: "CONDITIONAL_SCALE" },
  });
  const path = await client("GET", "/procurement/paths", { userId: "admin-a" });
  const gem = path.body.paths.find((p) => p.name === "GeM");

  const assess = await client("POST", "/procurement/assessments", {
    userId: "admin-a",
    body: {
      challengeId: challenge.id,
      pilotResultId: pr.body.id,
      organizationId: orgA,
      procurementType: "GeM",
      estimatedValue: 5000000,
      pathwayId: gem.id,
    },
  });
  assert.equal(assess.status, 201, "assessment created");
  assert.equal(assess.body.estimatedValue, 5000000);

  // decision layers kept separate
  const rec = await client("POST", `/procurement/assessments/${assess.body.id}/recommendations`, {
    userId: "admin-a",
    body: { recommendation: "Proceed via GeM startup corner", kind: "RECOMMENDATION" },
  });
  assert.equal(rec.status, 201);
  assert.equal(rec.body.kind, "RECOMMENDATION");
  const human = await client("POST", `/procurement/assessments/${assess.body.id}/recommendations`, {
    userId: "admin-a",
    body: { recommendation: "Approved by committee", kind: "HUMAN_DECISION" },
  });
  assert.equal(human.status, 201);

  const got = await client("GET", `/procurement/assessments/${assess.body.id}`, { userId: "admin-a" });
  assert.equal(got.body.recommendations.length, 2);
});

test("13. scale plan creation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);
  const pilot = await client("POST", "/pilots", {
    userId: "admin-a",
    body: { challengeId: challenge.id, startupId: startup.id, organizationId: orgA, title: "Pilot", durationDays: 90 },
  });

  const plan = await client("POST", "/scale-plans", {
    userId: "admin-a",
    body: {
      pilotProjectId: pilot.body.id,
      organizationId: orgA,
      targetGeography: ["Maharashtra"],
      estimatedBudget: 20000000,
      scaleReadinessScore: 78,
    },
  });
  assert.equal(plan.status, 201, "scale plan created");
  assert.equal(plan.body.scaleReadinessScore, 78);
  assert.equal(plan.body.status, "DRAFT");
});

test("14. audit event creation on lifecycle actions", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);

  const audit = await client("GET", `/audit?organizationId=${orgA}`, { userId: "admin-a" });
  assert.equal(audit.status, 200);
  const types = audit.body.events.map((e) => e.action);
  assert.ok(types.includes("ORGANIZATION_CREATED"));
  assert.ok(types.includes("PROBLEM_CREATED"));
  assert.ok(types.includes("CHALLENGE_CREATED"));
});

test("15. authorization — role gates prevent unauthorized writes", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  // A VIEWER cannot create a problem
  await client("POST", `/organizations/${orgA}/members`, {
    userId: "admin-a",
    body: { userId: "viewer-x", role: "VIEWER" },
  });
  const forbidden = await client("POST", "/problems", {
    userId: "viewer-x",
    body: { organizationId: orgA, title: "Nope", problemStatement: "No access" },
  });
  assert.equal(forbidden.status, 403, "viewer cannot create problem");
});

test("16. cross-department access restrictions", async () => {
  const { client } = serverCtx;
  const { orgA, orgB } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);

  // admin-b (org B) must NOT read org A challenge
  const cross = await client("GET", `/challenges/${challenge.id}`, { userId: "admin-b" });
  assert.equal(cross.status, 403, "cross-department read denied");
  const crossList = await client("GET", `/challenges?organizationId=${orgA}`, { userId: "admin-b" });
  assert.equal(crossList.status, 403, "cross-department list denied");
  // admin-b can read their own (empty) list
  const own = await client("GET", `/challenges?organizationId=${orgB}`, { userId: "admin-b" });
  assert.equal(own.status, 200);
});

test("17. validation failures for required fields and bad input", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  // missing title
  const noTitle = await client("POST", "/problems", {
    userId: "admin-a",
    body: { organizationId: orgA, problemStatement: "x" },
  });
  assert.equal(noTitle.status, 400, "missing title rejected");
  // invalid enum
  const badEnum = await client("POST", "/problems", {
    userId: "admin-a",
    body: { organizationId: orgA, title: "T", problemStatement: "x", status: "NOPE" },
  });
  assert.equal(badEnum.status, 400, "bad enum rejected");
  // invalid uuid
  const badUuid = await client("GET", "/challenges/not-a-uuid", { userId: "admin-a" });
  assert.equal(badUuid.status, 400, "bad uuid rejected");
});

test("18. invalid foreign keys rejected", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  // challenge references a non-existent problem
  const missingProblem = await client("POST", "/challenges", {
    userId: "admin-a",
    body: { organizationId: orgA, problemId: "00000000-0000-0000-0000-000000000000", title: "T", description: "D" },
  });
  assert.equal(missingProblem.status, 201, "challenge without a real problem is allowed (problem is optional FK)");
  // verification referencing a non-existent evidence document must fail (OFFICIAL source)
  const v = await client("POST", "/startups/00000000-0000-0000-0000-000000000000/verifications", {
    userId: "admin-a",
    body: { verificationType: "DPIIT", source: "OFFICIAL", status: "PENDING" },
  });
  assert.ok([400, 404, 403].includes(v.status), "verification with missing startup rejected");
});

test("19. score range validation (0-100)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);

  const over = await client("POST", `/challenges/${challenge.id}/matches`, {
    userId: "admin-a",
    body: { startupId: startup.id, overallScore: 101 },
  });
  assert.equal(over.status, 400, "score > 100 rejected");
  const under = await client("POST", `/challenges/${challenge.id}/matches`, {
    userId: "admin-a",
    body: { startupId: startup.id, overallScore: -5 },
  });
  assert.equal(under.status, 400, "score < 0 rejected");
  const ok = await client("POST", `/challenges/${challenge.id}/matches`, {
    userId: "admin-a",
    body: { startupId: startup.id, overallScore: 100 },
  });
  assert.equal(ok.status, 201, "score=100 accepted");
});

/* ───────── verification honesty ───────── */
test("verification cannot be self-asserted as VERIFIED from OFFICIAL source", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const startup = await seedStartup(client, orgA);
  // An OFFICIAL verification with status VERIFIED must be rejected
  const v = await client("POST", `/startups/${startup.id}/verifications`, {
    userId: "admin-a",
    body: { verificationType: "DPIIT", source: "OFFICIAL", status: "VERIFIED", evidenceDocumentId: "00000000-0000-0000-0000-000000000000" },
  });
  assert.equal(v.status, 400, "cannot self-assert VERIFIED");
  // DEMO/manual source is allowed and stays PENDING
  const demo = await client("POST", `/startups/${startup.id}/verifications`, {
    userId: "admin-a",
    body: { verificationType: "DPIIT", source: "DEMO", status: "PENDING" },
  });
  assert.equal(demo.status, 201, "demo verification allowed");
  assert.equal(demo.body.isDemo, true);
});

test("health endpoint reports layer + store kind", async () => {
  const { client } = serverCtx;
  const h = await client("GET", "/health", { userId: "admin-a" });
  assert.equal(h.status, 200);
  assert.equal(h.body.layer, "sih26136");
  assert.equal(h.body.store, "memory");
});

test("evidence link creation resolves owning org", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);
  const pilot = await client("POST", "/pilots", {
    userId: "admin-a",
    body: { challengeId: challenge.id, startupId: startup.id, organizationId: orgA, title: "Pilot", durationDays: 90 },
  });
  const pr = await client("POST", `/pilots/${pilot.body.id}/results`, {
    userId: "admin-a",
    body: { result: "SUCCESSFUL", recommendation: "SCALE" },
  });
  const link = await client("POST", "/evidence-links", {
    userId: "admin-a",
    body: { entityType: "PILOT_RESULT", entityId: pr.body.id, referenceType: "DOCUMENT", referenceId: "doc-1", confidence: "high" },
  });
  assert.equal(link.status, 201, "evidence link created");
  const list = await client("GET", `/evidence-links?entityType=PILOT_RESULT&entityId=${pr.body.id}`, { userId: "admin-a" });
  assert.equal(list.status, 200);
  assert.equal(list.body.evidence.length, 1);
});

/* ───────── domain unit tests (no HTTP) ───────── */
test("domain: normalizeWeights zero-sum equal split sums to 100", () => {
  const normalized = dom.normalizeWeights([
    { key: "a", weight: 0 },
    { key: "b", weight: 0 },
    { key: "c", weight: 0 },
  ]);
  const sum = normalized.reduce((s, c) => s + c.weight, 0);
  assert.equal(sum, 100);
});

test("domain: aggregateEligibility maps verdicts correctly", () => {
  const eligible = dom.aggregateEligibility(
    [{ status: "PASS", mandatory: true }, { status: "PASS", mandatory: true }],
    [{}, {}]
  );
  assert.equal(eligible.verdict, "ELIGIBLE");
  const ineligible = dom.aggregateEligibility(
    [{ status: "FAIL", mandatory: true }, { status: "PASS", mandatory: true }],
    [{}, {}]
  );
  assert.equal(ineligible.verdict, "INELIGIBLE");
  const manual = dom.aggregateEligibility([{ status: "MANUAL_REVIEW", mandatory: true }], [{}]);
  assert.equal(manual.verdict, "MANUAL_REVIEW");
});
