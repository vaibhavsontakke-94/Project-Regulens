/* ═══════════════════════════════════════════════════════════════
   REGULENS — Government Solution Discovery & Procurement Workflow
   End-to-end problem intelligence workspace. Every action below
   drives the REAL SIH engines and persists live records:
     search → problem detail → find solutions → eligibility gate →
     ranked solutions → solution detail → compare → evaluation →
     compliance/risk → pilot → performance → analysis → readiness →
     government decision → dashboard reflects.
   AI is always advisory. Decisions always belong to Government.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const BASE = "/api/sih";
  const KEY_ORG = "gcc.selectedOrg";
  const KEY_PROBLEM = "gwf.selectedProblem";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (v) =>
    String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const now = () => new Date().toISOString();

  const FMT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  const MONEY = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const money = (v) => (v == null ? "\u2014" : MONEY.format(Number(v || 0)));
  const num = (v) => (v == null ? "\u2014" : FMT.format(Number(v || 0)));

  const state = { orgId: "", overview: null, problem: null, active: null, problemIndex: null };

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
    let body = opts.body;
    if (body && typeof body === "object") { headers["Content-Type"] = "application/json"; body = JSON.stringify(body); }
    const res = await fetch(BASE + path, Object.assign({}, opts, { headers, body }));
    if (!res.ok) {
      let msg = "HTTP " + res.status;
      try { msg = (await res.json()).error || msg; } catch (_) {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  const SIG = {
    ok: ["ELIGIBLE", "DEFINITELY_ELIGIBLE", "SHORTLISTED", "SELECTED", "PILOT", "READY", "COMPLETED", "SUCCESSFUL", "ACTIVE", "APPROVED", "PUBLISHED", "RANKED", "RUNNING", "PILOT_RUNNING", "SCALE", "GOOD", "LOW", "OPEN", "SUBMITTED"],
    warn: ["RANKED_CONDITIONAL", "READY_WITH_CONDITIONS", "PENDING", "PENDING_REVIEW", "UNDER_REVIEW", "REVIEW_POOL", "PARTIALLY_SUCCESSFUL", "INCONCLUSIVE", "CONDITIONAL_SCALE", "MEDIUM", "EVALUATING", "EVALUATION", "APPLICATIONS_OPEN", "PILOT_SELECTION", "REVIEW"],
    bad: ["CRITICAL", "REJECTED", "INELIGIBLE", "NOT_ELIGIBLE", "NOT_READY", "FAILED", "BLOCKED", "STOP", "DISMISSED", "HIGH", "DO_NOT_PROCEED", "CANCELLED"],
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
  const STATE = { ok: "ok", warn: "warn", bad: "bad", info: "info" };

  /* ───────────── view-model (single source of truth: /overview) ───────────── */
  function vm() {
    const o = state.overview || {};
    const problem = state.problem;
    const pid = problem ? problem.id : "";
    const ch = (o.challenges || []).filter((c) => c.problemId === pid);
    const chIds = new Set(ch.map((c) => c.id));
    const apps = (o.applications || []).filter((a) => chIds.has(a.challengeId));
    const matches = (o.matches || []).filter((m) => chIds.has(m.challengeId));
    const eligibility = (o.eligibility || []).filter((e) => chIds.has(e.challengeId));
    const evaluations = (o.evaluations || []).filter((e) => chIds.has(e.challengeId));
    const aggregations = (o.aggregations || []).filter((a) => chIds.has(a.challengeId));
    const decisions = (o.decisions || []).filter((d) => chIds.has(d.challengeId));
    const pilots = (o.pilots || []).filter((p) => (p.problem && p.problem.id === pid) || chIds.has(p.challengeId));
    const assessments = ((o.procurement && o.procurement.assessments) || []).filter((a) => chIds.has(a.challengeId) || pilots.some((pl) => pl.id === a.pilotProjectId));
    const scalePlans = ((o.procurement && o.procurement.scalePlans) || []).filter((s) => pilots.some((pl) => pl.id === s.pilotProjectId));
    return { problem, problems: (o.problems || []), challenges: ch, applications: apps, matches, eligibility, evaluations, aggregations, decisions, pilots, assessments, scalePlans };
  }

  function primaryChallenge(v) {
    if (!v.challenges.length) return null;
    const order = { EVALUATION: 0, PILOT_SELECTION: 1, APPLICATIONS_OPEN: 1, PUBLISHED: 2, APPROVED: 2, REVIEW: 3, PILOT_RUNNING: 4, COMPLETED: 5 };
    return v.challenges.slice().sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))[0];
  }

  const candidateSet = (v, challengeId) => {
    const seen = new Set();
    const out = [];
    const appRows = v.applications.filter((a) => a.challengeId === challengeId);
    appRows.forEach((a) => {
      const s = a.startup || {};
      if (!seen.has(s.id)) { seen.add(s.id); out.push(s); }
    });
    v.eligibility.filter((e) => e.challengeId === challengeId).forEach((e) => {
      const s = e.startup || {};
      if (s.id && !seen.has(s.id)) { seen.add(s.id); out.push(s); }
    });
    v.matches.filter((m) => m.challengeId === challengeId).forEach((m) => {
      const s = m.startup || {};
      if (s.id && !seen.has(s.id)) { seen.add(s.id); out.push(s); }
    });
    return out;
  };

  /* ───────────── orchestrators (each drives the REAL engines) ───────────── */
  async function runFindSolutions() {
    const v = vm();
    const log = [];
    let ran = 0;
    for (const challenge of v.challenges) {
      const label = challenge.title || challenge.id;
      let rules = [];
      try { rules = (await api("/eligibility/rules?challengeId=" + encodeURIComponent(challenge.id) + "&active=true")).rules || []; }
      catch (err) { log.push({ state: STATE.bad, text: challenge.id + ": failed to read eligibility rules \u2014 " + err.message }); continue; }
      if (!rules.length) {
        log.push({ state: STATE.warn, text: `${label}: no ACTIVE eligibility rules yet. Find-Solutions is gated by eligibility \u2014 open the Eligibility workspace and define + activate rules for this challenge first.` });
        continue;
      }
      const candidates = candidateSet(v, challenge.id);
      if (!candidates.length) {
        log.push({ state: STATE.warn, text: `${label}: no solutions submitted yet. Find-Solutions ranks the solutions that have registered against this challenge.` });
        continue;
      }
      let screened = 0, screenedOk = 0;
      for (const s of candidates) {
        const existing = v.eligibility.find((e) => e.challengeId === challenge.id && e.startup && e.startup.id === s.id);
        if (existing) { screenedOk++; continue; }
        try {
          await api("/eligibility/check/advanced", { method: "POST", body: { challengeId: challenge.id, startupId: s.id } });
          screenedOk++;
        } catch (err) {
          log.push({ state: STATE.warn, text: `${startupName(s)}: eligibility screen skipped \u2014 ${err.message}` });
        }
        screened++;
      }
      let matching = null;
      try {
        matching = await api("/challenges/" + challenge.id + "/matching/run", { method: "POST", body: {} });
      } catch (err) {
        log.push({ state: STATE.bad, text: `${label}: matching run failed \u2014 ${err.message}` });
        continue;
      }
      ran++;
      let ranked = 0;
      try {
        const res = await api("/challenges/" + challenge.id + "/matching/results");
        for (const r of (res.results || [])) {
          const sid = r.startupId || (r.startup && r.startup.id);
          if (!sid) continue;
          await api("/challenges/" + challenge.id + "/matches", {
            method: "POST",
            body: {
              startupId: sid,
              overallScore: Math.round((Number(r.matchScore) || 0) * 10000) / 100,
              explanation: r.matchExplanation || r.explanation || "Deterministic matching engine result",
              modelVersion: "deterministic-token-v1",
            },
          });
          ranked++;
        }
      } catch (err) {
        log.push({ state: STATE.warn, text: `${label}: engine results recorded but dashboard sync partially failed \u2014 ${err.message}` });
      }
      log.push({
        state: STATE.ok,
        text: `${label}: eligibility screened ${screened} new candidate(s), ${screenedOk} retained; matching run completed with pool ${matching.pool ? (matching.pool.eligibleCount + " eligible of " + matching.pool.total) : "results"} (${ranked} result(s) synced to the Command Center).`,
      });
    }
    if (!ran && !log.length) log.push({ state: STATE.info, text: "This problem has no published challenge yet. Publish a challenge to start discovery." });
    await refreshOverview();
    return log;
  }

  const DEFAULT_CRITERIA = [
    { key: "problem-fit", label: "Problem-Solution Fit", weight: 25, maxScore: 100, minimumScore: 50, mandatory: true, evidenceRequired: true },
    { key: "technical", label: "Technical Approach", weight: 25, maxScore: 100, minimumScore: 40, mandatory: true, evidenceRequired: false },
    { key: "execution", label: "Execution & Delivery", weight: 20, maxScore: 100, minimumScore: 40, mandatory: false, evidenceRequired: false },
    { key: "regulatory", label: "Regulatory & Compliance", weight: 15, maxScore: 100, minimumScore: 40, mandatory: false, evidenceRequired: false },
    { key: "financial", label: "Financial Soundness", weight: 15, maxScore: 100, minimumScore: 40, mandatory: false, evidenceRequired: false },
  ];

  async function ensureEvaluationCriteria(challengeId) {
    let criteria = [], template = null;
    try {
      const r = await api("/challenges/" + challengeId + "/evaluation/criteria");
      criteria = r.criteria || [];
      template = r.template || null;
    } catch (_) {}
    if (criteria.length && template) return { criteria, template };
    const res = await api("/challenges/" + challengeId + "/evaluation/configure", {
      method: "POST",
      body: { name: "Government evaluation \u2014 criteria", criteria: DEFAULT_CRITERIA },
    });
    return { criteria: res.criteria || DEFAULT_CRITERIA, template: res.template || null };
  }

  async function startEvaluation(challenge, startupId) {
    const v = vm();
    const orgId = state.overview.organization ? state.overview.organization.id : v.problem.organizationId;
    const { criteria, template } = await ensureEvaluationCriteria(challenge.id);
    if (!template || !template.id) throw new Error("Evaluation template not configured");
    const ev = await api("/evaluations", {
      method: "POST",
      body: { challengeId: challenge.id, startupId, organizationId: orgId, templateId: template.id },
    });
    return { evaluation: ev, criteria };
  }

  async function scoreAndSubmit(evaluationId, criteria, scoresByKey, commentsByKey) {
    const scores = criteria.map((c) => ({
      criterionKey: c.key,
      score: Math.max(0, Math.min(c.maxScore || 100, Number(scoresByKey[c.key] || 0))),
      comment: commentsByKey[c.key] || "",
    }));
    await api("/evaluations/" + evaluationId + "/scores", { method: "POST", body: { scores } });
    const sub = await api("/evaluations/" + evaluationId + "/submit", { method: "POST", body: {} });
    return sub;
  }

  /* ───────────── generic modal ───────────── */
  function modal(title, bodyHtml, { onMount, width } = {}) {
    const wrap = document.createElement("div");
    wrap.className = "gwf-modal";
    wrap.innerHTML = `<div class="gwf-modal-card" ${width ? `style="max-width:${width}px"` : ""}>
      <div class="gwf-modal-head"><h3 class="gwf-modal-title">${esc(title)}</h3><button type="button" class="gwf-modal-close" aria-label="Close">&#10005;</button></div>
      <div class="gwf-modal-body">${bodyHtml}</div>
    </div>`;
    const close = () => { wrap.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    wrap.addEventListener("click", (e) => { if (e.target === wrap || e.target.classList.contains("gwf-modal-close")) close(); });
    document.body.appendChild(wrap);
    if (onMount) onMount(wrap);
    return wrap;
  }

  const fieldWrap = (label, inner) => `<label class="gwf-field"><span class="gwf-field-label">${label}</span>${inner}</label>`;
  const textInput = (name, ph, value) => `<input class="input" name="${esc(name)}" placeholder="${esc(ph)}" value="${esc(value || "")}">`;
  const selInput = (name, options, attrs) => `<select class="select" name="${esc(name)}" ${attrs || ""}>${options.map((o) => `<option value="${esc(o[0])}">${esc(o[1])}</option>`).join("")}</select>`;

  function toast(msg, kind) {
    const el = document.createElement("div");
    el.className = "gwf-toast gwf-toast-" + (kind || "ok");
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("gwf-toast-out"), 2600);
    setTimeout(() => el.remove(), 3100);
  }

  async function refreshOverview() {
    try {
      state.overview = await api("/overview?organizationId=" + encodeURIComponent(state.orgId));
    } catch (_) {}
  }

  /* ═════════════════════ SEARCH SCREEN ═════════════════════ */
  function renderSearch(root) {
    const org = (state.overview && state.overview.organization) || {};
    root.innerHTML = `
      <div class="gcc-toolbar gwf-toolbar">
        <div class="gwf-brand"><span class="gwf-brand-mark">RL</span> <span>Problem Intelligence \u00b7 Find, Evaluate, Decide</span></div>
        <div class="gcc-toolbar-right">
          <button type="button" class="btn btn-secondary btn-sm" data-gwf-open-command>Open Command Center</button>
        </div>
      </div>
      <div class="gwf-search-wrap">
        <div class="gwf-search-head">
          <div class="gwf-eyebrow">REGULENS \u00b7 GOVERNMENT PROBLEM SEARCH</div>
          <h1 class="gwf-h1">${esc(org.name || "Government")}</h1>
          <p class="gwf-sub">Search the live problem register. Every record below is real \u2014 opening a problem opens its full discovery-to-decision workspace.</p>
        </div>
        <div class="gwf-search-bar">
          <input class="input gwf-search-input" id="gwfSearchInput" placeholder="Search by problem title, sector, description, region\u2026" autocomplete="off">
          <button type="button" class="btn btn-primary gwf-search-btn" data-gwf-search>Search</button>
        </div>
        <div class="gwf-search-meta" id="gwfSearchMeta"></div>
        <div id="gwfSearchResults" class="gwf-results"></div>
      </div>`;
    const input = $("#gwfSearchInput", root);
    const run = () => { if ($("#gwfSearchInput", root).value && $("#gwfSearchInput", root).value.trim().length) doSearch(root); else showAll(root); };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
    $("[data-gwf-search]", root).addEventListener("click", run);
    $("[data-gwf-open-command]", root).addEventListener("click", () => { try { window.ReguLens.navigate("gov-command"); } catch (_) {} });
    input.focus();
    showAll(root);
  }

  function problemRows(v) {
    const index = new Map((state.problemIndex || []).map((p) => [p.id, p]));
    const chCount = (id) => v.challenges.filter((c) => c.problemId === id);
    return v.problems.map((p) => {
      const full = index.get(p.id) || {};
      const chs = chCount(p.id);
      const appN = chs.reduce((s, c) => s + (c.applicationCount || 0), 0);
      const eligN = chs.reduce((s, c) => s + (c.eligibleCount || 0), 0);
      const pilots = v.pilots.filter((pl) => (pl.problem && pl.problem.id === p.id) || chs.some((c) => c.id === pl.challengeId));
      const ready = pilots.filter((pl) => pl.readiness && (pl.readiness.status === "READY" || pl.readiness.status === "READY_WITH_CONDITIONS"));
      return {
        id: p.id,
        title: p.title, sector: full.sector || p.sector || "\u2014", status: p.status, budget: money(p.estimatedBudget),
        apps: appN, eligible: eligN, pilots: pilots.length, ready: ready.length,
        raised: fmtDate(p.createdAt), region: full.geography || full.region || "\u2014",
        fuse: [p.title, full.sector, p.sector, full.geography, full.region, p.status, full.problemStatement, full.description].join(" "),
      };
    });
  }

  async function doSearch(root) {
    const q = ($("#gwfSearchInput", root).value || "").trim();
    const meta = $("#gwfSearchMeta", root);
    if (!q) return;
    meta.textContent = "Searching the problem register\u2026";
    try {
      const r = await api("/problems?organizationId=" + encodeURIComponent(state.orgId) + "&q=" + encodeURIComponent(q));
      const rows = r.problems || [];
      if (!rows.length) {
        meta.textContent = rows.length + " record(s) matched \u201c" + q + "\u201d";
        $("#gwfSearchResults", root).innerHTML = empty("No problems match \u201c" + esc(q) + "\u201d. Try a different sector, term, or region.");
        return;
      }
      const v = vm();
      v.overview = state.overview; v.challenges = state.overview.challenges || []; v.pilots = state.overview.pilots || [];
      const enriched = rows.map((p) => {
        const chs = v.challenges.filter((c) => c.problemId === p.id);
        const pilots = v.pilots.filter((pl) => (pl.problem && pl.problem.id === p.id) || chs.some((c) => c.id === pl.challengeId));
        return { p, chs, pilots };
      });
      meta.textContent = enriched.length + " record(s) matched \u201c" + q + "\u201d";
      $("#gwfSearchResults", root).innerHTML = dataTable([
        { key: "title", label: "Problem" }, { key: "sector", label: "Sector" }, { key: "status", label: "Status" },
        { key: "apps", label: "Responses" }, { key: "eligible", label: "Eligible" }, { key: "pilots", label: "Pilots" },
        { key: "ready", label: "Ready" }, { key: "open", label: "" },
      ], enriched.map(({ p, chs, pilots }) => {
        const appN = chs.reduce((s, c) => s + (c.applicationCount || 0), 0);
        const eligN = chs.reduce((s, c) => s + (c.eligibleCount || 0), 0);
        const ready = pilots.filter((pl) => pl.readiness && (pl.readiness.status === "READY" || pl.readiness.status === "READY_WITH_CONDITIONS"));
        return {
          title: { html: `<strong>${esc(p.title)}</strong><div class="gcc-cell-sub">${esc(p.region || "")} \u00b7 raised ${fmtDate(p.createdAt)}</div>` },
          sector: esc(p.sector || "\u2014"),
          status: badge(p.status),
          apps: num(appN), eligible: num(eligN), pilots: num(pilots.length), ready: num(ready.length),
          open: { html: `<button type="button" class="btn btn-primary btn-sm" data-gwf-open-problem="${esc(p.id)}">Open workspace</button>`, sort: "" },
          fuse: [p.title, p.sector, p.region, p.status, p.description].join(" "),
        };
      }));
      $("#gwfSearchResults", root).querySelectorAll("[data-gwf-open-problem]").forEach((b) => {
        b.addEventListener("click", () => selectProblem(b.dataset.gwfOpenProblem));
      });
    } catch (err) {
      meta.textContent = "";
      $("#gwfSearchResults", root).innerHTML = `<div class="gcc-state gcc-state-error"><div class="gcc-empty-icon">&#9888;</div><div class="gcc-state-msg">${esc("Search failed: " + err.message)}</div></div>`;
    }
  }

  async function ensureProblemIndex() {
    if (state.problemIndex) return;
    try {
      const r = await api("/problems?organizationId=" + encodeURIComponent(state.orgId));
      state.problemIndex = r.problems || [];
    } catch (_) { state.problemIndex = []; }
  }

  async function showAll(root) {
    const meta = $("#gwfSearchMeta", root);
    await ensureProblemIndex();
    const v = vm();
    const rows = problemRows(v).sort((a, b) => String(b.raised).localeCompare(String(a.raised)));
    meta.textContent = v.problems.length + " problem(s) in the live register.";
    $("#gwfSearchResults", root).innerHTML = rows.length
      ? dataTable([
        { key: "title", label: "Problem" }, { key: "sector", label: "Sector" }, { key: "status", label: "Status" },
        { key: "apps", label: "Responses" }, { key: "eligible", label: "Eligible" }, { key: "pilots", label: "Pilots" },
        { key: "ready", label: "Ready" }, { key: "open", label: "" },
      ], rows.map((r) => ({
        title: { html: `<strong>${esc(r.title)}</strong><div class="gcc-cell-sub">${esc(r.region)} \u00b7 raised ${r.raised}</div>` },
        sector: esc(r.sector), status: badge(r.status),
        apps: num(r.apps), eligible: num(r.eligible), pilots: num(r.pilots), ready: num(r.ready),
        open: { html: `<button type="button" class="btn btn-primary btn-sm" data-gwf-open-problem="${esc(r.id)}">Open workspace</button>`, sort: "" },
        fuse: r.fuse,
      })))
      : empty("No problems are registered yet. Publish a problem to begin discovery.");
    $("#gwfSearchResults", root).querySelectorAll("[data-gwf-open-problem]").forEach((b) => {
      b.addEventListener("click", () => selectProblem(b.dataset.gwfOpenProblem));
    });
    const tbl = $("table", $("#gwfSearchResults", root));
    if (tbl) { tbl.querySelectorAll("th").forEach((h) => h.classList.remove("gcc-th")); }
  }

  async function selectProblem(id) {
    const overviewRow = (state.overview && state.overview.problems || []).find((p) => p.id === id);
    state.problem = overviewRow || { id };
    try {
      const full = await api("/problems/" + id);
      if (full && !full.error) state.problem = Object.assign({}, overviewRow || {}, full);
    } catch (_) {}
    try { localStorage.setItem(KEY_PROBLEM, id); } catch (_) {}
    document.getElementById("govWorkflowBody").setAttribute("data-problem", id);
    renderWorkspace(document.getElementById("govWorkflowBody"));
  }

  function backToSearch(root) {
    state.problem = null;
    try { localStorage.removeItem(KEY_PROBLEM); } catch (_) {}
    renderSearch(root);
  }

  /* ═════════════════════ WORKSPACE SCREEN ═════════════════════ */
  function renderWorkspace(root) {
    const v = vm();
    const p = v.problem;
    const ch = primaryChallenge(v);
    const org = (state.overview && state.overview.organization) || {};
    const chCards = v.challenges.map((c) => {
      const apps = v.applications.filter((a) => a.challengeId === c.id);
      const elig = v.eligibility.filter((e) => e.challengeId === c.id);
      const inElig = new Set(elig.filter((e) => e.verdict === "ELIGIBLE" || e.verdict === "DEFINITELY_ELIGIBLE").map((e) => e.startup && e.startup.id));
      const pilots = v.pilots.filter((pl) => pl.challengeId === c.id);
      return { c, apps, elig, eligibleIds: inElig, pilots };
    });

    root.innerHTML = `
      <div class="gcc-toolbar gwf-toolbar">
        <div class="gwf-brand"><button type="button" class="btn btn-secondary btn-sm" data-gwf-back>Back to search</button></div>
        <div class="gcc-toolbar-right">
          <span class="gcc-org-label">${esc(org.name || "")}</span>
          <button type="button" class="btn btn-secondary btn-sm" data-gwf-refresh>Refresh</button>
          <button type="button" class="btn btn-secondary btn-sm" data-gwf-open-command>Command Center</button>
        </div>
      </div>

      <div class="gwf-workspace">
        <section class="gcc-section" id="gwf-hero">
          <div class="gcc-hero">
            <div>
              <div class="gcc-hero-eyebrow">GOVERNMENT PROBLEM \u00b7 ${esc(p.status || "")}</div>
              <h1 class="gcc-hero-title">${esc(p.title)}</h1>
              <p class="gcc-hero-sub">${esc(p.problemStatement || p.description || "")}</p>
              <div class="gwf-hero-meta">${badge(p.sector)} ${(p.region || p.geography) ? badge(p.region || p.geography) : ""} <span class="gcc-pct">Est. budget ${money(p.estimatedBudget)}</span></div>
            </div>
            <div class="gcc-hero-meta"><div class="gcc-pct">Raised ${fmtDate(p.createdAt)}</div></div>
          </div>
          ${(p.objectives || p.desiredOutcomes) ? `<div class="gwf-objectives"><strong>Objectives:</strong> ${esc(p.objectives || JSON.stringify(p.desiredOutcomes) || "")}</div>` : ""}
        </section>

        <section class="gcc-section" id="gwf-lifecycle">
          ${head("Lifecycle State", "Live counts per stage for this problem \u2014 real records only")}
          ${lifecycleStrip(v)}
        </section>

        <section class="gcc-section" id="gwf-find">
          ${head("Find Solutions &amp; Eligibility Gate", "Eligibility is enforced before ranking \u2014 ineligible solutions never reach the shortlist")}
          <div class="gwf-actionbar">
            <button type="button" class="btn btn-primary" data-gwf-find>Screen eligible solutions &amp; run ranking</button>
            <span class="gcc-cell-sub">Runs the real eligibility engine per candidate, then the deterministic matching engine per challenge.</span>
          </div>
          <div id="gwfFindLog"></div>
          <div class="gcc-grid-2">
            <div class="gcc-panel"><h3 class="gcc-panel-title">Ranked Solutions (latest matching run)</h3><div id="gwfRanked"></div></div>
            <div class="gcc-panel"><h3 class="gcc-panel-title">Eligibility Screening</h3><div id="gwfEligibility"></div></div>
          </div>
        </section>

        <section class="gcc-section" id="gwf-compare">
          ${head("Shortlist Comparison", "Apples-to-apples comparison of ranked solutions")}
          <div id="gwfCompare"></div>
        </section>

        <section class="gcc-section" id="gwf-eval">
          ${head("Solution Evaluation &amp; Aggregation", "Government officers score; the system aggregates deterministically")}
          <div id="gwfEval"></div>
        </section>

        <section class="gcc-section" id="gwf-risk">
          ${head("Compliance &amp; Risk Readout", "Rule-based flags surfaced by the matching and eligibility engines")}
          <div id="gwfRisk"></div>
        </section>

        <section class="gcc-section" id="gwf-pilots">
          ${head("Pilots &amp; Performance", "Human decision layer \u2014 officers launch, monitor and analyse pilots")}
          <div class="gwf-actionbar">
            <button type="button" class="btn btn-primary" data-gwf-new-pilot>New pilot</button>
            <span class="gcc-cell-sub">A pilot is launched from a selected, eligible solution.</span>
          </div>
          <div id="gwfPilots"></div>
        </section>

        <section class="gcc-section" id="gwf-outcome">
          ${head("Post-Pilot Analysis, Readiness &amp; Decision", "AI assists; Government decides")}
          <div id="gwfOutcome"></div>
          <div class="gwf-actionbar">
            <button type="button" class="btn btn-primary" data-gwf-decide>Record Government decision</button>
          </div>
          <div id="gwfDecisions"></div>
        </section>
      </div>`;

    root.querySelectorAll("[data-gwf-back]").forEach((b) => b.addEventListener("click", () => backToSearch(root)));
    root.querySelectorAll("[data-gwf-refresh]").forEach((b) => b.addEventListener("click", async () => { await refreshOverview(); renderWorkspace(root); }));
    root.querySelectorAll("[data-gwf-open-command]").forEach((b) => b.addEventListener("click", () => { try { window.ReguLens.navigate("gov-command"); } catch (_) {} }));
    $("[data-gwf-find]", root).addEventListener("click", () => findSolutionsAction(root));
    $("[data-gwf-new-pilot]", root).addEventListener("click", () => newPilotModal(root));
    $("[data-gwf-decide]", root).addEventListener("click", () => decisionModal(root));

    $("#gwfRanked", root).innerHTML = rankedBlock(v);
    $("#gwfEligibility", root).innerHTML = eligibilityBlock(v, chCards);
    $("#gwfCompare", root).innerHTML = compareBlock(v);
    $("#gwfEval", root).innerHTML = evalBlock(v, chCards);
    $("#gwfRisk", root).innerHTML = riskBlock(v);
    $("#gwfPilots", root).innerHTML = pilotsBlock(root);
    $("#gwfOutcome", root).innerHTML = outcomeBlock(v);
    $("#gwfDecisions", root).innerHTML = decisionsBlock(v);
    $("#gwfFindLog", root).innerHTML = "";

    attachRowHandlers(root);
  }

  function lifecycleStrip(v) {
    const stages = ["PROBLEM_PUBLISHED", "CHALLENGE_PUBLISHED", "APPLICATIONS_OPEN", "ELIGIBILITY_SCREENED", "MATCHED", "EVALUATED", "AGGREGATED", "DECISION", "PILOT_APPROVED", "PILOT_RUNNING", "ANALYSED", "PROCUREMENT_READY"];
    const counts = {
      PROBLEM_PUBLISHED: 1,
      CHALLENGE_PUBLISHED: v.challenges.length ? 1 : 0,
      APPLICATIONS_OPEN: v.applications.length ? 1 : 0,
      ELIGIBILITY_SCREENED: v.eligibility.length ? 1 : 0,
      MATCHED: v.matches.length ? 1 : 0,
      EVALUATED: v.evaluations.length ? 1 : 0,
      AGGREGATED: v.aggregations.length ? 1 : 0,
      DECISION: v.decisions.length ? 1 : 0,
      PILOT_APPROVED: v.pilots.length ? 1 : 0,
      PILOT_RUNNING: v.pilots.some((pl) => pl.status === "RUNNING") ? 1 : 0,
      ANALYSED: v.pilots.some((pl) => pl.aiInsight || (pl.outcome && pl.outcome.outcome)) ? 1 : 0,
      PROCUREMENT_READY: v.pilots.some((pl) => pl.readiness && (pl.readiness.status === "READY" || pl.readiness.status === "READY_WITH_CONDITIONS")) ? 1 : 0,
    };
    let reached = true;
    const cells = stages.map((s, i) => {
      const on = !!counts[s];
      if (!on) reached = false;
      return `<div class="gcc-stage">
        <div class="gcc-stage-dot${on ? " gcc-stage-dot-live" : ""}">${on ? "&#10003;" : ""}</div>
        <div class="gcc-stage-label">${esc(s.replace(/_/g, " ").toLowerCase())}</div>
        ${i < stages.length - 1 ? '<div class="gcc-stage-connector"></div>' : ""}
      </div>`;
    }).join("");
    return `<div class="gcc-pipeline">${cells}</div>`;
  }

  function rankedBlock(v) {
    const byChallenge = new Map();
    v.matches.forEach((m) => {
      if (!byChallenge.has(m.challengeId)) byChallenge.set(m.challengeId, []);
      byChallenge.get(m.challengeId).push(m);
    });
    if (!byChallenge.size) return empty("No ranking computed yet. Press \u201cScreen eligible solutions & run ranking\u201d to run the real engines.");
    let out = "";
    for (const [cid, rows] of byChallenge) {
      const challenge = v.challenges.find((c) => c.id === cid);
      const title = challenge ? challenge.title : cid;
      const sorted = rows.slice().sort((a, b) => (Number(a.matchScore) || 0) - (Number(b.matchScore) || 0)).reverse();
      out += `<h4 class="gwf-subhead">${esc(title)}</h4>` + dataTable([
        { key: "rank", label: "Rank" }, { key: "solution", label: "Solution" }, { key: "tier", label: "Tier" },
        { key: "score", label: "Match" }, { key: "confidence", label: "Conf." }, { key: "why", label: "Why recommended" }, { key: "view", label: "" },
      ], sorted.map((m, i) => ({
        rank: num(m.rank || i + 1),
        solution: { html: `<strong>${esc(startupName(m.startup))}</strong><div class="gcc-cell-sub">${esc(startupMeta(m.startup))}</div>` },
        tier: badge(m.rankingTier || m.eligibilityStatus || "\u2014"),
        score: { html: `<span class="gcc-score">${esc(num(m.matchScore))}</span>`, sort: Number(m.matchScore) || 0 },
        confidence: { html: esc(num(m.matchConfidence)) + "%", sort: Number(m.matchConfidence) || 0 },
        why: esc((m.matchExplanation || m.explanation || "\u2014").slice(0, 160)),
        view: { html: `<button type="button" class="btn btn-secondary btn-sm" data-gwf-solution="${esc(m.startupId || (m.startup && m.startup.id) || "")}">Detail</button>`, sort: "" },
        fuse: [startupName(m.startup), m.matchExplanation].join(" "),
      })));
    }
    return out;
  }

  function eligibilityBlock(v, chCards) {
    const rows = [];
    v.eligibility.forEach((e) => {
      rows.push({
        challenge: e.challengeTitle || e.challengeId,
        solution: { html: `<strong>${esc(startupName(e.startup))}</strong><div class="gcc-cell-sub">${esc(startupMeta(e.startup))}</div>` },
        verdict: badge(e.verdict),
        percent: { html: `<div class="gcc-progress"><div class="gcc-progress-fill ${e.verdict === "ELIGIBLE" || e.verdict === "DEFINITELY_ELIGIBLE" ? "ok" : "warn"}" style="width:${Math.min(100, Number(e.percent) || 0)}%"></div></div><span class="gcc-pct">${esc(num(e.percent))}%</span>`, sort: Number(e.percent) || 0 },
        evaluatedAt: fmtDate(e.evaluatedAt),
        fuse: [startupName(e.startup), e.challengeTitle, e.verdict].join(" "),
      });
    });
    if (!rows.length) return empty("No eligibility screenings yet. Screening runs from rules defined in the Eligibility workspace, triggered here on eligible candidate submission.");
    return dataTable([
      { key: "challenge", label: "Challenge" }, { key: "solution", label: "Solution" }, { key: "verdict", label: "Verdict" },
      { key: "percent", label: "Pass %" }, { key: "evaluatedAt", label: "Evaluated" },
    ], rows);
  }

  function compareBlock(v) {
    const bestByStartup = new Map();
    v.matches.forEach((m) => {
      const sid = m.startupId || (m.startup && m.startup.id);
      if (!sid) return;
      if (!bestByStartup.has(sid) || (Number(m.matchScore) || 0) > (Number(bestByStartup.get(sid).matchScore) || 0)) bestByStartup.set(sid, m);
    });
    const items = Array.from(bestByStartup.values()).sort((a, b) => (Number(b.matchScore) || 0) - (Number(a.matchScore) || 0)).slice(0, 6);
    if (!items.length) return empty("No ranked solutions to compare yet. Run ranking first.");
    const dimKeys = new Set();
    items.forEach((m) => (m.dimensionResults || m.dimensions || []).forEach((d) => dimKeys.add(d.key || d.label || d)));
    const dims = Array.from(dimKeys).slice(0, 8);
    return `<div class="gwf-compare">
      <table class="gcc-table"><thead><tr><th class="gcc-th">Dimension</th>${items.map(() => "<th class=\"gcc-th\"></th>").join("")}</tr></thead>
      <tbody>${dims.length ? dims.map((dk) => `<tr><td class="gwf-dimname">${esc(dk)}</td>${items.map((m) => {
        const d = (m.dimensionResults || m.dimensions || []).find((x) => (x.key || x.label) === dk);
        return `<td>${d ? `<span class="gcc-score">${esc(num(d.score))}</span>${d.note ? `<div class="gcc-cell-sub">${esc(String(d.note).slice(0, 60))}</div>` : ""}` : "\u2014"}</td>`;
      }).join("")}</tr>`).join("") : `<tr><td class="gwf-dimname">Overall</td>${items.map((m) => `<td><span class="gcc-score">${esc(num(m.matchScore))}</span></td>`).join("")}</tr>`}
      <tr class="gwf-dimhead"><td class="gwf-dimname">Solution</td>${items.map((m) => `<td><strong>${esc(startupName(m.startup))}</strong></td>`).join("")}</tr>
      <tr class="gwf-dimhead"><td class="gwf-dimname">Actions</td>${items.map((m) => `<td><button type="button" class="btn btn-secondary btn-sm" data-gwf-solution="${esc(m.startupId || (m.startup && m.startup.id) || "")}">Detail</button></td>`).join("")}</tr>
      </tbody></table>
    </div>`;
  }

  function evalBlock(v, chCards) {
    const evs = v.evaluations.map((e) => ({
      solution: e.startup ? { html: `<strong>${esc(startupName(e.startup))}</strong>` } : (e.startupId || e.id),
      challenge: v.challenges.find((c) => c.id === e.challengeId) ? (v.challenges.find((c) => c.id === e.challengeId).title || "") : (e.challengeId || ""),
      status: badge(e.status || "DRAFT"),
      total: { html: esc(num(e.totalScore != null ? e.totalScore : e.weightedTotal)), sort: Number(e.totalScore != null ? e.totalScore : e.weightedTotal) || 0 },
      updated: fmtDate(e.updatedAt || e.createdAt),
      fuse: [e.startupId, e.challengeId, e.status].join(" "),
    }));
    const aggRows = v.aggregations.map((a) => ({
      challenge: v.challenges.find((c) => c.id === a.challengeId) ? (v.challenges.find((c) => c.id === a.challengeId).title || "") : (a.challengeId || ""),
      total: num(a.total),
      result: badge(a.result || "\u2014"),
      startup: a.startupId || a.startup ? startupName(a.startup) : "",
      generated: fmtDate(a.generatedAt || a.updatedAt || a.createdAt),
      fuse: [a.challengeId, a.result].join(" "),
    }));
    return `<div class="gcc-grid-2">
      <div class="gcc-panel"><h3 class="gcc-panel-title">Evaluation Records</h3>${evs.length ? dataTable([
        { key: "solution", label: "Startup" }, { key: "challenge", label: "Challenge" }, { key: "status", label: "Status" },
        { key: "total", label: "Score" }, { key: "updated", label: "Updated" },
      ], evs) : empty("No evaluation records yet. Use \u201cScore solution\u201d in the Ranked Solutions panel to open a formal evaluation.")}</div>
      <div class="gcc-panel"><h3 class="gcc-panel-title">Deterministic Aggregation</h3>${aggRows.length ? dataTable([
        { key: "challenge", label: "Challenge" }, { key: "startup", label: "Startup" }, { key: "total", label: "Total" }, { key: "result", label: "Result" }, { key: "generated", label: "Generated" },
      ], aggRows) : empty("Run evaluation aggregation before any Government decision \u2014 aggregation uses submitted evaluations only.")}</div>
    </div>`;
  }

  function riskBlock(v) {
    const rows = [];
    const seen = new Set();
    v.matches.forEach((m) => {
      const sid = m.startupId || (m.startup && m.startup.id);
      if (!sid || seen.has(sid)) return;
      seen.add(sid);
      const flags = (m.riskFlags || []).filter(Boolean);
      rows.push({
        solution: { html: `<strong>${esc(startupName(m.startup))}</strong><div class="gcc-cell-sub">${esc(startupMeta(m.startup))}</div>` },
        flags: { html: flags.length ? flags.slice(0, 6).map((f) => badge(f)).join(" ") : `<span class="gcc-badge gcc-badge-ok">no flags</span>` },
        strengths: esc((m.strengths || []).slice(0, 4).join("; ") || "\u2014"),
        gaps: esc((m.gaps || []).slice(0, 4).join("; ") || "\u2014"),
        fuse: [startupName(m.startup), (m.strengths || []).join(" "), (m.gaps || []).join(" "), (m.riskFlags || []).join(" ")].join(" "),
      });
    });
    if (!rows.length) return empty("No risk readouts yet. Flags are surfaced by the matching engine after a ranking run.");
    return dataTable([
      { key: "solution", label: "Solution" }, { key: "strengths", label: "Strengths" }, { key: "gaps", label: "Gaps" }, { key: "flags", label: "Risk Flags" },
    ], rows);
  }

  function pilotsBlock(root) {
    const v = vm();
    if (!v.pilots.length) return empty("No pilots launched yet. Pick an eligible, ranked solution and press \u201cNew pilot\u201d.");
    const rows = v.pilots.map((p) => ({
      pilot: { html: `<strong>${esc(p.title)}</strong><div class="gcc-cell-sub">${esc(p.location || "")} \u00b7 ${esc(p.challenge ? p.challenge.title : "")}</div>` },
      solution: esc(startupName(p.startup)),
      status: badge(p.status || "PLANNED"),
      score: { html: esc(num(p.overallScore)), sort: Number(p.overallScore) || 0 },
      health: badge(p.health || "\u2014"),
      budget: money(p.budget),
      act: { html: `
        <button type="button" class="btn btn-secondary btn-sm" data-gwf-kpi="${esc(p.id)}">KPI</button>
        <button type="button" class="btn btn-secondary btn-sm" data-gwf-measure="${esc(p.id)}">Measure</button>
        <button type="button" class="btn btn-secondary btn-sm" data-gwf-result="${esc(p.id)}">Result</button>
        <button type="button" class="btn btn-secondary btn-sm" data-gwf-analyse="${esc(p.id)}">Analyse</button>`, sort: "" },
      fuse: [p.title, startupName(p.startup), p.status, p.health].join(" "),
    }));
    return dataTable([
      { key: "pilot", label: "Pilot" }, { key: "solution", label: "Solution" }, { key: "status", label: "Status" },
      { key: "score", label: "Score" }, { key: "health", label: "Health" }, { key: "budget", label: "Budget" }, { key: "act", label: "Actions" },
    ], rows);
  }

  function outcomeBlock(v) {
    let out = "";
    const withPerf = v.pilots.filter((p) => p.kpis && p.kpis.length);
    if (withPerf.length) {
      const perfRows = [];
      withPerf.forEach((p) => (p.kpis || []).slice(0, 6).forEach((k) => perfRows.push({
        pilot: esc(p.title),
        metric: esc(k.name || "KPI"),
        actual: `${esc(num(k.actualValue))}${k.unit ? " " + esc(k.unit) : ""}`,
        target: `${esc(num(k.targetValue))}${k.unit ? " " + esc(k.unit) : ""}`,
        achievement: { html: `<span class="gcc-score">${esc(num(k.achievementPct))}%</span><div class="gcc-progress gcc-progress-sm"><div class="gcc-progress-fill ${Number(k.achievementPct) >= 80 ? "ok" : "warn"}" style="width:${Math.min(100, Number(k.achievementPct) || 0)}%"></div></div>`, sort: Number(k.achievementPct) || 0 },
        fuse: [p.title, k.name].join(" "),
      })));
      out += `<div class="gcc-panel" style="margin-bottom:16px"><h3 class="gcc-panel-title">Performance vs. Targets</h3>` +
        dataTable([{ key: "pilot", label: "Pilot" }, { key: "metric", label: "KPI" }, { key: "actual", label: "Actual" }, { key: "target", label: "Target" }, { key: "achievement", label: "Achievement" }], perfRows) + `</div>`;
    }
    const rows = v.pilots.map((p) => ({
      pilot: esc(p.title),
      outcome: badge((p.outcome && p.outcome.outcome) || (p.result && p.result.result) || "IN_PROGRESS"),
      confidence: p.outcome && p.outcome.confidence != null ? `${num(p.outcome.confidence)}%` : "\u2014",
      reasoning: esc((p.outcome && p.outcome.reason) || (p.result && p.result.recommendationNotes || p.result && p.result.qualitativeFindings) || "\u2014"),
      recommendation: badge((p.result && p.result.recommendation) || "\u2014"),
      analysis: p.aiInsight ? `<div class="gwf-insight-chip">AI analysis available</div>` : "",
      fuse: [p.title, p.outcome && p.outcome.outcome, p.result && p.result.recommendation, p.aiInsight].join(" "),
    }));
    out += rows.length
      ? dataTable([
        { key: "pilot", label: "Pilot" }, { key: "outcome", label: "Outcome" }, { key: "confidence", label: "Confidence" },
        { key: "reasoning", label: "Reasoning" }, { key: "recommendation", label: "AI Recommendation" }, { key: "analysis", label: "Analysis" },
      ], rows.map((r) => Object.assign({}, r, { reasoning: esc(r.reasoning), analysis: r.analysis })))
      : empty("No pilot outcomes yet. Outcomes are derived when pilot results are recorded and analysed.");
    const ready = v.pilots.filter((p) => p.readiness && (p.readiness.status === "READY" || p.readiness.status === "READY_WITH_CONDITIONS"));
    if (ready.length) {
      out += `<div class="gwf-readiness">${head("Procurement Readiness", "Gateway to Government decision")}` + dataTable([
        { key: "pilot", label: "Pilot / Solution" }, { key: "readiness", label: "Readiness" }, { key: "risk", label: "Risk" }, { key: "conditions", label: "Conditions" },
      ], ready.map((p) => ({
        pilot: `<strong>${esc(p.title)}</strong><div class="gcc-cell-sub">${esc(startupName(p.startup))}</div>`,
        readiness: badge(p.readiness.status),
        risk: badge(p.readiness.riskLevel || "\u2014"),
        conditions: esc((p.readiness.conditions || []).join("; ") || "\u2014"),
        fuse: [p.title, p.readiness.status, (p.readiness.conditions || []).join(" ")].join(" "),
      }))) + `</div>`;
    }
    const scale = v.scalePlans.length
      ? `<ul class="gcc-ev-list">${v.scalePlans.slice(0, 8).map((s) => `<li><span>${esc(s.title || "Scale plan")}</span> ${badge(s.status)} <span class="gcc-pct">${money(s.estimatedBudget)}</span></li>`).join("")}</ul>`
      : empty("No scale plans yet. Create a scale plan from a positively analysed pilot.");
    const assess = v.assessments.length
      ? `<ul class="gcc-ev-list">${v.assessments.slice(0, 8).map((a) => `<li><span>${esc(a.title || a.pilotProjectId || "Procurement assessment")}</span> ${badge(a.status || a.assessmentStatus || "DRAFT")}</li>`).join("")}</ul>`
      : empty("No procurement assessments yet.");
    out += `<div class="gcc-grid-2"><div class="gcc-panel"><h3 class="gcc-panel-title">Scale &amp; Deployment Plans</h3>${scale}</div><div class="gcc-panel"><h3 class="gcc-panel-title">Procurement Assessments</h3>${assess}</div></div>`;
    return out;
  }

  function decisionsBlock(v) {
    if (!v.decisions.length) return empty("No formal Government decisions recorded yet.");
    return v.decisions.slice(0, 12).map((d) => `<div class="gcc-decision">
      <div class="gcc-decision-top">${badge(d.decisionType || d.status)} <span class="gcc-decision-t">${esc(v.challenges.find((c) => c.id === d.challengeId) ? v.challenges.find((c) => c.id === d.challengeId).title : (d.challengeId || ""))}</span></div>
      <div class="gcc-decision-sub"><strong>${esc(startupName(d.startup))}</strong> \u00b7 decided by ${esc(d.decidedBy || d.actorName || "\u2014")} \u00b7 ${fmtDate(d.createdAt || d.reviewedAt)}</div>
      <div class="gcc-decision-verdict">${esc(d.decision || d.status || "\u2014")}</div>
      <div class="gcc-cell-sub">${esc(d.reason || "")}</div>
    </div>`).join("");
  }

  function attachRowHandlers(root) {
    root.querySelectorAll("[data-gwf-solution]").forEach((b) => {
      b.addEventListener("click", () => solutionDetailModal(b.dataset.gwfSolution));
    });
    root.querySelectorAll("[data-gwf-kpi]").forEach((b) => b.addEventListener("click", () => kpiModal(root, b.dataset.gwfKpi)));
    root.querySelectorAll("[data-gwf-measure]").forEach((b) => b.addEventListener("click", () => measureModal(root, b.dataset.gwfMeasure)));
    root.querySelectorAll("[data-gwf-result]").forEach((b) => b.addEventListener("click", () => resultModal(root, b.dataset.gwfResult)));
    root.querySelectorAll("[data-gwf-analyse]").forEach((b) => b.addEventListener("click", () => analyseModal(root, b.dataset.gwfAnalyse)));
    root.querySelectorAll("table.gcc-table").forEach((tb) => attachSorters(tb));
  }

  async function findSolutionsAction(root) {
    const btn = root.querySelector("[data-gwf-find]");
    if (btn) { btn.disabled = true; btn.textContent = "Running eligibility + matching engines\u2026"; }
    try {
      const log = await runFindSolutions();
      $("#gwfFindLog", root).innerHTML = log.length
        ? `<ul class="gwf-log">${log.map((l) => `<li class="gwf-log-${l.state}"><span class="gcc-badge gcc-badge-${l.state}">${esc(l.state.toUpperCase())}</span> ${esc(l.text)}</li>`).join("")}</ul>`
        : "";
      renderWorkspace(root);
      toast("Find Solutions completed \u2014 engines ran on live records.", "ok");
    } catch (err) {
      $("#gwfFindLog", root).innerHTML = `<div class="gcc-state gcc-state-error"><div class="gcc-empty-icon">&#9888;</div><div class="gcc-state-msg">${esc("Find Solutions failed: " + err.message)}</div></div>`;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Screen eligible solutions & run ranking"; }
    }
  }

  /* ───────────── solution detail ───────────── */
  async function solutionDetailModal(startupId) {
    const v = vm();
    const cached = v.matches.map((m) => m.startup).find((s) => s && (s.id === startupId)) ||
      v.applications.map((a) => a.startup).find((s) => s && s.id === startupId) ||
      v.pilots.map((p) => p.startup).find((s) => s && s.id === startupId);
    if (!startupId || !cached) { toast("Unknown solution record.", "warn"); return; }
    const m = v.matches.filter((x) => (x.startupId || (x.startup && x.startup.id)) === startupId).sort((a, b) => (Number(b.matchScore) || 0) - (Number(a.matchScore) || 0))[0] || {};

    const wrap = modal("Solution detail", `<div id="gwfSolBody">Loading startup intelligence\u2026</div>`);
    const body = $("#gwfSolBody", wrap);
    let intel = null, profile = null;
    const fallback = (data) => {
      const intl = data.capabilities || data.verifications || data.certifications || data.evidence || data.documents || data.profile || null;
      return intl;
    };
    try { profile = await api("/startups/" + startupId + "/profile"); } catch (_) { profile = cached.profile || null; }
    try { intel = await api("/startups/" + startupId + "/intelligence"); } catch (_) { intel = fallback(profile) ? { _flattened: true } : null; }

    const caps = intel && intel.capabilities ? intel.capabilities : [];
    const docs = intel && intel.documents ? intel.documents : [];
    const evid = intel && intel.evidence ? intel.evidence : [];
    const certs = intel && intel.certifications ? intel.certifications : [];
    const verf = intel && intel.verifications ? intel.verifications : [];
    const prof = (intel && intel.profile) || profile || cached;

    const eligFor = v.eligibility.filter((e) => e.startup && e.startup.id === startupId);
    body.innerHTML = `
      <div class="gwf-sol">
        <div class="gwf-sol-name">${esc(startupName(cached))}</div>
        <div class="gwf-sol-meta">${esc(startupMeta(cached))}</div>
        ${prof && prof.website ? `<div class="gwf-sol-row"><strong>Website</strong> ${esc(prof.website)}</div>` : ""}
        ${prof && prof.description ? `<div class="gwf-sol-row"><strong>About</strong> ${esc(prof.description)}</div>` : ""}
        ${cached.isDemo ? `<div class="gwf-sol-row"><span class="gcc-badge gcc-badge-info">demo profile</span></div>` : ""}
      </div>
      ${m.matchScore != null ? `<div class="gwf-sol-sec"><h4>Matching basis (deterministic engine)</h4>
        <div class="gwf-sol-row"><strong>Match ${esc(num(m.matchScore))}</strong> \u00b7 confidence ${esc(num(m.matchConfidence))}% \u00b7 tier ${esc(m.rankingTier || m.eligibilityStatus || "\u2014")}</div>
        ${m.matchExplanation ? `<div class="gwf-sol-row"><strong>Reason</strong> ${esc(m.matchExplanation)}</div>` : ""}
        ${(m.strengths || []).length ? `<div class="gwf-sol-row"><strong>Strengths</strong><ul class="gwf-sol-list">${m.strengths.slice(0, 8).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
        ${(m.gaps || []).length ? `<div class="gwf-sol-row"><strong>Gaps</strong><ul class="gwf-sol-list">${m.gaps.slice(0, 8).map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>` : ""}
        ${(m.riskFlags || []).length ? `<div class="gwf-sol-row"><strong>Risk flags</strong> ${m.riskFlags.slice(0, 8).map((f) => badge(f)).join(" ")}</div>` : ""}
      </div>` : ""}
      ${eligFor.length ? `<div class="gwf-sol-sec"><h4>Eligibility verdicts</h4>` + eligFor.map((e) => `<div class="gwf-sol-row">${badge(e.verdict)} ${esc(e.challengeTitle || e.challengeId)} \u00b7 ${esc(num(e.percent))}% \u00b7 ${fmtDate(e.evaluatedAt)}</div>`).join("") + `</div>` : ""}
      ${caps.length ? `<div class="gwf-sol-sec"><h4>Capabilities</h4><ul class="gwf-sol-list">${caps.slice(0, 12).map((c) => `<li>${esc(c.name || c.key || c)}</li>`).join("")}</ul></div>` : ""}
      ${certs.length ? `<div class="gwf-sol-sec"><h4>Certifications</h4><ul class="gwf-sol-list">${certs.slice(0, 12).map((c) => `<li>${esc(c.name || c)} ${c.status ? badge(c.status) : c.expiryStatus ? badge(c.expiryStatus) : ""}</li>`).join("")}</ul></div>` : ""}
      ${verf.length ? `<div class="gwf-sol-sec"><h4>Verifications</h4><ul class="gwf-sol-list">${verf.slice(0, 12).map((x) => `<li>${esc(x.type || x.verificationType || x.name || x)} ${x.status ? badge(x.status) : ""}</li>`).join("")}</ul></div>` : ""}
      ${evid.length ? `<div class="gwf-sol-sec"><h4>Evidence</h4><ul class="gwf-sol-list">${evid.slice(0, 12).map((e) => `<li>${esc(e.title || e.documentType || e.fileName || e.type || "evidence")}</li>`).join("")}</ul></div>` : ""}
      ${docs.length ? `<div class="gwf-sol-sec"><h4>Documents</h4><ul class="gwf-sol-list">${docs.slice(0, 12).map((d) => `<li>${esc(d.title || d.fileName || d.documentType || d)}</li>`).join("")}</ul></div>` : ""}
      <div class="gwf-sol-foot">
        <button type="button" class="btn btn-primary btn-sm" data-gwf-score="${esc(startupId)}">Start formal evaluation</button>
        <button type="button" class="btn btn-secondary btn-sm" data-gwf-pilot-from-sol="${esc(startupId)}">New pilot</button>
      </div>`;
    wrap.querySelectorAll("[data-gwf-score]").forEach((b) => b.addEventListener("click", () => { wrap.remove(); scoreSolutionModal(startupId); }));
    wrap.querySelectorAll("[data-gwf-pilot-from-sol]").forEach((b) => b.addEventListener("click", () => { wrap.remove(); newPilotModal(document.getElementById("govWorkflowBody"), startupId); }));
  }

  async function scoreSolutionModal(startupId) {
    const v = vm();
    const ch = primaryChallenge(v);
    if (!ch) { toast("No challenge is published for this problem yet.", "warn"); return; }
    const wrap = modal("Start formal evaluation", `<div class="gcc-state gcc-state-loading"><div class="gcc-spinner"></div><div class="gcc-state-msg">Preparing evaluation criteria\u2026</div></div>`);
    try {
      const { evaluation, criteria } = await startEvaluation(ch, startupId);
      wrap.querySelector(".gwf-modal-body").innerHTML = `
        <div class="gwf-sol-row"><strong>Evaluation created</strong> ${esc(evaluation.id)} \u00b7 template configured</div>
        <div class="gwf-sol-row gcc-cell-sub">Score each criterion (0\u2013${esc(criteria[0] ? (criteria[0].maxScore || 100) : 100)}). Weights are locked from the configured template.</div>
        ${criteria.map((c) => fieldWrap(esc(c.label) + (c.weight != null ? ` <span class="gcc-cell-sub">(weight ${esc(num(c.weight))}%)</span>` : ""),
          `<div class="gwf-score-row"><input class="input" name="score_${esc(c.key)}" type="number" min="0" max="${esc(c.maxScore || 100)}" placeholder="Score"> <input class="input" name="comment_${esc(c.key)}" placeholder="Comment (optional)"></div>`)).join("")}
        <div class="gwf-modal-actions">
          <button type="button" class="btn btn-primary" data-gwf-scores-submit>Submit scores &amp; finalize</button>
        </div>
        <div id="gwfScoreMsg"></div>`;
      wrap.querySelector("[data-gwf-scores-submit]").addEventListener("click", async () => {
        const scoresByKey = {}, commentsByKey = {};
        criteria.forEach((c) => {
          const s = wrap.querySelector(`[name="score_${c.key}"]`);
          const cm = wrap.querySelector(`[name="comment_${c.key}"]`);
          if (s && s.value) scoresByKey[c.key] = Number(s.value);
          if (cm && cm.value) commentsByKey[c.key] = cm.value;
        });
        if (criteria.some((c) => scoresByKey[c.key] == null)) {
          $("#gwfScoreMsg", wrap).innerHTML = `<div class="gwf-log-bad">Score all criteria before finalizing.</div>`;
          return;
        }
        const btn = wrap.querySelector("[data-gwf-scores-submit]");
        btn.disabled = true; btn.textContent = "Saving\u2026";
        try {
          const sub = await scoreAndSubmit(evaluation.id, criteria, scoresByKey, commentsByKey);
          $("#gwfScoreMsg", wrap).innerHTML = `<div class="gwf-log-ok">Evaluation submitted. Total ${esc(num(sub.summary && sub.summary.weightedTotal != null ? sub.summary.weightedTotal : (sub.summary && sub.summary.total)))} \u2014 awaiting aggregation for decision.</div>`;
          await refreshOverview();
          const root = document.getElementById("govWorkflowBody");
          if (root && root.querySelector("[data-gwf-find]")) renderWorkspace(root);
        } catch (err) {
          $("#gwfScoreMsg", wrap).innerHTML = `<div class="gwf-log-bad">${esc(err.message)}</div>`;
          btn.disabled = false; btn.textContent = "Submit scores & finalize";
        }
      });
    } catch (err) {
      wrap.querySelector(".gwf-modal-body").innerHTML = `<div class="gcc-state gcc-state-error"><div class="gcc-empty-icon">&#9888;</div><div class="gcc-state-msg">${esc(err.message)}</div></div>`;
    }
  }

  /* ───────────── pilot lifecycle ───────────── */
  const eligibleStartupOptions = () => {
    const v = vm();
    const eligIds = new Set(v.eligibility.filter((e) => e.verdict === "ELIGIBLE" || e.verdict === "DEFINITELY_ELIGIBLE").map((e) => e.startup && e.startup.id).filter(Boolean));
    const all = new Map();
    v.matches.forEach((m) => { const sid = m.startupId || (m.startup && m.startup.id); if (sid && !all.has(sid)) all.set(sid, m.startup); });
    v.applications.forEach((a) => { if (a.startup && a.startup.id && !all.has(a.startup.id)) all.set(a.startup.id, a.startup); });
    const rows = Array.from(all.values()).filter((s) => eligIds.has(s.id));
    return rows.length ? rows : Array.from(all.values());
  };

  function newPilotModal(root, startupId) {
    const v = vm();
    if (!v.challenges.length) { toast("Publish a challenge first.", "warn"); return; }
    const startups = eligibleStartupOptions();
    const wrap = modal("Launch pilot", `
      ${fieldWrap("Solution", selInput("startupId", startups.map((s) => [s.id, startupName(s)]), "required"))}
      ${fieldWrap("Challenge", selInput("challengeId", v.challenges.map((c) => [c.id, c.title || c.id]), "required"))}
      ${fieldWrap("Pilot title", textInput("title", "e.g. Patient flow pilot at PHC A", ""))}
      <div class="gwf-grid-2">
        ${fieldWrap("Location", textInput("location", "District", ""))}
        ${fieldWrap("Duration (days)", textInput("durationDays", "90", ""))}
        ${fieldWrap("Budget (INR)", textInput("budget", "200000", ""))}
        ${fieldWrap("Status", selInput("status", [["PLANNED", "PLANNED"], ["RUNNING", "RUNNING"]], ""))}
      </div>
      <div class="gwf-modal-actions"><button type="button" class="btn btn-primary" data-gwf-create-pilot>Create pilot</button></div>
      <div id="gwfPilotMsg"></div>`, { width: 620 });
    const sel = wrap.querySelector('[name="startupId"]');
    if (startupId && startups.some((s) => s.id === startupId)) sel.value = startupId;
    wrap.querySelector("[data-gwf-create-pilot]").addEventListener("click", async () => {
      const f = (n) => $(`[name="${n}"]`, wrap).value;
      const startupId = f("startupId"), challengeId = f("challengeId");
      if (!startupId || !challengeId) { $("#gwfPilotMsg", wrap).innerHTML = `<div class="gwf-log-bad">Select a solution and challenge.</div>`; return; }
      const orgId = v.problem.organizationId || state.orgId;
      const btn = wrap.querySelector("[data-gwf-create-pilot]");
      btn.disabled = true;
      try {
        const body = {
          challengeId, startupId, organizationId: orgId,
          title: f("title") || "Government pilot",
          location: f("location") || undefined,
          status: f("status") || "PLANNED",
        };
        const d = Number(f("durationDays")); if (d) body.durationDays = d;
        const b = Number(f("budget")); if (b) body.budget = b;
        const pilot = await api("/pilots", { method: "POST", body });
        toast("Pilot created.", "ok");
        await refreshOverview();
        wrap.remove();
        renderWorkspace(document.getElementById("govWorkflowBody"));
      } catch (err) {
        $("#gwfPilotMsg", wrap).innerHTML = `<div class="gwf-log-bad">${esc(err.message)}</div>`;
        btn.disabled = false;
      }
    });
  }

  function kpiModal(root, pilotId) {
    const wrap = modal("Add KPI", `
      ${fieldWrap("Name", textInput("name", "e.g. Average waiting time", ""))}
      ${fieldWrap("Unit", textInput("unit", "minutes", ""))}
      <div class="gwf-grid-2">
        ${fieldWrap("Baseline value", textInput("baselineValue", "45", ""))}
        ${fieldWrap("Target value", textInput("targetValue", "15", ""))}
      </div>
      ${fieldWrap("Status", selInput("status", [["TARGET", "TARGET"], ["BASELINE", "BASELINE"]], ""))}
      <div class="gwf-modal-actions"><button type="button" class="btn btn-primary" data-gwf-create-kpi>Create KPI</button></div>
      <div id="gwfKpiMsg"></div>`, { width: 520 });
    wrap.querySelector("[data-gwf-create-kpi]").addEventListener("click", async () => {
      const f = (n) => $(`[name="${n}"]`, wrap).value;
      try {
        const body = { name: f("name") || "KPI", unit: f("unit") || undefined, status: f("status") || "TARGET" };
        const b = Number(f("baselineValue")); if (b || f("baselineValue")) body.baselineValue = Number(f("baselineValue"));
        const t = Number(f("targetValue")); if (t || f("targetValue")) body.targetValue = Number(f("targetValue"));
        await api("/pilots/" + pilotId + "/kpis", { method: "POST", body });
        toast("KPI added.", "ok");
        await refreshOverview();
        wrap.remove();
        renderWorkspace(document.getElementById("govWorkflowBody"));
      } catch (err) {
        $("#gwfKpiMsg", wrap).innerHTML = `<div class="gwf-log-bad">${esc(err.message)}</div>`;
      }
    });
  }

  async function measureModal(root, pilotId) {
    let kpis = [];
    try {
      const full = await api("/pilots/" + pilotId);
      kpis = (full && full.kpis) || [];
    } catch (_) {}
    if (!kpis.length) {
      const v = vm();
      const p = (v.pilots || []).find((x) => x.id === pilotId);
      kpis = (p && p.kpis) || [];
    }
    if (!kpis.length) { toast("Add a KPI to this pilot before recording measurements.", "warn"); return; }
    const wrap = modal("Record measurement", `
      ${kpis.length > 1 ? fieldWrap("KPI", selInput("kpiId", kpis.map((k) => [k.id, k.name || k.id]), "required")) : ""}
      ${fieldWrap("Measured value", textInput("value", "12", ""))}
      ${fieldWrap("Source", textInput("source", "e.g. hospital system", ""))}
      ${fieldWrap("Recorded at (optional)", textInput("recordedAt", "", ""))}
      <div class="gwf-modal-actions"><button type="button" class="btn btn-primary" data-gwf-create-measure>Record</button></div>
      <div id="gwfMeasureMsg"></div>`, { width: 520 });
    const kpiDef = kpis.length === 1 ? kpis[0] : null;
    wrap.querySelector("[data-gwf-create-measure]").addEventListener("click", async () => {
      const f = (n) => $(`[name="${n}"]`, wrap).value;
      const kpiId = kpiDef ? kpiDef.id : f("kpiId");
      if (!kpiId) { $("#gwfMeasureMsg", wrap).innerHTML = `<div class="gwf-log-bad">Select a KPI.</div>`; return; }
      try {
        const body = { value: Number(f("value")), source: f("source") || undefined };
        if (f("recordedAt")) body.recordedAt = f("recordedAt");
        await api("/kpis/" + kpiId + "/measurements", { method: "POST", body });
        toast("Measurement recorded.", "ok");
        await refreshOverview();
        wrap.remove();
        renderWorkspace(document.getElementById("govWorkflowBody"));
      } catch (err) {
        $("#gwfMeasureMsg", wrap).innerHTML = `<div class="gwf-log-bad">${esc(err.message)}</div>`;
      }
    });
  }

  function resultModal(root, pilotId) {
    const wrap = modal("Record pilot result", `
      ${fieldWrap("Result", selInput("result", [["SUCCESSFUL", "SUCCESSFUL"], ["PARTIALLY_SUCCESSFUL", "PARTIALLY SUCCESSFUL"], ["INCONCLUSIVE", "INCONCLUSIVE"], ["FAILED", "FAILED"]], "required"))}
      ${fieldWrap("Recommendation", selInput("recommendation", [["SCALE", "SCALE"], ["CONDITIONAL_SCALE", "CONDITIONAL SCALE"], ["REPEAT_PILOT", "REPEAT PILOT"], ["MODIFY_SOLUTION", "MODIFY SOLUTION"], ["STOP", "STOP"]], "required"))}
      ${fieldWrap("Qualitative findings", `<textarea class="textarea input" name="notes" rows="3" placeholder="What worked, what did not\u2026"></textarea>`)}
      <div class="gwf-modal-actions"><button type="button" class="btn btn-primary" data-gwf-create-result>Record result</button></div>
      <div id="gwfResultMsg"></div>`, { width: 560 });
    wrap.querySelector("[data-gwf-create-result]").addEventListener("click", async () => {
      const f = (n) => $(`[name="${n}"]`, wrap).value;
      try {
        const body = { result: f("result"), recommendation: f("recommendation") };
        if (f("notes")) body.qualitativeFindings = f("notes");
        await api("/pilots/" + pilotId + "/results", { method: "POST", body });
        toast("Result recorded.", "ok");
        await refreshOverview();
        wrap.remove();
        renderWorkspace(document.getElementById("govWorkflowBody"));
      } catch (err) {
        $("#gwfResultMsg", wrap).innerHTML = `<div class="gwf-log-bad">${esc(err.message)}</div>`;
      }
    });
  }

  async function analyseModal(root, pilotId) {
    const wrap = modal("Post-pilot analysis", `<div class="gcc-state gcc-state-loading"><div class="gcc-spinner"></div><div class="gcc-state-msg">Running pilot analysis (AI or deterministic fallback)\u2026</div></div>`, { width: 640 });
    try {
      const out = await api("/pilots/" + pilotId + "/analysis", { method: "POST", body: {} });
      wrap.querySelector(".gwf-modal-body").innerHTML = `
        <div class="gwf-log-ok">Analysis mode: ${esc(out.mode || "\u2014")}</div>
        <div class="gwf-insight"><strong>AI Analysis (advisory):</strong><div style="margin-top:6px">${esc(out.answer || "\u2014")}</div></div>`;
      await refreshOverview();
      const b = document.getElementById("govWorkflowBody");
      if (b && b.querySelector("[data-gwf-find]")) renderWorkspace(b);
    } catch (err) {
      wrap.querySelector(".gwf-modal-body").innerHTML = `<div class="gcc-state gcc-state-error"><div class="gcc-empty-icon">&#9888;</div><div class="gcc-state-msg">${esc(err.message)}</div></div>`;
    }
  }

  /* ───────────── government decision ───────────── */
  function decisionModal(root) {
    const v = vm();
    const byStartup = new Map();
    v.aggregations.forEach((a) => {
      const sid = a.startupId;
      if (!sid) return;
      if (!byStartup.has(sid) || (Number(a.total) || 0) > (Number(byStartup.get(sid).total) || 0)) byStartup.set(sid, a);
    });
    if (!byStartup.size) {
      toast("No aggregated evaluation exists yet. Submit evaluations and run aggregation before deciding.", "warn");
      return;
    }
    const ch = primaryChallenge(v);
    const wrap = modal("Record Government decision", `
      ${fieldWrap("Challenge", selInput("challengeId", (ch ? [ch.id, ch.title || ch.id] : []), ""))}
      ${fieldWrap("Solution (must have an aggregated evaluation)", selInput("startupId", Array.from(byStartup.entries()).map(([sid]) => [sid, startupName(v.matches.map((m) => m.startup).find((s) => s && s.id === sid) || (v.applications.map((a) => a.startup).find((s) => s && s.id === sid)) || { id: sid })]), "required"))}
      ${fieldWrap("Decision", selInput("decision", [["PROCEED_TO_PILOT", "PROCEED TO PILOT"], ["REQUEST_MORE_INFORMATION", "REQUEST MORE INFORMATION"], ["HOLD", "HOLD"], ["DO_NOT_PROCEED", "DO NOT PROCEED"], ["CUSTOM", "CUSTOM"]], "required"))}
      ${fieldWrap("Stage", selInput("decisionStage", [["EVALUATION", "EVALUATION"], ["PILOT_SELECTION", "PILOT SELECTION"], ["REVIEW", "REVIEW"]], ""))}
      ${fieldWrap("Reason (required)", `<textarea class="textarea input" name="reason" rows="3" placeholder="Government justification \u2014 recorded in the audit trail"></textarea>`)}
      <div class="gwf-modal-actions"><button type="button" class="btn btn-primary" data-gwf-decide-save>Record decision</button></div>
      <div id="gwfDecideMsg"></div>`, { width: 620 });
    const saveBtn = wrap.querySelector("[data-gwf-decide-save]");
    saveBtn.addEventListener("click", async () => {
      const f = (n) => $(`[name="${n}"]`, wrap).value;
      const challengeId = f("challengeId"), startupId = f("startupId"), decision = f("decision"), reason = f("reason");
      if (!challengeId || !startupId || !reason.trim()) { $("#gwfDecideMsg", wrap).innerHTML = `<div class="gwf-log-bad">Challenge, solution and reason are required.</div>`; return; }
      saveBtn.disabled = true; saveBtn.textContent = "Aggregating & recording\u2026";
      try {
        let agg = null;
        try { agg = await api("/challenges/" + challengeId + "/evaluation/aggregate", { method: "POST", body: {} }); }
        catch (err) { $("#gwfDecideMsg", wrap).innerHTML = `<div class="gwf-log-bad">Aggregation failed \u2014 ${esc(err.message)}</div>`; saveBtn.disabled = false; saveBtn.textContent = "Record decision"; return; }
        let decisionRec = null;
        try {
          decisionRec = await api("/challenges/" + challengeId + "/evaluation/decision", {
            method: "POST",
            body: { startupId, decision, reason, decisionStage: f("decisionStage") || "EVALUATION", acknowledge: true },
          });
        } catch (err) {
          if (err.status === 400 && /BLOCKED|aggregation/i.test(err.message)) {
            decisionRec = await api("/challenges/" + challengeId + "/evaluation/decision", {
              method: "POST",
              body: { startupId, decision, reason, decisionStage: f("decisionStage") || "EVALUATION", acknowledge: true },
            });
          } else {
            $("#gwfDecideMsg", wrap).innerHTML = `<div class="gwf-log-bad">${esc(err.message)}</div>`;
            saveBtn.disabled = false; saveBtn.textContent = "Record decision";
            return;
          }
        }
        toast("Government decision recorded.", "ok");
        await refreshOverview();
        wrap.remove();
        renderWorkspace(document.getElementById("govWorkflowBody"));
      } catch (err) {
        $("#gwfDecideMsg", wrap).innerHTML = `<div class="gwf-log-bad">${esc(err.message)}</div>`;
        saveBtn.disabled = false; saveBtn.textContent = "Record decision";
      }
    });
  }

  /* ═════════════════════ table sort helpers ═════════════════════ */
  let sortState = {};
  function attachSorters(table) {
    table.querySelectorAll("th[data-k]").forEach((th) => {
      th.addEventListener("click", () => {
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

  /* ───────────── root renderer ───────────── */
  function showState(body, kind, message, detail) {
    const icon = kind === "loading" ? '<div class="gcc-spinner"></div>' : kind === "error" ? '<div class="gcc-empty-icon">&#9888;</div>' : '<div class="gcc-empty-icon">&#9889;</div>';
    body.innerHTML = `<div class="gcc-state gcc-state-${kind}">${icon}<div class="gcc-state-msg">${esc(message)}</div>${detail ? `<div class="gcc-cell-sub">${esc(detail)}</div>` : ""}</div>`;
  }

  async function load(root, orgId) {
    state.orgId = orgId;
    try {
      state.overview = await api("/overview?organizationId=" + encodeURIComponent(orgId));
    } catch (err) {
      showState(root, "error", "Could not load the problem workspace.", "Detail: " + (err && err.message ? err.message : "network error"));
      return;
    }
    const saved = (() => { try { return localStorage.getItem(KEY_PROBLEM) || ""; } catch (_) { return ""; } })();
    const prob = (state.overview.problems || []).find((p) => p.id === saved);
    state.problem = prob || null;
    if (state.problem) renderWorkspace(root); else renderSearch(root);
  }

  async function render() {
    const body = document.getElementById("govWorkflowBody");
    if (!body) return;
    showState(body, "loading", "Connecting to the SIH data layer\u2026");

    const saved = (() => { try { return localStorage.getItem(KEY_ORG) || ""; } catch (_) { return ""; } })();
    let orgs = [];
    try {
      const r = await api("/organizations");
      orgs = r.organizations || [];
    } catch (err) {
      showState(body, "error", "Could not load organizations.", "Detail: " + (err && err.message ? err.message : "network error"));
      return;
    }
    if (!orgs.length) {
      showState(body, "empty", "No Government organization is linked to this account yet.", "Register a Government organization to begin.");
      return;
    }
    const chosen = orgs.find((o) => o.id === saved && o.orgType === "GOVERNMENT") || orgs.find((o) => o.orgType === "GOVERNMENT") || orgs[0];
    try { localStorage.setItem(KEY_ORG, chosen.id); } catch (_) {}
    await load(body, chosen.id);
  }

  window.GovWorkflow = { render };
})();