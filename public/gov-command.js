/* ═══════════════════════════════════════════════════════════════
   REGULENS — Government Procurement Command Center (read-only)
   Renders the aggregated /api/sih/overview payload. Real data only;
   no graphs, no estimates. Stable, deterministic, theme-aware.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const BASE = "/api/sih";
  const KEY_ORG = "gcc.selectedOrg";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (v) =>
    String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const now = () => new Date().toISOString();

  const FMT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  const MONEY = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const money = (v, c) => (v == null ? "\u2014" : MONEY.format(Number(v || 0)));
  const num = (v) => (v == null ? "\u2014" : FMT.format(Number(v || 0)));

  function t(key, fb) {
    try {
      const rl = window.ReguLens;
      if (rl && rl.t) {
        const v = rl.t(key);
        if (typeof v === "string" && v && v !== key) return v;
      }
    } catch (_) {}
    return fb;
  }

  async function idToken() {
    try {
      const auth = window.AuroraFirebase && window.AuroraFirebase.getAuth();
      if (auth && auth.currentUser) return await auth.currentUser.getIdToken();
    } catch (_) {}
    return "";
  }

  async function api(path, opts) {
    opts = opts || {};
    const token = await idToken();
    const headers = Object.assign({}, opts.headers || {}, token ? { Authorization: `Bearer ${token}` } : {});
    const res = await fetch(BASE + path, Object.assign({}, opts, { headers }));
    if (!res.ok) {
      let msg = "HTTP " + res.status;
      try { msg = (await res.json()).error || msg; } catch (_) {}
      throw new Error(msg);
    }
    return res.json();
  }

  const SIG = {
    ok: ["ELIGIBLE", "SHORTLISTED", "SELECTED", "PILOT", "READY", "COMPLETED", "SUCCESSFUL", "ACTIVE", "APPROVED", "PUBLISHED", "CLOSED", "GOOD", "PASS", "STABLE", "LIVE"],
    warn: ["AT_RISK", "READY_WITH_CONDITIONS", "PENDING", "PENDING_REVIEW", "UNDER_REVIEW", "PAUSED", "VALIDATING", "REVIEW", "SUBMITTED", "IN_REVIEW", "WATCH", "STALLED"],
    bad: ["CRITICAL", "REJECTED", "INELIGIBLE", "NOT_READY", "FAILED", "FAILURE", "BLOCKED", "ARCHIVED", "DISMISSED"],
  };
  const sig = (s) => {
    const v = String(s || "").toUpperCase().replace(/_/g, "_");
    if (SIG.ok.includes(v)) return "ok";
    if (SIG.warn.includes(v) || /^PENDING/.test(v)) return "warn";
    if (SIG.bad.includes(v)) return "bad";
    return "info";
  };
  const badge = (s) => `<span class="gcc-badge gcc-badge-${sig(s)}">${esc(s || "\u2014")}</span>`;

  function fmtDate(v) {
    if (!v) return "\u2014";
    const d = new Date(v);
    if (isNaN(d)) return esc(v);
    return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  const startupName = (s) => (s ? s.brandName || s.legalName || s.id : "\u2014");
  const startupMeta = (s) => (s ? [s.sector, s.state, s.location].filter(Boolean).join(" \u00b7 ") : "");
  const head = (title, sub) =>
    `<div class="gcc-section-head"><div><h2 class="gcc-section-title">${title}</h2>${sub ? `<p class="gcc-section-sub">${sub}</p>` : ""}</div></div>`;
  const empty = (msg) => `<div class="gcc-empty">${msg}</div>`;

  function section(id, title, sub, body) {
    return `<section class="gcc-section" id="gcc-${id}">${head(title, sub)}${body}</section>`;
  }

  /* ───────────────────────── tables ───────────────────────── */
  function cellContent(c) {
    if (c && typeof c === "object" && "html" in c) {
      const sortVal = c.sort != null ? c.sort : String(c.html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      return { html: c.html, sort: sortVal };
    }
    return { html: esc(c == null ? "" : c), sort: c == null ? "" : String(c) };
  }

  function dataTable(cols, rows) {
    if (!rows.length) return empty("No records to display yet.");
    const thead = cols.map((c) => `<th data-k="${esc(c.key)}" class="gcc-th">${esc(c.label)}</th>`).join("");
    const tbody = rows
      .map((r) => `<tr data-fuse="${esc(r.fuse || "")}">${cols.map((c) => { const cell = cellContent(r && r[c.key]); return `<td data-v="${esc(cell.sort)}">${cell.html}</td>`; }).join("")}</tr>`)
      .join("");
    return `<div class="gcc-table-wrap"><table class="gcc-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
  }

  let sortState = {};
  function attachSorters(root) {
    root.querySelectorAll("th[data-k]").forEach((th) => {
      th.addEventListener("click", () => {
        const table = th.closest("table");
        const k = th.dataset.k;
        const dir = sortState[k] === "asc" ? "desc" : "asc";
        sortState = {};
        sortState[k] = dir;
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));
        rows.sort((a, b) => {
          const av = a.cells[th.cellIndex].dataset.v || "";
          const bv = b.cells[th.cellIndex].dataset.v || "";
          const an = Number(av), bn = Number(bv);
          const cmp = !isNaN(an) && !isNaN(bn) && av.trim() !== "" && bv.trim() !== "" ? an - bn : String(av).localeCompare(String(bv));
          return dir === "asc" ? cmp : -cmp;
        });
        rows.forEach((r) => tbody.appendChild(r));
        table.querySelectorAll("th").forEach((h) => h.classList.remove("gcc-sorted", "gcc-sorted-asc", "gcc-sorted-desc"));
        th.classList.add("gcc-sorted", dir === "asc" ? "gcc-sorted-asc" : "gcc-sorted-desc");
      });
    });
  }

  function fuse(inputEl) {
    if (!inputEl) return;
    const q = (inputEl.value || "").toString().toLowerCase();
    const section = inputEl.closest(".gcc-section");
    if (!section) return;
    const rows = section.querySelectorAll("tr[data-fuse]");
    rows.forEach((tr) => { tr.classList.toggle("hidden", !!(q && !(tr.dataset.fuse || "").toLowerCase().includes(q))); });
  }

  /* ═════════════════════ renderer ═════════════════════ */
  function renderBody(root, data) {
    const o = data.organization || {};
    const pipeline = data.pipeline || [];
    const kpis = data.kpis || [];
    const problems = data.problems || [];
    const challenges = data.challenges || [];
    const apps = data.applications || [];
    const matches = data.matches || [];
    const eligibility = data.eligibility || [];
    const decisions = data.decisions || [];
    const pilots = data.pilots || [];
    const readinessRows = pilots.filter((p) => p.result || p.readiness);
    const procurement = data.procurement || {};
    const insights = data.insights || [];
    const actions = data.actions || [];

    let ats = "";
    for (const k of ["gcc-header", "gcc-exec", "gcc-pipeline", "gcc-portfolio", "gcc-urgency", "gcc-discovery", "gcc-evaluation", "gcc-compliance", "gcc-pilots", "gcc-performance", "gcc-outcome", "gcc-readiness", "gcc-decision", "gcc-insights", "gcc-actions"]) ats += `<button class="gcc-jump" data-goto-section="${k}">${k.replace("gcc-", "").toUpperCase()}</button>`;
    const jumpBar = `<div class="gcc-jumpbar">${ats}</div>`;
    const quickBar = `<section class="gcc-section" id="gcc-quick">
      <div class="gcc-jumpbar-head">
        <div><div class="gcc-eyebrow">QUICK ACTIONS</div><div class="gcc-cell-sub">Every button opens a live Government workspace \u2014 no dead ends.</div></div>
      </div>
      <div class="gcc-quickbar">
        <button type="button" class="btn btn-primary" data-gcc-go="create">Create Government Problem</button>
        <button type="button" class="btn btn-secondary" data-gcc-go="search">Search Problems</button>
        <button type="button" class="btn btn-secondary" data-gcc-go="find">Find Solutions</button>
        <button type="button" class="btn btn-secondary" data-gcc-go="applications">Review Applications</button>
        <button type="button" class="btn btn-secondary" data-gcc-go="pilots">Create / Review Pilots</button>
        <button type="button" class="btn btn-secondary" data-gcc-go="ready">Review Procurement Ready</button>
        <button type="button" class="btn btn-secondary" data-gcc-go="decisions">Pending Decisions</button>
      </div>
    </section>`;

    /* ── exec KPI cards ── */
    const KPI_INTENT = {
      activeProblems: "search", solutionsReceived: "find", eligibleSolutions: "find",
      activePilots: "pilots", completedPilots: "pilots", procurementReady: "ready",
      pendingDecisions: "decisions", estimatedValue: "decide",
    };
    const kpiCards = kpis
      .map((k) => {
        const intent = KPI_INTENT[k.key] || "search";
        return `<div class="gcc-kpi gcc-kpi-clickable" data-gcc-kpi="${esc(intent)}" title="Open ${esc(k.label)} in the Problem Workspace" role="button" tabindex="0"><div class="gcc-kpi-value">${k.valueKind === "money" ? money(k.value) : num(k.value)}</div><div class="gcc-kpi-label">${esc(k.label)}</div></div>`;
      })
      .join("");

    /* ── pipeline stepper ── */
    const maxCount = Math.max(1, ...pipeline.map((p) => p.count || 0));
    const pipeCells = pipeline
      .map((p, i) => {
        const pct = Math.round(((p.count || 0) / maxCount) * 100);
        return `<div class="gcc-stage">
          <div class="gcc-stage-dot${p.count ? " gcc-stage-dot-live" : ""}">${esc(p.count || 0)}</div>
          <div class="gcc-stage-bar"><div class="gcc-stage-fill" style="width:${pct}%"></div></div>
          <div class="gcc-stage-label">${esc(p.label)}</div>
          ${i < pipeline.length - 1 ? '<div class="gcc-stage-connector"></div>' : ""}
        </div>`;
      })
      .join("");

    /* ── urgency ranking (derived from live pipeline state only) ── */
    const problemState = (p) => {
      const myCh = challenges.filter((c) => c.problemId === p.id);
      const chApps = myCh.reduce((s, c) => s + (c.applicationCount || 0), 0);
      const chElig = myCh.reduce((s, c) => s + (c.eligibleCount || 0), 0);
      const chPilots = pilots.filter((pl) => pl.problem && pl.problem.id === p.id);
      if (!myCh.length) return { urgency: "HIGH", reason: "No challenge has been published for this problem yet", action: "Publish a Challenge derived from this problem" };
      if (!chApps) return { urgency: "HIGH", reason: "Challenge is live but no solutions have been submitted", action: "Review challenge reachability / evaluation criteria" };
      if (!chElig) return { urgency: "MEDIUM", reason: "Solutions submitted but none found eligible yet", action: "Run eligibility screening on received solutions" };
      const running = chPilots.filter((pl) => pl.status === "RUNNING");
      if (running.length) return { urgency: "LOW", reason: running.length + " pilot(s) running on real evidence", action: "Monitor pilot KPIs until completion" };
      const ready = chPilots.filter((pl) => pl.readiness && (pl.readiness.status === "READY" || pl.readiness.status === "READY_WITH_CONDITIONS"));
      if (ready.length) return { urgency: "HIGH", reason: ready.length + " solution(s) reach procurement readiness", action: "Schedule a Government decision on the evidence" };
      return { urgency: "LOW", reason: "Pilot evidence is still being collected", action: "Continue the pilot lifecycle" };
    };
    const urgencyRows = problems
      .map((p) => {
        const st = problemState(p);
        return {
          title: { html: `<strong>${esc(p.title)}</strong><div class="gcc-cell-sub">${esc(p.sector || "")} ${p.challengeCount ? "\u00b7 " + p.challengeCount + " challenge(s)" : ""}</div>` },
          reason: st.reason,
          impact: money(p.estimatedBudget),
          urgency: st.urgency,
          status: p.status,
          action: st.action,
          fuse: [p.title, p.sector, st.reason, st.action].join(" "),
        };
      })
      .sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 }[b.urgency] - { HIGH: 0, MEDIUM: 1, LOW: 2 }[a.urgency]));

    /* ── discovery: ranked matches + eligibility gate ── */
    const matchRows = matches.slice(0, 12).map((m) => ({
      solution: { html: `<strong>${esc(startupName(m.startup))}</strong><div class="gcc-cell-sub">${esc(startupMeta(m.startup))}</div>` },
      challenge: m.challengeTitle,
      overallScore: { html: `<span class="gcc-score">${esc(num(m.overallScore))}</span>`, sort: Number(m.overallScore) || 0 },
      why: esc(m.explanation || "\u2014"),
      fuse: [startupName(m.startup), m.challengeTitle, m.explanation].join(" "),
    }));

    const eligRows = eligibility.map((e) => ({
      solution: { html: `<strong>${esc(startupName(e.startup))}</strong><div class="gcc-cell-sub">${esc(startupMeta(e.startup))}</div>` },
      challenge: e.challengeTitle,
      verdict: badge(e.verdict),
      percent: { html: `<div class="gcc-progress"><div class="gcc-progress-fill ${e.verdict === "ELIGIBLE" || e.verdict === "DEFINITELY_ELIGIBLE" ? "ok" : "warn"}" style="width:${Math.min(100, Number(e.percent) || 0)}%"></div></div><span class="gcc-pct">${esc(num(e.percent))}%</span>`, sort: Number(e.percent) || 0 },
      evaluatedAt: fmtDate(e.evaluatedAt),
      fuse: [startupName(e.startup), e.challengeTitle, e.verdict].join(" "),
    }));

    /* ── evaluation readouts ── */
    const evalRows = (data.evaluations || []).map((e) => ({
      solution: e.startup ? { html: `<strong>${esc(startupName(e.startup))}</strong>` } : (e.startupId || e.id),
      challenge: e.challengeId || "",
      status: badge(e.status || "DRAFT"),
      totalScore: { html: esc(num(e.totalScore != null ? e.totalScore : e.weightedTotal)), sort: Number(e.totalScore != null ? e.totalScore : e.weightedTotal) || 0 },
      updatedAt: fmtDate(e.updatedAt || e.createdAt),
      fuse: [e.startupId, e.challengeId, e.status].join(" "),
    }));
    const aggRows = (data.aggregations || []).map((a) => ({
      challenge: a.challengeId || "",
      summary: a.summary || a.summaryJson ? esc(typeof a.summary === "string" ? a.summary : JSON.stringify(a.summaryJson || a.summary || {})) : "\u2014",
      generatedAt: fmtDate(a.generatedAt || a.updatedAt || a.createdAt),
      fuse: [a.challengeId, a.summary].join(" "),
    }));

    /* ── compliance & risk ── */
    const compRows = pilots.map((p) => ({
      pilot: esc(p.title),
      compliance: {
        html: `<div class="gcc-inline">${badge(p.compliance ? p.compliance.overall : "\u2014")}</div><div class="gcc-cell-sub">${p.compliance ? p.compliance.satisfied + " / " + p.compliance.total + " criteria satisfied" : "No compliance readout"}</div>`,
      },
      risk: {
        html: `${p.risks && p.risks.riskCount ? `<span class="gcc-badge gcc-badge-${p.risks.criticalHigh ? "bad" : "warn"}">${p.risks.riskCount} risk(s)</span><div class="gcc-cell-sub">${p.risks.criticalHigh ? p.risks.criticalHigh + " critical/high" : "None critical"}</div>` : "\u2014"}`,
      },
      riskLevel: badge((p.readiness && p.readiness.riskLevel) || "\u2014"),
      fuse: [p.title, p.compliance && p.compliance.overall, (p.readiness && p.readiness.riskLevel) || ""].join(" "),
    }));

    /* ── active pilots ── */
    const pilotStatus = (p) => (p.status === "RUNNING" || p.status === "COMPLETED" ? p.status : p.status || "PLANNED");
    const pilotRows = pilots.map((p) => ({
      pilot: { html: `<strong>${esc(p.title)}</strong><div class="gcc-cell-sub">${esc(p.challenge ? p.challenge.title : "")}</div>` },
      solution: startupName(p.startup),
      status: badge(pilotStatus(p)),
      health: badge(p.health || "GOOD"),
      overallScore: { html: esc(num(p.overallScore)), sort: Number(p.overallScore) || 0 },
      target: { html: `<span class="gcc-score">${esc(num(p.targetAchievement))}%</span><div class="gcc-progress gcc-progress-sm"><div class="gcc-progress-fill ok" style="width:${Math.min(100, Number(p.targetAchievement) || 0)}%"></div></div>`, sort: Number(p.targetAchievement) || 0 },
      budget: { html: esc(money(p.budget, p.currency)), sort: Number(p.budget) || 0 },
      fuse: [p.title, startupName(p.startup), p.status, p.health].join(" "),
    }));

    /* ── pilot performance KPIs ── */
    const perfRows = [];
    pilots.forEach((p) => {
      const base = { pilot: esc(p.title), trend: badge(p.trend || "STABLE") };
      if (p.kpis && p.kpis.length) {
        p.kpis.slice(0, 4).forEach((k) => perfRows.push(Object.assign({}, base, {
          metric: esc(k.name || "KPI"),
          actual: `${esc(num(k.actualValue))}${k.unit ? esc(" " + k.unit) : ""}`,
          target: `${esc(num(k.targetValue))}${k.unit ? esc(" " + k.unit) : ""}`,
          achievement: { html: `<span class="gcc-score">${esc(num(k.achievementPct))}%</span><div class="gcc-progress gcc-progress-sm"><div class="gcc-progress-fill ${Number(k.achievementPct) >= 80 ? "ok" : "warn"}" style="width:${Math.min(100, Number(k.achievementPct) || 0)}%"></div></div>`, sort: Number(k.achievementPct) || 0 },
          fuse: [p.title, k.name].join(" "),
        })));
      } else {
        perfRows.push(Object.assign({}, base, {
          metric: "No KPI logged",
          actual: "\u2014", target: "\u2014",
          achievement: { html: `<span class="gcc-badge gcc-badge-info">no KPI</span>`, sort: -1 },
          fuse: p.title,
        }));
      }
    });

    /* ── outcome & evidence ── */
    const outcomeRows = pilots.map((p) => ({
      pilot: esc(p.title),
      outcome: badge((p.outcome && p.outcome.outcome) || (p.result && p.result.result) || "IN_PROGRESS"),
      confidence: p.outcome && p.outcome.confidence != null ? `${num(p.outcome.confidence)}%` : "\u2014",
      reasoning: esc((p.outcome && p.outcome.reason) || (p.result && p.result.recommendationNotes) || "\u2014"),
      recommendation: badge((p.result && p.result.recommendation) || "\u2014"),
      fuse: [p.title, p.outcome && p.outcome.outcome, p.result && p.result.recommendation].join(" "),
    }));
    const evAfter = (data.evidence || []).slice(0, 12);
    let evidenceBlock = "";
    if (data.evidence && data.evidence.length) {
      evidenceBlock = `<ul class="gcc-ev-list">${evAfter.map((e) => `<li><span class="gcc-badge gcc-badge-info">${esc(e.documentType || "EVIDENCE")}</span> <span>${esc(e.title || e.fileName || e.documentType || "Evidence record")}</span><span class="gcc-ev-meta">${esc(e.status || "")}${e.verifiedAt ? " \u00b7 verified " + fmtDate(e.verifiedAt) : ""}</span></li>`).join("")}</ul>`;
    } else {
      evidenceBlock = empty("No evidence records linked to pilot results yet. Evidence appears here once pilot result documents are uploaded and verified.");
    }

    /* ── procurement readiness ── */
    const readyRows = pilots.map((p) => ({
      pilot: { html: `<strong>${esc(p.title)}</strong><div class="gcc-cell-sub">${esc(p.problem ? p.problem.title : "")}</div>` },
      readiness: badge((p.readiness && p.readiness.status) || "\u2014"),
      risk: badge((p.readiness && p.readiness.riskLevel) || "\u2014"),
      conditions: esc((p.readiness && p.readiness.conditions && p.readiness.conditions.join("; ")) || "\u2014"),
      evidence: p.result ? (p.result.kpiAchievement ? `${Object.keys(p.result.kpiAchievement).length} KPI(s) recorded` : "Result submitted") : "\u2014",
      fuse: [p.title, p.readiness && p.readiness.status, (p.readiness && p.readiness.conditions || []).join(" ")].join(" "),
    }));
    const scaleBlock = (procurement.scalePlans || []).length
      ? procurement.scalePlans.slice(0, 8).map((s) => `<li class="gcc-scale-item"><span>${esc(s.title)}</span> ${badge(s.status)} <span class="gcc-pct">${money(s.estimatedBudget)}</span></li>`).join("")
      : empty("No scale / procurement plans have been opened yet.");
    const assessBlock = (procurement.assessments || []).length
      ? (procurement.assessments || []).slice(0, 8).map((a) => `<li class="gcc-scale-item"><span>${esc(a.title || a.pilotProjectId || "Procurement assessment")}</span> ${badge(a.status || a.assessmentStatus || "DRAFT")}</li>`).join("")
      : empty("No procurement assessments recorded yet.");

    /* ── government decision ── */
    let decisionBlock = "";
    if (decisions.length) {
      decisionBlock = decisions.slice(0, 10).map((d) => `<div class="gcc-decision">
        <div class="gcc-decision-top">${badge(d.decisionType || d.status)} <span class="gcc-decision-t">${esc(d.challengeTitle || "")}</span></div>
        <div class="gcc-decision-sub"><strong>${esc(startupName(d.startup))}</strong> \u00b7 decided by ${esc(d.decidedBy || "\u2014")} \u00b7 ${fmtDate(d.createdAt)}</div>
        <div class="gcc-decision-verdict">${esc(d.decision || d.status || "\u2014")}</div>
        <div class="gcc-cell-sub">${esc(d.reason || "")}</div>
      </div>`).join("");
    } else {
      decisionBlock = empty("No formal Government decisions recorded yet. Completed, procurement-ready pilots appear here as pending decisions.");
    }

    /* ── insights & actions ── */
    const insightList = insights.length ? insights.map((i) => `<li class="gcc-insight">${esc(i)}</li>`).join("") : empty("No insights yet.");

    const order = { HIGH: 0, MEDIUM: 1, INFO: 2 };
    const actionIntent = (kind) => ({ DECISION: "decide", PILOT: "pilots", CONDITIONS: "ready", VALIDATION: "ready" }[kind] || "decide");
    const actionList = actions.length
      ? actions.slice().sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3)).map((a) => `<li class="gcc-action gcc-action-${String(a.priority).toLowerCase()}">
          <span class="gcc-action-pri">${esc(a.priority)}</span>
          <span class="gcc-action-k">${esc(a.kind || "ACTION")}</span>
          <div class="gcc-action-body"><strong>${esc(a.subject)}</strong> ${esc(a.text)}<div class="gcc-cell-sub">${esc(a.target || "")} &#8212; ${esc(a.recommendation || "")}</div></div>
          <button type="button" class="btn btn-secondary btn-sm gcc-action-go" data-gcc-go="${esc(actionIntent(a.kind))}">Open</button>
        </li>`).join("")
      : empty("No open actions. The portfolio is up to date.");

    const html = `
      ${jumpBar}
      ${quickBar}
      <section class="gcc-section" id="gcc-header">
        <div class="gcc-hero">
          <div>
            <div class="gcc-hero-eyebrow">REGULENS \u00b7 GOVERNMENT PROCUREMENT COMMAND CENTER</div>
            <h1 class="gcc-hero-title">${esc(o.name || "Government")}</h1>
            <p class="gcc-hero-sub">End-to-end oversight of the Innovation Procurement lifecycle \u2014 from problem to scale. All figures are computed from <strong>live records</strong>; nothing is estimated.</p>
          </div>
          <div class="gcc-hero-meta"><div class="gcc-pct">Last updated ${fmtDate(data.generatedAt || now())}</div><div class="gcc-pct">${kpis.length} KPIs \u00b7 ${pipeline.length} stages \u00b7 ${pilots.length} pilot(s)</div></div>
        </div>
      </section>

      <section class="gcc-section" id="gcc-exec">
        ${head("Executive Overview", "Portfolio-wide state of the procurement lifecycle")}
        <div class="gcc-kpi-grid">${kpiCards}</div>
      </section>

      <section class="gcc-section" id="gcc-pipeline">
        ${head("Procurement Pipeline", "Live counts per lifecycle stage \u2014 real records only")}
        <div class="gcc-pipeline">${pipeCells}</div>
      </section>

      <section class="gcc-section" id="gcc-portfolio">
        ${head("Problem Portfolio", "Government problems in scope")}
        <input class="input search-input gcc-search" placeholder="Filter problems\u2026" oninput="window.GCCFuse(this)">
        <div id="gcc-portfolio-table">${dataTable([
          { key: "title", label: "Problem" }, { key: "status", label: "Status" }, { key: "sector", label: "Sector" },
          { key: "budget", label: "Est. Budget" }, { key: "ch", label: "Challenges" }, { key: "created", label: "Raised" },
        ], problems.map((p) => ({
          title: { html: `<strong>${esc(p.title)}</strong>` }, status: badge(p.status), sector: esc(p.sector || "\u2014"),
          budget: money(p.estimatedBudget), ch: num(p.challengeCount), created: fmtDate(p.createdAt),
          fuse: [p.title, p.sector, p.status].join(" "),
        })))}</div>
      </section>

      <section class="gcc-section" id="gcc-urgency">
        ${head("Priority &amp; Urgency", "Attention ranking derived live from pipeline state \u2014 no separate scoring engine")}
        ${dataTable([
          { key: "title", label: "Problem" }, { key: "reason", label: "Reason" }, { key: "impact", label: "Impact (Est.)" },
          { key: "urgency", label: "Urgency" }, { key: "status", label: "Status" }, { key: "action", label: "Recommended Action" },
        ], urgencyRows)}
      </section>

      <section class="gcc-section" id="gcc-discovery">
        ${head("Solution Discovery &amp; Eligibility Gate", "Ranked matches with an enforced eligibility gate \u2014 only eligible solutions proceed")}
        <div class="gcc-grid-2">
          <div class="gcc-panel"><h3 class="gcc-panel-title">Ranked Solution Matches</h3>${matches.length ? dataTable([
            { key: "solution", label: "Solution" }, { key: "challenge", label: "Challenge" }, { key: "overallScore", label: "Score" }, { key: "why", label: "Why recommended" },
          ], matchRows) : empty("No matches computed yet. Matches appear once eligibility and AI-assisted matching run on submitted solutions.")}</div>
          <div class="gcc-panel"><h3 class="gcc-panel-title">Eligibility Screening (Gate)</h3>${eligibility.length ? dataTable([
            { key: "solution", label: "Solution" }, { key: "challenge", label: "Challenge" }, { key: "verdict", label: "Verdict" }, { key: "percent", label: "Pass %" }, { key: "evaluatedAt", label: "Evaluated" },
          ], eligRows) : empty("No eligibility screenings yet. Screening appears here once solutions are submitted to a challenge.")}</div>
        </div>
      </section>

      <section class="gcc-section" id="gcc-evaluation">
        ${head("Solution Evaluation &amp; Aggregation", data.evaluations.length ? data.evaluations.length + " evaluation record(s) across challenges" : "Evaluation readouts from government evaluators")}
        <div class="gcc-grid-2">
          <div class="gcc-panel"><h3 class="gcc-panel-title">Evaluation Readouts</h3>${evalRows.length ? dataTable([
            { key: "solution", label: "Solution" }, { key: "challenge", label: "Challenge" }, { key: "status", label: "Status" }, { key: "totalScore", label: "Score" }, { key: "updatedAt", label: "Updated" },
          ], evalRows) : empty("No evaluation records yet.")}</div>
          <div class="gcc-panel"><h3 class="gcc-panel-title">Aggregated Readiness</h3>${aggRows.length ? dataTable([
            { key: "challenge", label: "Challenge" }, { key: "summary", label: "Aggregation" }, { key: "generatedAt", label: "Generated" },
          ], aggRows) : empty("No evaluation aggregations yet.")}</div>
        </div>
      </section>

      <section class="gcc-section" id="gcc-compliance">
        ${head("Compliance &amp; Risk", "Documented compliance status and risk readouts per pilot")}
        ${compRows.length ? dataTable([
          { key: "pilot", label: "Pilot" }, { key: "compliance", label: "Compliance" }, { key: "risk", label: "Risk" }, { key: "riskLevel", label: "Risk Level" },
        ], compRows) : empty("No pilots yet \u2014 compliance and risk readouts appear once pilots launch.")}
      </section>

      <section class="gcc-section" id="gcc-pilots">
        ${head("Active Pilots", "Autonomy level: human \u2014 every pilot decision stays with Government officers")}
        ${pilots.length ? dataTable([
          { key: "pilot", label: "Pilot" }, { key: "solution", label: "Solution" }, { key: "status", label: "Status" }, { key: "health", label: "Health" },
          { key: "overallScore", label: "Score" }, { key: "target", label: "Target Achievement" }, { key: "budget", label: "Budget" },
        ], pilotRows) : empty("No pilots launched yet. Pilots appear here once a pilot project is approved.")}
      </section>

      <section class="gcc-section" id="gcc-performance">
        ${head("Pilot Performance", "Measured against logged KPI targets")}
        ${perfRows.length ? dataTable([
          { key: "pilot", label: "Pilot" }, { key: "metric", label: "KPI" }, { key: "actual", label: "Actual" }, { key: "target", label: "Target" },
          { key: "achievement", label: "Achievement" }, { key: "trend", label: "Trend" },
        ], perfRows) : empty("No performance data yet.")}
      </section>

      <section class="gcc-section" id="gcc-outcome">
        ${head("Pilot Outcome &amp; Evidence", "AI assistance is advisory only \u2014 the Government decides")}
        <div class="gcc-grid-2">
          <div class="gcc-panel"><h3 class="gcc-panel-title">Outcomes &amp; Recommendations</h3>${outcomeRows.length ? dataTable([
            { key: "pilot", label: "Pilot" }, { key: "outcome", label: "Outcome" }, { key: "confidence", label: "Confidence" }, { key: "reasoning", label: "Reasoning" }, { key: "recommendation", label: "AI Recommendation" },
          ], outcomeRows) : empty("No pilot outcomes yet.")}</div>
          <div class="gcc-panel"><h3 class="gcc-panel-title">Evidence Linked to Results</h3>${evidenceBlock}</div>
        </div>
      </section>

      <section class="gcc-section" id="gcc-readiness">
        ${head("Procurement Readiness", "Gateway to Government Decision \u2014 status, risk and conditions")}
        ${readyRows.length ? dataTable([
          { key: "pilot", label: "Pilot / Solution" }, { key: "readiness", label: "Readiness" }, { key: "risk", label: "Risk" },
          { key: "conditions", label: "Conditions" }, { key: "evidence", label: "Evidence" },
        ], readyRows) : empty("No procurement-readiness readouts yet.")}
        <div class="gcc-grid-2">
          <div class="gcc-panel"><h3 class="gcc-panel-title">Scale &amp; Deployment Plans</h3>${scaleBlock}</div>
          <div class="gcc-panel"><h3 class="gcc-panel-title">Procurement Assessments</h3>${assessBlock}</div>
        </div>
      </section>

      <section class="gcc-section" id="gcc-decision">
        ${head("Government Decision", "Human decision layer \u2014 AI never approves, Government always decides")}
        ${decisionBlock}
      </section>

      <section class="gcc-section" id="gcc-insights">
        ${head("AI Insights", "Deterministic observations computed from live data \u2014 advisory, not prescriptive")}
        <ul class="gcc-insights">${insightList}</ul>
      </section>

      <section class="gcc-section" id="gcc-actions">
        ${head("Required Actions", "Prioritised next steps for the Government team")}
        <ul class="gcc-actions">${actionList}</ul>
      </section>
    `;

    root.innerHTML = html;
    attachAll(root);
  }

  function attachAll(root) {
    root.querySelectorAll("[data-goto-section]").forEach((b) => {
      b.addEventListener("click", () => {
        const el = document.getElementById(b.dataset.gotoSection);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    root.querySelectorAll("table.gcc-table").forEach((tb) => attachSorters(tb));

    const stageMap = {
      problem: "gcc-portfolio", discovery: "gcc-discovery", eligible: "gcc-discovery", eligibility: "gcc-discovery",
      evaluation: "gcc-evaluation", pilot: "gcc-pilots", validation: "gcc-outcome",
      readiness: "gcc-readiness", decision: "gcc-decision", scale: "gcc-readiness", outcome: "gcc-outcome",
    };
    root.querySelectorAll(".gcc-stage").forEach((cell) => {
      cell.addEventListener("click", () => {
        const label = ((cell.querySelector(".gcc-stage-label") || {}).textContent || "").toLowerCase();
        const key = Object.keys(stageMap).find((k) => label.indexOf(k) !== -1);
        const target = stageMap[key] || "gcc-portfolio";
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    root.querySelectorAll("[data-gcc-go]").forEach((b) => {
      b.addEventListener("click", () => goIntent(b.dataset.gccGo));
    });
    root.querySelectorAll("[data-gcc-kpi]").forEach((b) => {
      const go = () => goIntent(b.dataset.gccKpi);
      b.addEventListener("click", go);
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
  }

  function goIntent(intent) {
    const navigate = window.ReguLens && typeof window.ReguLens.navigate === "function" ? window.ReguLens.navigate.bind(window.ReguLens) : null;
    if (!navigate) return;
    navigate("gov-workflow");
    const wf = window.GovWorkflow;
    if (wf && typeof wf.intent === "function") setTimeout(() => wf.intent(intent), 60);
  }

  function showState(root, kind, message, detail, actionsHtml) {
    const icon = kind === "loading" ? '<div class="gcc-spinner"></div>' : kind === "error" ? '<div class="gcc-empty-icon">&#9888;</div>' : '<div class="gcc-empty-icon">&#9889;</div>';
    root.innerHTML = `<div class="gcc-state gcc-state-${kind}">${icon}<div class="gcc-state-msg">${esc(message)}</div>${detail ? `<div class="gcc-cell-sub">${esc(detail)}</div>` : ""}${actionsHtml || ""}</div>`;
  }

  let lastOrg = "";

  async function load(root, orgId) {
    showState(root, "loading", "Loading the Government Procurement Command Center\u2026", "Reading live records from the SIH data layer.");
    const slot = $("#gccOrg", root) || null;
    try {
      const data = await api("/overview?organizationId=" + encodeURIComponent(orgId));
      renderBody(root, data);
      if (slot) slot.value = orgId;
      lastOrg = orgId;
    } catch (err) {
      showState(
        root, "error", "Could not load the command center.",
        "Detail: " + (err && err.message ? err.message : "network error"),
        '<button type="button" class="btn btn-primary" id="gccRetry">Refresh</button>'
      );
      const r = $("#gccRetry", root);
      if (r) r.addEventListener("click", () => load(root, orgId));
    }
  }

  function selectOrg(root) {
    const sel = $("#gccOrg", root);
    if (!sel) return;
    sel.addEventListener("change", () => {
      const id = sel.value;
      try { localStorage.setItem(KEY_ORG, id); } catch (_) {}
      load(root, id);
    });
  }

  async function render() {
    const view = document.getElementById("view-gov-command");
    if (!view) return;
    const body = document.getElementById("govCommandBody");
    if (!body) return;

    showState(body, "loading", "Connecting to the SIH data layer\u2026");

    const saved = (() => { try { return localStorage.getItem(KEY_ORG) || ""; } catch (_) { return ""; } })();

    const auth = window.AuroraFirebase && window.AuroraFirebase.getAuth();
    if (!auth || !auth.currentUser) {
      showState(body, "error", "Could not load organizations.", "Detail: Not signed in");
      return;
    }

    let orgs = [];
    try {
      const r = await api("/organizations");
      orgs = r.organizations || [];
    } catch (err) {
      showState(body, "error", "Could not load organizations.", "Detail: " + (err && err.message ? err.message : "network error"));
      return;
    }

    if (!orgs.length) {
      showState(body, "empty", "No Government organization is linked to this account yet.", "Register a Government organization to use the Command Center.");
      return;
    }

    const chosen = orgs.find((o) => o.id === saved && o.orgType === "GOVERNMENT") || orgs.find((o) => o.orgType === "GOVERNMENT") || orgs[0];

    body.innerHTML = `<div class="gcc-toolbar">
      <div class="gcc-brand"><span class="gcc-brand-mark">RL</span> <span>Gov Procurement Command Center</span></div>
      <div class="gcc-toolbar-right">
        <label class="gcc-org-label" for="gccOrg">Organization</label>
        <select class="select" id="gccOrg">${orgs.map((o) => `<option value="${esc(o.id)}">${esc(o.name)}</option>`).join("")}</select>
        <button type="button" class="btn btn-primary btn-sm" data-gcc-refresh>Refresh</button>
        <button type="button" class="btn btn-secondary btn-sm" data-gcc-goto="sih-procurement">Open Procurement Workspace</button>
      </div>
    </div>
    <div id="gccBodySlug"></div>`;

    const slug = $("#gccBodySlug", body);
    const orgSel = $("#gccOrg", body);
    if (orgSel) orgSel.value = chosen.id;
    const refreshBtn = $("[data-gcc-refresh]", body);
    if (refreshBtn) refreshBtn.addEventListener("click", () => { const s = $("#gccOrg", body); load(slug, s ? s.value : lastOrg); });
    const go = $("[data-gcc-goto]", body);
    if (go && window.ReguLens && window.ReguLens.navigate) {
      go.addEventListener("click", () => { try { window.ReguLens.navigate("sih-procurement"); } catch (_) {} });
    }
    selectOrg(body);
    await load(slug, chosen.id);
  }

  window.GCCFuse = fuse;
  window.GovCommand = { render };
})();