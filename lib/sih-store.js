/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — additive persistence layer
   Reuses the existing Supabase REST client (lib/supabase.js) through the
   server-side service-role key, exactly like lib/store.js does for chat.
   When Supabase is not configured it falls back to an in-process store —
   the same pattern the app already uses for ephemeral chat. No second
   database, no new ORM, one table set (sih_* from supabase/sih26136.sql).
   ═══════════════════════════════════════════════════════════════════ */
import * as supabase from "./supabase.js";
import { AppError } from "./errors.js";
import { CAPABILITY_SEED, PATHWAY_SEED } from "./sih-domain.js";

/* ───────── camelCase ↔ snake_case column maps per table ───────── */
const SCHEMAS = {
  organizations: [
    ["id", "id"], ["orgType", "org_type"], ["name", "name"], ["shortName", "short_name"],
    ["departmentType", "department_type"], ["ministry", "ministry"], ["state", "state"],
    ["departmentCode", "department_code"], ["description", "description"],
    ["contactEmail", "contact_email"], ["contactPhone", "contact_phone"], ["status", "status"],
    ["isDemo", "is_demo"], ["createdBy", "created_by"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  organization_members: [
    ["id", "id"], ["organizationId", "organization_id"], ["userId", "user_id"], ["role", "role"],
    ["status", "status"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  problems: [
    ["id", "id"], ["organizationId", "organization_id"], ["title", "title"],
    ["problemStatement", "problem_statement"], ["currentState", "current_state"],
    ["desiredState", "desired_state"], ["affectedUsers", "affected_users"], ["geography", "geography"],
    ["sector", "sector"], ["baselineMetrics", "baseline_metrics"], ["desiredOutcomes", "desired_outcomes"],
    ["estimatedBudget", "estimated_budget"], ["currency", "currency"], ["timelineDays", "timeline_days"],
    ["dataAvailability", "data_availability"], ["technologyPreferences", "technology_preferences"],
    ["constraints", "constraints"], ["status", "status"], ["isDemo", "is_demo"],
    ["createdBy", "created_by"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  challenges: [
    ["id", "id"], ["problemId", "problem_id"], ["organizationId", "organization_id"],
    ["challengeCode", "challenge_code"], ["title", "title"], ["description", "description"],
    ["objective", "objective"], ["expectedOutcomes", "expected_outcomes"],
    ["scope", "scope"], ["outOfScope", "out_of_scope"], ["targetUsers", "target_users"],
    ["geography", "geography"], ["successMetrics", "success_metrics"],
    ["technicalCapabilities", "technical_capabilities"], ["dataRequirements", "data_requirements"],
    ["constraints", "constraints_obj"],
    ["eligibilitySummary", "eligibility_summary"], ["eligibilityRequirements", "eligibility_requirements"],
    ["evaluationFramework", "evaluation_framework"], ["pilotRequirements", "pilot_requirements"],
    ["provenance", "provenance"],
    ["budgetMin", "budget_min"], ["budgetMax", "budget_max"],
    ["currency", "currency"], ["pilotDurationDays", "pilot_duration_days"],
    ["submissionDeadline", "submission_deadline"], ["challengeStatus", "challenge_status"],
    ["evaluationStatus", "evaluation_status"], ["isDemo", "is_demo"], ["createdBy", "created_by"],
    ["publishedAt", "published_at"], ["closedAt", "closed_at"], ["createdAt", "created_at"],
    ["updatedAt", "updated_at"],
  ],
  problem_ai_structures: [
    ["id", "id"], ["problemId", "problem_id"], ["status", "status"],
    ["outputJson", "output_json"], ["provenanceJson", "provenance_json"],
    ["model", "model"], ["modelVersion", "model_version"], ["promptVersion", "prompt_version"],
    ["mode", "mode"], ["generatedBy", "generated_by"], ["isDemo", "is_demo"],
    ["createdAt", "created_at"],
  ],
  startups: [
    ["id", "id"], ["organizationId", "organization_id"], ["legalName", "legal_name"],
    ["brandName", "brand_name"], ["registrationInfo", "registration_info"], ["description", "description"],
    ["sector", "sector"], ["stage", "stage"], ["website", "website"], ["location", "location"],
    ["state", "state"], ["employeeCount", "employee_count"], ["foundedYear", "founded_year"],
    ["dpiitStatus", "dpiit_status"], ["msmeStatus", "msme_status"], ["gstStatus", "gst_status"],
    ["startupStatus", "startup_status"], ["verificationStatus", "verification_status"],
    ["isDemo", "is_demo"], ["createdBy", "created_by"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  capabilities: [
    ["id", "id"], ["key", "key"], ["label", "label"], ["category", "category"],
    ["description", "description"], ["active", "active"], ["createdAt", "created_at"],
  ],
  startup_capabilities: [
    ["id", "id"], ["startupId", "startup_id"], ["capabilityId", "capability_id"],
    ["level", "level"], ["source", "source"], ["createdAt", "created_at"],
  ],
  startup_documents: [
    ["id", "id"], ["startupId", "startup_id"], ["docType", "doc_type"], ["label", "label"],
    ["status", "status"], ["reference", "reference"], ["chatId", "chat_id"],
    ["extractedMeta", "extracted_meta"], ["uploadedBy", "uploaded_by"], ["uploadedAt", "uploaded_at"],
    ["updatedAt", "updated_at"],
    ["docHash", "doc_hash"], ["fingerprint", "fingerprint"],
    ["issueDate", "issue_date"], ["expiryDate", "expiry_date"], ["expiryStatus", "expiry_status"],
  ],
  verifications: [
    ["id", "id"], ["verificationType", "verification_type"], ["targetType", "target_type"],
    ["targetId", "target_id"], ["status", "status"], ["source", "source"], ["verifiedBy", "verified_by"],
    ["verifiedAt", "verified_at"], ["expiresAt", "expires_at"],
    ["evidenceDocumentId", "evidence_document_id"], ["verificationNotes", "verification_notes"],
    ["isDemo", "is_demo"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  eligibility_rules: [
    ["id", "id"], ["challengeId", "challenge_id"], ["name", "name"], ["description", "description"],
    ["criteriaPath", "criteria_path"], ["operator", "operator"], ["referenceValue", "reference_value"],
    ["mandatory", "mandatory"], ["category", "category"], ["source", "source"], ["sourceMode", "source_mode"],
    ["weight", "weight"], ["active", "active"], ["createdBy", "created_by"], ["createdAt", "created_at"],
    ["updatedAt", "updated_at"],
    ["ruleType", "rule_type"], ["severity", "severity"], ["sourceCategory", "source_category"],
    ["authorityScope", "authority_scope"], ["sourceReference", "source_reference"],
    ["sourceDocument", "source_document"], ["sectionRef", "section_ref"],
    ["sourcePublishedAt", "source_published_at"], ["sourceEffectiveAt", "source_effective_at"],
    ["sourceRetrievedAt", "source_retrieved_at"], ["ruleVersion", "rule_version"],
    ["effectiveFrom", "effective_from"], ["effectiveUntil", "effective_until"],
    ["lifecycleStatus", "lifecycle_status"], ["supersedesRuleId", "supersedes_rule_id"],
    ["evidenceRequired", "evidence_required"], ["trustThreshold", "trust_threshold"],
    ["updatedBy", "updated_by"], ["changeReason", "change_reason"],
  ],
  eligibility_rule_versions: [
    ["id", "id"], ["ruleId", "rule_id"], ["version", "version"], ["snapshot", "snapshot"],
    ["createdBy", "created_by"], ["changeReason", "change_reason"], ["createdAt", "created_at"],
  ],
  eligibility_snapshots: [
    ["id", "id"], ["challengeId", "challenge_id"], ["startupId", "startup_id"],
    ["ruleVersion", "rule_version"], ["overallStatus", "overall_status"], ["summary", "summary"],
    ["results", "results"], ["evaluatedBy", "evaluated_by"], ["evaluatedAt", "evaluated_at"],
    ["reason", "reason"], ["createdAt", "created_at"],
  ],
  eligibility_review_actions: [
    ["id", "id"], ["ruleId", "rule_id"], ["action", "action"], ["comment", "comment"],
    ["actorId", "actor_id"], ["createdAt", "created_at"],
  ],
  eligibility_checks: [
    ["id", "id"], ["challengeId", "challenge_id"], ["startupId", "startup_id"],
    ["requestedBy", "requested_by"], ["status", "status"], ["mode", "mode"],
    ["evaluatedAt", "evaluated_at"], ["createdAt", "created_at"],
  ],
  eligibility_results: [
    ["id", "id"], ["checkId", "check_id"], ["ruleId", "rule_id"], ["passed", "passed"],
    ["status", "status"], ["actualValue", "actual_value"], ["expectedValue", "expected_value"],
    ["evidenceReference", "evidence_reference"], ["notes", "notes"], ["createdAt", "created_at"],
  ],
  matches: [
    ["id", "id"], ["challengeId", "challenge_id"], ["startupId", "startup_id"],
    ["overallScore", "overall_score"], ["problemFitScore", "problem_fit_score"],
    ["capabilityScore", "capability_score"], ["sectorScore", "sector_score"],
    ["experienceScore", "experience_score"], ["readinessScore", "readiness_score"],
    ["complianceScore", "compliance_score"], ["securityScore", "security_score"],
    ["scalabilityScore", "scalability_score"], ["explanation", "explanation"], ["evidence", "evidence"],
    ["modelVersion", "model_version"], ["kind", "kind"], ["isDemo", "is_demo"],
    ["generatedAt", "generated_at"], ["generatedBy", "generated_by"],
  ],
  evaluation_templates: [
    ["id", "id"], ["organizationId", "organization_id"], ["name", "name"],
    ["description", "description"], ["isDefault", "is_default"], ["createdBy", "created_by"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  evaluation_criteria: [
    ["id", "id"], ["templateId", "template_id"], ["key", "key"], ["label", "label"],
    ["description", "description"], ["weight", "weight"], ["active", "active"],
    ["createdAt", "created_at"],
  ],
  evaluations: [
    ["id", "id"], ["challengeId", "challenge_id"], ["startupId", "startup_id"],
    ["templateId", "template_id"], ["organizationId", "organization_id"],
    ["evaluatorUid", "evaluator_uid"], ["status", "status"], ["summary", "summary"],
    ["isDemo", "is_demo"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  evaluation_scores: [
    ["id", "id"], ["evaluationId", "evaluation_id"], ["criterionKey", "criterion_key"],
    ["score", "score"], ["evidenceReference", "evidence_reference"], ["notes", "notes"],
    ["createdAt", "created_at"],
  ],
  pilot_projects: [
    ["id", "id"], ["challengeId", "challenge_id"], ["startupId", "startup_id"],
    ["organizationId", "organization_id"], ["title", "title"], ["objective", "objective"],
    ["location", "location"], ["durationDays", "duration_days"], ["budget", "budget"],
    ["currency", "currency"], ["startDate", "start_date"], ["endDate", "end_date"],
    ["baselineJson", "baseline_json"], ["targetOutcome", "target_outcome"],
    ["acceptanceCriteria", "acceptance_criteria"], ["status", "status"],
    ["responsibleDept", "responsible_dept"], ["isDemo", "is_demo"], ["createdBy", "created_by"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  pilot_milestones: [
    ["id", "id"], ["pilotId", "pilot_id"], ["title", "title"], ["dueDate", "due_date"],
    ["completedAt", "completed_at"], ["status", "status"], ["notes", "notes"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  pilot_kpis: [
    ["id", "id"], ["pilotId", "pilot_id"], ["name", "name"], ["description", "description"],
    ["unit", "unit"], ["baselineValue", "baseline_value"], ["targetValue", "target_value"],
    ["actualValue", "actual_value"], ["measurementMethod", "measurement_method"],
    ["frequency", "frequency"], ["threshold", "threshold"], ["status", "status"],
    ["isDemo", "is_demo"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  pilot_measurements: [
    ["id", "id"], ["kpiId", "kpi_id"], ["measuredAt", "measured_at"], ["value", "value"],
    ["source", "source"], ["notes", "notes"], ["recordedBy", "recorded_by"], ["createdAt", "created_at"],
  ],
  pilot_results: [
    ["id", "id"], ["pilotId", "pilot_id"], ["result", "result"], ["kpiAchievement", "kpi_achievement"],
    ["qualitativeFindings", "qualitative_findings"], ["risks", "risks"],
    ["unresolvedIssues", "unresolved_issues"], ["evaluatorComments", "evaluator_comments"],
    ["evidence", "evidence"], ["recommendation", "recommendation"],
    ["recommendationNotes", "recommendation_notes"], ["isDemo", "is_demo"],
    ["evaluatedAt", "evaluated_at"], ["evaluatedBy", "evaluated_by"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  procurement_paths: [
    ["id", "id"], ["name", "name"], ["description", "description"], ["legalSource", "legal_source"],
    ["active", "active"], ["createdAt", "created_at"],
  ],
  procurement_assessments: [
    ["id", "id"], ["challengeId", "challenge_id"], ["pilotResultId", "pilot_result_id"],
    ["organizationId", "organization_id"], ["procurementType", "procurement_type"],
    ["estimatedValue", "estimated_value"], ["currency", "currency"],
    ["applicableRules", "applicable_rules"], ["eligibilityConsiderations", "eligibility_considerations"],
    ["requiredDocuments", "required_documents"], ["riskFlags", "risk_flags"],
    ["pathwayId", "pathway_id"], ["pathwayExplanation", "pathway_explanation"], ["status", "status"],
    ["isDemo", "is_demo"], ["generatedBy", "generated_by"], ["generatedAt", "generated_at"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  procurement_recommendations: [
    ["id", "id"], ["assessmentId", "assessment_id"], ["recommendation", "recommendation"],
    ["explanation", "explanation"], ["kind", "kind"], ["notes", "notes"],
    ["createdBy", "created_by"], ["createdAt", "created_at"],
  ],
  scale_plans: [
    ["id", "id"], ["pilotProjectId", "pilot_project_id"], ["organizationId", "organization_id"],
    ["challengeId", "challenge_id"], ["targetGeography", "target_geography"],
    ["targetDepartments", "target_departments"], ["estimatedUsers", "estimated_users"],
    ["estimatedBudget", "estimated_budget"], ["currency", "currency"],
    ["infrastructureRequirements", "infrastructure_requirements"],
    ["staffingRequirements", "staffing_requirements"], ["trainingRequirements", "training_requirements"],
    ["securityConsiderations", "security_considerations"],
    ["implementationTimelineDays", "implementation_timeline_days"],
    ["scaleReadinessScore", "scale_readiness_score"], ["risks", "risks"],
    ["recommendation", "recommendation"], ["status", "status"], ["isDemo", "is_demo"],
    ["createdBy", "created_by"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  audit_events: [
    ["id", "id"], ["actorUid", "actor_uid"], ["actorRole", "actor_role"],
    ["organizationId", "organization_id"], ["action", "action"], ["entityType", "entity_type"],
    ["entityId", "entity_id"], ["oldValue", "old_value"], ["newValue", "new_value"],
    ["source", "source"], ["requestId", "request_id"], ["isDemo", "is_demo"], ["createdAt", "created_at"],
  ],
  evidence_links: [
    ["id", "id"], ["entityType", "entity_type"], ["entityId", "entity_id"],
    ["referenceType", "reference_type"], ["referenceId", "reference_id"], ["section", "section"],
    ["citation", "citation"], ["confidence", "confidence"], ["createdBy", "created_by"],
    ["createdAt", "created_at"],
  ],
  /* ───────── SIH Startup Intelligence (additive) ───────── */
  startup_profiles: [
    ["id", "id"], ["startupId", "startup_id"], ["profileJson", "profile_json"],
    ["attributes", "attributes"], ["completeness", "completeness"], ["profileStatus", "profile_status"],
    ["isDemo", "is_demo"], ["updatedBy", "updated_by"], ["submittedAt", "submitted_at"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  startup_certifications: [
    ["id", "id"], ["startupId", "startup_id"], ["name", "name"], ["issuer", "issuer"],
    ["issuedDate", "issued_date"], ["expiryDate", "expiry_date"], ["expiryStatus", "expiry_status"],
    ["evidenceDocumentId", "evidence_document_id"], ["source", "source"], ["verifiedBy", "verified_by"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  startup_evidence: [
    ["id", "id"], ["startupId", "startup_id"], ["section", "section"], ["field", "field"],
    ["claim", "claim"], ["provenance", "provenance"], ["verificationStatus", "verification_status"],
    ["documentId", "document_id"], ["pageRef", "page_ref"], ["confidence", "confidence"],
    ["createdBy", "created_by"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  profile_verifications: [
    ["id", "id"], ["startupId", "startup_id"], ["section", "section"], ["field", "field"],
    ["status", "status"], ["source", "source"], ["confidence", "confidence"], ["note", "note"],
    ["evidenceId", "evidence_id"], ["verifiedBy", "verified_by"], ["verifiedAt", "verified_at"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  profile_flags: [
    ["id", "id"], ["startupId", "startup_id"], ["type", "type"], ["severity", "severity"],
    ["message", "message"], ["ref", "ref"], ["status", "status"],
    ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
  profile_ai_suggestions: [
    ["id", "id"], ["startupId", "startup_id"], ["kind", "kind"], ["label", "label"],
    ["data", "data"], ["status", "status"], ["model", "model"], ["promptVersion", "prompt_version"],
    ["mode", "mode"], ["generatedBy", "generated_by"], ["createdAt", "created_at"], ["updatedAt", "updated_at"],
  ],
};

function schemaOf(table) {
  return SCHEMAS[table] || [];
}
function toSnake(table, camel) {
  const out = {};
  for (const [camelKey, snakeKey] of schemaOf(table)) {
    if (camelKey === "id" || camelValueUnset(camel[camelKey])) continue;
    if (camel[camelKey] !== undefined) out[snakeKey] = camel[camelKey];
  }
  return out;
}
function camelValueUnset(v) {
  return v === undefined || v === null;
}
function toCamel(table, row) {
  const out = {};
  for (const [camelKey, snakeKey] of schemaOf(table)) {
    if (row && row[snakeKey] !== undefined && row[snakeKey] !== null) out[camelKey] = row[snakeKey];
  }
  return out;
}

function page(filters) {
  const out = {};
  for (const [k, v] of Object.entries(filters || {})) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

/* ───────── Supabase REST adapter (reuses lib/supabase.js REST client) ───────── */
function createSupabaseAdapter() {
  const rest = supabase.tableRest;
  return {
    async insert(table, row) {
      const body = toSnake(table, row);
      if (body.created_at === undefined) body.created_at = new Date().toISOString();
      if (body.updated_at === undefined) body.updated_at = new Date().toISOString();
      const rows = await rest(table, "POST", {}, { body, errorMsg: `${table} is temporarily unavailable.` });
      return toCamel(table, rows && rows[0]);
    },
    async get(table, filters) {
      const q = { select: "*", ...eqParams(filters) };
      const rows = await rest(table, "GET", q, { errorMsg: `${table} is temporarily unavailable.` });
      return rows && rows[0] ? toCamel(table, rows[0]) : null;
    },
    async select(table, filters, opts = {}) {
      const q = { select: "*", ...eqParams(filters) };
      if (opts.order) q.order = `${opts.order}.${opts.orderDir === "asc" ? "asc" : "desc"}`;
      if (opts.limit) q.limit = String(opts.limit);
      const rows = await rest(table, "GET", q, { errorMsg: `${table} is temporarily unavailable.` });
      return (rows || []).map((r) => toCamel(table, r));
    },
    async patch(table, filters, patch) {
      const body = toSnake(table, patch);
      body.updated_at = new Date().toISOString();
      const rows = await rest(table, "PATCH", eqParams(filters), { body, errorMsg: `${table} is temporarily unavailable.` });
      return rows && rows[0] ? toCamel(table, rows[0]) : null;
    },
  };
}

function eqParams(filters) {
  const q = {};
  for (const [k, v] of Object.entries(page(filters))) {
    q[k] = typeof v === "string" ? `eq.${v}` : `eq.${JSON.stringify(v)}`;
  }
  return q;
}

/* ───────── In-memory adapter (app's existing ephemeral fallback pattern) ───────── */
function createMemoryAdapter() {
  const tables = new Map();
  function initTable(name) {
    if (!tables.has(name)) tables.set(name, new Map());
    return tables.get(name);
  }
  const seed = () => {
    const cap = initTable("capabilities");
    CAPABILITY_SEED.forEach(([key, label, category, description]) => {
      const id = crypto.randomUUID();
      cap.set(id, { id, key, label, category, description, active: true });
    });
    const paths = initTable("procurement_paths");
    PATHWAY_SEED.forEach(([name]) => {
      const id = crypto.randomUUID();
      paths.set(id, { id, name, description: "", legalSource: "", active: true });
    });
  };
  seed();
  return {
    insert(table, row) {
      const store = initTable(table);
      if (store.has(row.id)) {
        throw new AppError(409, "CONFLICT", `${table} already exists with this id`);
      }
      store.set(row.id, { ...row });
      return { ...row };
    },
    get(table, filters) {
      const store = tables.get(table);
      if (!store) return null;
      for (const r of store.values()) {
        if (matches(r, filters)) return { ...r };
      }
      return null;
    },
    select(table, filters, opts = {}) {
      const store = tables.get(table);
      if (!store) return [];
      let rows = [...store.values()].filter((r) => matches(r, filters));
      if (opts.order) {
        const dir = opts.orderDir === "asc" ? 1 : -1;
        rows.sort((a, b) => {
          const av = a[opts.order];
          const bv = b[opts.order];
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          return String(av).localeCompare(String(bv)) * dir;
        });
      }
      if (opts.limit) rows = rows.slice(0, opts.limit);
      return rows.map((r) => ({ ...r }));
    },
    patch(table, filters, patch) {
      const store = tables.get(table);
      if (!store) return null;
      for (const r of store.values()) {
        if (matches(r, filters)) {
          store.set(r.id, { ...r, ...patch, id: r.id });
          return { ...store.get(r.id) };
        }
      }
      return null;
    },
    reset() {
      tables.clear();
      seed();
    },
  };
}

function matches(row, filters) {
  for (const [k, v] of Object.entries(page(filters))) {
    if (row[k] === undefined) return false;
    const a = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
    const b = typeof row[k] === "object" && row[k] !== null ? JSON.stringify(row[k]) : String(row[k]);
    if (a !== b) return false;
  }
  return true;
}

/* ───────── store factory ───────── */
export function createSihStore(options = {}) {
  const adapter =
    options.adapter === "memory" ? createMemoryAdapter()
    : options.adapter === "supabase" ? createSupabaseAdapter()
    : supabase.isConfigured() ? createSupabaseAdapter()
    : createMemoryAdapter();

  const now = () => new Date().toISOString();
  const uid = () => crypto.randomUUID();

  function insertRow(table, data) {
    return adapter.insert(table, { ...data, id: data.id || uid() });
  }

  /* organizations */
  async function createOrganization(data) {
    return insertRow("organizations", { ...data, createdAt: now(), updatedAt: now() });
  }
  async function getOrganization(id) {
    const org = await adapter.get("organizations", { id });
    if (!org) return null;
    return org;
  }
  async function patchOrganization(id, patch) {
    const updated = await adapter.patch("organizations", { id }, { ...patch, updatedAt: now() });
    return updated;
  }
  async function listOrganizationsForUser(userId) {
    const members = await adapter.select("organization_members", { userId, status: "ACTIVE" });
    const orgs = [];
    for (const m of members) {
      const org = await adapter.get("organizations", { id: m.organizationId });
      if (org) orgs.push({ ...org, role: m.role });
    }
    return orgs;
  }
  async function getMembership(userId, organizationId) {
    return adapter.get("organization_members", { userId, organizationId });
  }
  async function listMembers(organizationId) {
    return adapter.select("organization_members", { organizationId });
  }
  async function addMember(entry) {
    const existing = await getMembership(entry.userId, entry.organizationId);
    if (existing) throw new AppError(409, "CONFLICT", "User is already a member of this organization");
    return insertRow("organization_members", { ...entry, createdAt: now(), updatedAt: now() });
  }

  /* scoped helpers (multi-tenancy) */
  const scopedGet = (table, id, organizationId) =>
    adapter.get(table, { id, organizationId });
  const scopedPatch = (table, id, organizationId, patch) =>
    adapter.patch(table, { id, organizationId }, { ...patch, updatedAt: now() });

  /* problems */
  async function createProblem(data) {
    return insertRow("problems", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listProblems = (organizationId) => adapter.select("problems", { organizationId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  const getProblem = (id, organizationId) => scopedGet("problems", id, organizationId);
  const patchProblem = (id, organizationId, patch) => scopedPatch("problems", id, organizationId, patch);

  /* problem AI structure runs (append-only research record) */
  async function createProblemAiStructure(data) {
    return insertRow("problem_ai_structures", { ...data, createdAt: now() });
  }
  const listProblemAiStructures = (problemId) => adapter.select("problem_ai_structures", { problemId }, { order: "createdAt", orderDir: "desc", limit: 20 });

  /* challenges */
  async function createChallenge(data) {
    return insertRow("challenges", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listChallenges = (organizationId) => adapter.select("challenges", { organizationId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  const getChallenge = (id, organizationId) => scopedGet("challenges", id, organizationId);
  const patchChallenge = (id, organizationId, patch) => scopedPatch("challenges", id, organizationId, patch);

  /* startups */
  async function createStartup(data) {
    return insertRow("startups", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listStartups = (organizationId) => adapter.select("startups", { organizationId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  const getStartup = (id) => adapter.get("startups", { id });
  async function patchStartup(id, patch) {
    return adapter.patch("startups", { id }, { ...patch, updatedAt: now() });
  }
  async function recomputeStartupVerification(startupId) {
    const startup = await getStartup(startupId);
    if (!startup) return null;
    const verifications = await adapter.select("verifications", { targetType: "STARTUP", targetId: startupId });
    let aggregate = "UNVERIFIED";
    if (verifications.some((v) => v.status === "REJECTED")) aggregate = "REJECTED";
    else if (verifications.some((v) => v.status === "VERIFIED")) aggregate = "VERIFIED";
    else if (verifications.some((v) => v.status === "MANUAL_REVIEW")) aggregate = "MANUAL_REVIEW";
    else if (verifications.some((v) => v.status === "PENDING")) aggregate = "PENDING";
    return patchStartup(startupId, { verificationStatus: aggregate });
  }

  /* capabilities */
  const listCapabilities = () => adapter.select("capabilities", { active: true }, { order: "createdAt", orderDir: "asc", limit: 200 });
  const getCapability = (id) => adapter.get("capabilities", { id });
  const getCapabilityByKey = (key) => adapter.get("capabilities", { key });

  /* resolve organizations that may discover a startup (multi-tenancy
     visibility). Default: the owning organization plus any organization
     that owns a challenge already interacting with this startup (via a
     match or an eligibility check). Extensible to richer rules later. */
  async function startupVisibleOrganizations(startupId) {
    const seen = new Set();
    const startup = await getStartup(startupId);
    if (startup && startup.organizationId) seen.add(startup.organizationId);
    const matches = await adapter.select("matches", { startupId }, { limit: 200 });
    for (const m of matches) {
      if (m.challengeId) seen.add(await challengeOrgOf(m.challengeId));
    }
    const checks = await adapter.select("eligibility_checks", { startupId }, { limit: 200 });
    for (const c of checks) {
      if (c.challengeId) seen.add(await challengeOrgOf(c.challengeId));
    }
    const out = [];
    for (const id of seen) if (id) out.push(id);
    return out;
  }

  async function challengeOrgOf(challengeId) {
    const challenge = await adapter.get("challenges", { id: challengeId });
    return challenge ? challenge.organizationId : null;
  }

  /* startup capabilities */
  async function addStartupCapability(entry) {
    const existing = await adapter.get("startup_capabilities", { startupId: entry.startupId, capabilityId: entry.capabilityId });
    if (existing) throw new AppError(409, "CONFLICT", "This capability is already attached to the startup");
    return insertRow("startup_capabilities", { ...entry, createdAt: now() });
  }
  const listStartupCapabilities = (startupId) => adapter.select("startup_capabilities", { startupId }, { limit: 200 });

  /* startup documents */
  async function createStartupDocument(data) {
    return insertRow("startup_documents", { ...data, uploadedAt: now(), updatedAt: now() });
  }
  const listStartupDocuments = (startupId) => adapter.select("startup_documents", { startupId }, { order: "uploadedAt", orderDir: "desc", limit: 200 });
  const getStartupDocument = (id) => adapter.get("startup_documents", { id });

  /* verifications */
  async function createVerification(data) {
    return insertRow("verifications", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listVerifications = (targetType, targetId) => adapter.select("verifications", { targetType, targetId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  const getVerification = (id) => adapter.get("verifications", { id });

  /* ───────── SIH Startup Intelligence (additive) ───────── */
  async function createStartupProfile(data) {
    return insertRow("startup_profiles", { ...data, createdAt: now(), updatedAt: now() });
  }
  const getStartupProfile = (startupId) => adapter.get("startup_profiles", { startupId });
  async function patchStartupProfile(startupId, patch) {
    return adapter.patch("startup_profiles", { startupId }, { ...patch, updatedAt: now() });
  }

  async function createStartupCertification(data) {
    return insertRow("startup_certifications", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listStartupCertifications = (startupId) => adapter.select("startup_certifications", { startupId }, { order: "createdAt", orderDir: "asc", limit: 200 });
  const getStartupCertification = (id) => adapter.get("startup_certifications", { id });

  async function createStartupEvidence(data) {
    return insertRow("startup_evidence", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listStartupEvidence = (startupId) => adapter.select("startup_evidence", { startupId }, { order: "createdAt", orderDir: "asc", limit: 400 });

  async function createProfileVerification(data) {
    return insertRow("profile_verifications", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listProfileVerifications = (startupId) => adapter.select("profile_verifications", { startupId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  async function upsertProfileVerification(entry) {
    const existing = await adapter.get("profile_verifications", { startupId: entry.startupId, section: entry.section });
    if (existing) {
      return adapter.patch("profile_verifications", { id: existing.id }, { ...entry, id: undefined, updatedAt: now() });
    }
    return createProfileVerification(entry);
  }

  async function createProfileFlag(data) {
    return insertRow("profile_flags", { ...data, createdAt: now() });
  }
  const listProfileFlags = (startupId) => adapter.select("profile_flags", { startupId }, { order: "createdAt", orderDir: "desc", limit: 200 });

  async function createAiSuggestion(data) {
    return insertRow("profile_ai_suggestions", { ...data, createdAt: now() });
  }
  const listAiSuggestions = (startupId) => adapter.select("profile_ai_suggestions", { startupId }, { order: "createdAt", orderDir: "desc", limit: 100 });
  const getAiSuggestion = (id) => adapter.get("profile_ai_suggestions", { id });
  async function patchAiSuggestion(id, patch) {
    return adapter.patch("profile_ai_suggestions", { id }, { ...patch, updatedAt: now() });
  }

  /* document duplicate detection (Part 7): fingerprint/hash scan. Lightweight —
     only metadata/hash, never content loaded on profile open. */
  const findDocumentByHash = (docHash) => adapter.get("startup_documents", { docHash });
  const findDocumentByFingerprint = (fingerprint) => adapter.get("startup_documents", { fingerprint });
  const patchStartupDocument = (id, patch) => adapter.patch("startup_documents", { id }, { ...patch, updatedAt: now() });

  /* aggregate intelligence view used by copilot / verification center */
  async function getStartupIntelligence(startupId) {
    const [profile, caps, documents, evidence, verifications, flags, suggestions, certifications] = await Promise.all([
      getStartupProfile(startupId),
      listStartupCapabilities(startupId),
      listStartupDocuments(startupId),
      listStartupEvidence(startupId),
      listProfileVerifications(startupId),
      listProfileFlags(startupId),
      listAiSuggestions(startupId),
      listStartupCertifications(startupId),
    ]);
    const endpoints = caps.map((c) => c.capabilityId);
    const vocabulary = await adapter.select("capabilities", { active: true }, { limit: 200 });
    const capVocab = vocabulary.filter((v) => endpoints.includes(v.id));
    return {
      profile,
      capabilities: caps.map((c) => {
        const v = capVocab.find((x) => x.id === c.capabilityId);
        return { ...c, capabilityKey: v && v.key, label: v && v.label, category: v && v.category };
      }),
      documents, evidence, verifications, flags, suggestions, certifications,
    };
  }

  /* eligibility */
  async function createEligibilityRule(data) {
    return insertRow("eligibility_rules", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listEligibilityRules = (challengeId) => adapter.select("eligibility_rules", { challengeId }, { limit: 200 });
  const getEligibilityRule = (id) => adapter.get("eligibility_rules", { id });

  async function createEligibilityCheck(check, results) {
    const created = insertRow("eligibility_checks", { ...check, createdAt: now(), evaluatedAt: now() });
    const savedResults = [];
    for (const r of results || []) {
      savedResults.push(insertRow("eligibility_results", { ...r, checkId: created.id, createdAt: now() }));
    }
    return { ...created, results: savedResults };
  }
  const listEligibilityChecks = (challengeId) => adapter.select("eligibility_checks", { challengeId }, { order: "createdAt", orderDir: "desc", limit: 100 });
  async function getEligibilityCheck(id) {
    const check = await adapter.get("eligibility_checks", { id });
    if (!check) return null;
    const results = await adapter.select("eligibility_results", { checkId: id }, { limit: 200 });
    return { ...check, results };
  }

  /* ───── additive: eligibility engine store ───── */
  async function updateEligibilityRule(id, patch) {
    const existing = await adapter.get("eligibility_rules", { id });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Eligibility rule not found");
    const updated = await adapter.patch("eligibility_rules", { id }, { ...patch, updatedAt: now() });
    return { ...existing, ...updated };
  }

  async function createEligibilityRuleVersion(data) {
    return insertRow("eligibility_rule_versions", { ...data, createdAt: now() });
  }
  const listEligibilityRuleVersions = (ruleId) => adapter.select("eligibility_rule_versions", { ruleId }, { order: "createdAt", orderDir: "desc", limit: 100 });

  async function createEligibilitySnapshot(data) {
    return insertRow("eligibility_snapshots", { ...data, createdAt: now() });
  }
  const listEligibilitySnapshots = (challengeId, startupId) => {
    const filters = {};
    if (challengeId) filters.challengeId = challengeId;
    if (startupId) filters.startupId = startupId;
    return adapter.select("eligibility_snapshots", filters, { order: "createdAt", orderDir: "desc", limit: 100 });
  };
  const getEligibilitySnapshot = (id) => adapter.get("eligibility_snapshots", { id });

  async function createReviewAction(data) {
    return insertRow("eligibility_review_actions", { ...data, createdAt: now() });
  }
  const listReviewActions = (ruleId) => adapter.select("eligibility_review_actions", { ruleId }, { order: "createdAt", orderDir: "desc", limit: 100 });

  /* ───── matches ───── */
  async function createMatch(data) {
    const existing = await adapter.get("matches", { challengeId: data.challengeId, startupId: data.startupId });
    if (existing) throw new AppError(409, "CONFLICT", "A match record already exists for this startup and challenge");
    return insertRow("matches", { ...data, generatedAt: now() });
  }
  const listMatches = (challengeId) => adapter.select("matches", { challengeId }, { order: "overallScore", orderDir: "desc", limit: 200 });
  const getMatch = (challengeId, startupId) => adapter.get("matches", { challengeId, startupId });
  const getMatchById = (id) => adapter.get("matches", { id });

  /* evaluation templates */
  async function createEvaluationTemplate(data) {
    const created = insertRow("evaluation_templates", { ...data, createdAt: now(), updatedAt: now() });
    for (const c of data.criteria || []) {
      insertRow("evaluation_criteria", { ...c, templateId: created.id, active: true, createdAt: now() });
    }
    const criteria = await listTemplateCriteria(created.id);
    return { ...created, criteria };
  }
  async function getEvaluationTemplate(id) {
    const tpl = await adapter.get("evaluation_templates", { id });
    if (!tpl) return null;
    return { ...tpl, criteria: await listTemplateCriteria(id) };
  }
  const listTemplateCriteria = (templateId) => adapter.select("evaluation_criteria", { templateId, active: true }, { limit: 100 });
  const listEvaluationTemplates = (organizationId) => adapter.select("evaluation_templates", { organizationId }, { order: "createdAt", orderDir: "desc", limit: 100 });

  /* evaluations */
  async function createEvaluation(data) {
    return insertRow("evaluations", { ...data, createdAt: now(), updatedAt: now() });
  }
  const getEvaluation = (id) => adapter.get("evaluations", { id });
  async function patchEvaluationStatus(id, status) {
    return adapter.patch("evaluations", { id }, { status, updatedAt: now() });
  }
  const listEvaluations = (challengeId) => adapter.select("evaluations", { challengeId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  async function addEvaluationScores(scores) {
    const out = [];
    for (const s of scores) {
      const existing = await adapter.get("evaluation_scores", { evaluationId: s.evaluationId, criterionKey: s.criterionKey });
      if (existing) {
        out.push(await adapter.patch("evaluation_scores", { id: existing.id }, s));
      } else {
        out.push(insertRow("evaluation_scores", { ...s, createdAt: now() }));
      }
    }
    return out;
  }
  const listEvaluationScores = (evaluationId) => adapter.select("evaluation_scores", { evaluationId }, { limit: 100 });
  async function getEvaluationWithScores(id) {
    const ev = await getEvaluation(id);
    if (!ev) return null;
    return { ...ev, scores: await listEvaluationScores(id) };
  }

  /* pilots */
  async function createPilot(data) {
    return insertRow("pilot_projects", { ...data, createdAt: now(), updatedAt: now() });
  }
  const getPilot = (id, organizationId) => scopedGet("pilot_projects", id, organizationId);
  const listPilots = (organizationId) => adapter.select("pilot_projects", { organizationId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  const patchPilot = (id, organizationId, patch) => scopedPatch("pilot_projects", id, organizationId, patch);

  /* milestones */
  async function createMilestone(data) {
    return insertRow("pilot_milestones", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listMilestones = (pilotId) => adapter.select("pilot_milestones", { pilotId }, { order: "dueDate", orderDir: "asc", limit: 200 });

  /* kpis */
  async function createKpi(data) {
    return insertRow("pilot_kpis", { ...data, createdAt: now(), updatedAt: now() });
  }
  const listKpis = (pilotId) => adapter.select("pilot_kpis", { pilotId }, { order: "createdAt", orderDir: "asc", limit: 200 });
  const getKpi = (id) => adapter.get("pilot_kpis", { id });

  /* measurements */
  async function createMeasurement(data) {
    return insertRow("pilot_measurements", { ...data, createdAt: now() });
  }
  const listMeasurements = (kpiId) => adapter.select("pilot_measurements", { kpiId }, { order: "measuredAt", orderDir: "asc", limit: 400 });

  /* pilot results */
  async function createPilotResult(data) {
    const existing = await adapter.get("pilot_results", { pilotId: data.pilotId });
    if (existing) throw new AppError(409, "CONFLICT", "A pilot result already exists for this pilot");
    return insertRow("pilot_results", { ...data, createdAt: now(), updatedAt: now() });
  }
  const getPilotResult = (id) => adapter.get("pilot_results", { id });
  const listPilotResults = (pilotId) => adapter.select("pilot_results", { pilotId }, { limit: 10 });

  /* procurement */
  const listProcurementPaths = () => adapter.select("procurement_paths", { active: true }, { order: "createdAt", orderDir: "asc", limit: 100 });
  const getProcurementPath = (id) => adapter.get("procurement_paths", { id });
  async function createProcurementAssessment(data) {
    return insertRow("procurement_assessments", { ...data, generatedAt: now(), createdAt: now(), updatedAt: now() });
  }
  const getProcurementAssessment = (id, organizationId) => scopedGet("procurement_assessments", id, organizationId);
  const listProcurementAssessments = (organizationId) => adapter.select("procurement_assessments", { organizationId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  const patchProcurementAssessment = (id, organizationId, patch) => scopedPatch("procurement_assessments", id, organizationId, patch);

  async function createProcurementRecommendation(data) {
    return insertRow("procurement_recommendations", { ...data, createdAt: now() });
  }
  const listProcurementRecommendations = (assessmentId) => adapter.select("procurement_recommendations", { assessmentId }, { order: "createdAt", orderDir: "asc", limit: 50 });

  /* scale plans */
  async function createScalePlan(data) {
    return insertRow("scale_plans", { ...data, createdAt: now(), updatedAt: now() });
  }
  const getScalePlan = (id, organizationId) => scopedGet("scale_plans", id, organizationId);
  const listScalePlans = (organizationId) => adapter.select("scale_plans", { organizationId }, { order: "createdAt", orderDir: "desc", limit: 200 });
  const patchScalePlan = (id, organizationId, patch) => scopedPatch("scale_plans", id, organizationId, patch);

  /* audit — append only, no update/delete surface */
  async function createAuditEvent(data) {
    return insertRow("audit_events", { ...data, createdAt: now() });
  }
  const listAuditEvents = ({ organizationId, entityType, entityId, limit = 200 } = {}) =>
    adapter.select("audit_events", { organizationId, entityType, entityId }, { order: "createdAt", orderDir: "desc", limit });

  /* evidence links */
  async function createEvidenceLink(data) {
    return insertRow("evidence_links", { ...data, createdAt: now() });
  }
  const listEvidenceLinks = (entityType, entityId) => adapter.select("evidence_links", { entityType, entityId }, { order: "createdAt", orderDir: "desc", limit: 100 });

  return {
    adapterKind: options.adapter === "memory" || !supabase.isConfigured() ? "memory" : "supabase",
    resetForTests: () => adapter.reset?.(),

    createOrganization, getOrganization, patchOrganization,
    listOrganizationsForUser, getMembership, listMembers, addMember,

    createProblem, listProblems, getProblem, patchProblem,
    createProblemAiStructure, listProblemAiStructures,
    createChallenge, listChallenges, getChallenge, patchChallenge,
    createStartup, listStartups, getStartup, patchStartup, recomputeStartupVerification,
    startupVisibleOrganizations,

    listCapabilities, getCapability, getCapabilityByKey,
    addStartupCapability, listStartupCapabilities,
    createStartupDocument, listStartupDocuments, getStartupDocument,
    createVerification, listVerifications, getVerification,
    patchStartupDocument, findDocumentByHash, findDocumentByFingerprint,

    createStartupProfile, getStartupProfile, patchStartupProfile,
    createStartupCertification, listStartupCertifications, getStartupCertification,
    createStartupEvidence, listStartupEvidence,
    createProfileVerification, listProfileVerifications, upsertProfileVerification,
    createProfileFlag, listProfileFlags,
    createAiSuggestion, listAiSuggestions, getAiSuggestion, patchAiSuggestion,
    getStartupIntelligence,

    createEligibilityRule, listEligibilityRules, getEligibilityRule,
    updateEligibilityRule, createEligibilityRuleVersion, listEligibilityRuleVersions,
    createEligibilitySnapshot, listEligibilitySnapshots, getEligibilitySnapshot,
    createReviewAction, listReviewActions,
    createEligibilityCheck, listEligibilityChecks, getEligibilityCheck,

    createMatch, listMatches, getMatch, getMatchById,

    createEvaluationTemplate, getEvaluationTemplate, listEvaluationTemplates,
    createEvaluation, getEvaluation, patchEvaluationStatus, listEvaluations,
    addEvaluationScores, listEvaluationScores, getEvaluationWithScores,

    createPilot, getPilot, listPilots, patchPilot,
    createMilestone, listMilestones,
    createKpi, listKpis, getKpi,
    createMeasurement, listMeasurements,
    createPilotResult, getPilotResult, listPilotResults,

    listProcurementPaths, getProcurementPath,
    createProcurementAssessment, getProcurementAssessment, listProcurementAssessments,
    patchProcurementAssessment,
    createProcurementRecommendation, listProcurementRecommendations,

    createScalePlan, getScalePlan, listScalePlans, patchScalePlan,

    createAuditEvent, listAuditEvents,
    createEvidenceLink, listEvidenceLinks,
  };
}

export const defaultSihStore = createSihStore();

export function resetDefaultSihStore() {
  defaultSihStore.resetForTests();
  return defaultSihStore;
}

export function useMemorySihStore() {
  if (defaultSihStore.adapterKind !== "memory") {
    Object.assign(defaultSihStore, createSihStore({ adapter: "memory" }));
  }
  defaultSihStore.resetForTests();
  return defaultSihStore;
}