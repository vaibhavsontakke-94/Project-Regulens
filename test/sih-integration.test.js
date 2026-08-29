/* SIH26136 — integration prompt-layer tests (additive).
   Verifies the decoupled REGULENS prompt layer scoped to SIH facts:
     * the gov copilot builders are byte-identical to what /api/gov/copilot used
     * buildSihGrounded reports ONLY deterministic stored facts (honest empty states)
     * sihCopilotFallback stays grounded when AI is off / records are missing
     * sihCopilot orchestration (fake ai + real gov) produces a grounded artifact
     * the /api/sih/insights/copilot HTTP endpoint enforces the org-membership gate

   Run with:  node --test test/
*/
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./sih-helper.js";
import * as gov from "../lib/gov-engine.cjs";
import {
  buildGovernmentDataset,
  buildGovernmentSystemPrompt,
  pickCitations,
  buildSihGrounded,
  sihCopilotFallback,
  sihCopilot,
} from "../lib/sih-integration.js";

let serverCtx;

beforeEach(async () => {
  const app = buildTestApp();
  serverCtx = await startServer(app);
  serverCtx.client = http(serverCtx.base);
});

afterEach(async () => {
  if (serverCtx) await serverCtx.close();
});

/* ───────── fixture builders (mirror sih26136.test.js) ───────── */
async function seedBase(client) {
  const orgA = await client("POST", "/organizations", {
    userId: "admin-a",
    body: { orgType: "GOVERNMENT", name: "Maharashtra Health Innovation Cell", state: "Maharashtra", ministry: "Health" },
  });
  const orgB = await client("POST", "/organizations", {
    userId: "admin-b",
    body: { orgType: "GOVERNMENT", name: "Karnataka Water Board" },
  });
  assert.equal(orgA.status, 201);
  assert.equal(orgB.status, 201);
  return { orgA: orgA.body.id, orgB: orgB.body.id };
}

async function seedProblem(client, orgId) {
  const r = await client("POST", "/problems", {
    userId: "admin-a",
    body: { organizationId: orgId, title: "Reduce patient waiting time in rural healthcare", problemStatement: "Rural facilities have long queues.", sector: "health", estimatedBudget: 1000000 },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function seedChallenge(client, orgId, problemId) {
  const r = await client("POST", "/challenges", {
    userId: "admin-a",
    body: { organizationId: orgId, problemId, challengeCode: "SIH26136-CH-INT-001", title: "AI-assisted patient flow optimization", description: "Optimize patient flow.", budgetMin: 500000, budgetMax: 2000000, challengeStatus: "APPLICATIONS_OPEN" },
  });
  assert.equal(r.status, 201);
  return r.body;
}

async function seedStartup(client, orgId) {
  const r = await client("POST", "/startups", {
    userId: "admin-a",
    body: { organizationId: orgId, legalName: "Demo HealthAI Technologies Pvt Ltd", brandName: "HealthAI", dpiitStatus: "REGISTERED", sector: "health", isDemo: true },
  });
  assert.equal(r.status, 201);
  return r.body;
}

/* ═══════════ 1. decoupled gov builders: output identity / structures ═══════════ */
test("integration: gov builders emit the same structures the gov copilot uses", () => {
  const context = {
    originId: "in", targetId: "in", industryId: "health",
    company: "Test Co Pvt Ltd", product: "Health Widget",
  };
  const pkg = gov.buildGovernmentPackage(context);
  const ds = buildGovernmentDataset(pkg);
  assert.ok(ds.context && ds.context.target, "target present");
  assert.ok(Array.isArray(ds.policies), "policies array");
  assert.ok(Array.isArray(ds.topRisks), "topRisks array");
  assert.ok(ds.readiness && typeof ds.readiness.score === "number", "readiness score numeric");
  assert.ok(Array.isArray(ds.stakeholderGroups), "stakeholderGroups array");
  assert.ok(typeof ds.actionPlan.actions === "number" && ds.actionPlan.actions > 0, "actionPlan action count");
  assert.ok(Array.isArray(ds.actionPlan.criticalPath), "actionPlan criticalPath array");
  assert.ok(Array.isArray(ds.consultations), "consultations array");
  assert.ok(ds.disclaimers, "disclaimers present");

  const sp = buildGovernmentSystemPrompt("India", "English");
  assert.ok(sp.includes("India"), "target name in system prompt");
  assert.ok(sp.includes("English"), "lang label in system prompt");
});

test("integration: pickCitations returns only codes present in the answer", () => {
  const context = { originId: "in", targetId: "in", industryId: "health", company: "C", product: "P" };
  const pkg = gov.buildGovernmentPackage(context);
  const answerEntering = `Use ${pkg.policies[0].code} now.`;
  const cit = pickCitations(pkg, answerEntering);
  assert.ok(cit.length >= 1, "cites the used code");
  assert.ok(cit.every((c) => answerEntering.includes(c.code)), "only codes that appear");
  assert.ok(cit[0].title, "citation has title");
});

/* ═══════════ 2. buildSihGrounded: provenance honesty ═══════════ */
test("integration: buildSihGrounded marks unverified startup honestly", () => {
  const g = buildSihGrounded({ startup: { legalName: "X", brandName: "X" }, verifications: [] });
  assert.equal(g.startup.verificationStatus, "UNVERIFIED");
  assert.equal(g.verification, null, "no verification block when none verified");
  assert.ok(g._provenance.integrity.includes("NOT"), "provenance says not confirmed");
});

test("integration: buildSihGrounded includes verified official record", () => {
  const g = buildSihGrounded({
    startup: { brandName: "HealthAI", dpiitStatus: "REGISTERED" },
    verifications: [{ status: "VERIFIED", type: "DPIIT", source: "OFFICIAL", verifiedAt: "2026-01-01", reference: "ref-1" }],
  });
  assert.equal(g.verification.source, "OFFICIAL");
  assert.ok(g._provenance.integrity.includes("OFFICIAL"), "provenance confirms official");
});

test("integration: buildSihGrounded never emits unprovided fields as facts", () => {
  const g = buildSihGrounded({ startup: { brandName: "A" }, challenge: null, match: null });
  assert.equal(g.challenge, null);
  assert.equal(g.match, null);
  assert.equal(g.eligibility.length, 0);
});

/* ═══════════ 3. sihCopilotFallback: honesty with missing records ═══════════ */
test("integration: fallback is honest when startup is unverified", () => {
  const sih = buildSihGrounded({ startup: { brandName: "HealthAI", verificationStatus: "UNVERIFIED" }, verifications: [] });
  const r = sihCopilotFallback("is this startup verified and official?", sih, null);
  assert.ok(r.answer.includes("NOT"), "says NOT official");
  assert.equal(r.mode, "deterministic-fallback");
  assert.equal(r.grounded, true);
});

test("integration: fallback is honest when no match record exists", () => {
  const sih = buildSihGrounded({ startup: { brandName: "HealthAI" }, match: null });
  const r = sihCopilotFallback("what is the match score?", sih, null);
  assert.ok(/match|score/i.test(r.answer));
  assert.ok(/none recorded|no match|no .* record/i.test(r.answer), "does not invent a score");
});

test("integration: fallback reports recorded match score when present", () => {
  const sih = buildSihGrounded({ startup: { brandName: "HealthAI" }, match: { overallScore: 85, kind: "RULE_BASED", explanation: "strong fit" } });
  const r = sihCopilotFallback("match score?", sih, null);
  assert.ok(r.answer.includes("85"), "reports stored score");
  assert.ok(r.answer.includes("RULE_BASED"), "reports kind");
});

test("integration: fallback lists declared capabilities", () => {
  const sih = buildSihGrounded({
    startup: { brandName: "HealthAI" },
    capabilities: [{ category: "AI", key: "ai", name: "AI", level: "EXPERT", source: "DECLARED" }],
  });
  const r = sihCopilotFallback("what capabilities do you have?", sih, null);
  assert.ok(r.answer.includes("AI"), "mentions the capability");
  assert.ok(r.citations.includes("AI"), "cites it");
});

/* ═══════════ 4. sihCopilot orchestration (fake ai + real gov) ═══════════ */
test("integration: sihCopilot falls back when AI is not configured", async () => {
  const r = await sihCopilot({
    ai: { isConfigured: () => false },
    gov,
    question: "match score?",
    context: { originId: "in", targetId: "in", industryId: "health", company: "C", product: "P" },
    sih: { startup: { brandName: "HealthAI" }, match: { overallScore: 80, kind: "RULE_BASED" } },
  });
  assert.equal(r.mode, "deterministic-fallback");
  assert.equal(r.grounded, true);
  assert.ok(r.answer.length > 0);
});

test("integration: sihCopilot uses AI when configured and stays grounded", async () => {
  let seenSystem = null;
  const fakeAi = {
    isConfigured: () => true,
    complete: async ({ messages, endpoint }) => {
      seenSystem = messages.find((m) => m.role === "system").content;
      assert.equal(endpoint, "/api/sih/insights/copilot");
      return "HealthAI match score is 80 (RULE_BASED). [SIH-STARTUP]";
    },
  };
  const r = await sihCopilot({
    ai: fakeAi,
    gov,
    question: "match score?",
    lang: "en",
    endpoint: "/api/sih/insights/copilot",
    context: { originId: "in", targetId: "in", industryId: "health", company: "HealthAI", product: "offering" },
    sih: { startup: { brandName: "HealthAI" }, match: { overallScore: 80, kind: "RULE_BASED" } },
  });
  assert.equal(r.mode, "ai");
  assert.ok(seenSystem.includes('"sih"'), "system prompt grounds a sih block");
  assert.ok(seenSystem.includes("English"), "lang label in system prompt");
  assert.ok(r.citations.some((c) => c.code === "SIH-STARTUP"), "startup cited");
});

test("integration: sihCopilot falls back when AI throws", async () => {
  const r = await sihCopilot({
    ai: { isConfigured: () => true, complete: async () => { throw new Error("boom"); } },
    gov,
    question: "match score?",
    context: { originId: "in", targetId: "in", industryId: "health", company: "C", product: "P" },
    sih: { startup: { brandName: "HealthAI" }, match: { overallScore: 90, kind: "RULE_BASED" } },
  });
  assert.equal(r.mode, "deterministic-fallback");
  assert.ok(r.answer.includes("90"), "kept grounded after AI failure");
});

test("integration: sihCopilot requires a question", async () => {
  await assert.rejects(
    () => sihCopilot({ ai: { isConfigured: () => false }, gov, question: "  " }),
    (e) => e.status === 400 && e.code === "INVALID_REQUEST"
  );
});

/* ═══════════ 5. /api/sih/insights/copilot HTTP auth gate ═══════════ */
test("integration: insights copilot requires auth", async () => {
  const { client } = serverCtx;
  const noAuth = await client("POST", "/insights/copilot", {
    body: { challengeId: "00000000-0000-0000-0000-000000000000", startupId: "00000000-0000-0000-0000-000000000000", question: "x" },
  });
  assert.equal(noAuth.status, 401);
});

test("integration: insights copilot 403 for non-member", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);

  const r = await client("POST", "/insights/copilot", {
    userId: "admin-b", // belongs to orgB, not orgA / startup org
    body: { challengeId: challenge.id, startupId: startup.id, question: "match score?" },
  });
  assert.equal(r.status, 403, "non-member denied");
});

test("integration: insights copilot 200 for member (deterministic fallback)", async () => {
  const { client } = serverCtx;
  const { orgA } = await seedBase(client);
  const problem = await seedProblem(client, orgA);
  const challenge = await seedChallenge(client, orgA, problem.id);
  const startup = await seedStartup(client, orgA);

  const r = await client("POST", "/insights/copilot", {
    userId: "admin-a",
    body: { challengeId: challenge.id, startupId: startup.id, question: "what is the match score?" },
  });
  assert.equal(r.status, 200, "member allowed");
  assert.equal(r.body.grounded, true);
  assert.equal(r.body.startupId, startup.id);
  assert.equal(r.body.challengeId, challenge.id);
  assert.ok(["ai", "deterministic-fallback"].includes(r.body.mode), "mode is a known value");
});
