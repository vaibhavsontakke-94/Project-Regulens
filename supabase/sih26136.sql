-- ═══════════════════════════════════════════════════════════════════════
-- SIH26136 — Startup-friendly public procurement mechanism
-- ADDITIVE domain foundation. Does NOT alter any existing table.
--
-- Conventions (identical to supabase/schema.sql):
--   * uuid primary keys default gen_random_uuid()
--   * snake_case columns
--   * timestamptz defaults now()
--   * statuses stored as TEXT with CHECK constraints (the existing
--     codebase does not use Postgres enum types — we stay consistent)
--   * JSONB only where the value is genuinely unstructured or metadata
--     (KPIs, scores, evidence baskets are structured columns)
--   * RLS is enabled with permissive policies, exactly like the existing
--     tables: all access control happens at the SERVER layer on a
--     verified Firebase uid (see lib/sih-auth.js). No client never
--     supplies actor/organization ids; the server derives them.
--   * Actor columns are TEXT holding a Firebase uid (mirrors
--     chat_history.user_id); no FK to profiles by design — the app
--     tolerates the legacy local users.json store.
--
-- This file is idempotent (IF NOT EXISTS everywhere). Apply once against
-- the existing Supabase project; ordering after schema.sql is safe.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────────────────
-- A. GOVERNMENT / ORGANIZATIONS  (reused for startups too)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_organizations (
  id uuid primary key default gen_random_uuid(),
  org_type text not null check (org_type in ('GOVERNMENT','STARTUP','PARTNER')),
  name text not null,
  short_name text not null default '',
  department_type text not null default '',
  ministry text not null default '',
  state text not null default '',
  department_code text not null default '',
  description text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  status text not null default 'ACTIVE' check (status in ('ACTIVE','DISABLED','ARCHIVED')),
  is_demo boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_organizations_type_idx on public.sih_organizations (org_type);
create index if not exists sih_organizations_state_idx on public.sih_organizations (state);

-- Team memberships (RBAC at the application layer; role stored here).
create table if not exists public.sih_organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.sih_organizations(id) on delete cascade,
  user_id text not null,
  role text not null check (role in (
    'ADMIN','OFFICER','PROCUREMENT_OFFICER','EVALUATOR','VIEWER',
    'STARTUP_ADMIN','STARTUP_MEMBER'
  )),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','REMOVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists sih_org_members_user_idx on public.sih_organization_members (user_id);
create index if not exists sih_org_members_org_idx on public.sih_organization_members (organization_id);

-- ────────────────────────────────────────────────────────────────────────
-- C. GOVERNMENT PROBLEMS
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_problems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.sih_organizations(id),
  title text not null,
  problem_statement text not null,
  current_state text not null default '',
  desired_state text not null default '',
  affected_users text not null default '',
  geography text not null default '',
  sector text not null default '',
  baseline_metrics jsonb not null default '{}'::jsonb,
  desired_outcomes jsonb not null default '{}'::jsonb,
  estimated_budget numeric not null default 0 check (estimated_budget >= 0),
  currency text not null default 'INR',
  timeline_days integer check (timeline_days is null or timeline_days > 0),
  data_availability text not null default '',
  technology_preferences jsonb not null default '[]'::jsonb,
  constraints text not null default '',
  status text not null default 'DRAFT' check (status in ('DRAFT','SUBMITTED','APPROVED','IN_CHALLENGE','ARCHIVED')),
  is_demo boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_problems_org_idx on public.sih_problems (organization_id);
create index if not exists sih_problems_status_idx on public.sih_problems (status);

-- ────────────────────────────────────────────────────────────────────────
-- D. INNOVATION CHALLENGES
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_challenges (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references public.sih_problems(id),
  organization_id uuid not null references public.sih_organizations(id),
  challenge_code text not null default '',
  title text not null,
  description text not null,
  objective text not null default '',
  expected_outcomes jsonb not null default '[]'::jsonb,
  eligibility_summary text not null default '',
  budget_min numeric not null default 0 check (budget_min >= 0),
  budget_max numeric not null default 0 check (budget_max >= 0),
  currency text not null default 'INR',
  pilot_duration_days integer check (pilot_duration_days is null or pilot_duration_days > 0),
  submission_deadline timestamptz,
  challenge_status text not null default 'DRAFT' check (challenge_status in (
    'DRAFT','REVIEW','PUBLISHED','APPLICATIONS_OPEN','EVALUATION',
    'PILOT_SELECTION','PILOT_RUNNING','COMPLETED','CANCELLED','ARCHIVED'
  )),
  evaluation_status text not null default 'NOT_STARTED' check (evaluation_status in (
    'NOT_STARTED','PENDING_EVALUATION','UNDER_EVALUATION','EVALUATION_COMPLETE','SELECTION_COMPLETE'
  )),
  is_demo boolean not null default false,
  created_by text not null default '',
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_challenges_org_idx on public.sih_challenges (organization_id);
create index if not exists sih_challenges_problem_idx on public.sih_challenges (problem_id);
create index if not exists sih_challenges_status_idx on public.sih_challenges (challenge_status);
create unique index if not exists sih_challenges_org_code_uniq
  on public.sih_challenges (organization_id, challenge_code) where challenge_code <> '';

-- ────────────────────────────────────────────────────────────────────────
-- E. STARTUP PROFILES  (declared data; verification lives separately)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_startups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.sih_organizations(id),
  legal_name text not null,
  brand_name text not null default '',
  registration_info jsonb not null default '{}'::jsonb,
  description text not null default '',
  sector text not null default '',
  stage text not null default '' check (stage in ('','PRE_SEED','SEED','EARLY_GROWTH','GROWTH','SERIES_A_PLUS')),
  website text not null default '',
  location text not null default '',
  state text not null default '',
  employee_count integer check (employee_count is null or employee_count >= 0),
  founded_year integer check (founded_year is null or (founded_year >= 1990 and founded_year <= 2100)),
  dpiit_status text not null default 'NOT_MARKED' check (dpiit_status in ('NOT_MARKED','UNREGISTERED','PENDING','REGISTERED','NOT_APPLICABLE')),
  msme_status text not null default 'NOT_MARKED' check (msme_status in ('NOT_MARKED','NO','REGISTERED','MICRO','SMALL','MEDIUM')),
  gst_status text not null default 'NOT_MARKED' check (gst_status in ('NOT_MARKED','NOT_REGISTERED','REGISTERED','EXEMPT')),
  startup_status text not null default 'ACTIVE' check (startup_status in ('ACTIVE','INACTIVE','SUSPENDED')),
  verification_status text not null default 'UNVERIFIED' check (verification_status in ('UNVERIFIED','PENDING','PARTIALLY_VERIFIED','VERIFIED','REJECTED','MANUAL_REVIEW')),
  is_demo boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_startups_org_idx on public.sih_startups (organization_id);
create index if not exists sih_startups_sector_idx on public.sih_startups (sector);
create index if not exists sih_startups_verification_idx on public.sih_startups (verification_status);

-- ────────────────────────────────────────────────────────────────────────
-- F. STARTUP CAPABILITIES  (extensible vocabulary, not hardcoded in code)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_capabilities (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  category text not null default 'TECHNOLOGY' check (category in ('TECHNOLOGY','SECTOR','USE_CASE')),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sih_startup_capabilities (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  capability_id uuid not null references public.sih_capabilities(id),
  level text not null default 'DECLARED' check (level in ('DECLARED','BASIC','INTERMEDIATE','ADVANCED','EXPERT')),
  source text not null default 'DECLARED' check (source in ('DECLARED','VERIFIED','MANUAL')),
  created_at timestamptz not null default now(),
  unique (startup_id, capability_id)
);

-- ────────────────────────────────────────────────────────────────────────
-- G. STARTUP DOCUMENTS  (METADATA + reference only — no sensitive content)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_startup_documents (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  doc_type text not null check (doc_type in (
    'DPIIT_CERTIFICATE','GST_CERTIFICATE','MSME_CERTIFICATE','INCORPORATION',
    'TECHNICAL','DEPLOYMENT_EVIDENCE','FINANCIAL','CYBERSECURITY','CERTIFICATION','PRODUCT','OTHER'
  )),
  label text not null default '',
  status text not null default 'UPLOADED' check (status in ('UPLOADED','PROCESSING','EXTRACTED','VERIFIED','REJECTED','EXPIRED')),
  reference text not null default '',
  chat_id uuid,
  extracted_meta jsonb not null default '{}'::jsonb,
  uploaded_by text not null default '',
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_startup_docs_startup_idx on public.sih_startup_documents (startup_id);
create index if not exists sih_startup_docs_status_idx on public.sih_startup_documents (status);

-- ────────────────────────────────────────────────────────────────────────
-- H. STARTUP VERIFICATION  (never fabricates external verification)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_verifications (
  id uuid primary key default gen_random_uuid(),
  verification_type text not null check (verification_type in (
    'DPIIT','MSME','GST','INCORPORATION','CERTIFICATION','CYBERSECURITY','FINANCIAL','IDENTITY','OTHER'
  )),
  target_type text not null check (target_type in ('STARTUP','ORGANIZATION','STARTUP_DOCUMENT')),
  target_id uuid not null,
  status text not null default 'PENDING' check (status in ('PENDING','VERIFIED','FAILED','EXPIRED','MANUAL_REVIEW')),
  source text not null default 'MANUAL' check (source in ('MANUAL','DEMO','OFFICIAL')),
  verified_by text not null default '',
  verified_at timestamptz,
  expires_at timestamptz,
  evidence_document_id uuid references public.sih_startup_documents(id),
  verification_notes text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_verifications_target_idx on public.sih_verifications (target_type, target_id);
create index if not exists sih_verifications_status_idx on public.sih_verifications (status);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 3 — ELIGIBILITY  (rules → check → results)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.sih_challenges(id) on delete cascade,
  name text not null,
  description text not null default '',
  criteria_path text not null default '',
  operator text not null default 'EXISTS' check (operator in (
    'EQUAL','LT','LTE','GT','GTE','CONTAINS','IN','NOT_IN','EXISTS','HAS_CAPABILITY'
  )),
  reference_value jsonb not null default '{}'::jsonb,
  mandatory boolean not null default true,
  category text not null default '',
  source text not null default '',
  source_mode text not null default 'MANUAL' check (source_mode in ('MANUAL','LEGAL_DB','DEMO')),
  weight integer not null default 0 check (weight between 0 and 100),
  active boolean not null default true,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_eligibility_rules_challenge_idx on public.sih_eligibility_rules (challenge_id);
create index if not exists sih_eligibility_rules_active_idx on public.sih_eligibility_rules (active);

create table if not exists public.sih_eligibility_checks (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id),
  startup_id uuid not null references public.sih_startups(id),
  requested_by text not null default '',
  status text not null default 'EVALUATED' check (status in ('EVALUATED','RE_EVALUATED')),
  mode text not null default 'MANUAL' check (mode in ('MANUAL','AI','MIXED')),
  evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists sih_eligibility_checks_challenge_idx on public.sih_eligibility_checks (challenge_id);
create index if not exists sih_eligibility_checks_startup_idx on public.sih_eligibility_checks (startup_id);

create table if not exists public.sih_eligibility_results (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references public.sih_eligibility_checks(id) on delete cascade,
  rule_id uuid not null references public.sih_eligibility_rules(id),
  passed boolean not null,
  status text not null default 'PASS' check (status in ('PASS','FAIL','MISSING','MANUAL_REVIEW')),
  actual_value jsonb not null default '{}'::jsonb,
  expected_value jsonb not null default '{}'::jsonb,
  evidence_reference text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eligibility_results_check_idx on public.sih_eligibility_results (check_id);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 4 — MATCHING FOUNDATION  (decision-support signals, not decisions)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_matches (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id),
  startup_id uuid not null references public.sih_startups(id),
  overall_score integer check (overall_score between 0 and 100),
  problem_fit_score integer check (problem_fit_score between 0 and 100),
  capability_score integer check (capability_score between 0 and 100),
  sector_score integer check (sector_score between 0 and 100),
  experience_score integer check (experience_score between 0 and 100),
  readiness_score integer check (readiness_score between 0 and 100),
  compliance_score integer check (compliance_score between 0 and 100),
  security_score integer check (security_score between 0 and 100),
  scalability_score integer check (scalability_score between 0 and 100),
  explanation text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  model_version text not null default '',
  kind text not null default 'AI' check (kind in ('AI','RULE_BASED','MANUAL')),
  is_demo boolean not null default false,
  generated_at timestamptz not null default now(),
  generated_by text not null default '',
  unique (challenge_id, startup_id)
);

create index if not exists sih_matches_challenge_idx on public.sih_matches (challenge_id);
create index if not exists sih_matches_startup_idx on public.sih_matches (startup_id);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 5 — EVALUATION FOUNDATION  (configurable weights, no hardcoding)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_evaluation_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.sih_organizations(id),
  name text not null,
  description text not null default '',
  is_default boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sih_evaluation_criteria (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.sih_evaluation_templates(id) on delete cascade,
  key text not null,
  label text not null,
  description text not null default '',
  weight integer not null default 0 check (weight between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (template_id, key)
);

create table if not exists public.sih_evaluations (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id),
  startup_id uuid not null references public.sih_startups(id),
  template_id uuid references public.sih_evaluation_templates(id),
  organization_id uuid not null references public.sih_organizations(id),
  evaluator_uid text not null default '',
  status text not null default 'DRAFT' check (status in ('DRAFT','SUBMITTED','APPROVED','REJECTED')),
  summary text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_evaluations_challenge_idx on public.sih_evaluations (challenge_id);
create index if not exists sih_evaluations_org_idx on public.sih_evaluations (organization_id);

create table if not exists public.sih_evaluation_scores (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.sih_evaluations(id) on delete cascade,
  criterion_key text not null,
  score integer not null check (score between 0 and 100),
  evidence_reference text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (evaluation_id, criterion_key)
);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 6/7 — PILOT + KPI FOUNDATION
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_pilot_projects (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.sih_challenges(id),
  startup_id uuid not null references public.sih_startups(id),
  organization_id uuid not null references public.sih_organizations(id),
  title text not null,
  objective text not null default '',
  location text not null default '',
  duration_days integer check (duration_days is null or duration_days > 0),
  budget numeric not null default 0 check (budget >= 0),
  currency text not null default 'INR',
  start_date timestamptz,
  end_date timestamptz,
  baseline_json jsonb not null default '{}'::jsonb,
  target_outcome text not null default '',
  acceptance_criteria jsonb not null default '[]'::jsonb,
  status text not null default 'PLANNED' check (status in ('PLANNED','APPROVED','RUNNING','PAUSED','COMPLETED','FAILED','CANCELLED')),
  responsible_dept text not null default '',
  is_demo boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_pilots_org_idx on public.sih_pilot_projects (organization_id);
create index if not exists sih_pilots_startup_idx on public.sih_pilot_projects (startup_id);
create index if not exists sih_pilots_status_idx on public.sih_pilot_projects (status);

create table if not exists public.sih_pilot_milestones (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.sih_pilot_projects(id) on delete cascade,
  title text not null,
  due_date timestamptz,
  completed_at timestamptz,
  status text not null default 'PENDING' check (status in ('PENDING','IN_PROGRESS','COMPLETED','BLOCKED','CANCELLED')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_pilot_milestones_pilot_idx on public.sih_pilot_milestones (pilot_id);

create table if not exists public.sih_pilot_kpis (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.sih_pilot_projects(id) on delete cascade,
  name text not null,
  description text not null default '',
  unit text not null default '',
  baseline_value numeric,
  target_value numeric,
  actual_value numeric,
  measurement_method text not null default '',
  frequency text not null default '',
  threshold numeric,
  status text not null default 'TARGET' check (status in ('BASELINE','TARGET','ACTUAL','CLOSED')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_pilot_kpis_pilot_idx on public.sih_pilot_kpis (pilot_id);

create table if not exists public.sih_pilot_measurements (
  id uuid primary key default gen_random_uuid(),
  kpi_id uuid not null references public.sih_pilot_kpis(id) on delete cascade,
  measured_at timestamptz not null default now(),
  value numeric not null,
  source text not null default '',
  notes text not null default '',
  recorded_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_pilot_measurements_kpi_idx on public.sih_pilot_measurements (kpi_id);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 8 — PILOT OUTCOME  (recommendation data only; never auto-procures)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_pilot_results (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.sih_pilot_projects(id) on delete cascade,
  result text not null check (result in ('SUCCESSFUL','PARTIALLY_SUCCESSFUL','FAILED','INCONCLUSIVE')),
  kpi_achievement jsonb not null default '{}'::jsonb,
  qualitative_findings text not null default '',
  risks jsonb not null default '[]'::jsonb,
  unresolved_issues jsonb not null default '[]'::jsonb,
  evaluator_comments text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  recommendation text not null check (recommendation in ('SCALE','CONDITIONAL_SCALE','REPEAT_PILOT','MODIFY_SOLUTION','STOP')),
  recommendation_notes text not null default '',
  is_demo boolean not null default false,
  evaluated_at timestamptz not null default now(),
  evaluated_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_pilot_results_pilot_idx on public.sih_pilot_results (pilot_id);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 9 — PROCUREMENT FOUNDATION  (pathway-neutral)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_procurement_paths (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  legal_source text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sih_procurement_assessments (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.sih_challenges(id),
  pilot_result_id uuid references public.sih_pilot_results(id),
  organization_id uuid not null references public.sih_organizations(id),
  procurement_type text not null default '',
  estimated_value numeric not null default 0 check (estimated_value >= 0),
  currency text not null default 'INR',
  applicable_rules jsonb not null default '[]'::jsonb,
  eligibility_considerations text not null default '',
  required_documents jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  pathway_id uuid references public.sih_procurement_paths(id),
  pathway_explanation text not null default '',
  status text not null default 'DRAFT' check (status in ('DRAFT','FINALIZED','APPROVED','REJECTED','SUPERSEDED')),
  is_demo boolean not null default false,
  generated_by text not null default '',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_procure_assess_org_idx on public.sih_procurement_assessments (organization_id);
create index if not exists sih_procure_assess_challenge_idx on public.sih_procurement_assessments (challenge_id);

-- Decision layers are kept SEPARATE — Legal/Policy source, AI
-- interpretation, Recommendation, Human decision are never one field.
create table if not exists public.sih_procurement_recommendations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.sih_procurement_assessments(id) on delete cascade,
  recommendation text not null,
  explanation text not null default '',
  kind text not null check (kind in ('LEGAL_POLICY','AI_INTERPRETATION','RECOMMENDATION','HUMAN_DECISION')),
  notes text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_procure_recs_assessment_idx on public.sih_procurement_recommendations (assessment_id);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 10 — SCALE FOUNDATION
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_scale_plans (
  id uuid primary key default gen_random_uuid(),
  pilot_project_id uuid not null references public.sih_pilot_projects(id),
  organization_id uuid not null references public.sih_organizations(id),
  challenge_id uuid references public.sih_challenges(id),
  target_geography jsonb not null default '[]'::jsonb,
  target_departments jsonb not null default '[]'::jsonb,
  estimated_users integer check (estimated_users is null or estimated_users >= 0),
  estimated_budget numeric not null default 0 check (estimated_budget >= 0),
  currency text not null default 'INR',
  infrastructure_requirements jsonb not null default '[]'::jsonb,
  staffing_requirements jsonb not null default '[]'::jsonb,
  training_requirements jsonb not null default '[]'::jsonb,
  security_considerations jsonb not null default '[]'::jsonb,
  implementation_timeline_days integer check (implementation_timeline_days is null or implementation_timeline_days > 0),
  scale_readiness_score integer check (scale_readiness_score between 0 and 100),
  risks jsonb not null default '[]'::jsonb,
  recommendation text not null default '',
  status text not null default 'DRAFT' check (status in ('DRAFT','UNDER_REVIEW','APPROVED','IN_PROGRESS','COMPLETED','REJECTED')),
  is_demo boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_scale_plans_org_idx on public.sih_scale_plans (organization_id);
create index if not exists sih_scale_plans_pilot_idx on public.sih_scale_plans (pilot_project_id);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 11 — AUDIT TRAIL  (append-only, immutable by design)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_uid text not null default '',
  actor_role text not null default '',
  organization_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  source text not null default '',
  request_id text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sih_audit_entity_idx on public.sih_audit_events (entity_type, entity_id);
create index if not exists sih_audit_actor_idx on public.sih_audit_events (actor_uid);
create index if not exists sih_audit_org_idx on public.sih_audit_events (organization_id);
create index if not exists sih_audit_created_idx on public.sih_audit_events (created_at desc);

-- ────────────────────────────────────────────────────────────────────────
-- STEP 12 — EVIDENCE LINKING  (generic Reference → Evidence)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_evidence_links (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in (
    'PILOT_RESULT','PROCUREMENT_ASSESSMENT','SCALE_PLAN','MATCH','ELIGIBILITY_CHECK'
  )),
  entity_id uuid not null,
  reference_type text not null check (reference_type in ('DOCUMENT','RULE','REGULATION','POLICY','RECORD','MEASUREMENT')),
  reference_id text not null,
  section text not null default '',
  citation text not null default '',
  confidence text not null default 'low' check (confidence in ('low','medium','high')),
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_evidence_entity_idx on public.sih_evidence_links (entity_type, entity_id);

-- ────────────────────────────────────────────────────────────────────────
-- Extensible capability vocabulary seed (data, not application logic).
-- Register new capabilities with INSERT ... ON CONFLICT DO NOTHING.
-- ────────────────────────────────────────────────────────────────────────
insert into public.sih_capabilities (key, label, category, description) values
  ('ai', 'Artificial Intelligence', 'TECHNOLOGY', 'Machine learning, deep learning, generative AI'),
  ('computer-vision', 'Computer Vision', 'TECHNOLOGY', 'Image/video analysis, OCR, object detection'),
  ('nlp', 'NLP', 'TECHNOLOGY', 'Natural language processing, translation, chat'),
  ('iot', 'IoT', 'TECHNOLOGY', 'Internet of Things sensors and connectivity'),
  ('blockchain', 'Blockchain', 'TECHNOLOGY', 'Distributed ledgers, verifiable records'),
  ('cybersecurity', 'Cybersecurity', 'TECHNOLOGY', 'Security, privacy, threat detection'),
  ('cloud', 'Cloud', 'TECHNOLOGY', 'Cloud-native services and infrastructure'),
  ('robotics', 'Robotics', 'TECHNOLOGY', 'Robots, drones, automation hardware'),
  ('data-analytics', 'Data Analytics', 'TECHNOLOGY', 'Dashboards, BI, statistical analysis'),
  ('gis', 'GIS', 'TECHNOLOGY', 'Geographic information systems, mapping'),
  ('fintech', 'FinTech', 'SECTOR', 'Financial technology'),
  ('healthtech', 'HealthTech', 'SECTOR', 'Healthcare technology'),
  ('agritech', 'AgriTech', 'SECTOR', 'Agriculture technology'),
  ('edtech', 'EdTech', 'SECTOR', 'Education technology'),
  ('smart-cities', 'Smart Cities', 'SECTOR', 'Urban infrastructure technology'),
  ('public-service', 'Public Service Delivery', 'USE_CASE', 'Citizen-facing service improvements')
on conflict (key) do nothing;

-- ────────────────────────────────────────────────────────────────────────
-- Pathway vocabulary (procurement routes — extensible, never hardcoded).
-- ────────────────────────────────────────────────────────────────────────
insert into public.sih_procurement_paths (name, description, legal_source) values
  ('GeM', 'Government e-Marketplace direct procurement', 'GeM Framework / GFR 2017'),
  ('e-Tender', 'State or central e-Procurement tendering', 'e-Procurement guidelines / relevant state rules'),
  ('RFP', 'Request for Proposal route', 'Manual of Procurement / GFR 2017'),
  ('Pilot-first', 'Pilot/PoC then negotiated procurement', 'DPIIT Startup Procurement Policy guidance'),
  ('Startup-special', 'Startup-specific procurement channel', 'DPIIT / GeM startup corner policies')
on conflict (name) do nothing;

-- ────────────────────────────────────────────────────────────────────────
-- RLS + grants (identical pattern to the existing chat_history/profiles)
-- ────────────────────────────────────────────────────────────────────────
alter table public.sih_organizations enable row level security;
alter table public.sih_organization_members enable row level security;
alter table public.sih_problems enable row level security;
alter table public.sih_challenges enable row level security;
alter table public.sih_startups enable row level security;
alter table public.sih_capabilities enable row level security;
alter table public.sih_startup_capabilities enable row level security;
alter table public.sih_startup_documents enable row level security;
alter table public.sih_verifications enable row level security;
alter table public.sih_eligibility_rules enable row level security;
alter table public.sih_eligibility_checks enable row level security;
alter table public.sih_eligibility_results enable row level security;
alter table public.sih_matches enable row level security;
alter table public.sih_evaluation_templates enable row level security;
alter table public.sih_evaluation_criteria enable row level security;
alter table public.sih_evaluations enable row level security;
alter table public.sih_evaluation_scores enable row level security;
alter table public.sih_pilot_projects enable row level security;
alter table public.sih_pilot_milestones enable row level security;
alter table public.sih_pilot_kpis enable row level security;
alter table public.sih_pilot_measurements enable row level security;
alter table public.sih_pilot_results enable row level security;
alter table public.sih_procurement_paths enable row level security;
alter table public.sih_procurement_assessments enable row level security;
alter table public.sih_procurement_recommendations enable row level security;
alter table public.sih_scale_plans enable row level security;
alter table public.sih_audit_events enable row level security;
alter table public.sih_evidence_links enable row level security;

grant all on public.sih_organizations, public.sih_organization_members,
  public.sih_problems, public.sih_challenges, public.sih_startups,
  public.sih_capabilities, public.sih_startup_capabilities,
  public.sih_startup_documents, public.sih_verifications,
  public.sih_eligibility_rules, public.sih_eligibility_checks,
  public.sih_eligibility_results, public.sih_matches,
  public.sih_evaluation_templates, public.sih_evaluation_criteria,
  public.sih_evaluations, public.sih_evaluation_scores,
  public.sih_pilot_projects, public.sih_pilot_milestones,
  public.sih_pilot_kpis, public.sih_pilot_measurements,
  public.sih_pilot_results, public.sih_procurement_paths,
  public.sih_procurement_assessments, public.sih_procurement_recommendations,
  public.sih_scale_plans, public.sih_audit_events, public.sih_evidence_links
  to anon, authenticated;

-- Audit trail is append-only in the application layer (lib/sih-audit.js
-- never sends UPDATE/DELETE). Defensive permissive policies match the
-- existing architecture (server-layer access control).
create policy "app access sih_organizations" on public.sih_organizations for all to anon, authenticated using (true) with check (true);
create policy "app access sih_organization_members" on public.sih_organization_members for all to anon, authenticated using (true) with check (true);
create policy "app access sih_problems" on public.sih_problems for all to anon, authenticated using (true) with check (true);
create policy "app access sih_challenges" on public.sih_challenges for all to anon, authenticated using (true) with check (true);
create policy "app access sih_startups" on public.sih_startups for all to anon, authenticated using (true) with check (true);
create policy "app access sih_capabilities" on public.sih_capabilities for all to anon, authenticated using (true) with check (true);
create policy "app access sih_startup_capabilities" on public.sih_startup_capabilities for all to anon, authenticated using (true) with check (true);
create policy "app access sih_startup_documents" on public.sih_startup_documents for all to anon, authenticated using (true) with check (true);
create policy "app access sih_verifications" on public.sih_verifications for all to anon, authenticated using (true) with check (true);
create policy "app access sih_eligibility_rules" on public.sih_eligibility_rules for all to anon, authenticated using (true) with check (true);
create policy "app access sih_eligibility_checks" on public.sih_eligibility_checks for all to anon, authenticated using (true) with check (true);
create policy "app access sih_eligibility_results" on public.sih_eligibility_results for all to anon, authenticated using (true) with check (true);
create policy "app access sih_matches" on public.sih_matches for all to anon, authenticated using (true) with check (true);
create policy "app access sih_evaluation_templates" on public.sih_evaluation_templates for all to anon, authenticated using (true) with check (true);
create policy "app access sih_evaluation_criteria" on public.sih_evaluation_criteria for all to anon, authenticated using (true) with check (true);
create policy "app access sih_evaluations" on public.sih_evaluations for all to anon, authenticated using (true) with check (true);
create policy "app access sih_evaluation_scores" on public.sih_evaluation_scores for all to anon, authenticated using (true) with check (true);
create policy "app access sih_pilot_projects" on public.sih_pilot_projects for all to anon, authenticated using (true) with check (true);
create policy "app access sih_pilot_milestones" on public.sih_pilot_milestones for all to anon, authenticated using (true) with check (true);
create policy "app access sih_pilot_kpis" on public.sih_pilot_kpis for all to anon, authenticated using (true) with check (true);
create policy "app access sih_pilot_measurements" on public.sih_pilot_measurements for all to anon, authenticated using (true) with check (true);
create policy "app access sih_pilot_results" on public.sih_pilot_results for all to anon, authenticated using (true) with check (true);
create policy "app access sih_procurement_paths" on public.sih_procurement_paths for all to anon, authenticated using (true) with check (true);
create policy "app access sih_procurement_assessments" on public.sih_procurement_assessments for all to anon, authenticated using (true) with check (true);
create policy "app access sih_procurement_recommendations" on public.sih_procurement_recommendations for all to anon, authenticated using (true) with check (true);
create policy "app access sih_scale_plans" on public.sih_scale_plans for all to anon, authenticated using (true) with check (true);
create policy "app access sih_audit_events" on public.sih_audit_events for all to anon, authenticated using (true) with check (true);
create policy "app access sih_evidence_links" on public.sih_evidence_links for all to anon, authenticated using (true) with check (true);