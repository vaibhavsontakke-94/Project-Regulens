-- ═══════════════════════════════════════════════════════════════════
-- SIH26136 - EVALUATION & SHORTLIST INTELLIGENCE (additive)
--
-- Extends the EXISTING evaluation foundation (sih_evaluation_templates /
-- sih_evaluation_criteria / sih_evaluations / sih_evaluation_scores) so the
-- government can configure challenge-specific criteria, freeze criterion
-- versions, run an independent multi-evaluator workflow, aggregate scores
-- deterministically, detect variance, and record an audited human decision
-- with a structured pilot handoff.
--
-- ADDITIVE and idempotent (IF NOT EXISTS / DO blocks). Column names mirror
-- the store SCHEMAS in lib/sih-store.js (snake_case here, camelCase in JSON).
-- Requires sih26136.sql to have been applied first.
--
-- Apply manually, e.g.:
--     psql "$DATABASE_URL" -f supabase/sih26136_evaluation.sql
-- ═══════════════════════════════════════════════════════════════════

-- ───── 1. EXTEND sih_evaluation_criteria (configurable + versioned, Parts 2-5) ─────
alter table public.sih_evaluation_criteria add column if not exists category text not null default 'OTHER';
alter table public.sih_evaluation_criteria add column if not exists max_score integer not null default 100;
alter table public.sih_evaluation_criteria add column if not exists minimum_score integer;
alter table public.sih_evaluation_criteria add column if not exists mandatory boolean not null default false;
alter table public.sih_evaluation_criteria add column if not exists evidence_required boolean not null default false;
alter table public.sih_evaluation_criteria add column if not exists evaluation_guidance text not null default '';
alter table public.sih_evaluation_criteria add column if not exists source_reference text not null default '';
alter table public.sih_evaluation_criteria add column if not exists criterion_status text not null default 'ACTIVE'
  check (criterion_status in ('DRAFT','UNDER_REVIEW','APPROVED','ACTIVE','SUPERSEDED','INACTIVE'));
alter table public.sih_evaluation_criteria add column if not exists version integer not null default 1;
alter table public.sih_evaluation_criteria add column if not exists updated_at timestamptz not null default now();

-- ───── 2. EXTEND sih_evaluations.status (Part 21 workflow states; additive) ─────
-- Keeps the legacy DRAFT/SUBMITTED/APPROVED/REJECTED values and adds the
-- independent evaluator states LOCKED/REOPENED/CANCELLED/NOT_STARTED/IN_PROGRESS.
do $$
begin
  alter table public.sih_evaluations drop constraint if exists sih_evaluations_status_check;
exception when others then
  null;
end $$;

alter table public.sih_evaluations add constraint sih_evaluations_status_check
  check (status in (
    'DRAFT','SUBMITTED','APPROVED','REJECTED',
    'NOT_STARTED','IN_PROGRESS','SUBMITTED','LOCKED','REOPENED','CANCELLED'
  ));

-- ───── 3. Evaluation configuration (per challenge, Part 6/23/30) ─────
create table if not exists public.sih_evaluation_configurations (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  template_id uuid references public.sih_evaluation_templates(id),
  aggregation_method text not null default 'MEAN'
    check (aggregation_method in ('MEAN','MEDIAN','WEIGHTED_MEAN','CUSTOM_AUTHORIZED_METHOD')),
  evaluator_weighting_enabled boolean not null default false,
  low_comment_threshold integer not null default 40,
  high_comment_threshold integer not null default 90,
  advance_threshold integer not null default 80,
  advance_with_review_threshold integer not null default 70,
  review_threshold integer not null default 60,
  do_not_advance_threshold integer not null default 50,
  engine_version text not null default '1.0.0',
  status text not null default 'ACTIVE',
  is_demo boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sih_eval_configs_challenge_uniq
  on public.sih_evaluation_configurations (challenge_id);

-- ───── 4. Immutable configuration snapshots (append-only versioning) ─────
create table if not exists public.sih_evaluation_configuration_versions (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references public.sih_evaluation_configurations(id) on delete cascade,
  version integer not null default 1,
  snapshot jsonb not null default '{}'::jsonb,
  created_by text not null default '',
  change_reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_cfg_versions_cfg_idx
  on public.sih_evaluation_configuration_versions (configuration_id, created_at desc);

-- ───── 5. Evaluator assignments (Part 19/56/64) ─────
create table if not exists public.sih_evaluator_assignments (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  organization_id uuid not null references public.sih_organizations(id) on delete cascade,
  evaluation_id uuid not null references public.sih_evaluations(id) on delete cascade,
  evaluator_uid text not null,
  criteria_keys jsonb not null default '[]'::jsonb,
  status text not null default 'ASSIGNED'
    check (status in ('ASSIGNED','IN_PROGRESS','SUBMITTED')),
  assigned_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_assignments_challenge_idx
  on public.sih_evaluator_assignments (challenge_id);
create index if not exists sih_eval_assignments_evaluator_idx
  on public.sih_evaluator_assignments (evaluator_uid);

-- ───── 6. Evaluation comments (Part 16/36/42) ─────
create table if not exists public.sih_evaluation_comments (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.sih_evaluations(id) on delete cascade,
  criterion_key text not null,
  kind text not null default 'EVALUATOR_NOTE'
    check (kind in ('EVALUATOR_NOTE','CRITICAL','REASON')),
  comment text not null,
  required boolean not null default false,
  reason text not null default '',
  actor_uid text not null default '',
  actor_role text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_comments_evaluation_idx
  on public.sih_evaluation_comments (evaluation_id, created_at desc);

-- ───── 7. Immutable evaluation snapshots (Part 43) ─────
create table if not exists public.sih_evaluation_snapshots (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  organization_id uuid not null references public.sih_organizations(id),
  evaluation_id uuid references public.sih_evaluations(id),
  snapshot_type text not null default 'SUBMISSION'
    check (snapshot_type in ('SUBMISSION','RE_EVALUATION','AGGREGATION')),
  snapshot jsonb not null default '{}'::jsonb,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_snapshots_challenge_idx
  on public.sih_evaluation_snapshots (challenge_id, startup_id, created_at desc);
create index if not exists sih_eval_snapshots_evaluation_idx
  on public.sih_evaluation_snapshots (evaluation_id);

-- ───── 8. Aggregated evaluation results (Part 22-30) ─────
create table if not exists public.sih_evaluation_aggregations (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  organization_id uuid not null references public.sih_organizations(id),
  configuration_id uuid references public.sih_evaluation_configurations(id),
  configuration_version integer not null default 1,
  engine_version text not null default '1.0.0',
  aggregation_method text not null default 'MEAN',
  total numeric(9,2) not null default 0,
  criteria jsonb not null default '[]'::jsonb,
  evidence_coverage numeric(6,2) not null default 0,
  confidence numeric(6,2) not null default 0,
  participation_count integer not null default 0,
  mandatory_failed boolean not null default false,
  result text not null default 'NOT_EVALUATED'
    check (result in ('ADVANCE','ADVANCE_WITH_REVIEW','REVIEW_REQUIRED','DO_NOT_ADVANCE','INCOMPLETE','NOT_EVALUATED')),
  critical_items jsonb not null default '[]'::jsonb,
  snapshot_id uuid references public.sih_evaluation_snapshots(id),
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_aggs_challenge_idx
  on public.sih_evaluation_aggregations (challenge_id, startup_id, created_at desc);

-- ───── 9. Variance / outlier flags (Part 25/26) ─────
create table if not exists public.sih_evaluation_variance_flags (
  id uuid primary key default gen_random_uuid(),
  aggregation_id uuid not null references public.sih_evaluation_aggregations(id) on delete cascade,
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  criterion_key text not null default '',
  kind text not null check (kind in ('HIGH_VARIANCE','OUTLIER')),
  detail text not null default '',
  resolved boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_variance_agg_idx
  on public.sih_evaluation_variance_flags (aggregation_id);

-- ───── 10. Final human decisions (Part 31/32/42) ─────
create table if not exists public.sih_evaluation_decisions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  organization_id uuid not null references public.sih_organizations(id),
  decision text not null
    check (decision in ('PROCEED_TO_PILOT','REQUEST_MORE_INFORMATION','HOLD','DO_NOT_PROCEED','CUSTOM')),
  reason text not null,
  decision_stage text not null default 'EVALUATION',
  conditions jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  evaluation_snapshot_id uuid references public.sih_evaluation_snapshots(id),
  aggregation_id uuid references public.sih_evaluation_aggregations(id),
  actor_uid text not null default '',
  actor_role text not null default '',
  superseded_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_eval_decisions_challenge_idx
  on public.sih_evaluation_decisions (challenge_id, startup_id, created_at desc);

-- ───── 11. Request-information (Part 29/31/52) ─────
create table if not exists public.sih_evaluation_requests (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  organization_id uuid not null references public.sih_organizations(id),
  evaluation_id uuid references public.sih_evaluations(id),
  subject text not null,
  details text not null default '',
  required_evidence jsonb not null default '[]'::jsonb,
  status text not null default 'OPEN' check (status in ('OPEN','ANSWERED','CLOSED')),
  requested_by text not null default '',
  answered_by text not null default '',
  answered_at timestamptz,
  answer text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_requests_challenge_idx
  on public.sih_evaluation_requests (challenge_id, startup_id);

-- ───── 12. Pilot handoff (Part 51) ─────
create table if not exists public.sih_pilot_handoffs (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references public.sih_evaluation_decisions(id),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  organization_id uuid not null references public.sih_organizations(id),
  evaluation_snapshot_id uuid references public.sih_evaluation_snapshots(id),
  selected_criteria jsonb not null default '[]'::jsonb,
  identified_gaps jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  pilot_readiness jsonb not null default '{}'::jsonb,
  expected_kpis jsonb not null default '[]'::jsonb,
  required_evidence jsonb not null default '[]'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','ISSUED')),
  issued_by text not null default '',
  issued_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sih_eval_handoffs_challenge_idx
  on public.sih_pilot_handoffs (challenge_id, startup_id);