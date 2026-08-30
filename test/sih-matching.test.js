/* SIH26136 — INTELLIGENT STARTUP MATCHING tests (additive, Parts 41-58).
   Exercises the full pipeline through the real HTTP router + in-memory store:
   eligibility HARD GATE, tier ranking, deterministic scores/confidence,
   immutable runs, weight validation + versioning, explanation/evidence,
   shortlist + human override, audit, and cross-org security.
   No AI is involved — all assertions are on deterministic outputs.
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

/* ───────── fixture builders (mirror sih-eligibility.test.js) ───────── */

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
    body: { organizationId: orgId, problemId, challengeCode: "SIH26136-MATCH-1", title: "AI-Based Rural Healthcare Patient Flow Optimization", description: "Optimize patient flow", budgetMin: 500000, budgetMax: 2000000, challengeStatus: "APPLICATIONS_OPEN" },
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

async function addCapability(client, startupId, capKey, userId = "admin-a") {
  if (!serverCtx.capCache) {
    const c = await client("GET", "/capabilities", { userId: "admin-a" });
    serverCtx.capCache = c.body.capabilities;
  }
  const cap = serverCtx.capCache.find((x) => x.key === capKey);
  if (!cap) throw new Error(`capability ${capKey} not found`);
  const r = await client("POST", `/startups/${startupId}/capabilities`, { userId, body: { capabilityId: cap.id } });
  assert.equal(r.status, 201);
  return cap;
}

async function activateRule(client, body) {
  const created = await client("POST", "/eligibility/rules", { userId: "admin-a", body });
  assert.equal(created.status, 201, "rule created");
  const id = created.body.id;
  await client("POST", `/eligibility/rules/${id}/submit-review`, { userId: "admin-a", body: {} });
  await client("POST", `/eligibility/rules/${id}/approve`, { userId: "admin-a", body: { comment: "reviewed" } });
  const activated = await client("POST", `/eligibility/rules/${id}/activate`, { userId: "admin-a", body: { reason: "approved" } });
  assert.equal(activated.status, 200, "rule activated");
  return activated.body;
}

/* 4 startups: MedFlow (ELIGIBLE_WITH_REVIEW, strong), HealthGrid (ELIGIBLE_WITH_REVIEW),
   RuralCare (CONDITIONAL - missing deployment evidence), GateBlock (NOT_ELIGIBLE - DPIIT PENDING).
   Rules: mandatory DPIIT REGISTERED + mandatory deployment evidence document.
   MedFlow/HealthGrid upload the doc; RuralCare does not; GateBlock fails DPIIT. */
async function seedMatchingScenario(client) {
  const { orgA } = await seedBase(client);
  const p = await seedProblem(client, orgA);
  const ch = await seedChallenge(client, orgA, p.id);

  const enriched = await client("PATCH", `/challenges/${ch.id}`, {
    userId: "admin-a",
    body: {
      objective: "Reduce patient waiting time in rural district hospitals",
      expectedOutcomes: ["reduced waiting time", "better bed turnover"],
      targetUsers: "District hospitals", geography: "Maharashtra",
      technicalCapabilities: ["Artificial Intelligence", "HealthTech", "Data Analytics"],
      successMetrics: ["reduced waiting time", "bed turnover"], pilotDurationDays: 12,
    },
  });
  assert.equal(enriched.status, 200, "challenge enriched for matching signals");

  async function mk(name, extra, caps, attributes) {
    const s = await seedStartup(client, orgA, { legalName: `${name} Pvt Ltd`, brandName: name, state: "Maharashtra", ...extra });
    for (const k of caps) await addCapability(client, s.id, k);
    const prof = await client("POST", `/startups/${s.id}/profile`, {
      userId: "admin-a",
      body: { attributes, isDemo: true },
    });
    assert.ok([200, 201].includes(prof.status), "profile saved");
    return s;
  }

  const medflow = await mk("MedFlow", { employeeCount: 24 }, ["healthtech", "ai", "data-analytics"], {
    products: ["Patient Flow AI", "Queue Optimization App"],
    useCases: ["patient flow optimization", "waiting time reduction"],
    deploymentDomains: ["rural hospitals", "district hospitals"],
    governmentDeployments: ["collector office pilot"],
    pilotReadiness: { team: true, infrastructure: true, pilotExperience: true, durationDays: 10 },
    scaleCapacity: { capacity: 40, infrastructure: true },
  });
  const healthgrid = await mk("HealthGrid", { employeeCount: 18 }, ["healthtech", "computer-vision"], {
    products: ["Bed Management System"],
    useCases: ["bed capacity planning"],
    deploymentDomains: ["city hospitals"],
    pilotReadiness: { team: true, infrastructure: true },
    scaleCapacity: { capacity: 20 },
  });
  const ruralcare = await mk("RuralCare", { employeeCount: 6 }, ["healthtech"], {
    products: ["Clinic Scheduler"],
    useCases: ["appointment scheduling"],
    deploymentDomains: ["community health centers"],
    pilotReadiness: { team: true },
  });
  const gateblock = await mk("GateBlock", { dpiitStatus: "PENDING", employeeCount: 30 }, ["healthtech", "ai"], {
    products: ["Surgical AI"],
    useCases: ["surgical planning"],
    deploymentDomains: ["tertiary hospitals"],
  });

  await activateRule(client, {
    challengeId: ch.id, name: "Registered startup (DPIIT)", ruleType: "ATTRIBUTE_EQUALS", severity: "MANDATORY",
    criteriaPath: "dpiitStatus", referenceValue: "REGISTERED", sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });
  await activateRule(client, {
    challengeId: ch.id, name: "Deployment evidence document", ruleType: "DOCUMENT_REQUIRED", severity: "MANDATORY",
    referenceValue: "DEPLOYMENT_EVIDENCE", sourceReference: "DEMO / SYNTHETIC DATA", sourceCategory: "CHALLENGE_SPECIFIC", sourceMode: "DEMO",
  });

  for (const s of [medflow, healthgrid]) {
    const d = await client("POST", `/startups/${s.id}/documents`, { userId: "admin-a", body: { docType: "DEPLOYMENT_EVIDENCE", label: "demo deployment evidence" } });
    assert.equal(d.status, 201, "evidence document uploaded");
  }

  for (const s of [medflow, healthgrid, ruralcare, gateblock]) {
    const e = await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: ch.id, startupId: s.id } });
    assert.equal(e.status, 201, "eligibility evaluated");
  }
  return { client: serverCtx.client, orgA, problem: p, challenge: ch, medflow, healthgrid, ruralcare, gateblock };
}

async function runMatching(client, challengeId, body = {}) {
  return client("POST", `/challenges/${challengeId}/matching/run`, { userId: "admin-a", body });
}

/* ────────────── engine invariants (deterministic, gate-first) ────────────── */

test("default configuration is complete and sums to 100", () => {
  const cfg = dom.prepareMatchingConfiguration({
    challengeId: "11111111-1111-1111-1111-111111111111",
    dimensions: dom.MATCH_DIMENSIONS.map((key) => ({ key, weight: { PROBLEM_FIT: 25, CAPABILITY_FIT: 20, TECHNOLOGY_FIT: 15, USE_CASE_FIT: 10, DEPLOYMENT_EXPERIENCE: 10, PILOT_READINESS: 10, GEOGRAPHIC_FIT: 5, EVIDENCE_STRENGTH: 5 }[key] || 0 })),
  });
  const check = dom.validateMatchingWeights(cfg.activeDimensions);
  assert.equal(check.valid, true);
  assert.equal(cfg.totalWeight, 100);
  assert.equal(cfg.normalized, false, "engine never silently normalizes");
});

/* ────────────── Part 3/21 — hard gate + ranked tiers ────────────── */

test("eligibility is a hard gate: NOT_ELIGIBLE startups are excluded from ranking", async () => {
  const { challenge, medflow, healthgrid, ruralcare, gateblock } = await seedMatchingScenario(serverCtx.client);

  const r = await runMatching(serverCtx.client, challenge.id);
  assert.equal(r.status, 201);
  assert.equal(r.body.status, "COMPLETED");

  const pools = r.body.pool;
  assert.equal(pools.candidateCount, 4, "eligible + conditional + excluded all counted as candidates");
  assert.equal(pools.rankableCount, 3, "eligible(2, with-review) + conditional(1) are rankable");
  assert.equal(pools.conditionalCount, 1);
  assert.equal(pools.excludedCount, 1);

  const results = r.body.results;
  assert.equal(results.length, 3, "ranked = 3; excluded never scored");
  const resultStartupIds = results.map((x) => x.startupId);
  assert.ok(resultStartupIds.includes(medflow.id));
  assert.ok(resultStartupIds.includes(healthgrid.id));
  assert.ok(resultStartupIds.includes(ruralcare.id));
  assert.ok(!resultStartupIds.includes(gateblock.id), "excluded startup must never appear in ranked results");

  const tierOrder = results.map((x) => x.eligibilityPool);
  assert.deepEqual(tierOrder.slice(0, 2), ["RANKED_WITH_WARNING", "RANKED_WITH_WARNING"], "eligible-with-review first");
  assert.equal(tierOrder[2], "RANKED_CONDITIONAL", "conditional last, never above eligible");
  assert.equal(r.body.engineVersion, dom.MATCHING_ENGINE_VERSION);
});

test("results are immutable snapshots with deterministic, reproducible scores", async () => {
  const { challenge } = await seedMatchingScenario(serverCtx.client);
  const a = await runMatching(serverCtx.client, challenge.id);
  const b = await runMatching(serverCtx.client, challenge.id);
  assert.equal(a.body.status, "COMPLETED");
  assert.notEqual(a.body.id, b.body.id, "each run is a NEW immutable run");
  assert.equal(a.body.results.length, b.body.results.length);

const scoresA = a.body.results.map((x) => x.matchScore);
  assert.ok(a.body.results.every((x) => x.matchScore > 0 && x.matchScore <= 1), "scores normalized 0-1");
  assert.ok(a.body.results.every((x) => x.matchConfidence > 0 && x.matchConfidence <= 1), "confidence separate 0-1");

  for (let i = 0; i < a.body.results.length; i++) {
    assert.equal(a.body.results[i].matchScore, b.body.results[i].matchScore, "reproducible score");
    assert.equal(a.body.results[i].matchConfidence, b.body.results[i].matchConfidence, "reproducible confidence");
  }
  for (let i = 0; i + 1 < a.body.results.length; i++) {
    assert.ok(a.body.results[i].matchScore >= a.body.results[i + 1].matchScore, "score-desc within tier");
  }
});

test("weighted dimension sum reproduces the match score (no hidden math)", async () => {
  const { challenge } = await seedMatchingScenario(serverCtx.client);
  const r = await runMatching(serverCtx.client, challenge.id);
  const result = r.body.results[0];
  assert.ok(Array.isArray(result.dimensionResults) && result.dimensionResults.length >= 1);
  const weighted = result.dimensionResults.reduce((sum, d) => sum + d.score * d.weight, 0) / 100;
  assert.ok(Math.abs(weighted - result.matchScore) < 1e-9, `score ${result.matchScore} == Σ(score×weight)/100 ${weighted}`);
});

/* ────────────── Part 41-43 — configuration + versioning ────────────── */

test("GET configuration returns engine defaults before any save", async () => {
  const { challenge } = await seedMatchingScenario(serverCtx.client);
  const g = await serverCtx.client("GET", `/challenges/${challenge.id}/matching/configuration`, { userId: "admin-a" });
  assert.equal(g.status, 200);
  assert.equal(g.body.configuration.totalWeight, 100);
  assert.ok(Array.isArray(g.body.versions));
});

test("PATCH configuration validates strictly: duplicates and bad sums are rejected (400)", async () => {
  const { challenge } = await seedMatchingScenario(serverCtx.client);

  const dup = await serverCtx.client("PATCH", `/challenges/${challenge.id}/matching/configuration`, {
    userId: "admin-a",
    body: { dimensions: [{ key: "PROBLEM_FIT", weight: 50 }, { key: "PROBLEM_FIT", weight: 50 }], changeReason: "duplicate" },
  });
  assert.equal(dup.status, 400, "duplicate dimension weights rejected");

  const badSum = await serverCtx.client("PATCH", `/challenges/${challenge.id}/matching/configuration`, {
    userId: "admin-a",
    body: { weights: { PROBLEM_FIT: 10, CAPABILITY_FIT: 10 }, changeReason: "sum-40" },
  });
  assert.equal(badSum.status, 400, "sum != 100 rejected");

  const ok = await serverCtx.client("PATCH", `/challenges/${challenge.id}/matching/configuration`, {
    userId: "admin-a",
    body: { weights: { PROBLEM_FIT: 30, CAPABILITY_FIT: 25, TECHNOLOGY_FIT: 15, USE_CASE_FIT: 10, DEPLOYMENT_EXPERIENCE: 10, PILOT_READINESS: 5, GEOGRAPHIC_FIT: 3, EVIDENCE_STRENGTH: 2 }, changeReason: "custom" },
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.totalWeight, 100);
  assert.equal(ok.body.normalized, false);
  assert.ok(ok.body.configVersion >= 1);

  const versions = await serverCtx.client("GET", `/challenges/${challenge.id}/matching/configuration`, { userId: "admin-a" });
  assert.ok(versions.body.versions.length >= 1, "version history recorded");
});

test("a matching run records the configVersion it used", async () => {
  const { challenge } = await seedMatchingScenario(serverCtx.client);
  const cfg = await serverCtx.client("PATCH", `/challenges/${challenge.id}/matching/configuration`, {
    userId: "admin-a",
    body: { weights: { PROBLEM_FIT: 30, CAPABILITY_FIT: 25, TECHNOLOGY_FIT: 15, USE_CASE_FIT: 10, DEPLOYMENT_EXPERIENCE: 10, PILOT_READINESS: 5, GEOGRAPHIC_FIT: 3, EVIDENCE_STRENGTH: 2 } },
  });
  const r = await runMatching(serverCtx.client, challenge.id);
  assert.equal(r.body.configVersion, cfg.body.configVersion);
});

/* ────────────── Part 44 — freshness, reruns, run history ────────────── */

test("GET results surfaces latest run + freshness; rerun creates a distinct run", async () => {
  const { challenge } = await seedMatchingScenario(serverCtx.client);
  await runMatching(serverCtx.client, challenge.id);

  const g = await serverCtx.client("GET", `/challenges/${challenge.id}/matching/results`, { userId: "admin-a" });
  assert.equal(g.status, 200);
  assert.ok(g.body.run, "latest run present");
  assert.equal(g.body.results.length, 3);
  assert.ok(typeof g.body.freshness.stale === "boolean", "freshness/stale flag surfaced");

  const runs = await serverCtx.client("GET", `/challenges/${challenge.id}/matching/runs`, { userId: "admin-a" });
  assert.ok(runs.body.runs.length >= 1);

  const rerun = await serverCtx.client("POST", `/matching-runs/${g.body.run.id}/rerun`, { userId: "admin-a", body: {} });
  assert.equal(rerun.status, 201);
  assert.notEqual(rerun.body.id, g.body.run.id, "rerun(s) are new immutable runs");

  const single = await serverCtx.client("GET", `/matching-runs/${g.body.run.id}`, { userId: "admin-a" });
  assert.equal(single.status, 200);
  assert.equal(single.body.results.length, 3, "old run fully preserved");
});

test("result detail, explanation and evidence are readable through dedicated endpoints", async () => {
  const { challenge, medflow } = await seedMatchingScenario(serverCtx.client);
  const r = await runMatching(serverCtx.client, challenge.id);
  const resultId = r.body.results.find((x) => x.startupId === medflow.id).id;

  const detail = await serverCtx.client("GET", `/matching-results/${resultId}`, { userId: "admin-a" });
  assert.equal(detail.status, 200);
  assert.ok(Array.isArray(detail.body.dimensions) && detail.body.dimensions.length >= 1);
  assert.equal(detail.body.startup.brandName, "MedFlow");

  const expl = await serverCtx.client("GET", `/matching-results/${resultId}/explanation`, { userId: "admin-a" });
  assert.equal(expl.status, 200);
  assert.ok(Array.isArray(expl.body.strengths), "strengths surfaced");
  assert.ok(Array.isArray(expl.body.gaps), "gaps surfaced");
  assert.ok(Array.isArray(expl.body.riskFlags));

  const ev = await serverCtx.client("GET", `/matching-results/${resultId}/evidence`, { userId: "admin-a" });
  assert.equal(ev.status, 200);
  assert.ok(Array.isArray(ev.body.links), "evidence links surfaced");
});

/* ────────────── Parts 35-36 — shortlist + human actions ────────────── */

test("human shortlist: add → audit → remove, with full action trail", async () => {
  const { client, challenge, medflow } = await seedMatchingScenario(serverCtx.client);
  const r = await runMatching(client, challenge.id);
  const result = r.body.results.find((x) => x.startupId === medflow.id);
  assert.ok(result, "MedFlow is ranked and shortlistable");

  const add = await client("POST", `/matching-results/${result.id}/shortlist`, { userId: "admin-a", body: { manualRank: 1, note: "top candidate (demo)" } });
  assert.equal(add.status, 201);
  assert.equal(add.body.removed, false);

  const list = await client("GET", `/challenges/${challenge.id}/matching/shortlist`, { userId: "admin-a" });
  assert.equal(list.status, 200);
  assert.equal(list.body.shortlists.length, 1);
  assert.equal(list.body.shortlists[0].startupId, medflow.id);
  assert.ok(list.body.actions.some((a) => a.action === "SHORTLISTED"), "SHORTLISTED human action recorded");

  const results = await client("GET", `/challenges/${challenge.id}/matching/results`, { userId: "admin-a" });
  assert.equal(results.body.shortlists.length, 1);
  const shortId = results.body.shortlists[0].startupId ?? results.body.shortlists[0].id;
  assert.equal(shortId, medflow.id);

  const audit = await client("GET", `/audit?organizationId=${medflow.organizationId}&entityType=MATCHING_RESULT`, { userId: "admin-a" });
  assert.ok(audit.body.events.some((e) => e.action === "MATCHING_SHORTLISTED"), "shortlisting audited");

  const remove = await client("DELETE", `/matching-results/${result.id}/shortlist`, { userId: "admin-a", body: { reason: "moved to reserve list" } });
  assert.equal(remove.body.removed, true);
  const after = await client("GET", `/challenges/${challenge.id}/matching/shortlist`, { userId: "admin-a" });
  assert.equal(after.body.shortlists.length, 0, "soft-deleted from active shortlist");
  assert.ok(after.body.actions.some((a) => a.action === "REMOVED"), "REMOVED human action recorded");
});

test("human override can reorder the shortlist without touching the AI ranking", async () => {
  const { client, challenge, medflow } = await seedMatchingScenario(serverCtx.client);
  const r = await runMatching(client, challenge.id);
  const result = r.body.results.find((x) => x.startupId === medflow.id);
  await client("POST", `/matching-results/${result.id}/shortlist`, { userId: "admin-a", body: { manualRank: 2 } });

  const override = await client("POST", `/matching-results/${result.id}/override`, {
    userId: "admin-a",
    body: { action: "REORDER", originalRank: 1, newRank: 1, reason: "confirmed by committee (demo)" },
  });
  assert.equal(override.status, 201);
  assert.equal(override.body.action, "REORDER");

  const list = await client("GET", `/challenges/${challenge.id}/matching/shortlist`, { userId: "admin-a" });
  assert.equal(list.body.shortlists[0].startupId, medflow.id);
  assert.ok(list.body.actions.some((a) => a.action === "REORDER"));
});

test("re-adding a previously removed shortlist reactivates it (no duplicates)", async () => {
  const { client, challenge } = await seedMatchingScenario(serverCtx.client);
  const r = await runMatching(client, challenge.id);
  const result = r.body.results[0];
  await client("POST", `/matching-results/${result.id}/shortlist`, { userId: "admin-a", body: {} });
  await client("DELETE", `/matching-results/${result.id}/shortlist`, { userId: "admin-a", body: {} });
  const again = await client("POST", `/matching-results/${result.id}/shortlist`, { userId: "admin-a", body: {} });
  assert.equal(again.status, 201);
  const list = await client("GET", `/challenges/${challenge.id}/matching/shortlist`, { userId: "admin-a" });
  assert.equal(list.body.shortlists.length, 1);
});

/* ────────────── Part 33 — security ═───────────── */

test("cross-org users can READ decision-support outcomes but never WRITE", async () => {
  const { client, challenge, medflow } = await seedMatchingScenario(serverCtx.client);
  const r = await runMatching(client, challenge.id);
  const resultId = r.body.results[0].id;

  const readByOtherGov = await client("GET", `/matching-results/${resultId}`, { userId: "admin-b" });
  assert.equal(readByOtherGov.status, 200, "government officers may read matching (decision support)");

  const resultsByOtherGov = await client("GET", `/challenges/${challenge.id}/matching/results`, { userId: "admin-b" });
  assert.equal(resultsByOtherGov.status, 200);

  const writeByOtherGov = await client("POST", `/challenges/${challenge.id}/matching/run`, { userId: "admin-b", body: {} });
  assert.equal(writeByOtherGov.status, 403, "non-member cannot trigger a run");

  const shortByOtherGov = await client("POST", `/matching-results/${resultId}/shortlist`, { userId: "admin-b", body: {} });
  assert.equal(shortByOtherGov.status, 403, "non-member cannot shortlist");

  /* a completely unrelated (non-government, non-member) user is denied everything */
  const orgC = await client("POST", "/organizations", {
    userId: "admin-c",
    body: { orgType: "STARTUP", name: "Unrelated Vendor Co" },
  });
  assert.equal(orgC.status, 201);
  const forbidden = await client("GET", `/matching-results/${resultId}`, { userId: "admin-c" });
  assert.equal(forbidden.status, 403, "unrelated actor cannot read matching results");
});

test("startup members can view their own matching result but not the pool", async () => {
  const { client, challenge } = await seedMatchingScenario(serverCtx.client);

  const orgS = await client("POST", "/organizations", {
    userId: "admin-s",
    body: { orgType: "STARTUP", name: "CareFirst Healthtech Pvt Ltd" },
  });
  assert.equal(orgS.status, 201);
  const startup = await client("POST", "/startups", {
    userId: "admin-s",
    body: { organizationId: orgS.body.id, legalName: "CareFirst Healthtech Pvt Ltd", brandName: "CareFirst", dpiitStatus: "REGISTERED", gstStatus: "REGISTERED", sector: "health", isDemo: true },
  });
  assert.equal(startup.status, 201, "startup created by its own org");
  await addCapability(client, startup.body.id, "healthtech", "admin-s");
  await addCapability(client, startup.body.id, "ai", "admin-s");
  await client("POST", "/eligibility/check/advanced", { userId: "admin-a", body: { challengeId: challenge.id, startupId: startup.body.id } });

  const r = await runMatching(client, challenge.id);
  const mine = r.body.results.find((x) => x.startupId === startup.body.id);
  assert.ok(mine, "newly eligible startup is ranked");

  const own = await client("GET", `/matching-results/${mine.id}`, { userId: "admin-s" });
  assert.equal(own.status, 200, "startup admin can read own matching result");
  const pool = await client("GET", `/challenges/${challenge.id}/matching/results`, { userId: "admin-s" });
  assert.equal(pool.status, 403, "startup org cannot read the full ranked pool");
});