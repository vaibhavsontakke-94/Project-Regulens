-- ═══════════════════════════════════════════════════════════════════════
-- SIH26136 — Startup Intelligence Profile layer (additive)
-- EXTENDS sih26136.sql (+ procurement migration). Does NOT alter existing
-- business tables beyond ADDITIVE columns. Every table/enum change is
-- idempotent.
--
-- Adds:
--   * startup_profiles          — ~20-section structured profile with
--                                 per-field provenance in attributes
--   * startup_certifications    — registrations/certifications w/ expiry
--   * startup_evidence          — field-level evidence w/ document+page refs
--   * profile_verifications     — field-level authoritative verification
--   * profile_flags             — non-rejecting risk/contradiction flags
--   * profile_ai_suggestions    — append-only AI capability extraction
--                                 (AI_SUGGESTED, human-confirmed)
--   * ALTER sih_startup_documents: add doc_hash, fingerprint, issue_date,
--     expiry_date, expiry_status for duplicate detection + expiry tracking
--
-- Conventions match sih26136.sql (uuid PKs, snake_case, timestamptz,
-- TEXT + CHECK, JSONB for structured config, RLS permissive policies,
-- server-layer access control). Apply AFTER sih26136.sql.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────────────────
-- 1. Startup profile (structured, ~20 sections; provenance in attributes)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_startup_profiles (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  profile_json jsonb not null default '{}'::jsonb,
  attributes jsonb not null default '{}'::jsonb,
  completeness jsonb not null default '{}'::jsonb,
  profile_status text not null default 'DRAFT' check (profile_status in (
    'DRAFT','SUBMITTED','UNDER_REVIEW','PARTIALLY_VERIFIED','VERIFIED',
    'REQUIRES_UPDATE','SUSPENDED','ARCHIVED'
  )),
  is_demo boolean not null default false,
  updated_by text not null default '',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_startup_profiles_startup_idx on public.sih_startup_profiles (startup_id);
create index if not exists sih_startup_profiles_status_idx on public.sih_startup_profiles (profile_status);

-- ────────────────────────────────────────────────────────────────────────
-- 2. Startup certifications / registrations (with expiry tracking)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_startup_certifications (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  name text not null default '',
  issuer text not null default '',
  issued_date date,
  expiry_date date,
  expiry_status text not null default 'UNKNOWN' check (expiry_status in ('VALID','EXPIRING_SOON','EXPIRED','UNKNOWN')),
  evidence_document_id uuid references public.sih_startup_documents(id) on delete set null,
  source text not null default 'USER_PROVIDED',
  verified_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_startup_certs_startup_idx on public.sih_startup_certifications (startup_id);
create index if not exists sih_startup_certs_expiry_idx on public.sih_startup_certifications (expiry_status);

-- ────────────────────────────────────────────────────────────────────────
-- 3. Startup evidence (field-level, document+page references)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_startup_evidence (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  section text not null default '',
  field text not null default '',
  claim text not null default '',
  provenance text not null default 'USER_PROVIDED',
  verification_status text not null default 'REVIEW_REQUIRED' check (verification_status in (
    'VERIFIED','REVIEW_REQUIRED','SELF_DECLARED','NOT_PROVIDED','REJECTED'
  )),
  document_id uuid references public.sih_startup_documents(id) on delete set null,
  page_ref text not null default '',
  confidence numeric check (confidence >= 0 and confidence <= 100),
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_startup_evidence_startup_idx on public.sih_startup_evidence (startup_id);
create index if not exists sih_startup_evidence_section_idx on public.sih_startup_evidence (section);

-- ────────────────────────────────────────────────────────────────────────
-- 4. Field-level profile verification (authority lives here, not profile)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_profile_verifications (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  section text not null default '',
  field text not null default '',
  status text not null default 'REVIEW_REQUIRED' check (status in (
    'VERIFIED','REVIEW_REQUIRED','SELF_DECLARED','NOT_PROVIDED','REJECTED'
  )),
  source text not null default 'USER_PROVIDED',
  confidence numeric check (confidence >= 0 and confidence <= 100),
  note text not null default '',
  evidence_id uuid references public.sih_startup_evidence(id) on delete set null,
  verified_by text not null default '',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (startup_id, section, field)
);

create index if not exists sih_profile_verifications_startup_idx on public.sih_profile_verifications (startup_id);
create index if not exists sih_profile_verifications_status_idx on public.sih_profile_verifications (status);

-- ────────────────────────────────────────────────────────────────────────
-- 5. Risk / contradiction flags (non-rejecting)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_profile_flags (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  type text not null default 'CONTRADICTION',
  severity text not null default 'INFO' check (severity in ('INFO','WARN','CRITICAL')),
  message text not null default '',
  ref text not null default '',
  status text not null default 'OPEN' check (status in ('OPEN','RESOLVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_profile_flags_startup_idx on public.sih_profile_flags (startup_id);
create index if not exists sih_profile_flags_status_idx on public.sih_profile_flags (status);

-- ────────────────────────────────────────────────────────────────────────
-- 6. AI capability extraction suggestions (append-only, human-confirmed)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.sih_profile_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.sih_startups(id) on delete cascade,
  kind text not null default 'CAPABILITY' check (kind in (
    'TECHNOLOGY','CAPABILITY','SECTOR','USE_CASE','DEPLOYMENT_DOMAIN'
  )),
  label text not null default '',
  data jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','REJECTED','EDITED')),
  model text not null default '',
  prompt_version text not null default '',
  mode text not null default 'DETERMINISTIC' check (mode in ('AI','DETERMINISTIC')),
  generated_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sih_profile_ai_suggestions_startup_idx on public.sih_profile_ai_suggestions (startup_id);
create index if not exists sih_profile_ai_suggestions_status_idx on public.sih_profile_ai_suggestions (status);

-- ────────────────────────────────────────────────────────────────────────
-- 7. Extend documents for duplicate detection + expiry tracking
-- ────────────────────────────────────────────────────────────────────────
alter table public.sih_startup_documents add column if not exists doc_hash text not null default '';
alter table public.sih_startup_documents add column if not exists fingerprint text not null default '';
alter table public.sih_startup_documents add column if not exists issue_date date;
alter table public.sih_startup_documents add column if not exists expiry_date date;
alter table public.sih_startup_documents add column if not exists expiry_status text not null default 'UNKNOWN'
  check (expiry_status in ('VALID','EXPIRING_SOON','EXPIRED','UNKNOWN'));

create index if not exists sih_startup_docs_hash_idx on public.sih_startup_documents (doc_hash);
create index if not exists sih_startup_docs_fingerprint_idx on public.sih_startup_documents (fingerprint);
create index if not exists sih_startup_docs_expiry_idx on public.sih_startup_documents (expiry_status);

-- ────────────────────────────────────────────────────────────────────────
-- RLS + grants (identical permissive pattern to sih26136.sql)
-- ────────────────────────────────────────────────────────────────────────
alter table public.sih_startup_profiles enable row level security;
alter table public.sih_startup_certifications enable row level security;
alter table public.sih_startup_evidence enable row level security;
alter table public.sih_profile_verifications enable row level security;
alter table public.sih_profile_flags enable row level security;
alter table public.sih_profile_ai_suggestions enable row level security;

grant all on public.sih_startup_profiles to anon, authenticated;
grant all on public.sih_startup_certifications to anon, authenticated;
grant all on public.sih_startup_evidence to anon, authenticated;
grant all on public.sih_profile_verifications to anon, authenticated;
grant all on public.sih_profile_flags to anon, authenticated;
grant all on public.sih_profile_ai_suggestions to anon, authenticated;

create policy "app access sih_startup_profiles" on public.sih_startup_profiles for all to anon, authenticated using (true) with check (true);
create policy "app access sih_startup_certifications" on public.sih_startup_certifications for all to anon, authenticated using (true) with check (true);
create policy "app access sih_startup_evidence" on public.sih_startup_evidence for all to anon, authenticated using (true) with check (true);
create policy "app access sih_profile_verifications" on public.sih_profile_verifications for all to anon, authenticated using (true) with check (true);
create policy "app access sih_profile_flags" on public.sih_profile_flags for all to anon, authenticated using (true) with check (true);
create policy "app access sih_profile_ai_suggestions" on public.sih_profile_ai_suggestions for all to anon, authenticated using (true) with check (true);
