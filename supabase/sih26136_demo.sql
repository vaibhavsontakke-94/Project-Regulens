-- ═══════════════════════════════════════════════════════════════════════
-- SIH26136 — OPT-IN DEMO / SYNTHETIC seed data
--
-- IMPORTANT: Every row here is FICTIONAL and clearly marked is_demo = true.
-- It exists ONLY to demonstrate the data model. It does NOT represent any
-- real government department, real approval, or real startup, and must
-- never be treated as authoritative.
--
-- This file is ADDITIVE and idempotent (IF NOT EXISTS / ON CONFLICT). It is
-- intentionally NOT part of supabase/sih26136.sql (the production migration)
-- and is NOT auto-applied. Apply it manually only if you want demo records:
--
--     psql "$DATABASE_URL" -f supabase/sih26136_demo.sql
--
-- It requires supabase/sih26136.sql to have been applied first.
-- ═══════════════════════════════════════════════════════════════════════

-- Every demo record uses a FIXED uuid so re-running never duplicates.
-- Demo capabilities reference the seeded vocabulary keys from sih26136.sql.

-- 1. DEMO government organization
insert into public.sih_organizations
  (id, org_type, name, short_name, department_type, ministry, state, department_code,
   description, status, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111101', 'GOVERNMENT',
   'Demo: Maharashtra Health Innovation Cell', 'Demo Health Cell', 'HOSPITAL', 'Health & Family Welfare', 'Maharashtra', 'MH-DEMO-001',
   'SYNTHETIC DEMO organization for SIH26136 demonstration. Not a real department.',
   'ACTIVE', true, 'demo-seed')
on conflict (id) do nothing;

-- 2. DEMO problem (belongs to the demo department)
insert into public.sih_problems
  (id, organization_id, title, problem_statement, current_state, desired_state,
   sector, estimated_budget, timeline_days, status, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111102', '11111111-1111-4111-8111-111111111101',
   'Demo: Reduce patient waiting time in rural healthcare facilities',
   'SYNTHETIC DEMO: Rural primary health centres experience long queues and avoidable delays in outpatient flow.',
   'Average outpatient waiting time of ~45 minutes; manual queue management.',
   'Waiting time below 15 minutes and higher patient throughput.',
   'health', 1000000, 365, 'IN_CHALLENGE', true, 'demo-seed')
on conflict (id) do nothing;

-- 3. DEMO innovation challenge
insert into public.sih_challenges
  (id, problem_id, organization_id, challenge_code, title, description, objective,
   budget_min, budget_max, pilot_duration_days, challenge_status, evaluation_status,
   is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111102', '11111111-1111-4111-8111-111111111101',
   'SIH26136-DEMO-CH-001', 'Demo: AI-assisted patient flow optimization',
   'SYNTHETIC DEMO challenge to pilot AI patient-flow optimization at rural PHCs.',
   'Optimize scheduling and queueing to cut waiting time and raise throughput.',
   500000, 2000000, 90, 'APPLICATIONS_OPEN', 'NOT_STARTED', true, 'demo-seed')
on conflict (id) do nothing;

-- 4. DEMO startup (clearly not a real company)
insert into public.sih_startups
  (id, organization_id, legal_name, brand_name, description, sector, stage,
   dpiit_status, gst_status, startup_status, verification_status, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101',
   'Demo: HealthAI Technologies Pvt Ltd (SYNTHETIC)', 'Demo HealthAI',
   'SYNTHETIC DEMO startup used to demonstrate startup matching and pilot workflows. Not a real company.',
   'health', 'SEED', 'REGISTERED', 'REGISTERED', 'ACTIVE', 'UNVERIFIED', true, 'demo-seed')
on conflict (id) do nothing;

-- 5. DEMO startup capabilities (reference seeded vocabulary by key)
insert into public.sih_startup_capabilities (startup_id, capability_id, level, source)
select s.id, c.id, 'ADVANCED', 'DECLARED'
from public.sih_startups s
join public.sih_capabilities c on c.key in ('ai', 'data-analytics', 'healthtech')
where s.id = '11111111-1111-4111-8111-111111111104'
on conflict (startup_id, capability_id) do nothing;

-- 6. DEMO eligibility rule for the demo challenge
insert into public.sih_eligibility_rules
  (id, challenge_id, name, description, criteria_path, operator, reference_value,
   mandatory, source_mode, weight, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111105', '11111111-1111-4111-8111-111111111103',
   'Demo: Must be a recognized startup', 'SYNTHETIC DEMO rule', 'dpiitStatus', 'EQUAL',
   'REGISTERED', true, 'MANUAL', 100, true, 'demo-seed')
on conflict (id) do nothing;

-- 7. DEMO pilot (90 days) + KPIs for the demo challenge/startup
insert into public.sih_pilot_projects
  (id, challenge_id, startup_id, organization_id, title, objective, location,
   duration_days, budget, start_date, status, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111106', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101',
   'Demo: Patient flow pilot at PHC Pune', 'SYNTHETIC DEMO pilot', 'Pune district',
   90, 200000, now(), 'PLANNED', true, 'demo-seed')
on conflict (id) do nothing;

insert into public.sih_pilot_kpis
  (id, pilot_id, name, description, unit, baseline_value, target_value, measurement_method, frequency, status, is_demo)
values
  ('11111111-1111-4111-8111-111111111107', '11111111-1111-4111-8111-111111111106',
   'Average Waiting Time', 'SYNTHETIC DEMO KPI', 'minutes', 45, 15, 'hospital system log', 'daily', 'TARGET', true),
  ('11111111-1111-4111-8111-111111111108', '11111111-1111-4111-8111-111111111106',
   'Patient Throughput', 'SYNTHETIC DEMO KPI', 'patients/day', 80, 120, 'registration count', 'daily', 'TARGET', true),
  ('11111111-1111-4111-8111-111111111109', '11111111-1111-4111-8111-111111111106',
   'System Uptime', 'SYNTHETIC DEMO KPI', 'percent', 99, 99.5, 'infra monitoring', 'weekly', 'TARGET', true)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────
-- Audit note for the demo seed
-- ────────────────────────────────────────────────────────────────────────
insert into public.sih_audit_events
  (id, actor_uid, actor_role, organization_id, action, entity_type, entity_id, source, is_demo)
values
  ('11111111-1111-4111-8111-111111111110', 'demo-seed', 'ADMIN', '11111111-1111-4111-8111-111111111101',
   'SEED_CREATED', 'GOVERNMENT_ORGANIZATION', '11111111-1111-4111-8111-111111111101', 'demo-sql-seed', true)
on conflict (id) do nothing;
