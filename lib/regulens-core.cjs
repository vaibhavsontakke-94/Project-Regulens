/* ═══════════════════════════════════════════════════════════════
   ReguLens Shared Core — SINGLE SOURCE OF TRUTH
   Used by: server.js (SSE pipeline), lib/demo-engine.js, browser.
   Loaded as CJS in Node and served as a classic script to the browser
   via GET /core/regulens-core.js (window.RegulensCore).
   ═══════════════════════════════════════════════════════════════ */
"use strict";

/* ────────────────────────────────────────────────────────────────
   1. READINESS ENGINE — deterministic compliance readiness.

   FORMULA (documented, do not duplicate elsewhere):
     completion weights: completed=1, in_progress=0.5, pending=0,
                         not_applicable excluded from totals
     completionScore = completionRatio × 60
     gapScore        = gapClosureRatio × 15      (no gaps  → ratio = 1)
                       gapClosureRatio = closed / (closed + open)
     riskScore       = riskMitigationRatio × 15  (no risks → ratio = 1)
                       mitigated / total
     criticalScore   = criticalCompletionRatio × 10
     PENALTIES:
       unresolved critical gap          −3 each (max −15)
       unresolved critical-severity risk−5 each (max −15)
       unresolved critical requirement  −2 each (max −10)
     score = clamp(round(base + penalties), 0, 100)

   STATUSES:
     95–100 Ready · 80–94 Nearly Ready · 60–79 Partially Ready
     40–59 High Risk · 0–39 Not Ready
   ──────────────────────────────────────────────────────────────── */

const STATUS_BANDS = [
  { min: 95, status: "Ready" },
  { min: 80, status: "Nearly Ready" },
  { min: 60, status: "Partially Ready" },
  { min: 40, status: "High Risk" },
  { min: 0, status: "Not Ready" },
];

function bandFor(score) {
  for (const b of STATUS_BANDS) if (score >= b.min) return b.status;
  return "Not Ready";
}

function reqWeight(status) {
  const s = String(status || "pending").toLowerCase().replace(/[\s_-]/g, "");
  if (s === "completed" || s === "done") return 1;
  if (s === "inprogress" || s === "progress" || s === "partial" || s === "inprogressing") return 0.5;
  if (s === "notapplicable" || s === "na" || s === "n/a") return null; // excluded
  return 0;
}

function calculateReadiness({ requirements = [], gaps = [], risks = [], evidence = null } = {}) {
  const reqs = Array.isArray(requirements) ? requirements : [];
  const gapsArr = Array.isArray(gaps) ? gaps : [];
  const risksArr = Array.isArray(risks) ? risks : [];

  /* completion ratio */
  let weightSum = 0;
  let applicable = 0;
  let completedCount = 0;
  let inProgressCount = 0;
  let pendingCount = 0;
  for (const r of reqs) {
    const w = reqWeight(r.status);
    if (w === null) continue;
    applicable++;
    weightSum += w;
    if (w === 1) completedCount++;
    else if (w === 0.5) inProgressCount++;
    else pendingCount++;
  }
  const completionRatio = applicable ? weightSum / applicable : 0;

  /* gap closure ratio */
  const isGapClosed = (g) => {
    const st = String(g.status || g.currentStatus || "").toLowerCase().replace(/[\s_-]/g, "");
    return st.includes("closed") || st.includes("resolved") || st.includes("remediated") || st.includes("done");
  };
  const openGaps = gapsArr.filter((g) => !isGapClosed(g)).length;
  const closedGaps = gapsArr.length - openGaps;
  const gapClosureRatio = gapsArr.length ? closedGaps / gapsArr.length : 1;

  /* risk mitigation ratio */
  const isRiskMitigated = (r) => String(r.status || "").toLowerCase().match(/mitigat|closed|resolved|accepted/);
  const mitigatedRisks = risksArr.filter(isRiskMitigated).length;
  const riskMitigationRatio = risksArr.length ? mitigatedRisks / risksArr.length : 1;

  /* critical requirement completion */
  const criticalReqs = reqs.filter((r) => String(r.priority).toLowerCase() === "critical");
  const criticalApplicable = criticalReqs.filter((r) => reqWeight(r.status) !== null);
  const criticalDone = criticalApplicable.filter((r) => reqWeight(r.status) === 1);
  const criticalRatio = criticalApplicable.length ? criticalDone.length / criticalApplicable.length : 1;

  const base =
    completionRatio * 60 +
    gapClosureRatio * 15 +
    riskMitigationRatio * 15 +
    criticalRatio * 10;

  /* penalties */
  const critGapPenaltyItems = Math.min(openGaps === gapsArr.length && gapsArr.length
    ? gapsArr.filter((g) => String(g.severity || g.priority || "").toLowerCase() === "critical").length
    : gapsArr.filter((g) => !isGapClosed(g) && String(g.severity || g.priority || "").toLowerCase() === "critical").length, 5);
  const critGapPenalty = -3 * Math.min(critGapPenaltyItems, 5);

  const critRiskItems = risksArr.filter((r) =>
    !isRiskMitigated(r) && ["critical", "high"].includes(String(r.severity || "").toLowerCase())
    // severity Critical per spec; High counted only when probability×impact ≥ 16 handled upstream
  ).filter((r) => String(r.severity || "").toLowerCase() === "critical");
  const critRiskPenalty = -5 * Math.min(critRiskItems.length, 3);

  const critReqUnresolved = criticalApplicable.filter((r) => reqWeight(r.status) < 1).length;
  const critReqPenalty = -2 * Math.min(critReqUnresolved, 5);

  let score = Math.round(base + critGapPenalty + critRiskPenalty + critReqPenalty);
  score = Math.max(0, Math.min(100, score));

  /* evidence completeness (informational; only when an evidence model exists) */
  let evidenceRatio = null;
  if (evidence && typeof evidence === "object" && Number.isFinite(+evidence.required) && +evidence.required > 0) {
    evidenceRatio = Math.max(0, Math.min(1, (+evidence.provided || 0) / +evidence.required));
  }

  const reasons = [];
  if (applicable && pendingCount === applicable) reasons.push("All compliance requirements are still pending.");
  if (critReqUnresolved > 0) reasons.push(`${critReqUnresolved} critical requirement(s) unresolved.`);
  if (openGaps > 0) reasons.push(`${openGaps} compliance gap(s) still open.`);
  if (risksArr.length - mitigatedRisks > 0) reasons.push(`${risksArr.length - mitigatedRisks} risk(s) not yet mitigated.`);
  if (!reasons.length) reasons.push("All measured compliance dimensions satisfied.");

  return {
    score,
    status: bandFor(score),
    breakdown: {
      completionRatio: +completionRatio.toFixed(4),
      gapClosureRatio: +gapClosureRatio.toFixed(4),
      riskMitigationRatio: +riskMitigationRatio.toFixed(4),
      criticalCompletionRatio: +criticalRatio.toFixed(4),
      evidenceRatio,
      counts: {
        requirementsTotal: reqs.length,
        applicable,
        completed: completedCount,
        inProgress: inProgressCount,
        pending: pendingCount,
        gapsOpen: openGaps,
        gapsClosed: closedGaps,
        risksTotal: risksArr.length,
        risksMitigated: mitigatedRisks,
        criticalRequirementsUnresolved: critReqUnresolved,
      },
      penalties: {
        criticalGaps: critGapPenalty,
        criticalRisks: critRiskPenalty,
        criticalRequirements: critReqPenalty,
      },
    },
    reasons,
  };
}

/* ────────────────────────────────────────────────────────────────
   2. ACTION PLAN ENGINE — phases 0–8, real classification.
   ──────────────────────────────────────────────────────────────── */
const PHASES = [
  { phase: 0, name: "Preparation", owner: "Compliance" },
  { phase: 1, name: "Regulatory Discovery", owner: "Legal" },
  { phase: 2, name: "Requirement Mapping", owner: "Compliance" },
  { phase: 3, name: "Gap Assessment", owner: "Compliance" },
  { phase: 4, name: "Remediation", owner: "Engineering" },
  { phase: 5, name: "Validation", owner: "QA" },
  { phase: 6, name: "Final Compliance Review", owner: "Legal" },
  { phase: 7, name: "Launch Readiness", owner: "Executive" },
  { phase: 8, name: "Post-Launch Monitoring", owner: "Compliance" },
];

const PHASE_RULES = [
  { phase: 0, re: /\b(appoint|steering|committee|kick.?off|prepare|onboard|team|project plan|program manager)\b/i },
  { phase: 1, re: /\b(licen[cs]|registr|authorit(y|ies)|filing|permit|notar|regulator|determine applicab)/i },
  { phase: 2, re: /\b(requirement mapping|obligation|applicabilit|traceability|matrix|catalog)/i },
  { phase: 3, re: /\bgap\b|\baudit\b|\bassess|\bevaluat.{0,20}(current|compliance)|\binventory\b/i },
  { phase: 5, re: /\b(test|validat|verif|certif|penetration|inspect|qa review)\b/i },
  { phase: 6, re: /(final (compliance )?review|sign.?off|approval|executive review|attestation)/i },
  { phase: 7, re: /\b(launch|go.?live|market entry|release to production|go to market)\b/i },
  { phase: 8, re: /\b(monitor|ongoing|renew|maintenance|periodic|reporting cadence|continuous)\b/i },
  { phase: 4, re: /\b(implement|integrate|deploy|encrypt|localiz|updat|train|remediat|develop|build|configur|retention|consent|privacy policy|security control|data residency)\b/i },
];

function classifyPhase(text) {
  for (const rule of PHASE_RULES) if (rule.re.test(text)) return rule.phase;
  return 4; // default Remediation
}

const OUTCOME_BY_PHASE = {
  0: "Compliance program team and governance structure in place.",
  1: "Confirmed list of applicable regulations with authorities and deadlines.",
  2: "Complete obligation register mapped to owners and controls.",
  3: "Documented gap assessment with prioritized remediation backlog.",
  4: "Required controls implemented and operational across product and processes.",
  5: "Independent validation passed; control evidence collected.",
  6: "Management sign-off on compliance posture recorded.",
  7: "Launch approved with compliance conditions met.",
  8: "Continuous monitoring operating with defined reporting cadence.",
};

const EVIDENCE_BY_PHASE = {
  0: "Program charter, RACI chart",
  1: "Regulation register with official source references",
  2: "Requirement-to-control traceability matrix",
  3: "Gap assessment report",
  4: "Implementation artifacts (configs, policies, screenshots)",
  5: "Test/validation reports and certificates",
  6: "Signed management review record",
  7: "Launch approval checklist",
  8: "Monitoring dashboards and periodic reports",
};

function riskForAction(action, risks) {
  const linked = (risks || []).find((r) => r.id && action.relatedRisk === r.id);
  if (linked) {
    return {
      level: String(linked.severity || "Medium"),
      consequence: linked.businessConsequence || linked.regulatoryConsequence || "Potential regulatory non-compliance.",
      riskId: linked.id,
    };
  }
  const p = String(action.priority || "").toLowerCase();
  if (p === "critical") return { level: "High", consequence: "Regulatory non-compliance exposure: enforcement actions, fines, or blocked market access.", riskId: null };
  if (p === "important") return { level: "Medium", consequence: "Compliance deficiencies likely to be identified at audit or inspection.", riskId: null };
  return { level: "Low", consequence: "Minor compliance findings and rework later in the program.", riskId: null };
}

function validateDependencies(actions) {
  /* returns { actions, cyclesRemoved } — deterministically breaks cycles by
     dropping back-edge dependencies, never silently. */
  const ids = new Set(actions.map((a) => a.id));
  const issues = [];
  for (const a of actions) {
    if (!Array.isArray(a.dependencies)) a.dependencies = [];
    a.dependencies = a.dependencies.filter((d) => {
      if (d === a.id) { issues.push(`self-dependency removed: ${a.id}`); return false; }
      if (!ids.has(d)) { issues.push(`unknown dependency removed: ${a.id} → ${d}`); return false; }
      return true;
    });
  }
  /* cycle detection via DFS; drop edge that closes a cycle (last added dep) */
  const state = new Map(); // id -> 1 visiting | 2 done
  const stack = [];
  let cyclesRemoved = 0;
  const visit = (id) => {
    state.set(id, 1);
    stack.push(id);
    const a = actions.find((x) => x.id === id);
    for (const d of a.dependencies) {
      const s = state.get(d);
      if (s === 1) {
        const a2 = actions.find((x) => x.id === d);
        a2.dependencies = a2.dependencies.filter((x) => x !== id);
        issues.push(`circular dependency broken: ${d} → ${id}`);
        cyclesRemoved++;
      } else if (!s) visit(d);
    }
    stack.pop();
    state.set(id, 2);
  };
  for (const a of actions) if (!state.get(a.id)) visit(a.id);
  return { actions, cyclesRemoved, issues };
}

function enrichActionPlan(rawActions, { requirements = [], gaps = [], risks = [] } = {}) {
  const actionsIn = Array.isArray(rawActions) ? rawActions : [];
  const gapByReq = {};
  for (const g of gaps) if (g.reqId) gapByReq[g.reqId] = g;
  const reqById = {};
  for (const r of requirements) if (r.id) reqById[r.id] = r;

  /* classify into phases first so cross-phase dependency chains are stable */
  const staged = actionsIn.map((raw, i) => {
    const text = `${raw.title || ""} ${raw.description || ""}`;
    const phase = classifyPhase(text);
    const relatedReq = raw.reqId ? (reqById[raw.reqId] || null) : null;
    const relatedGap = raw.reqId ? (gapByReq[raw.reqId] || null) : null;
    const estDays = Math.max(1, Math.round(Number(raw.estimatedDays ?? raw.dueDays ?? 14)));
    const estCost = Math.max(0, Math.round(Number(raw.estimatedCost ?? 0)));
    const priority = String(raw.priority || (relatedReq ? relatedReq.priority : "standard")).toLowerCase();
    return {
      id: `AP-${String(i + 1).padStart(3, "0")}`,
      stepNumber: i + 1,
      phase,
      phaseName: PHASES[phase].name,
      title: raw.title || `Compliance action ${i + 1}`,
      description: raw.description || "",
      objective: raw.objective || (relatedGap && relatedGap.title
        ? `Close "${relatedGap.title}" and satisfy the underlying obligation.`
        : `Complete "${raw.title || "this action"}" to satisfy its compliance obligation.`),
      priority,
      owner: raw.owner || PHASES[phase].owner,
      dependencies: [],
      relatedRequirement: raw.reqId || null,
      relatedGap: relatedGap ? (relatedGap.title || relatedGap.reqId || null) : null,
      relatedRisk: null,
      estimatedTime: estDays,
      estimatedCost: estCost,
      dueDays: raw.dueDays != null ? Number(raw.dueDays) : null,
      riskIfSkipped: null, // filled after risks known below
      expectedOutcome: OUTCOME_BY_PHASE[phase],
      evidenceRequired: EVIDENCE_BY_PHASE[phase],
      status: raw.status || "pending",
    };
  });

  /* link risks: first open risk whose affectedRequirement matches this action's req */
  for (const a of staged) {
    const hit = (Array.isArray(risks) ? risks : []).find(
      (r) => a.relatedRequirement && r.affectedRequirement &&
             String(r.affectedRequirement).toLowerCase().includes(String(a.relatedRequirement).toLowerCase()));
    if (hit) { a.relatedRisk = hit.id; }
    a.riskIfSkipped = riskForAction(a, risks);
  }

  /* dependencies: each action depends on the LAST action of every earlier non-empty phase.
     Within a phase, actions run in parallel up to MAX_PARALLEL (=3, assumed team
     capacity); excess actions chain onto earlier ones so schedules stay realistic. */
  const lastOfPhase = {};
  for (const p of PHASES.map((p) => p.phase)) lastOfPhase[p] = null;
  const ordered = [...staged].sort((x, y) => x.stepNumber - y.stepNumber);
  const prioRank = { critical: 0, important: 1, standard: 2 };
  const MAX_PARALLEL = 3;
  for (const a of ordered) {
    const deps = [];
    for (let p = 0; p < a.phase; p++) {
      if (lastOfPhase[p]) deps.push(lastOfPhase[p]);
    }
    a.dependencies = [...new Set(deps)];
    lastOfPhase[a.phase] = a.id;
  }
  for (const p of PHASES.map((x) => x.phase)) {
    const items = staged
      .filter((a) => a.phase === p)
      .sort((x, y) =>
        (prioRank[x.priority] ?? 3) - (prioRank[y.priority] ?? 3) || x.stepNumber - y.stepNumber);
    for (let i = MAX_PARALLEL; i < items.length; i++) {
      items[i].dependencies.push(items[i - MAX_PARALLEL].id);
    }
  }

  const validated = validateDependencies(staged);
  validated.actions.forEach((a, i) => { a.stepNumber = i + 1; });
  return { actions: validated.actions, dependencyIssues: validated.issues };
}

/* ────────────────────────────────────────────────────────────────
   3. TIMELINE ENGINE — longest-path scheduling over dependencies.
   ──────────────────────────────────────────────────────────────── */
function computeTimeline(actions) {
  const acts = Array.isArray(actions) ? actions : [];
  if (!acts.length) return { totalDays: 0, totalWeeks: 0, phases: [], weeks: [], criticalPath: [] };

  const byId = new Map(acts.map((a) => [a.id, a]));
  const start = new Map();
  const end = new Map();
  const memoPath = new Map();

  const schedule = (id, seen = new Set()) => {
    if (start.has(id)) return start.get(id);
    if (seen.has(id)) return 1; // cycle guard (validated upstream anyway)
    seen.add(id);
    const a = byId.get(id);
    const deps = (a.dependencies || []).filter((d) => byId.has(d));
    const s = deps.length ? Math.max(...deps.map((d) => schedule(d, seen) + endOf(d))) : 1;
    start.set(id, s);
    return s;
  };
  const endOf = (id) => {
    if (end.has(id)) return end.get(id);
    const s = schedule(id);
    const e = s + Math.max(1, Number(byId.get(id).estimatedTime) || 1) - 1;
    end.set(id, e);
    return e;
  };

  for (const a of acts) { schedule(a.id); endOf(a.id); }

  /* critical path: walk backwards from latest-finishing action through the
     dependency whose end equals myStart-1, preferring longer durations */
  const lastAct = acts.reduce((m, a) => (end.get(a.id) > end.get(m.id) ? a : m), acts[0]);
  const path = [lastAct];
  while (true) {
    const a = path[path.length - 1];
    const s = start.get(a.id);
    const pred = (a.dependencies || [])
      .map((d) => byId.get(d))
      .filter((d) => end.get(d.id) === s - 1);
    if (!pred.length) break;
    path.push(pred.reduce((m, d) => (Number(d.estimatedTime) > Number(m.estimatedTime) ? d : m), pred[0]));
  }
  path.reverse();

  const totalDays = Math.max(...acts.map((a) => end.get(a.id)));

  /* phase summaries */
  const phases = PHASES.map((p) => {
    const pa = acts.filter((a) => a.phase === p.phase);
    if (!pa.length) return null;
    return {
      phase: p.phase,
      name: p.name,
      startDay: Math.min(...pa.map((a) => start.get(a.id))),
      endDay: Math.max(...pa.map((a) => end.get(a.id))),
      actionCount: pa.length,
      totalCost: pa.reduce((s, a) => s + (Number(a.estimatedCost) || 0), 0),
      actionIds: pa.map((a) => a.id),
    };
  }).filter(Boolean);

  /* week buckets from actual day spans */
  const totalWeeks = Math.ceil(totalDays / 7);
  const weeks = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const ws = (w - 1) * 7 + 1;
    const we = w * 7;
    const wa = acts.filter((a) => start.get(a.id) <= we && end.get(a.id) >= ws);
    weeks.push({
      week: w,
      label: `Week ${w}`,
      startDay: ws,
      endDay: we,
      actionCount: wa.length,
      phases: [...new Set(wa.map((a) => a.phaseName))],
    });
  }

  return {
    totalDays,
    totalWeeks,
    phases,
    weeks,
    criticalPath: path.map((a) => ({ id: a.id, title: a.title, startDay: start.get(a.id), endDay: end.get(a.id) })),
  };
}

/* ────────────────────────────────────────────────────────────────
   4. SOURCES — collect + dedupe REAL sources only.
   ──────────────────────────────────────────────────────────────── */
function collectSources(regulations, ctx = {}) {
  const out = [];
  const seen = new Set();
  for (const r of Array.isArray(regulations) ? regulations : []) {
    const url = typeof r.sourceUrl === "string" && /^https?:\/\//i.test(r.sourceUrl) ? r.sourceUrl : "";
    const key = `${r.title}|${r.authority}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title: r.title || "",
      authority: r.authority || "",
      country: r.country || r.jurisdiction || ctx.targetCountry || "",
      sourceUrl: url,            // empty when no verified URL exists
      publishedDate: r.effectiveDate || r.date || "",
      lastUpdated: r.lastUpdated || "",
      sourceType: r.sourceType || (url ? "Official publication" : (r.source ? "Authority registry entry" : "Unspecified")),
      referenceCode: r.code || r.referenceCode || "",
    });
  }
  return out;
}

/* ────────────────────────────────────────────────────────────────
   5. CAN-I-LAUNCH — deterministic, same readiness engine.
   ──────────────────────────────────────────────────────────────── */
function canLaunch(analysis) {
  if (!analysis) return { state: "NOT_READY", score: 0, reasons: [{ severity: "critical", label: "No analysis available", target: "" }] };

  const rb = analysis.readinessBreakdown ||
    calculateReadiness({
      requirements: analysis.requirements,
      gaps: analysis.gaps,
      risks: analysis.risks || analysis.riskMatrix || [],
    });
  const reqs = Array.isArray(analysis.requirements) ? analysis.requirements : [];
  const gaps = Array.isArray(analysis.gaps) ? analysis.gaps : [];
  const risks = Array.isArray(analysis.risks || analysis.riskMatrix) ? (analysis.risks || analysis.riskMatrix) : [];

  const critUnresolved = reqs.filter((r) =>
    String(r.priority).toLowerCase() === "critical" &&
    reqWeight(r.status) !== null && reqWeight(r.status) < 1);
  const openCritGaps = gaps.filter((g) =>
    !String(g.status || "").toLowerCase().match(/closed|resolved/) &&
    ["critical", "high"].includes(String(g.severity || g.priority || "").toLowerCase()));
  const openCritRisks = risks.filter((r) =>
    !String(r.status || "").toLowerCase().match(/mitigat|closed|accepted/) &&
    String(r.severity || "").toLowerCase() === "critical");

  const reasons = [];
  if (critUnresolved.length) reasons.push({
    severity: "critical", count: critUnresolved.length,
    label: `${critUnresolved.length} critical requirement${critUnresolved.length > 1 ? "s" : ""} unresolved`,
    detail: critUnresolved.slice(0, 3).map((r) => r.name || r.title).join("; "),
    target: "requirements",
  });
  if (openCritGaps.length) reasons.push({
    severity: "critical", count: openCritGaps.length,
    label: `${openCritGaps.length} high/critical gap${openCritGaps.length > 1 ? "s" : ""} open`,
    detail: openCritGaps.slice(0, 3).map((g) => g.title).join("; "),
    target: "gaps",
  });
  if (openCritRisks.length) reasons.push({
    severity: "high", count: openCritRisks.length,
    label: `${openCritRisks.length} critical risk${openCritRisks.length > 1 ? "s" : ""} unmitigated`,
    detail: openCritRisks.slice(0, 3).map((r) => r.title).join("; "),
    target: "risks",
  });
  if (rb.score < 40) reasons.push({
    severity: "high", count: 1,
    label: `Readiness score ${rb.score}% is below the 40% minimum`,
    detail: "Complete remediation actions to raise readiness.",
    target: "actions",
  });

  /* decision matrix (documented):
     NOT_READY           → <40 score OR ≥3 critical blockers of any kind
     HIGH_RISK           → 40–59 score OR ≥1 critical blocker
     READY_WITH_CONDITIONS→ ≥80 score AND zero critical blockers but minor items remain
     READY               → ≥95 score AND zero blockers */
  const criticalBlockers = critUnresolved.length + openCritGaps.length + openCritRisks.length;
  let state;
  if (rb.score < 40 || criticalBlockers >= 3) state = "NOT_READY";
  else if (rb.score < 60 || criticalBlockers >= 1) state = "HIGH_RISK";
  else if (rb.score >= 95) state = "READY";
  else if (rb.score >= 80) state = "READY_WITH_CONDITIONS";
  else state = "HIGH_RISK";

  if (!reasons.length) reasons.push({
    severity: "info", count: 0,
    label: state === "READY" ? "No blocking compliance issues detected." : "Only minor conditions remain before launch.",
    detail: "", target: "actions",
  });

  return { state, score: rb.score, status: rb.status, reasons };
}

/* ────────────────────────────────────────────────────────────────
   exports — Node CJS + browser global
   ──────────────────────────────────────────────────────────────── */
const RegulensCore = {
  calculateReadiness,
  enrichActionPlan,
  computeTimeline,
  collectSources,
  canLaunch,
  PHASES,
  LAUNCH_STATES: ["READY", "READY_WITH_CONDITIONS", "HIGH_RISK", "NOT_READY"],
};

if (typeof module !== "undefined" && module.exports) module.exports = RegulensCore;
if (typeof window !== "undefined") window.RegulensCore = RegulensCore;
