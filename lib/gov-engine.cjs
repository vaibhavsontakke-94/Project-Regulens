"use strict";

/* ════════════════════════════════════════════════════════════════════
   ReguLens GOVERNMENT INTELLIGENCE ENGINE (deterministic)
   ──────────────────────────────────────────────────────────────────
   One canonical builder — buildGovernmentPackage(context) — produces a
   single payload consumed by ALL ten government modules so every page
   shows consistent numbers. All scoring is deterministic (seeded by
   ids + context) and every modelled number carries an assumption trace.

   Reuses lib/regulens-core.cjs for readiness, action-plan enrichment,
   timeline computation and source collection so the Government module
   shares exactly the same canonical engines as the rest of the app.
   ════════════════════════════════════════════════════════════════════ */

const Core = require("./regulens-core.cjs");
const { GOV_COUNTRIES, INDUSTRIES, POLICY_DB, CONSULTATION_DB } = require("./gov-policy-db.cjs");

const GOV_VERSION = "1.0.0";

/* ── deterministic helpers ─────────────────────────────────────────── */
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function jitter(seed) { return ((hashSeed(seed) % 2000) / 1000) - 1; } // -1..1
function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
function round100(n) { return Math.round(n / 100) * 100; }

/* ── impact dimensions ─────────────────────────────────────────────── */
const DIMENSIONS = [
  { key: "legal", label: "Legal & Regulatory", weight: 1.0 },
  { key: "operational", label: "Operational", weight: 0.85 },
  { key: "financial", label: "Financial", weight: 0.8 },
  { key: "technical", label: "Technical", weight: 0.75 },
  { key: "market", label: "Market Access", weight: 0.7 },
  { key: "reputation", label: "Reputational", weight: 0.65 },
];

/* industry adjacency — policies tagged for one industry still touch neighbours */
const ADJACENCY = {
  fintech: ["banking-financial", "insurance", "ecommerce"],
  "banking-financial": ["fintech", "insurance"],
  healthcare: ["healthtech", "pharmaceuticals"],
  healthtech: ["healthcare", "pharmaceuticals", "saas"],
  edtech: ["saas", "ecommerce"],
  ecommerce: ["retail", "fintech", "logistics"],
  saas: ["ai-ml", "edtech"],
  "ai-ml": ["saas", "telecommunications"],
  manufacturing: ["automotive", "energy", "logistics"],
  retail: ["ecommerce", "food-beverage"],
  "food-beverage": ["retail", "manufacturing"],
  logistics: ["manufacturing", "automotive", "ecommerce"],
  energy: ["manufacturing", "telecommunications"],
  automotive: ["manufacturing", "logistics"],
  telecommunications: ["ai-ml", "energy"],
  insurance: ["banking-financial", "fintech"],
  pharmaceuticals: ["healthcare", "healthtech"],
  "travel-tourism": ["retail", "ecommerce"],
};

function relevanceFactor(policy, industryId) {
  if (!industryId) return 0.75;
  if ((policy.industries || []).includes("all")) return 0.75;
  if ((policy.industries || []).includes(industryId)) return 1;
  if ((ADJACENCY[industryId] || []).some((a) => (policy.industries || []).includes(a))) return 0.55;
  return 0.3;
}

function contextFactor(ctx) {
  if (!ctx.originId || ctx.originId === ctx.targetId) return 0.92;
  const o = GOV_COUNTRIES[ctx.originId], t = GOV_COUNTRIES[ctx.targetId];
  if (!o || !t) return 1.05;
  return o.region === t.region ? 1.02 : 1.12;
}

/* ── policy selection ──────────────────────────────────────────────── */
function policiesForCountry(countryId) {
  return POLICY_DB.filter((p) => Array.isArray(p.countries) && p.countries.includes(countryId));
}
function relevantPolicies(countryId, industryId) {
  return policiesForCountry(countryId).filter((p) => relevanceFactor(p, industryId) > 0.3);
}
function policyById(id) { return POLICY_DB.find((p) => p.id === id) || null; }

/* ── impact analysis per policy ────────────────────────────────────── */
function impactLevel(score) {
  if (score >= 78) return "Critical";
  if (score >= 58) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}
function analyzePolicy(policy, ctx) {
  const fit = relevanceFactor(policy, ctx.industryId);
  const cross = contextFactor(ctx);
  const dims = DIMENSIONS.map((d) => {
    const score = clamp(
      Math.round(policy.baseRisk * d.weight * fit * cross * (1 + 0.06 * jitter(policy.id + ctx.targetId + d.key))),
      5, 97
    );
    return { key: d.key, label: d.label, score };
  });
  const wsum = DIMENSIONS.reduce((s, d) => s + d.weight, 0);
  const overall = Math.round(dims.reduce((s, x, i) => s + x.score * DIMENSIONS[i].weight, 0) / wsum);
  return {
    policyId: policy.id,
    title: policy.title,
    code: policy.code,
    authority: policy.authority,
    policyType: policy.policyType,
    status: policy.status,
    jurisdiction: policy.enactedIn,
    publicationDate: policy.publicationDate,
    effectiveDate: policy.effectiveDate,
    lastUpdated: policy.lastUpdated,
    summary: policy.summary,
    relevance: Math.round(fit * 100),
    overall,
    impactLevel: impactLevel(overall),
    dimensions: dims,
    obligationsCount: (policy.obligations || []).length,
    source: policy.source,
    consultation: policy.consultation || null,
    trace: `score = baseRisk(${policy.baseRisk}) × dimensionWeight × relevance(${fit.toFixed(2)}) × crossBorder(${cross.toFixed(2)}) ± seededJitter`,
  };
}

/* ── stakeholder mapping ───────────────────────────────────────────── */
const STAKEHOLDER_TAXONOMY = [
  { group: "Businesses & Industry", types: null, who: (c, p) => `${c.industryName} companies operating in ${c.targetName}` },
  { group: "Consumers & Citizens", types: ["Data Privacy & Security", "Consumer Protection", "Platform Regulation", "Healthcare Compliance"], who: () => "End users whose data and rights are directly regulated" },
  { group: "Regulators & Supervisors", types: null, who: (c, p) => p.authority },
  { group: "Financial Institutions", types: ["Financial Services & Payments", "AML / CTF", "Banking & Prudential", "Securities & Investment", "Open Finance & Interoperability"], who: () => "Banks, PSPs, e-money and payment institutions" },
  { group: "Technology Providers", types: ["Cybersecurity & Operational Resilience", "AI Governance", "Product Cybersecurity", "Digital Identity & Trust Services"], who: () => "Cloud, software and AI vendors in the delivery chain" },
  { group: "Public Sector Bodies", types: ["Telecommunications & Platforms", "Data Governance"], who: () => "Agencies interacting with or procuring the regulated service" },
  { group: "Investors & Capital Markets", types: ["Securities & Investment"], who: () => "Shareholders and funds exposed to compliance liabilities" },
];
function stakeholdersFor(policies, ctx) {
  const rows = [];
  for (const p of policies) {
    const a = analyzePolicy(p, ctx);
    for (const t of STAKEHOLDER_TAXONOMY) {
      const hit = t.types === null || t.types.includes(p.policyType);
      if (!hit) continue;
      rows.push({
        group: t.group,
        policy: p.title,
        who: t.who({ ...ctx }, p),
        whyAffected: obligationFocus(p),
        impact: a.overall,
        impactLevel: a.impactLevel,
      });
    }
  }
  /* aggregate per group for the Who-Is-Affected view */
  const byGroup = {};
  for (const r of rows) {
    (byGroup[r.group] = byGroup[r.group] || { group: r.group, maxImpact: 0, policies: [], concerns: [] });
    byGroup[r.group].maxImpact = Math.max(byGroup[r.group].maxImpact, r.impact);
    if (!byGroup[r.group].policies.includes(r.policy)) byGroup[r.group].policies.push(r.policy);
    if (byGroup[r.group].concerns.length < 4 && r.whyAffected && !byGroup[r.group].concerns.includes(r.whyAffected)) byGroup[r.group].concerns.push(r.whyAffected);
  }
  return {
    detail: rows.slice(0, 60),
    groups: Object.values(byGroup)
      .map((g) => ({ ...g, impactLevel: impactLevel(g.maxImpact) }))
      .sort((a, b) => b.maxImpact - a.maxImpact),
  };
}
function obligationFocus(p) {
  return (p.obligations && p.obligations[0]) || p.summary.split(".")[0];
}

/* ── outcomes (What Could Happen) ──────────────────────────────────── */
function outcomesFor(policies, ctx) {
  const top = policies
    .map((p) => ({ p, a: analyzePolicy(p, ctx) }))
    .sort((x, y) => y.a.overall - x.a.overall)
    .slice(0, 6);
  const mk = (horizon, p, a, idx) => ({
    horizon,
    policy: p.title,
    title: OUTCOME_TITLES[horizon][idx % OUTCOME_TITLES[horizon].length](ctx, p),
    description: OUTCOME_DESCS[horizon][idx % OUTCOME_DESCS[horizon].length](ctx, p, a),
    probability: clamp(Math.round(a.overall * 0.85 + 8 + jitter(p.id + horizon) * 6), 15, 95),
    severity: impactLevel(clamp(a.overall + (horizon === "longTerm" ? 6 : -4), 5, 97)),
    trace: "probability = overallImpact × 0.85 + 8 ± seededJitter",
  });
  return {
    shortTerm: top.map((t, i) => mk("shortTerm", t.p, t.a, i)),
    midTerm: top.map((t, i) => mk("midTerm", t.p, t.a, i + 1)),
    longTerm: top.map((t, i) => mk("longTerm", t.p, t.a, i + 2)),
  };
}
const OUTCOME_TITLES = {
  shortTerm: [
    (c, p) => `Immediate compliance gap exposure under ${p.code}`,
    (c, p) => `${c.company} must inventory ${p.policyType.toLowerCase()} obligations before market entry`,
    (c, p) => `${p.authority} scrutiny begins at first customer interaction`,
  ],
  midTerm: [
    (c, p) => `Licensing/registration pathway determines launch timeline`,
    (c, p) => `Operating costs restructure around ${p.title} controls`,
    (c, p) => `Vendor and data-flow contracts renegotiated for ${p.code}`,
  ],
  longTerm: [
    (c, p) => `${p.title} becomes a durable moat or a scaling ceiling`,
    (c, p) => `Enforcement trends compound across ${c.targetName}'s regime`,
    (c, p) => `Product roadmap adapts to regulated-feature constraints`,
  ],
};
const OUTCOME_DESCS = {
  shortTerm: [
    (c, p, a) => `Entering ${c.targetName} without meeting ${p.title} exposes ${c.company} to supervisory action from day one. Impact profile: ${a.overall}/100.`,
    (c, p, a) => `${c.product} touches ${p.policyType.toLowerCase()} obligations immediately upon offering services to ${c.targetName} customers.`,
    (c, p, a) => `First transactions create supervisory visibility; ${p.authority} can request evidence of controls early.`,
  ],
  midTerm: [
    (c, p, a) => `${p.authority} approval steps gate scale-up. Modelled effort concentrates in licensing, documentation and audits.`,
    (c, p, a) => `Recurring compliance operations (monitoring, reporting, audits) become a permanent cost line driven by ${p.code}.`,
    (c, p, a) => `Third-party contracts must embed ${p.title} clauses (audit rights, breach notice, exit plans).`,
  ],
  longTerm: [
    (c, p, a) => `Early, provable compliance with ${p.title} compounds into trust advantages versus slower entrants.`,
    (c, p, a) => `${c.targetName}'s regulatory trajectory suggests tightening; architecture chosen today should absorb stricter rules.`,
    (c, p, a) => `Feature velocity depends on how cleanly ${c.product} separates regulated processing from innovation surfaces.`,
  ],
};

/* ── industry impact matrix ────────────────────────────────────────── */
function industryMatrix(countryId, ctx) {
  const countryPolicies = policiesForCountry(countryId);
  const rows = INDUSTRIES.map((ind) => {
    const rel = countryPolicies
      .map((p) => ({ p, fit: relevanceFactor(p, ind.id) }))
      .filter((x) => x.fit >= 0.55);
    const scored = rel.map(({ p, fit }) => {
      const a = analyzePolicy(p, { ...ctx, industryId: ind.id });
      return { title: p.title, score: a.overall, fit };
    });
    scored.sort((a, b) => b.score - a.score);
    const direct = rel.filter((r) => r.fit === 1).length;
    const horizontal = rel.filter((r) => r.fit === 0.75).length;
    const avg = scored.length
      ? Math.round(scored.reduce((s, x) => s + x.score * (x.fit >= 1 ? 1 : 0.75), 0) / Math.max(1, scored.reduce((s, x) => s + (x.fit >= 1 ? 1 : 0.75), 0)))
      : 20;
    const burden = clamp(Math.round(avg * 0.8 + Math.min(18, scored.length * 2.2)), 8, 97);
    return {
      industryId: ind.id,
      industryName: ind.name,
      affectedPolicies: scored.length,
      directPolicies: direct,
      horizontalPolicies: horizontal,
      burdenScore: burden,
      riskLevel: impactLevel(burden),
      readinessEstimate: clamp(100 - Math.round(burden * 0.62), 3, 92),
      complexityLabel: burden >= 78 ? "Very High" : burden >= 58 ? "High" : burden >= 38 ? "Moderate" : "Low",
      topDrivers: scored.slice(0, 3).map((s) => s.title),
      trace: `burden = weightedAvg(overallScores) × 0.8 + min(18, policyCount × 2.2)`,
    };
  });
  return rows;
}

/* ── action plan ───────────────────────────────────────────────────── */
const OWNER_BY_TYPE = {
  "Data Privacy & Security": "Legal / Privacy",
  "Financial Services & Payments": "Compliance",
  "AML / CTF": "Compliance",
  "Cybersecurity & Operational Resilience": "Engineering",
  "AI Governance": "Product",
  "Product Cybersecurity": "Engineering",
  "Securities & Investment": "Legal / Privacy",
  "Banking & Prudential": "Finance",
  "Consumer Protection": "Support",
  "Platform Regulation": "Legal / Privacy",
  "Digital Identity & Trust Services": "Engineering",
  "Open Finance & Interoperability": "Engineering",
  "Data Governance": "Engineering",
  "Healthcare Compliance": "Legal / Privacy",
};
function priorityFromScore(score) { return score >= 78 ? "critical" : score >= 58 ? "important" : "standard"; }
function dueDaysFromPriority(priority, seedStr) {
  const base = priority === "critical" ? 60 : priority === "important" ? 120 : 210;
  return base + Math.floor(((hashSeed(seedStr) % 30)) * 0.5);
}
function buildActionPlan(policies, ctx) {
  const requirements = [];
  const gaps = [];
  const rawActions = [];
  let reqIdx = 1;
  for (const p of policies) {
    const a = analyzePolicy(p, ctx);
    const obs = (p.obligations || []).slice(0, 3);
    obs.forEach((ob, i) => {
      const priority = priorityFromScore(a.overall);
      const id = `gov-${reqIdx}`;
      requirements.push({
        id,
        name: ob,
        authority: p.authority,
        priority,
        status: "pending",
        dueDays: dueDaysFromPriority(priority, id + p.id),
        desc: `${ob} — required under ${p.title} (${p.code}), administered by ${p.authority}.`,
      });
      gaps.push({
        reqId: id,
        title: `${p.shortCode || p.code}: ${ob}`.slice(0, 120),
        description: `${ctx.company} has no recorded evidence of compliance with "${ob}" (${p.title}).`,
        severity: priority === "critical" ? "high" : priority === "important" ? "medium" : "low",
      });
      rawActions.push({
        reqId: id,
        title: `Implement: ${ob}`.slice(0, 140),
        description: `${ob}. Source: ${p.title}, administered by ${p.authority}.`,
        priority,
        dueDays: dueDaysFromPriority(priority, id + p.id),
        owner: OWNER_BY_TYPE[p.policyType] || "Compliance",
        estimatedCost: round100((3500 + p.baseRisk * 85) * (priority === "critical" ? 1.5 : priority === "important" ? 1.2 : 1)),
        estimatedDays: Math.max(5, Math.round(dueDaysFromPriority(priority, id + p.id) * 0.45)),
      });
      reqIdx++;
    });
  }
  /* risks feed action-risk linkage inside enrichActionPlan */
  const risks = buildRiskRegister(policies, ctx);
  const enriched = Core.enrichActionPlan(rawActions, { requirements, gaps, risks });
  const timeline = Core.computeTimeline(enriched.actions);
  const totalCost = enriched.actions.reduce((s, a) => s + (Number(a.estimatedCost) || 0), 0);
  return {
    requirements,
    gaps,
    risks,
    actions: enriched.actions,
    phases: enriched.phases,
    timeline,
    totalCost,
    totalDays: timeline.totalDays,
    assumptions: [
      "Cost model: round100(3500 + policyBaseRisk × 85) × priority multiplier (critical ×1.5, important ×1.2)",
      "Duration model: max(5, round(statutoryDueDays × 0.45)); phases assigned by shared ReguLens core",
      "Statuses start 'pending' — update them in Requirements/Action Plan as work completes",
    ],
  };
}

/* ── risk register (all 7 mandated categories) ─────────────────────── */
const RISK_CATEGORIES = [
  { key: "regulatory", label: "Regulatory Compliance" },
  { key: "economic", label: "Economic" },
  { key: "industry", label: "Industry-Specific" },
  { key: "consumer", label: "Consumer Trust" },
  { key: "operational", label: "Operational" },
  { key: "implementation", label: "Implementation Timeline" },
  { key: "market", label: "Market Access" },
];
function buildRiskRegister(policies, ctx) {
  const sorted = [...policies]
    .map((p) => ({ p, a: analyzePolicy(p, ctx) }))
    .sort((x, y) => y.a.overall - x.a.overall);
  const top = sorted[0] || null;
  const catWeights = { regulatory: 4.4, economic: 2.6, industry: 3.2, consumer: 2.8, operational: 3.4, implementation: 3.6, market: 3.0 };
  const defs = {
    regulatory: top && {
      title: `Non-compliance penalties under ${top.p.title}`,
      consequence: `${top.p.authority} may impose administrative fines, orders, or licence conditions for failures against ${top.p.code}.`,
      mitigation: `Stand up a compliance calendar mapped to ${top.p.code}; complete the Action Plan's critical items first.`,
    },
    economic: {
      title: "Compliance cost overrun versus budget",
      consequence: "Modelled remediation spend may grow as vendor quotes and audit findings arrive.",
      mitigation: "Track estimatedCost per action; re-baseline monthly and prioritise critical-phase items.",
    },
    industry: {
      title: `${ctx.industryName}-specific burden shift in ${ctx.targetName}`,
      consequence: `Sector guidance or supervisory priorities can add obligations beyond the statutory baseline captured here.`,
      mitigation: "Monitor the regulator's newsroom; re-run the Policy Impact Simulator quarterly.",
    },
    consumer: {
      title: "Customer trust erosion after publicised enforcement",
      consequence: "Enforcement headlines in the target market depress conversion and retention for newcomers.",
      mitigation: "Publish transparent privacy/security commitments aligned to the strongest applicable law.",
    },
    operational: {
      title: "Process disruption while embedding controls",
      consequence: "Control implementation (approvals, reviews, monitoring) slows product operations temporarily.",
      mitigation: "Phase rollouts using the generated timeline; automate evidence collection early.",
    },
    implementation: {
      title: "Critical-path slippage across dependent actions",
      consequence: "The longest dependency chain drives the go-live date; any slip cascades.",
      mitigation: "Watch Phase 0–1 critical-path actions; escalate blockers within 48h.",
    },
    market: {
      title: "Market-entry delay from licensing/registration queues",
      consequence: "Authority processing times can push launch beyond the planned window.",
      mitigation: "File early; use pre-application meetings where offered; track milestone dates.",
    },
  };
  return RISK_CATEGORIES.map((cat, i) => {
    const def = defs[cat.key];
    const seed = `${cat.key}|${ctx.targetId}|${ctx.industryId}|${top ? top.p.id : "none"}`;
    const baseProb = catWeights[cat.key] * (top ? top.a.overall / 80 : 0.6);
    const probability = clamp(Math.round(baseProb + jitter(seed)), 1, 5);
    const impactVal = clamp(Math.round(catWeights[cat.key] / 1.05 + jitter(seed + "i")), 1, 5);
    const score = probability * impactVal;
    const severity = score >= 16 ? "Critical" : score >= 10 ? "High" : score >= 5 ? "Medium" : "Low";
    return {
      id: `GRISK-${String(i + 1).padStart(2, "0")}`,
      title: def ? def.title : cat.label,
      category: cat.label,
      probability,
      impact: impactVal,
      severity,
      businessConsequence: def ? def.consequence : "",
      regulatoryConsequence: def && top ? `Supervision under ${top.p.code}.` : "",
      mitigation: def ? def.mitigation : "Monitor and reassess.",
      status: "Open",
      linkedPolicies: sorted.slice(0, 3).map((s) => s.p.title),
      trace: `probability ≈ categoryWeight × (topPolicyImpact/80) ± jitter; impact ≈ weight/1.05 ± jitter`,
    };
  });
}

/* ── consultations ─────────────────────────────────────────────────── */
function consultationsFor(countryId) {
  const records = CONSULTATION_DB.filter((c) => c.countryScope.includes(countryId)).map((c) => {
    const p = policyById(c.policyId);
    return { ...c, policyTitle: p ? p.title : c.policyId, caveat: "Status last recorded in the ReguLens dataset — verify current status on the authority's official register." };
  });
  return records;
}
function derivedMilestones(policies, nowMs) {
  const now = nowMs || Date.now();
  const out = [];
  for (const p of policies) {
    const eff = Date.parse(p.effectiveDate);
    if (Number.isFinite(eff) && eff > now) {
      out.push({
        kind: "DERIVED",
        policyTitle: p.title,
        date: p.effectiveDate,
        note: `Staged application/effectivity milestone derived from the recorded effective date of ${p.code}. Not a consultation event.`,
      });
    }
  }
  return out.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

/* ── canonical package builder ─────────────────────────────────────── */
function normalizeContext(input) {
  const originId = String(input.originId || input.origin || "").toLowerCase();
  const targetId = String(input.targetId || input.target || "").toLowerCase();
  const ctx = {
    originId: GOV_COUNTRIES[originId] ? originId : "in",
    targetId: GOV_COUNTRIES[targetId] ? targetId : "jp",
    industryId: String(input.industryId || input.industry || "general").toLowerCase(),
    company: String(input.company || "").trim().slice(0, 120) || "Your company",
    product: String(input.product || "").trim().slice(0, 160) || "Your product",
    nowMs: Number(input.nowMs) || Date.now(),
  };
  ctx.originName = (GOV_COUNTRIES[ctx.originId] || {}).name || ctx.originId;
  ctx.targetName = (GOV_COUNTRIES[ctx.targetId] || {}).name || ctx.targetId;
  const ind = INDUSTRIES.find((i) => i.id === ctx.industryId);
  ctx.industryName = ind ? ind.name : "General";
  return ctx;
}

function buildGovernmentPackage(rawInput) {
  const ctx = normalizeContext(rawInput || {});
  const policies = relevantPolicies(ctx.targetId, ctx.industryId);
  const analyses = policies.map((p) => analyzePolicy(p, ctx));

  const plan = buildActionPlan(policies, ctx);
  const matrix = industryMatrix(ctx.targetId, ctx);
  const stakeholders = stakeholdersFor(policies, ctx);
  const outcomes = outcomesFor(policies, ctx);
  const consults = consultationsFor(ctx.targetId);
  const milestones = derivedMilestones(policies, ctx.nowMs);

  const byStatus = {};
  analyses.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
  const byType = {};
  analyses.forEach((a) => { byType[a.policyType] = (byType[a.policyType] || 0) + 1; });

  const verifiedSources = analyses.filter((a) => a.source && a.source.verified && a.source.url).length;
  const unverifiedSources = analyses.length - verifiedSources;

  const govAnalysisShape = {
    requirements: plan.requirements,
    gaps: plan.gaps,
    risks: plan.risks,
  };
  const readiness = Core.calculateReadiness(govAnalysisShape);
  const verdict = Core.canLaunch(govAnalysisShape);

  const sources = Core.collectSources(
    analyses.map((a) => ({
      title: a.title,
      authority: a.authority,
      country: ctx.targetName,
      sourceUrl: a.source && a.source.url ? a.source.url : "",
      lastUpdated: a.lastUpdated,
      sourceType: a.source && a.source.url ? "Official publication" : "Authority registry entry",
      referenceCode: a.code,
    })),
    { targetCountry: ctx.targetName }
  );

  const dashboard = {
    totals: {
      policies: analyses.length,
      obligations: plan.requirements.length,
      actions: plan.actions.length,
      risks: plan.risks.length,
      industriesTracked: INDUSTRIES.length,
      authorities: new Set(analyses.map((a) => a.authority)).size,
    },
    byStatus,
    byType,
    sourceIntegrity: { verified: verifiedSources, unverified: unverifiedSources },
    workload: { totalCost: plan.totalCost, totalDays: plan.timeline.totalDays, weeks: plan.timeline.totalWeeks },
    readiness,
    verdict,
    topRisks: [...plan.risks].sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact)).slice(0, 5),
    upcoming: milestones.slice(0, 6),
    consultationsOpen: consults.filter((c) => !/^closed/i.test(c.status)).length,
    consultationsTotal: consults.length,
  };

  return {
    meta: {
      engineVersion: GOV_VERSION,
      generatedAt: new Date(ctx.nowMs).toISOString(),
      module: "government-intelligence",
      disclaimers: [
        "Every policy shown is a real instrument recorded in the ReguLens government policy database.",
        "Entries marked SOURCE NOT VERIFIED have no machine-checkable official URL in our dataset — confirm via the named authority before filing.",
        "Scores, probabilities and costs are deterministic MODELLED estimates derived from policy metadata and your inputs; they are decision support, not legal advice.",
      ],
    },
    context: ctx,
    countries: Object.values(GOV_COUNTRIES),
    industries: INDUSTRIES,
    policies: analyses,
    dashboard,
    stakeholders,
    outcomes,
    industryMatrix: matrix,
    actionPlan: {
      actions: plan.actions,
      phases: plan.phases,
      timeline: plan.timeline,
      totalCost: plan.totalCost,
      assumptions: plan.assumptions,
    },
    requirements: plan.requirements,
    gaps: plan.gaps,
    risks: plan.risks,
    consultations: { records: consults, derivedMilestones: milestones },
    sources,
  };
}

/* ── scenario simulation (deterministic diff of a rebuilt package) ─── */
const CHANGE_TYPES = {
  stricter: { label: "Tighten enforcement", factor: (lvl) => 1 + (lvl / 100) * 0.9 },
  relaxed: { label: "Relax requirements", factor: (lvl) => 1 - (lvl / 100) * 0.55 },
  activate: { label: "Activate upcoming/draft policy", factor: () => 1.15 },
  repeal: { label: "Remove a policy from scope", factor: () => 0.85 },
};
function simulateScenario(baseInput, spec) {
  const specNorm = {
    changeType: CHANGE_TYPES[spec.changeType] ? spec.changeType : "stricter",
    policyId: String(spec.policyId || ""),
    implementationLevel: clamp(Math.round(Number(spec.implementationLevel ?? 50)) || 50, 10, 100),
    horizonDays: [90, 180, 365, 730].includes(Number(spec.horizonDays)) ? Number(spec.horizonDays) : 365,
  };
  let pkg = buildGovernmentPackage(baseInput);
  let removed = null;
  if ((specNorm.changeType === "repeal" || specNorm.changeType === "activate") && specNorm.policyId) {
    const target = policyById(specNorm.policyId);
    const applies = target && target.countries.includes(pkg.context.targetId);
    if (specNorm.changeType === "repeal") {
      if (!applies) return { error: `Policy "${specNorm.policyId}" does not apply to ${pkg.context.targetName}.` };
      const DB = require("./gov-policy-db.cjs");
      const backup = DB.POLICY_DB;
      try {
        DB.POLICY_DB = backup.filter((p) => p.id !== specNorm.policyId);
        pkg = buildGovernmentPackage(baseInput);
      } finally { DB.POLICY_DB = backup; }
      removed = target;
    } else if (specNorm.changeType === "activate") {
      if (!target) return { error: `Unknown policy "${specNorm.policyId}".` };
      /* activate = force full inclusion of an upcoming/draft instrument */
      if (!applies) return { error: `Policy "${target.title}" does not apply to ${pkg.context.targetName}.` };
      const DB = require("./gov-policy-db.cjs");
      const backupIndustries = target.industries;
      try {
        target.industries = ["all"];
        pkg = buildGovernmentPackage(baseInput);
      } finally { target.industries = backupIndustries; }
      removed = target;
    }
  }

  const f = CHANGE_TYPES[specNorm.changeType].factor(specNorm.implementationLevel);
  const base = buildGovernmentPackage(baseInput); // untouched baseline for comparison
  const sim = pkg;

  const costDelta = Math.round(sim.actionPlan.totalCost * f) - base.actionPlan.totalCost;
  const daysDelta = Math.round(sim.actionPlan.timeline.totalDays * f) - base.actionPlan.timeline.totalDays;
  const reqDelta = sim.requirements.length - base.requirements.length;
  const avgBase = base.policies.length ? base.policies.reduce((s, p) => s + p.overall, 0) / base.policies.length : 0;
  const avgSim = sim.policies.length ? sim.policies.reduce((s, p) => s + p.overall, 0) / sim.policies.length : 0;

  const industryShifts = sim.industryMatrix.map((m, i) => {
    const b = base.industryMatrix[i];
    return { industryName: m.industryName, before: b.burdenScore, after: m.burdenScore, delta: m.burdenScore - b.burdenScore };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 6);

  return {
    scenario: {
      id: `SCEN-${hashSeed(JSON.stringify(specNorm)).toString(36)}`,
      name: `${CHANGE_TYPES[specNorm.changeType].label}${removed ? ` — ${removed.title}` : ""} @ ${specNorm.implementationLevel}%`,
      params: specNorm,
      focusPolicy: removed ? { id: removed.id, title: removed.title } : null,
    },
    deltas: {
      cost: { baseline: base.actionPlan.totalCost, simulated: Math.round(sim.actionPlan.totalCost * f), delta: costDelta, trace: "simulated = Σ(actionCost) × factor(changeType, implementationLevel)" },
      days: { baseline: base.actionPlan.timeline.totalDays, simulated: Math.round(sim.actionPlan.timeline.totalDays * f), delta: daysDelta },
      requirements: { baseline: base.requirements.length, simulated: sim.requirements.length, delta: reqDelta },
      avgImpact: { baseline: Math.round(avgBase), simulated: Math.round(avgSim * f), delta: Math.round(avgSim * f - avgBase) },
      verdictBefore: base.dashboard.verdict.state,
      verdictAfter: sim.dashboard.verdict.state,
    },
    industryShifts,
    assumptions: [
      `Implementation level ${specNorm.implementationLevel}% scales modelled workload linearly.`,
      `Change type "${specNorm.changeType}" applies factor ${f.toFixed(2)} to workload metrics.`,
      ...(removed ? [`Focus policy ${removed.title} was ${specNorm.changeType === "repeal" ? "excluded from" : "forced fully into"} the simulation set.`] : []),
      "Simulation is a what-if model — it does not represent any announced government decision unless the focus policy is a real draft/upcoming instrument.",
    ],
    simulatedPackage: sim,
  };
}

function compareScenarios(baseInput, specs) {
  const list = Array.isArray(specs) ? specs.slice(0, 3) : [];
  const scenarios = list.map((s) => {
    const r = simulateScenario(baseInput, s);
    return r.error
      ? { name: s.changeType + ":" + (s.policyId || ""), error: r.error }
      : {
          name: r.scenario.name,
          params: r.scenario.params,
          cost: r.deltas.cost.simulated,
          days: r.deltas.days.simulated,
          requirements: r.deltas.requirements.simulated,
          avgImpact: r.deltas.avgImpact.simulated,
          verdict: r.deltas.verdictAfter,
        };
  });
  const base = buildGovernmentPackage(baseInput);
  return {
    baseline: {
      name: "Current baseline",
      cost: base.actionPlan.totalCost,
      days: base.actionPlan.timeline.totalDays,
      requirements: base.requirements.length,
      avgImpact: base.policies.length ? Math.round(base.policies.reduce((s, p) => s + p.overall, 0) / base.policies.length) : 0,
      verdict: base.dashboard.verdict.state,
    },
    scenarios,
    chartSeries: {
      labels: ["Baseline", ...scenarios.map((s, i) => `S${i + 1}`)],
      datasets: [
        { metric: "Estimated cost ($)", values: [base.actionPlan.totalCost, ...scenarios.map((s) => s.cost ?? null)] },
        { metric: "Timeline (days)", values: [base.actionPlan.timeline.totalDays, ...scenarios.map((s) => s.days ?? null)] },
        { metric: "Requirements", values: [base.requirements.length, ...scenarios.map((s) => s.requirements ?? null)] },
      ],
    },
  };
}

/* ── copilot fallback (deterministic, grounded answers when AI is off) ─ */
function copilotFallback(question, pkg) {
  const q = String(question || "").toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));
  const citations = [];
  const cite = (title) => { if (!citations.includes(title)) citations.push(title); };
  let answer = "";

  if (has("who is affected", "affected", "stakeholder")) {
    const g = pkg.stakeholders.groups.slice(0, 4);
    answer = g.map((x) => `• ${x.group} — impact ${x.maxImpact}/100 (${x.impactLevel}). Key concern: ${x.concerns[0] || "—"}`).join("\n");
    pkg.stakeholders.detail.slice(0, 3).forEach((d) => cite(d.policy));
  } else if (has("happen", "outcome", "consequence")) {
    const o = pkg.outcomes.shortTerm.slice(0, 3);
    answer = o.map((x) => `• [${x.severity}] ${x.title} — likelihood ~${x.probability}%`).join("\n");
    o.forEach((x) => cite(x.policy));
  } else if (has("industry", "sector")) {
    const rows = [...pkg.industryMatrix].sort((a, b) => b.burdenScore - a.burdenScore).slice(0, 4);
    answer = rows.map((r) => `• ${r.industryName}: burden ${r.burdenScore}/100 (${r.riskLevel}); drivers: ${r.topDrivers.join("; ")}`).join("\n");
  } else if (has("scenario", "compare", "simulat")) {
    answer = `Baseline: $${pkg.actionPlan.totalCost.toLocaleString()} · ${pkg.actionPlan.timeline.totalDays} days · ${pkg.requirements.length} requirements · verdict ${pkg.dashboard.verdict.state}.\nUse Compare Scenarios or Scenario Simulator to model changes.`;
  } else if (has("plan", "timeline", "action", "step")) {
    const ph = (pkg.actionPlan.timeline.phases || []).slice(0, 3);
    answer = `Total ${pkg.actionPlan.timeline.totalDays} days (~${pkg.actionPlan.timeline.totalWeeks} weeks). Critical path: ${(pkg.actionPlan.timeline.criticalPath || []).map((c) => c.title).join(" → ")}\n` +
      ph.map((p) => `• P${p.phase} ${p.name}: Day ${p.startDay}–${p.endDay}, ${p.actionCount} actions`).join("\n");
  } else if (has("consultation", "comment")) {
    const recs = pkg.consultations.records;
    answer = recs.length
      ? recs.map((r) => `• ${r.title} — ${r.status}, window ${r.window} (${r.authority})`).join("\n")
      : `No verified consultation records for ${pkg.context.targetName} in the dataset. Honest empty state — check ${pkg.context.targetName}'s official register.`;
    recs.forEach((r) => cite(r.policyTitle));
  } else if (has("source", "verify", "url", "link")) {
    answer = `${pkg.dashboard.sourceIntegrity.verified} of ${pkg.dashboard.sourceIntegrity.verified + pkg.dashboard.sourceIntegrity.unverified} sources carry a verified official URL. The rest are marked SOURCE NOT VERIFIED — see Sources table.`;
  } else if (has("cost", "budget", "price")) {
    answer = `Estimated compliance workload: $${pkg.actionPlan.totalCost.toLocaleString()} across ${pkg.actionPlan.actions.length} actions over ${pkg.actionPlan.timeline.totalDays} days. Assumptions: ${pkg.actionPlan.assumptions[0]}`;
  } else {
    answer =
      `Context: ${pkg.context.company} (${pkg.context.industryName}), ${pkg.context.originName} → ${pkg.context.targetName}.\n` +
      `• ${pkg.dashboard.totals.policies} applicable policies · ${pkg.dashboard.totals.obligations} obligations\n` +
      `• Estimated workload $${pkg.actionPlan.totalCost.toLocaleString()} / ${pkg.actionPlan.timeline.totalDays} days\n` +
      `• Launch verdict: ${pkg.dashboard.verdict.state}\n` +
      `Ask about: who is affected · what could happen · industry impact · action plan · consultations · sources.`;
  }
  return { answer, citations, mode: "deterministic-fallback", grounded: true };
}

module.exports = {
  GOV_VERSION,
  GOV_COUNTRIES,
  INDUSTRIES,
  POLICY_DB,
  RISK_CATEGORIES,
  CHANGE_TYPES,
  normalizeContext,
  policiesForCountry,
  relevantPolicies,
  analyzePolicy,
  industryMatrix,
  buildActionPlan,
  buildRiskRegister,
  consultationsFor,
  derivedMilestones,
  buildGovernmentPackage,
  simulateScenario,
  compareScenarios,
  copilotFallback,
};
