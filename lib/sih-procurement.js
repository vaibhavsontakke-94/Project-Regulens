/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — Innovation Procurement module (additive workflow layer)
   ───────────────────────────────────────────────────────────────────
   Pure / deterministic + AI-assisted services that drive the
   Government Problem → AI structuring → Human review → Innovation
   Challenge → Approval → Publication workflow.

   DESIGN RULES (per the product brief)
   - AI assists the officer; AI NEVER publishes a challenge.
   - AI output is schema-validated and classified by provenance
     (USER_PROVIDED / AI_DERIVED / AI_SUGGESTED / REQUIRES_VERIFICATION).
   - When AI is unavailable, the workflow still works manually.
   - No invented government facts: budgets, statistics, laws and
     approvals are never fabricated.
   - Technology lock-in is avoided: challenges express capability /
     outcome requirements, not specific brands.
   ═══════════════════════════════════════════════════════════════════ */
import { AppError } from "./errors.js";
import { logError, logWarn, newRef } from "./log.js";
import * as dom from "./sih-domain.js";
import { prepareProblem } from "./sih-domain.js";

const DEFAULT_AI_VERSION = "1";
const DEFAULT_PROMPT_VERSION = "challenge-structure.v1";

/* ───────────────────────────────────────────────────────────────────
   STATUS MACHINES (mirrors sih-domain + stricter approve/publish)
   ─────────────────────────────────────────────────────────────────── */

export const PROBLEM_STATUS = dom.PROBLEM_STATUSES; // DRAFT,SUBMITTED,APPROVED,IN_CHALLENGE,ARCHIVED
export const CHALLENGE_STATUS = dom.CHALLENGE_STATUSES; // DRAFT,REVIEW,PUBLISHED,...

export const PROBLEM_TRANSITIONS = {
  DRAFT: ["SUBMITTED", "APPROVED", "ARCHIVED"],
  SUBMITTED: ["APPROVED", "ARCHIVED"],
  APPROVED: ["PUBLISHED", "IN_CHALLENGE", "ARCHIVED", "SUBMITTED"],
  PUBLISHED: ["CLOSED", "IN_CHALLENGE", "ARCHIVED", "APPROVED"],
  IN_CHALLENGE: ["PUBLISHED", "CLOSED", "ARCHIVED"],
  CLOSED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: [],
};

export const CHALLENGE_TRANSITIONS = {
  DRAFT: ["REVIEW", "PUBLISHED", "ARCHIVED", "CANCELLED"],
  REVIEW: ["APPROVED", "DRAFT", "CANCELLED"],
  APPROVED: ["PUBLISHED", "DRAFT", "CANCELLED", "ARCHIVED"],
  PUBLISHED: ["APPLICATIONS_OPEN", "CANCELLED", "ARCHIVED"],
  APPLICATIONS_OPEN: ["EVALUATION", "CANCELLED"],
  EVALUATION: ["PILOT_SELECTION", "CANCELLED"],
  PILOT_SELECTION: ["PILOT_RUNNING", "CANCELLED"],
  PILOT_RUNNING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function assertProblemTransition(from, to) {
  const allowed = (PROBLEM_TRANSITIONS[from] || []);
  if (from === to) return;
  if (!allowed.includes(to)) {
    throw new AppError(409, "INVALID_TRANSITION", `Cannot move problem from ${from} to ${to}`);
  }
}

export function assertChallengeTransition(from, to) {
  const allowed = (CHALLENGE_TRANSITIONS[from] || []);
  if (from === to) return;
  if (!allowed.includes(to)) {
    throw new AppError(409, "INVALID_TRANSITION", `Cannot move challenge from ${from} to ${to}`);
  }
}

/* A challenge can only be PUBLISHED through REVIEW → APPROVED → PUBLISHED.
   This blocks the forbidden DRAFT → PUBLISHED shortcut. */
export function assertChallengeApproval(from, to) {
  if (to === "PUBLISHED" && from !== "APPROVED") {
    throw new AppError(409, "APPROVAL_REQUIRED", "A challenge must be APPROVED before it can be PUBLISHED");
  }
  if (to === "APPROVED" && from !== "REVIEW") {
    throw new AppError(409, "REVIEW_REQUIRED", "A challenge must be submitted for REVIEW before APPROVAL");
  }
}

/* ───────────────────────────────────────────────────────────────────
   PROBLEM QUALITY CHECK  (deterministic, NOT an LLM decision)
   ─────────────────────────────────────────────────────────────────── */

const QUALITY_RULES = [
  { key: "title", label: "title", has: (p) => !!String(p.title || "").trim(), blocking: true },
  { key: "problemStatement", label: "problemStatement", has: (p) => !!String(p.problemStatement || "").trim(), blocking: true },
  { key: "currentState", label: "currentState", has: (p) => !!String(p.currentState || "").trim(), blocking: false },
  { key: "desiredState", label: "desiredState", has: (p) => !!String(p.desiredState || "").trim(), blocking: false },
  { key: "department", label: "department", has: (p) => !!String(p.department || p.geography || "").trim(), blocking: false },
  { key: "affectedUsers", label: "affectedUsers", has: (p) => !!String(p.affectedUsers || "").trim(), blocking: false },
  { key: "geography", label: "geography", has: (p) => !!String(p.geography || p.location || "").trim(), blocking: false },
  { key: "sector", label: "sector", has: (p) => !!String(p.sector || "").trim(), blocking: false },
  { key: "requiredTechnology", label: "requiredTechnology", has: (p) => !!String(p.requiredTechnology || "").trim() || (Array.isArray(p.technologyPreferences) && p.technologyPreferences.length > 0), blocking: false },
  { key: "budgetRange", label: "budgetRange", has: (p) => (p.budgetMin != null && p.budgetMax != null && (Number(p.budgetMin) > 0 || Number(p.budgetMax) > 0)) || (Number(p.estimatedBudget) > 0), blocking: false },
  { key: "expectedOutcome", label: "expectedOutcome", has: (p) => !!String(p.expectedOutcome || p.desiredState || "").trim(), blocking: false },
  { key: "pilotDuration", label: "pilotDuration", has: (p) => Number(p.pilotDurationDays) > 0 || Number(p.timelineDays) > 0, blocking: false },
  { key: "eligibilityCriteria", label: "eligibilityCriteria", has: (p) => !!String(p.eligibilityCriteria || "").trim(), blocking: false },
  { key: "targetUsers", label: "targetUsers", has: (p) => !!String(p.targetUsers || p.affectedUsers || "").trim(), blocking: false },
  { key: "expectedKpis", label: "expectedKpis", has: (p) => Array.isArray(p.expectedKpis) && p.expectedKpis.length > 0, blocking: false },
  { key: "baseline", label: "baselineMetric", has: (p) => {
      const b = p.baselineMetrics || {};
      return !!String(b.metric || b.baselineMetric || "").trim() || firstMetricOf(b);
    }, blocking: false },
  { key: "target", label: "targetMetric", has: (p) => {
      const t = p.desiredOutcomes || p.targetMetrics || {};
      return !!String(t.value || t.targetValue || t.metric || "").trim() || firstMetricOf(t);
    }, blocking: false },
];

function firstMetricOf(obj) {
  if (obj && Array.isArray(obj.metrics) && obj.metrics[0]) {
    const m = obj.metrics[0];
    return !!(String(m.value || m.targetValue || m.metric || "").trim());
  }
  return false;
}

/* Deterministic heuristic detectors (never an LLM decision). These add
   WARNING-level signals; they never block challenge creation on their own. */

const VAGUE_TOKEN_RE = /(\betc\.?\b|\bsomething\b|\bsomewhere\b|\bmaybe\b|\bperhaps\b|\bsoon\b|\btbd\b|\bto be decided\b|\bvarious\b|\ba lot of\b|\bmany\b)/i;

function ambiguousSignals(problem) {
  const text = [
    problem.title, problem.problemStatement, problem.currentState, problem.desiredState,
    problem.expectedOutcome, problem.requiredTechnology, problem.constraints,
    problem.operationalConstraints,
  ].filter((x) => x).join(" ");
  const hits = [];
  const m = String(text).match(VAGUE_TOKEN_RE);
  if (m) hits.push(`Contains vague wording (“${m[0]}”) that could be read multiple ways.`);
  return hits;
}

function contradictionSignals(problem) {
  const hits = [];
  if (problem.budgetMin != null && problem.budgetMax != null && Number(problem.budgetMax) < Number(problem.budgetMin)) {
    hits.push("Budget maximum is lower than the budget minimum.");
  }
  const cur = String(problem.currentState || "").trim().toLowerCase();
  const des = String(problem.desiredState || "").trim().toLowerCase();
  if (cur && des && cur === des) hits.push("Desired state appears identical to the current state — no change is described.");
  const reqTech = String(problem.requiredTechnology || "").trim().toLowerCase();
  const out = String(problem.expectedOutcome || "").trim().toLowerCase();
  if (/no automation|manual process|offline only|no technology/.test(reqTech) && /automat|digit|online|app|cloud|ai\b/.test(out)) {
    hits.push("Required technology rules out automation while the expected outcome implies it.");
  }
  return hits;
}

function unclearOutcomeSignals(problem) {
  const out = String(problem.expectedOutcome || problem.desiredState || "").trim();
  if (!out) return ["No expected outcome is described."];
  if (/^(\bbetter\b|\bimprove\b|\bmore efficient\b|\bwhatever\b|\bsomething\b|\ball required\b)?$/i.test(out)) {
    return ["The expected outcome is too vague to measure."];
  }
  return [];
}

function kpiGapSignals(problem) {
  const kpis = Array.isArray(problem.expectedKpis) ? problem.expectedKpis : [];
  const b = problem.baselineMetrics || {};
  const t = problem.desiredOutcomes || problem.targetMetrics || {};
  const hasTarget = kpis.length > 0 || !!String(t.value || t.targetValue || t.metric || "").trim() || !!String(b.value || b.metric || "").trim();
  if (!hasTarget) return ["No explicit KPI or measurable target is defined — outcomes cannot be verified."];
  if (kpis.some((k) => !String((k && (k.name || k.target)) || "").trim())) {
    return ["At least one expected KPI is missing a target value."];
  }
  return [];
}

/* Map warning signals back into the `issues` shape the UI renders. */
function toIssues(checks, extra) {
  const issues = checks.map((c) => ({
    key: c.key,
    severity: c.severity,
    label: c.label,
    note: c.pass ? "" : (c.blocking ? "Blocking — required before a challenge can be created." : "Recommended to complete."),
    blocking: c.blocking,
  }));
  for (const w of extra) issues.push({ key: w.key, severity: "warning", label: w.label, note: w.note, blocking: false });
  return issues;
}

export function qualityCheck(problem) {
  const checks = QUALITY_RULES.map((r) => {
    const pass = r.has(problem);
    return {
      key: r.key,
      label: r.label,
      pass,
      severity: pass ? "ok" : r.blocking ? "blocking" : "warning",
      blocking: r.blocking,
    };
  });
  const blocking = checks.filter((c) => c.blocking && !c.pass);
  const warnings = checks.filter((c) => !c.blocking && !c.pass).map((c) => c.key);
  const passed = checks.filter((c) => c.pass).length;
  const completeness = Math.round((passed / checks.length) * 100);

  /* additive deterministic intelligence (kept separate so existing callers
     that only read .checks/.blocking/.canCreateChallenge keep working) */
  const ambiguous = ambiguousSignals(problem);
  const contradictions = contradictionSignals(problem);
  const unclearOutcomes = unclearOutcomeSignals(problem);
  const kpiGaps = kpiGapSignals(problem);

  const extra = [
    ...ambiguous.map((note) => ({ key: "ambiguous", label: "Ambiguous requirement", note })),
    ...contradictions.map((note) => ({ key: "contradiction", label: "Contradictory requirement", note })),
    ...unclearOutcomes.map((note) => ({ key: "unclearOutcome", label: "Unclear outcome", note })),
    ...kpiGaps.map((note) => ({ key: "kpiGap", label: "Missing KPI", note })),
  ];

  return {
    completeness,
    canCreateChallenge: blocking.length === 0,
    blocking,
    warnings,
    checks,
    issues: toIssues(checks, extra),
    ambiguous,
    contradictions,
    unclearOutcomes,
    kpiGaps,
    policyFlags: [],
    message: blocking.length
      ? "Your problem statement is missing critical information and cannot yet be used to create an innovation challenge."
      : warnings.length || extra.length
        ? "Your problem statement can still be improved before creating an innovation challenge."
        : "Your problem statement is well-structured.",
  };
}

/* ───────────────────────────────────────────────────────────────────
   AI STRUCTURING — grounded output contract + deterministic fallback
   ─────────────────────────────────────────────────────────────────── */

export function emptyStructure() {
  return {
    problem_summary: "",
    problem_domain: "",
    current_state: "",
    desired_state: "",
    affected_users: [],
    objectives: [],
    outcomes: [],
    potential_kpis: [],
    constraints: [],
    required_capabilities: [],
    technology_categories: [],
    technology_requirements: [],
    eligibility_requirements: [],
    relevant_policies: [],
    potential_risks: [],
    data_requirements: [],
    pilot_considerations: [],
    missing_information: [],
    assumptions: [],
    confidence: 0,
    warnings: [],
  };
}

/* Deterministic fallback policy for when the AI model is unavailable.
   It only mirrors what the officer already typed — it never invents
   facts, budgets, laws or statistics. Items marked AI_SUGGESTED come
   from structured heuristics, not from fabricated facts. */
export function deterministicStructure(problem) {
  const p = problem || {};
  const baseline = p.baselineMetrics || {};
  const desired = p.desiredOutcomes || p.targetMetrics || {};
  const out = emptyStructure();
  out.problem_summary = String(p.problemStatement || "").trim();
  out.current_state = String(p.currentState || p.currentSituation || "").trim();
  out.desired_state = String(p.desiredState || p.expectedOutcome || "").trim();
  out.problem_domain = String(p.sector || p.department || "").trim();
  if (p.affectedUsers) out.affected_users = splitList(p.affectedUsers);
  if (p.geography) out.constraints.push(`Geography: ${p.geography}`);
  if (String(p.department || "").trim()) out.assumptions.push(`Department: ${p.department}`);
  if (String(p.sector || "").trim()) out.technology_categories.push(String(p.sector).trim());
  if (String(p.requiredTechnology || "").trim()) out.technology_requirements = splitList(p.requiredTechnology);
  if (String(p.eligibilityCriteria || "").trim()) out.eligibility_requirements = splitList(p.eligibilityCriteria);
  if (baseline && baseline.metric) {
    out.potential_kpis.push({ name: baseline.metric, baseline: baseline.value ?? null, target: desired.value ?? null });
  }
  if (Array.isArray(p.expectedKpis) && p.expectedKpis.length) {
    out.potential_kpis.push(...p.expectedKpis.map((k) => (typeof k === "string" ? { name: k, baseline: null, target: null, unit: "" } : k)));
  }
  if (Array.isArray(p.technologyPreferences) && p.technologyPreferences.length) {
    out.technology_categories.push(...p.technologyPreferences.map((t) => String(t).trim()).filter(Boolean));
  }
  out.missing_information = [];
  for (const c of qualityCheck(p).warnings) out.missing_information.push(c);
  out.confidence = 40;
  out.assumptions.push("This structure mirrors the fields provided by the officer; AI enrichment was unavailable at generation time.");
  if (!String(p.problemStatement || "").trim()) {
    out.warnings.push("No problem statement was provided.");
  }
  return out;
}

function splitList(s) {
  return String(s || "")
    .split(/[;,\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 40);
}

/* Provenance classifier applied to every AI output item. */
export function withProvenance(structure, problem) {
  const p = problem || {};
  const prov = (text) => {
    const t = String(text || "").trim().toLowerCase();
    const userText = [
      p.problemStatement, p.currentState, p.desiredState, p.affectedUsers,
      p.constraints, p.dataAvailability, p.requiredTechnology, p.eligibilityCriteria,
      p.expectedOutcome, p.currentSituation, p.operationalConstraints,
      Array.isArray(p.technologyPreferences) ? p.technologyPreferences.join(" ") : "",
    ].join(" ").toLowerCase();
    if (t && userText.includes(t)) return "USER_PROVIDED";
    return "AI_SUGGESTED";
  };
  const annotate = (arr) => (Array.isArray(arr) ? arr.map((it) => {
    if (typeof it === "string") return { value: it, provenance: prov(it) };
    if (it && typeof it === "object") {
      return { ...it, value: it.name || it.value || it.metric || String(it), provenance: prov(it.name || it.value || it.metric || String(it)) };
    }
    return { value: String(it), provenance: "AI_SUGGESTED" };
  }) : []);
  return {
    ...structure,
    problem_summary: { value: structure.problem_summary || "", provenance: prov(structure.problem_summary) },
    problem_domain: { value: structure.problem_domain || "", provenance: prov(structure.problem_domain) },
    current_state: { value: structure.current_state || "", provenance: prov(structure.current_state) },
    desired_state: { value: structure.desired_state || "", provenance: prov(structure.desired_state) },
    affected_users: annotate(structure.affected_users),
    objectives: annotate(structure.objectives),
    outcomes: annotate(structure.outcomes),
    potential_kpis: annotate(structure.potential_kpis),
    constraints: annotate(structure.constraints),
    required_capabilities: annotate(structure.required_capabilities),
    technology_categories: annotate(structure.technology_categories),
    technology_requirements: annotate(structure.technology_requirements),
    eligibility_requirements: annotate(structure.eligibility_requirements),
    relevant_policies: annotate(structure.relevant_policies),
    potential_risks: annotate(structure.potential_risks),
    data_requirements: annotate(structure.data_requirements),
    pilot_considerations: annotate(structure.pilot_considerations),
    missing_information: structure.missing_information || [],
    assumptions: structure.assumptions || [],
  };
}

/* ───────────────────────────────────────────────────────────────────
   AI PROMPT — grounded problem structuring
   ─────────────────────────────────────────────────────────────────── */

function buildStructurePrompt(problem) {
  const p = problem || {};
  return [
    "You are the REGULENS Government Innovation Procurement assistant.",
    "Your ONLY job is to restructure the officer's government problem into a precise, outcome-oriented, measurable problem.",
    "",
    "GROUNDING RULES (absolute):",
    "- Use ONLY the information the officer provided. Never invent budgets, statistics, laws, approvals, department requirements, startup eligibility rules, procurement rules or performance results.",
    "- If a fact is unknown, mark it as \"Not provided\" or \"Requires confirmation\".",
    "- Distinguish what the officer supplied (fact) from your interpretation or suggestion.",
    "",
    "Return STRICT JSON (no prose outside it) matching this exact schema:",
    JSON.stringify({
      problem_summary: "string — concise statement of the problem",
      problem_domain: "string — the operational domain this problem belongs to",
      current_state: "string — what happens today",
      desired_state: "string — desired outcome",
      affected_users: ["string"],
      objectives: ["string"],
      outcomes: ["string — measurable outcomes"],
      potential_kpis: [{ name: "string", baseline: "string|null", target: "string|null", unit: "string" }],
      constraints: ["string"],
      required_capabilities: ["string — capability/outcome, NOT a specific product/brand"],
      technology_categories: ["string"],
      technology_requirements: ["string — technology families that could address the problem, NOT brands"],
      eligibility_requirements: ["string — who should be allowed to participate"],
      relevant_policies: ["string — only policies the officer explicitly named (never invent laws)"],
      potential_risks: ["string — plausible implementation risks grounded in the officer's description"],
      data_requirements: ["string"],
      pilot_considerations: ["string"],
      missing_information: ["string — what is not provided that would help"],
      assumptions: ["string — only what you inferred, labelled as assumptions"],
      confidence: "integer 0-100",
      warnings: ["string"],
    }),
    "",
    "OFFICER'S INPUT:",
    JSON.stringify({
      title: p.title || "",
      problemStatement: p.problemStatement || "",
      currentState: p.currentState || "",
      desiredState: p.desiredState || "",
      affectedUsers: p.affected_users || p.affectedUsers || "",
      geography: p.geography || "",
      sector: p.sector || "",
      department: p.department || "",
      requiredTechnology: p.requiredTechnology || "",
      expectedOutcome: p.expectedOutcome || "",
      eligibilityCriteria: p.eligibilityCriteria || "",
      baselineMetrics: p.baselineMetrics || {},
      desiredOutcomes: p.desiredOutcomes || p.targetMetrics || {},
      technologyPreferences: p.technologyPreferences || [],
      constraints: p.constraints || "",
      dataAvailability: p.dataAvailability || "",
    }),
  ].join("\n");
}

/* Parse the AI's JSON safely. Returns null on failure (caller falls back). */
export function parseStructureJson(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  let candidate = raw;
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) candidate = m[0];
  try {
    const parsed = JSON.parse(candidate);
    return normalizeStructure(parsed);
  } catch {
    try {
      const cleaned = candidate
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/[\u0000-\u001f]/g, " ");
      return normalizeStructure(JSON.parse(cleaned));
    } catch {
      return null;
    }
  }
}

export function normalizeStructure(raw) {
  const base = emptyStructure();
  const r = raw && typeof raw === "object" ? raw : {};
  const str = (v) => (v && typeof v === "object" ? v.value ?? v.text ?? "" : String(v ?? ""));
  const list = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === "object" ? x.value ?? x.name ?? String(x) : String(x))) : []);
  return {
    problem_summary: str(r.problem_summary),
    problem_domain: str(r.problem_domain),
    current_state: str(r.current_state),
    desired_state: str(r.desired_state),
    affected_users: list(r.affected_users),
    objectives: list(r.objectives),
    outcomes: list(r.outcomes),
    potential_kpis: Array.isArray(r.potential_kpis)
      ? r.potential_kpis.map((k) => ({
          name: str(k.name || k.metric || k),
          baseline: k.baseline != null ? String(k.baseline) : null,
          target: k.target != null ? String(k.target) : null,
          unit: str(k.unit),
        })).filter((k) => k.name)
      : [],
    constraints: list(r.constraints),
    required_capabilities: list(r.required_capabilities),
    technology_categories: list(r.technology_categories),
    technology_requirements: list(r.technology_requirements),
    eligibility_requirements: list(r.eligibility_requirements),
    relevant_policies: list(r.relevant_policies),
    potential_risks: list(r.potential_risks),
    data_requirements: list(r.data_requirements),
    pilot_considerations: list(r.pilot_considerations),
    missing_information: list(r.missing_information),
    assumptions: list(r.assumptions),
    confidence: Math.max(0, Math.min(100, Number(r.confidence) || 0)),
    warnings: list(r.warnings),
  };
}

/* Orchestrate the AI structuring call with a deterministic fallback.
   `ai` is the injected groq module (like sih-integration.js does). */
export async function structureProblem({ ai, problem, lang = "en", endpoint = "/api/sih/problems/:id/ai-structure" }) {
  const fallback = () => ({
    structure: deterministicStructure(problem),
    mode: "deterministic-fallback",
    model: null,
    modelVersion: null,
    promptVersion: DEFAULT_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
  });

  if (!ai || typeof ai.isConfigured !== "function" || !ai.isConfigured()) {
    return fallback();
  }

  const system = [
    "You produce structured, grounded government problem structuring.",
    `Respond entirely in language code: ${String(lang || "en")}.`,
    "Only the JSON object described in the user message is allowed.",
  ].join("\n");

  try {
    const text = await ai.complete({
      messages: [
        { role: "system", content: system },
        { role: "user", content: buildStructurePrompt(problem) },
      ],
      endpoint,
      category: "ai",
    });
    const parsed = parseStructureJson(text);
    if (!parsed) {
      logWarn({ ref: newRef(), type: "SIH_STRUCTURE_INVALID_JSON", endpoint, cause: "AI returned unparseable JSON" });
      return fallback();
    }
    return {
      structure: parsed,
      mode: "ai",
      model: (ai.model && ai.model()) || null,
      modelVersion: ((ai.model && ai.model()) || "") && DEFAULT_AI_VERSION,
      promptVersion: DEFAULT_PROMPT_VERSION,
      generatedAt: new Date().toISOString(),
      raw: String(text).slice(0, 4000),
    };
  } catch (err) {
    logError({ ref: newRef(), type: "SIH_STRUCTURE_AI_FAILED", endpoint, cause: String(err && err.message) });
    return fallback();
  }
}

/* ───────────────────────────────────────────────────────────────────
   CHALLENGE GENERATION — outcome & capability oriented, no lock-in
   ─────────────────────────────────────────────────────────────────── */

const CAPABILITY_SYNTHESIS = {
  ai: "Machine-learning and AI-assisted decision support",
  "data-analytics": "Real-time data processing and analytics",
  nlp: "Multilingual natural-language interaction",
  "computer-vision": "Computer vision and automated image/document recognition",
  cloud: "Cloud-hosted, browser-accessible service",
  cybersecurity: "Secure data handling and access control",
};

export function buildChallengeFromProblem(problem, opts = {}) {
  const p = problem || {};
  const structure = opts.structure || deterministicStructure(p);
  const q = opts.quality || qualityCheck(p);

  const baseline = p.baselineMetrics || {};
  const desired = p.desiredOutcomes || p.targetMetrics || {};

  const title = opts.title || (p.title ? `${p.title}` : `${p.sector ? p.sector + " " : ""}Innovation Challenge`);

  const kpis = Array.isArray(structure.potential_kpis) && structure.potential_kpis.length
    ? structure.potential_kpis.map((k) => ({ name: k.name || k, baseline: k.baseline ?? null, target: k.target ?? null, unit: k.unit || "" }))
    : [];

  /* technology-neutral capability synthesis from structure */
  const capabilities = asList(structure.required_capabilities).length
    ? asList(structure.required_capabilities)
    : asList(structure.technology_categories).map((t) => CAPABILITY_SYNTHESIS[t.toLowerCase()] || t);

  const hasBudget = (p.estimatedBudget != null && Number(p.estimatedBudget) > 0) ||
    (opts.budgetMin != null && opts.budgetMax != null && (Number(opts.budgetMin) > 0 || Number(opts.budgetMax) > 0));

  const budgetText = hasBudget
    ? `${fmtMoney(opts.budgetMin ?? p.estimatedBudget ?? 0)} – ${opts.budgetMax != null ? fmtMoney(opts.budgetMax) : fmtMoney(p.estimatedBudget ?? 0)} ${p.currency || "INR"}`
    : "To be determined";

  return {
    problemId: p.id,
    organizationId: p.organizationId,
    title,
    description: String(structure.problem_summary || p.problemStatement || "").trim(),
    objective: asList(structure.objectives).join("; ") || String(p.desiredState || "").trim(),
    expectedOutcomes: asList(structure.outcomes).length ? asList(structure.outcomes) : asList(structure.desired_state || []),
    successMetrics: kpis.length ? kpis : [],
    targetUsers: asList(structure.affected_users).length ? asList(structure.affected_users) : splitList(p.affectedUsers),
    geography: String(p.geography || "").trim(),
    sector: String(p.sector || "").trim(),
    technicalCapabilities: capabilities,
    dataRequirements: asList(structure.data_requirements).length ? asList(structure.data_requirements) : splitList(p.dataAvailability),
    constraints: asList(structure.constraints).length ? asList(structure.constraints) : splitList(p.constraints),
    scope: String(opts.scope || "").trim(),
    outOfScope: String(opts.outOfScope || "").trim(),
    budgetMin: opts.budgetMin != null ? Number(opts.budgetMin) : (Number(p.estimatedBudget) || 0),
    budgetMax: opts.budgetMax != null ? Number(opts.budgetMax) : (Number(p.estimatedBudget) || 0),
    currency: p.currency || "INR",
    pilotDurationDays: Number(opts.pilotDurationDays) || Number(p.timelineDays) || null,
    challengeCode: opts.challengeCode || "",
    budgetText,
    needsConfirmation: !hasBudget,
  };
}

function asList(v) {
  if (Array.isArray(v)) return v.slice(0, 40);
  if (v) return String(v).split(/[;,\n]/).map((x) => x.trim()).filter(Boolean).slice(0, 40);
  return [];
}

function fmtMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-IN");
}

/* ───────────────────────────────────────────────────────────────────
   EVALUATION FRAMEWORK  (suggested defaults, configurable, weight=100%)
   ─────────────────────────────────────────────────────────────────── */

export const DEFAULT_EVALUATION_CRITERIA = [
  { key: "problem_fit", label: "Problem Fit", description: "How well the solution addresses the stated problem", weight: 20 },
  { key: "technical_capability", label: "Technical Capability", description: "Feasibility and soundness of the technical approach", weight: 15 },
  { key: "innovation", label: "Innovation", description: "Novelty relative to existing solutions", weight: 15 },
  { key: "scalability", label: "Scalability", description: "Ability to scale to the target geography/population", weight: 15 },
  { key: "security", label: "Security", description: "Data protection and cybersecurity posture", weight: 10 },
  { key: "compliance", label: "Compliance", description: "Alignment with applicable standards and rules", weight: 10 },
  { key: "deployment_readiness", label: "Deployment Readiness", description: "Readiness to pilot within a short timeline", weight: 10 },
  { key: "expected_impact", label: "Expected Impact", description: "Expected improvement against success metrics", weight: 5 },
];

/** Validate that an evaluation framework's weights sum to 100. */
export function validateEvaluationWeights(criteria) {
  const arr = Array.isArray(criteria) ? criteria : [];
  const sum = arr.reduce((s, c) => s + Number(c && c.weight || 0), 0);
  if (Math.abs(sum - 100) > 0.001) {
    throw new AppError(400, "VALIDATION_FAILED", `Evaluation weights must sum to 100 (got ${sum})`);
  }
  return arr;
}

/* ───────────────────────────────────────────────────────────────────
   PUBLICATION SAFETY — final validation before publish
   ─────────────────────────────────────────────────────────────────── */

export function publishValidation(challenge, opts = {}) {
  const errors = [];
  const warnings = [];
  if (!String(challenge.title || "").trim()) errors.push("Title is missing");
  const desc = String(challenge.description || challenge.problemStatement || "").trim();
  if (!desc) errors.push("Problem statement is missing");
  if (!String(challenge.objective || "").trim()) errors.push("Objective is missing");
  const outcomes = Array.isArray(challenge.expectedOutcomes) ? challenge.expectedOutcomes : [];
  const kpis = Array.isArray(challenge.successMetrics) ? challenge.successMetrics : [];
  if (!outcomes.length && !kpis.length) errors.push("At least one expected outcome or success metric is required");
  if (!String(challenge.organizationId || "")) errors.push("Department (organization) is missing");
  if (!opts.owner) errors.push("Challenge owner is missing");
  if (Number(challenge.budgetMin) < 0 || Number(challenge.budgetMax) < 0) errors.push("Budget values must be non-negative");
  if (challenge.budgetMax != null && challenge.budgetMin != null && Number(challenge.budgetMax) < Number(challenge.budgetMin)) {
    errors.push("Budget maximum must be >= budget minimum");
  }
  if (opts.eligibilityReviewed === false) warnings.push("Eligibility requirements have not been reviewed");
  if (opts.evaluationValid !== false && !Array.isArray(opts.evaluationFramework) ) {
    // framework optional but if present must be valid
  }
  const framework = opts.evaluationFramework;
  if (Array.isArray(framework) && framework.length) {
    try { validateEvaluationWeights(framework); }
    catch (e) { errors.push(String(e.publicMessage || e.message)); }
  }
  return { canPublish: errors.length === 0, errors, warnings };
}

export { prepareProblem };
