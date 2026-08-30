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

-- ═══════════════════════════════════════════════════════════════════════
-- INTELLIGENT MATCHING DEMO (requires supabase/sih26136_matching.sql +
-- supabase/sih26136_eligibility.sql + supabase/sih26136_procurement.sql)
--
-- Feeds the matching UI: one demo challenge enriched for ranking, three
-- eligible-ranked demo startups (ELIGIBLE / ELIGIBLE_WITH_REVIEW /
-- CONDITIONAL), one clearly NOT-eligible startup that demonstrates the
-- hard gate exclusion, a versioned matching configuration, an immutable
-- COMPLETED matching run with ranked results + per-dimension breakdown,
-- and a human shortlist with a full decision trail.
-- ═══════════════════════════════════════════════════════════════════════

-- 8. DEMO challenge enrichment (geography + capabilities the matcher ranks on)
update public.sih_challenges
set geography = 'Maharashtra',
    expected_outcomes = '["Hospital staff can resolve registration queries self-service", "Average outpatient waiting time drops below 15 minutes"]'::jsonb,
    technical_capabilities = '["Artificial Intelligence", "HealthTech", "Computer Vision", "Data Analytics", "IoT"]'::jsonb,
    success_metrics = '["Average waiting time", "Patients per hour", "Queue abandonment rate", "Satisfaction score"]'::jsonb
where id = '11111111-1111-4111-8111-111111111103';

-- 9. Additional DEMO startups (all SYNTHETIC; fixed ids, re-runnable)
insert into public.sih_startups
  (id, organization_id, legal_name, brand_name, description, sector, stage,
   dpiit_status, gst_status, startup_status, verification_status, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111101',
   'Demo: HealthGrid Vision Systems Pvt Ltd (SYNTHETIC)', 'Demo HealthGrid',
   'SYNTHETIC DEMO computer-vision startup for patient-flow analytics in hospitals. Not a real company.',
   'health', 'EARLY_GROWTH', 'REGISTERED', 'REGISTERED', 'ACTIVE', 'UNVERIFIED', true, 'demo-seed'),
  ('11111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111101',
   'Demo: RuralCare Connect Pvt Ltd (SYNTHETIC)', 'Demo RuralCare',
   'SYNTHETIC DEMO rural telemedicine / IoT startup for primary health centres. Not a real company.',
   'health', 'SEED', 'REGISTERED', 'REGISTERED', 'ACTIVE', 'UNVERIFIED', true, 'demo-seed'),
  ('11111111-1111-4111-8111-111111111113', '11111111-1111-4111-8111-111111111101',
   'Demo: PendingIoT Devices Pvt Ltd (SYNTHETIC)', 'Demo PendingIoT',
   'SYNTHETIC DEMO IoT startup whose DPIIT recognition is still pending — included to demonstrate the eligibility hard gate. Not a real company.',
   'health', 'SEED', 'PENDING', 'REGISTERED', 'ACTIVE', 'UNVERIFIED', true, 'demo-seed')
on conflict (id) do nothing;

-- 10. DEMO capabilities for the new startups (reference seeded vocabulary)
insert into public.sih_startup_capabilities (startup_id, capability_id, level, source)
select s.id, c.id, 'ADVANCED', 'DECLARED'
from public.sih_startups s
join public.sih_capabilities c on c.key in ('healthtech', 'computer-vision', 'ai')
where s.id = '11111111-1111-4111-8111-111111111111'
on conflict (startup_id, capability_id) do nothing;

insert into public.sih_startup_capabilities (startup_id, capability_id, level, source)
select s.id, c.id, 'BASIC', 'DECLARED'
from public.sih_startups s
join public.sih_capabilities c on c.key in ('healthtech', 'iot', 'public-service')
where s.id = '11111111-1111-4111-8111-111111111112'
on conflict (startup_id, capability_id) do nothing;

insert into public.sih_startup_capabilities (startup_id, capability_id, level, source)
select s.id, c.id, 'BASIC', 'DECLARED'
from public.sih_startups s
join public.sih_capabilities c on c.key in ('iot', 'healthtech')
where s.id = '11111111-1111-4111-8111-111111111113'
on conflict (startup_id, capability_id) do nothing;

-- 11. DEMO startup profiles (structured attributes the matcher reads)
insert into public.sih_startup_profiles
  (id, startup_id, profile_json, attributes, completeness, profile_status, is_demo, updated_by, submitted_at)
values
  ('11111111-1111-4111-8111-111111111114', '11111111-1111-4111-8111-111111111104',
   '{"sections":["identity","startupStatus","business","technology","useCases","deployment","scale"],"currentReadiness":"PRODUCTION"}',
   '{"products":["OPD Queue Optimizer","Patient Flow Command Centre"],"useCases":["Queue management","Outpatient flow optimization","Patient wait-time prediction"],"deploymentDomains":["Public hospital","Rural health centre"],"governmentDeployments":["Pilot: OPD digitization at PHC Pune (2025)"],"state":"Maharashtra","pilotReadiness":{"readiness":"HIGH","existingPilotSites":2,"techSupport":true},"scaleCapacity":{"capacityTier":"REGIONAL","maxDistricts":12}}'::jsonb,
   '{"sections":8,"fields":52,"ratio":0.92,"status":"COMPREHENSIVE"}', 'VERIFIED', true, 'demo-seed', now()),
  ('11111111-1111-4111-8111-111111111115', '11111111-1111-4111-8111-111111111111',
   '{"sections":["identity","startupStatus","business","technology","useCases","deployment","scale"],"currentReadiness":"PRODUCTION"}',
   '{"products":["VisionFlow Bed/Area Occupancy Tracker","VisionCare Camera-based Census"],"useCases":["Crowd density monitoring","Queue congestion detection","Asset occupancy analytics"],"deploymentDomains":["District hospital","Tertiary care hospital"],"governmentDeployments":["Pilot: ICU occupancy analytics at SMH Nashik (2025)"],"state":"Maharashtra","pilotReadiness":{"readiness":"MEDIUM","existingPilotSites":1,"techSupport":true},"scaleCapacity":{"capacityTier":"DISTRICT","maxDistricts":6}}'::jsonb,
   '{"sections":8,"fields":60,"ratio":0.88,"status":"COMPREHENSIVE"}', 'PARTIALLY_VERIFIED', true, 'demo-seed', now()),
  ('11111111-1111-4111-8111-111111111116', '11111111-1111-4111-8111-111111111112',
   '{"sections":["identity","startupStatus","business","technology","useCases","deployment","scale"],"currentReadiness":"PROTOTYPE"}',
   '{"products":["VidaCare Kiosk","Rural e-Consult peripheral"],"useCases":["Remote consultation","Health kiosk deployment","Basic vitals capture"],"deploymentDomains":["Remote PHC"],"governmentDeployments":[],"state":"Madhya Pradesh","pilotReadiness":{"readiness":"LOW","existingPilotSites":0,"techSupport":false},"scaleCapacity":{"capacityTier":"LOCAL","maxDistricts":2}}'::jsonb,
   '{"sections":8,"fields":41,"ratio":0.62,"status":"PARTIAL"}', 'SUBMITTED', true, 'demo-seed', now())
on conflict (id) do nothing;

-- 12. DEMO eligibility rule for deployment evidence + evaluation snapshots
--     (the hard gate: PENDING DPIIT startup is excluded; missing evidence is CONDITIONAL)
insert into public.sih_eligibility_rules
  (id, challenge_id, name, description, rule_type, criteria_path, operator, reference_value,
   mandatory, severity, source_mode, source_category, authority_scope, lifecycle_status,
   evidence_required, weight, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111123', '11111111-1111-4111-8111-111111111103',
   'Demo: Provide deployment evidence', 'SYNTHETIC DEMO rule',
   'DOCUMENT_REQUIRED', '', 'EXISTS',
   '{"docType":"DEPLOYMENT_EVIDENCE"}'::jsonb, true, 'MANDATORY', 'MANUAL', 'CHALLENGE_SPECIFIC', 'CHALLENGE',
   'ACTIVE', true, 100, true, 'demo-seed')
on conflict (id) do nothing;

insert into public.sih_eligibility_snapshots
  (id, challenge_id, startup_id, rule_version, overall_status, summary, results, evaluated_by, evaluated_at, reason)
values
  ('11111111-1111-4111-8111-111111111124', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104',
   1, 'ELIGIBLE',
   '{"verdict":"ELIGIBLE","mandatoryPassed":2,"mandatoryFailed":0,"missingInformation":0,"requiresEvidence":0,"reviewRequired":0,"notApplicable":0,"passed":2,"total":2,"evidenceCoverage":1,"terminatedByHardFail":false}'::jsonb,
   '[
     {"ruleId":"11111111-1111-4111-8111-111111111105","ruleName":"Demo: Must be a recognized startup","ruleType":"ATTRIBUTE_EQUALS","severity":"MANDATORY","mandatory":true,"state":"PASS","passed":true,"reason":"Value matches the rule","recommendedAction":"None","trustLevel":"SOURCE_VERIFIED"},
     {"ruleId":"11111111-1111-4111-8111-111111111123","ruleName":"Demo: Provide deployment evidence","ruleType":"DOCUMENT_REQUIRED","severity":"MANDATORY","mandatory":true,"state":"PASS","passed":true,"reason":"Required document present","recommendedAction":"None","trustLevel":"DOCUMENT_VERIFIED"}
   ]'::jsonb,
   'demo-seed', now(), 'SYNTHETIC DEMO evaluation'),
  ('11111111-1111-4111-8111-111111111125', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111111',
   1, 'ELIGIBLE_WITH_REVIEW',
   '{"verdict":"ELIGIBLE_WITH_REVIEW","mandatoryPassed":1,"mandatoryFailed":0,"missingInformation":0,"requiresEvidence":0,"reviewRequired":1,"notApplicable":0,"passed":1,"total":2,"evidenceCoverage":1,"terminatedByHardFail":false}'::jsonb,
   '[
     {"ruleId":"11111111-1111-4111-8111-111111111105","ruleName":"Demo: Must be a recognized startup","ruleType":"ATTRIBUTE_EQUALS","severity":"MANDATORY","mandatory":true,"state":"PASS","passed":true,"reason":"Value matches the rule","recommendedAction":"None","trustLevel":"SOURCE_VERIFIED"},
     {"ruleId":"11111111-1111-4111-8111-111111111123","ruleName":"Demo: Provide deployment evidence","ruleType":"DOCUMENT_REQUIRED","severity":"MANDATORY","mandatory":true,"state":"REQUIRES_HUMAN_REVIEW","passed":false,"reason":"Document present but not verified","recommendedAction":"Complete verification","evidence":["11111111-1111-4111-8111-111111111150"],"trustLevel":"DOCUMENT_EXTRACTED"}
   ]'::jsonb,
   'demo-seed', now(), 'SYNTHETIC DEMO evaluation'),
  ('11111111-1111-4111-8111-111111111126', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111112',
   1, 'CONDITIONAL',
   '{"verdict":"CONDITIONAL","mandatoryPassed":1,"mandatoryFailed":0,"missingInformation":0,"requiresEvidence":1,"reviewRequired":0,"notApplicable":0,"passed":1,"total":2,"evidenceCoverage":0,"terminatedByHardFail":false}'::jsonb,
   '[
     {"ruleId":"11111111-1111-4111-8111-111111111105","ruleName":"Demo: Must be a recognized startup","ruleType":"ATTRIBUTE_EQUALS","severity":"MANDATORY","mandatory":true,"state":"PASS","passed":true,"reason":"Value matches the rule","recommendedAction":"None","trustLevel":"SOURCE_VERIFIED"},
     {"ruleId":"11111111-1111-4111-8111-111111111123","ruleName":"Demo: Provide deployment evidence","ruleType":"DOCUMENT_REQUIRED","severity":"MANDATORY","mandatory":true,"state":"REQUIRES_EVIDENCE","passed":false,"reason":"Required document not found","recommendedAction":"Upload evidence","trustLevel":"NOT_PROVIDED"}
   ]'::jsonb,
   'demo-seed', now(), 'SYNTHETIC DEMO evaluation'),
  ('11111111-1111-4111-8111-111111111127', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111113',
   1, 'NOT_ELIGIBLE',
   '{"verdict":"NOT_ELIGIBLE","mandatoryPassed":0,"mandatoryFailed":1,"missingInformation":0,"requiresEvidence":0,"reviewRequired":0,"notApplicable":0,"passed":0,"total":2,"evidenceCoverage":0,"terminatedByHardFail":true}'::jsonb,
   '[
     {"ruleId":"11111111-1111-4111-8111-111111111105","ruleName":"Demo: Must be a recognized startup","ruleType":"ATTRIBUTE_EQUALS","severity":"MANDATORY","mandatory":true,"state":"FAIL","passed":false,"reason":"Value does not match the rule","recommendedAction":"Correct the provided value","trustLevel":"SOURCE_VERIFIED"},
     {"ruleId":"11111111-1111-4111-8111-111111111123","ruleName":"Demo: Provide deployment evidence","ruleType":"DOCUMENT_REQUIRED","severity":"MANDATORY","mandatory":true,"state":"REQUIRES_EVIDENCE","passed":false,"reason":"Required document not found","recommendedAction":"Upload evidence","trustLevel":"NOT_PROVIDED"}
   ]'::jsonb,
   'demo-seed', now(), 'SYNTHETIC DEMO evaluation')
on conflict (id) do nothing;

-- 13. DEMO matching configuration (defaults, complete) + version snapshot
insert into public.sih_matching_configurations
  (id, challenge_id, config_version, dimensions, active_dimensions, total_weight, complete, normalized, created_by, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111128', '11111111-1111-4111-8111-111111111103', 1,
   '[
     {"key":"PROBLEM_FIT","weight":25,"label":"Problem Fit","enabled":true},
     {"key":"CAPABILITY_FIT","weight":20,"label":"Capability Fit","enabled":true},
     {"key":"TECHNOLOGY_FIT","weight":15,"label":"Technology Fit","enabled":true},
     {"key":"USE_CASE_FIT","weight":10,"label":"Use Case Fit","enabled":true},
     {"key":"DEPLOYMENT_EXPERIENCE","weight":10,"label":"Deployment Experience","enabled":true},
     {"key":"PILOT_READINESS","weight":10,"label":"Pilot Readiness","enabled":true},
     {"key":"GEOGRAPHIC_FIT","weight":5,"label":"Geographic Fit","enabled":true},
     {"key":"EVIDENCE_STRENGTH","weight":5,"label":"Evidence Strength","enabled":true}
   ]'::jsonb,
   '[
     {"key":"PROBLEM_FIT","weight":25,"label":"Problem Fit","enabled":true},
     {"key":"CAPABILITY_FIT","weight":20,"label":"Capability Fit","enabled":true},
     {"key":"TECHNOLOGY_FIT","weight":15,"label":"Technology Fit","enabled":true},
     {"key":"USE_CASE_FIT","weight":10,"label":"Use Case Fit","enabled":true},
     {"key":"DEPLOYMENT_EXPERIENCE","weight":10,"label":"Deployment Experience","enabled":true},
     {"key":"PILOT_READINESS","weight":10,"label":"Pilot Readiness","enabled":true},
     {"key":"GEOGRAPHIC_FIT","weight":5,"label":"Geographic Fit","enabled":true},
     {"key":"EVIDENCE_STRENGTH","weight":5,"label":"Evidence Strength","enabled":true}
   ]'::jsonb,
   100, true, false, 'demo-seed', now(), now())
on conflict (id) do nothing;

insert into public.sih_matching_configuration_versions
  (id, configuration_id, version, snapshot, created_by, change_reason, created_at)
values
  ('11111111-1111-4111-8111-111111111129', '11111111-1111-4111-8111-111111111128', 1,
   '{"dimensions":[{"key":"PROBLEM_FIT","weight":25,"label":"Problem Fit","enabled":true},{"key":"CAPABILITY_FIT","weight":20,"label":"Capability Fit","enabled":true},{"key":"TECHNOLOGY_FIT","weight":15,"label":"Technology Fit","enabled":true},{"key":"USE_CASE_FIT","weight":10,"label":"Use Case Fit","enabled":true},{"key":"DEPLOYMENT_EXPERIENCE","weight":10,"label":"Deployment Experience","enabled":true},{"key":"PILOT_READINESS","weight":10,"label":"Pilot Readiness","enabled":true},{"key":"GEOGRAPHIC_FIT","weight":5,"label":"Geographic Fit","enabled":true},{"key":"EVIDENCE_STRENGTH","weight":5,"label":"Evidence Strength","enabled":true}],"totalWeight":100,"complete":true,"normalized":false}'::jsonb,
   'demo-seed', 'SYNTHETIC DEMO baseline configuration', now())
on conflict (id) do nothing;

-- 14. DEMO matching run (immutable COMPLETED batch) + ranked results
insert into public.sih_matching_runs
  (id, challenge_id, status, engine_version, config_version, candidate_count, eligible_count,
   retrieved_count, reranked_count, embedding_model, started_at, completed_at, duration_ms,
   trigger_reason, created_by, is_demo, created_at)
values
  ('11111111-1111-4111-8111-111111111130', '11111111-1111-4111-8111-111111111103',
   'COMPLETED', '1.0.0', 1, 4, 1, 3, 3, 'deterministic-token-v1',
   now(), now(), 84, 'SYNTHETIC DEMO run', 'demo-seed', true, now())
on conflict (id) do nothing;

insert into public.sih_matching_results
  (id, run_id, challenge_id, startup_id, rank, eligibility_snapshot_id, eligibility_status, eligibility_pool,
   match_score, match_confidence, dimension_results, strengths, gaps, risk_flags, evidence, explanation,
   startup_profile_version, stale, created_by, created_at)
values
  ('11111111-1111-4111-8111-111111111131', '11111111-1111-4111-8111-111111111130', '11111111-1111-4111-8111-111111111103',
   '11111111-1111-4111-8111-111111111104', 1, '11111111-1111-4111-8111-111111111124', 'ELIGIBLE', 'RANKED',
   0.86, 0.9,
   '[
     {"key":"PROBLEM_FIT","label":"Problem Fit","weight":25,"score":0.9,"state":"MATCHED","note":"Outpatient flow optimization directly targets queue-based waiting-time reduction."},
     {"key":"CAPABILITY_FIT","label":"Capability Fit","weight":20,"score":0.95,"state":"MATCHED","note":"HealthTech + Data Analytics capabilities align with challenge requirements."},
     {"key":"TECHNOLOGY_FIT","label":"Technology Fit","weight":15,"score":0.9,"state":"MATCHED","note":"AI/analytics stack fits the technical capabilities announced for this challenge."},
     {"key":"USE_CASE_FIT","label":"Use Case Fit","weight":10,"score":0.85,"state":"MATCHED","note":"Queue management and wait-time prediction match expected outcomes."},
     {"key":"DEPLOYMENT_EXPERIENCE","label":"Deployment Experience","weight":10,"score":0.8,"state":"MATCHED","note":"Prior government PHC deployment demonstrated in a Maharashtra district hospital."},
     {"key":"PILOT_READINESS","label":"Pilot Readiness","weight":10,"score":0.9,"state":"MATCHED","note":"Two existing pilot sites and on-site technical support."},
     {"key":"GEOGRAPHIC_FIT","label":"Geographic Fit","weight":5,"score":1,"state":"MATCHED","note":"Startup operates in Maharashtra; challenge targets Maharashtra."},
     {"key":"EVIDENCE_STRENGTH","label":"Evidence Strength","weight":5,"score":0.8,"state":"MATCHED","note":"Deployment evidence verified (DOCUMENT_VERIFIED)."}
   ]'::jsonb,
   '[
     {"dimension":"CAPABILITY_FIT","text":"Good Capability Fit."},
     {"dimension":"GEOGRAPHIC_FIT","text":"Startup is based in the target geography (Maharashtra)."},
     {"dimension":"PILOT_READINESS","text":"Ready to pilot, with prior site experience."}
   ]'::jsonb,
   '[
     {"dimension":"EVIDENCE_STRENGTH","text":"Only one deployment-evidence document available."}
   ]'::jsonb,
   '[]'::jsonb,
   '{"summary":{"documents":1,"verifications":1,"evidenceRecords":2},"counts":{"documents":1,"verifications":1,"evidenceRecords":2}}'::jsonb,
   '{"plain":"This synthetic startup best matches the challenge objective of cutting outpatient waiting time: it already optimizes outpatient flow, holds verifiable deployment experience, and operates in Maharashtra.","headline":"Strong overall fit — verified deployment experience in Maharashtra.","dimensionHighlights":["Seed-to-patient flow coverage","Domain-expert scoring"],"confidenceNote":null}'::jsonb,
   '', false, 'demo-seed', now()),
  ('11111111-1111-4111-8111-111111111132', '11111111-1111-4111-8111-111111111130', '11111111-1111-4111-8111-111111111103',
   '11111111-1111-4111-8111-111111111111', 2, '11111111-1111-4111-8111-111111111125', 'ELIGIBLE_WITH_REVIEW', 'RANKED_WITH_WARNING',
   0.74, 0.7,
   '[
     {"key":"PROBLEM_FIT","label":"Problem Fit","weight":25,"score":0.8,"state":"MATCHED","note":"Crowd-density analytics supports congestion-aware patient flow."},
     {"key":"CAPABILITY_FIT","label":"Capability Fit","weight":20,"score":0.85,"state":"MATCHED","note":"HealthTech + Computer Vision capabilities align partly with challenge requirements."},
     {"key":"TECHNOLOGY_FIT","label":"Technology Fit","weight":15,"score":0.9,"state":"MATCHED","note":"Vision stack overlaps the announced technical capabilities."},
     {"key":"USE_CASE_FIT","label":"Use Case Fit","weight":10,"score":0.7,"state":"PARTIAL","note":"Queue congestion detection addresses only part of the expected outcomes."},
     {"key":"DEPLOYMENT_EXPERIENCE","label":"Deployment Experience","weight":10,"score":0.6,"state":"PARTIAL","note":"Single district-hospital deployment; documentation pending verification."},
     {"key":"PILOT_READINESS","label":"Pilot Readiness","weight":10,"score":0.7,"state":"MATCHED","note":"One pilot site; support team available."},
     {"key":"GEOGRAPHIC_FIT","label":"Geographic Fit","weight":5,"score":1,"state":"MATCHED","note":"Startup operates in Maharashtra."},
     {"key":"EVIDENCE_STRENGTH","label":"Evidence Strength","weight":5,"score":0.4,"state":"PARTIAL","note":"Deployment evidence present but not yet verified."}
   ]'::jsonb,
   '[
     {"dimension":"TECHNOLOGY_FIT","text":"Computer-vision direction fits the challenge."},
     {"dimension":"GEOGRAPHIC_FIT","text":"Based in the target geography (Maharashtra)."}
   ]'::jsonb,
   '[
     {"dimension":"EVIDENCE_STRENGTH","text":"Deployment evidence is unverified and needs human review."}
   ]'::jsonb,
   '[
     {"type":"EVIDENCE_VERIFICATION","level":"MEDIUM","text":"Deployment-evidence document is present but pending verification."}
   ]'::jsonb,
   '{"summary":{"documents":1,"verifications":0,"evidenceRecords":1},"counts":{"documents":1,"verifications":0,"evidenceRecords":1}}'::jsonb,
   '{"plain":"This synthetic startup is a strong specialist in vision-based congestion analytics. Its deployment documentation is present but not yet verified, so the match is shown with a human-review warning.","headline":"Strong technology fit, but deployment evidence awaits verification.","dimensionHighlights":["Vision-based congestion detection"],"confidenceNote":null}'::jsonb,
   '', false, 'demo-seed', now()),
  ('11111111-1111-4111-8111-111111111133', '11111111-1111-4111-8111-111111111130', '11111111-1111-4111-8111-111111111103',
   '11111111-1111-4111-8111-111111111112', 3, '11111111-1111-4111-8111-111111111126', 'CONDITIONAL', 'RANKED_CONDITIONAL',
   0.41, 0.5,
   '[
     {"key":"PROBLEM_FIT","label":"Problem Fit","weight":25,"score":0.4,"state":"PARTIAL","note":"Telemedicine kiosks only indirectly address waiting-time reduction."},
     {"key":"CAPABILITY_FIT","label":"Capability Fit","weight":20,"score":0.5,"state":"PARTIAL","note":"HealthTech + IoT overlap partially with challenge requirements."},
     {"key":"TECHNOLOGY_FIT","label":"Technology Fit","weight":15,"score":0.6,"state":"PARTIAL","note":"IoT stack overlaps partly with announced technical capabilities."},
     {"key":"USE_CASE_FIT","label":"Use Case Fit","weight":10,"score":0.3,"state":"MISSING","note":"No direct mapping to the expected outcomes."},
     {"key":"DEPLOYMENT_EXPERIENCE","label":"Deployment Experience","weight":10,"score":0.2,"state":"MISSING","note":"No prior government deployment."},
     {"key":"PILOT_READINESS","label":"Pilot Readiness","weight":10,"score":0.4,"state":"PARTIAL","note":"Prototype-stage; no established pilot sites."},
     {"key":"GEOGRAPHIC_FIT","label":"Geographic Fit","weight":5,"score":0,"state":"MISS","note":"Startup operates in Madhya Pradesh, not the challenge geography (Maharashtra)."},
     {"key":"EVIDENCE_STRENGTH","label":"Evidence Strength","weight":5,"score":0.1,"state":"MISSING","note":"No deployment-evidence document (required for eligibility)."}
   ]'::jsonb,
   '[]'::jsonb,
   '[
     {"dimension":"USE_CASE_FIT","text":"No direct mapping to the expected outcomes."},
     {"dimension":"DEPLOYMENT_EXPERIENCE","text":"No prior government deployment."},
     {"dimension":"GEOGRAPHIC_FIT","text":"Not based in the challenge geography."},
     {"dimension":"EVIDENCE_STRENGTH","text":"Missing required deployment evidence."}
   ]'::jsonb,
   '[
     {"type":"ELIGIBILITY_CONDITIONAL","level":"HIGH","text":"Eligibility is CONDITIONAL — deployment evidence has not been provided."}
   ]'::jsonb,
   '{"summary":{"documents":0,"verifications":0,"evidenceRecords":0},"counts":{"documents":0,"verifications":0,"evidenceRecords":0}}'::jsonb,
   '{"plain":"This synthetic startup offers rural telemedicine but does not yet map to the challenge objective and is missing required deployment evidence. It is ranked conditional, with lower overall fit.","headline":"Conditional: relevant direction but missing evidence and geographic fit.","dimensionHighlights":[],"confidenceNote":null}'::jsonb,
   '', false, 'demo-seed', now())
on conflict (id) do nothing;

-- per-dimension breakdown rows (what the explanation UI renders)
insert into public.sih_matching_dimension_results
  (id, matching_result_id, key, score, weight, state, note, rows_json)
values
  ('11111111-1111-4111-8111-111111111141', '11111111-1111-4111-8111-111111111131', 'PROBLEM_FIT', 0.9, 25, 'MATCHED', 'Outpatient flow optimization directly targets queue-based waiting-time reduction.', null),
  ('11111111-1111-4111-8111-111111111142', '11111111-1111-4111-8111-111111111131', 'CAPABILITY_FIT', 0.95, 20, 'MATCHED', 'HealthTech + Data Analytics capabilities align with challenge requirements.', null),
  ('11111111-1111-4111-8111-111111111143', '11111111-1111-4111-8111-111111111131', 'TECHNOLOGY_FIT', 0.9, 15, 'MATCHED', 'AI/analytics stack fits the technical capabilities announced for this challenge.', null),
  ('11111111-1111-4111-8111-111111111144', '11111111-1111-4111-8111-111111111131', 'USE_CASE_FIT', 0.85, 10, 'MATCHED', 'Queue management and wait-time prediction match expected outcomes.', null),
  ('11111111-1111-4111-8111-111111111145', '11111111-1111-4111-8111-111111111131', 'DEPLOYMENT_EXPERIENCE', 0.8, 10, 'MATCHED', 'Prior PHC deployment in Maharashtra.', null),
  ('11111111-1111-4111-8111-111111111146', '11111111-1111-4111-8111-111111111131', 'PILOT_READINESS', 0.9, 10, 'MATCHED', 'Two existing pilot sites and on-site technical support.', null),
  ('11111111-1111-4111-8111-111111111147', '11111111-1111-4111-8111-111111111131', 'GEOGRAPHIC_FIT', 1, 5, 'MATCHED', 'Startup operates in Maharashtra.', null),
  ('11111111-1111-4111-8111-111111111148', '11111111-1111-4111-8111-111111111131', 'EVIDENCE_STRENGTH', 0.8, 5, 'MATCHED', 'Deployment evidence verified (DOCUMENT_VERIFIED).', null)
on conflict (id) do nothing;

-- 15. DEMO human shortlist + decision trail (separate from AI ranking)
insert into public.sih_shortlists
  (id, challenge_id, matching_result_id, startup_id, manual_rank, note, added_by, removed, created_at)
values
  ('11111111-1111-4111-8111-111111111135', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111131', '11111111-1111-4111-8111-111111111104', 1, 'SYNTHETIC DEMO shortlist — top ranked startup.', 'demo-seed', false, now()),
  ('11111111-1111-4111-8111-111111111136', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111132', '11111111-1111-4111-8111-111111111111', 2, 'SYNTHETIC DEMO shortlist — verify deployment documentation during review.', 'demo-seed', false, now())
on conflict (id) do nothing;

insert into public.sih_human_matching_actions
  (id, challenge_id, matching_result_id, startup_id, action, original_rank, new_rank, reason, actor_id, created_at)
values
  ('11111111-1111-4111-8111-111111111137', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111131', '11111111-1111-4111-8111-111111111104',
   'SHORTLISTED', 1, 1, 'SYNTHETIC DEMO decision trail entry.', 'demo-seed', now())
on conflict (id) do nothing;

-- 16. Additional audit entries for the matching demo
insert into public.sih_audit_events
  (id, actor_uid, actor_role, organization_id, action, entity_type, entity_id, source, is_demo)
values
  ('11111111-1111-4111-8111-111111111138', 'demo-seed', 'ADMIN', '11111111-1111-4111-8111-111111111101',
   'MATCHING_RUN_COMPLETED', 'MATCHING_RUN', '11111111-1111-4111-8111-111111111130', 'demo-sql-seed', true),
  ('11111111-1111-4111-8111-111111111139', 'demo-seed', 'ADMIN', '11111111-1111-4111-8111-111111111101',
   'MATCHING_SHORTLISTED', 'MATCHING_RESULT', '11111111-1111-4111-8111-111111111131', 'demo-sql-seed', true)
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════
-- EVALUATION & SHORTLIST INTELLIGENCE DEMO
-- (requires supabase/sih26136_evaluation.sql to have been applied)
--
-- The demo Health Cell runs a challenge-scoped evaluation template that
-- owner-evaluators score independently. MedFlow (…104) is fully evaluated
-- end-to-end (config → assign → score → submit → snapshot → aggregate →
-- decision → pilot handoff). HealthGrid (…111) is assigned and partially
-- scored to show an in-progress state. All rows are SYNTHETIC.
-- ═══════════════════════════════════════════════════════════════════

-- 17. Bring the demo challenge into the evaluation stage
update public.sih_challenges
set evaluation_status = 'IN_PROGRESS', updated_at = now()
where id = '11111111-1111-4111-8111-111111111103';

-- 17a. DEMO evaluation template + configured criteria (challenge-scoped)
insert into public.sih_evaluation_templates
  (id, organization_id, name, description, is_default, created_by)
values
  ('11111111-1111-4111-8111-111111111149', '11111111-1111-4111-8111-111111111101',
   'Demo: Patient Flow Evaluation', 'SYNTHETIC DEMO template for the AI-assisted patient flow challenge.', false, 'demo-seed')
on conflict (id) do nothing;

insert into public.sih_evaluation_criteria
  (id, template_id, key, label, description, weight, active,
   category, max_score, minimum_score, mandatory, evidence_required,
   evaluation_guidance, source_reference, criterion_status, version)
values
  ('11111111-1111-4111-8111-111111111150', '11111111-1111-4111-8111-111111111149', 'impact', 'Impact on patient flow',
   'Expected reduction in outpatient waiting time and queue congestion.', 50, true,
   'IMPACT', 100, 60, true, true,
   'Quantify the expected waiting-time reduction; cite deployment evidence where available.', '', 'ACTIVE', 1),
  ('11111111-1111-4111-8111-111111111151', '11111111-1111-4111-8111-111111111149', 'innovation', 'Innovation & feasibility',
   'Depth of the proposed technical approach and its feasibility in a PHC setting.', 30, true,
   'INNOVATION', 100, null, false, false,
   'Assess technical substance, differentiation, and operational feasibility.', '', 'ACTIVE', 1),
  ('11111111-1111-4111-8111-111111111152', '11111111-1111-4111-8111-111111111149', 'ops', 'Operational readiness',
   'Team, pilot sites, support model, and readiness to run a 90-day pilot.', 20, true,
   'OPERATIONS', 100, 50, false, false,
   'Evaluate pilot readiness and on-site support capacity.', '', 'ACTIVE', 1)
on conflict (id) do nothing;

-- 17b. DEMO configuration + immutable configuration snapshot (version 1)
insert into public.sih_evaluation_configurations
  (id, challenge_id, template_id, aggregation_method, evaluator_weighting_enabled,
   low_comment_threshold, high_comment_threshold, advance_threshold, advance_with_review_threshold,
   review_threshold, do_not_advance_threshold, engine_version, status, is_demo, created_by)
values
  ('11111111-1111-4111-8111-111111111153', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111149',
   'MEAN', false, 40, 90, 80, 70, 60, 50, '1.0.0', 'ACTIVE', true, 'demo-seed')
on conflict (id) do nothing;

insert into public.sih_evaluation_configuration_versions
  (id, configuration_id, version, snapshot, created_by, change_reason)
values
  ('11111111-1111-4111-8111-111111111154', '11111111-1111-4111-8111-111111111153', 1,
   '{"aggregationMethod":"MEAN","evaluatorWeightingEnabled":false,"lowCommentThreshold":40,"highCommentThreshold":90,"advanceThreshold":80,"advanceWithReviewThreshold":70,"reviewThreshold":60,"doNotAdvanceThreshold":50,"engineVersion":"1.0.0","criteria":[{"key":"impact","label":"Impact on patient flow","weight":50,"mandatory":true,"minimumScore":60},{"key":"innovation","label":"Innovation & feasibility","weight":30},{"key":"ops","label":"Operational readiness","weight":20,"minimumScore":50}]}'::jsonb,
   'demo-seed', 'Initial demo configuration') 
on conflict (id) do nothing;

-- 17c. DEMO independent evaluator workspaces (owner-evaluators)
insert into public.sih_organization_members
  (id, organization_id, user_id, role, status)
values
  ('11111111-1111-4111-8111-111111111182', '11111111-1111-4111-8111-111111111101', 'eval-demo-1', 'EVALUATOR', 'ACTIVE'),
  ('11111111-1111-4111-8111-111111111183', '11111111-1111-4111-8111-111111111101', 'eval-demo-2', 'EVALUATOR', 'ACTIVE')
on conflict (id) do nothing;

insert into public.sih_evaluations
  (id, challenge_id, startup_id, template_id, organization_id, evaluator_uid, status, summary, is_demo)
values
  ('11111111-1111-4111-8111-111111111155', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111149', '11111111-1111-4111-8111-111111111101', 'eval-demo-1', 'SUBMITTED',
   '{"total":72,"rows":[{"key":"impact","score":85,"weighted":42.5},{"key":"innovation","score":90,"weighted":27},{"key":"ops","score":70,"weighted":14}],"scoredCount":3,"missingCount":0,"mandatory":{"passed":true,"failed":false},"complete":true,"commentsRequired":[]}'::jsonb, true),
  ('11111111-1111-4111-8111-111111111156', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111149', '11111111-1111-4111-8111-111111111101', 'eval-demo-2', 'SUBMITTED',
   '{"total":62,"rows":[{"key":"impact","score":75,"weighted":37.5},{"key":"innovation","score":50,"weighted":15},{"key":"ops","score":70,"weighted":14}],"scoredCount":3,"missingCount":0,"mandatory":{"passed":true,"failed":false},"complete":true,"commentsRequired":[]}'::jsonb, true),
  ('11111111-1111-4111-8111-111111111157', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111149', '11111111-1111-4111-8111-111111111101', 'eval-demo-1', 'IN_PROGRESS',
   '{"total":0,"rows":[{"key":"impact","score":60,"weighted":30}],"scoredCount":1,"missingCount":2,"mandatory":{"passed":true,"failed":false},"complete":false,"commentsRequired":[]}'::jsonb, true)
on conflict (id) do nothing;

insert into public.sih_evaluator_assignments
  (id, challenge_id, startup_id, organization_id, evaluation_id, evaluator_uid, criteria_keys, status, assigned_by)
values
  ('11111111-1111-4111-8111-111111111158', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101', '11111111-1111-4111-8111-111111111155', 'eval-demo-1',
   '["impact","innovation","ops"]'::jsonb, 'SUBMITTED', 'demo-seed'),
  ('11111111-1111-4111-8111-111111111159', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101', '11111111-1111-4111-8111-111111111156', 'eval-demo-2',
   '["impact","innovation","ops"]'::jsonb, 'SUBMITTED', 'demo-seed'),
  ('11111111-1111-4111-8111-111111111160', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111101', '11111111-1111-4111-8111-111111111157', 'eval-demo-1',
   '["impact","innovation","ops"]'::jsonb, 'IN_PROGRESS', 'demo-seed')
on conflict (id) do nothing;

insert into public.sih_evaluation_scores
  (id, evaluation_id, criterion_key, score, evidence_reference, notes)
values
  ('11111111-1111-4111-8111-111111111161', '11111111-1111-4111-8111-111111111155', 'impact', 85, 'medflow-deployment-evidence', 'Strong queue-management results cited from the Maharashtra PHC deployment.'),
  ('11111111-1111-4111-8111-111111111162', '11111111-1111-4111-8111-111111111155', 'innovation', 90, '', 'Differentiated AI scheduling layer, feasible at PHC scale.'),
  ('11111111-1111-4111-8111-111111111163', '11111111-1111-4111-8111-111111111155', 'ops', 70, '', 'Two pilot sites and on-site support confirmed.'),
  ('11111111-1111-4111-8111-111111111164', '11111111-1111-4111-8111-111111111156', 'impact', 75, '', 'Good expected reduction, but hard metrics are thinner.'),
  ('11111111-1111-4111-8111-111111111165', '11111111-1111-4111-8111-111111111156', 'innovation', 50, '', 'Solid but more incremental than the peer assessment implies.'),
  ('11111111-1111-4111-8111-111111111166', '11111111-1111-4111-8111-111111111156', 'ops', 70, '', 'Operational readiness looks consistent.'),
  ('11111111-1111-4111-8111-111111111167', '11111111-1111-4111-8111-111111111157', 'impact', 60, '', 'Impact is plausible but unverified; innovation and ops pending.')
on conflict (id) do nothing;

insert into public.sih_evaluation_comments
  (id, evaluation_id, criterion_key, kind, comment, required, reason, actor_uid, actor_role)
values
  ('11111111-1111-4111-8111-111111111168', '11111111-1111-4111-8111-111111111155', 'innovation', 'REASON',
   'Scores above the high threshold require an explanation.', true, 'HIGH_SCORE', 'eval-demo-1', 'EVALUATOR'),
  ('11111111-1111-4111-8111-111111111169', '11111111-1111-4111-8111-111111111155', 'impact', 'EVALUATOR_NOTE',
   'Verify the beneficiary-flow numbers against the submitted deployment document.', false, '', 'eval-demo-1', 'EVALUATOR'),
  ('11111111-1111-4111-8111-111111111170', '11111111-1111-4111-8111-111111111156', 'innovation', 'REASON',
   'The two capabilities view of innovation diverges sharply; reconcile during aggregation review.', false, '', 'eval-demo-2', 'EVALUATOR'),
  ('11111111-1111-4111-8111-111111111171', '11111111-1111-4111-8111-111111111157', 'impact', 'CRITICAL',
   'Evidence document pending verification before this score can be relied on.', false, '', 'eval-demo-1', 'EVALUATOR')
on conflict (id) do nothing;

-- 17d. DEMO submission snapshots (immutable evidence of what was evaluated)
insert into public.sih_evaluation_snapshots
  (id, challenge_id, startup_id, organization_id, evaluation_id, snapshot_type, snapshot, created_by)
values
  ('11111111-1111-4111-8111-111111111172', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101', '11111111-1111-4111-8111-111111111155', 'SUBMISSION',
   '{"evaluatorUid":"eval-demo-1","status":"SUBMITTED","total":72,"rows":[{"key":"impact","score":85,"weighted":42.5},{"key":"innovation","score":90,"weighted":27},{"key":"ops","score":70,"weighted":14}],"comments":[{"criterionKey":"innovation","kind":"REASON","reason":"HIGH_SCORE"}]}'::jsonb, 'demo-seed'),
  ('11111111-1111-4111-8111-111111111173', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101', '11111111-1111-4111-8111-111111111156', 'SUBMISSION',
   '{"evaluatorUid":"eval-demo-2","status":"SUBMITTED","total":62,"rows":[{"key":"impact","score":75,"weighted":37.5},{"key":"innovation","score":50,"weighted":15},{"key":"ops","score":70,"weighted":14}],"comments":[]}'::jsonb, 'demo-seed')
on conflict (id) do nothing;

-- 17e. DEMO deterministic aggregation + variance flags (MedFlow)
insert into public.sih_evaluation_aggregations
  (id, challenge_id, startup_id, organization_id, configuration_id, configuration_version, engine_version,
   aggregation_method, total, criteria, evidence_coverage, confidence, participation_count, mandatory_failed, result, critical_items, created_by)
values
  ('11111111-1111-4111-8111-111111111174', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101',
   '11111111-1111-4111-8111-111111111153', 1, '1.0.0', 'MEAN', 75.00,
   '[{"key":"impact","label":"Impact on patient flow","category":"IMPACT","weight":50,"maxScore":100,"minimumScore":60,"mandatory":true,"evidenceRequired":true,"values":[85,75],"stat":80,"chosenStat":"MEAN","scoreMean":80,"variance":{"values":[85,75],"highVariance":false,"spread":10,"coefficient":0.09,"mean":80},"outliers":[],"state":"CONSISTENT","weighted":40},{"key":"innovation","label":"Innovation & feasibility","category":"INNOVATION","weight":30,"maxScore":100,"mandatory":false,"evidenceRequired":false,"values":[90,50],"stat":70,"chosenStat":"MEAN","scoreMean":70,"variance":{"values":[90,50],"highVariance":true,"spread":40,"coefficient":0.4,"mean":70,"reason":"High evaluator variance on Innovation & feasibility (spread 40, CV 40%)."},"outliers":[],"state":"VARIANT","weighted":21},{"key":"ops","label":"Operational readiness","category":"OPERATIONS","weight":20,"maxScore":100,"minimumScore":50,"mandatory":false,"evidenceRequired":false,"values":[70,70],"stat":70,"chosenStat":"MEAN","scoreMean":70,"variance":{"values":[70,70],"highVariance":false,"spread":0,"coefficient":0,"mean":70},"outliers":[],"state":"CONSISTENT","weighted":14}]'::jsonb,
   80.00, 0.72, 2, false, 'ADVANCE_WITH_REVIEW',
   '[{"type":"HIGH_EVALUATOR_VARIANCE","level":"MEDIUM","criterionKey":"innovation","text":"High evaluator variance on Innovation & feasibility (spread 40)."}]'::jsonb,
   'demo-seed')
on conflict (id) do nothing;

insert into public.sih_evaluation_variance_flags
  (id, aggregation_id, challenge_id, startup_id, criterion_key, kind, detail, resolved, created_by)
values
  ('11111111-1111-4111-8111-111111111176', '11111111-1111-4111-8111-111111111174', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104',
   'innovation', 'HIGH_VARIANCE', 'Evaluator spread on innovation is 40 (CV 40%); no outlier exceeds the 1.5xIQR fence.', false, 'demo-seed')
on conflict (id) do nothing;

-- 17f. DEMO audited human decision + structured pilot handoff (MedFlow)
insert into public.sih_evaluation_decisions
  (id, challenge_id, startup_id, organization_id, decision, reason, decision_stage, conditions, warnings,
   evaluation_snapshot_id, aggregation_id, actor_uid, actor_role, is_demo)
values
  ('11111111-1111-4111-8111-111111111177', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101',
   'PROCEED_TO_PILOT', 'SYNTHETIC DEMO decision: aggregate 75 with mandatory impact above minimum; proceed on condition the innovation variance is reconciled during the pilot kickoff.', 'EVALUATION',
   '[{"text":"Reconcile the innovation criterion variance (80 vs 50) at pilot kickoff."},{"text":"Share verified deployment evidence with the pilot evaluation team."}]'::jsonb,
   '[{"type":"HIGH_EVALUATOR_VARIANCE","text":"Innovation criterion has high evaluator variance."}]'::jsonb,
   '11111111-1111-4111-8111-111111111172', '11111111-1111-4111-8111-111111111174', 'demo-seed', 'ADMIN', true)
on conflict (id) do nothing;

insert into public.sih_pilot_handoffs
  (id, decision_id, challenge_id, startup_id, organization_id, evaluation_snapshot_id,
   selected_criteria, identified_gaps, risk_flags, pilot_readiness, expected_kpis, required_evidence, conditions, status, issued_by, issued_at, is_demo)
values
  ('11111111-1111-4111-8111-111111111178', '11111111-1111-4111-8111-111111111177', '11111111-1111-4111-8111-111111111103', '11111111-1111-4111-8111-111111111104', '11111111-1111-4111-8111-111111111101',
   '11111111-1111-4111-8111-111111111172',
   '[{"key":"impact","label":"Impact on patient flow","mandatory":true},{"key":"ops","label":"Operational readiness"}]'::jsonb,
   '[{"key":"innovation","text":"Reconcile evaluator variance before the pilot kickoff."}]'::jsonb,
   '[{"type":"HIGH_EVALUATOR_VARIANCE","level":"MEDIUM","text":"Innovation spread 40 requires reconciliation."}]'::jsonb,
   '{"ready":true,"sites":2,"support":"on-site","durationDays":90}'::jsonb,
   '[{"key":"waitTime","name":"Average Waiting Time","unit":"minutes","baseline":45,"target":15},{"key":"throughput","name":"Patient Throughput","unit":"patients/day","baseline":80,"target":120}]'::jsonb,
   '[{"kind":"DOCUMENT","note":"Verified deployment evidence for impact claims."}]'::jsonb,
   '[{"text":"Reconcile innovation variance at kickoff."}]'::jsonb,
   'ISSUED', 'demo-seed', now(), true)
on conflict (id) do nothing;

-- 17g. Audit trail for the evaluation lifecycle
insert into public.sih_audit_events
  (id, actor_uid, actor_role, organization_id, action, entity_type, entity_id, source, is_demo)
values
  ('11111111-1111-4111-8111-111111111179', 'demo-seed', 'ADMIN', '11111111-1111-4111-8111-111111111101',
   'EVALUATION_CONFIGURED', 'EVALUATION_CONFIGURATION', '11111111-1111-4111-8111-111111111153', 'demo-sql-seed', true),
  ('11111111-1111-4111-8111-111111111180', 'demo-seed', 'ADMIN', '11111111-1111-4111-8111-111111111101',
   'EVALUATION_AGGREGATED', 'EVALUATION_AGGREGATION', '11111111-1111-4111-8111-111111111174', 'demo-sql-seed', true),
  ('11111111-1111-4111-8111-111111111181', 'demo-seed', 'ADMIN', '11111111-1111-4111-8111-111111111101',
   'EVALUATION_DECISION_MADE', 'EVALUATION_DECISION', '11111111-1111-4111-8111-111111111177', 'demo-sql-seed', true)
on conflict (id) do nothing;
