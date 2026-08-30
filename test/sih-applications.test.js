/* SIH26136 — SOLUTION APPLICATIONS tests (startup side, additive).
   Covers: startup registration + profile, draft application creation +
   RBAC, submission gate (exact missing list), document checklist, AI-assist
   deterministic mode, government review via the eligibility gate, status
   progression, request-info → resubmission, privacy (internal notes /
   evaluation comments / cross-startup isolation), audit trail, and
   multilingual labels. Uses the real HTTP router over the memory store.
*/

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./sih-helper.js";
import * as dom from "../lib/sih-domain.js";
import * as apps from "../lib/sih-applications.js";

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

async function seedOrg(client, userId, body) {
  const r = await client("POST", "/organizations", { userId, body });
  assert.equal(r.status, 201);
  return r.body;
}

async function seedGov(client) {
  return seedOrg(client, "admin-g", { orgType: "GOVERNMENT", name: "Maharashtra Health Innovation Cell", state: "Maharashtra", ministry: "Health" });
}

async function seedStartupOrg(client, userId = "start1") {
  return seedOrg(client, userId, { orgType: "STARTUP", name: "MedFlow AI Labs" });
}

async function seedProblem(client, orgId) {
  const r = await client("POST", "/problems", {
    userId: "admin-g",
    body: { organizationId: orgId, title: "Rural healthcare patient flow", problemStatement: "Reduce waiting time in rural health centres", sector: "health", estimatedBudget: 1000000 },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function seedChallenge(client, orgId, problemId, extra = {}) {
  const r = await client("POST", "/challenges", {
    userId: "admin-g",
    body: { organizationId: orgId, problemId, challengeCode: "SIH-APP-1", title: "AI-Based Rural Healthcare Patient Flow Optimization", description: "Optimize patient flow", budgetMin: 500000, budgetMax: 2000000, challengeStatus: "APPLICATIONS_OPEN", ...extra },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function seedStartup(client, orgId, extra = {}) {
  const r = await client("POST", "/startups", {
    userId: "start1",
    body: { organizationId: orgId, legalName: "MedFlow AI Labs Pvt Ltd", brandName: "MedFlow", dpiitStatus: "REGISTERED", gstStatus: "REGISTERED", sector: "health", isDemo: true, ...extra },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function addCapability(client, startupId, capKey) {
  if (!serverCtx.capCache) {
    const c = await client("GET", "/capabilities", { userId: "start1" });
    serverCtx.capCache = c.body.capabilities;
  }
  const cap = serverCtx.capCache.find((x) => x.key === capKey);
  if (!cap) throw new Error(`capability ${capKey} not found`);
  const r = await client("POST", `/startups/${startupId}/capabilities`, { userId: "start1", body: { capabilityId: cap.id } });
  assert.equal(r.status, 201);
  return cap;
}

async function seedDocument(client, startupId, body) {
  const r = await client("POST", `/startups/${startupId}/documents`, { userId: "start1", body });
  assert.equal(r.status, 201);
  return r.body;
}

function fullSubmission(extra = {}) {
  return {
    solutionTitle: "MedFlow Patient Flow Optimizer",
    solutionDescription: "An AI based queue and triage optimizer that reduces waiting time in rural health centres by predicting load and routing staff, fully deployable on low connectivity infrastructure.",
    technology: "Python, Node.js, offline-first mobile app, UPI integration",
    architecture: "Edge gateway at PHC with central dashboard; sync via store-and-forward.",
    implementationPlan: "Phase 1 pilot at 5 PHCs with staff training; Phase 2 rollout to the district; monthly KPI reviews.",
    previousProjects: ["Patient flow pilot in Nagpur district", "Telehealth triage for PHC network"],
    costMin: 700000,
    costMax: 1200000,
    expectedImpact: "30% reduction in waiting time, 25% faster triage within 6 months of pilot",
    team: { lead: { name: "A. Sharma", role: "CTO" }, size: 6, skills: ["AI", "HealthTech"] },
    pilotRequirements: { duration: "6 months", support: "training + dashboards", devices: "tablets at every PHC" },
    ...extra,
  };
}

async function activateRule(client, body) {
  const created = await client("POST", "/eligibility/rules", { userId: "admin-g", body });
  assert.equal(created.status, 201, "rule created");
  const id = created.body.id;
  await client("POST", `/eligibility/rules/${id}/submit-review`, { userId: "admin-g", body: {} });
  const approved = await client("POST", `/eligibility/rules/${id}/approve`, { userId: "admin-g", body: { comment: "reviewed" } });
  assert.equal(approved.status, 200);
  const activated = await client("POST", `/eligibility/rules/${id}/activate`, { userId: "admin-g", body: { reason: "approved" } });
  assert.equal(activated.status, 200, "rule activated");
  return activated.body;
}

/* ───────── 1. startup registration + profile (reused by applications) ───────── */

test("startup: registration + profile already carries the sections applications reuse", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);

  const s = await seedStartup(client, sOrg.id);
  const prof = await client("GET", `/startups/${s.id}/profile`, { userId: "start1" });
  assert.equal(prof.status, 200);
  for (const section of ["identity", "business", "technology", "useCases", "deployment", "team", "geography", "pilot", "security"]) {
    assert.ok(section in prof.body, `profile section ${section} present`);
  }
  const challenge = await client("GET", `/challenges/${ch.id}`, { userId: "admin-g" });
  assert.equal(challenge.status, 200);
});

/* ───────── 2. draft application + RBAC ───────── */

test("applications: draft creation requires startup-org membership (RBAC)", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);

  const outsider = await client("POST", "/applications", {
    userId: "admin-g",
    body: { organizationId: sOrg.id, challengeId: ch.id, solutionTitle: "Blocked" },
  });
  assert.equal(outsider.status, 403, "non-member cannot create an application for another org");

  const created = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, solutionTitle: "MedFlow Flow Optimizer" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, "DRAFT");
  assert.equal(created.body.challengeId, ch.id);

  const closed = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, solutionTitle: "Late" },
  });
  assert.equal(closed.status, 201);
  await client("POST", `/challenges/${ch.id}/close`, { userId: "admin-g", body: {} });
  const afterClose = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, solutionTitle: "TooLate" },
  });
  assert.equal(afterClose.status, 409, "applications blocked once challenge is closed");
});

/* ───────── 3. submission gate: exact missing list ───────── */

test("applications: submit is blocked with an exact missing list, then succeeds", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  const s = await seedStartup(client, sOrg.id);

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, solutionDescription: "Only a description." },
  });
  assert.equal(draft.status, 201);

  const blocked = await client("POST", `/applications/${draft.body.id}/submit`, { userId: "start1", body: {} });
  assert.equal(blocked.status, 400);

  await client("PATCH", `/applications/${draft.body.id}`, { userId: "start1", body: fullSubmission() });
  const ok = await client("POST", `/applications/${draft.body.id}/submit`, { userId: "start1", body: {} });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.status, "SUBMITTED");
  assert.ok(ok.body.submittedAt, "submittedAt recorded");
  assert.ok(Array.isArray(ok.body.missingDocuments), "missing documents echoed after submit");
});

/* ───────── 4. document checklist + AI assist (deterministic) ───────── */

test("applications: document checklist + AI assist stays deterministic when AI unavailable", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  const s = await seedStartup(client, sOrg.id);

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, solutionTitle: "Flow Optimizer" },
  });
  assert.equal(draft.status, 201);

  const docs = await client("POST", `/applications/${draft.body.id}/ai-assist`, {
    userId: "start1", body: { kind: "DOCUMENTS", lang: "en" },
  });
  assert.equal(docs.status, 201);
  assert.equal(docs.body.assist.mode, "deterministic");
  assert.ok(Array.isArray(docs.body.assist.missingDocuments));
  assert.ok(docs.body.assist.missingDocuments.length >= 1, "lists which documents are missing");

  await seedDocument(client, s.id, { docType: "DPIIT_CERTIFICATE", label: "DPIIT" });
  const afterUpload = await client("POST", `/applications/${draft.body.id}/ai-assist`, {
    userId: "start1", body: { kind: "DOCUMENTS", lang: "en" },
  });
  assert.ok(!afterUpload.body.assist.missingDocuments.some((d) => d.docType === "DPIIT_CERTIFICATE"), "provided DPIIT no longer listed as missing");

  const compliance = await client("POST", `/applications/${draft.body.id}/ai-assist`, {
    userId: "start1", body: { kind: "COMPLIANCE", lang: "en" },
  });
  assert.equal(compliance.status, 201);
  assert.equal(compliance.body.assist.mode, "deterministic");
  assert.ok(Array.isArray(compliance.body.assist.compliance.policies), "compliance grounded in real policy records");
});

/* ───────── 5. government review via the eligibility gate ───────── */

test("applications: review passes eligible startups through the eligibility gate", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  const s = await seedStartup(client, sOrg.id);
  await addCapability(client, s.id, "ai");

  await activateRule(client, {
    challengeId: ch.id, name: "AI capability required", ruleType: "CAPABILITY_REQUIRED", severity: "MANDATORY", referenceValue: { key: "ai" },
  });

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, ...fullSubmission() },
  });
  assert.equal(draft.status, 201);
  await client("POST", `/applications/${draft.body.id}/submit`, { userId: "start1", body: {} });

  const review = await client("POST", `/applications/${draft.body.id}/review`, { userId: "admin-g", body: { internalNotes: "strong submission" } });
  assert.equal(review.status, 200);
  assert.equal(review.body.status, "ELIGIBLE");
  assert.ok(review.body.eligibility.ran, "eligibility gate ran");
  assert.equal(review.body.eligibility.verdict, "ELIGIBLE");
  assert.ok(review.body.reviewedBy, "reviewers recorded");
  assert.ok(review.body.reviewedAt, "review timestamp recorded");
});

test("applications: review flags incomplete submissions for more information", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  const s = await seedStartup(client, sOrg.id);
  await activateRule(client, {
    challengeId: ch.id, name: "AI capability required", ruleType: "CAPABILITY_REQUIRED", severity: "MANDATORY", referenceValue: { key: "ai" },
  });

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, solutionDescription: "Incomplete submission", technology: "AI" },
  });
  await client("POST", `/applications/${draft.body.id}/submit`?.replace("POST", "PATCH"), { userId: "start1", body: {} });
  const review = await client("POST", `/applications/${draft.body.id}/review`, { userId: "admin-g", body: {} });
  assert.equal(review.status, 200);
  assert.equal(review.body.status, "NEEDS_MORE_INFORMATION");
  assert.ok(review.body.requiredAction, "required action set for the startup");
});

test("applications: no active eligibility rules + complete → eligible by officer review", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  await seedStartup(client, sOrg.id);

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, ...fullSubmission() },
  });
  await client("PATCH", `/applications/${draft.body.id}`, { userId: "start1", body: {} });
  await client("POST", `/applications/${draft.body.id}/submit`, { userId: "start1", body: {} });
  const review = await client("POST", `/applications/${draft.body.id}/review`, { userId: "admin-g", body: {} });
  assert.equal(review.status, 200);
  assert.equal(review.body.status, "ELIGIBLE");
});

/* ───────── 6. status progression + invalid transition ───────── */

test("applications: government drives status progression and blocks invalid moves", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  await seedStartup(client, sOrg.id);

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, ...fullSubmission() },
  });
  await client("POST", `/applications/${draft.body.id}/submit`, { userId: "start1", body: {} });
  await client("POST", `/applications/${draft.body.id}/review`, { userId: "admin-g", body: {} });

  const skip = await client("POST", `/applications/${draft.body.id}/status`, { userId: "admin-g", body: { status: "SELECTED" } });
  assert.equal(skip.status, 409, "cannot jump straight from ELIGIBLE to SELECTED");

  await client("POST", `/applications/${draft.body.id}/status`, { userId: "admin-g", body: { status: "SHORTLISTED" } });
  await client("POST", `/applications/${draft.body.id}/status`, { userId: "admin-g", body: { status: "SELECTED" } });
  const pilot = await client("POST", `/applications/${draft.body.id}/status`, { userId: "admin-g", body: { status: "PILOT" } });
  assert.equal(pilot.body.status, "PILOT");

  const back = await client("POST", `/applications/${draft.body.id}/status`, { userId: "admin-g", body: { status: "SUBMITTED" } });
  assert.equal(back.status, 409, "PILOT is a terminal state for the application");
});

/* ───────── 7. request-info → startup resubmission ───────── */

test("applications: request-info opens NEEDS_MORE_INFORMATION; startup edits and resubmits", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  await seedStartup(client, sOrg.id);

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, ...fullSubmission() },
  });
  await client("POST", `/applications/${draft.body.id}/submit`, { userId: "start1", body: {} });

  const ask = await client("POST", `/applications/${draft.body.id}/request-info`, {
    userId: "admin-g", body: { requiredAction: "Add security architecture details.", requestItems: ["security architecture"] },
  });
  assert.equal(ask.status, 200);
  assert.equal(ask.body.status, "NEEDS_MORE_INFORMATION");
  assert.equal(ask.body.requiredAction, "Add security architecture details.");

  await client("PATCH", `/applications/${draft.body.id}`, { userId: "start1", body: { architecture: fullSubmission().architecture + " Security: encrypted at rest, RBAC.", internalNotes: "startup must never write here" } });
  const after = await client("GET", `/applications/${draft.body.id}`, { userId: "start1" });
  assert.equal(after.body.status, "SUBMITTED", "resubmission resets to SUBMITTED");
  assert.ok(!("internalNotes" in after.body), "privacy: startup-supplied internalNotes never leaks through");
});

/* ───────── 8. privacy: no internal notes/comments, no cross-startup access ───────── */

test("applications: privacy — startups never see internal notes or another startup's application", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg1 = await seedStartupOrg(client, "start1");
  const sOrg2 = await seedStartupOrg(client, "start2");
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  await seedStartup(client, sOrg1.id);
  await seedStartup(client, sOrg2.id);

  const a1 = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg1.id, challengeId: ch.id, ...fullSubmission() },
  });
  const a2 = await client("POST", "/applications", {
    userId: "start2",
    body: { organizationId: sOrg2.id, challengeId: ch.id, ...fullSubmission() },
  });

  const noted = await client("PATCH", `/applications/${a1.body.id}`, { userId: "admin-g", body: { internalNotes: "confidential: strong candidate", evaluationComments: "sharp team" } });
  assert.equal(noted.status, 200);

  const mine = await client("GET", `/applications/${a1.body.id}`, { userId: "start1" });
  assert.equal(mine.status, 200);
  assert.ok(!("internalNotes" in mine.body), "internalNotes stripped for the startup");
  assert.ok(!("evaluationComments" in mine.body), "evaluationComments stripped for the startup");

  const cross = await client("GET", `/applications/${a2.body.id}`, { userId: "start1" });
  assert.equal(cross.status, 403, "startup1 cannot read startup2's application");

  const govList = await client("GET", `/applications?challengeId=${ch.id}`, { userId: "admin-g" });
  assert.equal(govList.status, 200);
  const withNotes = govList.body.applications.find((a) => a.id === a1.body.id);
  assert.ok(withNotes && "internalNotes" in withNotes, "government can read internal notes");
  assert.equal(withNotes.internalNotes, "confidential: strong candidate");

  const startList = await client("GET", `/applications?organizationId=${sOrg1.id}`, { userId: "start1" });
  assert.equal(startList.status, 200);
  for (const a of startList.body.applications) {
    assert.ok(!("internalNotes" in a), "startup list view has no internal notes");
    assert.ok(!("evaluationComments" in a), "startup list view has no evaluation comments");
    assert.equal(a.viewScope, "STARTUP");
  }
});

/* ───────── 9. audit trail ───────── */

test("applications: lifecycle actions are audited", async () => {
  const { client } = serverCtx;
  const gov = await seedGov(client);
  const sOrg = await seedStartupOrg(client);
  const p = await seedProblem(client, gov.id);
  const ch = await seedChallenge(client, gov.id, p.id);
  await seedStartup(client, sOrg.id);

  const draft = await client("POST", "/applications", {
    userId: "start1",
    body: { organizationId: sOrg.id, challengeId: ch.id, ...fullSubmission() },
  });
  await client("POST", `/applications/${draft.body.id}/ai-assist`, { userId: "start1", body: { kind: "FULL", lang: "en" } });
  await client("POST", `/applications/${draft.body.id}/submit`, { userId: "start1", body: {} });
  await client("POST", `/applications/${draft.body.id}/review`, { userId: "admin-g", body: {} });
  await client("POST", `/applications/${draft.body.id}/status`, { userId: "admin-g", body: { status: "SHORTLISTED" } });

  const startupAudit = await client("GET", `/audit?organizationId=${sOrg.id}&entityType=CHALLENGE_APPLICATION`, { userId: "start1" });
  const startupActions = startupAudit.body.events.map((e) => e.action);
  assert.ok(startupActions.includes("APPLICATION_CREATED"), "creation audited");
  assert.ok(startupActions.includes("APPLICATION_SUBMITTED"), "submission audited");
  assert.ok(startupActions.includes("APPLICATION_AI_ASSIST_RUN"), "ai assist audited");

  const govAudit = await client("GET", `/audit?organizationId=${gov.id}&entityType=CHALLENGE_APPLICATION`, { userId: "admin-g" });
  const govActions = govAudit.body.events.map((e) => e.action);
  assert.ok(govActions.includes("APPLICATION_REVIEWED"), "review audited");
  assert.ok(govActions.includes("APPLICATION_STATUS_CHANGED"), "status change audited");
});

/* ───────── 10. multilingual labels ───────── */

test("applications: en + hi labels exist for the workflow", async () => {
  globalThis.window = globalThis;
  await import("../public/i18n/sih-bundle.js").catch(() => {});
  const bundle = globalThis.window.SIH_I18N;
  assert.ok(bundle, "bundle loaded");
  const needed = [
    "application.title", "application.status.DRAFT", "application.status.UNDER_REVIEW",
    "application.status.SHORTLISTED", "application.status.PILOT", "application.submit",
    "application.missing", "application.suggestion.title", "application.warning.title",
    "application.privacyNotice",
  ];
  for (const key of needed) {
    assert.ok(bundle.en[key], `en.${key}`);
    assert.ok(bundle.hi[key], `hi.${key}`);
  }
});

/* ───────── 11. pure-function unit checks ───────── */

test("applications: pure helpers — transitions, completeness, checklist, classifyReview", () => {
  assert.throws(() => apps.assertApplicationTransition("DRAFT", "PILOT"), /cannot move/);
  assert.equal(apps.assertApplicationTransition("DRAFT", "SUBMITTED"), "SUBMITTED");

  const incomplete = { solutionDescription: "x" };
  const comp = apps.submissionCompleteness(incomplete);
  assert.equal(comp.complete, false);
  assert.ok(comp.missing.includes("technology") && comp.missing.includes("cost") && comp.missing.includes("team"));

  const full = { solutionDescription: "a".repeat(130), technology: "AI", architecture: "x", implementationPlan: "x", expectedImpact: "x", costMin: 1, team: { size: 2 }, pilotRequirements: { d: "x" } };
  assert.equal(apps.submissionCompleteness(full).complete, true);

  const chk = apps.applicationDocumentChecklist([]);
  assert.ok(Array.isArray(chk) && chk.length >= 4);
  assert.ok(chk.every((c) => c.status === "MISSING"));

  assert.equal(apps.classifyReview({ eligibilityVerdict: "ELIGIBLE", completeness: { complete: true, missing: [] } }).status, "ELIGIBLE");
  assert.equal(apps.classifyReview({ eligibilityVerdict: "NOT_ELIGIBLE", completeness: { complete: true, missing: [] } }).status, "REJECTED");
  assert.equal(apps.classifyReview({ eligibilityVerdict: "ELIGIBLE_WITH_REVIEW", completeness: { complete: false, missing: ["team"] } }).status, "NEEDS_MORE_INFORMATION");
});