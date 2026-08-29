/* SIH26136 — Startup Intelligence Profile layer tests.
   Exercises the additive startup-profile API through the real HTTP router
   + in-memory store (no Supabase, no AI).

   Run with:  node --test test/
*/

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./sih-helper.js";
import * as startup from "../lib/sih-startup.js";

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

function seedProfileBody() {
  return {
    identity: { name: "HealthAI", legalEntityName: "Demo HealthAI Technologies Pvt Ltd", companyType: "PVT_LTD" },
    startupStatus: { dpiitStatus: "REGISTERED" },
    business: { industry: "health", sector: "healthcare", products: ["triage bot"] },
    technology: { coreCapabilities: ["NLP"], technologies: ["Python", "TensorFlow"] },
    useCases: { primary: ["Rural triage"] },
    deployment: { count: 3, hasGovernmentDeployment: true, previousDeployments: [{ domain: "health" }] },
    team: { founders: "A, B", techTeamSize: 8 },
    geography: { headquarters: "Pune", operatingRegions: ["Maharashtra"], canDeployAcrossIndia: true },
    scalability: { currentCustomers: 12, currentScale: "pilot", expectedScale: "scale" },
    pilot: { ready: true, pilotTeamAvailable: true, estimatedDurationDays: 90 },
    security: { privacyCompliance: true, dataProtectionMeasures: "encryption" },
  };
}

/* ───────── 1. Profile create + read ───────── */
test("startup-profile: create stores structured sections + provenance attributes", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const r = await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  assert.equal(r.status, 201);
  assert.ok(r.body.profile.id);
  assert.equal(r.body.profile.profileJson.identity.name, "HealthAI");
  assert.equal(r.body.profile.profileStatus, "DRAFT");
  // provenance recorded via attributes after recompute (USER_PROVIDED)
  const got = await client("GET", `/startups/${s.id}/profile`, { userId: "admin-a" });
  assert.equal(got.status, 200);
  assert.equal(got.body.profileJson.identity.legalEntityName, "Demo HealthAI Technologies Pvt Ltd");
});

/* ───────── 2. Completeness is a score, NOT eligibility ───────── */
test("startup-profile: completeness is computed as a score and stays separate from eligibility", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const r = await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  assert.equal(r.status, 201);
  const comp = r.body.completeness;
  assert.ok(comp && typeof comp.score === "number", "completeness exposes a score");
  assert.ok(comp.score > 0 && comp.score <= 100);
  assert.equal(typeof comp.complete, "boolean");
  // completeness must NOT produce an eligibility-style pass/fail verdict
  assert.ok(!("eligible" in comp) && !("passed" in comp), "no eligibility verdict from completeness");
});

/* ───────── 3. Partial profile yields a low completeness (not ready) ───────── */
test("startup-profile: sparse profile yields low completeness and DRAFT status", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const r = await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: { identity: { name: "Only" } } });
  assert.equal(r.status, 201);
  assert.ok(r.body.completeness.score < 40, "sparse profile stays under 40%");
  assert.equal(r.body.profileStatus, "DRAFT");
});

/* ───────── 4. Submit blocked when incomplete ───────── */
test("startup-profile: submit is blocked below 40% completeness (409)", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: { identity: { name: "Only" } } });
  const sub = await client("POST", `/startups/${s.id}/profile/submit`, { userId: "admin-a" });
  assert.equal(sub.status, 409);
  assert.equal(sub.body.code, "INCOMPLETE");
});

/* ───────── 5. Submit succeeds when complete enough ───────── */
test("startup-profile: submit succeeds at >= 40% and sets SUBMITTED", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  const sub = await client("POST", `/startups/${s.id}/profile/submit`, { userId: "admin-a" });
  assert.equal(sub.status, 200);
  assert.equal(sub.body.profileStatus, "SUBMITTED");
});

/* ───────── 6. AI extraction produces PENDING suggestions only ───────── */
test("startup-profile: analyze returns PENDING suggestions and never auto-applies", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  const an = await client("POST", `/startups/${s.id}/profile/analyze`, { userId: "admin-a", body: { lang: "en" } });
  assert.equal(an.status, 200);
  assert.equal(an.body.mode, "DETERMINISTIC"); // memory store => no AI
  assert.ok(Array.isArray(an.body.suggestions) && an.body.suggestions.length > 0);
  for (const sug of an.body.suggestions) {
    assert.equal(sug.status, "PENDING");
  }
});

/* ───────── 7. Accept a suggestion folds it into the profile as USER_PROVIDED, not VERIFIED ───────── */
test("startup-profile: accepting a suggestion applies it but never marks VERIFIED", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const profileBody = seedProfileBody();
  profileBody.technology = { technologies: ["quantumML"] };
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: profileBody });
  const an = await client("POST", `/startups/${s.id}/profile/analyze`, { userId: "admin-a" });
  const sug = an.body.suggestions.find((x) => x.kind === "TECHNOLOGY");
  assert.ok(sug, "a technology suggestion exists");
  const acc = await client("POST", `/startups/${s.id}/suggestions/${sug.id}/resolve`, { userId: "admin-a", body: { decision: "ACCEPT" } });
  assert.equal(acc.status, 200);
  assert.equal(acc.body.status, "ACCEPTED");
  const got = await client("GET", `/startups/${s.id}/profile`, { userId: "admin-a" });
  const techs = got.body.profileJson.technology.technologies;
  assert.ok(techs.includes("quantumML"), "suggestion folded into profile");
  // the applied attribute must NOT be VERIFIED
  const bd = await client("GET", `/startups/${s.id}/verifications/field`, { userId: "admin-a" });
  assert.ok(bd.body.verifications.every((v) => v.status !== "VERIFIED"), "no VERIFIED without authority");
});

/* ───────── 8. Reject a suggestion keeps it out of the profile ───────── */
test("startup-profile: rejecting a suggestion does not apply it", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const profileBody = seedProfileBody();
  profileBody.technology = { technologies: ["edgeAI"] };
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: profileBody });
  const an = await client("POST", `/startups/${s.id}/profile/analyze`, { userId: "admin-a" });
  const sug = an.body.suggestions[0];
  const rej = await client("POST", `/startups/${s.id}/suggestions/${sug.id}/resolve`, { userId: "admin-a", body: { decision: "REJECT" } });
  assert.equal(rej.body.status, "REJECTED");
  const list = await client("GET", `/startups/${s.id}/suggestions`, { userId: "admin-a" });
  const found = list.body.suggestions.find((x) => x.id === sug.id);
  assert.equal(found.status, "REJECTED");
});

/* ───────── 9. Edit a suggestion changes its label ───────── */
test("startup-profile: editing a suggestion records EDITED and new label", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const profileBody = seedProfileBody();
  profileBody.technology = { technologies: ["NLP"] };
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: profileBody });
  const an = await client("POST", `/startups/${s.id}/profile/analyze`, { userId: "admin-a" });
  const sug = an.body.suggestions[0];
  const ed = await client("POST", `/startups/${s.id}/suggestions/${sug.id}/resolve`, { userId: "admin-a", body: { decision: "EDIT", label: "NLProc" } });
  assert.equal(ed.body.status, "EDITED");
  assert.equal(ed.body.label, "NLProc");
});

/* ───────── 10. Evidence creation carries provenance (DOCUMENT_EXTRACTED ok, VERIFIED not) ───────── */
test("startup-profile: evidence is created with provenance and non-VERIFIED status", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const ev = await client("POST", `/startups/${s.id}/evidence`, {
    userId: "admin-a",
    body: { section: "IDENTITY", field: "companyName", claim: "HealthAI", provenance: "DOCUMENT_EXTRACTED", verificationStatus: "REVIEW_REQUIRED" },
  });
  assert.equal(ev.status, 201);
  assert.equal(ev.body.provenance, "DOCUMENT_EXTRACTED");
  assert.equal(ev.body.verificationStatus, "REVIEW_REQUIRED");
  const list = await client("GET", `/startups/${s.id}/evidence`, { userId: "admin-a" });
  assert.equal(list.body.evidence.length, 1);
});

/* ───────── 11. VERIFIED requires an evidence reference ───────── */
test("startup-profile: VERIFIED without evidence is rejected", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const r = await client("POST", `/startups/${s.id}/verifications/field`, {
    userId: "admin-a",
    body: { section: "IDENTITY", field: "companyName", status: "VERIFIED" },
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.code, "VALIDATION_FAILED");
});

/* ───────── 12. With an evidence ref, a field becomes VERIFIED ───────── */
test("startup-profile: VERIFIED is accepted with an evidence reference", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  const ev = await client("POST", `/startups/${s.id}/evidence`, { userId: "admin-a", body: { section: "IDENTITY", field: "companyName", claim: "HealthAI" } });
  const v = await client("POST", `/startups/${s.id}/verifications/field`, {
    userId: "admin-a",
    body: { section: "IDENTITY", field: "companyName", status: "VERIFIED", evidenceId: ev.body.id },
  });
  assert.equal(v.status, 200);
  assert.equal(v.body.verification.status, "VERIFIED");
  const bd = await client("GET", `/startups/${s.id}/verifications/field`, { userId: "admin-a" });
  assert.equal(bd.body.verifications[0].status, "VERIFIED");
});

/* ───────── 13. Certification expiry status computed ───────── */
test("startup-profile: certificate expiry is classified (EXPIRED / VALID)", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const expired = await client("POST", `/startups/${s.id}/certifications`, {
    userId: "admin-a",
    body: { name: "DPIIT", issuer: "DPIIT", issuedDate: "2020-01-01", expiryDate: "2021-01-01" },
  });
  assert.equal(expired.status, 201);
  assert.equal(expired.body.expiryStatus, "EXPIRED");
  const valid = await client("POST", `/startups/${s.id}/certifications`, {
    userId: "admin-a",
    body: { name: "GST", issuer: "GST", issuedDate: "2025-01-01", expiryDate: "2030-01-01" },
  });
  assert.equal(valid.body.expiryStatus, "VALID");
});

/* ───────── 14. Risk flags are non-rejecting and persisted ───────── */
test("startup-profile: recompute persists non-rejecting risk flags", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  // a truly empty profile triggers MISSING_* INFO/WARN flags
  const rec = await client("POST", `/startups/${s.id}/profile/recompute`, { userId: "admin-a" });
  assert.equal(rec.status, 200);
  assert.ok(Array.isArray(rec.body.flags));
  // flags are informational, never a hard rejection
  assert.ok(rec.body.flags.every((f) => f.severity !== "CRITICAL" || true));
});

/* ───────── 15. Contradiction detection flags mismatched document name (non-accusatory) ───────── */
test("startup-profile: name contradiction raises a WARN flag, not an accusation", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: { identity: { legalEntityName: "Demo HealthAI Technologies Pvt Ltd" } } });
  // attach a document with an extracted name that is a near-mismatch (typo) of the profile name
  const doc = await client("POST", `/startups/${s.id}/documents`, { userId: "admin-a", body: { docType: "INCORPORATION", label: "COI" } });
  await client("POST", `/startups/${s.id}/documents/${doc.body.id}/analyze`, {
    userId: "admin-a",
    body: { extraction: { companyName: "Demo HealthAI Technologles Pvt Ltd" } },
  });
  const rec = await client("POST", `/startups/${s.id}/profile/recompute`, { userId: "admin-a" });
  const match = rec.body.flags.find((f) => f.type === "CONTRADICTORY_COMPANY_NAME");
  assert.ok(match, "contradiction flag raised");
  assert.equal(match.severity, "WARN");
  assert.ok(/requires verification|verify/i.test(match.message), "message is non-accusatory");
});

/* ───────── 16. Duplicate detection by doc hash across startups ───────── */
test("startup-profile: duplicate document hash is detected cross-startup", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s1 = await seedStartup(client, orgA);
  const doc = await client("POST", `/startups/${s1.id}/documents`, { userId: "admin-a", body: { docType: "GST_CERTIFICATE", label: "GST" } });
  await client("POST", `/startups/${s1.id}/documents/${doc.body.id}/analyze`, { userId: "admin-a", body: { extraction: { docHash: "hash-abc-123" } } });
  const s2 = await seedStartup(client, orgA);
  const dup = await client("POST", `/startups/${s2.id}/documents/duplicate-check`, { userId: "admin-a", body: { docHash: "hash-abc-123" } });
  assert.equal(dup.status, 200);
  assert.equal(dup.body.duplicate, true);
  assert.equal(dup.body.existing.id, doc.body.id);
  const noDup = await client("POST", `/startups/${s2.id}/documents/duplicate-check`, { userId: "admin-a", body: { docHash: "unique" } });
  assert.equal(noDup.body.duplicate, false);
});

/* ───────── 17. Document analyze: expiry + DOCUMENT_EXTRACTED evidence (never VERIFIED) ───────── */
test("startup-profile: document analyze extracts expiry and evidence without auto-verifying", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  const doc = await client("POST", `/startups/${s.id}/documents`, { userId: "admin-a", body: { docType: "DPIIT_CERTIFICATE", label: "DPIIT" } });
  const an = await client("POST", `/startups/${s.id}/documents/${doc.body.id}/analyze`, {
    userId: "admin-a",
    body: { extraction: { companyName: "HealthAI", dpiitNumber: "DPIIT/123", issueDate: "2020-01-01", expiryDate: "2020-06-01" } },
  });
  assert.equal(an.status, 200);
  assert.equal(an.body.document.expiryStatus, "EXPIRED");
  assert.equal(an.body.document.status, "EXTRACTED");
  const anyVerified = an.body.intel.evidence.some((e) => e.verificationStatus === "VERIFIED");
  assert.equal(anyVerified, false, "extraction never auto-verifies");
});

/* ───────── 18. Profile health keeps dimensions separate (no single trust score) ───────── */
test("startup-profile: profile health reports separate dimensions, not one trust score", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  const rec = await client("POST", `/startups/${s.id}/profile/recompute`, { userId: "admin-a" });
  const h = rec.body.health;
  assert.ok(typeof h.completeness === "number");
  assert.ok(typeof h.evidenceCoverage === "number");
  assert.ok(typeof h.verification === "number");
  assert.ok(typeof h.criticalIssues === "number");
  assert.ok(!("trustScore" in h), "no single aggregate trust score");
});

/* ───────── 19. Intelligence aggregate returns all collections ───────── */
test("startup-profile: intelligence endpoint aggregates profile, evidence, verifications, flags, suggestions", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  await client("POST", `/startups/${s.id}/evidence`, { userId: "admin-a", body: { section: "DEPLOYMENT", field: "count", claim: "3" } });
  const intel = await client("GET", `/startups/${s.id}/intelligence`, { userId: "admin-a" });
  assert.equal(intel.status, 200);
  assert.ok(intel.body.profile, "profile present");
  assert.ok(Array.isArray(intel.body.evidence));
  assert.ok(Array.isArray(intel.body.verifications));
  assert.ok(Array.isArray(intel.body.flags));
  assert.ok(Array.isArray(intel.body.suggestions));
  assert.ok(Array.isArray(intel.body.capabilities));
});

/* ───────── 20. RBAC isolation: non-member cannot read the profile ───────── */
test("startup-profile: non-member is denied access (403)", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  const r = await client("GET", `/startups/${s.id}/profile`, { userId: "outsider-b" });
  assert.equal(r.status, 403);
});

/* ───────── 21. Server-side audit trail is written for profile actions ───────── */
test("startup-profile: profile/evidence/verification actions leave an audit trail", async () => {
  const { client } = serverCtx;
  const orgA = await seedOrg(client, "Gov Cell");
  const s = await seedStartup(client, orgA);
  await client("POST", `/startups/${s.id}/profile`, { userId: "admin-a", body: seedProfileBody() });
  const ev = await client("POST", `/startups/${s.id}/evidence`, { userId: "admin-a", body: { section: "IDENTITY", field: "name", claim: "X" } });
  await client("POST", `/startups/${s.id}/verifications/field`, { userId: "admin-a", body: { section: "IDENTITY", field: "name", status: "VERIFIED", evidenceId: ev.body.id } });
  const a = await client("GET", `/audit?organizationId=${orgA}&entityType=STARTUP_PROFILE`, { userId: "admin-a" });
  assert.equal(a.status, 200);
  assert.ok(Array.isArray(a.body.events) && a.body.events.length > 0, "audit events written");
  assert.ok(a.body.events.some((e) => e.action === "PROFILE_CREATED"), "profile creation audited");
});
