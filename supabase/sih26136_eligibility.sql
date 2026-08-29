-- ═══════════════════════════════════════════════════════════════════════
-- SIH26136 — ELIGIBILITY ENGINE (additive)
-- Extends the existing eligibility foundation with:
--   * richer, configurable rule model (rule_type, severity, provenance,
--     authority scope, versioning, effective window, lifecycle status)
--   * immutable evaluation snapshots
--   * version history + human review actions
-- All changes are additive; existing REGULENS + SIH tables are untouched.
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────
-- 1) Extend sih_eligibility_rules (configurable, provenance- & version-aware)
-- ───────────────────────────────────────────────────────────────────────
alter table public.sih_eligibility_rules
  add column if not exists rule_type text not null default ''
    check (rule_type in (
      'REQUIRED_ATTRIBUTE','ATTRIBUTE_EQUALS','ATTRIBUTE_IN_SET','ATTRIBUTE_NOT_IN_SET',
      'BOOLEAN_REQUIREMENT','DOCUMENT_REQUIRED','DOCUMENT_VALID','CERTIFICATION_REQUIRED',
      'CAPABILITY_REQUIRED','SECTOR_MATCH','GEOGRAPHY_MATCH','EXPERIENCE_REQUIRED',
      'DEPLOYMENT_REQUIRED','DATE_VALIDITY','CUSTOM_REVIEW_REQUIRED','COMPOSITE_RULE'
    )),
  add column if not exists severity text not null default 'MANDATORY'
    check (severity in ('MANDATORY','IMPORTANT','ADVISORY','REVIEW_REQUIRED')),
  add column if not exists source_category text not null default ''
    check (source_category in (
      'CENTRAL_GOVERNMENT','STATE_GOVERNMENT','DEPARTMENT_POLICY','PROCUREMENT_POLICY',
      'CHALLENGE_SPECIFIC','DEPARTMENT_DEFINED','LEGAL_REVIEW','OTHER_AUTHORIZED_SOURCE'
    )),
  add column if not exists authority_scope text not null default 'UNSPECIFIED'
    check (authority_scope in ('CENTRAL','STATE_MAHARASHTRA','DEPARTMENT','CHALLENGE','UNSPECIFIED')),
  add column if not exists source_reference text not null default '',
  add column if not exists source_document text not null default '',
  add column if not exists section_ref text not null default '',
  add column if not exists source_published_at timestamptz,
  add column if not exists source_effective_at timestamptz,
  add column if not exists source_retrieved_at timestamptz,
  add column if not exists rule_version integer not null default 1
    check (rule_version >= 1),
  add column if not exists effective_from timestamptz,
  add column if not exists effective_until timestamptz,
  add column if not exists lifecycle_status text not null default 'DRAFT'
    check (lifecycle_status in ('DRAFT','UNDER_REVIEW','APPROVED','ACTIVE','SUPERSEDED','INACTIVE')),
  add column if not exists supersedes_rule_id uuid
    references public.sih_eligibility_rules(id),
  add column if not exists evidence_required boolean not null default true,
  add column if not exists trust_threshold text not null default ''
    check (trust_threshold in (
      '','SOURCE_VERIFIED','DOCUMENT_VERIFIED','DOCUMENT_EXTRACTED','USER_PROVIDED',
      'AI_INFERRED','AI_SUGGESTED','REQUIRES_REVIEW','NOT_PROVIDED'
    )),
  add column if not exists updated_by text not null default '',
  add column if not exists change_reason text not null default '';

create index if not exists sih_eligibility_rules_lifecycle_idx
  on public.sih_eligibility_rules (challenge_id, lifecycle_status);
create index if not exists sih_eligibility_rules_effective_idx
  on public.sih_eligibility_rules (effective_from, effective_until);

-- ───────────────────────────────────────────────────────────────────────
-- 2) Rule version history (Part 6) — never overwrite historical rules
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.sih_eligibility_rule_versions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.sih_eligibility_rules(id) on delete cascade,
  version integer not null check (version >= 1),
  snapshot jsonb not null default '{}'::jsonb,
  created_by text not null default '',
  change_reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eligibility_rule_versions_rule_idx
  on public.sih_eligibility_rule_versions (rule_id, version);

-- ───────────────────────────────────────────────────────────────────────
-- 3) Immutable evaluation snapshots (Part 27/29/31) — policy changes can
--    never rewrite a historical assessment
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.sih_eligibility_snapshots (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id),
  startup_id uuid not null references public.sih_startups(id),
  rule_version integer not null default 1,
  overall_status text not null default 'UNKNOWN'
    check (overall_status in (
      'ELIGIBLE','ELIGIBLE_WITH_REVIEW','CONDITIONAL','REQUIRES_EVIDENCE',
      'REQUIRES_HUMAN_REVIEW','NOT_ELIGIBLE','RULE_CONFLICT','UNKNOWN'
    )),
  summary jsonb not null default '{}'::jsonb,
  results jsonb not null default '[]'::jsonb,
  evaluated_by text not null default '',
  evaluated_at timestamptz not null default now(),
  reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eligibility_snapshots_startup_idx
  on public.sih_eligibility_snapshots (startup_id, created_at desc);
create index if not exists sih_eligibility_snapshots_challenge_idx
  on public.sih_eligibility_snapshots (challenge_id);

-- ───────────────────────────────────────────────────────────────────────
-- 4) Human review actions (Part 22/23) — full audit of rule lifecycle
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.sih_eligibility_review_actions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.sih_eligibility_rules(id) on delete cascade,
  action text not null check (action in (
    'APPROVE','REJECT','EDIT','REQUEST_CLARIFICATION','DEACTIVATE','REVIEW_CONFLICT'
  )),
  comment text not null default '',
  actor_id text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eligibility_review_actions_rule_idx
  on public.sih_eligibility_review_actions (rule_id, created_at desc);

-- ───────────────────────────────────────────────────────────────────────
-- RLS + grants (permissive per existing SIH pattern)
-- ───────────────────────────────────────────────────────────────────────
alter table public.sih_eligibility_rule_versions enable row level security;
alter table public.sih_eligibility_snapshots enable row level security;
alter table public.sih_eligibility_review_actions enable row level security;

grant select, insert, update, delete
  on public.sih_eligibility_rule_versions,
     public.sih_eligibility_snapshots,
     public.sih_eligibility_review_actions
  to anon, authenticated;

create policy "app access sih_eligibility_rule_versions"
  on public.sih_eligibility_rule_versions for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_eligibility_snapshots"
  on public.sih_eligibility_snapshots for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_eligibility_review_actions"
  on public.sih_eligibility_review_actions for all to anon, authenticated
  using (true) with check (true);
