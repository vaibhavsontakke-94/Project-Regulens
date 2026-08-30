-- ═══════════════════════════════════════════════════════════════════════
-- SIH26136 — INTELLIGENT STARTUP MATCHING (additive)
--
-- Eligibility is a HARD GATE; matching is a RANKING. These tables store
-- the versioned, evidence-aware, explainable matching outcomes that power
-- the government ranking + human shortlist workflow (Parts 1-58). They are
-- written ONLY by the deterministic matching engine (lib/sih-matching.js);
-- scores are always 0-1 and confidence is tracked SEPARATELY from score.
--
-- This file is ADDITIVE and idempotent (IF NOT EXISTS), identical in style
-- to sih26136.sql / sih26136_eligibility.sql. Column names mirror the
-- store SCHEMAS in lib/sih-store.js (snake_case here, camelCase in JSON).
-- Requires sih26136.sql (= eligibility snapshots) to have been applied.
--
-- Apply manually, e.g.:
--     psql "$DATABASE_URL" -f supabase/sih26136_matching.sql
-- ═══════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────
-- 1. Matching configuration (per challenge, weights sum to 100%)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_matching_configurations (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  config_version integer not null default 1,
  dimensions jsonb not null default '[]'::jsonb,
  active_dimensions jsonb not null default '[]'::jsonb,
  total_weight double precision not null default 0,
  complete boolean not null default false,
  normalized boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sih_matching_configurations_challenge_uniq
  on public.sih_matching_configurations (challenge_id);

-- ────────────────────────────────────────────────────────────────────────
-- 2. Immutable configuration snapshots (append-only versioning)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_matching_configuration_versions (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references public.sih_matching_configurations(id) on delete cascade,
  version integer not null default 1,
  snapshot jsonb not null default '{}'::jsonb,
  created_by text not null default '',
  change_reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_matching_cfg_versions_config_idx
  on public.sih_matching_configuration_versions (configuration_id, created_at desc);

-- ────────────────────────────────────────────────────────────────────────
-- 3. Matching runs (one per challenge invocation, immutable outcome batch)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_matching_runs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  status text not null default 'RUNNING' check (status in ('RUNNING','COMPLETED','FAILED','PARTIAL')),
  engine_version text not null default '1.0.0',
  config_version integer,
  candidate_count integer not null default 0,
  eligible_count integer not null default 0,
  retrieved_count integer not null default 0,
  reranked_count integer not null default 0,
  embedding_model text not null default 'deterministic-token-v1',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  trigger_reason text not null default '',
  error_summary text not null default '',
  created_by text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sih_matching_runs_challenge_idx
  on public.sih_matching_runs (challenge_id, started_at desc);

-- ────────────────────────────────────────────────────────────────────────
-- 4. Matching results (ranked per startup per run; immutable snapshot)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_matching_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.sih_matching_runs(id) on delete cascade,
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  rank integer,
  eligibility_snapshot_id uuid references public.sih_eligibility_snapshots(id) on delete set null,
  eligibility_status text not null default '',
  eligibility_pool text not null default '',
  match_score double precision not null default 0,
  match_confidence double precision not null default 0,
  dimension_results jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  explanation jsonb not null default '{}'::jsonb,
  startup_profile_version text not null default '',
  stale boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_matching_results_run_idx
  on public.sih_matching_results (run_id, rank asc);
create index if not exists sih_matching_results_challenge_idx
  on public.sih_matching_results (challenge_id, created_at desc);
create unique index if not exists sih_matching_results_run_startup_uniq
  on public.sih_matching_results (run_id, startup_id);

-- ────────────────────────────────────────────────────────────────────────
-- 5. Per-dimension breakdown (explainability rows, one per dimension)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_matching_dimension_results (
  id uuid primary key default gen_random_uuid(),
  matching_result_id uuid not null references public.sih_matching_results(id) on delete cascade,
  key text not null default '',
  score double precision not null default 0,
  weight double precision not null default 0,
  state text not null default 'UNKNOWN',
  note text not null default '',
  rows_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sih_matching_dimension_result_idx
  on public.sih_matching_dimension_results (matching_result_id);

-- ────────────────────────────────────────────────────────────────────────
-- 6. Human shortlist (separate from AI ranking; soft delete via removed)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_shortlists (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  matching_result_id uuid references public.sih_matching_results(id) on delete set null,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  manual_rank integer,
  note text not null default '',
  added_by text not null default '',
  removed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sih_shortlists_challenge_idx
  on public.sih_shortlists (challenge_id, created_at asc);
create unique index if not exists sih_shortlists_active_uniq
  on public.sih_shortlists (challenge_id, startup_id) where removed = false;

-- ────────────────────────────────────────────────────────────────────────
-- 7. Human matching actions (audit of every shortlist/override decision)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_human_matching_actions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sih_challenges(id) on delete cascade,
  matching_result_id uuid references public.sih_matching_results(id) on delete set null,
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  action text not null default 'NOTE' check (action in (
    'SHORTLISTED','REMOVED','REORDER','NOTE','REQUEST_INFO'
  )),
  original_rank integer,
  new_rank integer,
  reason text not null default '',
  actor_id text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sih_human_matching_actions_challenge_idx
  on public.sih_human_matching_actions (challenge_id, created_at desc);

-- ────────────────────────────────────────────────────────────────────────
-- RLS + grants (permissive per existing SIH pattern; server-layer RBAC)
-- ────────────────────────────────────────────────────────────────────────
alter table public.sih_matching_configurations enable row level security;
alter table public.sih_matching_configuration_versions enable row level security;
alter table public.sih_matching_runs enable row level security;
alter table public.sih_matching_results enable row level security;
alter table public.sih_matching_dimension_results enable row level security;
alter table public.sih_shortlists enable row level security;
alter table public.sih_human_matching_actions enable row level security;

grant all
  on public.sih_matching_configurations,
     public.sih_matching_configuration_versions,
     public.sih_matching_runs,
     public.sih_matching_results,
     public.sih_matching_dimension_results,
     public.sih_shortlists,
     public.sih_human_matching_actions
  to anon, authenticated;

create policy "app access sih_matching_configurations"
  on public.sih_matching_configurations for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_matching_configuration_versions"
  on public.sih_matching_configuration_versions for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_matching_runs"
  on public.sih_matching_runs for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_matching_results"
  on public.sih_matching_results for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_matching_dimension_results"
  on public.sih_matching_dimension_results for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_shortlists"
  on public.sih_shortlists for all to anon, authenticated
  using (true) with check (true);
create policy "app access sih_human_matching_actions"
  on public.sih_human_matching_actions for all to anon, authenticated
  using (true) with check (true);