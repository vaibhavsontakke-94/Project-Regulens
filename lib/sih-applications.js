/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — Solution Applications (additive, startup side of SIH)
   The startup-facing counterpart of the government Problem→Challenge
   flow. Pure deterministic functions (no I/O) plus an optional AI-assist
   wrapper that mirrors lib/groq complete() usage elsewhere.

   GROUNDING CONTRACT
   - AI never fabricates credentials, evidence, or achievements. Missing
     items are listed EXACTLY (what is missing), never invented.
   - Compliance signals reuse the real policy records via lib/sih-policy.js.
   - Feasibility items are only "ASSESSED" when the startup actually
     provided the underlying data; otherwise "NEEDS_INPUT" / "INFORMATIVE".
   - Privacy: internalNotes + evaluationComments never leave the server to
     startups (router applies startupApplicationView()).
   ═══════════════════════════════════════════════════════════════════ */
import { AppError } from "./errors.js";
import { safeString } from "./security.js";
import * as policy from "./sih-policy.js";

/* ───────── lifecycle transitions (Draft→…→Pilot) ───────── */
export const APPLICATION_TRANSITIONS = {
  DRAFT: ["SUBMITTED", "NEEDS_MORE_INFORMATION"],
  SUBMITTED: ["UNDER_REVIEW", "NEEDS_MORE_INFORMATION", "REJECTED", "ELIGIBLE"],
  UNDER_REVIEW: ["ELIGIBLE", "NEEDS_MORE_INFORMATION", "REJECTED", "SUBMITTED"],
  ELIGIBLE: ["SHORTLISTED", "REJECTED", "NEEDS_MORE_INFORMATION"],
  SHORTLISTED: ["SELECTED", "REJECTED", "ELIGIBLE"],
  SELECTED: ["PILOT", "REJECTED"],
  PILOT: [],
  REJECTED: [],
  NEEDS_MORE_INFORMATION: ["SUBMITTED", "REJECTED"],
};

export function assertApplicationTransition(from, to) {
  const allowed = APPLICATION_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new AppError(409, "INVALID_TRANSITION", `Application cannot move from ${from} to ${to}`);
  }
  return to;
}

/* ───────── submission completeness (what the startup must provide) ───────── */
export const SUBMISSION_SECTIONS = [
  { key: "solutionDescription", labelKey: "application.field.solutionDescription" },
  { key: "technology", labelKey: "application.field.technology" },
  { key: "architecture", labelKey: "application.field.architecture" },
  { key: "implementationPlan", labelKey: "application.field.implementationPlan" },
  { key: "expectedImpact", labelKey: "application.field.expectedImpact" },
  { key: "cost", labelKey: "application.field.cost" },
  { key: "team", labelKey: "application.field.team" },
  { key: "pilotRequirements", labelKey: "application.field.pilotRequirements" },
];

function isEmptyValue(v) {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return String(v).trim() === "";
}

export function submissionCompleteness(application) {
  const a = application || {};
  const missing = [];
  for (const sec of SUBMISSION_SECTIONS) {
    if (sec.key === "cost") {
      const costPresent = (a.costMin != null && a.costMin !== "") || (a.costMax != null && a.costMax !== "");
      if (!costPresent) missing.push(sec.key);
      continue;
    }
    if (isEmptyValue(a[sec.key])) missing.push(sec.key);
  }
  return {
    complete: missing.length === 0,
    missing,
    missingCount: missing.length,
  };
}

/* ───────── exact document checklist (show what is missing) ───────── */
export const REQUIRED_CHALLENGE_DOCUMENTS = [
  { docType: "DPIIT_CERTIFICATE", labelKey: "application.document.dpiit" },
  { docType: "GST_CERTIFICATE", labelKey: "application.document.gst" },
  { docType: "INCORPORATION", labelKey: "application.document.incorporation" },
  { docType: "CYBERSECURITY", labelKey: "application.document.cybersecurity" },
  { docType: "DEPLOYMENT_EVIDENCE", labelKey: "application.document.deployment" },
];

/* Returns a checklist entry per required document. status ∈
   {MISSING, PROVIDED, PROVIDED_REVIEW, EXPIRED}. Exactly mirrors what the
   startup uploaded; never invents a missing certificate. */
export function applicationDocumentChecklist(docs = []) {
  const provided = new Map();
  for (const d of docs || []) {
    if (!d || !d.docType || provided.has(d.docType)) continue;
    provided.set(d.docType, d);
  }
  return REQUIRED_CHALLENGE_DOCUMENTS.map((req) => {
    const doc = provided.get(req.docType);
    if (!doc) return { docType: req.docType, labelKey: req.labelKey, status: "MISSING", documentId: null };
    let status = "PROVIDED";
    if (doc.expiryStatus === "EXPIRED") status = "EXPIRED";
    else if (doc.status !== "VERIFIED" && !(doc.verificationStatus === "SOURCE_VERIFIED")) status = "PROVIDED_REVIEW";
    return { docType: req.docType, labelKey: req.labelKey, status, documentId: doc.id };
  });
}

export function missingDocuments(docs = []) {
  return applicationDocumentChecklist(docs).filter((d) => d.status === "MISSING" || d.status === "EXPIRED");
}

/* ───────── requirements digest (grounded, pulled from problem/challenge) ───────── */
export function applicationRequirementsDigest({ challenge, problem }) {
  const p = problem || {};
  const c = challenge || {};
  return {
    title: String(p.title || c.title || ""),
    problemStatement: String(p.problemStatement || c.description || ""),
    technology: String(p.requiredTechnology || (Array.isArray(c.technicalCapabilities) ? c.technicalCapabilities.join(", ") : "") || ""),
    budget: p.budgetMin != null || p.budgetMax != null
      ? { min: p.budgetMin ?? null, max: p.budgetMax ?? null, currency: p.currency || "INR" }
      : null,
    location: String(p.location || p.geography || c.geography || ""),
    expectedOutcome: String(p.expectedOutcome || (Array.isArray(c.expectedOutcomes) ? c.expectedOutcomes.join(", ") : "") || ""),
    pilotDurationDays: p.pilotDurationDays ?? c.pilotDurationDays ?? null,
    eligibilityCriteria: String(p.eligibilityCriteria || c.eligibilitySummary || ""),
    expectedKpis: Array.isArray(p.expectedKpis) ? p.expectedKpis.filter(Boolean) : [],
    submissionDeadline: c.submissionDeadline || null,
  };
}

/* ───────── feasibility glance (never fabricated) ───────── */
export function feasibilityGlance({ application, startup, compliance }) {
  const a = application || {};
  const s = startup || {};
  const hasGovDeployment = (s.registrationInfo && s.registrationInfo.govtProjects) || (Array.isArray(a.previousProjects) && a.previousProjects.length > 0);
  const costPresent = (a.costMin != null && a.costMin !== "") || (a.costMax != null && a.costMax !== "");
  const items = [
    { dimension: "technical", labelKey: "application.feasibility.technical", state: isEmptyValue(a.technology) ? "NEEDS_INPUT" : "ASSESSED", noteKey: "application.feasibility.technical.note" },
    { dimension: "operational", labelKey: "application.feasibility.operational", state: isEmptyValue(a.implementationPlan) ? "NEEDS_INPUT" : "ASSESSED", noteKey: "application.feasibility.operational.note" },
    { dimension: "financial", labelKey: "application.feasibility.financial", state: costPresent ? "ASSESSED" : "NEEDS_INPUT", noteKey: "application.feasibility.financial.note" },
    { dimension: "deployment", labelKey: "application.feasibility.deployment", state: hasGovDeployment ? "ASSESSED" : "NEEDS_INPUT", noteKey: "application.feasibility.deployment.note" },
    { dimension: "regulatory", labelKey: "application.feasibility.regulatory", state: compliance && compliance.policies && compliance.policies.length ? "INFORMATIVE" : "INFORMATIVE", noteKey: "application.feasibility.regulatory.note" },
    { dimension: "scalability", labelKey: "application.feasibility.scalability", state: "INFORMATIVE", noteKey: "application.feasibility.scalability.note" },
  ];
  return { items, summary: items.filter((i) => i.state === "ASSESSED").length };
}

/* ───────── grounded improvement suggestions (no fabricated positives) ───────── */
export function improveSuggestions(application) {
  const a = application || {};
  const suggestions = [];
  if (isEmptyValue(a.solutionDescription) || String(a.solutionDescription).trim().length < 120) {
    suggestions.push({ key: "solutionDescription", labelKey: "application.suggestion.solutionDescription" });
  }
  if (isEmptyValue(a.technology)) suggestions.push({ key: "technology", labelKey: "application.suggestion.technology" });
  if (isEmptyValue(a.implementationPlan)) suggestions.push({ key: "implementationPlan", labelKey: "application.suggestion.implementationPlan" });
  const costPresent = (a.costMin != null && a.costMin !== "") || (a.costMax != null && a.costMax !== "");
  if (!costPresent) suggestions.push({ key: "cost", labelKey: "application.suggestion.cost" });
  if (!Array.isArray(a.previousProjects) || a.previousProjects.length === 0) {
    suggestions.push({ key: "previousProjects", labelKey: "application.suggestion.previousProjects" });
  }
  if (isEmptyValue(a.expectedImpact)) suggestions.push({ key: "expectedImpact", labelKey: "application.suggestion.expectedImpact" });
  const team = a.team || {};
  if (isEmptyValue(team) && isEmptyValue(a.teamSize)) suggestions.push({ key: "team", labelKey: "application.suggestion.team" });
  const pilot = a.pilotRequirements || {};
  if (isEmptyValue(pilot)) suggestions.push({ key: "pilotRequirements", labelKey: "application.suggestion.pilotRequirements" });
  return {
    suggestions,
    noteKey: "application.suggestion.note",
  };
}

/* ───────── full deterministic AI assist (kind-filtered) ───────── */
export function applicationAiAssistFallback({ application, challenge, problem, docs, startup, kind = "FULL" }, lang = "en") {
  const a = application || {};
  const kindNorm = String(kind || "FULL").toUpperCase();
  const completeness = submissionCompleteness(a);
  const docChecklist = applicationDocumentChecklist(docs || []);
  const missing = docChecklist.filter((d) => d.status === "MISSING" || d.status === "EXPIRED");
  const compliance = problem ? policy.problemPolicyIntelligence(problem) : { policies: [], warnings: [{ message: "No problem record available for compliance intelligence." }] };
  const feasibility = feasibilityGlance({ application: a, startup, compliance });
  const req = applicationRequirementsDigest({ challenge, problem });

  const out = {
    mode: "deterministic",
    kind: kindNorm,
    requirements: req,
    completeness,
    documentChecklist: docChecklist,
    missingDocuments: missing,
    compliance: {
      policies: (compliance.policies || []).map((p) => ({
        title: p.title, code: p.code, authority: p.authority, policyType: p.policyType,
        status: p.status, relevance: p.relevance, impactLevel: p.impact && p.impact.level,
        source: p.source,
      })),
      warnings: compliance.warnings || [],
      schemesNote: compliance.schemesNote || null,
    },
    feasibility,
    warnings: [
      ...(kindNorm === "COMPLIANCE" || kindNorm === "FULL" ? (compliance.warnings || []) : []),
      missing.length ? [{ messageKind: "application.warning.missingDocuments", count: missing.length }] : [],
    ].flat(),
  };

  /* kind filtering: only include the section requested (FULL = everything) */
  if (kindNorm === "REQUIREMENTS") return { ...out, mode: "deterministic", kind: kindNorm, requirements: req };
  if (kindNorm === "DOCUMENTS") return { ...out, mode: "deterministic", kind: kindNorm, documentChecklist: docChecklist, missingDocuments: missing };
  if (kindNorm === "COMPLIANCE") return { ...out, mode: "deterministic", kind: kindNorm, compliance: out.compliance };
  if (kindNorm === "FEASIBILITY") return { ...out, mode: "deterministic", kind: kindNorm, feasibility };
  if (kindNorm === "IMPROVE") return { ...out, mode: "deterministic", kind: kindNorm, suggestions: improveSuggestions(a) };
  return out;
}

/* ───────── device-assisted prompt (optional AI, grounded inputs only) ───────── */
export function buildApplicationAssistPrompt({ application, challenge, problem, docs, lang }) {
  const fallback = applicationAiAssistFallback({ application, challenge, problem, docs }, lang);
  const safe = (v, max = 800) => safeString(v, max);
  return [
    "You are the REGULENS SIH Government Pilot submission assistant.",
    "You help a startup prepare a solution submission. Rules:",
    "1. Only reorganize the grounded facts provided below.",
    "2. NEVER fabricate credentials, evidence, certificates, or past achievements.",
    "3. If a fact is absent, list it under missingDocuments (exactly what is missing).",
    "4. Return STRICT JSON with this schema:",
    JSON.stringify({
      requirements: "object — a copy of the provided requirements digest",
      completeness: { complete: "boolean", missing: ["string"] },
      documentChecklist: [{ docType: "string", status: "string" }],
      missingDocuments: [{ docType: "string", status: "string" }],
      suggestions: [{ key: "string", label: "string" }],
      feasibility: { items: [{ dimension: "string", state: "string" }] },
      warnings: ["string"],
    }),
    "",
    "PROBLEM / CHALLENGE:",
    safe(JSON.stringify(fallback.requirements), 4000),
    "SUBMISSION (current draft):",
    safe(JSON.stringify({ solutionDescription: application && application.solutionDescription, technology: application && application.technology, architecture: application && application.architecture, implementationPlan: application && application.implementationPlan, previousProjects: application && application.previousProjects, expectedImpact: application && application.expectedImpact, team: application && application.team, pilotRequirements: application && application.pilotRequirements }), 4000),
    "UPLOADED DOCUMENTS:",
    safe(JSON.stringify((docs || []).map((d) => ({ docType: d.docType, status: d.status, expiryStatus: d.expiryStatus, verificationStatus: d.verificationStatus }))), 2000),
  ].join("\n");
}

/* Main entry: uses AI when available and configured, otherwise the fully
   deterministic fallback. The AI branch still passes every grounded input
   and its output is normalized; provenance stays with the fallback data. */
export async function applicationAiAssist(args, ai) {
  const fallback = applicationAiAssistFallback(args, args.lang || "en");
  if (ai && typeof ai.complete === "function" && ai.isConfigured && ai.isConfigured()) {
    try {
      const lang = args.lang || "en";
      const prompt = buildApplicationAssistPrompt(args);
      const raw = await ai.complete(prompt, {
        temperature: 0.2, maxTokens: 1200, json: true,
        system: "You are the REGULENS SIH submission assistant. Reorganize only grounded data. Never fabricate credentials, evidence or achievements.",
      });
      const parsed = parseAssistJson(raw);
      if (parsed) {
        return {
          ...fallback,
          mode: "ai",
          suggestions: (parsed.suggestions && Array.isArray(parsed.suggestions) ? parsed.suggestions : fallback.suggestions),
          aiGenerated: true,
        };
      }
    } catch (err) {
      /* fall through to the deterministic fallback (never block on AI) */
    }
  }
  return fallback;
}

function parseAssistJson(raw) {
  if (!raw) return null;
  try {
    const cleaned = String(raw).trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    const obj = typeof cleaned === "string" ? JSON.parse(cleaned) : cleaned;
    if (obj && typeof obj === "object") return obj;
  } catch (err) { /* ignore */ }
  return null;
}

/* ───────── privacy: the view a startup may read ─────────
   internalNotes + evaluationComments are government-internal and stripped.
   needsInfoRequests / requiredAction stay (they ARE the required action). */
export const APPLICATION_STARTUP_PRIVATE_FIELDS = ["internalNotes", "evaluationComments"];

export function startupApplicationView(application) {
  if (!application) return null;
  const view = {};
  for (const key of Object.keys(application)) {
    if (APPLICATION_STARTUP_PRIVATE_FIELDS.includes(key)) continue;
    view[key] = application[key];
  }
  return view;
}

/* ───────── government review classification via eligibility gate ───────── */
export function classifyReview({ eligibilityVerdict, completeness }) {
  const allowed = ["ELIGIBLE", "ELIGIBLE_WITH_REVIEW"];
  if (allowed.includes(eligibilityVerdict)) {
    if (!completeness.complete) {
      return { status: "NEEDS_MORE_INFORMATION", reason: `Eligibility passed (${eligibilityVerdict}) but the submission is incomplete: ${completeness.missing.join(", ")}.` };
    }
    return { status: "ELIGIBLE", reason: `Eligibility verdict: ${eligibilityVerdict} and submission complete.` };
  }
  if (eligibilityVerdict === "NOT_ELIGIBLE") {
    return { status: "REJECTED", reason: "Not eligible per the challenge's active eligibility rules." };
  }
  return { status: "NEEDS_MORE_INFORMATION", reason: `Eligibility requires attention (${eligibilityVerdict}). Additional information or evidence is needed.` };
}