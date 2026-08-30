/* ════════════════════════════════════════════════════════════════════
   ReguLens GOVERNMENT INTELLIGENCE — frontend experience layer
   ──────────────────────────────────────────────────────────────────
   Consumes the canonical /api/gov/* endpoints (server-side engine).
   One cached package powers all ten modules; every number shown here
   comes from that package or from /api/gov/simulate|compare|copilot.
   All static chrome is translated via window.GOV_I18N (i18n/gov-bundle.js).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const RC = () => window.ReguLensCharts || {};
  const GOV_VIEWS = [
    "gov-analyzer", "policy-simulator", "gov-stakeholders",
    "gov-outcomes", "industry-impact", "compare-scenarios", "gov-scenario",
    "gov-scale", "gov-copilot", "gov-consultations",
    "gov-workflow",
  ];
  const CHANGE_TYPES = ["stricter", "relaxed", "activate", "repeal"];
  const LS_KEY = "regulens.govContext.v1";

  /* ── state ── */
  const S = {
    ctx: loadCtx(),
    pkg: null,
    pkgKey: "",
    loading: false,
    error: null,
    simResult: null,
    simBusy: false,
    cmpSpecs: [],
    cmpResult: null,
    cmpBusy: false,
    scnResult: null,
    scnBusy: false,
    scnLastParams: null,
    scaleResult: null,
    scaleBusy: false,
    scaleLevel: "pilot",
    scaleFactors: {},
    scaleKPIs: {},
    clearlyLabeledProjections: {},
    scaleRecommendation: {},
  };
    outHorizon: "shortTerm",
    stkOpen: -1,
    anzQuery: "",
    chat: [],
    chatBusy: false,
    copMode: "",
    conSearch: "",
    conStatus: "all",
    activeView: "",
  };

  function loadCtx() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (raw && typeof raw === "object") {
        return {
          originId: String(raw.originId || "in"),
          targetId: String(raw.targetId || "jp"),
          industryId: String(raw.industryId || "fintech"),
          company: String(raw.company || ""),
          product: String(raw.product || ""),
        };
      }
    } catch {}
    return { originId: "in", targetId: "jp", industryId: "fintech", company: "", product: "" };
  }
  function saveCtx() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(S.ctx)); } catch {}
  }

  /* ── i18n helpers ── */
  function currentLang() {
    const api = window.ReguLens;
    if (api && typeof api.getLang === "function") return api.getLang() || "en";
    return "en";
  }
  function tr(key) {
    const G = window.GOV_I18N || {};
    const lang = currentLang();
    return (G[lang] && G[lang][key]) || (G.en && G.en[key]) || key;
  }
  const T = tr;

  /* ── tiny dom/format helpers ── */
  const $ = (id) => document.getElementById(id);
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function money(n) { return "$" + Number(n || 0).toLocaleString("en-US"); }
  function pct(n) { return Math.round(Number(n || 0)) + "%"; }
  function sevLabel(s) { return s === "Medium" ? T("gov.level.Moderate") : T("gov.level." + s); }
  function lvlClass(s) {
    const k = String(s || "").toLowerCase();
    if (k === "critical") return "critical";
    if (k === "high" || k === "very high") return "high";
    if (k === "moderate" || k === "medium") return "moderate";
    return "low";
  }
  function lvlBadge(level) {
    return `<span class="gov-badge lv-${lvlClass(level)}">${esc(sevLabel(level))}</span>`;
  }
  function stateBadge(state) {
    return `<span class="gov-state st-${String(state).toLowerCase()}">${esc(T("gov.state." + state))}</span>`;
  }
  function srcBadge(verified) {
    return verified
      ? `<span class="gov-badge src-ok">${esc(T("gov.badge.verified"))}</span>`
      : `<span class="gov-badge src-bad">${esc(T("gov.badge.unverified"))}</span>`;
  }
  function bar(score, cls) {
    return `<div class="gov-bar"><div class="gov-bar-fill ${cls || ""}" style="width:${Math.max(2, Math.min(100, Number(score) || 0))}%"></div></div>`;
  }
  function probBar(p) { // 0..100 likelihood
    return `<div class="gov-prob"><span>${pct(p)}</span>${bar(p, p >= 70 ? "fill-high" : p >= 40 ? "fill-mid" : "fill-low")}</div>`;
  }

  /* ── api ── */
  async function post(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
    return data;
  }
  function govCtx() {
    return {
      originId: S.ctx.originId,
      targetId: S.ctx.targetId,
      industryId: S.ctx.industryId,
      company: S.ctx.company,
      product: S.ctx.product,
    };
  }
  function ctxKey() { return [S.ctx.originId, S.ctx.targetId, S.ctx.industryId, S.ctx.company.trim().toLowerCase(), S.ctx.product.trim().toLowerCase()].join("|"); }

  async function ensurePkg(force) {
    const key = ctxKey();
    if (!force && S.pkg && S.pkgKey === key && S.pkgKey) return S.pkg;
    if (S.loading) return null;
    S.loading = true; S.error = null;
    paintActiveBody(loadingHtml());
    try {
      const pkg = await post("/api/gov/package", govCtx());
      S.pkg = pkg;
      S.pkgKey = ctxKey();
      adoptServerContext(pkg);
      fillCtxSlot(S.activeView);
    } catch (err) {
      S.error = err.message || String(err);
      paintActiveBody(errorHtml());
    } finally {
      S.loading = false;
    }
    return S.error ? null : S.pkg;
  }
  function adoptServerContext(pkg) {
    if (!pkg || !pkg.context) return;
    S.ctx.originId = pkg.context.originId;
    S.ctx.targetId = pkg.context.targetId;
    S.ctx.industryId = pkg.context.industryId;
    saveCtx();
  }

  /* ── shared paints ── */
  function loadingHtml() {
    return `<div class="gov-loading"><span class="spinner"></span><p>${esc(T("gov.common.loading"))}</p></div>`;
  }
  function errorHtml() {
    return `<div class="gov-error"><p>${esc(T("gov.common.error"))}</p><p class="gov-error-detail">${esc(S.error || "")}</p><button class="btn btn-primary btn-sm" onclick="window.ReguLensGov.retry()">${esc(T("gov.common.retry"))}</button></div>`;
  }
  function emptyHtml(msgKey) {
    return `<div class="gov-empty"><p>${esc(T(msgKey || "gov.empty.generic"))}</p></div>`;
  }
  function paintActiveBody(html) {
    const root = activeBodyRoot();
    if (root) root.innerHTML = html;
  }
  function activeBodyRoot() {
    const map = {
      "gov-analyzer": "govAnzBody",
      "policy-simulator": "simResultBody",
      "gov-stakeholders": "govStkBody",
      "gov-outcomes": "govOutBody",
      "industry-impact": "govIndWrap",
      "compare-scenarios": "cmpResultsWrap",
      "gov-scenario": "scnResultBody",
      "gov-copilot": "copBusyWrap",
      "gov-consultations": "conListWrap",
    };
    const id = map[S.activeView];
    return id ? $(id) : null;
  }

  function clearAllSlots(exceptView) {
    document.querySelectorAll(".gov-ctx-slot").forEach((slot) => {
      const sec = slot.closest(".view");
      if (!sec || sec.id !== "view-" + exceptView) slot.innerHTML = "";
    });
  }

  /* ── context bar ── */
  function fillCtxSlot(view) {
    clearAllSlots(view);
    const slot = document.querySelector(`#view-${view} .gov-ctx-slot`);
    if (!slot) return;
    const countries = (S.pkg && S.pkg.countries) || [];
    const industries = (S.pkg && S.pkg.industries) || [];
    const optC = (list, sel) => list.map((c) =>
      `<option value="${esc(c.id)}"${c.id === sel ? " selected" : ""}>${esc(c.flag ? c.flag + " " : "")}${esc(c.name)}</option>`).join("");
    const optI = (list, sel) => list.map((i) =>
      `<option value="${esc(i.id)}"${i.id === sel ? " selected" : ""}>${esc(i.name)}</option>`).join("");
    slot.innerHTML = `
      <div class="card gov-ctx-card">
        <div class="ctx-head">
          <h3 class="card-title">${esc(T("gov.ctx.title"))}</h3>
          <p class="ctx-desc">${esc(T("gov.ctx.desc"))}</p>
        </div>
        <div class="gov-form-grid">
          <div class="field">
            <label class="field-label" for="gctxCompany">${esc(T("gov.ctx.company"))}</label>
            <input type="text" class="input" id="gctxCompany" value="${esc(S.ctx.company)}" placeholder="${esc(S.pkg && S.pkg.context ? S.pkg.context.company : "")}" />
          </div>
          <div class="field">
            <label class="field-label" for="gctxProduct">${esc(T("gov.ctx.product"))}</label>
            <input type="text" class="input" id="gctxProduct" value="${esc(S.ctx.product)}" placeholder="${esc(S.pkg && S.pkg.context ? S.pkg.context.product : "")}" />
          </div>
          <div class="field">
            <label class="field-label" for="gctxOrigin">${esc(T("gov.ctx.origin"))}</label>
            <select class="select" id="gctxOrigin">${countries.length ? optC(countries, S.ctx.originId) : `<option>${esc(S.ctx.originId)}</option>`}</select>
          </div>
          <div class="field">
            <label class="field-label" for="gctxTarget">${esc(T("gov.ctx.target"))}</label>
            <select class="select" id="gctxTarget">${countries.length ? optC(countries, S.ctx.targetId) : `<option>${esc(S.ctx.targetId)}</option>`}</select>
          </div>
          <div class="field">
            <label class="field-label" for="gctxIndustry">${esc(T("gov.ctx.industry"))}</label>
            <select class="select" id="gctxIndustry">${industries.length ? optI(industries, S.ctx.industryId) : `<option>${esc(S.ctx.industryId)}</option>`}</select>
          </div>
          <div class="field field-btn ctx-btns">
            <button class="btn btn-primary" id="gctxApply">${esc(T("gov.ctx.apply"))}</button>
            <button class="btn btn-ghost" id="gctxSync">${esc(T("gov.ctx.sync"))}</button>
            <button class="btn btn-ghost" id="gctxReset">${esc(T("gov.ctx.reset"))}</button>
          </div>
        </div>
        <p class="field-hint">${esc(T("gov.ctx.hint"))}</p>
      </div>`;
    $("gctxApply").addEventListener("click", applyCtxFromInputs);
    $("gctxReset").addEventListener("click", () => {
      S.ctx = { originId: "in", targetId: "jp", industryId: "fintech", company: "", product: "" };
      saveCtx();
      render(S.activeView, true);
    });
    $("gctxSync").addEventListener("click", syncFromAnalysis);
  }
  function applyCtxFromInputs() {
    const g = (id) => ($(id) ? $(id).value.trim() : "");
    S.ctx = {
      originId: g("gctxOrigin") || S.ctx.originId,
      targetId: g("gctxTarget") || S.ctx.targetId,
      industryId: g("gctxIndustry") || S.ctx.industryId,
      company: g("gctxCompany"),
      product: g("gctxProduct"),
    };
    saveCtx();
    render(S.activeView, true);
  }
  function resolveCountryId(value) {
    const v = String(value == null ? "" : value).trim().toLowerCase();
    if (!v) return "";
    const countries = (S.pkg && S.pkg.countries) || [];
    const hit = countries.find((c) =>
      String(c.id).toLowerCase() === v ||
      String(c.name).toLowerCase() === v
    );
    return hit ? hit.id : "";
  }
  function syncFromAnalysis() {
    const api = window.ReguLens;
    const a = api && api.getState ? (api.getState().analysis || null) : null;
    if (!a) { toast(T("gov.empty.generic")); return; }
    /* analysis stores display names + target id; resolve ids via the
       canonical country list so the gov engine gets valid context */
    const next = {
      originId: resolveCountryId(a.originId || a.origin) || S.ctx.originId,
      targetId: resolveCountryId(a.targetId || a.target) || S.ctx.targetId,
      industryId: String(a.industryId || a.industry || S.ctx.industryId).toLowerCase(),
      company: a.company || "",
      product: a.product || "",
    };
    if (!next.industryId) next.industryId = S.ctx.industryId;
    S.ctx = next;
    saveCtx();
    render(S.activeView, true);
  }

  /* ── toast ── */
  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 2600);
  }

  /* ════════════════ MODULE: DASHBOARD (removed — the main ReguLens Dashboard already covers this) ════════════════ */
  function statCard(value, label) {
    return `<div class="card stat-card"><span class="stat-value">${esc(value)}</span><span class="stat-label">${esc(label)}</span></div>`;
  }

  /* ── render dispatcher ── */
  async function render(view, force) {
    if (!GOV_VIEWS.includes(view)) return;
    S.activeView = view;
    if (force) { S.pkgKey = ""; }
    const pkgReady = await ensurePkg(force);
    fillCtxSlot(view);
    /* Initialize workflow state if entering workflow view */
    if (view === "gov-workflow") {
      initWorkflow(S.pkg);
    }
    if (!pkgReady) return; // loading/error already painted
    switch (view) {
case "gov-analyzer": renderAnalyzer(pkgReady); break;
      case "policy-simulator": initSimulator(pkgReady); break;
      case "gov-stakeholders": renderStakeholders(pkgReady); break;
      case "gov-outcomes": renderOutcomes(pkgReady); break;
      case "industry-impact": renderIndustry(pkgReady); break;
      case "compare-scenarios": renderCompare(pkgReady); break;
      case "gov-scenario": initScenario(pkgReady); break;
      case "gov-scale": initScale(pkgReady); break;
      case "gov-copilot": initCopilot(pkgReady); break;
      case "gov-consultations": renderConsultations(pkgReady); break;
      case "gov-workflow": renderWorkflow(pkgReady); break;
    }
  }

  function retry() { render(S.activeView, true); }

  /* ════════════════ MODULE: ANALYZER ════════════════ */
  function renderAnalyzer(pkg) {
    const root = $("govAnzBody");
    if (!root) return;
    const ps = pkg.policies || [];
    const sorted = [...ps].sort((a, b) => b.overall - a.overall);
    const top = sorted[0];
    const authorities = [...new Set(ps.map((p) => p.authority))];
    const dimAgg = {};
    ps.forEach((p) => (p.dimensions || []).forEach((dm) => { dimAgg[dm.label] = (dimAgg[dm.label] || 0) + dm.score; }));
    const dimKeys = Object.keys(dimAgg);
    const topDim = dimKeys.length ? dimKeys.sort((a, b) => dimAgg[b] - dimAgg[a])[0] : null;
    const si = pkg.dashboard.sourceIntegrity;
    const q = S.anzQuery.trim().toLowerCase();
    const filtered = q
      ? ps.filter((p) => (p.title + " " + p.code + " " + p.authority + " " + p.policyType).toLowerCase().includes(q))
      : ps;

    root.innerHTML = `
      <div class="anz-grid">
        ${anzCard(T("gov.anz.q1"), `
          <p class="anz-big">${ps.length}</p>
          <div class="chip-row">${sorted.slice(0, 6).map((p) => `<button class="pol-chip" data-code="${esc(p.code)}">${esc(p.code)}</button>`).join("")}</div>
          ${ps.length > 6 ? `<button class="btn btn-ghost btn-sm" id="anzShowAll">${esc(T("gov.common.details"))} ↓</button>` : ""}
        `)}
        ${anzCard(T("gov.anz.q2"), top ? `
          <p>${esc(top.summary)}</p>
          <p class="dim">${esc(T("gov.common.relevance"))}: <strong>${top.relevance}%</strong> · ${esc(T("gov.common.type"))}: <strong>${esc(top.policyType)}</strong></p>
        ` : emptyHtml())}
        ${anzCard(T("gov.anz.q3"), `
          ${sorted.slice(0, 5).map((p) => `
            <div class="rank-row">
              <span class="rank-name">${esc(p.code)}</span>
              ${bar(p.overall)}
              <strong>${p.overall}</strong>
              ${lvlBadge(p.impactLevel)}
            </div>`).join("")}
        `)}
        ${anzCard(T("gov.anz.q4"), topDim ? `
          <p class="anz-big sm">${esc(topDim)}</p>
          ${bar(Math.round(dimAgg[topDim] / Math.max(1, ps.length)), "fill-high")}
          ${(p_dimBreakdown(top))}
        ` : emptyHtml())}
        ${anzCard(T("gov.anz.q5"), `
          <ul class="auth-list">
            ${authorities.slice(0, 8).map((a) => {
              const n = ps.filter((p) => p.authority === a).length;
              return `<li><span>${esc(a)}</span><span class="count">${n}</span></li>`;
            }).join("")}
          </ul>
        `)}
        ${anzCard(T("gov.anz.q6"), `
          <div class="si-inline">
            <span class="gov-badge src-ok">${esc(T("gov.badge.verified"))} ${si.verified}</span>
            <span class="gov-badge src-bad">${esc(T("gov.badge.unverified"))} ${si.unverified}</span>
          </div>
          <div class="src-links">
            ${ps.filter((p) => p.source && p.source.verified && p.source.url).slice(0, 4).map((p) =>
              `<a class="src-link" href="${esc(p.source.url)}" target="_blank" rel="noopener noreferrer">${esc(p.code)} ↗</a>`).join("")}
          </div>
        `)}
      </div>

      <div class="card">
        <div class="card-head anz-toolbar">
          <h3 class="card-title">${esc(T("gov.anz.title"))}</h3>
          <input type="text" class="input search-input" id="anzSearch" value="${esc(S.anzQuery)}" placeholder="${esc(T("gov.common.search"))}" />
        </div>
        <div class="table-wrap">
          <table class="req-table">
            <thead><tr><th>Code</th><th>Title</th><th>${esc(T("gov.common.type"))}</th><th>${esc(T("gov.common.status"))}</th><th>${esc(T("gov.common.effective"))}</th><th>${esc(T("gov.common.relevance"))}</th><th>${esc(T("gov.common.impactLevel"))}</th><th>Src</th><th></th></tr></thead>
            <tbody>
              ${filtered.map((p) => `
                <tr data-title="${esc(p.title)}">
                  <td><button class="link-btn pol-chip" data-code="${esc(p.code)}">${esc(p.code)}</button></td>
                  <td>${esc(p.title)}</td>
                  <td class="dim">${esc(p.policyType)}</td>
                  <td><span class="status-pill">${esc(p.status)}</span></td>
                  <td class="mono">${esc(p.effectiveDate || T("gov.common.na"))}</td>
                  <td>${p.relevance}%</td>
                  <td>${lvlBadge(p.impactLevel)}</td>
                  <td>${p.source && p.source.verified
                    ? `<a href="${esc(p.source.url)}" target="_blank" rel="noopener noreferrer" title="${esc(T("gov.common.sourceVerified"))}" class="src-ic ok">✓</a>`
                    : `<span title="${esc(T("gov.common.sourceUnverified"))}" class="src-ic bad">✕</span>`}</td>
                  <td><button class="btn btn-ghost btn-sm pol-detail" data-code="${esc(p.code)}">${esc(T("gov.common.details"))}</button></td>
                </tr>`).join("") || `<tr><td colspan="9">${emptyHtml("gov.empty.policies")}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;

    root.querySelectorAll(".pol-detail").forEach((b) =>
      b.addEventListener("click", () => openPolicyModal(b.dataset.code)));
    root.querySelectorAll(".pol-chip[data-code]").forEach((b) => {
      if (b.classList.contains("link-btn") || b.tagName === "BUTTON")
        b.addEventListener("click", () => openPolicyModal(b.dataset.code));
    });
    const search = $("anzSearch");
    if (search) search.addEventListener("input", () => { S.anzQuery = search.value; renderAnalyzer(pkg); });
    const showAll = $("anzShowAll");
    if (showAll) showAll.addEventListener("click", () => openPolicyModal(sorted[0].code));
    drawAnzDims(pkg);
  }
  function p_dimBreakdown(p) {
    return `<div class="dim-rows">${(p.dimensions || []).map((dm) => `
      <div class="status-row"><span class="status-name dim">${esc(dm.label)}</span>${bar(dm.score)}<span class="status-count">${dm.score}</span></div>`).join("")}</div>`;
  }
  function drawAnzDims(pkg) {
    // dimension bars are pure DOM (no chart canvas) — kept for clarity
  }
  function anzCard(q, bodyHtml) {
    return `<div class="card anz-card"><h4 class="anz-q">${esc(q)}</h4><div class="anz-a">${bodyHtml}</div></div>`;
  }

  /* ════════════════ MODULE: STAKEHOLDERS ════════════════ */
  function renderStakeholders(pkg) {
    const root = $("govStkBody");
    if (!root) return;
    const groups = pkg.stakeholders.groups || [];
    if (!groups.length) { root.innerHTML = emptyHtml(); return; }
    root.innerHTML = `
      <div class="stk-grid">
        ${groups.map((g, i) => {
          const open = S.stkOpen === i;
          const detail = (pkg.stakeholders.detail || []).filter((d) => d.group === g.group);
          return `
          <div class="card stk-card${open ? " open" : ""}">
            <button class="stk-head" data-i="${i}">
              <div>
                <h3 class="stk-name">${esc(g.group)}</h3>
                <p class="stk-who">${esc(detail[0] ? detail[0].who : "")}</p>
              </div>
              <div class="stk-score">
                <span class="stk-num">${g.maxImpact}</span>
                ${lvlBadge(g.impactLevel)}
              </div>
            </button>
            ${bar(g.maxImpact, g.maxImpact >= 78 ? "fill-high" : g.maxImpact >= 58 ? "fill-mid" : "")}
            <h4 class="sub-title">${esc(T("gov.stk.why"))}</h4>
            <ul class="concern-list">
              ${(g.concerns || []).map((c) => `<li>${esc(c)}</li>`).join("") || `<li>${esc(T("gov.common.none"))}</li>`}
            </ul>
            <h4 class="sub-title">${esc(T("gov.stk.touched"))} (${g.policies.length})</h4>
            <div class="chip-row">${g.policies.slice(0, 8).map((p) => `<span class="pol-tag">${esc(p)}</span>`).join("")}</div>
            ${detail.length ? `
              <button class="btn btn-ghost btn-sm stk-toggle" data-i="${i}">${open ? esc(T("gov.stk.hideDetail")) : esc(T("gov.stk.showDetail"))}</button>
              ${open ? `<div class="table-wrap"><table class="req-table">
                <thead><tr><th>${esc(T("gov.out.policyCol"))}</th><th>${esc(T("gov.stk.why"))}</th><th>${esc(T("gov.stk.peak"))}</th></tr></thead>
                <tbody>${detail.slice(0, 12).map((d) => `
                  <tr><td>${esc(d.policy)}</td><td class="dim">${esc(d.whyAffected)}</td><td>${lvlBadge(d.impactLevel)}</td></tr>`).join("")}
                </tbody></table></div>` : ""}` : ""}
          </div>`;
        }).join("")}
      </div>`;
    root.querySelectorAll("[data-i]").forEach((el) =>
      el.addEventListener("click", () => {
        const i = Number(el.dataset.i);
        S.stkOpen = S.stkOpen === i ? -1 : i;
        const pkg2 = S.pkg; if (pkg2) renderStakeholders(pkg2);
      }));
  }

  /* ════════════════ MODULE: OUTCOMES ════════════════ */
  function renderOutcomes(pkg) {
    const root = $("govOutBody");
    if (!root) return;
    document.querySelectorAll("#outTabs .tab").forEach((tb) =>
      tb.classList.toggle("active", tb.dataset.horizon === S.outHorizon));
    const items = (pkg.outcomes && pkg.outcomes[S.outHorizon]) || [];
    root.innerHTML = items.length ? `
      <div class="out-grid">
        ${items.map((o) => `
          <div class="card out-card">
            <div class="out-top">
              ${lvlBadge(o.severity === "Medium" ? "Moderate" : o.severity)}
              <span class="out-policy">${esc(o.policy)}</span>
            </div>
            <h3 class="out-title">${esc(o.title)}</h3>
            <p class="out-desc">${esc(o.description)}</p>
            <div class="out-prob">
              <span>${esc(T("gov.out.probability"))}</span>
              ${probBar(o.probability)}
            </div>
          </div>`).join("")}
      </div>` : emptyHtml();
  }

  /* ════════════════ MODULE: INDUSTRY IMPACT ════════════════ */
  function renderIndustry(pkg) {
    const head = $("govIndHead");
    const tbody = $("govIndTbody");
    if (!head || !tbody) return;
    const rows = [...(pkg.industryMatrix || [])].sort((a, b) => b.burdenScore - a.burdenScore);
    const myId = pkg.context.industryId;
    head.innerHTML = `
      <th>${esc(T("gov.ind.colIndustry"))}</th>
      <th>${esc(T("gov.ind.colAffected"))}</th>
      <th>${esc(T("gov.ind.colDirect"))}</th>
      <th>${esc(T("gov.ind.colHorizontal"))}</th>
      <th>${esc(T("gov.ind.colBurden"))}</th>
      <th>${esc(T("gov.ind.colReadiness"))}</th>
      <th>${esc(T("gov.common.riskLevel"))}</th>`;
    tbody.innerHTML = rows.map((r) => `
      <tr class="${r.industryId === myId ? "row-me" : ""}">
        <td>${esc(r.industryName)}${r.industryId === myId ? ` <span class="you-tag">${esc(T("gov.ind.yourIndustry"))}</span>` : ""}</td>
        <td>${r.affectedPolicies}</td>
        <td>${r.directPolicies}</td>
        <td>${r.horizontalPolicies}</td>
        <td class="burden-cell"><strong>${r.burdenScore}</strong>${bar(r.burdenScore, r.burdenScore >= 78 ? "fill-high" : r.burdenScore >= 58 ? "fill-mid" : "")}
          ${r.topDrivers && r.topDrivers.length ? `<div class="drivers">${esc(T("gov.ind.drivers"))}: ${esc(r.topDrivers.join("; "))}</div>` : ""}
        </td>
        <td>${r.readinessEstimate}%</td>
        <td>${lvlBadge(r.riskLevel)}</td>
      </tr>`).join("");
    drawIndustryChart(pkg);
  }
  function drawIndustryChart(pkg) {
    const rc = RC();
    if (!$("chartIndustryBurden")) return;
    if (!rc.createBarChart) return;
    const rows = (Array.isArray(pkg.industryMatrix) ? pkg.industryMatrix.slice() : [])
      .filter((r) => r && r.industryId && Number.isFinite(Number(r.burdenScore)))
      .sort((a, b) => Number(b.burdenScore) - Number(a.burdenScore))
      .slice(0, 10)
      .map((r) => ({
        id: r.industryId,
        name: String(r.industryName || r.industryId),
        score: Math.max(0, Math.min(100, Number(r.burdenScore))),
      }));
    if (!rows.length) { setChartState("chartIndustryBurden", "gov.empty.generic"); return; }
    drawGovChartSafe("chartIndustryBurden", () => rc.createBarChart(
      "chartIndustryBurden",
      rows.map((r) => r.name),
      rows.map((r) => r.score),
      rows.map((r) => (r.id === pkg.context.industryId ? "#6366f1" : r.score >= 78 ? "#dc2626" : r.score >= 58 ? "#f97316" : "#94a3b8")),
      { yMax: 100 }
    ));
  }

  /* ════════════════ MODULE: COMPARE SCENARIOS ════════════════ */
  function initCompareBuilder(pkg) {
    const typeSel = $("cmpType");
    const focusSel = $("cmpFocus");
    if (!typeSel) return;
    typeSel.innerHTML = CHANGE_TYPES.map((c) => `<option value="${c}">${esc(T("gov.sim.ct." + c))}</option>`).join("");
    focusSel.innerHTML = `<option value="">${esc(T("gov.sim.none"))}</option>` +
      (pkg.policies || []).map((p) => `<option value="${esc(p.policyId)}">${esc(p.code)} — ${esc(p.title)}</option>`).join("");
    const addBtn = $("cmpAddBtn");
    addBtn.onclick = async () => {
      if (S.cmpSpecs.length >= 3) return;
      const spec = {
        changeType: typeSel.value,
        implementationLevel: clampLevel($("cmpLevel").value),
        policyId: focusSel.value,
        horizonDays: 365,
      };
      S.cmpSpecs.push(spec);
      await runCompare();
    };
    renderCmpChips();
    renderCompareTable();
  }
  function clampLevel(v) {
    let n = Math.round(Number(v));
    if (!Number.isFinite(n)) n = 50;
    return Math.max(10, Math.min(100, n));
  }
  function specLabel(spec, pkg) {
    const ct = T("gov.sim.ct." + (CHANGE_TYPES.includes(spec.changeType) ? spec.changeType : "stricter"));
    if (spec.policyId) {
      const p = (pkg.policies || []).find((x) => x.policyId === spec.policyId);
      if (p) return `${ct} — ${p.code}`;
    }
    return `${ct} @${spec.implementationLevel}%`;
  }
  function renderCmpChips() {
    const box = $("cmpChips");
    if (!box) return;
    box.innerHTML = S.cmpSpecs.length
      ? `<div class="chip-row">${S.cmpSpecs.map((s, i) =>
          `<span class="cmp-chip"><span>S${i + 1} · ${esc(specLabel(s, S.pkg))}</span><button data-rm="${i}" aria-label="${esc(T("gov.cmp.remove"))}">✕</button></span>`).join("")}</div>`
      : "";
    box.querySelectorAll("[data-rm]").forEach((b) =>
      b.addEventListener("click", async () => {
        S.cmpSpecs.splice(Number(b.dataset.rm), 1);
        await runCompare();
      }));
  }
  async function runCompare() {
    renderCmpChips();
    if (!S.cmpSpecs.length) { S.cmpResult = null; renderCompareTable(); return; }
    S.cmpBusy = true;
    setBusy("cmpAddBtn", true);
    try {
      S.cmpResult = await post("/api/gov/compare", { ...govCtx(), scenarios: S.cmpSpecs });
    } catch (err) {
      toast(err.message || T("gov.common.error"));
      S.cmpResult = null;
    } finally {
      S.cmpBusy = false;
      setBusy("cmpAddBtn", false);
    }
    renderCompareTable();
  }
  function metricRow(label, fn) {
    const res = S.cmpResult;
    if (!res) return "";
    const cells = [fn(res.baseline, "base")].concat(res.scenarios.map((s) => fn(s, "scn")));
    return `<tr><td class="dim">${esc(label)}</td>${cells.map((v) => `<td>${v == null || v.error ? esc(T("gov.common.na")) : v}</td>`).join("")}</tr>`;
  }
  function renderCompareTable() {
    const head = $("cmpHead");
    const tbody = $("cmpTbody");
    if (!head || !tbody) return;
    const res = S.cmpResult;
    const cols = ["—"].concat(res ? res.scenarios.map((s, i) => s.error ? `S${i + 1}` : `S${i + 1}`) : []);
    head.innerHTML = `<th></th><th>${esc(T("gov.cmp.baselineName"))}</th>` + (res ? res.scenarios.map((s, i) => `<th>S${i + 1}${s.error ? " ⚠" : ""}</th>`).join("") : "");
    if (!res) { tbody.innerHTML = `<tr><td colspan="2">${emptyHtml()}</td></tr>`; setChartState("chartCompareGov", "gov.empty.generic"); return; }
    tbody.innerHTML =
      metricRow(T("gov.cmp.mCost"), (x) => x.cost != null ? money(x.cost) : null) +
      metricRow(T("gov.cmp.mDays"), (x) => x.days != null ? `${x.days} <small>${esc(T("gov.common.days"))}</small>` : null) +
      metricRow(T("gov.cmp.mReqs"), (x) => x.requirements != null ? x.requirements : null) +
      metricRow(T("gov.cmp.mImpact"), (x) => x.avgImpact != null ? `${x.avgImpact}/100` : null) +
      metricRow(T("gov.cmp.mVerdict"), (x) => x.verdict ? stateBadge(x.verdict) : null);
    drawCompareChart(res);
  }
  function drawCompareChart(res) {
    const rc = RC();
    if (!$("chartCompareGov") || !rc.createGroupedBarChart) return;
    if (!res || !res.baseline || !Array.isArray(res.scenarios) || !res.scenarios.length) {
      setChartState("chartCompareGov", "gov.empty.generic");
      return;
    }
    const base = res.baseline;
    const labels = [T("gov.cmp.mCost"), T("gov.cmp.mDays"), T("gov.cmp.mReqs")].map((l) => l.replace(/\s*\(\$\)$/, ""));
    const series = [{ key: "cost", color: "#6366f1", base: Number(base.cost) }, { key: "days", color: "#06b6d4", base: Number(base.days) }, { key: "requirements", color: "#22c55e", base: Number(base.requirements) }];
    const rel = (val, baseVal) => (val == null || !Number.isFinite(Number(val)) || !Number.isFinite(baseVal) || baseVal <= 0) ? null : Math.round((Number(val) / baseVal) * 100);
    const datasets = [
      { label: T("gov.cmp.baselineName"), data: [100, 100, 100], color: "#94a3b8" },
    ].concat(res.scenarios.map((s, i) => ({
      label: `S${i + 1}`,
      data: series.map((sr) => s.error ? null : rel(s[sr.key], sr.base)),
      color: ["#6366f1", "#06b6d4", "#f97316"][i % 3],
    })));
    drawGovChartSafe("chartCompareGov", () => rc.createGroupedBarChart("chartCompareGov", labels, datasets, {}));
  }
  function destroyGovChart(canvasId) {
    const rc = RC();
    if (!rc) return;
    try {
      /* Use trackChart with a self-destroying placeholder to properly clear the
         registry slot. trackChart will destroy the old instance before storing. */
      var placeholder = { destroy: function() {} };
      if (rc.trackChart) rc.trackChart(canvasId, placeholder);
    } catch (_) { /* ignore cleanup errors */ }
  }
  /* chart container state helpers: empty / failed messages replace the canvas content */
  function setChartState(canvasId, msgKey) {
    destroyGovChart(canvasId);
    const cv = $(canvasId);
    if (!cv) return;
    const cont = cv.closest(".chart-card") || cv.parentElement;
    if (!cont) return;
    cont.querySelectorAll(".gov-chart-empty").forEach((n) => n.remove());
    if (msgKey) {
      const note = document.createElement("p");
      note.className = "gov-chart-empty";
      note.textContent = T(msgKey);
      cont.appendChild(note);
    }
  }
  function clearChartState(canvasId) {
    const cv = $(canvasId);
    if (!cv) return;
    const cont = cv.closest(".chart-card") || cv.parentElement;
    if (cont) cont.querySelectorAll(".gov-chart-empty").forEach((n) => n.remove());
  }
  function drawGovChartSafe(canvasId, fn) {
    clearChartState(canvasId);
    try {
      fn();
    } catch (err) {
      console.error("[gov] chart render failed:", err);
      setChartState(canvasId, "gov.common.error");
    }
  }
  function setBusy(id, busy) {
    const el = $(id);
    if (!el) return;
    el.disabled = !!busy;
    el.classList.toggle("loading", !!busy);
  }
  function renderCompare(pkg) {
    initCompareBuilder(pkg);
  }

  function renderScale(pkg) {
    const root = $("govScaleBody");
    if (!root) return;
    const analysis = S.scaleAnalysis || {};
    const recommendation = S.scaleRecommendation || {};
    const factors = S.scaleFactors || {};
    const kpis = S.scaleKPIs || {};
    const projections = S.clearLabeledProjections || {};

    root.innerHTML = `
      <div class="card scn-card">
        <div class="card-head">
          <h3 class="card-title">${esc(T("gov.scl.title"))}</h3>
          <span class="scenario-name">${esc(T("gov.scl.level", { level: T("gov.scl.levels." + analysis.scalingLevel) }))}</span>
        </div>
        <div class="table-wrap">
          <table class="req-table factor-table">
            <thead>
              <tr>
                <th>${esc(T("gov.scl.factor"))}</th>
                <th>${esc(T("gov.scl.score"))}</th>
                <th>${esc(T("gov.scl.label"))}</th>
                <th>${esc(T("gov.scl.description"))}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(factors).map(([key, f]) => `
                <tr>
                  <td>${esc(T("gov.scl.factor." + key))}</td>
                  <td>${f.score}/100</td>
                  <td>${esc(f.label)}</td>
                  <td>${esc(f.description)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="grid grid-2 gov-kpis">
          ${statCard(kpis.usersImpacted ?? "—", T("gov.scl.kpiUsers"))}
          ${statCard(kpis.costSaving ?? "—", T("gov.scl.kpiCostSaving"))}
          ${statCard(kpis.efficiency ?? "—", T("gov.scl.kpiEfficiency"))}
          ${statCard(kpis.satisfaction ?? "—", T("gov.scl.kpiSatisfaction"))}
        </div>
        <details class="assump-box" open>
          <summary>${esc(T("gov.scl.assumptions"))}</summary>
          <ul>${(analysis.assumptions || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
          <p class="trace-line mono">${esc(projections.cost || "")}</p>
        </details>
        ${recommendation.recommendation ? `
          <div class="rec-badge ${recommendation.recommendation.toLowerCase().replace(/\s+/g, "-")}">
            <strong>${esc(T("gov.scl.rec." + recommendation.recommendation))}</strong>
            ${recommendation.evidence.map((e) => `<p>${esc(e)}</p>`).join("")}
          </div>` : ""}
      </div>`;
  }

  /* ════════════════ SCALE & GOVERNMENT IMPACT INTELLIGENCE ════════════════ */
  function initScale(pkg) {
    if (!S.scaleResult) {
      post("/api/scale/analyze", govCtx()).then((resp) => {
        if (resp && !resp.error) {
          S.scaleAnalysis = resp.scaleAnalysis;
          S.scaleRecommendation = resp.recommendation;
          S.scaleFactors = resp.scaleAnalysis ? resp.scaleAnalysis.techMetrics : {};
          S.scaleKPIs = resp.scaleAnalysis ? resp.scaleAnalysis.impactKPIs : {};
          S.clearLabeledProjections = resp.scaleAnalysis ? resp.scaleAnalysis.clearLabeledProjections : {};
          S.scaleRecommendation = resp.recommendation;
          renderScale(S.pkg);
        }
      });
    } else {
      renderScale(pkg);
    }
  }

  /* ════════════════ GOVERNMENT INNOVATION & PROCUREMENT WORKFLOW ════════════════ */
  function renderWorkflow(pkg) {
    const stage = S.workflowStage || "01-register";
    const progress = S.workflowProgress || {};
    const pkgCtx = pkg && pkg.context ? pkg.context : {};
    
    /* Build stage data from actual pkg state */
    const stageData = {
      "01-register": {
        title: "01 REGISTER",
        desc: "Business Registration",
        status: progress["01-register"] || "pending",
        completed: progress["01-register"] === "completed",
        /* Connect to business registration via pkg data */
        business: pkgCtx.company ? { name: pkgCtx.company, industry: pkgCtx.industryName || "Not specified", product: pkgCtx.product || "Not specified", teamSize: pkgCtx.teamSize || "Not specified", experienceYears: pkgCtx.experienceYears || "Not specified", certifications: pkgCtx.certifications || "Not recorded" } : null,
        cta: "View Profile",
        ctaUrl: "#",
        items: []
      },
      "02-verify": {
        title: "02 VERIFY",
        desc: "Verification",
        status: progress["02-verify"] || "pending",
        completed: progress["02-verify"] === "completed",
        items: []
      },
      "03-gov-problem": {
        title: "03 GOVERNMENT PROBLEM",
        desc: "Government Problem",
        status: progress["03-gov-problem"] || "pending",
        completed: progress["03-gov-problem"] === "completed",
        problem: pkgCtx.targetName ? { name: pkgCtx.targetName } : null,
        cta: "Post Problem",
        ctaUrl: "/#",
        items: []
      },
      "04-ai-matching": {
        title: "04 AI MATCHING",
        desc: "AI Matching",
        status: progress["04-ai-matching"] || "pending",
        completed: progress["04-ai-matching"] === "completed",
        businesses: pkgCtx.matchedBusinesses || []
        cta: "Find Solutions",
        ctaUrl: "#",
        items: []
      },
      "05-select-business": {
        title: "05 SELECT BUSINESS",
        desc: "Select Business",
        status: progress["05-select-business"] || "pending",
        completed: progress["05-select-business"] === "completed",
        businesses: pkgCtx.selectedBusiness ? [pkgCtx.selectedBusiness] : []
        cta: "Review Solutions",
        ctaUrl: "#",
        items: []
      },
      "06-analyze": {
        title: "06 ANALYZE",
        desc: "Analysis",
        status: progress["06-analyze"] || "pending",
        completed: progress["06-analyze"] === "completed",
        cta: "View Analysis",
        ctaUrl: "#",
        items: []
      },
      "07-decision": {
        title: "07 DECISION",
        desc: "Decision Point",
        status: progress["07-decision"] || "pending",
        completed: progress["07-decision"] === "completed",
        cta: "Make Decision",
        ctaUrl: "#",
        items: []
      },
      "08-predict": {
        title: "08 PREDICT / TEST",
        desc: "Predict / Test",
        status: progress["08-predict"] || "pending",
        completed: progress["08-predict"] === "completed",
        cta: "Run Scenarios",
        ctaUrl: "#",
        items: []
      },
      "09-pilot": {
        title: "09 PILOT",
        desc: "Pilot",
        status: progress["09-pilot"] || "pending",
        completed: progress["09-pilot"] === "completed",
        cta: "Manage Pilot",
        ctaUrl: "#",
        items: []
      },
      "10-procurement": {
        title: "10 PROCUREMENT READINESS",
        desc: "Procurement Readiness",
        status: progress["10-procurement"] || "pending",
        completed: progress["10-procurement"] === "completed",
        cta: "Check Readiness",
        ctaUrl: "#",
        items: []
      },
      "11-scale": {
        title: "11 SCALE",
        desc: "Scale",
        status: progress["11-scale"] || "pending",
        completed: progress["11-scale"] === "completed",
        cta: "Scale Analysis",
        ctaUrl: "#",
        items: []
      }
    };
    
    const current = stageData[stage] || stageData["01-register"];
    const allStages = Object.values(stageData);
    const completedStages = allStages.filter(s => s.completed);
    const pendingStages = allStages.filter(s => !s.completed && s.status !== "completed");
    
    /* Determine progress bar widths */
    const stageOrder = ["01-register", "02-verify", "03-gov-problem", "04-ai-matching", "05-select-business", "06-analyze", "07-decision", "08-predict", "09-pilot", "10-procurement", "11-scale"];
    const stageProgress = stageOrder.map((s, i) => {
      const d = stageData[s];
      const isCompleted = d.completed;
      const isCurrent = s === stage;
      const pct = isCompleted ? 100 : isCurrent ? 100 : Math.round(((i + 1) / stageOrder.length) * 100);
      return { stage: s, percent: pct, completed: isCompleted, current: isCurrent };
    });
    
    /* Count actual completed from pkg if available */
    let actualCompleted = 0;
    if (pkg) {
      /* Try to derive from pkg state */
      const dv = pkg.dashboard || {};
      const st = dv.stats || {};
      /* Use dashboard stats if available */
      if (st.total) actualCompleted = Math.min(actualCompleted + 1, 11);
    }
    
    /* Build the HTML */
    const stagesHTML = allStages.map((s, i) => {
      const isCompleted = s.completed;
      const isCurrent = s.title === current.title;
      const cls = isCompleted ? "completed" : isCurrent ? "current" : "";
      const pct = stageProgress.find(sp => sp.stage === s.title.replace(/^0\d+\s*/, ""))?.percent || (isCompleted ? 100 : 0);
      return `
        <div class="workflow-stage ${cls}" data-stage="${s.title.replace(/^0\d+\s*/, "")}" style="--progress:${pct}%">
          <div class="stage-number">${s.title}</div>
          <div class="stage-desc">${s.desc}</div>
          <span class="stage-status ${isCompleted ? "completed" : "pending"}">${esc(T(`gov.wf.${s.title.replace(/^0\d+\s*/, "").toLowerCase()}`) || s.desc)}</span>
        </div>
      `;
    }).join("");
    
    /* CTA button */
    const ctaBtn = current.cta ? `
      <button class="btn workflow-cta" data-stage="${current.title.replace(/^0\d+\s*/, "")}">
        ${esc(current.cta)}
      </button>` : "";
    
    return `
      <div class="workflow-visualization">
        <div class="workflow-header">
          <h2>${esc(T("gov.wf.title") || "Government Innovation & Procurement Workflow")}</h2>
          <p>${esc(T("gov.wf.subtitle") || "From Government Problem to Verified Solution, Pilot, Procurement & Scale")}</p>
        </div>
        <div class="workflow-stages">
          ${stagesHTML}
        </div>
        ${ctaBtn}
        <div class="workflow-progress-bar">
          <div class="progress-fill" style="width: ${stageProgress.reduce((sum, sp) => sum + sp.percent, 0) / stageProgress.length}%"></div>
        </div>
        <div class="workflow-status">
          ${completedStages.length} of ${allStages.length} stages completed
        </div>
      </div>`;
  }

  /* ════════════════ MODULE: SCENARIO SIMULATOR ════════════════ */
  function initScenario(pkg) {
    const typeSel = $("scnType");
    const focusSel = $("scnFocus");
    if (!typeSel) return;
    typeSel.innerHTML = CHANGE_TYPES.map((c) => `<option value="${c}">${esc(T("gov.sim.ct." + c))}</option>`).join("");
    focusSel.innerHTML = `<option value="">${esc(T("gov.sim.none"))}</option>` +
      (pkg.policies || []).map((p) => `<option value="${esc(p.policyId)}">${esc(p.code)} — ${esc(p.title)}</option>`).join("");
    if (!S.scnLastParams) {
      typeSel.value = "stricter";
    } else {
      typeSel.value = S.scnLastParams.changeType || "stricter";
      $("scnLevel").value = S.scnLastParams.implementationLevel || 60;
      focusSel.value = S.scnLastParams.policyId || "";
    }
    $("scnRunBtn").onclick = runScenario;
    if (S.scnResult) paintScnResult(S.scnResult);
  }
  let scnLastParams = null;
  async function runScenario() {
    const pkg = S.pkg;
    if (!pkg || S.scnBusy) return;
    const params = {
      changeType: ($("scnType") || {}).value || "stricter",
      implementationLevel: clampLevel($("scnLevel").value),
      policyId: ($("scnFocus") || {}).value || "",
      horizonDays: 365,
    };
    scnLastParams = params;
    S.scnBusy = true;
    setBusy("scnRunBtn", true);
    const root = $("scnResultBody");
    if (root) root.innerHTML = loadingHtml();
    try {
      S.scnResult = await post("/api/gov/simulate", { ...govCtx(), ...params });
    } catch (err) {
      if (root) root.innerHTML = `<div class="gov-error"><p>${esc(T("gov.sim.error"))}</p><p class="gov-error-detail">${esc(err.message || "")}</p></div>`;
      S.scnBusy = false; setBusy("scnRunBtn", false);
      return;
    }
    S.scnBusy = false;
    setBusy("scnRunBtn", false);
    paintScnResult(S.scnResult);
  }
  function deltaCell(before, after, fmt) {
    const d = after - before;
    const cls = d > 0 ? "d-up" : d < 0 ? "d-down" : "d-flat";
    const arrow = d > 0 ? "▲" : d < 0 ? "▼" : "＝";
    return `
      <td class="mono dim">${fmt(before)}</td>
      <td class="mono"><strong>${fmt(after)}</strong></td>
      <td class="mono ${cls}">${arrow} ${fmt(Math.abs(d))}</td>`;
  }
  function paintScnResult(res) {
    const root = $("scnResultBody");
    if (!root) return;
    const dl = res.deltas || {};
    const sp = res.simulatedPackage || {};
    const spd = sp.dashboard || {};
    const shifts = res.industryShifts || [];
    root.innerHTML = `
      <div class="card scn-card">
        <div class="card-head">
          <h3 class="card-title">${esc(T("gov.sim.resultTitle"))}</h3>
          <span class="scenario-name">${esc(res.scenario.name)}</span>
        </div>
        <div class="table-wrap">
          <table class="req-table delta-table">
            <thead><tr><th></th><th>${esc(T("gov.sim.before"))}</th><th>${esc(T("gov.sim.after"))}</th><th>${esc(T("gov.sim.delta"))}</th></tr></thead>
            <tbody>
              <tr><td class="dim">${esc(T("gov.sim.dCost"))}</td>${deltaCell(dl.cost.baseline, dl.cost.simulated, money)}</tr>
              <tr><td class="dim">${esc(T("gov.sim.dDays"))}</td>${deltaCell(dl.days.baseline, dl.days.simulated, (n) => n)}</tr>
              <tr><td class="dim">${esc(T("gov.sim.dReqs"))}</td>${deltaCell(dl.requirements.baseline, dl.requirements.simulated, (n) => n)}</tr>
              <tr><td class="dim">${esc(T("gov.sim.dImpact"))}</td>${deltaCell(dl.avgImpact.baseline, dl.avgImpact.simulated, (n) => n)}</tr>
              <tr>
                <td class="dim">${esc(T("gov.sim.verdict"))}</td>
                <td colspan="3">${stateBadge(dl.verdictBefore)} <span class="vs-arrow">→</span> ${stateBadge(dl.verdictAfter)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="grid grid-2">
          <div>
            <h4 class="sub-title">${esc(T("gov.sim.industryShifts"))}</h4>
            <table class="req-table">
              <thead><tr><th></th><th>${esc(T("gov.sim.before"))}</th><th>${esc(T("gov.sim.after"))}</th><th>Δ</th></tr></thead>
              <tbody>${shifts.map((s) => `
                <tr><td>${esc(s.industryName)}</td><td class="mono dim">${s.before}</td><td class="mono">${s.after}</td>
                <td class="mono ${s.delta > 0 ? "d-up" : s.delta < 0 ? "d-down" : "d-flat"}">${s.delta > 0 ? "+" : ""}${s.delta}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
          <div>
            <h4 class="sub-title">${esc(T("gov.scn.livePkg"))}</h4>
            <div class="grid grid-2 gov-kpis">
              ${statCard((spd.totals || {}).policies ?? "—", T("gov.dash.kpiPolicies"))}
              ${statCard((spd.totals || {}).obligations ?? "—", T("gov.dash.kpiObligations"))}
              ${statCard(money(((sp.actionPlan || {}).totalCost)), T("gov.dash.kpiCost"))}
              ${statCard((((sp.actionPlan || {}).timeline || {}).totalDays) ?? "—", T("gov.dash.kpiTimeline"))}
            </div>
          </div>
        </div>
        <details class="assump-box" open>
          <summary>${esc(T("gov.scn.traceability"))}</summary>
          <ul>${(res.assumptions || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
          <p class="trace-line mono">${esc(dl.cost.trace || "")}</p>
        </details>
      </div>`;
  }

  /* ════════════════ MODULE: POLICY IMPACT SIMULATOR ════════════════ */
  function initSimulator(pkg) {
    const sel = $("simPolicySelect");
    const ctSel = $("simChangeType");
    if (!sel || !ctSel) return;
    sel.innerHTML = (pkg.policies || []).map((p) =>
      `<option value="${esc(p.policyId)}">${esc(p.code)} — ${esc(p.title)}</option>`).join("");
    ctSel.innerHTML = CHANGE_TYPES.map((c) => `<option value="${c}">${esc(T("gov.sim.ct." + c))}</option>`).join("");
    $("simRunBtn").onclick = runSimulator;
    if (S.prefillSim) {
      const found = [...sel.options].find((o) => o.value === S.prefillSim);
      if (found) sel.value = S.prefillSim;
      S.prefillSim = "";
      runSimulator();
    }
  }
  async function runSimulator() {
    if (S.simBusy) return;
    const params = {
      changeType: ($("simChangeType") || {}).value || "stricter",
      implementationLevel: clampLevel($("simImplLevel").value),
      policyId: ($("simPolicySelect") || {}).value || "",
      horizonDays: Number(($(("simHorizon") || {})).value) || 365,
    };
    S.simBusy = true;
    setBusy("simRunBtn", true);
    const root = $("simResultBody");
    if (root) root.innerHTML = loadingHtml();
    try {
      S.simResult = await post("/api/gov/simulate", { ...govCtx(), ...params });
      paintSimResult($("simResultBody"), S.simResult);
    } catch (err) {
      if (root) root.innerHTML =
        `<div class="gov-error"><p>${esc(T("gov.sim.error"))}</p><p class="gov-error-detail">${esc(err.message || "")}</p></div>`;
    }
    S.simBusy = false;
    setBusy("simRunBtn", false);
  }
  function paintSimResult(root, res) {
    if (!root) return;
    const dl = res.deltas || {};
    const shifts = res.industryShifts || [];
    root.innerHTML = `
      <div class="card scn-card">
        <div class="card-head">
          <h3 class="card-title">${esc(T("gov.sim.resultTitle"))}</h3>
          <span class="scenario-name">${esc(res.scenario.name)}</span>
        </div>
        <div class="table-wrap">
          <table class="req-table delta-table">
            <thead><tr><th></th><th>${esc(T("gov.sim.before"))}</th><th>${esc(T("gov.sim.after"))}</th><th>${esc(T("gov.sim.delta"))}</th></tr></thead>
            <tbody>
              <tr><td class="dim">${esc(T("gov.sim.dCost"))}</td>${deltaCell(dl.cost.baseline, dl.cost.simulated, money)}</tr>
              <tr><td class="dim">${esc(T("gov.sim.dDays"))}</td>${deltaCell(dl.days.baseline, dl.days.simulated, (n) => n)}</tr>
              <tr><td class="dim">${esc(T("gov.sim.dReqs"))}</td>${deltaCell(dl.requirements.baseline, dl.requirements.simulated, (n) => n)}</tr>
              <tr><td class="dim">${esc(T("gov.sim.dImpact"))}</td>${deltaCell(dl.avgImpact.baseline, dl.avgImpact.simulated, (n) => n)}</tr>
              <tr>
                <td class="dim">${esc(T("gov.sim.verdict"))}</td>
                <td colspan="3">${stateBadge(dl.verdictBefore)} <span class="vs-arrow">→</span> ${stateBadge(dl.verdictAfter)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ${shifts.length ? `<h4 class="sub-title">${esc(T("gov.sim.industryShifts"))}</h4>
        <table class="req-table"><tbody>${shifts.slice(0, 4).map((s) => `
          <tr><td>${esc(s.industryName)}</td><td class="mono dim">${s.before}</td><td class="mono">${s.after}</td>
          <td class="mono ${s.delta > 0 ? "d-up" : s.delta < 0 ? "d-down" : "d-flat"}">${s.delta > 0 ? "+" : ""}${s.delta}</td></tr>`).join("")}
        </tbody></table>` : ""}
        <details class="assump-box" open>
          <summary>${esc(T("gov.scn.traceability"))}</summary>
          <ul>${(res.assumptions || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
          <p class="trace-line mono">${esc(dl.cost.trace || "")}</p>
        </details>
      </div>`;
  }

  function paintScnResult(res) {
    paintSimResult($("scnResultBody"), res);
    if (!$("scnResultBody")) return;
    const root = $("scnResultBody");
    const sp = res.simulatedPackage || {};
    const spd = sp.dashboard || {};
    const live = document.createElement("div");
    live.className = "grid grid-2 gov-kpis";
    live.style.marginTop = "14px";
    live.innerHTML =
      statCard((spd.totals || {}).policies ?? "—", T("gov.dash.kpiPolicies")) +
      statCard((spd.totals || {}).obligations ?? "—", T("gov.dash.kpiObligations"));
    root.appendChild(live);
  }

  /* ════════════════ MODULE: GOVERNMENT COPILOT ════════════════ */
  function copModeLabel() {
    const el = $("govCopMode");
    if (!el) return;
    el.textContent = S.copMode === "deterministic-fallback"
      ? T("gov.cop.mode.fb")
      : S.copMode ? T("gov.cop.mode.ai") : "";
  }
  function chatBubble(m, idx) {
    if (m.role === "user") {
      return `<div class="chat-msg user"><div class="bubble">${esc(m.text)}</div></div>`;
    }
    const cites = (m.citations || []).map((c) => {
      const code = citeCode(c);
      return `<button class="cite-chip" data-code="${esc(code)}">${esc(c)}</button>`;
    }).join("");
    return `<div class="chat-msg bot"><div class="bubble"><pre class="cop-text">${esc(m.text)}</pre>${cites ? `<div class="cite-row"><span class="cite-cap">${esc(T("gov.cop.citations"))}:</span>${cites}</div>` : ""}</div></div>`;
  }
  function citeCode(str) {
    const ps = (S.pkg && S.pkg.policies) || [];
    const hit = ps.find((p) => String(str).includes(p.code));
    return hit ? hit.policyId : "";
  }
  function renderChat() {
    const log = $("govChatLog");
    if (!log) return;
    if (!S.chat.length) {
      log.innerHTML = `<div class="gov-empty in-chat">${esc(T("gov.empty.chat"))}</div>`;
    } else {
      log.innerHTML = S.chat.map((m, i) => chatBubble(m, i)).join("");
      log.scrollTop = log.scrollHeight;
    }
    log.querySelectorAll(".cite-chip").forEach((b) =>
      b.addEventListener("click", () => openPolicyModalByAny(b.dataset.code)));
    copModeLabel();
  }
  function initCopilot(pkg) {
    const input = $("govChatInput");
    if (!input) return;
    input.placeholder = T("gov.cop.placeholder");
    const dis = $("govCopDisclaimer");
    if (dis) dis.textContent = T("gov.cop.disclaimer");
    const chips = $("govChatChips");
    /* Government questions (q1–q8) + SIH lifecycle questions (q9–q14) */
    const allQs = [
      ["gov.cop.q1", "compliance risks"],
      ["gov.cop.q2", "compliance cost"],
      ["gov.cop.q3", "launch timeline"],
      ["gov.cop.q4", "who is affected"],
      ["gov.cop.q5", "data storage"],
      ["gov.cop.q6", "first-year outcomes"],
      ["gov.cop.q7", "verified sources"],
      ["gov.cop.q8", "critical path"],
      /* SIH lifecycle questions */
      ["gov.sih.q9", "match score"],
      ["gov.sih.q10", "eligibility verdict"],
      ["gov.sih.q11", "evaluation status"],
      ["gov.sih.q12", "pilot KPI achievement"],
      ["gov.sih.q13", "procurement readiness"],
      ["gov.sih.q14", "scale readiness"],
    ];
    chips.innerHTML = allQs.map(([key, hint]) =>
      `<button class="chip" data-q="${key}">${esc(T(key))}</button>`).join("");
    chips.querySelectorAll(".chip").forEach((b) =>
      b.addEventListener("click", () => { input.value = T(key); sendChat(); }));
    /* Set the last clicked question's key for reference in sendChat */
    let lastQuestionKey = allQs[0][0];
    chips.querySelectorAll(".chip").forEach((b) => {
      b.addEventListener("click", () => { lastQuestionKey = b.dataset.q; input.value = T(b.dataset.q); });
    });
    $("govChatSend").onclick = sendChat;
    $("govChatClear").onclick = () => {
      S.chat = []; S.copMode = ""; renderChat();
    };
    input.onkeydown = (e) => { if (e.key === "Enter") sendChat(); };
    renderChat();
  }
  async function sendChat() {
    const input = $("govChatInput");
    const q = (input.value || "").trim();
    if (!q || S.chatBusy) return;
    input.value = "";
    S.chat.push({ role: "user", text: q });
    S.chatBusy = true;
    renderChat();
    const log = $("govChatLog");
    if (log) log.insertAdjacentHTML("beforeend",
      `<div class="chat-msg bot busy"><div class="bubble">${esc(T("gov.cop.thinking"))}</div></div>`);
    log && (log.scrollTop = log.scrollHeight);
    try {
      const data = await post("/api/gov/copilot", { ...govCtx(), question: q, lang: currentLang() });
      S.chat.push({ role: "bot", text: data.answer || "", citations: data.citations || [] });
      S.copMode = data.mode || "";
    } catch (err) {
      S.chat.push({ role: "bot", text: T("gov.cop.error") + (err.message ? `\n${err.message}` : ""), citations: [] });
    }
    S.chatBusy = false;
    renderChat();
  }

  /* ════════════════ MODULE: CONSULTATIONS ════════════════ */
  function renderConsultations(pkg) {
    const head = $("conHead");
    const tbody = $("conTbody");
    if (!head || !tbody) return;
    const search = $("conSearch");
    search.value = S.conSearch;
    if (!search.placeholder) search.placeholder = T("gov.common.search");
    const statusSel = $("conStatusFilter");
    statusSel.options[0].textContent = T("gov.common.filterAll");
    statusSel.options[1].textContent = T("gov.con.filterOpen");
    statusSel.options[2].textContent = T("gov.con.filterClosed");
    statusSel.value = S.conStatus;
    search.oninput = () => { S.conSearch = search.value; renderConsultations(S.pkg); };
    statusSel.onchange = () => { S.conStatus = statusSel.value; renderConsultations(S.pkg); };

    head.innerHTML = `
      <th>${esc(T("gov.con.title"))}</th>
      <th>${esc(T("gov.common.status"))}</th>
      <th>${esc(T("gov.con.window"))}</th>
      <th>${esc(T("gov.common.authority"))}</th>
      <th>${esc(T("gov.con.relatedRule"))}</th>
      <th></th>`;
    const q = S.conSearch.trim().toLowerCase();
    const isOpen = (r) => !/^closed/i.test(r.status || "");
    const rows = (pkg.consultations.records || []).filter((r) => {
      if (S.conStatus === "open" && !isOpen(r)) return false;
      if (S.conStatus === "closed" && isOpen(r)) return false;
      if (q && !(r.title + " " + r.authority + " " + (r.policyTitle || "")).toLowerCase().includes(q)) return false;
      return true;
    });
    tbody.innerHTML = rows.length ? rows.map((r) => `
      <tr>
        <td>${esc(r.title)}</td>
        <td><span class="status-pill ${isOpen(r) ? "open" : ""}">${esc(r.status)}</span></td>
        <td class="mono">${esc(r.window || T("gov.common.na"))}</td>
        <td class="dim">${esc(r.authority)}</td>
        <td class="dim">${esc(r.policyTitle || "")}</td>
        <td class="row-actions">
          ${r.policyId ? `<button class="btn btn-ghost btn-sm" data-act="impact" data-code="${esc(r.policyId)}">${esc(T("gov.con.viewImpact"))}</button>` : ""}
          <button class="btn btn-ghost btn-sm" data-act="stk">${esc(T("gov.con.viewStakeholders"))}</button>
        </td>
      </tr>`).join("") : `<tr><td colspan="6">${emptyHtml("gov.empty.consultations")}</td></tr>`;

    tbody.querySelectorAll('[data-act="impact"]').forEach((b) =>
      b.addEventListener("click", () => gotoSimulator(b.dataset.code)));
    tbody.querySelectorAll('[data-act="stk"]').forEach((b) =>
      b.addEventListener("click", () => window.ReguLens && window.ReguLens.navigate("gov-stakeholders")));
  }
  function buildConSummary(pkg) {
    const recs = pkg.consultations.records || [];
    const openR = recs.filter((r) => !/^closed/i.test(r.status || ""));
    const closedR = recs.filter((r) => /^closed/i.test(r.status || ""));
    return `
      <div class="card">
        <div class="card-head"><h3 class="card-title">${esc(T("gov.con.summaryTitle"))}</h3></div>
        <div class="grid grid-3 gov-kpis">
          ${statCard(recs.length, T("gov.nav.consultations"))}
          ${statCard(openR.length, T("gov.con.filterOpen"))}
          ${statCard(closedR.length, T("gov.con.filterClosed"))}
        </div>
        ${recs.length ? `<ul class="milestone-list">
          ${recs.map((r) => `<li><span class="ms-date">${esc(r.window || "—")}</span><div><strong>${esc(r.title)}</strong><small>${esc(r.authority)} · ${esc(r.status)}${r.outcomeNote ? " — " + esc(r.outcomeNote) : ""}</small></div></li>`).join("")}
        </ul>` : emptyHtml("gov.empty.consultations")}
        <p class="field-hint">${esc((recs[0] || {}).caveat || "")}</p>
      </div>`;
  }
  function gotoSimulator(policyId) {
    S.prefillSim = policyId;
    if (window.ReguLens) window.ReguLens.navigate("policy-simulator");
  }

  /* ════════════════ POLICY DETAIL MODAL ════════════════ */
  function openPolicyModalByAny(v) {
    const ps = (S.pkg && S.pkg.policies) || [];
    const p = ps.find((x) => x.policyId === v) || ps.find((x) => x.code === v);
    if (p) paintPolicyModal(p);
  }
  function openPolicyModal(codeOrId) { openPolicyModalByAny(codeOrId); }
  function paintPolicyModal(p) {
    const overlay = $("govPolicyModal");
    if (!overlay) return;
    $("govPolicyModalTitle").innerHTML = `${esc(p.code)} — ${esc(p.title)}`;
    $("govPolicyModalBody").innerHTML = `
      <p class="modal-text dim">${esc(p.authority)} · ${esc(p.policyType)} · <span class="status-pill">${esc(p.status)}</span></p>
      <div class="set-row"><span class="set-label">${esc(T("gov.common.effective"))}</span><span class="mono">${esc(p.effectiveDate || T("gov.common.na"))}</span></div>
      <div class="set-row"><span class="set-label">${esc(T("gov.common.relevance"))}</span><span>${p.relevance}%</span></div>
      <div class="set-row"><span class="set-label">${esc(T("gov.common.obligations"))}</span><span>${p.obligationsCount}</span></div>
      <div class="set-row"><span class="set-label">${esc(T("gov.common.impactLevel"))}</span><span>${p.overall}/100 ${lvlBadge(p.impactLevel)}</span></div>
      <h4 class="sub-title">${esc(T("gov.anz.dimensions"))}</h4>
      ${(p.dimensions || []).map((dm) => `
        <div class="status-row"><span class="status-name dim">${esc(dm.label)}</span>${bar(dm.score)}<span class="status-count">${dm.score}</span></div>`).join("")}
      <h4 class="sub-title">Summary</h4>
      <p class="modal-text">${esc(p.summary)}</p>
      <div class="set-row src-row">
        <span class="set-label">Source</span>
        ${p.source && p.source.verified && p.source.url
          ? `<a href="${esc(p.source.url)}" target="_blank" rel="noopener noreferrer" class="src-link">${srcBadge(true)} ${esc(T("gov.common.openSource"))} ↗</a>`
          : srcBadge(false)}
      </div>
      <details class="assump-box"><summary>Trace</summary><p class="mono trace-line">${esc(p.trace || "")}</p></details>`;
    overlay.classList.remove("hidden");
  }
  function wireModalOnce() {
    if (wireModalOnce.done) return;
    wireModalOnce.done = true;
    const close = () => { const o = $("govPolicyModal"); if (o) o.classList.add("hidden"); };
    document.addEventListener("click", (e) => {
      const ov = $("govPolicyModal");
      if (!ov || ov.classList.contains("hidden")) return;
      if (e.target === ov || e.target.closest("#govPolicyModalClose") || e.target.closest("#govPolicyModalOk")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* ════════════════ GLUE: refresh / export / init ════════════════ */
  function currentAppView() {
    const api = window.ReguLens;
    try { return (api && api.getState && api.getState().currentView) || ""; } catch { return ""; }
  }
  function refresh() {
    const view = currentAppView();
    if (!GOV_VIEWS.includes(view)) return;
    render(view);
  }

  /* consultations summary button */
  const _renderConsultations0 = renderConsultations;
  renderConsultations = function (pkg) {
    _renderConsultations0(pkg);
    const btn = $("conSummaryBtn");
    if (btn) btn.onclick = () => {
      const root = $("conSummaryBody");
      if (root) {
        root.innerHTML = buildConSummary(S.pkg);
        root.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };
  };

  function initWorkflow(pkg) {
    /* Derive workflow stage from actual pkg state */
    if (pkg && pkg.context) {
      S.workflowStage = "01-register"; // default
      /* Could derive from pkg state: problems, pilots, etc. */
    }
    renderWorkflow(pkg);
  }

  function init() {
    wireModalOnce();
    // re-render active gov view when language changes (app.js calls refresh())
  }

  init();

  const API = {
    render,
    refresh,
    retry,
    openPolicyModal,
    gotoSimulator,
  };
  window.ReguLensGov = API;
})();
