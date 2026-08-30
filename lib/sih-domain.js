/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — additive domain foundation
   Constants, validation, and preparation functions for the SIH data
   model. Pure functions (no I/O) so they are fully unit-testable and
   are reused by the API router and the tests.
   ═══════════════════════════════════════════════════════════════════ */
import { safeString } from "./security.js";
import { AppError } from "./errors.js";

/* ───────── allowed values (mirrors supabase/sih26136.sql checks) ───────── */

export const ORG_TYPES = ["GOVERNMENT", "STARTUP", "PARTNER"];
export const ORG_STATUSES = ["ACTIVE", "DISABLED", "ARCHIVED"];
export const MEMBER_ROLES = [
  "ADMIN", "OFFICER", "PROCUREMENT_OFFICER", "EVALUATOR", "VIEWER",
  "STARTUP_ADMIN", "STARTUP_MEMBER",
];
export const MEMBER_STATUSES = ["ACTIVE", "INACTIVE", "REMOVED"];

export const PROBLEM_STATUSES = [
  "DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED", "CLOSED", "IN_CHALLENGE", "ARCHIVED",
];

export const CHALLENGE_STATUSES = [
  "DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "APPLICATIONS_OPEN", "EVALUATION",
  "PILOT_SELECTION", "PILOT_RUNNING", "COMPLETED", "CANCELLED", "ARCHIVED",
];

/* ───────── additive: startup solution applications (SIH Government Pilot) ─────────
   Lifecycle: Draft → Submitted → Under Review → Eligible → Shortlisted →
   Selected → Pilot  (or Rejected / Needs More Information). */
export const APPLICATION_STATUSES = [
  "DRAFT", "SUBMITTED", "UNDER_REVIEW", "ELIGIBLE", "SHORTLISTED",
  "SELECTED", "PILOT", "REJECTED", "NEEDS_MORE_INFORMATION",
];

/* Kinds of AI assistance available to a startup preparing a submission.
   Each kind maps to a grounded section of applicationAiAssist(). */
export const APPLICATION_ASSIST_KINDS = [
  "REQUIREMENTS", "DOCUMENTS", "COMPLIANCE", "FEASIBILITY", "IMPROVE", "FULL",
];
export const EVALUATION_STATUSES = [
  "NOT_STARTED", "PENDING_EVALUATION", "UNDER_EVALUATION", "EVALUATION_COMPLETE", "SELECTION_COMPLETE",
];

export const STARTUP_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"];
export const STARTUP_STAGES = ["", "PRE_SEED", "SEED", "EARLY_GROWTH", "GROWTH", "SERIES_A_PLUS"];
export const DPIIT_STATUSES = ["NOT_MARKED", "UNREGISTERED", "PENDING", "REGISTERED", "NOT_APPLICABLE"];
export const MSME_STATUSES = ["NOT_MARKED", "NO", "REGISTERED", "MICRO", "SMALL", "MEDIUM"];
export const GST_STATUSES = ["NOT_MARKED", "NOT_REGISTERED", "REGISTERED", "EXEMPT"];
export const VERIFICATION_AGGREGATES = [
  "UNVERIFIED", "PENDING", "PARTIALLY_VERIFIED", "VERIFIED", "REJECTED", "MANUAL_REVIEW",
];

export const CAPABILITY_CATEGORIES = ["TECHNOLOGY", "SECTOR", "USE_CASE"];
export const CAPABILITY_LEVELS = ["DECLARED", "BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export const DOCUMENT_TYPES = [
  "DPIIT_CERTIFICATE", "GST_CERTIFICATE", "MSME_CERTIFICATE", "INCORPORATION",
  "TECHNICAL", "DEPLOYMENT_EVIDENCE", "FINANCIAL", "CYBERSECURITY", "CERTIFICATION", "PRODUCT", "OTHER",
];
export const DOCUMENT_STATUSES = ["UPLOADED", "PROCESSING", "EXTRACTED", "VERIFIED", "REJECTED", "EXPIRED"];

export const VERIFICATION_TYPES = [
  "DPIIT", "MSME", "GST", "INCORPORATION", "CERTIFICATION", "CYBERSECURITY", "FINANCIAL", "IDENTITY", "OTHER",
];
export const VERIFICATION_SOURCES = ["MANUAL", "DEMO", "OFFICIAL"];
export const VERIFICATION_STATUSES = ["PENDING", "VERIFIED", "FAILED", "EXPIRED", "MANUAL_REVIEW"];

export const ELIGIBILITY_OPERATORS = [
  "EQUAL", "LT", "LTE", "GT", "GTE", "CONTAINS", "IN", "NOT_IN", "EXISTS", "HAS_CAPABILITY",
];
export const RULE_SOURCE_MODES = ["MANUAL", "LEGAL_DB", "DEMO"];
export const ELIGIBILITY_RESULT_STATUSES = ["PASS", "FAIL", "MISSING", "MANUAL_REVIEW"];
export const CHECK_MODES = ["MANUAL", "AI", "MIXED"];

/* ───────── additive: eligibility engine (Part 1-16) ───────── */

/* Extensible, configurable rule types (Part 2). Each maps to a concrete
   deterministic check; unknown types fall back to REQUIRES_HUMAN_REVIEW. */
export const ELIGIBILITY_RULE_TYPES = [
  "REQUIRED_ATTRIBUTE", "ATTRIBUTE_EQUALS", "ATTRIBUTE_IN_SET", "ATTRIBUTE_NOT_IN_SET",
  "BOOLEAN_REQUIREMENT", "DOCUMENT_REQUIRED", "DOCUMENT_VALID", "CERTIFICATION_REQUIRED",
  "CAPABILITY_REQUIRED", "SECTOR_MATCH", "GEOGRAPHY_MATCH", "EXPERIENCE_REQUIRED",
  "DEPLOYMENT_REQUIRED", "DATE_VALIDITY", "CUSTOM_REVIEW_REQUIRED", "COMPOSITE_RULE",
];

/* Part 4 — rule severity. Missing MANDATORY rules can hard-fail; IMPORTANT /
   ADVISORY / REVIEW_REQUIRED are routed to review/evidence instead of an
   automatic disqualification. */
export const RULE_SEVERITY = ["MANDATORY", "IMPORTANT", "ADVISORY", "REVIEW_REQUIRED"];

/* Part 7 — rule source categories (provenance). */
export const RULE_SOURCE_CATEGORIES = [
  "CENTRAL_GOVERNMENT", "STATE_GOVERNMENT", "DEPARTMENT_POLICY", "PROCUREMENT_POLICY",
  "CHALLENGE_SPECIFIC", "DEPARTMENT_DEFINED", "LEGAL_REVIEW", "OTHER_AUTHORIZED_SOURCE",
];

/* Part 8 — authority scope. The engine never mixes these; conflicts are
   surfaced for human review instead of silently preferring one. */
export const RULE_AUTHORITY_SCOPE = [
  "CENTRAL", "STATE_MAHARASHTRA", "DEPARTMENT", "CHALLENGE", "UNSPECIFIED",
];

/* Part 22 — rule lifecycle. Only ACTIVE rules drive production eligibility. */
export const RULE_LIFECYCLE_STATUS = [
  "DRAFT", "UNDER_REVIEW", "APPROVED", "ACTIVE", "SUPERSEDED", "INACTIVE",
];

/* Part 14 — evaluation result states (safer than Eligible/Not-Eligible). */
export const ELIGIBILITY_STATES = [
  "PASS", "FAIL", "MISSING_INFORMATION", "REQUIRES_EVIDENCE", "REQUIRES_HUMAN_REVIEW",
  "NOT_APPLICABLE", "RULE_CONFLICT", "UNKNOWN",
];

/* Part 13 — field trust levels for evidence-aware evaluation. */
export const TRUST_LEVELS = [
  "SOURCE_VERIFIED", "DOCUMENT_VERIFIED", "DOCUMENT_EXTRACTED", "USER_PROVIDED",
  "AI_INFERRED", "AI_SUGGESTED", "REQUIRES_REVIEW", "NOT_PROVIDED",
];

/* Part 15 — overall verdicts. Rule-based, not percentage-based. */
export const ELIGIBILITY_VERDICTS = [
  "ELIGIBLE", "ELIGIBLE_WITH_REVIEW", "CONDITIONAL", "REQUIRES_EVIDENCE",
  "REQUIRES_HUMAN_REVIEW", "NOT_ELIGIBLE", "RULE_CONFLICT", "UNKNOWN",
];

export const MATCH_KINDS = ["AI", "RULE_BASED", "MANUAL"];

/* ───────── additive: matching engine (Parts 1-48) ───────── */

/* Configurable matching dimensions (Part 6/7). Scores are normalized 0-1. */
export const MATCH_DIMENSIONS = [
  "PROBLEM_FIT", "CAPABILITY_FIT", "TECHNOLOGY_FIT", "USE_CASE_FIT", "SECTOR_FIT",
  "DEPLOYMENT_EXPERIENCE", "GOVERNMENT_EXPERIENCE", "PILOT_READINESS",
  "GEOGRAPHIC_FIT", "SCALABILITY_FIT", "EVIDENCE_STRENGTH",
];
export const MATCH_DIMENSION_LABELS = {
  PROBLEM_FIT: "Problem Fit", CAPABILITY_FIT: "Capability Fit", TECHNOLOGY_FIT: "Technology Fit",
  USE_CASE_FIT: "Use-Case Fit", SECTOR_FIT: "Sector Fit", DEPLOYMENT_EXPERIENCE: "Deployment Experience",
  GOVERNMENT_EXPERIENCE: "Government Experience", PILOT_READINESS: "Pilot Readiness",
  GEOGRAPHIC_FIT: "Geographic Fit", SCALABILITY_FIT: "Scalability Fit", EVIDENCE_STRENGTH: "Evidence Strength",
};

/* Hierarchical capability match classifications (Part 12). */
export const CAPABILITY_MATCH_TYPES = [
  "EXACT_MATCH", "CLOSE_MATCH", "RELATED", "PARTIAL", "MISSING", "UNKNOWN",
];

/* HARD GATE (Part 3) — how each eligibility verdict enters/leaves matching. */
export const MATCHING_POOL_TYPES = {
  ELIGIBLE: "RANKED",
  ELIGIBLE_WITH_REVIEW: "RANKED_WITH_WARNING",
  CONDITIONAL: "RANKED_CONDITIONAL",
  REQUIRES_HUMAN_REVIEW: "REVIEW_POOL",
  REQUIRES_EVIDENCE: "REVIEW_POOL",
  NOT_ELIGIBLE: "EXCLUDED",
  RULE_CONFLICT: "REVIEW_POOL",
  UNKNOWN: "EXCLUDED",
};

/* Deviation severity for score/confidence interpretation (Part 22/23). */
export const MATCH_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const MATCH_RUN_STATUSES = ["RUNNING", "COMPLETED", "FAILED", "PARTIAL"];
export const MATCH_CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"];

/* Evidence availability states surfaced per dimension (Part 17/24). */
export const MATCH_EVIDENCE_STATES = [
  "VERIFIED", "DOCUMENT_VERIFIED", "DOCUMENT_EXTRACTED", "USER_PROVIDED",
  "AI_INFERRED", "MISSING",
];

/* Matching engine version — bumped when algorithm semantics change. Used for
   reproducibility + stale detection + snapshots (Parts 41-44). */
export const MATCHING_ENGINE_VERSION = "1.0.0";

export const EVALUATION_STATUSES_APP = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

/* ───────── Evaluation & Shortlist Intelligence (Parts 1-73, additive) ───────── */

/* Criterion lifecycle (Part 5). ACTIVE drives configuration validity. */
export const EVALUATION_CRITERION_STATUSES = [
  "DRAFT", "UNDER_REVIEW", "APPROVED", "ACTIVE", "SUPERSEDED", "INACTIVE",
];

/* Evaluator workflow states (Part 21). LOCKED/SUBMITTED cannot be modified. */
export const EVALUATION_WORKFLOW_STATUSES = [
  "NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "LOCKED", "REOPENED", "CANCELLED",
];

/* Aggregation methods (Part 23). Default MEAN; method is stored, never inferred. */
export const EVALUATION_AGGREGATION_METHODS = [
  "MEAN", "MEDIAN", "WEIGHTED_MEAN", "CUSTOM_AUTHORIZED_METHOD",
];

/* Overall evaluation result states (Part 30). Never derived from a single
   score threshold alone — mandatory criteria and completeness gate them. */
export const EVALUATION_RESULT_STATES = [
  "ADVANCE", "ADVANCE_WITH_REVIEW", "REVIEW_REQUIRED", "DO_NOT_ADVANCE",
  "INCOMPLETE", "NOT_EVALUATED",
];

/* Final human decisions (Part 31). Always require authorized actor + reason. */
export const EVALUATION_DECISION_TYPES = [
  "PROCEED_TO_PILOT", "REQUEST_MORE_INFORMATION", "HOLD", "DO_NOT_PROCEED", "CUSTOM",
];
export const EVALUATION_DECISION_STAGES = ["EVALUATION", "PILOT_SELECTION", "REVIEW"];

export const EVALUATION_REQUEST_STATUSES = ["OPEN", "ANSWERED", "CLOSED"];
export const EVALUATION_SNAPSHOT_TYPES = ["SUBMISSION", "RE_EVALUATION", "AGGREGATION"];
export const EVALUATION_VARIANCE_KINDS = ["HIGH_VARIANCE", "OUTLIER"];
export const EVALUATION_COMMENT_KINDS = ["EVALUATOR_NOTE", "CRITICAL", "REASON"];
export const EVALUATION_COMMENT_REQUIRED_REASONS = [
  "LOW_SCORE", "HIGH_SCORE", "MANDATORY_FAILED", "MAJOR_EVIDENCE_GAP", "MANUAL_OVERRIDE",
];
export const EVALUATION_ASSIGNMENT_STATUSES = ["ASSIGNED", "IN_PROGRESS", "SUBMITTED"];
export const EVALUATION_CRITERION_CATEGORIES = [
  "TECHNICAL", "INNOVATION", "IMPACT", "COST", "EVIDENCE", "RISK", "OPERATIONS", "OTHER",
];
export const PILOT_HANDOFF_STATUSES = ["DRAFT", "ISSUED"];

/* Evidence quality levels surfaced per criterion (Part 12). AI-inferred data
   can never be promoted to VERIFIED without a verification record. */
export const EVALUATION_EVIDENCE_LEVELS = [
  "VERIFIED", "DOCUMENT_VERIFIED", "DOCUMENT_EXTRACTED", "USER_PROVIDED",
  "AI_INFERRED", "MISSING", "REQUIRES_REVIEW",
];

/* Engine version — bumped when aggregation/threshold semantics change. */
export const EVALUATION_ENGINE_VERSION = "1.0.0";

export const PILOT_STATUSES = ["PLANNED", "APPROVED", "RUNNING", "PAUSED", "COMPLETED", "FAILED", "CANCELLED"];
export const MILESTONE_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "DELAYED", "BLOCKED", "CANCELLED"];
export const KPI_STATUSES = ["BASELINE", "TARGET", "ACTUAL", "CLOSED"];

export const PILOT_RESULTS = ["SUCCESSFUL", "PARTIALLY_SUCCESSFUL", "FAILED", "INCONCLUSIVE"];
export const PILOT_RECOMMENDATIONS = ["SCALE", "CONDITIONAL_SCALE", "REPEAT_PILOT", "MODIFY_SOLUTION", "STOP"];

export const PROCUREMENT_STATUSES = ["DRAFT", "FINALIZED", "APPROVED", "REJECTED", "SUPERSEDED"];
export const RECOMMENDATION_KINDS = ["LEGAL_POLICY", "AI_INTERPRETATION", "RECOMMENDATION", "HUMAN_DECISION"];

export const SCALE_PLAN_STATUSES = ["DRAFT", "UNDER_REVIEW", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"];

export const PROVENANCE_SOURCES = [
  "USER_PROVIDED", "AI_DERIVED", "AI_SUGGESTED", "REQUIRES_VERIFICATION", "SOURCE_DOCUMENT",
];

export const AUDIT_ENTITY_TYPES = [
  "GOVERNMENT_ORGANIZATION", "GOVERNMENT_PROBLEM", "INNOVATION_CHALLENGE",
  "PROBLEM_AI_STRUCTURE",
  "STARTUP", "STARTUP_DOCUMENT", "VERIFICATION", "ELIGIBILITY_RULE", "ELIGIBILITY_CHECK",
  "ELIGIBILITY_RULE_VERSION", "ELIGIBILITY_SNAPSHOT", "ELIGIBILITY_REVIEW_ACTION",
  "MATCH", "EVALUATION_TEMPLATE", "EVALUATION", "PILOT", "PILOT_KPI", "PILOT_RESULT",
  "PROCUREMENT_ASSESSMENT", "SCALE_PLAN", "EVIDENCE_LINK",
  "STARTUP_PROFILE", "STARTUP_CERTIFICATION", "STARTUP_EVIDENCE",
  "STARTUP_VERIFICATION", "STARTUP_FLAG", "STARTUP_AI_SUGGESTION",
];

export const EVIDENCE_ENTITY_TYPES = [
  "PILOT_RESULT", "PROCUREMENT_ASSESSMENT", "SCALE_PLAN", "MATCH", "ELIGIBILITY_CHECK",
];
export const EVIDENCE_REFERENCE_TYPES = [
  "DOCUMENT", "RULE", "REGULATION", "POLICY", "RECORD", "MEASUREMENT",
];

/* ───────── low-level helpers ───────── */

export function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(v || "")
  );
}

function enumOf(value, allowed, label, fallback) {
  const v = String(value ?? fallback ?? "");
  if (!v) return fallback ?? "";
  if (!allowed.includes(v)) {
    throw new AppError(400, "VALIDATION_FAILED", `Invalid ${label}: '${v}'. Allowed: ${allowed.join(", ")}`);
  }
  return v;
}

function enumOrEmpty(value, allowed, label) {
  const v = String(value ?? "");
  if (!v) return v;
  return enumOf(v, allowed, label);
}

function str(value, max, label, required = false) {
  const s = safeString(value, max);
  if (required && !s) throw new AppError(400, "VALIDATION_FAILED", `${label} is required`);
  return s;
}

function uuidOf(value, label) {
  if (value == null || value === "") return null;
  if (!isUuid(value)) throw new AppError(400, "VALIDATION_FAILED", `${label} must be a valid UUID`);
  return value;
}

/* 0-100 integer score/percentage guard shared by matches, evaluations,
   weights, readiness and scale scores. */
export function scoreInt(value, label, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new AppError(400, "VALIDATION_FAILED", `${label} is required`);
    return null;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) {
    throw new AppError(400, "VALIDATION_FAILED", `${label} must be an integer between 0 and 100`);
  }
  return n;
}

export function nonNegNumber(value, label, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new AppError(400, "VALIDATION_FAILED", `${label} is required`);
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new AppError(400, "VALIDATION_FAILED", `${label} must be a non-negative number`);
  }
  return n;
}

export function positiveInt(value, label, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new AppError(400, "VALIDATION_FAILED", `${label} is required`);
    return null;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError(400, "VALIDATION_FAILED", `${label} must be a positive integer`);
  }
  return n;
}

export function dateOf(value, label) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new AppError(400, "VALIDATION_FAILED", `${label} must be a valid date`);
  return d.toISOString();
}

function jsonValue(value, fallback) {
  if (value == null) return fallback;
  const t = typeof value;
  if (t !== "object" && t !== "string") return fallback;
  return value;
}

function objectOf(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "object" || Array.isArray(value)) return fallback;
  return value;
}

function arrayOf(value, fallback, max = 50) {
  if (value == null) return fallback;
  if (!Array.isArray(value)) return fallback;
  return value.slice(0, max);
}

/* Weights must sum to 100% OR be all zero. When all zero we normalize to
   an equal split that sums to 100 (a clearly defined mechanism). */
export function normalizeWeights(items, { key = "weight", label = "weight" } = {}) {
  const arr = Array.isArray(items) ? items.slice(0, 50) : [];
  for (const it of arr) {
    const w = it && typeof it === "object" ? Number(it[key]) : Number.NaN;
    if (!Number.isFinite(w)) throw new AppError(400, "VALIDATION_FAILED", `Each ${label} must be numeric`);
    if (w < 0 || w > 100) throw new AppError(400, "VALIDATION_FAILED", `${label} must be between 0 and 100`);
  }
  const sum = arr.reduce((s, it) => s + Number(it[key] || 0), 0);
  if (arr.length === 0) return arr;
  if (sum === 0) {
    const each = Math.round((100 / arr.length) * 100) / 100;
    return arr.map((it, i) => {
      const last = 100 - each * (arr.length - 1);
      return { ...it, [key]: i === arr.length - 1 ? Math.round(last * 100) / 100 : each };
    });
  }
  if (Math.abs(sum - 100) > 0.001) {
    throw new AppError(400, "VALIDATION_FAILED", `${label} values must sum to 100 (got ${sum})`);
  }
  return arr;
}

/* ───────── A. organizations ───────── */

export function prepareOrganization(raw) {
  raw = objectOf(raw, {});
  return {
    orgType: enumOf(raw.orgType, ORG_TYPES, "org_type", "GOVERNMENT"),
    name: str(raw.name, 300, "name", true),
    shortName: str(raw.shortName, 100, "short_name"),
    departmentType: str(raw.departmentType, 100, "department_type"),
    ministry: str(raw.ministry, 200, "ministry"),
    state: str(raw.state, 100, "state"),
    departmentCode: str(raw.departmentCode, 60, "department_code"),
    description: str(raw.description, 2000, "description"),
    contactEmail: str(raw.contactEmail, 200, "contact_email"),
    contactPhone: str(raw.contactPhone, 40, "contact_phone"),
    status: raw.status == null || raw.status === "" ? "ACTIVE" : enumOf(raw.status, ORG_STATUSES, "status"),
    isDemo: !!raw.isDemo,
  };
}

export function prepareOrganizationPatch(raw) {
  raw = objectOf(raw, {});
  const out = { ...prepareOrganization({ ...raw, name: raw.name ?? "" }) };
  for (const k of ["orgType", "name", "shortName", "departmentType", "ministry", "state", "departmentCode", "description", "contactEmail", "contactPhone", "status"]) {
    if (out[k] === "" && raw[k] === undefined) delete out[k];
  }
  if (raw.isDemo === undefined) delete out.isDemo;
  return out;
}

export function prepareMembership(raw) {
  raw = objectOf(raw, {});
  return {
    userId: str(raw.userId, 200, "user_id", true),
    role: enumOf(raw.role, MEMBER_ROLES, "role"),
    status: raw.status == null || raw.status === "" ? "ACTIVE" : enumOf(raw.status, MEMBER_STATUSES, "status"),
  };
}

/* ───────── C. government problems ───────── */

export function prepareProblem(raw) {
  raw = objectOf(raw, {});
  const orgId = uuidOf(raw.organizationId, "organization_id");
  if (!orgId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
  const budget = nonNegNumber(raw.estimatedBudget, "estimated_budget");
  if (raw.estimatedBudget != null && budget === null) {
    throw new AppError(400, "VALIDATION_FAILED", "estimated_budget is required");
  }
  const min = nonNegNumber(raw.budgetMin, "budget_min");
  const max = nonNegNumber(raw.budgetMax, "budget_max");
  if (raw.budgetMin != null && min === null) {
    throw new AppError(400, "VALIDATION_FAILED", "budget_min must be a non-negative number");
  }
  if (raw.budgetMax != null && max === null) {
    throw new AppError(400, "VALIDATION_FAILED", "budget_max must be a non-negative number");
  }
  if (min != null && max != null && max < min) {
    throw new AppError(400, "VALIDATION_FAILED", "budget_max must be >= budget_min");
  }
  return {
    organizationId: orgId,
    title: str(raw.title, 300, "title", true),
    problemStatement: str(raw.problemStatement, 4000, "problem_statement", true),
    currentState: str(raw.currentState, 2000, "current_state"),
    desiredState: str(raw.desiredState, 2000, "desired_state"),
    affectedUsers: str(raw.affectedUsers, 1000, "affected_users"),
    geography: str(raw.geography, 300, "geography"),
    sector: str(raw.sector, 120, "sector"),
    baselineMetrics: objectOf(raw.baselineMetrics, {}),
    desiredOutcomes: objectOf(raw.desiredOutcomes, {}),
    estimatedBudget: budget ?? 0,
    currency: str(raw.currency, 8, "currency") || "INR",
    timelineDays: positiveInt(raw.timelineDays, "timeline_days"),
    dataAvailability: str(raw.dataAvailability, 1000, "data_availability"),
    technologyPreferences: arrayOf(raw.technologyPreferences, [], 40),
    constraints: str(raw.constraints, 2000, "constraints"),
    /* ── additive SIH problem-intelligence fields ── */
    department: str(raw.department, 200, "department"),
    location: str(raw.location, 300, "location"),
    requiredTechnology: str(raw.requiredTechnology, 1000, "required_technology"),
    budgetMin: min,
    budgetMax: max,
    expectedOutcome: str(raw.expectedOutcome, 1000, "expected_outcome"),
    pilotDurationDays: positiveInt(raw.pilotDurationDays, "pilot_duration_days"),
    eligibilityCriteria: str(raw.eligibilityCriteria, 2000, "eligibility_criteria"),
    currentSituation: str(raw.currentSituation, 2000, "current_situation"),
    currentPainPoints: str(raw.currentPainPoints, 2000, "current_pain_points"),
    targetUsers: str(raw.targetUsers, 1000, "target_users"),
    expectedKpis: arrayOf(raw.expectedKpis, [], 40),
    technicalRequirements: str(raw.technicalRequirements, 2000, "technical_requirements"),
    operationalConstraints: str(raw.operationalConstraints, 2000, "operational_constraints"),
    requiredIntegrations: str(raw.requiredIntegrations, 1000, "required_integrations"),
    attachments: arrayOf(raw.attachments, [], 20),
    status: raw.status == null || raw.status === "" ? "DRAFT" : enumOf(raw.status, PROBLEM_STATUSES, "status"),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── a startup's solution application to a challenge (SIH Government Pilot) ───────── */

export function prepareChallengeApplication(raw) {
  raw = objectOf(raw, {});
  const orgId = uuidOf(raw.organizationId, "organization_id");
  if (!orgId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
  const challengeId = uuidOf(raw.challengeId, "challenge_id");
  if (!challengeId) throw new AppError(400, "VALIDATION_FAILED", "challenge_id is required");
  const min = nonNegNumber(raw.costMin, "cost_min");
  const max = nonNegNumber(raw.costMax, "cost_max");
  if (min != null && max != null && max < min) {
    throw new AppError(400, "VALIDATION_FAILED", "cost_max must be >= cost_min");
  }
  return {
    organizationId: orgId,
    challengeId,
    problemId: uuidOf(raw.problemId, "problem_id"),
    solutionTitle: str(raw.solutionTitle, 300, "solution_title"),
    solutionDescription: str(raw.solutionDescription, 4000, "solution_description"),
    technology: str(raw.technology, 2000, "technology"),
    architecture: str(raw.architecture, 3000, "architecture"),
    implementationPlan: str(raw.implementationPlan, 4000, "implementation_plan"),
    previousProjects: arrayOf(raw.previousProjects, [], 40),
    costMin: min,
    costMax: max,
    expectedImpact: str(raw.expectedImpact, 2000, "expected_impact"),
    team: jsonBounded(raw.team, {}),
    pilotRequirements: jsonBounded(raw.pilotRequirements, {}),
    evidence: arrayOf(raw.evidence, [], 20),
    status: raw.status == null || raw.status === "" ? "DRAFT" : enumOf(raw.status, APPLICATION_STATUSES, "status"),
    requiredAction: str(raw.requiredAction, 500, "required_action"),
    decisionReason: str(raw.decisionReason, 2000, "decision_reason"),
    internalNotes: str(raw.internalNotes, 4000, "internal_notes"),
    evaluationComments: str(raw.evaluationComments, 4000, "evaluation_comments"),
    needsInfoRequests: arrayOf(raw.needsInfoRequests, [], 20),
    isDemo: !!raw.isDemo,
  };
}

/* append-only AI-assist run record for a solution application */
export function prepareApplicationAiAssist(raw) {
  raw = objectOf(raw, {});
  const applicationId = uuidOf(raw.applicationId, "application_id");
  if (!applicationId) throw new AppError(400, "VALIDATION_FAILED", "application_id is required");
  return {
    applicationId,
    organizationId: uuidOf(raw.organizationId, "organization_id"),
    kind: raw.kind == null || raw.kind === "" ? "FULL" : enumOf(raw.kind, APPLICATION_ASSIST_KINDS, "kind"),
    inputJson: jsonBounded(raw.inputJson, {}),
    outputJson: jsonBounded(raw.outputJson, {}),
    model: str(raw.model, 200, "model"),
    modelVersion: str(raw.modelVersion, 100, "model_version"),
    promptVersion: str(raw.promptVersion, 100, "prompt_version"),
    mode: raw.mode == null || raw.mode === "" ? "DETERMINISTIC" : enumOf(raw.mode, ["AI", "DETERMINISTIC"], "mode"),
    generatedBy: str(raw.generatedBy, 200, "generated_by"),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── a structured AI structure record (per run, append-only) ───────── */

export function prepareProblemAiStructure(raw) {
  raw = objectOf(raw, {});
  const problemId = uuidOf(raw.problemId, "problem_id");
  if (!problemId) throw new AppError(400, "VALIDATION_FAILED", "problem_id is required");
  return {
    problemId,
    status: raw.status == null || raw.status === "" ? "ACCEPTED" : enumOf(raw.status, ["ACCEPTED", "EDITED", "REJECTED"], "status"),
    outputJson: objectOf(raw.outputJson, {}),
    provenanceJson: objectOf(raw.provenanceJson, {}),
    model: str(raw.model, 120, "model"),
    modelVersion: str(raw.modelVersion, 120, "model_version"),
    promptVersion: str(raw.promptVersion, 120, "prompt_version"),
    mode: raw.mode == null || raw.mode === "" ? "MANUAL" : enumOf(raw.mode, ["AI", "DETERMINISTIC", "MANUAL"], "mode"),
    generatedBy: str(raw.generatedBy, 200, "generated_by"),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── D. innovation challenges ───────── */

/* Optional JSON blobs that enrich a challenge for the procurement workflow.
   These are validated for shape but are free-form configuration, so we only
   bound their size. */
function jsonBounded(value, fallback) {
  const v = objectOf(value, fallback);
  try {
    if (JSON.stringify(v).length > 60000) {
      throw new AppError(400, "VALIDATION_FAILED", "challenge configuration block exceeds size limit");
    }
  } catch (e) {
    if (e && e.status) throw e;
  }
  return v;
}

export function prepareChallenge(raw) {
  raw = objectOf(raw, {});
  const orgId = uuidOf(raw.organizationId, "organization_id");
  if (!orgId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
  const min = nonNegNumber(raw.budgetMin, "budget_min");
  const max = nonNegNumber(raw.budgetMax, "budget_max");
  if (min != null && max != null && max < min) {
    throw new AppError(400, "VALIDATION_FAILED", "budget_max must be >= budget_min");
  }
  return {
    problemId: uuidOf(raw.problemId, "problem_id"),
    organizationId: orgId,
    challengeCode: str(raw.challengeCode, 80, "challenge_code"),
    title: str(raw.title, 300, "title", true),
    description: str(raw.description, 4000, "description", true),
    objective: str(raw.objective, 2000, "objective"),
    expectedOutcomes: arrayOf(raw.expectedOutcomes, [], 40),
    scope: str(raw.scope, 3000, "scope"),
    outOfScope: str(raw.outOfScope, 3000, "out_of_scope"),
    targetUsers: str(raw.targetUsers, 1000, "target_users"),
    geography: str(raw.geography, 300, "geography"),
    successMetrics: arrayOf(raw.successMetrics, [], 40),
    technicalCapabilities: arrayOf(raw.technicalCapabilities, [], 40),
    dataRequirements: arrayOf(raw.dataRequirements, [], 40),
    constraints: arrayOf(raw.constraints, [], 40),
    eligibilitySummary: str(raw.eligibilitySummary, 3000, "eligibility_summary"),
    eligibilityRequirements: jsonBounded(raw.eligibilityRequirements, {}),
    evaluationFramework: jsonBounded(raw.evaluationFramework, {}),
    pilotRequirements: jsonBounded(raw.pilotRequirements, {}),
    provenance: jsonBounded(raw.provenance, {}),
    budgetMin: min ?? 0,
    budgetMax: max ?? 0,
    currency: str(raw.currency, 8, "currency") || "INR",
    pilotDurationDays: positiveInt(raw.pilotDurationDays, "pilot_duration_days"),
    submissionDeadline: dateOf(raw.submissionDeadline, "submission_deadline"),
    challengeStatus: raw.challengeStatus == null || raw.challengeStatus === "" ? "DRAFT" : enumOf(raw.challengeStatus, CHALLENGE_STATUSES, "challenge_status"),
    evaluationStatus: raw.evaluationStatus == null || raw.evaluationStatus === "" ? "NOT_STARTED" : enumOf(raw.evaluationStatus, EVALUATION_STATUSES, "evaluation_status"),
    isDemo: !!raw.isDemo,
    publishedAt: dateOf(raw.publishedAt, "published_at"),
    closedAt: dateOf(raw.closedAt, "closed_at"),
  };
}

/* ───────── E. startup profiles ───────── */

export function prepareStartup(raw) {
  raw = objectOf(raw, {});
  const orgId = uuidOf(raw.organizationId, "organization_id");
  return {
    organizationId: orgId,
    legalName: str(raw.legalName, 300, "legal_name", true),
    brandName: str(raw.brandName, 200, "brand_name"),
    registrationInfo: objectOf(raw.registrationInfo, {}),
    description: str(raw.description, 2000, "description"),
    sector: str(raw.sector, 120, "sector"),
    stage: enumOrEmpty(raw.stage, STARTUP_STAGES, "stage"),
    website: str(raw.website, 300, "website"),
    location: str(raw.location, 200, "location"),
    state: str(raw.state, 100, "state"),
    employeeCount: nonNegNumber(raw.employeeCount, "employee_count"),
    foundedYear: (() => {
      const v = raw.foundedYear;
      if (v == null || v === "") return null;
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1990 || n > 2100) {
        throw new AppError(400, "VALIDATION_FAILED", "founded_year must be an integer between 1990 and 2100");
      }
      return n;
    })(),
    dpiitStatus: raw.dpiitStatus == null || raw.dpiitStatus === "" ? "NOT_MARKED" : enumOf(raw.dpiitStatus, DPIIT_STATUSES, "dpiit_status"),
    msmeStatus: raw.msmeStatus == null || raw.msmeStatus === "" ? "NOT_MARKED" : enumOf(raw.msmeStatus, MSME_STATUSES, "msme_status"),
    gstStatus: raw.gstStatus == null || raw.gstStatus === "" ? "NOT_MARKED" : enumOf(raw.gstStatus, GST_STATUSES, "gst_status"),
    startupStatus: raw.startupStatus == null || raw.startupStatus === "" ? "ACTIVE" : enumOf(raw.startupStatus, STARTUP_STATUSES, "startup_status"),
    verificationStatus: raw.verificationStatus == null || raw.verificationStatus === "" ? "UNVERIFIED" : enumOf(raw.verificationStatus, VERIFICATION_AGGREGATES, "verification_status"),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── F. capabilities ───────── */

export function prepareCapabilityVocabularyEntry(raw) {
  raw = objectOf(raw, {});
  return {
    key: str(raw.key, 60, "key", true),
    label: str(raw.label, 120, "label", true),
    category: enumOf(raw.category, CAPABILITY_CATEGORIES, "category", "TECHNOLOGY"),
    description: str(raw.description, 500, "description"),
    active: raw.active !== false,
  };
}

export function prepareStartupCapability(raw) {
  raw = objectOf(raw, {});
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  const capabilityId = uuidOf(raw.capabilityId, "capability_id");
  if (!capabilityId) throw new AppError(400, "VALIDATION_FAILED", "capability_id is required");
  return {
    startupId,
    capabilityId,
    level: raw.level == null || raw.level === "" ? "DECLARED" : enumOf(raw.level, CAPABILITY_LEVELS, "level"),
    source: raw.source == null || raw.source === "" ? "DECLARED" : enumOf(raw.source, ["DECLARED", "VERIFIED", "MANUAL"], "source"),
  };
}

/* ───────── G. startup documents (metadata + reference only) ───────── */

export function prepareStartupDocument(raw) {
  raw = objectOf(raw, {});
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  return {
    startupId,
    docType: enumOf(raw.docType, DOCUMENT_TYPES, "doc_type"),
    label: str(raw.label, 200, "label"),
    status: raw.status == null || raw.status === "" ? "UPLOADED" : enumOf(raw.status, DOCUMENT_STATUSES, "status"),
    reference: str(raw.reference, 800, "reference"),
    chatId: uuidOf(raw.chatId, "chat_id"),
    extractedMeta: objectOf(raw.extractedMeta, {}),
  };
}

/* ───────── H. verification (honest source handling) ───────── */

export function prepareVerification(raw) {
  raw = objectOf(raw, {});
  const source = enumOf(raw.source, VERIFICATION_SOURCES, "source", "MANUAL");
  const targetId = uuidOf(raw.targetId, "target_id");
  if (!targetId) throw new AppError(400, "VALIDATION_FAILED", "target_id is required");
  /* We must never fabricate external verification: an "OFFICIAL" claim
     requires documented evidence and still only settles at PENDING —
     a human/authority later marks it VERIFIED. */
  if (source === "OFFICIAL" && !uuidOf(raw.evidenceDocumentId, "evidence_document_id")) {
    throw new AppError(400, "VALIDATION_FAILED", "OFFICIAL verification requires an evidence_document_id");
  }
  const status = enumOf(raw.status, VERIFICATION_STATUSES, "status", "PENDING");
  if (source === "OFFICIAL" && status === "VERIFIED") {
    throw new AppError(400, "VALIDATION_FAILED", "VERIFIED status cannot be self-asserted; requires review");
  }
  return {
    verificationType: enumOf(raw.verificationType, VERIFICATION_TYPES, "verification_type"),
    targetType: enumOf(raw.targetType, ["STARTUP", "ORGANIZATION", "STARTUP_DOCUMENT"], "target_type"),
    targetId,
    status,
    source,
    verifiedBy: str(raw.verifiedBy, 200, "verified_by"),
    verifiedAt: dateOf(raw.verifiedAt, "verified_at"),
    expiresAt: dateOf(raw.expiresAt, "expires_at"),
    evidenceDocumentId: uuidOf(raw.evidenceDocumentId, "evidence_document_id"),
    verificationNotes: str(raw.verificationNotes, 2000, "verification_notes"),
    isDemo: source === "DEMO" || !!raw.isDemo,
  };
}

/* ───────── STEP 3 — eligibility ───────── */

export function prepareEligibilityRule(raw) {
  raw = objectOf(raw, {});
  return {
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    name: str(raw.name, 200, "name", true),
    description: str(raw.description, 1000, "description"),
    criteriaPath: str(raw.criteriaPath, 200, "criteria_path"),
    operator: enumOf(raw.operator, ELIGIBILITY_OPERATORS, "operator", "EXISTS"),
    referenceValue: jsonValue(raw.referenceValue, {}),
    mandatory: raw.mandatory !== false,
    category: str(raw.category, 100, "category"),
    source: str(raw.source, 500, "source"),
    sourceMode: enumOrEmpty(raw.sourceMode, RULE_SOURCE_MODES, "source_mode"),
    weight: scoreInt(raw.weight, "weight") ?? 0,
    active: raw.active !== false,
  };
}

export function prepareEligibilityCheckRequest(raw) {
  raw = objectOf(raw, {});
  const challengeId = uuidOf(raw.challengeId, "challenge_id");
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!challengeId) throw new AppError(400, "VALIDATION_FAILED", "challenge_id is required");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  return { challengeId, startupId };
}

/* ───────── STEP 3.5 — eligibility engine (additive) ─────────
   Extends the existing eligibility foundation with a richer,
   configurable, provenance-aware rule model and evidence-aware,
   deterministic evaluation. Existing functions are left intact. */

/* Extended rule shape. Accepts all legacy fields (criteriaPath/operator/
   referenceValue/mandatory/weight) so existing endpoints keep working,
   plus the new rule_type / severity / provenance / versioning / lifecycle
   fields. `rule_type` may be omitted: when omitted the engine infers a
   sensible type from the operator for backward compatibility. */
export function prepareEligibilityRuleV2(raw) {
  raw = objectOf(raw, {});
  const base = prepareEligibilityRule(raw);
  return {
    ...base,
    ruleType: enumOrEmpty(raw.ruleType, ELIGIBILITY_RULE_TYPES, "rule_type"),
    severity: enumOf(raw.severity, RULE_SEVERITY, "severity", "MANDATORY"),
    sourceCategory: enumOrEmpty(raw.sourceCategory, RULE_SOURCE_CATEGORIES, "source_category"),
    authorityScope: enumOrEmpty(raw.authorityScope, RULE_AUTHORITY_SCOPE, "authority_scope"),
    sourceReference: str(raw.sourceReference, 500, "source_reference"),
    sourceDocument: str(raw.sourceDocument, 300, "source_document"),
    sectionRef: str(raw.sectionRef, 200, "section_ref"),
    sourcePublishedAt: dateOf(raw.sourcePublishedAt, "source_published_at"),
    sourceEffectiveAt: dateOf(raw.sourceEffectiveAt, "source_effective_at"),
    sourceRetrievedAt: dateOf(raw.sourceRetrievedAt, "source_retrieved_at"),
    ruleVersion: positiveInt(raw.ruleVersion, "rule_version") ?? 1,
    effectiveFrom: dateOf(raw.effectiveFrom, "effective_from"),
    effectiveUntil: dateOf(raw.effectiveUntil, "effective_until"),
    lifecycleStatus: enumOf(raw.lifecycleStatus, RULE_LIFECYCLE_STATUS, "lifecycle_status", "DRAFT"),
    supersedesRuleId: uuidOf(raw.supersedesRuleId, "supersedes_rule_id"),
    evidenceRequired: raw.evidenceRequired !== false,
    trustThreshold: enumOrEmpty(raw.trustThreshold, TRUST_LEVELS, "trust_threshold"),
    updatedBy: str(raw.updatedBy, 200, "updated_by"),
    changeReason: str(raw.changeReason, 500, "change_reason"),
  };
}

/* Immutable snapshot of a versioned rule at evaluation time. */
export function prepareEligibilityRuleVersion(raw) {
  raw = objectOf(raw, {});
  return {
    ruleId: uuidOf(raw.ruleId, "rule_id"),
    version: positiveInt(raw.version, "version") ?? 1,
    snapshot: jsonValue(raw.snapshot, {}),
    createdBy: str(raw.createdBy, 200, "created_by"),
    changeReason: str(raw.changeReason, 500, "change_reason"),
  };
}

export function prepareRuleReviewAction(raw) {
  raw = objectOf(raw, {});
  const action = enumOf(raw.action, ["APPROVE", "REJECT", "EDIT", "REQUEST_CLARIFICATION", "DEACTIVATE", "REVIEW_CONFLICT"], "action");
  return {
    ruleId: uuidOf(raw.ruleId, "rule_id"),
    action,
    comment: str(raw.comment, 2000, "comment"),
    actorId: str(raw.actorId, 200, "actor_id"),
  };
}

/* Evaluate trust (Part 13). source_verified/document_verified are the only
   states that count as trusted evidence for MANDATORY legal rules; the
   caller supplies the startup's field trust level (or evidence state). */
export function trustAcceptable(trust, { strict = false } = {}) {
  if (!trust) return { accepted: false, level: "NOT_PROVIDED", reason: "Not provided" };
  if (trust === "SOURCE_VERIFIED") return { accepted: true, level: trust, reason: "Source verified evidence" };
  if (trust === "DOCUMENT_VERIFIED") return { accepted: !strict, level: trust, reason: strict ? "Requires stronger verification for this rule" : "Document verified" };
  return {
    accepted: false,
    level: trust,
    reason: {
      DOCUMENT_EXTRACTED: "Evidence extracted but not verified",
      USER_PROVIDED: "Self-declared; verification required",
      AI_INFERRED: "AI inference is not accepted as verified evidence",
      AI_SUGGESTED: "AI suggestion is not accepted as verified evidence",
      REQUIRES_REVIEW: "Requires human review",
      NOT_PROVIDED: "Not provided",
    }[trust] || "Insufficient verification",
  };
}

/* The engine never fabricates verification. Map any profile field value to
   a trust level using the existing verifications + evidence records. If no
   verified record exists the value is treated as USER_PROVIDED at best, and
   AI-inferred values are explicitly non-trusted. */
export function fieldTrust(verification, fallback = "USER_PROVIDED") {
  if (!verification) return fallback;
  const s = verification.status;
  if (s === "VERIFIED") {
    const src = String(verification.source || "");
    if (src === "SOURCE_VERIFIED" || src === "OFFICIAL") return "SOURCE_VERIFIED";
    return "DOCUMENT_VERIFIED";
  }
  if (s === "SELF_DECLARED") return "USER_PROVIDED";
  if (s === "NOT_PROVIDED") return "NOT_PROVIDED";
  return "REQUIRES_REVIEW";
}

/* Deterministic, evidence-aware evaluation (Parts 12, 14, 16). */
export function evaluateRuleEvidenceAware(rule, ctx = {}) {
  /* ctx: { startup, capabilities, challenge, evidence: [], verifications: [],
          documents: [], certifications: [], profile } */
  const type = rule.ruleType || guessRuleType(rule);
  const sev = rule.severity || "MANDATORY";
  const resultStub = {
    ruleId: rule.id,
    ruleName: rule.name || rule.name,
    ruleType: type,
    severity: sev,
    mandatory: sev === "MANDATORY",
    category: rule.category || "",
    sourceReference: rule.sourceReference || rule.source || "",
    authorityScope: rule.authorityScope || "UNSPECIFIED",
    ruleVersion: rule.ruleVersion || 1,
    state: "UNKNOWN",
    passed: false,
    reason: "",
    evidence: [],
    trustLevel: "NOT_PROVIDED",
    recommendedAction: "",
    aiNote: "",
  };

  try {
    switch (type) {
      case "REQUIRED_ATTRIBUTE": {
        const ok = valueAt(ctx.startup, rule.criteriaPath);
        if (!ok) return withState(resultStub, "MISSING_INFORMATION", "Required attribute is not provided", `Provide ${rule.name}`);
        return withState(resultStub, "PASS", "Required attribute is present", "None");
      }
      case "ATTRIBUTE_EQUALS": {
        const actual = valueAt(ctx.startup, rule.criteriaPath);
        if (actual == null) return withState(resultStub, "MISSING_INFORMATION", "Required value not provided", `Provide ${rule.name}`);
        return String(actual) === String(rule.referenceValue)
          ? withState(resultStub, "PASS", "Value matches the rule", "None")
          : withState(resultStub, "FAIL", "Value does not match the rule", "Correct the provided value");
      }
      case "ATTRIBUTE_IN_SET": {
        const actual = valueAt(ctx.startup, rule.criteriaPath);
        if (actual == null) return withState(resultStub, "MISSING_INFORMATION", "Required value not provided", `Provide ${rule.name}`);
        const list = Array.isArray(rule.referenceValue) ? rule.referenceValue.map(String) : [];
        return list.includes(String(actual))
          ? withState(resultStub, "PASS", "Value is in the allowed set", "None")
          : withState(resultStub, "FAIL", "Value is not in the allowed set", "Correct the provided value");
      }
      case "ATTRIBUTE_NOT_IN_SET": {
        const actual = valueAt(ctx.startup, rule.criteriaPath);
        if (actual == null) return withState(resultStub, "MISSING_INFORMATION", "Required value not provided", `Provide ${rule.name}`);
        const list = Array.isArray(rule.referenceValue) ? rule.referenceValue.map(String) : [];
        return list.includes(String(actual))
          ? withState(resultStub, "FAIL", "Value is in the excluded set", "Correct the provided value")
          : withState(resultStub, "PASS", "Value is not in the excluded set", "None");
      }
      case "BOOLEAN_REQUIREMENT": {
        const actual = valueAt(ctx.startup, rule.criteriaPath);
        if (actual == null) return withState(resultStub, "MISSING_INFORMATION", "Boolean requirement not provided", `Provide ${rule.name}`);
        const want = String(rule.referenceValue).toLowerCase() === "true";
        return Boolean(actual) === want
          ? withState(resultStub, "PASS", "Boolean requirement satisfied", "None")
          : withState(resultStub, "FAIL", "Boolean requirement not satisfied", "Update the provided value");
      }
      case "DOCUMENT_REQUIRED": {
        const docType = rule.referenceValue && rule.referenceValue.docType ? rule.referenceValue.docType
          : (typeof rule.referenceValue === "string" ? rule.referenceValue : null);
        const docs = ctx.documents || [];
        const match = docs.find((d) => !docType || String(d.docType || "") === String(docType));
        if (!match) return withState(resultStub, "REQUIRES_EVIDENCE", "Required document not found", "Upload evidence");
        const trust = docTrust(match, ctx);
        if (trust === "SOURCE_VERIFIED" || trust === "DOCUMENT_VERIFIED") {
          return withState(resultStub, "PASS", "Required document present", "None", [match.id], trust);
        }
        return withState(resultStub, "REQUIRES_HUMAN_REVIEW", "Document present but not verified", "Complete verification", [match.id], trust);
      }
      case "DOCUMENT_VALID": {
        const docType = typeof rule.referenceValue === "string" ? rule.referenceValue : null;
        const match = (ctx.documents || []).find((d) => !docType || String(d.docType || "") === String(docType));
        if (!match) return withState(resultStub, "REQUIRES_EVIDENCE", "Required document not found", "Upload evidence");
        if (match.expiryStatus === "EXPIRED") {
          return withState(resultStub, sev === "MANDATORY" ? "FAIL" : "REQUIRES_HUMAN_REVIEW", "Document has expired", "Renew / provide valid document", [match.id], "NOT_PROVIDED");
        }
        const trust = docTrust(match, ctx);
        if (trust === "SOURCE_VERIFIED" || trust === "DOCUMENT_VERIFIED") {
          return withState(resultStub, "PASS", "Document is present and valid", "None", [match.id], trust);
        }
        return withState(resultStub, "REQUIRES_HUMAN_REVIEW", "Document present but verification incomplete", "Complete verification", [match.id], trust);
      }
      case "CERTIFICATION_REQUIRED": {
        const certName = rule.referenceValue && rule.referenceValue.name ? String(rule.referenceValue.name) : null;
        const certs = ctx.certifications || [];
        let match = certName ? certs.find((c) => String(c.name).toLowerCase() === certName.toLowerCase()) : certs[0];
        if (!match) {
          return withState(resultStub, sev === "MANDATORY" ? "FAIL" : "REQUIRES_EVIDENCE",
            certName ? `Required certification '${certName}' missing` : "Required certification missing",
            "Upload / provide the certification");
        }
        if (match.expiryStatus === "EXPIRED") {
          return withState(resultStub, sev === "MANDATORY" ? "FAIL" : "REQUIRES_HUMAN_REVIEW", "Certification has expired", "Renew the certification", [match.id]);
        }
        const trust = certificationTrust(match);
        if (trust === "SOURCE_VERIFIED" || trust === "DOCUMENT_VERIFIED") {
          return withState(resultStub, "PASS", "Required certification is present and verified", "None", [match.id], trust);
        }
        return withState(resultStub, "REQUIRES_HUMAN_REVIEW", "Required certification present but not verified", "Complete verification", [match.id], trust);
      }
      case "CAPABILITY_REQUIRED": {
        const wantKey = rule.referenceValue && (rule.referenceValue.key || rule.referenceValue.value) || rule.criteriaPath;
        const caps = ctx.capabilities || [];
        const has = caps.some((c) => {
          const key = (c.capabilityKey || c.key || c.name || "").toLowerCase();
          return key.includes(String(wantKey || "").toLowerCase());
        });
        return has
          ? withState(resultStub, "PASS", "Required capability is present", "None")
          : withState(resultStub, sev === "MANDATORY" ? "FAIL" : "REQUIRES_EVIDENCE", "Required capability missing", "Update the startup profile / capabilities", null, undefined, "Add the capability to the startup profile");
      }
      case "SECTOR_MATCH":
      case "GEOGRAPHY_MATCH": {
        const want = rule.referenceValue && (rule.referenceValue.value || rule.referenceValue.sector || rule.referenceValue.geography) || "";
        const actual = valueAt(ctx.startup, rule.criteriaPath);
        const hay = String(actual == null ? "" : actual).toLowerCase();
        const ok = want ? hay.includes(String(want).toLowerCase()) : hay !== "";
        return ok
          ? withState(resultStub, "PASS", type === "SECTOR_MATCH" ? "Sector matches the challenge" : "Geography matches the challenge", "None")
          : withState(resultStub, sev === "MANDATORY" ? "FAIL" : "REQUIRES_EVIDENCE", type === "SECTOR_MATCH" ? "Sector does not match" : "Geography does not match", "Update profile");
      }
      case "EXPERIENCE_REQUIRED":
      case "DEPLOYMENT_REQUIRED": {
        const reqCount = Number(rule.referenceValue && rule.referenceValue.count != null ? rule.referenceValue.count : (typeof rule.referenceValue === "number" ? rule.referenceValue : 1));
        const deploymentCount = Number(ctx.startup && ctx.startup.deploymentCount != null ? ctx.startup.deploymentCount : 0);
        if (!deploymentCount) {
          return withState(resultStub, sev === "ADVISORY" ? "NOT_APPLICABLE" : "REQUIRES_EVIDENCE",
            "No deployment/experience evidence provided", "Provide deployment evidence");
        }
        if (deploymentCount < reqCount) {
          return withState(resultStub, sev === "MANDATORY" ? "FAIL" : "REQUIRES_EVIDENCE",
            `Deployment/experience below requirement (${deploymentCount}/${reqCount})`, "Provide additional evidence");
        }
        const ev = ctx.evidence || [];
        const depEvidence = ev.some((e) => /deploy|pilot|experience/i.test(String(e.section || "") + " " + String(e.claim || "")));
        if (!depEvidence) return withState(resultStub, "REQUIRES_EVIDENCE", "Deployment claim has no supporting evidence", "Upload deployment evidence");
        const trust = evidenceTrust(ev);
        return trust === "SOURCE_VERIFIED" || trust === "DOCUMENT_VERIFIED"
          ? withState(resultStub, "PASS", "Deployment/experience evidence verified", "None", ev.map((e) => e.id), trust)
          : withState(resultStub, "REQUIRES_HUMAN_REVIEW", "Deployment claim present but not verified", "Complete verification", ev.map((e) => e.id), trust);
      }
      case "DATE_VALIDITY": {
        const field = rule.criteriaPath || "incorporationDate";
        const dateStr = valueAt(ctx.startup, field);
        if (!dateStr) return withState(resultStub, "MISSING_INFORMATION", "Date not provided", `Provide ${field}`);
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return withState(resultStub, "UNKNOWN", "Date is invalid", "Correct the date value");
        const effectiveUntil = rule.effectiveUntil ? new Date(rule.effectiveUntil) : null;
        if (effectiveUntil && d > effectiveUntil) {
          return withState(resultStub, "FAIL", "Date is outside the required window", "Review the date");
        }
        return withState(resultStub, "PASS", "Date is within the valid window", "None");
      }
      case "CUSTOM_REVIEW_REQUIRED": {
        return withState(resultStub, "REQUIRES_HUMAN_REVIEW", "This requirement needs human assessment", "Human review required");
      }
      case "COMPOSITE_RULE": {
        return withState(resultStub, "REQUIRES_HUMAN_REVIEW", "Composite rule evaluated against its sub-rules", "Review sub-rules", null, undefined, "Evaluate the referenced sub-rules");
      }
      default:
        return withState(resultStub, "REQUIRES_HUMAN_REVIEW", "Rule type not recognized; human review required", "Human review required");
    }
  } catch (e) {
    return withState(resultStub, "UNKNOWN", "Evaluation error: " + (e && e.message || "unknown"), "Review the rule definition");
  }
}

function withState(stub, state, reason, action, evidenceIds, trustLevel, aiNote) {
  return {
    ...stub,
    state,
    passed: state === "PASS",
    reason,
    recommendedAction: action || "",
    evidence: evidenceIds || [],
    trustLevel: trustLevel || (state === "PASS" ? "DOCUMENT_VERIFIED" : "USER_PROVIDED"),
    aiNote: aiNote || "",
  };
}

function guessRuleType(rule) {
  const op = rule.operator;
  if (op === "HAS_CAPABILITY") return "CAPABILITY_REQUIRED";
  if (op === "EQUAL") return "ATTRIBUTE_EQUALS";
  if (op === "IN") return "ATTRIBUTE_IN_SET";
  if (op === "NOT_IN") return "ATTRIBUTE_NOT_IN_SET";
  if (op === "EXISTS") return "REQUIRED_ATTRIBUTE";
  if (op === "CONTAINS") return "SECTOR_MATCH";
  return "REQUIRED_ATTRIBUTE";
}

function valueAt(obj, path) {
  return String(path || "").split(".").filter(Boolean).reduce((acc, k) => (acc && typeof acc === "object" ? acc[k] : undefined), obj);
}

function docTrust(doc, ctx) {
  if (!doc) return "NOT_PROVIDED";
  if (doc.status === "VERIFIED") {
    const src = String(doc.verificationStatus || (doc.evidence && doc.evidence.provenance) || "").toUpperCase();
    if (src.includes("SOURCE") || src.includes("OFFICIAL")) return "SOURCE_VERIFIED";
    return "DOCUMENT_VERIFIED";
  }
  if (doc.status === "EXTRACTED" || doc.verificationStatus === "DOCUMENT_EXTRACTED") return "DOCUMENT_EXTRACTED";
  if (doc.status === "EXPIRED") return "NOT_PROVIDED";
  const ver = (ctx.verifications || []).find((v) => v.targetId === doc.id);
  return ver ? fieldTrust(ver, "USER_PROVIDED") : "USER_PROVIDED";
}

function evidenceTrust(evidenceList) {
  const ev = evidenceList && evidenceList[0];
  if (!ev) return "NOT_PROVIDED";
  const vs = ev.verificationStatus || ev.provenance || "";
  const s = String(vs).toUpperCase();
  if (s === "SOURCE_VERIFIED") return "SOURCE_VERIFIED";
  if (s === "DOCUMENT_EXTRACTED" || s === "EXTRACTED") return "DOCUMENT_EXTRACTED";
  if (s === "VERIFIED" || s === "DOCUMENT_VERIFIED") return "DOCUMENT_VERIFIED";
  if (s === "SELF_DECLARED" || s === "USER_PROVIDED") return "USER_PROVIDED";
  if (s === "AI_INFERRED") return "AI_INFERRED";
  if (s === "AI_SUGGESTED") return "AI_SUGGESTED";
  return "REQUIRES_REVIEW";
}

function certificationTrust(cert) {
  if (!cert) return "NOT_PROVIDED";
  const vs = String(cert.source || (cert.verificationStatus || "")).toUpperCase();
  if (vs === "SOURCE_VERIFIED" || vs === "OFFICIAL" || cert.verifiedBy) return "SOURCE_VERIFIED";
  if (vs === "DOCUMENT_VERIFIED" || vs === "VERIFIED") return "DOCUMENT_VERIFIED";
  if (vs === "AI_INFERRED") return "AI_INFERRED";
  return "USER_PROVIDED";
}

/* Rule-based overall verdict (Part 15). Not a percentage — mandated by the
   mandatory rule pass/fail set plus review/evidence states. */
export function aggregateEligibilityV2(results) {
  const r = results || [];
  const mandRes = r.filter((x) => x.mandatory);
  const hardFail = mandRes.filter((x) => x.state === "FAIL").length;
  const missing = r.filter((x) => x.state === "MISSING_INFORMATION").length;
  const reqEv = r.filter((x) => x.state === "REQUIRES_EVIDENCE").length;
  const review = r.filter((x) => x.state === "REQUIRES_HUMAN_REVIEW" || x.state === "CUSTOM_REVIEW_REQUIRED").length;
  const conflict = r.filter((x) => x.state === "RULE_CONFLICT").length;
  const nA = r.filter((x) => x.state === "NOT_APPLICABLE").length;
  const passed = r.filter((x) => x.state === "PASS").length;
  const total = r.length || 0;

  let verdict = "UNKNOWN";
  if (conflict) verdict = "RULE_CONFLICT";
  else if (hardFail) verdict = "NOT_ELIGIBLE";
  else if (missing || reqEv) verdict = "CONDITIONAL";
  else if (review) verdict = "ELIGIBLE_WITH_REVIEW";
  else if (passed === total && total > 0) verdict = "ELIGIBLE";

  return {
    verdict,
    mandatoryPassed: mandRes.filter((x) => x.state === "PASS").length,
    mandatoryFailed: hardFail,
    missingInformation: missing,
    requiresEvidence: reqEv,
    reviewRequired: review,
    notApplicable: nA,
    passed,
    total,
    evidenceCoverage: r.length ? Math.round((r.filter((x) => x.evidence && x.evidence.length).length / r.length) * 100) : 0,
    terminatedByHardFail: hardFail > 0,
  };
}

/* Part 10 — potential rule conflicts. The engine never silently prefers one
   rule; it surfaces the conflict for human/policy review. */
export function detectRuleConflicts(rules) {
  const active = (rules || []).filter((r) => r.lifecycleStatus === "ACTIVE");
  const conflicts = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (a.criteriaPath && a.criteriaPath === b.criteriaPath &&
          a.ruleType && a.ruleType !== b.ruleType) {
        conflicts.push({
          ruleA: a.id, ruleB: b.id,
          ruleAName: a.name, ruleBName: b.name,
          scopeA: a.authorityScope || "UNSPECIFIED", scopeB: b.authorityScope || "UNSPECIFIED",
          type: "CONTRADICTORY_REQUIREMENT",
          detail: `Rules target the same attribute (${a.criteriaPath}) with conflicting types`,
        });
      }
    }
  }
  return conflicts;
}

/* ═══════════════════════════════════════════════════════════════════
   MATCHING ENGINE — additive, deterministic, evidence-aware.
   Eligibility is a HARD GATE; matching is a RANKING. The engine never
   re-derives eligibility and never lets an ineligible startup outrank an
   eligible one (Parts 1, 3). Scores are 0-1 distilled from structured
   (deterministic) + semantic signals. No LLM in the scoring path, so AI
   failure never blocks matching (Parts 26-28, 55).
   ═══════════════════════════════════════════════════════════════════ */

/* ── low-level text helpers (case/diacritic-insensitive) ── */
function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function tokenSet(text) {
  return new Set(tokens(text));
}
function jaccard(a, b) {
  const A = tokenSet(a), B = tokenSet(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = new Set([...A, ...B]);
  return inter / union.size;
}
/* multi-word containment: fraction of needle tokens present in haystack */
function tokenContainment(needle, haystack) {
  const N = tokenSet(needle), H = tokenSet(haystack);
  if (!N.size) return 0;
  let hit = 0;
  for (const t of N) if (H.has(t)) hit++;
  return hit / N.size;
}
/* longest shared word (single-token equality) */
function sharedTokenScore(a, b) {
  const A = tokenSet(a), B = tokenSet(b);
  let best = 0;
  for (const t of A) if (B.has(t)) best = 1;
  return best;
}

/* ── modular embedding service (Part 10).
   No external embedding model exists in this codebase. A deterministic,
   dependency-free token semantic distance is used so results are stable and
   reproducible and NEVER depend on an AI/LLM. A pluggable provider hook is
   provided so a real embedding model can be swapped in later without
   changing the matching engine. Results are cached by the caller (Part 45). */
export function createEmbeddingService(options = {}) {
  return {
    /* semantic similarity 0-1 between two short text units */
    similarity(a, b) {
      if (options.provider && typeof options.provider.similarity === "function") {
        return options.provider.similarity(a, b);
      }
      if (!a || !b) return 0;
      /* family: Jaccard + containment + shared-token, bounded [0,1] */
      const j = jaccard(a, b);
      const c = Math.max(tokenContainment(a, b), tokenContainment(b, a));
      const s = sharedTokenScore(a, b);
      const raw = 0.45 * j + 0.4 * c + 0.15 * s;
      return Math.max(0, Math.min(1, raw));
    },
    /* cache key for a text unit; deterministic */
    key(text) {
      return tokens(text).sort().join("|");
    },
    model: (options.provider && options.provider.model) || "deterministic-token-v1",
  };
}

/* ── structured representations (Parts 4-5) ── */

export function buildChallengeRepresentation(challenge = {}) {
  const tech = arrayOf(challenge.technicalCapabilities, [], 80);
  const sectors = arrayOf(challenge.sectors, [], 40)
    .concat(challenge.sector ? [challenge.sector] : []);
  return {
    domain: challenge.sector || "",
    sectors: [...new Set(sectors.map((s) => String(s).toLowerCase()))],
    problems: [challenge.title, challenge.description, challenge.problemStatement]
      .filter(Boolean),
    desired_outcomes: arrayOf(challenge.expectedOutcomes, [], 40)
      .concat(challenge.objective ? [challenge.objective] : []),
    capabilities: tech,
    technologies: tech,
    use_cases: arrayOf(challenge.useCases, [], 40),
    constraints: arrayOf(challenge.constraints, [], 40),
    geography: str(challenge.geography, 300, "geography"),
    target_users: str(challenge.targetUsers, 1000, "target_users"),
    success_metrics: arrayOf(challenge.successMetrics, [], 40),
    data_requirements: arrayOf(challenge.dataRequirements, [], 40),
    deployment_requirements: {
      pilotDurationDays: challenge.pilotDurationDays || null,
      pilotRequirements: objectOf(challenge.pilotRequirements, {}),
      evaluationFramework: objectOf(challenge.evaluationFramework, {}),
    },
    integration_requirements: arrayOf(challenge.constraints, [], 40),
  };
}

export function buildStartupRepresentation(intel = {}) {
  const profile = intel.profile || {};
  const caps = (intel.capabilities || []).map((c) => ({
    capabilityKey: c.capabilityKey || "",
    label: c.label || "",
    category: c.category || "TECHNOLOGY",
    level: c.level || "DECLARED",
    source: c.source || "DECLARED",
  }));
  const startup = intel.startup || profile.startup || {};
  const attributes = objectOf(profile.attributes, {});
  return {
    startup,
    sectors: [startup.sector, attributes.sector]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase()),
    capabilities: caps,
    technologies: caps.filter((c) => c.category === "TECHNOLOGY"),
    use_cases: caps.filter((c) => c.category === "USE_CASE")
      .concat(arrayOf(attributes.useCases, [], 40).map((u) => ({ label: u, category: "USE_CASE", level: "DECLARED", source: "DECLARED" }))),
    products: arrayOf(attributes.products, [], 40).map((p) => ({ label: p })),
    deployment_domains: arrayOf(attributes.deploymentDomains, [], 40)
      .concat(caps.filter((c) => c.category === "SECTOR").map((c) => c.label)),
    government_experience: arrayOf(attributes.governmentDeployments, [], 40),
    geography: str(startup.state || attributes.state, 100, "state"),
    location: str(startup.state, 100, "state"),
    pilot_readiness: objectOf(attributes.pilotReadiness, {}),
    scale_capacity: objectOf(attributes.scaleCapacity, {}),
    evidence: intel.evidence || [],
    verifications: intel.verifications || [],
    certifications: intel.certifications || [],
    documents: intel.documents || [],
  };
}

/* ── config validation (Parts 7-8) ── */

export function prepareMatchingConfiguration(raw) {
  raw = objectOf(raw, {});
  const challengeId = uuidOf(raw.challengeId, "challenge_id");
  if (!challengeId) throw new AppError(400, "VALIDATION_FAILED", "challenge_id is required");
  const version = positiveInt(raw.configVersion, "config_version");
  const dimensions = Array.isArray(raw.dimensions) ? raw.dimensions : [];
  if (!dimensions.length) {
    throw new AppError(400, "VALIDATION_FAILED", "at least one matching dimension is required");
  }
  const seen = new Set();
  const prepared = dimensions.map((d) => {
    const key = str(d && d.key, 100, "dimension key", true);
    if (!MATCH_DIMENSIONS.includes(key)) {
      throw new AppError(400, "VALIDATION_FAILED", `Unknown matching dimension: '${key}'`);
    }
    if (seen.has(key)) throw new AppError(400, "VALIDATION_FAILED", `Duplicate dimension: '${key}'`);
    seen.add(key);
    return {
      key,
      weight: nonNegNumber(d && d.weight, `weight for ${key}`) ?? 0,
      active: d && d.active !== false,
    };
  });
  const active = prepared.filter((d) => d.active);
  const total = active.reduce((s, d) => s + d.weight, 0);
  const incomplete = Math.abs(total - 100) > 1e-6;
  return {
    challengeId,
    configVersion: version ?? 1,
    dimensions: prepared,
    activeDimensions: active,
    totalWeight: Math.round(total * 100) / 100,
    complete: !incomplete,
    normalized: false,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function validateMatchingWeights(dimensions) {
  const active = (dimensions || []).filter((d) => d.active);
  const seen = new Set();
  for (const d of active) {
    if (seen.has(d.key)) {
      return { valid: false, message: "Duplicate dimensions are not allowed." };
    }
    seen.add(d.key);
    if (!(d.weight >= 0)) {
      return { valid: false, message: `All active weights must be >= 0 (${d.key}).` };
    }
  }
  const total = active.reduce((s, d) => s + d.weight, 0);
  if (Math.abs(total - 100) > 1e-6) {
    return {
      valid: false,
      message: `Weight configuration incomplete: total is ${total}%, expected 100%.`,
      total,
    };
  }
  return { valid: true, total, dimensions: active };
}

/* ── capability vocabulary building + hierarchy (Part 12) ── */
export function buildCapabilityIndex(capabilities = []) {
  const byKey = new Map();
  for (const c of capabilities) {
    if (!c || !c.key) continue;
    byKey.set(c.key.toLowerCase(), c);
    if (c.label) byKey.set(c.label.toLowerCase(), c);
  }
  return byKey;
}

/* Given the challenge-required unit (key or label) and all startup
   capability labels/keys, return a CAPABILITY_MATCH_TYPES classification.
   EXACT requires an identical known key/label; CLOSE requires a multi-word
   overlap high enough to be confident; RELATED uses the capability
   hierarchy/category; MISSING when nothing overlaps; UNKNOWN when required
   unit is empty. */
export function classifyCapabilityMatch(required, startupCapabilities, capabilityIndex = new Map()) {
  const req = String(required || "").trim();
  if (!req) return { type: "UNKNOWN", score: 0, matchedKeys: [] };
  const reqKey = req.toLowerCase();
  const matched = (startupCapabilities || [])
    .map((c) => ({ key: String(c.capabilityKey || c.key || "").toLowerCase(), label: String(c.label || "") }))
    .filter((c) => c.key || c.label);
  if (!matched.length) return { type: "MISSING", score: 0, matchedKeys: [] };

  const exactEntry = capabilityIndex.get(reqKey);
  const exactLabel = exactEntry && exactEntry.label;
  const hitList = [];

  for (const m of matched) {
    let hit = null;
    if (m.key === reqKey || m.label.toLowerCase() === reqKey) {
      hit = { key: m.key, kind: "EXACT" };
    } else if (exactLabel && (m.key === exactLabel.toLowerCase() || m.label.toLowerCase() === exactLabel.toLowerCase())) {
      hit = { key: m.key, kind: "EXACT" };
    } else {
      const c = tokenContainment(req, m.label) + tokenContainment(req, m.key);
      if (c >= 1.0) hit = { key: m.key, kind: "EXACT" };
      else if (c >= 0.75) hit = { key: m.key, kind: "CLOSE" };
      else if (c >= 0.4) hit = { key: m.key, kind: "RELATED" };
      else {
        const catMatch =
          exactEntry && m && ((exactEntry.category && m.category === exactEntry.category)
            || (exactEntry.key && m.key && exactEntry.key.split("-")[0] === m.key.split("-")[0]));
        if (catMatch) hit = { key: m.key, kind: "RELATED" };
      }
    }
    if (hit) hitList.push(hit);
  }
  if (!hitList.length) return { type: "MISSING", score: 0, matchedKeys: [] };
  const best = hitList.sort((a, b) => kindRank(a.kind) - kindRank(b.kind))[0];
  return {
    type: best.kind,
    score: kindScore(best.kind),
    matchedKeys: hitList.map((h) => h.key),
  };
}
function kindRank(kind) {
  return { EXACT_MATCH: 0, EXACT: 0, CLOSE: 1, CLOSE_MATCH: 1, RELATED: 2, PARTIAL: 3, MISSING: 4, UNKNOWN: 5 }[kind] ?? 5;
}
function kindScore(kind) {
  return { EXACT_MATCH: 1, EXACT: 1, CLOSE: 0.85, CLOSE_MATCH: 0.85, RELATED: 0.6, PARTIAL: 0.35, MISSING: 0, UNKNOWN: 0 }[kind] ?? 0;
}

/* ── dimension scoring (deterministic; returns {score, evidence states, notes}) ── */

function evidenceForField(startupRep, section, field) {
  const ev = (startupRep.evidence || []).find((e) => e.section === section && (!field || e.field === field));
  const ver = (startupRep.verifications || []).find((v) => v.section === section && (!field || v.field === field));
  if (ev) {
    if (ev.verificationStatus === "VERIFIED") return { state: "VERIFIED", confidence: Number(ev.confidence) || 0.9 };
    if (ev.provenance === "DOCUMENT_EXTRACTED") return { state: "DOCUMENT_EXTRACTED", confidence: 0.7 };
    return { state: "USER_PROVIDED", confidence: 0.5 };
  }
  if (ver) {
    if (ver.status === "VERIFIED") return { state: "VERIFIED", confidence: Number(ver.confidence) || 0.85 };
    return { state: "USER_PROVIDED", confidence: 0.5 };
  }
  return { state: "MISSING", confidence: 0 };
}

function scoreProblemFit(ch, su) {
  const unit = ch.problems.join(" ") + " " + ch.desired_outcomes.join(" ") + " " + ch.use_cases.join(" ");
  const suText = su.use_cases.map((u) => u.label).join(" ")
    + " " + su.capabilities.map((c) => c.label).join(" ")
    + " " + su.deployment_domains.join(" ")
    + " " + (su.startup && su.startup.description || "");
  if (!unit.trim() || !suText.trim()) return { score: 0, state: "UNKNOWN", note: "Insufficient problem or startup information to score problem fit." };
  return { score: embed().similarity(unit, suText), state: stateOf(embed().similarity(unit, suText)), note: "Semantic + structured alignment with the challenge problem and outcomes." };
}

function scoreCapabilityFit(ch, su, index) {
  const required = ch.capabilities.length ? ch.capabilities : ch.use_cases;
  if (!required.length) return { score: 0, state: "MISSING", note: "Challenge does not declare required capabilities." };
  let sum = 0; const rows = [];
  for (const r of required.slice(0, 40)) {
    const m = classifyCapabilityMatch(r, su.capabilities, index);
    sum += m.score; rows.push({ required: r, type: m.type, matchedKeys: m.matchedKeys || [] });
  }
  const avg = sum / required.length;
  return { score: avg, state: stateOf(avg), note: `${rows.filter((r) => r.type === "EXACT").length} exact, ${rows.filter((r) => r.type === "RELATED").length} related capability matches.`, rows };
}

function scoreTechnologyFit(ch, su) {
  const req = ch.technologies;
  if (!req.length) return { score: 0, state: "MISSING", note: "Challenge does not declare required technologies." };
  const suTech = su.technologies.map((t) => ({ capabilityKey: t.capabilityKey, label: t.label }));
  let sum = 0;
  for (const r of req.slice(0, 40)) {
    const m = classifyCapabilityMatch(r, suTech.length ? suTech : su.capabilities);
    sum += m.score;
  }
  const avg = sum / req.length;
  return { score: avg, state: stateOf(avg), note: "Technology overlap across required technologies." };
}

function scoreUseCaseFit(ch, su) {
  const req = ch.use_cases.length ? ch.use_cases : ch.problems;
  const suUnits = su.use_cases.map((u) => u.label);
  if (!req.length) return { score: 0, state: "MISSING", note: "Challenge does not declare use cases." };
  let sum = 0;
  for (const r of req.slice(0, 40)) {
    let best = 0;
    for (const u of suUnits) best = Math.max(best, embed().similarity(r, u));
    sum += best;
  }
  const avg = sum / req.length;
  return { score: avg, state: stateOf(avg), note: "Use-case semantic overlap." };
}

function scoreSectorFit(ch, su) {
  const req = ch.sectors;
  if (!req.length) return { score: 0, state: "MISSING", note: "Challenge has no declared sector." };
  let best = 0;
  for (const r of req) for (const s of su.sectors) best = Math.max(best, String(r) === String(s) ? 1 : embed().similarity(r, s));
  return { score: best, state: stateOf(best), note: "Sector alignment." };
}

function scoreDeploymentExperience(su) {
  const domains = su.deployment_domains || [];
  const ev = (su.evidence || []).filter((e) => e.section === "deployment" || e.section === "experience");
  const gov = su.government_experience || [];
  if (!domains.length && !ev.length) return { score: 0, state: "MISSING", note: "No verified or user-provided deployment experience." };
  let base = domains.length ? Math.min(1, domains.length / 10) : 0.2;
  if (gov.length) base = Math.min(1, base + 0.15);
  const verified = ev.filter((e) => e.verificationStatus === "VERIFIED").length;
  const trust = verified ? 1 : 0.6;
  return { score: Math.min(1, base * trust), state: trust === 1 ? "VERIFIED" : stateOf(base * trust), note: verified ? "Deployment claims backed by verified evidence." : "Deployment claims are user-provided (not yet verified)." };
}

function scoreGovernmentExperience(su) {
  const gov = su.government_experience || [];
  const verified = (su.evidence || []).filter((e) => (e.section === "government" || e.section === "deployment") && e.verificationStatus === "VERIFIED");
  const score = Math.min(1, (gov.length ? gov.length / 5 : 0) * 0.6 + (verified.length ? 0.4 : 0));
  if (!gov.length && !verified.length) return { score: 0, state: "MISSING", note: "No government deployment history recorded." };
  return { score, state: stateOf(score), note: gov.length ? "Government deployment history present." : "Government deployment history limited/none." };
}

function scorePilotReadiness(ch, su) {
  const pr = su.pilot_readiness || {};
  const requiredDays = (ch.deployment_requirements && ch.deployment_requirements.pilotDurationDays) || null;
  const suDays = pr.deploymentTimelineDays || pr.durationDays || null;
  let score = 0.5;
  const notes = [];
  if (pr.team) score += 0.15;
  if (pr.infrastructure || pr.integrationReadiness) score += 0.1;
  if (pr.pilotExperience) score += 0.1;
  if (requiredDays && suDays) {
    if (suDays <= requiredDays) { score += 0.15; notes.push(`Startup deployment capability (${suDays} weeks) fits the ${requiredDays}-week pilot.`); }
    else { score -= 0.1; notes.push(`Startup timeline (${suDays}) exceeds the challenge pilot window (${requiredDays}).`); }
  }
  if (!requiredDays) notes.push("Challenge does not declare a pilot duration; pilot readiness assessed partially.");
  if (!pr.team && !pr.infrastructure && !pr.pilotExperience && !suDays) return { score: 0, state: "MISSING", note: "No pilot-readiness information is available." };
  return { score: clamp01(score), state: stateOf(score), note: notes.join(" ") || "Pilot readiness assessment." };
}

function scoreGeographicFit(ch, su) {
  const chGeo = String(ch.geography || "").toLowerCase();
  const suGeo = String(su.geography || su.location || "").toLowerCase();
  if (!chGeo) return { score: 0, state: "MISSING", note: "Challenge does not declare a geography." };
  if (!suGeo) return { score: 0, state: "MISSING", note: "Startup has no stated operating region." };
  const exact = chGeo.includes(suGeo) || suGeo.includes(chGeo);
  const score = exact ? 1 : embed().similarity(chGeo, suGeo);
  return { score, state: stateOf(score), note: exact ? "Startup operates within the challenge region." : "Geographic overlap is partial." };
}

function scoreScalabilityFit(su) {
  const sc = su.scale_capacity || {};
  const capacity = typeof sc.capacity === "number" ? sc.capacity : (sc.capacitySites || sc.hospitals || sc.scale);
  const team = Number(su.startup && su.startup.employeeCount) || 0;
  let score = 0.4;
  if (capacity != null && Number(capacity) >= 10) score += 0.2;
  if (team >= 10) score += 0.2;
  if (sc.infrastructure || sc.support) score += 0.1;
  if (capacity == null && !team && !sc.infrastructure) return { score: 0, state: "MISSING", note: "No scalability information available." };
  return { score: clamp01(score), state: stateOf(score), note: "Scalability assessed from capacity, team size and stated infrastructure." };
}

function scoreEvidenceStrength(su) {
  const ev = su.evidence || [];
  const ver = su.verifications || [];
  const certs = su.certifications || [];
  if (!ev.length && !ver.length && !certs.length) return { score: 0, state: "MISSING", note: "No evidence, verification or certification data available." };
  let score = 0;
  score += Math.min(1, ver.filter((v) => v.status === "VERIFIED").length / 6) * 0.4;
  score += Math.min(1, ev.filter((e) => e.verificationStatus === "VERIFIED").length / 8) * 0.4;
  score += Math.min(1, certs.length / 4) * 0.2;
  const verifiedCount = ver.filter((v) => v.status === "VERIFIED").length + ev.filter((e) => e.verificationStatus === "VERIFIED").length;
  const state = verifiedCount ? "VERIFIED" : (ev.length ? "DOCUMENT_VERIFIED" : "USER_PROVIDED");
  return { score: clamp01(score), state, note: `${verifiedCount} verified evidence item(s); ${certs.length} certification(s).` };
}

/* dimension runner registry */
const DIMENSION_RUNNERS = {
  PROBLEM_FIT: scoreProblemFit,
  CAPABILITY_FIT: scoreCapabilityFit,
  TECHNOLOGY_FIT: scoreTechnologyFit,
  USE_CASE_FIT: scoreUseCaseFit,
  SECTOR_FIT: scoreSectorFit,
  DEPLOYMENT_EXPERIENCE: scoreDeploymentExperience,
  GOVERNMENT_EXPERIENCE: scoreGovernmentExperience,
  PILOT_READINESS: scorePilotReadiness,
  GEOGRAPHIC_FIT: scoreGeographicFit,
  SCALABILITY_FIT: scoreScalabilityFit,
  EVIDENCE_STRENGTH: scoreEvidenceStrength,
};

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function stateOf(score) {
  if (score >= 0.85) return "VERIFIED";
  if (score >= 0.6) return "DOCUMENT_VERIFIED";
  if (score > 0) return "PARTIAL";
  return "MISSING";
}

/* shared semantic service instance (deterministic) */
let _embed;
function embed() {
  if (!_embed) _embed = createEmbeddingService();
  return _embed;
}

/* ── confidence (Part 22/23): separate from score ── */
function computeConfidence(dimensionResults, su) {
  const verifiedItems =
    (su.verifications || []).filter((v) => v.status === "VERIFIED").length +
    (su.evidence || []).filter((e) => e.verificationStatus === "VERIFIED").length;
  const hasMissing = dimensionResults.some((d) => d.state === "MISSING" || d.state === "UNKNOWN");
  let missingPenalty = hasMissing ? 0.12 : 0;
  const evidenceBase = Math.min(0.6, 0.15 + verifiedItems * 0.08);
  const quality = evidenceBase + 0.35 + Math.min(0.25, dimensionResults.length * 0.02);
  return clamp01(quality - missingPenalty);
}

/* ── stale detection (Part 44) ── */
export function isMatchStale(run, startupUpdatedAt = null, configVersion = null, challengeChanged = false) {
  if (!run) return false;
  if (configVersion != null && run.configVersion != null && Number(configVersion) !== Number(run.configVersion)) return true;
  if (challengeChanged) return true;
  if (startupUpdatedAt && run.generatedAt && new Date(startupUpdatedAt) > new Date(run.generatedAt)) return true;
  return false;
}

/* ── PUBLIC: run the full hybrid matching (Parts 21-24, 26-32, 41-42) ── */
export function runMatchingEngine({
  challenge,
  startup,
  startupRepresentation,
  eligibility,
  configuration,
  embeddingService = null,
  nowTs = null,
}) {
  const svc = embeddingService || createEmbeddingService();
  const ch = buildChallengeRepresentation(challenge || {});
  const su = startupRepresentation || buildStartupRepresentation(startup);
  const capabilityRows = startup && startup.capabilities ? startup.capabilities : (startupRepresentation && startupRepresentation.capabilities) || [];
  const index = buildCapabilityIndex(startup && startup.vocabulary ? startup.vocabulary : []);
  const cfg = configuration || prepareMatchingConfiguration({
    challengeId: challenge.id,
    dimensions: MATCH_DIMENSIONS.map((key) => ({ key, weight: key === "PROBLEM_FIT" ? 25 : key === "CAPABILITY_FIT" ? 20 : key === "TECHNOLOGY_FIT" ? 15 : key === "USE_CASE_FIT" ? 10 : key === "DEPLOYMENT_EXPERIENCE" ? 10 : key === "PILOT_READINESS" ? 10 : key === "GEOGRAPHIC_FIT" ? 5 : key === "EVIDENCE_STRENGTH" ? 5 : 0 })),
  });

  const active = (cfg.activeDimensions || cfg.dimensions || []).filter((d) => d.active !== false);
  const weightTotal = active.reduce((s, d) => s + d.weight, 0);

  const dimensionResults = active.map((d) => {
    const runner = DIMENSION_RUNNERS[d.key];
    const res = runner ? runner(ch, su, index, svc) : { score: 0, state: "UNKNOWN", note: "Unknown dimension." };
    return {
      key: d.key,
      label: MATCH_DIMENSION_LABELS[d.key] || d.key,
      weight: d.weight,
      score: clamp01(res.score),
      state: res.state,
      note: res.note || "",
      rows: res.rows,
    };
  });

  /* Σ(score×weight)/Σ(weight) → 0-1 */
  const wsum = active.reduce((s, d, i) => {
    const rs = dimensionResults[i] && dimensionResults[i].state === "MISSING" ? 0 : (dimensionResults[i] ? dimensionResults[i].score : 0);
    return s + rs * d.weight;
  }, 0);
  const denom = weightTotal || 1;
  const matchScore = weightTotal ? clamp01(wsum / denom) : 0;

  const confidence = computeConfidence(dimensionResults, su);
  const strengths = buildStrengths(dimensionResults, su);
  const gaps = buildGaps(dimensionResults, su);
  const riskFlags = buildRiskFlags(dimensionResults, su);

  return {
    matchScore,
    matchConfidence: confidence,
    dimensionResults,
    strengths,
    gaps,
    riskFlags,
    explanation: explanationSummary(matchScore, dimensionResults, strengths, gaps, eligibility),
    challengeRepresentation: ch,
    startupRepresentation: su,
  };
}

function buildStrengths(dims, su) {
  const out = [];
  for (const d of dims) {
    if (d.score >= 0.85) out.push({ dimension: d.key, text: `Strong ${MATCH_DIMENSION_LABELS[d.key] || d.key} (${(d.score * 100).toFixed(0)}%).` });
    else if (d.score >= 0.6) out.push({ dimension: d.key, text: `Good ${MATCH_DIMENSION_LABELS[d.key] || d.key}.` });
  }
  if ((su.evidence || []).some((e) => e.verificationStatus === "VERIFIED") || (su.verifications || []).some((v) => v.status === "VERIFIED")) {
    out.push({ dimension: "EVIDENCE_STRENGTH", text: "Has verified evidence on file." });
  }
  return out.slice(0, 6);
}
function buildGaps(dims, su) {
  const out = [];
  for (const d of dims) {
    if (d.state === "MISSING" || d.state === "UNKNOWN") out.push({ dimension: d.key, text: `No information for ${MATCH_DIMENSION_LABELS[d.key] || d.key}.` });
    else if (d.score < 0.5) out.push({ dimension: d.key, text: `Weak ${MATCH_DIMENSION_LABELS[d.key] || d.key}.` });
  }
  if (out.length < 2 && (!(su.government_experience || []).length)) out.push({ dimension: "GOVERNMENT_EXPERIENCE", text: "Limited government deployment history." });
  return out.slice(0, 6);
}
function buildRiskFlags(dims, su) {
  const out = [];
  const certs = su.certifications || [];
  if ((su.evidence || []).filter((e) => e.section === "deployment" && e.verificationStatus !== "VERIFIED").length && !(su.evidence || []).some((e) => e.section === "deployment" && e.verificationStatus === "VERIFIED")) {
    out.push({ level: "MEDIUM", text: "Deployment experience is user-provided, not yet verified." });
  }
  if (certs.some((c) => c.expiryStatus === "EXPIRED")) out.push({ level: "HIGH", text: "A certification has expired." });
  if (dims.some((d) => d.key === "SCALABILITY_FIT" && (d.score < 0.5))) out.push({ level: "MEDIUM", text: "Scalability capacity may be limited for large-scale rollout." });
  if (!certs.length && !(su.evidence || []).length) out.push({ level: "LOW", text: "Limited supporting evidence on file." });
  return out.slice(0, 5);
}
function explanationSummary(score, dims, strengths, gaps, eligibility) {
  const pct = (score * 100).toFixed(0);
  const top = (dims.slice().sort((a, b) => b.score - a.score)[0] || {});
  const lines = [];
  if (strengths.length) lines.push("Strengths: " + strengths.slice(0, 3).map((s) => s.text).join(" "));
  if (gaps.length) lines.push("Gaps: " + gaps.slice(0, 2).map((g) => g.text).join(" "));
  if (eligibility && eligibility.overallStatus) lines.push(`Eligibility: ${eligibility.overallStatus}.`);
  return {
    summary: `${pct}% match. Primary strength: ${top.label || "overall alignment"}.`,
    plain: lines.join(" ") || "No explanation available.",
    why: lines,
  };
}

/* ── configuration snapshots / human actions (Parts 35-36) ── */
export function prepareShortlistEntry(raw) {
  raw = objectOf(raw, {});
  const resultId = uuidOf(raw.matchingResultId, "matching_result_id");
  if (!resultId) throw new AppError(400, "VALIDATION_FAILED", "matching_result_id is required");
  return {
    matchingResultId: resultId,
    note: str(raw.note, 500, "note"),
    addedBy: str(raw.addedBy, 100, "added_by"),
    manualRank: nonNegNumber(raw.manualRank, "manual_rank"),
  };
}
export function prepareHumanMatchingAction(raw) {
  raw = objectOf(raw, {});
  const resultId = uuidOf(raw.matchingResultId, "matching_result_id");
  if (!resultId) throw new AppError(400, "VALIDATION_FAILED", "matching_result_id is required");
  return {
    matchingResultId: resultId,
    action: enumOrEmpty(raw.action, ["SHORTLISTED", "REMOVED", "REORDER", "NOTE", "REQUEST_INFO"], "action") || "NOTE",
    originalRank: nonNegNumber(raw.originalRank, "original_rank"),
    newRank: nonNegNumber(raw.newRank, "new_rank"),
    reason: str(raw.reason, 1000, "reason"),
    actorId: str(raw.actorId, 100, "actor_id"),
  };
}

/* STEP 4 — match foundation */
export function prepareMatch(raw) {
  raw = objectOf(raw, {});
  const challengeId = uuidOf(raw.challengeId, "challenge_id");
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!challengeId) throw new AppError(400, "VALIDATION_FAILED", "challenge_id is required");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  const fields = [
    "overallScore", "problemFitScore", "capabilityScore", "sectorScore",
    "experienceScore", "readinessScore", "complianceScore", "securityScore", "scalabilityScore",
  ];
  const out = { challengeId, startupId };
  for (const f of fields) out[f] = scoreInt(raw[f], f);
  out.explanation = str(raw.explanation, 3000, "explanation");
  out.evidence = objectOf(raw.evidence, {});
  out.modelVersion = str(raw.modelVersion, 100, "model_version");
  out.kind = enumOrEmpty(raw.kind, MATCH_KINDS, "kind");
  out.isDemo = !!raw.isDemo;
  return out;
}

/* ───────── STEP 5 — evaluation foundation ───────── */

export function prepareEvaluationTemplate(raw) {
  raw = objectOf(raw, {});
  const criteria = Array.isArray(raw.criteria) ? raw.criteria : [];
  const prepared = criteria.map((c) => {
    c = c || {};
    const base = {
      key: str(c && c.key, 100, "criterion key", true),
      label: str(c && c.label, 200, "criterion label", true),
      description: str(c && c.description, 500, "criterion description"),
      weight: scoreInt(c && c.weight, `weight for ${c && c.key}`) ?? 0,
    };
    /* additive: challenge-scoped evaluation intelligence fields (Parts 2-5) */
    return { ...prepareEvaluationCriterion({ ...c, ...base }), ...base };
  });
  const normalized = normalizeWeights(prepared, { key: "weight" });
  return {
    organizationId: uuidOf(raw.organizationId, "organization_id"),
    name: str(raw.name, 200, "name", true),
    description: str(raw.description, 1000, "description"),
    isDefault: !!raw.isDefault,
    criteria: normalized,
  };
}

export function prepareEvaluation(raw) {
  raw = objectOf(raw, {});
  const challengeId = uuidOf(raw.challengeId, "challenge_id");
  const startupId = uuidOf(raw.startupId, "startup_id");
  const orgId = uuidOf(raw.organizationId, "organization_id");
  if (!challengeId) throw new AppError(400, "VALIDATION_FAILED", "challenge_id is required");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  if (!orgId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
  return {
    challengeId,
    startupId,
    templateId: uuidOf(raw.templateId, "template_id"),
    organizationId: orgId,
    status: raw.status == null || raw.status === "" ? "DRAFT" : enumOf(raw.status, EVALUATION_STATUSES_APP, "status"),
    summary: str(raw.summary, 3000, "summary"),
    isDemo: !!raw.isDemo,
  };
}

export function prepareEvaluationScoreEntry(raw) {
  raw = objectOf(raw, {});
  const key = str(raw.criterionKey, 100, "criterion_key", true);
  return {
    evaluationId: uuidOf(raw.evaluationId, "evaluation_id"),
    criterionKey: key,
    score: scoreInt(raw.score, `score for ${key}`, { required: true }),
    evidenceReference: str(raw.evidenceReference, 800, "evidence_reference"),
    notes: str(raw.notes, 1500, "notes"),
  };
}

/* ───────── Evaluation & Shortlist Intelligence — prepared inputs ───────── */

export function prepareEvaluationConfiguration(raw) {
  raw = objectOf(raw, {});
  return {
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    templateId: uuidOf(raw.templateId, "template_id"),
    aggregationMethod:
      raw.aggregationMethod == null || raw.aggregationMethod === ""
        ? "MEAN"
        : enumOf(raw.aggregationMethod, EVALUATION_AGGREGATION_METHODS, "aggregation_method"),
    evaluatorWeightingEnabled: !!raw.evaluatorWeightingEnabled,
    lowCommentThreshold: scoreInt(raw.lowCommentThreshold, "low_comment_threshold") ?? 40,
    highCommentThreshold: scoreInt(raw.highCommentThreshold, "high_comment_threshold") ?? 90,
    advanceThreshold: scoreInt(raw.advanceThreshold, "advance_threshold") ?? 80,
    advanceWithReviewThreshold: scoreInt(raw.advanceWithReviewThreshold, "advance_with_review_threshold") ?? 70,
    reviewThreshold: scoreInt(raw.reviewThreshold, "review_threshold") ?? 60,
    doNotAdvanceThreshold: scoreInt(raw.doNotAdvanceThreshold, "do_not_advance_threshold") ?? 50,
    isDemo: !!raw.isDemo,
  };
}

/* Richer criterion field used for CHALLENGE-scoped configuration (Parts 2-5).
   The legacy template flow still accepts key/label/description/weight only. */
export function prepareEvaluationCriterion(raw) {
  raw = objectOf(raw, {});
  const key = str(raw.key, 100, "criterion key", true);
  const weight = scoreInt(raw.weight, `weight for ${key}`, { required: true });
  if (weight < 0 || weight > 100) {
    throw new AppError(400, "VALIDATION_FAILED", `weight for ${key} must be an integer between 0 and 100`);
  }
  return {
    key,
    label: str(raw.label, 200, "criterion label", true),
    description: str(raw.description, 600, "criterion description"),
    category: str(raw.category, 60, "category") || "OTHER",
    weight,
    maxScore: scoreInt(raw.maxScore, `max score for ${key}`) ?? 100,
    minimumScore: scoreInt(raw.minimumScore, `minimum score for ${key}`),
    mandatory: !!raw.mandatory,
    evidenceRequired: !!raw.evidenceRequired,
    evaluationGuidance: str(raw.evaluationGuidance, 1200, "evaluation_guidance"),
    sourceReference: str(raw.sourceReference, 300, "source_reference"),
    criterionStatus:
      raw.criterionStatus == null || raw.criterionStatus === ""
        ? "ACTIVE"
        : enumOf(raw.criterionStatus, EVALUATION_CRITERION_STATUSES, "criterion_status"),
    version: Number.isInteger(raw.version) && raw.version >= 1 ? raw.version : 1,
  };
}

export function prepareEvaluatorAssignment(raw) {
  raw = objectOf(raw, {});
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  return {
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    startupId,
    organizationId: uuidOf(raw.organizationId, "organization_id"),
    evaluationId: uuidOf(raw.evaluationId, "evaluation_id"),
    evaluatorUid: str(raw.evaluatorUid, 200, "evaluator_uid", true),
    criteriaKeys: Array.isArray(raw.criteriaKeys) ? raw.criteriaKeys.slice(0, 50) : [],
    status:
      raw.status == null || raw.status === ""
        ? "ASSIGNED"
        : enumOf(raw.status, EVALUATION_ASSIGNMENT_STATUSES, "assignment status"),
    assignedBy: str(raw.assignedBy, 200, "assigned_by"),
  };
}

export function prepareEvaluationCommentEntry(raw) {
  raw = objectOf(raw, {});
  return {
    evaluationId: uuidOf(raw.evaluationId, "evaluation_id"),
    criterionKey: str(raw.criterionKey, 100, "criterion_key", true),
    kind:
      raw.kind == null || raw.kind === ""
        ? "EVALUATOR_NOTE"
        : enumOf(raw.kind, EVALUATION_COMMENT_KINDS, "comment kind"),
    comment: str(raw.comment, 3000, "comment", true),
    required: !!raw.required,
    reason: str(raw.reason, 160, "reason"),
    actorUid: str(raw.actorUid, 200, "actor_uid"),
    actorRole: str(raw.actorRole, 60, "actor_role"),
  };
}

export function prepareEvaluationDecision(raw) {
  raw = objectOf(raw, {});
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  return {
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    startupId,
    decision: enumOf(raw.decision, EVALUATION_DECISION_TYPES, "decision"),
    reason: str(raw.reason, 2000, "reason", true),
    decisionStage:
      raw.decisionStage == null || raw.decisionStage === ""
        ? "EVALUATION"
        : enumOf(raw.decisionStage, EVALUATION_DECISION_STAGES, "decision_stage"),
    conditions: Array.isArray(raw.conditions) ? raw.conditions.slice(0, 50) : [],
    acknowledge: !!raw.acknowledge,
    isDemo: !!raw.isDemo,
  };
}

export function prepareEvaluationRequestEntry(raw) {
  raw = objectOf(raw, {});
  return {
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    startupId: uuidOf(raw.startupId, "startup_id"),
    organizationId: uuidOf(raw.organizationId, "organization_id"),
    evaluationId: uuidOf(raw.evaluationId, "evaluation_id"),
    subject: str(raw.subject, 300, "subject", true),
    details: str(raw.details, 2000, "details"),
    requiredEvidence: Array.isArray(raw.requiredEvidence) ? raw.requiredEvidence.slice(0, 50) : [],
    status: raw.status == null || raw.status === "" ? "OPEN" : enumOf(raw.status, EVALUATION_REQUEST_STATUSES, "request status"),
    requestedBy: str(raw.requestedBy, 200, "requested_by"),
  };
}

export function preparePilotHandoff(raw) {
  raw = objectOf(raw, {});
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  return {
    decisionId: uuidOf(raw.decisionId, "decision_id"),
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    startupId,
    organizationId: uuidOf(raw.organizationId, "organization_id"),
    evaluationSnapshotId: uuidOf(raw.evaluationSnapshotId, "evaluation_snapshot_id"),
    selectedCriteria: Array.isArray(raw.selectedCriteria) ? raw.selectedCriteria.slice(0, 100) : [],
    identifiedGaps: Array.isArray(raw.identifiedGaps) ? raw.identifiedGaps.slice(0, 100) : [],
    riskFlags: Array.isArray(raw.riskFlags) ? raw.riskFlags.slice(0, 100) : [],
    pilotReadiness: objectOf(raw.pilotReadiness, {}),
    expectedKpis: Array.isArray(raw.expectedKpis) ? raw.expectedKpis.slice(0, 100) : [],
    requiredEvidence: Array.isArray(raw.requiredEvidence) ? raw.requiredEvidence.slice(0, 100) : [],
    conditions: Array.isArray(raw.conditions) ? raw.conditions.slice(0, 100) : [],
    status: raw.status == null || raw.status === "" ? "DRAFT" : enumOf(raw.status, PILOT_HANDOFF_STATUSES, "handoff status"),
    issuedBy: str(raw.issuedBy, 200, "issued_by"),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── Evaluation & Shortlist Intelligence — deterministic engine ─────────
   Pure functions; no I/O, no AI. Every number here is reproducible from
   the same inputs + version (Parts 22, 45). */

function hundredth(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function medianOf(values) {
  if (!values.length) return 0;
  const a = [...values].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function quartiles(values) {
  const a = [...values].sort((x, y) => x - y);
  const q = (p) => {
    const pos = (a.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    const v = a[base + 1] !== undefined ? a[base + 1] : a[base];
    return a[base] + rest * (v - a[base]);
  };
  return { q1: q(0.25), q3: q(0.75) };
}

/* Weight validation (Part 6): active weights must equal 100. Never silently
   accepts a partial total; empty criteria are valid (nothing configured yet). */
export function validateEvaluationWeights(criteria) {
  const active = (criteria || []).filter((c) => (c.criterionStatus || "ACTIVE") === "ACTIVE");
  const seen = new Set();
  for (const c of active) {
    if (seen.has(c.key)) {
      return { valid: false, message: `Duplicate criteria keys are not allowed (${c.key}).` };
    }
    seen.add(c.key);
    if (!(c.weight >= 0) || c.weight > 100) {
      return { valid: false, message: `All active weights must be between 0 and 100 (${c.key}).` };
    }
  }
  const total = active.reduce((s, c) => s + c.weight, 0);
  if (active.length > 0 && Math.abs(total - 100) > 1e-6) {
    return {
      valid: false,
      total,
      message: `Weight configuration incomplete: total is ${total}%, expected 100%.`,
    };
  }
  return { valid: true, total, criteria: active };
}

/* Per-evaluator summary (Parts 15, 22). Includes mandatory/threshold state
   and the comment-required triggers (Part 16). */
export function computeEvaluationSummary({ criteria, scores = [], config = {} }) {
  const active = (criteria || []).filter((c) => (c.criterionStatus || "ACTIVE") === "ACTIVE");
  const scored = new Map((scores || []).map((s) => [s.criterionKey, s]));
  const rows = [];
  let total = 0;
  let scoredCount = 0;
  let mandatoryPassed = 0;
  let mandatoryFailed = 0;
  const commentsRequired = [];
  for (const c of active) {
    const s = scored.get(c.key);
    const value = s && s.score != null ? Number(s.score) : null;
    let state = "MISSING";
    if (value != null) {
      scoredCount++;
      state = "SCORED";
      if (c.minimumScore != null && value < c.minimumScore) {
        state = "FAIL_MIN_THRESHOLD";
        if (c.mandatory) {
          state = "MANDATORY_FAILED";
          mandatoryFailed++;
          commentsRequired.push({ criterionKey: c.key, reason: "MANDATORY_FAILED" });
        }
      } else if (c.mandatory) {
        mandatoryPassed++;
      }
      if (value <= (config.lowCommentThreshold ?? 40)) {
        commentsRequired.push({ criterionKey: c.key, reason: "LOW_SCORE" });
      } else if (value >= (config.highCommentThreshold ?? 90)) {
        commentsRequired.push({ criterionKey: c.key, reason: "HIGH_SCORE" });
      }
    }
    const weighted = value != null ? (value * c.weight) / 100 : 0;
    total += weighted;
    rows.push({
      key: c.key,
      label: c.label,
      category: c.category || "OTHER",
      weight: c.weight,
      maxScore: c.maxScore ?? 100,
      minimumScore: c.minimumScore ?? null,
      mandatory: c.mandatory,
      evidenceRequired: c.evidenceRequired,
      score: value,
      state,
      weighted: hundredth(weighted),
    });
  }
  return {
    total: hundredth(total),
    rows,
    scoredCount,
    missingCount: active.length - scoredCount,
    mandatory: { passed: mandatoryPassed, failed: mandatoryFailed },
    complete: active.length > 0 && scoredCount === active.length,
    commentsRequired,
  };
}

/* Outlier detection (Part 26): 1.5×IQR. Flags only — never auto-adjusts. */
export function detectOutliers(values, label = "scores") {
  const v = (values || []).filter((n) => Number.isFinite(Number(n))).map(Number);
  if (v.length < 3) return [];
  const { q1, q3 } = quartiles(v);
  const iqr = q3 - q1;
  if (iqr === 0) return [];
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const out = [];
  v.forEach((score, i) => {
    if (score < lo || score > hi) {
      out.push({ index: i, score, label, lowerBound: hundredth(lo), upperBound: hundredth(hi) });
    }
  });
  return out;
}

/* Variance detection (Part 25): high spread or coefficient of variation. */
export function detectVariance(values, label = "scores") {
  const v = (values || []).filter((n) => Number.isFinite(Number(n))).map(Number);
  if (v.length < 2) {
    return { values: v, highVariance: false, spread: 0, coefficient: 0, mean: v[0] || 0, reason: "" };
  }
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const spread = Math.max(...v) - Math.min(...v);
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
  const coefficient = mean ? sd / mean : sd;
  const highVariance = spread >= 30 || coefficient > 0.35;
  return {
    values: v,
    highVariance,
    spread: hundredth(spread),
    coefficient: hundredth(coefficient),
    mean: hundredth(mean),
    reason: highVariance ? `High evaluator variance on ${label} (spread ${hundredth(spread)}, CV ${hundredth(coefficient * 100)}%).` : "",
  };
}

/* Evidence coverage (Part 28): share of active criteria with supporting
   evidence. Input `evidence` maps criterionKey -> truthy when supported. */
export function computeEvidenceCoverage({ criteria, evidence = {} }) {
  const active = (criteria || []).filter((c) => (c.criterionStatus || "ACTIVE") === "ACTIVE");
  if (!active.length) return 0;
  const supported = active.filter((c) => evidence[c.key]);
  return Math.round((supported.length / active.length) * 100);
}

/* Confidence (Part 27): coverage × participation × agreement. Never equal to
   the score itself. Inputs are 0-100 numbers. */
export function evaluationConfidence({ coverage, submitted, expected, highVariance = false }) {
  const cov = Number(coverage) || 0;
  const participation = expected > 0 ? Math.min(1, (Number(submitted) || 0) / expected) : (submitted ? 1 : 0);
  const agreement = highVariance ? 0.8 : 1;
  return Math.round(cov * participation * agreement);
}

/* Aggregation (Parts 22-25): one aggregated stat per criterion across the
   submitted independent evaluations, then the weighted overall total. */
export function aggregateEvaluationScores({ criteria, evaluations = [], method = "MEAN", evaluatorWeights = null, config = {} }) {
  const active = (criteria || []).filter((c) => (c.criterionStatus || "ACTIVE") === "ACTIVE");
  const sub = (evaluations || []).filter((e) => e && e.status === "SUBMITTED" && Array.isArray(e.scores));
  const participationCount = sub.length;
  const methodName = method === "CUSTOM_AUTHORIZED_METHOD" ? "MEAN" : method;
  if (!active.length || !sub.length) {
    return {
      participationCount,
      method,
      total: 0,
      criteria: [],
      result: participationCount ? "INCOMPLETE" : "NOT_EVALUATED",
      evidenceCoverage: 0,
      confidence: 0,
      highVariance: false,
      mandatoryFailed: false,
    };
  }

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const rows = active.map((c) => {
    const values = sub
      .map((ev) => {
        const s = (ev.scores || []).find((sc) => sc.criterionKey === c.key);
        return s && s.score != null ? Number(s.score) : null;
      })
      .filter((v) => v != null);
    let stat = 0;
    if (values.length) {
      if (methodName === "MEDIAN") {
        stat = medianOf(values);
      } else if (methodName === "WEIGHTED_MEAN" && evaluatorWeights && evaluatorWeights.length) {
        const wsum = evaluatorWeights.reduce((a, w) => a + (w.weight || 0), 0);
        if (wsum > 0) {
          stat = sub.reduce((a, ev, i) => {
            const s = (ev.scores || []).find((x) => x.criterionKey === c.key);
            const w = (evaluatorWeights[i] && evaluatorWeights[i].weight) || 0;
            return a + (s && s.score != null ? s.score : 0) * (w / wsum);
          }, 0);
        } else {
          stat = avg(values);
        }
      } else {
        stat = avg(values);
      }
    }
    const variance = detectVariance(values, c.label);
    const outliers = detectOutliers(values, c.label);
    const belowMinimum = c.minimumScore != null && values.length > 0 && stat < c.minimumScore;
    const mandatoryFailed = !!(c.mandatory && belowMinimum);
    return {
      key: c.key,
      label: c.label,
      category: c.category || "OTHER",
      weight: c.weight,
      maxScore: c.maxScore ?? 100,
      minimumScore: c.minimumScore ?? null,
      mandatory: c.mandatory,
      evidenceRequired: c.evidenceRequired,
      values,
      scoredCount: values.length,
      stat: hundredth(stat),
      mean: hundredth(avg(values)),
      median: hundredth(medianOf(values)),
      weighted: hundredth(stat * (c.weight / 100)),
      belowMinimum,
      mandatoryFailed,
      variance,
      outliers,
    };
  });

  const total = hundredth(rows.reduce((a, r) => a + r.weighted, 0));
  const highVariance = rows.some((r) => r.variance.highVariance);
  const mandatoryFailed = rows.some((r) => r.mandatoryFailed);
  return {
    participationCount,
    method,
    total,
    criteria: rows,
    result: overallResult({ total, config, mandatoryFailed, incomplete: false }),
    highVariance,
    mandatoryFailed,
  };
}

/* Overall result state (Part 30) — mandatory failures always block ADVANCE. */
export function overallResult({ total = 0, config = {}, mandatoryFailed = false, incomplete = false }) {
  if (incomplete) return "INCOMPLETE";
  if (mandatoryFailed) return "REVIEW_REQUIRED";
  if (total >= (config.advanceThreshold ?? 80)) return "ADVANCE";
  if (total >= (config.advanceWithReviewThreshold ?? 70)) return "ADVANCE_WITH_REVIEW";
  if (total >= (config.doNotAdvanceThreshold ?? 50)) return "REVIEW_REQUIRED";
  return "DO_NOT_ADVANCE";
}

/* Critical review items (Part 37) derived from aggregated criteria + flags. */
export function buildCriticalItems({ aggregation, flags = [], evidence = {} }) {
  const items = [];
  const push = (type, level, text) => items.push({ type, level, text, resolved: false, generatedAt: new Date().toISOString() });
  for (const c of (aggregation && aggregation.criteria) || []) {
    if (c.mandatoryFailed) push("MANDATORY_BELOW_THRESHOLD", "BLOCKING", `Mandatory criterion "${c.label}" is below its minimum (${c.minimumScore}).`);
    else if (c.belowMinimum) push("BELOW_MINIMUM_THRESHOLD", "WARNING", `Criterion "${c.label}" is below its minimum (${c.minimumScore}).`);
    if (c.variance && c.variance.highVariance) push("HIGH_EVALUATOR_VARIANCE", "REVIEW", c.variance.reason);
    for (const o of c.outliers || []) push("POTENTIAL_OUTLIER", "REVIEW", `Potential outlier score ${o.score} on "${c.label}" (IQR bounds ${o.lowerBound}-${o.upperBound}). Human review required.`);
    if (c.evidenceRequired && !evidence[c.key]) push("MISSING_EVIDENCE", "WARNING", `Required evidence for "${c.label}" is missing or unverified.`);
  }
  for (const f of flags || []) {
    if (f.kind === "HIGH_VARIANCE") push("HIGH_EVALUATOR_VARIANCE", "REVIEW", f.detail || "High evaluator variance detected.");
    if (f.kind === "OUTLIER") push("POTENTIAL_OUTLIER", "REVIEW", f.detail || "Potential outlier detected.");
  }
  return items.slice(0, 60);
}

/* Decision safety (Part 58): blocking conditions cannot be silently bypassed. */
export function decisionSafetyChecks({ eligibility = null, aggregation = null, criticalItems = [] }) {
  const blocking = [];
  const warnings = [];
  const eligible =
    eligibility &&
    ["ELIGIBLE", "ELIGIBLE_WITH_REVIEW", "CONDITIONAL"].includes(eligibility.overallStatus);
  if (!eligible) {
    blocking.push("Eligibility is not valid for final decision (expected ELIGIBLE, ELIGIBLE_WITH_REVIEW or CONDITIONAL).");
  }
  if (!aggregation) {
    blocking.push("No aggregated evaluation exists yet — run aggregation first.");
  } else if (aggregation.result === "INCOMPLETE" || aggregation.result === "NOT_EVALUATED") {
    blocking.push(`Evaluation is not complete (${aggregation.result}); all assigned evaluators must submit.`);
  } else if (aggregation.mandatoryFailed) {
    blocking.push("A mandatory criterion is below its minimum score and must be resolved before a final decision.");
  }
  const blockingItems = (criticalItems || []).filter((c) => c.level === "BLOCKING" && !c.resolved);
  if (blockingItems.length) {
    blocking.push(`${blockingItems.length} blocking critical review item(s) remain unresolved.`);
  }
  if (aggregation && (aggregation.evidenceCoverage || 0) < 50) {
    warnings.push(`Evidence coverage is low (${aggregation.evidenceCoverage}%).`);
  }
  const open = (criticalItems || []).filter((c) => !c.resolved);
  if (open.length) warnings.push(`${open.length} open critical review item(s) — review before deciding.`);
  return { blocking, warnings, ok: blocking.length === 0 };
}

/* ───────── STEP 6/7 — pilot + KPI ───────── */

export function preparePilot(raw) {
  raw = objectOf(raw, {});
  const orgId = uuidOf(raw.organizationId, "organization_id");
  if (!orgId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
  const startupId = uuidOf(raw.startupId, "startup_id");
  if (!startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  const start = dateOf(raw.startDate, "start_date");
  const end = dateOf(raw.endDate, "end_date");
  if (start && end && end < start) {
    throw new AppError(400, "VALIDATION_FAILED", "end_date must be >= start_date");
  }
  return {
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    startupId,
    organizationId: orgId,
    title: str(raw.title, 300, "title", true),
    objective: str(raw.objective, 5000, "objective"),
    baselineJson: objectOf(raw.baselineJson, {}),
    targetUsers: str(raw.targetUsers, 500, "target_users"),
    implementationPlan: str(raw.implementationPlan, 5000, "implementation_plan"),
    dependencies: arrayOf(raw.dependencies, [], 500),
    risks: arrayOf(raw.risks, [], 500),
    requiredDocuments: arrayOf(raw.requiredDocuments, [], 500),
    location: str(raw.location, 200, "location"),
    durationDays: positiveInt(raw.durationDays, "duration_days"),
    budget: nonNegNumber(raw.budget, "budget"),
    currency: str(raw.currency, 8, "currency") || "INR",
    startDate: start,
    endDate: end,
    acceptanceCriteria: arrayOf(raw.acceptanceCriteria, [], 40),
    status: raw.status == null || raw.status === "" ? "PLANNED" : enumOf(raw.status, PILOT_STATUSES, "status"),
    responsibleDept: str(raw.responsibleDept, 200, "responsible_dept"),
    isDemo: !!raw.isDemo,
  };
}

export function prepareMilestone(raw) {
  raw = objectOf(raw, {});
  const pilotId = uuidOf(raw.pilotId, "pilot_id");
  if (!pilotId) throw new AppError(400, "VALIDATION_FAILED", "pilot_id is required");
  return {
    pilotId,
    title: str(raw.title, 300, "title", true),
    dueDate: dateOf(raw.dueDate, "due_date"),
    completedAt: dateOf(raw.completedAt, "completed_at"),
    status: raw.status == null || raw.status === "" ? "PENDING" : enumOf(raw.status, MILESTONE_STATUSES, "status"),
    notes: str(raw.notes, 1500, "notes"),
    completionPercentage: positiveInt(raw.completionPercentage, "completion_percentage"),
    evidence: objectOf(raw.evidence, {}),
  };
}

export function prepareKpi(raw) {
  raw = objectOf(raw, {});
  const pilotId = uuidOf(raw.pilotId, "pilot_id");
  if (!pilotId) throw new AppError(400, "VALIDATION_FAILED", "pilot_id is required");
  return {
    pilotId,
    name: str(raw.name, 200, "name", true),
    description: str(raw.description, 1000, "description"),
    unit: str(raw.unit, 50, "unit"),
    baselineValue: nonNegNumber(raw.baselineValue, "baseline_value"),
    targetValue: nonNegNumber(raw.targetValue, "target_value"),
    actualValue: nonNegNumber(raw.actualValue, "actual_value"),
    measurementMethod: str(raw.measurementMethod, 500, "measurement_method"),
    frequency: str(raw.frequency, 100, "frequency"),
    threshold: nonNegNumber(raw.threshold, "threshold"),
    status: raw.status == null || raw.status === "" ? "TARGET" : enumOf(raw.status, KPI_STATUSES, "status"),
    isDemo: !!raw.isDemo,
    dataSource: str(raw.dataSource, 200, "data_source"),
    achievementPct: raw.achievementPct != null ? Math.max(0, Math.min(100, Number(raw.achievementPct))) : null,
    trend: raw.trend == null ? "STABLE" : enumOf(raw.trend, ["IMPROVING", "STABLE", "DECLINING", "VOLATILE"], "trend"),
    lastUpdated: dateOf(raw.lastUpdated, "last_updated"),
  };
}

export function prepareMeasurement(raw) {
  raw = objectOf(raw, {});
  const kpiId = uuidOf(raw.kpiId, "kpi_id");
  if (!kpiId) throw new AppError(400, "VALIDATION_FAILED", "kpi_id is required");
  const value = Number(raw.value);
  if (!Number.isFinite(value)) throw new AppError(400, "VALIDATION_FAILED", "value is required and must be numeric");
  return {
    kpiId,
    measuredAt: dateOf(raw.measuredAt, "measured_at") ?? new Date().toISOString(),
    value,
    source: str(raw.source, 200, "source"),
    notes: str(raw.notes, 1500, "notes"),
  };
}

/* ───────── STEP 8 — pilot outcome ───────── */

export function preparePilotResult(raw) {
  raw = objectOf(raw, {});
  const pilotId = uuidOf(raw.pilotId, "pilot_id");
  if (!pilotId) throw new AppError(400, "VALIDATION_FAILED", "pilot_id is required");
  return {
    pilotId,
    result: enumOf(raw.result, PILOT_RESULTS, "result"),
    kpiAchievement: objectOf(raw.kpiAchievement, {}),
    qualitativeFindings: str(raw.qualitativeFindings, 4000, "qualitative_findings"),
    risks: arrayOf(raw.risks, [], 50),
    unresolvedIssues: arrayOf(raw.unresolvedIssues, [], 50),
    evaluatorComments: str(raw.evaluatorComments, 4000, "evaluator_comments"),
    evidence: objectOf(raw.evidence, {}),
    recommendation: enumOf(raw.recommendation, PILOT_RECOMMENDATIONS, "recommendation"),
    recommendationNotes: str(raw.recommendationNotes, 2000, "recommendation_notes"),
    evaluatedAt: dateOf(raw.evaluatedAt, "evaluated_at") ?? new Date().toISOString(),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── PILOT PERFORMANCE INTELLIGENCE ───────── */

export function computePilotHealth(overallScore, kpiCount, milestoneCount, targetAchievement) {
  /* Classify pilot health using defined rules:
     Healthy: score >= 70 and targetAchievement >= 80%
     Watch:   score >= 50 and targetAchievement >= 60%
     At Risk: score < 50 or targetAchievement < 60%
     Critical: score < 30 or KPI achievement < 40%
  */
  if (overallScore < 30 || (kpiCount > 0 && targetAchievement < 40)) {
    return "CRITICAL";
  }
  if (overallScore < 50 || targetAchievement < 60) {
    return "AT_RISK";
  }
  if (overallScore < 70 && targetAchievement < 80) {
    return "WATCH";
  }
  return "HEALTHY";
}

export function computePilotPerformanceSummary(pilot) {
  /* ... (existing) */
}

/* ───────── DOCUMENT INTELLIGENCE ───────── */

export function computeDocumentCompleteness(documents) {
  if (!documents || documents.length === 0) return { complete: 0, missing: 0, expired: 0, needsReview: 0, total: 0 };
  
  let complete = 0, missing = 0, expired = 0, needsReview = 0;
  
  for (const doc of documents) {
    const status = doc.status || "UPLOADED";
    if (status === "VERIFIED") complete++;
    else if (status === "EXPIRED") expired++;
    else if (status === "REJECTED" || status === "FAILED") missing++;
    else needsReview++;
  }
  
  const total = documents.length;
  const pct = total > 0 ? Math.round(complete / total * 100) : 0;
  
  return {
    complete, missing, expired, needsReview,
    pct, total,
    breakdown: {
      complete: { count: complete, label: "Complete", percent: pct },
      missing: { count: missing, label: "Missing", percent: total > 0 ? Math.round(missing / total * 100) : 0 },
      expired: { count: expired, label: "Expired", percent: total > 0 ? Math.round(expired / total * 100) : 0 },
      needsReview: { count: needsReview, label: "Needs Review", percent: total > 0 ? Math.round(needsReview / total * 100) : 0 }
    }
  };
}

export function computeDocumentValidity(documents) {
  if (!documents || documents.length === 0) return { valid: 0, invalid: 0, total: 0, details: [] };
  
  let valid = 0, invalid = 0;
  const details = [];
  
  for (const doc of documents) {
    const docType = doc.docType || "UNKNOWN";
    const status = doc.status || "UPLOADED";
    const isValid = status === "VERIFIED" || status === "EXTRACTED";
    
    if (isValid) valid++;
    else invalid++;
    
    details.push({
      docType,
      status,
      valid: isValid,
      reference: doc.reference || null,
      extractedMeta: doc.extractedMeta || null
    });
  }
  
  return { valid, invalid, total: documents.length, details };
}

/* ───────── COMPLIANCE INTELLIGENCE ───────── */

export function evaluatePilotCompliance(pilot, applicableRegulations) {
  /* Evaluate pilot compliance against regulations using existing patterns.
     Reuses eligibility rule evaluation framework.
  */
  const compliance = {
    overall: "PENDING",
    criteria: [],
    blocking: [],
    satisfied: 0,
    total: applicableRegulations.length,
    details: []
  };
  
  if (applicableRegulations.length === 0) {
    compliance.overall = "NOT_APPLICABLE";
    return compliance;
  }
  
  /* Use existing eligibility rule evaluation framework */
  const activeRegulations = applicableRegulations.filter(r => r.active !== false);
  
  for (const reg of activeRegulations) {
    const criterion = {
      name: reg.title || reg.name || "Unknown requirement",
      kind: reg.kind || "regulation",
      authority: reg.authority || "Unknown authority",
      status: "PENDING",
      met: false,
      blocking: reg.blocking !== false,
      evidenceRequired: reg.evidenceRequired || false,
      details: reg.details || ""
    };
    
    /* Check if pilot has required evidence */
    const hasEvidence = pilot.requiredDocuments && pilot.requiredDocuments.includes(reg.code || reg.id || "");
    const hasVerification = pilot.verifications && pilot.verifications.some(v => v.source === "OFFICIAL");
    
    criterion.met = hasEvidence || hasVerification;
    criterion.status = criterion.met ? "MET" : "NOT_MET";
    
    if (criterion.blocking && !criterion.met) {
      compliance.blocking.push(criterion.name);
    }
    
    compliance.criteria.push(criterion);
    if (criterion.met) compliance.satisfied++;
  }
  
  /* Determine overall compliance */
  if (compliance.blocking.length > 0) {
    compliance.overall = "BLOCKED";
  } else if (compliance.satisfied === compliance.total) {
    compliance.overall = "FULLY_COMPLIANT";
  } else if (compliance.satisfied > 0) {
    compliance.overall = "PARTIALLY_COMPLIANT";
  } else {
    compliance.overall = "NON_COMPLIANT";
  }
  
  return compliance;
}

/* ───────── RISK DETECTION ───────── */

export function detectPilotRisks(pilot, applicableRegulations) {
  /* Detect risks using existing risk intelligence patterns.
     Reuses 7-risk-category framework from gov-engine.cjs.
  */
  const risks = [];
  const riskCategories = ["regulatory", "economic", "industry", "consumer", "operational", "implementation", "market"];
  
  /* Regulatory risk */
  if (pilot.risks && pilot.risks.length > 0) {
    for (const r of pilot.risks) {
      risks.push({
        category: r.category || "regulatory",
        title: r.title || "Unnamed risk",
        probability: r.probability || 3,
        impact: r.impact || 3,
        severity: (r.probability || 3) * (r.impact || 3) >= 16 ? "CRITICAL" : (r.probability || 3) * (r.impact || 3) >= 10 ? "HIGH" : (r.probability || 3) * (r.impact || 3) >= 5 ? "MEDIUM" : "LOW",
        mitigation: r.mitigation || "Under assessment",
        source: "pilot_risks"
      });
    }
  }
  
  /* Add systematic risks based on compliance gaps */
  const compliance = evaluatePilotCompliance(pilot, applicableRegulations);
  if (compliance.overall === "BLOCKED" || compliance.overall === "NON_COMPLIANT") {
    risks.push({
      category: "regulatory",
      title: "Non-compliance with regulatory requirements",
      probability: 4,
      impact: 4,
      severity: "CRITICAL",
      mitigation: "Address blocking compliance requirements before procurement",
      source: "compliance_gap"
    });
  }
  
  /* Budget risk */
  if (pilot.budget) {
    const spendRatio = (pilot.spentBudget || 0) / pilot.budget;
    if (spendRatio > 0.8) {
      risks.push({
        category: "economic",
        title: "Budget overrun risk",
        probability: Math.min(5, Math.round(spendRatio * 5)),
        impact: 4,
        severity: spendRatio > 0.9 ? "CRITICAL" : spendRatio > 0.8 ? "HIGH" : "MEDIUM",
        mitigation: "Review budget allocations and negotiate extensions if needed",
        source: "budget_anomaly"
      });
    }
  }
  
  /* KPI failure risk */
  if (pilot.kpiCount && pilot.targetAchievement < 60) {
    risks.push({
      category: "operational",
      title: "KPI target not achieved",
      probability: 4,
      impact: 3,
      severity: "HIGH",
      mitigation: "Review KPI definitions and adjust targets or implementation approach",
      source: "kpi_failure"
    });
  }
  
  /* Sort by severity */
  const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  risks.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));
  
  return { risks, riskCount: risks.length };
}

/* ───────── PROCUREMENT READINESS ───────── */

export const PROCUREMENT_READINESS = {
  READY: "READY",
  READY_WITH_CONDITIONS: "READY_WITH_CONDITIONS",
  FURTHER_VALIDATION_REQUIRED: "FURTHER_VALIDATION_REQUIRED",
  NOT_READY: "NOT_READY"
};

export function evaluateProcurementReadiness(pilot, pilotResult, compliance, risks) {
  /* Evaluate procurement readiness after pilot completion.
     Considers: pilot outcome, technical readiness, operational readiness,
     compliance, cost, risk, evidence, scalability.
  */
  const technicalReadiness = pilot.trend === "IMPROVING" || pilot.overallScore >= 70 ? "HIGH" : "MEDIUM";
  const operationalReadiness = pilot.milestoneCount > 0 ? "HIGH" : "MEDIUM";
  const evidenceStrength = pilot.requiredDocuments && pilot.requiredDocuments.length > 0 ? "STRONG" : "WEAK";
  const costEffectiveness = pilot.budget ? (pilot.estimatedCost / pilot.budget <= 1 ? "GOOD" : "HIGH") : "UNKNOWN";
  
  /* Count critical/high risks */
  const criticalHighRiskCount = (risks.risks || []).filter(r => ["CRITICAL", "HIGH"].includes(r.severity)).length;
  
  /* Determine readiness */
  if (criticalHighRiskCount > 2 || compliance.overall === "BLOCKED" || pilot.overallScore < 30) {
    return {
      status: PROCUREMENT_READINESS.NOT_READY,
      technicalReadiness,
      operationalReadiness,
      evidenceStrength,
      costEffectiveness,
      riskLevel: "HIGH",
      conditions: criticalHighRiskCount > 0 ? ["Address critical risks"] : [],
      recommendation: PROCUREMENT_READINESS.NOT_READY
    };
  }
  
  if (criticalHighRiskCount <= 2 && compliance.overall !== "BLOCKED" && pilot.overallScore >= 70 && pilot.targetAchievement >= 80) {
    return {
      status: PROCUREMENT_READINESS.READY,
      technicalReadiness,
      operationalReadiness,
      evidenceStrength,
      costEffectiveness,
      riskLevel: "LOW",
      conditions: [],
      recommendation: PROCUREMENT_READINESS.READY
    };
  }
  
  if ((pilot.overallScore >= 50 && pilot.overallScore < 70) || 
      (pilot.targetAchievement >= 60 && pilot.targetAchievement < 80) ||
      criticalHighRiskCount === 1) {
    return {
      status: PROCUREMENT_READINESS.READY_WITH_CONDITIONS,
      technicalReadiness,
      operationalReadiness,
      evidenceStrength,
      costEffectiveness,
      riskLevel: "MEDIUM",
      conditions: criticalHighRiskCount > 0 ? ["Address identified risks"] : ["Monitor KPI progress closely"],
      recommendation: PROCUREMENT_READINESS.READY_WITH_CONDITIONS
    };
  }
  
  return {
    status: PROCUREMENT_READINESS.FURTHER_VALIDATION_REQUIRED,
    technicalReadiness,
    operationalReadiness,
    evidenceStrength,
    costEffectiveness,
    riskLevel: "MEDIUM",
    conditions: ["Complete additional validation", "Review KPI achievements"],
    recommendation: PROCUREMENT_READINESS.FURTHER_VALIDATION_REQUIRED
  };
}

/* ───────── OUTCOME CLASSIFICATION ───────── */

export const PILOT_OUTCOME = {
  SUCCESSFUL: "SUCCESSFUL",
  PARTIALLY_SUCCESSFUL: "PARTIALLY_SUCCESSFUL",
  NEEDS_MORE_VALIDATION: "NEEDS_MORE_VALIDATION",
  UNSUCCESSFUL: "UNSUCCESSFUL",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA"
};

export function classifyPilotOutcome(pilot, pilotResult, risks) {
  /* Classify pilot outcome based on results.
     Uses pilot result, KPI achievement, risk profile, and compliance.
  */
  const result = pilotResult ? pilotResult.result : null;
  const kpiAchievement = pilot.targetAchievement || 0;
  const criticalHighRiskCount = (risks.risks || []).filter(r => ["CRITICAL", "HIGH"].includes(r.severity)).length;
  const hasResult = result !== null && result !== undefined;
  
  /* If no result data at all */
  if (!hasResult && !kpiAchievement) {
    return { outcome: PILOT_OUTCOME.INSUFFICIENT_DATA, confidence: 0, reason: "No pilot result or KPI data available" };
  }
  
  /* Successful outcome */
  if (result === PILOT_OUTCOME.SUCCESSFUL || (kpiAchievement >= 80 && criticalHighRiskCount === 0)) {
    return {
      outcome: PILOT_OUTCOME.SUCCESSFUL,
      confidence: Math.min(100, kpiAchievement + 20),
      reason: result === PILOT_OUTCOME.SUCCESSFUL ? "Pilot completed successfully" : "KPI targets exceeded with low risk"
    };
  }
  
  /* Partially successful */
  if (result === PILOT_OUTCOME.PARTIALLY_SUCCESSFUL || (kpiAchievement >= 60 && kpiAchievement < 80) || criticalHighRiskCount === 1) {
    return {
      outcome: PILOT_OUTCOME.PARTIALLY_SUCCESSFUL,
      confidence: Math.min(100, kpiAchievement + 10),
      reason: result === PILOT_OUTCOME.PARTIALLY_SUCCESSFUL ? "Pilot partially successful with some gaps" : "KPI targets partially met with manageable risks"
    };
  }
  
  /* Needs more validation */
  if ((result === PILOT_OUTCOME.INCONCLUSIVE || kpiAchievement >= 40 && kpiAchievement < 60) || criticalHighRiskCount >= 1) {
    return {
      outcome: PILOT_OUTCOME.NEEDS_MORE_VALIDATION,
      confidence: Math.min(100, kpiAchievement + 5),
      reason: result === PILOT_OUTCOME.INCONCLUSIVE ? "Pilot inconclusive - requires more data" : "KPI targets approaching with significant risks"
    };
  }
  
  /* Unsuccessful */
  if (result === PILOT_OUTCOME.FAILED || kpiAchievement < 40 || criticalHighRiskCount >= 2) {
    return {
      outcome: PILOT_OUTCOME.UNSUCCESSFUL,
      confidence: Math.max(0, 100 - kpiAchievement),
      reason: result === PILOT_OUTCOME.FAILED ? "Pilot failed to meet objectives" : "KPI targets significantly missed with high risks"
    };
  }
  
  /* Fallback */
  return { outcome: PILOT_OUTCOME.INSUFFICIENT_DATA, confidence: 0, reason: "Unable to classify with available data" };
}

/* ───────── GENERATE PROCUREMENT-READINESS SUMMARY ───────── */

export function generateProcurementReadinessSummary({problem, startup, pilot, pilotResult, compliance, risks}) {
  /* Generate the required output format:
     Problem, Startup, Pilot, KPIs, Evidence, Cost, Risk, Compliance, Conditions, Recommendation, Human Decision
  */
  
  const outcome = classifyPilotOutcome(pilot, pilotResult, risks);
  const readiness = evaluateProcurementReadiness(pilot, pilotResult, compliance, risks);
  const documentCompleteness = computeDocumentCompleteness(pilot.requiredDocuments);
  const documentValidity = computeDocumentValidity(pilot.requiredDocuments?.map(d => ({ docType: d, status: "UNKNOWN" })) || []);
  
  /* Extract applicable regulations from pilot context */
  const applicableRegulations = pilot.risks ? pilot.risks.map(r => ({ title: r.title, code: r.id, active: true })) : [];
  
  /* Get cost and risk summaries */
  const costSummary = pilot.budget ? {
    approvedBudget: pilot.budget,
    estimatedSpent: pilot.spentBudget || 0,
    remaining: (pilot.budget || 0) - (pilot.spentBudget || 0),
    costEffectiveness: pilot.estimatedCost / pilot.budget <= 1 ? "GOOD" : "HIGH"
  } : { approvedBudget: 0, estimatedSpent: 0, remaining: 0, costEffectiveness: "UNKNOWN" };
  
  const riskSummary = risks.risks ? {
    totalRisks: risks.risks.length,
    criticalHighCount: (risks.risks || []).filter(r => ["CRITICAL", "HIGH"].includes(r.severity)).length,
    topRiskSummaries: (risks.risks || []).slice(0, 3).map(r => ({ title: r.title, severity: r.severity, category: r.category }))
  } : { totalRisks: 0, criticalHighCount: 0, topRiskSummaries: [] };
  
  const complianceSummary = evaluatePilotCompliance(pilot, applicableRegulations);
  
  return {
    problem: problem ? { id: problem.id, title: problem.title, sector: problem.sector } : null,
    startup: startup ? { id: startup.id, legalName: startup.legalName, brandName: startup.brandName, sector: startup.sector } : null,
    pilot: pilot ? {
      id: pilot.id,
      title: pilot.title,
      status: pilot.status,
      durationDays: pilot.durationDays,
      budget: pilot.budget,
      overallScore: pilot.overallScore,
      health: pilot.health || "UNKNOWN"
    } : null,
    kpis: pilot ? {
      count: pilot.kpiCount || 0,
      targetAchievement: pilot.targetAchievement || 0,
      trend: pilot.trend || "STABLE"
    } : null,
    evidence: documentCompleteness,
    validity: documentValidity,
    cost: costSummary,
    risk: riskSummary,
    compliance: complianceSummary,
    conditions: readiness.conditions,
    recommendation: outcome.outcome,
    humanDecision: null, /* To be filled by human authority */
    procurementReadiness: readiness.status,
    outcome: outcome.outcome,
    outcomeConfidence: outcome.confidence,
    riskLevel: readiness.riskLevel
  };
}

export function prepareProcurementAssessment(raw) {
  raw = objectOf(raw, {});
  const orgId = uuidOf(raw.organizationId, "organization_id");
  if (!orgId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
  return {
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    pilotResultId: uuidOf(raw.pilotResultId, "pilot_result_id"),
    organizationId: orgId,
    procurementType: str(raw.procurementType, 120, "procurement_type"),
    estimatedValue: nonNegNumber(raw.estimatedValue, "estimated_value") ?? 0,
    currency: str(raw.currency, 8, "currency") || "INR",
    applicableRules: arrayOf(raw.applicableRules, [], 50),
    eligibilityConsiderations: str(raw.eligibilityConsiderations, 2000, "eligibility_considerations"),
    requiredDocuments: arrayOf(raw.requiredDocuments, [], 50),
    riskFlags: arrayOf(raw.riskFlags, [], 50),
    pathwayId: uuidOf(raw.pathwayId, "pathway_id"),
    pathwayExplanation: str(raw.pathwayExplanation, 3000, "pathway_explanation"),
    status: raw.status == null || raw.status === "" ? "DRAFT" : enumOf(raw.status, PROCUREMENT_STATUSES, "status"),
    isDemo: !!raw.isDemo,
  };
}

export function prepareProcurementRecommendationEntry(raw) {
  raw = objectOf(raw, {});
  const assessmentId = uuidOf(raw.assessmentId, "assessment_id");
  if (!assessmentId) throw new AppError(400, "VALIDATION_FAILED", "assessment_id is required");
  return {
    assessmentId,
    recommendation: str(raw.recommendation, 2000, "recommendation", true),
    explanation: str(raw.explanation, 4000, "explanation"),
    kind: enumOf(raw.kind, RECOMMENDATION_KINDS, "kind"),
    notes: str(raw.notes, 2000, "notes"),
  };
}

/* ───────── STEP 10 — scale foundation ───────── */

export function prepareScalePlan(raw) {
  raw = objectOf(raw, {});
  const pilotId = uuidOf(raw.pilotProjectId, "pilot_project_id");
  const orgId = uuidOf(raw.organizationId, "organization_id");
  if (!pilotId) throw new AppError(400, "VALIDATION_FAILED", "pilot_project_id is required");
  if (!orgId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
  const budget = nonNegNumber(raw.estimatedBudget, "estimated_budget");
  if (raw.estimatedBudget != null && budget === null) {
    throw new AppError(400, "VALIDATION_FAILED", "estimated_budget is required");
  }
  return {
    pilotProjectId: pilotId,
    organizationId: orgId,
    challengeId: uuidOf(raw.challengeId, "challenge_id"),
    targetGeography: arrayOf(raw.targetGeography, [], 40),
    targetDepartments: arrayOf(raw.targetDepartments, [], 40),
    estimatedUsers: nonNegNumber(raw.estimatedUsers, "estimated_users"),
    estimatedBudget: budget ?? 0,
    currency: str(raw.currency, 8, "currency") || "INR",
    infrastructureRequirements: arrayOf(raw.infrastructureRequirements, [], 40),
    staffingRequirements: arrayOf(raw.staffingRequirements, [], 40),
    trainingRequirements: arrayOf(raw.trainingRequirements, [], 40),
    securityConsiderations: arrayOf(raw.securityConsiderations, [], 40),
    implementationTimelineDays: positiveInt(raw.implementationTimelineDays, "implementation_timeline_days"),
    scaleReadinessScore: scoreInt(raw.scaleReadinessScore, "scale_readiness_score"),
    risks: arrayOf(raw.risks, [], 50),
    recommendation: str(raw.recommendation, 3000, "recommendation"),
    status: raw.status == null || raw.status === "" ? "DRAFT" : enumOf(raw.status, SCALE_PLAN_STATUSES, "status"),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── STEP 11 — audit event ───────── */

export function prepareAuditEvent(raw) {
  raw = objectOf(raw, {});
  return {
    actorUid: str(raw.actorUid, 200, "actor_uid"),
    actorRole: str(raw.actorRole, 100, "actor_role"),
    organizationId: uuidOf(raw.organizationId, "organization_id"),
    action: str(raw.action, 100, "action", true),
    entityType: str(raw.entityType, 100, "entity_type", true),
    entityId: str(raw.entityId, 100, "entity_id", true),
    oldValue: objectOf(raw.oldValue, {}),
    newValue: objectOf(raw.newValue, {}),
    source: str(raw.source, 200, "source"),
    requestId: str(raw.requestId, 100, "request_id"),
    isDemo: !!raw.isDemo,
  };
}

/* ───────── STEP 12 — evidence links ───────── */

export function prepareEvidenceLink(raw) {
  raw = objectOf(raw, {});
  const entityId = uuidOf(raw.entityId, "entity_id");
  if (!entityId) throw new AppError(400, "VALIDATION_FAILED", "entity_id is required");
  return {
    entityType: enumOf(raw.entityType, EVIDENCE_ENTITY_TYPES, "entity_type"),
    entityId,
    referenceType: enumOf(raw.referenceType, EVIDENCE_REFERENCE_TYPES, "reference_type"),
    referenceId: str(raw.referenceId, 100, "reference_id", true),
    section: str(raw.section, 200, "section"),
    citation: str(raw.citation, 1000, "citation"),
    confidence: enumOf(raw.confidence, ["low", "medium", "high"], "confidence", "low"),
  };
}

/* ───────── deterministic eligibility evaluation (NO AI) ─────────
   Evaluates active rules against a startup's declared data. This is the
   data-foundation counterpart of the REGULENS rules engine and can later
   be replaced by it. Rule evaluation here is a plain lookup, not an
   autonomous legal decision. */

function readByPath(obj, path) {
  return String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), obj);
}

export function evaluateRuleAgainstStartup(rule, startup, startupCapabilities, capabilityKeyById) {
  const actual = readByPath(startup, String(rule.criteriaPath || "").split(".")[0] ? rule.criteriaPath : rule.criteriaPath);
  const ref = rule.referenceValue;
  let passed = false;
  let status = "FAIL";
  const actualValue = actual == null ? {} : actual;

  switch (rule.operator) {
    case "EXISTS":
      passed = actual != null && String(actual) !== "";
      status = actual == null || String(actual) === "" ? "MISSING" : "PASS";
      break;
    case "HAS_CAPABILITY": {
      const capKey = String((ref && ref.key) || rule.criteriaPath || "");
      const capId = capKey ? capabilityKeyById.get(capKey) : null;
      const has = capId ? startupCapabilities.some((sc) => sc.capabilityId === capId) : false;
      passed = has;
      status = has ? "PASS" : "FAIL";
      break;
    }
    case "EQUAL":
      passed = String(actual) === String(ref);
      status = actual == null ? "MISSING" : passed ? "PASS" : "FAIL";
      break;
    case "IN":
    case "NOT_IN": {
      const list = Array.isArray(ref) ? ref.map(String) : [];
      const inList = actual != null && list.includes(String(actual));
      passed = rule.operator === "IN" ? inList : !inList;
      status = actual == null ? "MISSING" : passed ? "PASS" : "FAIL";
      break;
    }
    case "CONTAINS": {
      const hay = String(actual == null ? "" : actual).toLowerCase();
      const needle = String((ref && (ref.value ?? ref)) ?? "").toLowerCase();
      passed = hay.includes(needle);
      status = actual == null || hay === "" ? "MISSING" : passed ? "PASS" : "FAIL";
      break;
    }
    case "GT":
    case "GTE":
    case "LT":
    case "LTE": {
      const a = Number(actual);
      const b = Number(ref && ref.value != null ? ref.value : ref);
      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        passed = false;
        status = "MANUAL_REVIEW";
        break;
      }
      passed = rule.operator === "GT" ? a > b : rule.operator === "GTE" ? a >= b : rule.operator === "LT" ? a < b : a <= b;
      status = passed ? "PASS" : "FAIL";
      break;
    }
    default:
      status = "MANUAL_REVIEW";
      passed = false;
  }

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    passed,
    status,
    actualValue,
    expectedValue: ref,
    evidenceReference: rule.source || "",
    mandatory: rule.mandatory,
    category: rule.category,
  };
}

export function aggregateEligibility(results, rules) {
  const evaluated = results || [];
  const failedMandatory = evaluated.filter((r) => r.mandatory && r.status === "FAIL");
  const missing = evaluated.filter((r) => r.mandatory && r.status === "MISSING");
  const manual = evaluated.filter((r) => r.status === "MANUAL_REVIEW");
  let verdict = "ELIGIBLE";
  if (manual.length) verdict = "MANUAL_REVIEW";
  else if (failedMandatory.length || missing.length) verdict = "INELIGIBLE";
  const passed = evaluated.filter((r) => r.status === "PASS").length;
  const total = rules.length || evaluated.length;
  return {
    verdict,
    passedCriteria: passed,
    failedCriteria: failedMandatory.length,
    missingCriteria: missing.length,
    manualReviewCriteria: manual.length,
    totalCriteria: total,
    coveragePercent: total ? Math.round((passed / total) * 100) : 0,
  };
}

/* ───────── capability vocabulary seed (mirrors SQL seed for memory mode) ───────── */

export const CAPABILITY_SEED = [
  ["ai", "Artificial Intelligence", "TECHNOLOGY", "Machine learning, deep learning, generative AI"],
  ["computer-vision", "Computer Vision", "TECHNOLOGY", "Image/video analysis, OCR, object detection"],
  ["nlp", "NLP", "TECHNOLOGY", "Natural language processing, translation, chat"],
  ["iot", "IoT", "TECHNOLOGY", "Internet of Things sensors and connectivity"],
  ["blockchain", "Blockchain", "TECHNOLOGY", "Distributed ledgers, verifiable records"],
  ["cybersecurity", "Cybersecurity", "TECHNOLOGY", "Security, privacy, threat detection"],
  ["cloud", "Cloud", "TECHNOLOGY", "Cloud-native services and infrastructure"],
  ["robotics", "Robotics", "TECHNOLOGY", "Robots, drones, automation hardware"],
  ["data-analytics", "Data Analytics", "TECHNOLOGY", "Dashboards, BI, statistical analysis"],
  ["gis", "GIS", "TECHNOLOGY", "Geographic information systems, mapping"],
  ["fintech", "FinTech", "SECTOR", "Financial technology"],
  ["healthtech", "HealthTech", "SECTOR", "Healthcare technology"],
  ["agritech", "AgriTech", "SECTOR", "Agriculture technology"],
  ["edtech", "EdTech", "SECTOR", "Education technology"],
  ["smart-cities", "Smart Cities", "SECTOR", "Urban infrastructure technology"],
  ["public-service", "Public Service Delivery", "USE_CASE", "Citizen-facing service improvements"],
];

export const PATHWAY_SEED = [
  ["GeM", "Government e-Marketplace direct procurement", "GeM Framework / GFR 2017"],
  ["e-Tender", "State or central e-Procurement tendering", "e-Procurement guidelines / relevant state rules"],
  ["RFP", "Request for Proposal route", "Manual of Procurement / GFR 2017"],
  ["Pilot-first", "Pilot/PoC then negotiated procurement", "DPIIT Startup Procurement Policy guidance"],
  ["Startup-special", "Startup-specific procurement channel", "DPIIT / GeM startup corner policies"],
];