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

export const PROBLEM_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "IN_CHALLENGE", "ARCHIVED"];

export const CHALLENGE_STATUSES = [
  "DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "APPLICATIONS_OPEN", "EVALUATION",
  "PILOT_SELECTION", "PILOT_RUNNING", "COMPLETED", "CANCELLED", "ARCHIVED",
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

export const EVALUATION_STATUSES_APP = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

export const PILOT_STATUSES = ["PLANNED", "APPROVED", "RUNNING", "PAUSED", "COMPLETED", "FAILED", "CANCELLED"];
export const MILESTONE_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"];
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
    status: raw.status == null || raw.status === "" ? "DRAFT" : enumOf(raw.status, PROBLEM_STATUSES, "status"),
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

/* ───────── STEP 4 — match foundation ───────── */

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
  const prepared = criteria.map((c) => ({
    key: str(c && c.key, 100, "criterion key", true),
    label: str(c && c.label, 200, "criterion label", true),
    description: str(c && c.description, 500, "criterion description"),
    weight: scoreInt(c && c.weight, `weight for ${c && c.key}`) ?? 0,
  }));
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
    objective: str(raw.objective, 2000, "objective"),
    location: str(raw.location, 200, "location"),
    durationDays: positiveInt(raw.durationDays, "duration_days"),
    budget: nonNegNumber(raw.budget, "budget"),
    currency: str(raw.currency, 8, "currency") || "INR",
    startDate: start,
    endDate: end,
    baselineJson: objectOf(raw.baselineJson, {}),
    targetOutcome: str(raw.targetOutcome, 2000, "target_outcome"),
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

/* ───────── STEP 9 — procurement foundation ───────── */

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