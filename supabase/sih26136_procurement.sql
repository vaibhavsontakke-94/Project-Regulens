-- ═══════════════════════════════════════════════════════════════════════
-- SIH26136 — Innovation Procurement module (additive)
-- EXTENDS the Prompt-2 foundation (sih26136.sql). Does NOT alter existing
-- business tables. Everything here is additive and idempotent.
--
-- Adds:
--   * APPROVED to sih_challenges.challenge_status (approval workflow)
--   * richer challenge configuration columns (scope, metrics, capabilities,
--     data, constraints, eligibility requirements, evaluation framework,
--     pilot requirements, provenance)
--   * sih_problem_ai_structures — append-only AI structuring run records
--     (explainability / traceability, per the product brief)
--
-- Conventions match sih26136.sql (uuid PKs, snake_case, timestamptz,
-- TEXT + CHECK, JSONB for unstructured config, RLS permissive policies,
-- server-layer access control). Apply AFTER sih26136.sql.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────────────────
-- 1. Allow APPROVED as a challenge status (was absent in sih26136.sql)
-- ────────────────────────────────────────────────────────────────────────
alter table public.sih_challenges
  drop constraint if exists sih_challenges_challenge_status_check;

alter table public.sih_challenges
  add constraint sih_challenges_challenge_status_check
    check (challenge_status in (
      'DRAFT','REVIEW','APPROVED','PUBLISHED','APPLICATIONS_OPEN','EVALUATION',
      'PILOT_SELECTION','PILOT_RUNNING','COMPLETED','CANCELLED','ARCHIVED'
    ));

-- ────────────────────────────────────────────────────────────────────────
-- 2. Richer challenge configuration (additive columns)
-- ────────────────────────────────────────────────────────────────────────
alter table public.sih_challenges add column if not exists scope text not null default '';
alter table public.sih_challenges add column if not exists out_of_scope text not null default '';
alter table public.sih_challenges add column if not exists target_users text not null default '';
alter table public.sih_challenges add column if not exists geography text not null default '';
alter table public.sih_challenges add column if not exists success_metrics jsonb not null default '[]'::jsonb;
alter table public.sih_challenges add column if not exists technical_capabilities jsonb not null default '[]'::jsonb;
alter table public.sih_challenges add column if not exists data_requirements jsonb not null default '[]'::jsonb;
alter table public.sih_challenges add column if not exists constraints_obj jsonb not null default '[]'::jsonb;
alter table public.sih_challenges add column if not exists eligibility_requirements jsonb not null default '{}'::jsonb;
alter table public.sih_challenges add column if not exists evaluation_framework jsonb not null default '{}'::jsonb;
alter table public.sih_challenges add column if not exists pilot_requirements jsonb not null default '{}'::jsonb;
alter table public.sih_challenges add column if not exists provenance jsonb not null default '{}'::jsonb;

-- ────────────────────────────────────────────────────────────────────────
-- 3. AI structuring run records (append-only traceability)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_problem_ai_structures (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.sih_problems(id) on delete cascade,
  status text not null default 'ACCEPTED' check (status in ('ACCEPTED','EDITED','REJECTED')),
  output_json jsonb not null default '{}'::jsonb,
  provenance_json jsonb not null default '{}'::jsonb,
  model text not null default '',
  model_version text not null default '',
  prompt_version text not null default '',
  mode text not null default 'MANUAL' check (mode in ('AI','DETERMINISTIC','MANUAL')),
  generated_by text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sih_problem_ai_structures_problem_idx
  on public.sih_problem_ai_structures (problem_id);
create index if not exists sih_problem_ai_structures_created_idx
  on public.sih_problem_ai_structures (created_at desc);

-- ────────────────────────────────────────────────────────────────────────
-- RLS + grants (identical permissive pattern to sih26136.sql)
-- ────────────────────────────────────────────────────────────────────────
alter table public.sih_problem_ai_structures enable row level security;

grant all on public.sih_problem_ai_structures to anon, authenticated;

create policy "app access sih_problem_ai_structures"
  on public.sih_problem_ai_structures
  for all to anon, authenticated using (true) with check (true);
