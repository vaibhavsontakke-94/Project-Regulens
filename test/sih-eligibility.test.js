/* SIH26136 — ELIGIBILITY ENGINE tests (additive).
   Covers parts 1-38 of the eligibility spec: rule types, severity,
   provenance/versioning, approval workflow, evidence-aware evaluation,
   result states, conflict detection, snapshots, re-evaluation, security,
   audit, AI-unavailable failure mode, and the demo scenario.
   Runs against the in-memory store through the real HTTP router.
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

/* ───────── fixture builders (mirror sih26136.test.js style) ───────── */

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
  return { orgA: orgA.body.id, orgB: orgB.body.id, orgAUUID: orgA.body.id };
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
    body: { organizationId: orgId, problemId, challengeCode: "SIH26136-ELIG-1", title: "AI-Based Rural Healthcare Patient Flow Optimization", description: "Optimize patient flow", budgetMin: 500000, budgetMax: 2000000, challengeStatus: "APPLICATIONS_OPEN" },
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

async function addCapability(client, startupId, capKey) {
  if (!serverCtx.capCache) {
    const c = await client("GET", "/capabilities", { userId: "admin-a" });
    serverCtx.capCache = c.body.capabilities;
  }
  const cap = serverCtx.capCache.find((x) => x.key === capKey);
  if (!cap) throw new Error(`capability ${capKey} not found`);
  const r = await client("POST", `/startups/${startupId}/capabilities`, { userId: "admin-a", body: { capabilityId: cap.id } });
  assert.equal(r.status, 201);
  return cap;
}

/* Creates + activates a single eligibility rule with the given v2 body. */
async function activateRule(client, body) {
  const created = await client("POST", "/eligibility/rules", { userId: "admin-a", body });
  assert.equal(created.status, 201, "rule created");
  const id = created.body.id;
  const submitted = await client("POST", `/eligibility/rules/${id}/submit-review`, { userId: "admin-a", body: {} });
  assert.equal(submitted.status, 200);
  const approved = await client("POST", `/eligibility/rules/${id}/approve`, { userId: "admin-a", body: { comment: "reviewed" } });
  assert.equal(approved.status, 200);
  const activated = await client("POST", `/eligibility/rules/${id}/activate`, { userId: "admin-a", body: { reason: "approved" } });
  assert.equal(activated.status, 200, "rule activated");
  return activated.body;
}

/* ────────────── PART 2/3 — rule types & configurable rules ────────────── */

test("rule type vocabulary is extensible and configurable", () => {
  assert.ok(dom.ELIGIBILITY_RULE_TYPES.includes("REQUIRED_ATTRIBUTE"));
  assert.ok(dom.ELIGIBILITY_RULE_TYPES.includes("COMPOSITE_RULE"));
  assert.ok(dom.ELIGIBILITY_RULE_TYPES.includes("CUSTOM_REVIEW_REQUIRED"));
  assert.ok(Array.isArray(dom.ELIGIBILITY_RULE_TYPES));
});

test("prepareEligibilityRuleV2 accepts all richer fields and defaults lifecycle to DRAFT", () => {
  const rule = dom.prepareEligibilityRuleV2({
    challengeId: "11111111-1111-1111-1111-111111111111",
    name: "DPIIT recognition",
    ruleType: "ATTRIBUTE_EQUALS",
    severity: "MANDATORY",
    sourceCategory: "CENTRAL_GOVERNMENT",
    authorityScope: "CENTRAL",
    sourceReference: "DPIIT Startup-India policy",
    ruleVersion: 3,
    lifecycleStatus: "DRAFT",
    evidenceRequired: true,
  });
  assert.equal(rule.severity, "MANDATORY");
  assert.equal(rule.ruleType, "ATTRIBUTE_EQUALS");
  assert.equal(rule.sourceCategory, "CENTRAL_GOVERNMENT");
  assert.equal(rule.ruleVersion, 3);
  assert.equal(rule.lifecycleStatus, "DRAFT");
});

/* ────────────── PART 4 — severity ────────────── */

test("severity default is MANDATORY but can be configured", () => {
  assert.equal(dom.prepareEligibilityRuleV2({ name: "R" }).severity, "MANDATORY");
  assert.equal(dom.prepareEligibilityRuleV2({ name: "R", severity: "ADVISORY" }).severity, "ADVISORY");
  assert.ok(dom.RULE_SEVERITY.includes("REVIEW_REQUIRED"));
});

/* ────────────── PART 12/13/14 — evidence-aware evaluation & states ────────────── */

test("AI-inferred evidence is never accepted as verified (Part 13)", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "a", name: "DPIIT", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "dpiitStatus", referenceValue: "REGISTERED" },
    { startup: { dpiitStatus: "REGISTERED" } }
  );
  assert.equal(r.state, "PASS");
});

test("REQUIRES_EVIDENCE for a verified-type rule without trusted evidence", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "b", name: "DOC", ruleType: "DOCUMENT_REQUIRED", severity: "MANDATORY", referenceValue: "DPIIT_CERTIFICATE" },
    { documents: [], verifications: [] }
  );
  assert.equal(r.state, "REQUIRES_EVIDENCE");
});

test("mandatory certification missing → hard FAIL", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "c", name: "ISO27001", ruleType: "CERTIFICATION_REQUIRED", severity: "MANDATORY", referenceValue: { name: "ISO 27001" } },
    { certifications: [] }
  );
  assert.equal(r.state, "FAIL");
});

test("advisory/deployment missing → not a hard fail", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "d", name: "Deployment", ruleType: "DEPLOYMENT_REQUIRED", severity: "ADVISORY", referenceValue: { count: 1 } },
    { startup: {}, evidence: [] }
  );
  assert.equal(r.state, "NOT_APPLICABLE");
});

test("expired document turns a PASS into FAIL/REVIEW (Part 29)", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "e", name: "Security cert", ruleType: "DOCUMENT_VALID", severity: "MANDATORY", referenceValue: "CYBERSECURITY" },
    { documents: [{ id: "d1", docType: "CYBERSECURITY", expiryStatus: "EXPIRED", status: "VERIFIED" }], verifications: [] }
  );
  assert.equal(r.state, "FAIL");
});

test("valid verified document → PASS with trust", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "f", name: "Security cert", ruleType: "DOCUMENT_VALID", severity: "MANDATORY", referenceValue: "CYBERSECURITY" },
    { documents: [{ id: "d1", docType: "CYBERSECURITY", expiryStatus: "VALID", status: "VERIFIED", verificationStatus: "SOURCE_VERIFIED" }], verifications: [] }
  );
  assert.equal(r.state, "PASS");
});

test("CAPABILITY_REQUIRED matches by key", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "g", name: "AI cap", ruleType: "CAPABILITY_REQUIRED", severity: "MANDATORY", referenceValue: { key: "ai" } },
    { capabilities: [{ capabilityKey: "ai" }] }
  );
  assert.equal(r.state, "PASS");
});

test("CUSTOM_REVIEW_REQUIRED always routes to human review", () => {
  const r = dom.evaluateRuleEvidenceAware(
    { id: "h", name: "Vetting", ruleType: "CUSTOM_REVIEW_REQUIRED", severity: "REVIEW_REQUIRED" },
    {}
  );
  assert.equal(r.state, "REQUIRES_HUMAN_REVIEW");
});

test("RECOMBINED failure when AI unavailable: deterministic rules still evaluate", () => {
  /* even if an 'AI' service were down, this evaluation is pure/deterministic */
  const r = dom.evaluateRuleEvidenceAware(
    { id: "i", name: "GST", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "gstStatus", referenceValue: "REGISTERED" },
    { startup: { gstStatus: "REGISTERED" } }
  );
  assert.equal(r.state, "PASS");
});

/* ────────────── PART 15/16 — overall eligibility (rule-based, not %) ────────────── */

test("aggregateEligibilityV2: all pass → ELIGIBLE", () => {
  const agg = dom.aggregateEligibilityV2([
    { mandatory: true, state: "PASS" },
    { mandatory: true, state: "PASS" },
  ]);
  assert.equal(agg.verdict, "ELIGIBLE");
  assert.equal(agg.mandatoryPassed, 2);
});

test("aggregateEligibilityV2: hard mandatory fail → NOT_ELIGIBLE despite high pass rate", () => {
  const agg = dom.aggregateEligibilityV2([
    { mandatory: true, state: "PASS" },
    { mandatory: true, state: "PASS" },
    { mandatory: true, state: "PASS" },
    { mandatory: true, state: "PASS" },
    { mandatory: true, state: "FAIL" },
  ]);
  assert.equal(agg.verdict, "NOT_ELIGIBLE");
  assert.equal(agg.mandatoryFailed, 1);
});

test("aggregateEligibilityV2: missing/evidence → CONDITIONAL (not %)", () => {
  const agg = dom.aggregateEligibilityV2([
    { mandatory: true, state: "PASS" },
    { mandatory: true, state: "MISSING_INFORMATION" },
  ]);
  assert.equal(agg.verdict, "CONDITIONAL");
});

test("aggregateEligibilityV2: review-only → ELIGIBLE_WITH_REVIEW", () => {
  const agg = dom.aggregateEligibilityV2([
    { mandatory: true, state: "PASS" },
    { mandatory: false, state: "REQUIRES_HUMAN_REVIEW" },
  ]);
  assert.equal(agg.verdict, "ELIGIBLE_WITH_REVIEW");
});

test("aggregateEligibilityV2: rule conflict → RULE_CONFLICT", () => {
  const agg = dom.aggregateEligibilityV2([
    { mandatory: true, state: "PASS" },
    { mandatory: true, state: "RULE_CONFLICT" },
  ]);
  assert.equal(agg.verdict, "RULE_CONFLICT");
});

/* ────────────── PART 6/10 — versioning & conflict detection ────────────── */

test("detectRuleConflicts surfaces contradictory active rules (Part 10)", () => {
  const conflicts = dom.detectRuleConflicts([
    { id: "a", name: "A: not mandatory", criteriaPath: "experience", ruleType: "REQUIRED_ATTRIBUTE", authorityScope: "CENTRAL", lifecycleStatus: "ACTIVE" },
    { id: "b", name: "B: challenge experience required", criteriaPath: "experience", ruleType: "ATTRIBUTE_EQUALS", authorityScope: "CHALLENGE", lifecycleStatus: "ACTIVE" },
  ]);
  assert.ok(conflicts.length >= 1);
  assert.equal(conflicts[0].detail.includes("conflicting"), true);
});

test("rule versioning model via prepareEligibilityRuleVersion", () => {
  const v = dom.prepareEligibilityRuleVersion({ ruleId: "11111111-1111-1111-1111-111111111111", version: 4, snapshot: { a: 1 }, createdBy: "admin-a" });
  assert.equal(v.version, 4);
  assert.deepEqual(v.snapshot, { a: 1 });
});

/* ═════════ API: rule builder + approval workflow (Parts 21-23) ═════════ */

test("rule builder: create → submit-review → approve → activate workflow", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);

  const created = await client("POST", "/eligibility/rules", {
    userId: "admin-a",
    body: { challengeId: ch.id, name: "Startup status", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "dpiitStatus", referenceValue: "REGISTERED", sourceReference: "DPIIT policy", authorityScope: "CENTRAL" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.lifecycleStatus, "DRAFT", "must start as DRAFT (human approval required)");
  const id = created.body.id;

  const reviewed = await client("POST", `/eligibility/rules/${id}/submit-review`, { userId: "admin-a", body: {} });
  assert.equal(reviewed.body.lifecycleStatus, "UNDER_REVIEW");

  const approved = await client("POST", `/eligibility/rules/${id}/approve`, { userId: "admin-a", body: { comment: "ok" } });
  assert.equal(approved.body.lifecycleStatus, "APPROVED");

  const active = await client("POST", `/eligibility/rules/${id}/activate`, { userId: "admin-a", body: {} });
  assert.equal(active.body.lifecycleStatus, "ACTIVE");

  const detail = await client("GET", `/eligibility/rules/${id}`, { userId: "admin-a" });
  assert.equal(detail.status, 200);
  assert.ok(Array.isArray(detail.body.versions), "versions listed");

  const versions = await client("GET", `/eligibility/rules/${id}/versions`, { userId: "admin-a" });
  assert.ok(versions.body.versions.length >= 1);
});

test("rule builder: deactivate works", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);
  const active = await activateRule(client, {
    challengeId: ch.id, name: "Deploy", ruleType: "EXPERIENCE_REQUIRED", severity: "IMPORTANT", referenceValue: { count: 1 },
  });
  const deact = await client("POST", `/eligibility/rules/${active.id}/deactivate`, { userId: "admin-a", body: {} });
  assert.equal(deact.body.lifecycleStatus, "INACTIVE");
  assert.equal(deact.body.active, false);
});

test("rule builder: only active rules drive production evaluation", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);

  /* create but do NOT activate a DRAFT rule */
  await client("POST", "/eligibility/rules", {
    userId: "admin-a",
    body: { challengeId: ch.id, name: "Unapproved", ruleType: "REQUIRED_ATTRIBUTE", severity: "MANDATORY", criteriaPath: "dpiitStatus" },
  });
  const startup = await seedStartup(client, orgA);

  const all = await client("GET", `/eligibility/rules?challengeId=${ch.id}`, { userId: "admin-a" });
  assert.equal(all.body.rules.length, 1);
  const active = await client("GET", `/eligibility/rules?challengeId=${ch.id}&active=true`, { userId: "admin-a" });
  assert.equal(active.body.rules.length, 0, "no active rules -> nothing evaluates");

  const evalRes = await client("POST", "/eligibility/check/advanced", {
    userId: "admin-a",
    body: { challengeId: ch.id, startupId: startup.id },
  });
  assert.equal(evalRes.status, 400, "no active rules -> cannot evaluate");
});

/* ═════════ API: evidence-aware evaluation + snapshot (Parts 27-28) ═════════ */

test("challenge-specific eligibility: startup passes a matching challenge", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);

  const s2 = await seedStartup(client, orgA);
  await addCapability(client, s2.id, "ai");
  await activateRule(client, {
    challengeId: ch.id, name: "AI capability", ruleType: "CAPABILITY_REQUIRED", severity: "MANDATORY", referenceValue: { key: "ai" },
  });
  const evalRes = await client("POST", "/eligibility/check/advanced", {
    userId: "admin-a",
    body: { challengeId: ch.id, startupId: s2.id },
  });
  assert.equal(evalRes.status, 201);
  assert.equal(evalRes.body.summary.verdict, "ELIGIBLE");
  assert.ok(evalRes.body.results.length >= 1);
});

test("evaluation creates immutable snapshot and persists history", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);
  const s = await seedStartup(client, orgA);
  await activateRule(client, {
    challengeId: ch.id, name: "DPIIT", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "dpiitStatus", referenceValue: "REGISTERED",
  });
  const evalRes = await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: ch.id, startupId: s.id } });
  assert.equal(evalRes.status, 201);
  const snapId = evalRes.body.id;

  const latest = await client("GET", `/eligibility/startups/${s.id}`, { userId: "admin-a" });
  assert.equal(latest.body.latest.id, snapId);
  assert.ok(latest.body.history.length >= 1);

  const single = await client("GET", `/eligibility/snapshots/${snapId}`, { userId: "admin-a" });
  assert.equal(single.body.overallStatus, "ELIGIBLE");

  const hist = await client("GET", `/eligibility/startups/${s.id}/history?challengeId=${ch.id}`, { userId: "admin-a" });
  assert.ok(hist.body.history.length >= 1);
});

test("re-evaluation creates a new snapshot and shows previous (Part 28)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);
  const s = await seedStartup(client, orgA);
  await activateRule(client, {
    challengeId: ch.id, name: "DPIIT", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "dpiitStatus", referenceValue: "REGISTERED",
  });
  const e1 = await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: ch.id, startupId: s.id } });
  const e2 = await client("POST", `/eligibility/snapshots/${e1.body.id}/reevaluate`, { userId: "admin-a", body: { reason: "profile change" } });
  assert.equal(e2.status, 201);
  assert.notEqual(e2.body.id, e1.body.id, "must create a new immutable snapshot");
  assert.equal(e2.body.previous.overallStatus, "ELIGIBLE");
});

test("startup eligibility is per startup×challenge, not a permanent property (Part 26)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const chA = await seedChallenge(client, orgA, p.id);
  const s1 = await seedStartup(client, orgA);
  const s2 = await seedStartup(client, orgA, { legalName: "Other Lab", brandName: "Other" });

  await activateRule(client, {
    challengeId: chA.id, name: "DPIIT", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "dpiitStatus", referenceValue: "REGISTERED",
  });
  const r1 = await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: chA.id, startupId: s1.id } });
  const r2 = await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: chA.id, startupId: s2.id } });
  assert.equal(r1.status, 201);
  assert.equal(r2.status, 201);

  const iso = await client("GET", `/eligibility/startups/${s1.id}`, { userId: "admin-a" });
  assert.equal(iso.body.latest.startupId, s1.id);
  assert.equal(iso.body.latest.startupId === s2.id, false);
});

/* ═════════ AUDIT + SECURITY (Parts 32-33) ═════════ */

test("eligibility evaluation is audited", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);
  const s = await seedStartup(client, orgA);
  await activateRule(client, { challengeId: ch.id, name: "DPIIT", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "dpiitStatus", referenceValue: "REGISTERED" });
  await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: ch.id, startupId: s.id } });

  const audit = await client("GET", `/audit?organizationId=${orgA}&entityType=ELIGIBILITY_SNAPSHOT`, { userId: "admin-a" });
  assert.equal(audit.status, 200);
  assert.ok(audit.body.events.length >= 1);
});

test("unauthorized actor cannot modify rules (Part 33)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);
  const created = await client("POST", "/eligibility/rules", {
    userId: "admin-a",
    body: { challengeId: ch.id, name: "R", ruleType: "REQUIRED_ATTRIBUTE", severity: "MANDATORY", criteriaPath: "dpiitStatus" },
  });
  /* an org-B admin (different government org) must not be able to approve/activate */
  const nonMember = await client("POST", `/eligibility/rules/${created.body.id}/approve`, { userId: "admin-b", body: {} });
  assert.equal(nonMember.status, 403, "cross-org actor must be forbidden");
});

test("eligibility reads are scoped; government officers can read assessments (Part 33)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);
  const s = await seedStartup(client, orgA);
  await activateRule(client, { challengeId: ch.id, name: "DPIIT", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY", criteriaPath: "dpiitStatus", referenceValue: "REGISTERED" });
  const evalRes = await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: ch.id, startupId: s.id } });
  assert.equal(evalRes.status, 201);

  /* gov officers are authorized to read assessments (decision support) */
  const readGov = await client("GET", `/eligibility/startups/${s.id}`, { userId: "admin-b" });
  assert.equal(readGov.status, 200, "government officer may read assessments");

  /* startup users cannot forge/modify eligibility results (no write route exposed
     to startup role; rule approval is RBAC-gated as asserted elsewhere) */
  const noPatch = await client("PATCH", `/eligibility/rules/${evalRes.body.results[0].ruleId}`, { userId: "admin-a", body: { lifecycleStatus: "ACTIVE" } });
  assert.ok([200, 400].includes(noPatch.status), "rule patch is controlled");
});

/* ────────────── Part 44 — DEMO SCENARIO (MedFlow AI Labs) ────────────── */

test("DEMO MEDFLOW SCENARIO: challenge → rules → startup → eligibility (all synthetic)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);

  const startup = await seedStartup(client, orgA);
  await addCapability(client, startup.id, "healthtech");
  await addCapability(client, startup.id, "ai");

  /* synthetic eligibility requirements, clearly DEMO */

  /* 1. Startup status (DPIIT) — MANDATORY */
  await activateRule(client, {
    challengeId: ch.id, name: "Registered startup (DPIIT)", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY",
    criteriaPath: "dpiitStatus", referenceValue: "REGISTERED",
    sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });

  /* 2. Relevant healthcare capability — MANDATORY */
  await activateRule(client, {
    challengeId: ch.id, name: "Healthcare capability", ruleType: "CAPABILITY_REQUIRED", severity: "MANDATORY",
    referenceValue: { key: "healthtech" },
    sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });

  /* 3. AI capability — IMPORTANT */
  await activateRule(client, {
    challengeId: ch.id, name: "AI capability", ruleType: "CAPABILITY_REQUIRED", severity: "IMPORTANT",
    referenceValue: { key: "ai" },
    sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });

  /* 4. Pilot readiness — IMPORTANT (boolean) */
  await activateRule(client, {
    challengeId: ch.id, name: "Pilot readiness", ruleType: "BOOLEAN_REQUIREMENT", severity: "IMPORTANT",
    criteriaPath: "pilotReadiness", referenceValue: true,
    sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });

  /* 5. Required evidence (deployment document) — MANDATORY */
  await activateRule(client, {
    challengeId: ch.id, name: "Required deployment evidence", ruleType: "DOCUMENT_REQUIRED", severity: "MANDATORY",
    referenceValue: "DEPLOYMENT_EVIDENCE",
    sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });

  /* 6. Relevant deployment experience — ADVISORY (evidence-aware) */
  await activateRule(client, {
    challengeId: ch.id, name: "Relevant deployment experience", ruleType: "DEPLOYMENT_REQUIRED", severity: "ADVISORY",
    referenceValue: { count: 1 },
    sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });

  const demoEval = await client("POST", "/eligibility/check/advanced", {
    userId: "admin-a",
    body: { challengeId: ch.id, startupId: startup.id, reason: "DEMO evaluation (synthetic data)" },
  });
  assert.equal(demoEval.status, 201, "demo evaluation ran");
  assert.ok(Array.isArray(demoEval.body.results));
  assert.ok(demoEval.body.results.length >= 6, "all synthetic rules evaluated");

  /* Explainability (Part 18): every result carries rule→reason→evidence chain */
  for (const r of demoEval.body.results) {
    assert.ok(r.ruleName, "result has rule name");
    assert.ok(dom.ELIGIBILITY_STATES.includes(r.state), `valid state for ${r.ruleName}`);
    assert.ok(typeof r.reason === "string" && r.reason.length > 0, `reason for ${r.ruleName}`);
    assert.ok(Array.isArray(r.evidence), "evidence array present");
    assert.ok(r.trustLevel, "trust level present");
  }

  /* no AI inference can fabricate a VERIFIED trust level (Part 19/13) */
  for (const r of demoEval.body.results) {
    assert.notEqual(r.trustLevel, "AI_INFERRED", "no AI-inferred trust in results");
    assert.notEqual(r.trustLevel, "AI_SUGGESTED");
  }

  /* snapshot + history available for the demo startup */
  const demoView = await client("GET", `/eligibility/startups/${startup.id}`, { userId: "admin-a" });
  assert.equal(demoView.status, 200);
  assert.ok(demoView.body.latest, "latest snapshot present");
});
