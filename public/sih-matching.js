/* ════════════════════════════════════════════════════════════════════
   ReguLens INTELLIGENT STARTUP MATCHING (SIH26136) — additive frontend
   ──────────────────────────────────────────────────────────────────────
   Decision-support only. Eligibility is the HARD GATE; matching ranks the
   eligible pool with a deterministic, explainable, versioned engine and
   keeps the human shortlist + override decisions separate from the AI
   ranking. No AI in this layer. REGULENS provides decision support —
   final selection remains with the authorized government authority.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const BASE = "/api/sih";
  const LS = "regulens.sihmatching.v1";

  const S = {
    org: null,
    orgs: [],
    challenges: [],
    challenge: null,
    outcomes: null,   // { run, results, shortlists, freshness }
    runs: [],
    config: null,
    versions: [],
    shortlists: [],
    actions: [],
    busy: false,
  };

  /* ───────── i18n (shared dictionary from i18n/sih-bundle.js) ───────── */
  const LSX = window.SIH_I18N || {};
  function lang() {
    const api = window.ReguLens;
    return api && typeof api.getLang === "function" ? api.getLang() || "en" : "en";
  }
  function tr(key, vars) {
    const l = lang();
    let s = (LSX[l] && LSX[l][key]) || (LSX.en && LSX.en[key]) || key;
    if (vars) for (const k of Object.keys(vars)) s = String(s).split("{{" + k + "}}").join(String(vars[k]));
    return s;
  }

  const $ = (id) => document.getElementById(id);
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 3000);
  }
  function saveCtx() {
    try { localStorage.setItem(LS, JSON.stringify({ orgId: S.org ? S.org.id : "" })); } catch (_) {}
  }
  function loadCtxOrgId() {
    try { const raw = JSON.parse(localStorage.getItem(LS) || "null"); return raw && raw.orgId ? raw.orgId : ""; } catch (_) { return ""; }
  }

  async function authHeaders() {
    try {
      const fb = window.AuroraFirebase || (window.firebase && { getAuth: () => window.firebase.auth() });
      const auth = fb && fb.getAuth ? fb.getAuth() : null;
      const cu = auth && auth.currentUser ? auth.currentUser : null;
      if (cu && typeof cu.getIdToken === "function") {
        const token = await cu.getIdToken();
        if (token) return { Authorization: "Bearer " + token };
      }
    } catch (_) {}
    return {};
  }
  async function api(method, path, body) {
    const headers = { ...(await authHeaders()) };
    const opts = { method, headers };
    if (body !== undefined) { headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    const res = await fetch(BASE + path, opts);
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error((data && data.error) || "HTTP " + res.status);
    return data;
  }

  /* ───────── loaders ───────── */
  async function loadOrgs() {
    const data = await api("GET", "/organizations");
    S.orgs = (data.organizations || []).filter((o) => o.orgType === "GOVERNMENT");
    const saved = loadCtxOrgId();
    S.org = S.orgs.find((o) => o.id === saved) || S.orgs[0] || null;
    saveCtx();
  }
  async function loadChallenges() {
    if (!S.org) { S.challenges = []; return; }
    const d = await api("GET", "/challenges?organizationId=" + encodeURIComponent(S.org.id));
    S.challenges = d.challenges || [];
  }
  async function loadChallengeData() {
    if (!S.challenge) { S.outcomes = null; S.runs = []; S.config = null; S.versions = []; S.shortlists = []; S.actions = []; return; }
    const [o, runs, cfg, sh] = await Promise.all([
      api("GET", "/challenges/" + S.challenge.id + "/matching/results"),
      api("GET", "/challenges/" + S.challenge.id + "/matching/runs"),
      api("GET", "/challenges/" + S.challenge.id + "/matching/configuration"),
      api("GET", "/challenges/" + S.challenge.id + "/matching/shortlist"),
    ]);
    S.outcomes = o;
    S.runs = runs.runs || [];
    S.config = cfg.configuration || null;
    S.versions = cfg.versions || [];
    S.shortlists = sh.shortlists || [];
    S.actions = sh.actions || [];
  }

  /* ───────── style helpers ───────── */
  function poolBadge(pool) {
    const map = {
      RANKED: "st-verified", RANKED_WITH_WARNING: "st-requires_update",
      RANKED_CONDITIONAL: "st-under_review", REVIEW_POOL: "st-under_review",
      EXCLUDED: "st-expired",
    };
    return `<span class="gov-state ${map[pool] || "st-unknown"}">${esc(pool || "")}</span>`;
  }
  function statusBadge(status) {
    const map = { RUNNING: "st-under_review", COMPLETED: "st-verified", PARTIAL: "st-requires_update", FAILED: "st-expired" };
    return `<span class="gov-state ${map[status] || "st-unknown"}">${esc(status || "")}</span>`;
  }
  function pct(n) {
    const v = Number(n || 0);
    return Math.round(v * 100) + "%";
  }
  function fmtDate(iso) {
    try { return iso ? new Date(iso).toLocaleString() : ""; } catch (_) { return ""; }
  }
  const DIM_LABELS = {
    PROBLEM_FIT: "Problem Fit", CAPABILITY_FIT: "Capability Fit", TECHNOLOGY_FIT: "Technology Fit",
    USE_CASE_FIT: "Use-Case Fit", SECTOR_FIT: "Sector Fit", DEPLOYMENT_EXPERIENCE: "Deployment Experience",
    GOVERNMENT_EXPERIENCE: "Government Experience", PILOT_READINESS: "Pilot Readiness",
    GEOGRAPHIC_FIT: "Geographic Fit", SCALABILITY_FIT: "Scalability Fit", EVIDENCE_STRENGTH: "Evidence Strength",
  };

  /* ───────── render entry ───────── */
  function render(view) {
    const root = $("sihMatchingBody");
    if (!root) return;
    if (view === "sih-matching") renderHome(root);
  }

  async function renderHome(root) {
    root.innerHTML = `<div class="sih-empty">${esc(tr("sih.loading"))}</div>`;
    try {
      await loadOrgs();
      await loadChallenges();
    } catch (e) {
      root.innerHTML = `<div class="sih-empty">${esc(e.message)}</div>`;
      return;
    }
    root.innerHTML = `
      <div class="sih-orgbar">
        <span class="field-label">${esc(tr("matching.org"))}</span>
        <select id="matchOrg" class="select">${S.orgs.map((o) =>
          `<option value="${esc(o.id)}" ${S.org && o.id === S.org.id ? "selected" : ""}>${esc(o.name)}</option>`).join("")}
        </select>
        <span class="field-label">${esc(tr("matching.challenge"))}</span>
        <select id="matchChallenge" class="select">
          <option value="">${esc(tr("matching.pickCh"))}</option>
          ${S.challenges.map((c) => `<option value="${esc(c.id)}">${esc(c.title || c.challengeCode || "")}</option>`).join("")}
        </select>
      </div>
      <div class="sih-hint">${esc(tr("matching.hint"))}</div>
      <div id="matchBody"></div>`;

    const orgSel = $("matchOrg");
    orgSel.addEventListener("change", async () => {
      S.org = S.orgs.find((o) => o.id === orgSel.value) || null;
      saveCtx();
      await loadChallenges();
      renderHome(root);
    });
    const chSel = $("matchChallenge");
    chSel.addEventListener("change", async () => {
      S.challenge = S.challenges.find((c) => c.id === chSel.value) || null;
      try { await loadChallengeData(); } catch (e) { toast(e.message); }
      renderChallenge(root);
    });

    if (S.challenge && chSel) chSel.value = S.challenge.id;
    if (S.challenge) renderChallenge(root);
    else { const b = $("matchBody"); if (b) b.innerHTML = `<div class="sih-empty">${esc(tr("matching.pickChHint"))}</div>`; }
  }

  /* ───────── main view ───────── */
  async function renderChallenge(root) {
    const body = $("matchBody");
    if (!body) return;
    const ch = S.challenge;
    if (!ch) { body.innerHTML = `<div class="sih-empty">${esc(tr("matching.pickChHint"))}</div>`; return; }

    const o = S.outcomes;
    const run = o && o.run;
    const freshness = o && o.freshness;

    body.innerHTML = `
      <div class="sih-toolbar">
        <h3>${esc(ch.title || ch.challengeCode || "")}</h3>
        ${run ? statusBadge(run.status) : ""}
        ${run && freshness && freshness.stale ? `<span class="gov-state st-expired">${esc(tr("matching.stale"))}</span>` : (run ? `<span class="gov-state st-verified">${esc(tr("matching.fresh"))}</span>` : "")}
        ${run ? `<button type="button" class="btn btn-sm" id="runAgain">${esc(tr("matching.rerun"))}</button>` : ""}
      </div>
      ${freshness && freshness.stale ? `<div class="sih-hint" style="color:#b3261e">⚠ ${esc(tr("matching.staleHint"))}</div>` : ""}

      <div class="card sih-card">
        <div class="sih-toolbar">
          <h3>${esc(tr("matching.lastRun"))}</h3>
          <button type="button" class="btn btn-sm btn-primary" id="runMatch">${esc(run ? tr("matching.rerun") : tr("matching.run"))}</button>
        </div>
        ${run ? `
          <div class="sih-meta-grid">
            <div><span class="sih-meta-label">${esc(tr("matching.runAt"))}</span><strong>${esc(fmtDate(run.startedAt))}</strong></div>
            <div><span class="sih-meta-label">${esc(tr("matching.status"))}</span><strong>${esc(run.status || "")}</strong></div>
            <div><span class="sih-meta-label">${esc(tr("matching.engine"))}</span><strong>${esc(run.engineVersion || "")}</strong></div>
            <div><span class="sih-meta-label">${esc(tr("matching.configVersion"))}</span><strong>${esc(run.configVersion || 1)}</strong></div>
          </div>
          <div class="sih-meta-grid">
            <div><span class="sih-meta-label">${esc(tr("matching.candidates"))}</span><strong>${esc(run.candidateCount || 0)}</strong></div>
            <div><span class="sih-meta-label">${esc(tr("matching.eligible"))}</span><strong>${esc(run.eligibleCount || 0)}</strong></div>
            <div><span class="sih-meta-label">${esc(tr("matching.rankable"))}</span><strong>${esc(run.rerankedCount || 0)}</strong></div>
          </div>
          <p class="sih-muted" style="font-size:12px">${esc(tr("matching.trigger"))}: ${esc(run.triggerReason || "")} · ${esc(run.durationMs || 0)}ms · ${esc(run.errorSummary || "")}</p>
        ` : `<div class="sih-empty">${esc(tr("matching.noRun"))}</div>`}
      </div>

      <div class="sih-toolbar"><h3>${esc(tr("matching.results"))}</h3></div>
      <div id="matchResults"></div>

      <div class="sih-toolbar"><h3>${esc(tr("matching.shortlist"))}</h3></div>
      <div id="matchShortlist"></div>

      <div class="sih-toolbar"><h3>${esc(tr("matching.config"))}</h3></div>
      <div class="sih-hint">${esc(tr("matching.configHint"))}</div>
      <div id="matchConfig"></div>`;

    const runBtn = $("runMatch");
    const rerunBtn = $("runAgain");
    const runMatching = async () => {
      if (S.busy) return;
      S.busy = true;
      try {
        await api("POST", "/challenges/" + ch.id + "/matching/run", { triggerReason: "MANUAL_RUN" });
        await loadChallengeData();
        renderChallenge(root);
        toast(tr("matching.run"));
      } catch (e) { toast(e.message); }
      S.busy = false;
    };
    if (runBtn) runBtn.addEventListener("click", runMatching);
    if (rerunBtn) rerunBtn.addEventListener("click", runMatching);

    renderResults($("matchResults"));
    renderShortlist($("matchShortlist"));
    renderConfig($("matchConfig"));
  }

  /* ───────── ranked results ───────── */
  function renderResults(container) {
    if (!container) return;
    const results = (S.outcomes && S.outcomes.results) || [];
    if (!results.length) {
      container.innerHTML = `<div class="sih-empty">${esc(tr("matching.resultsEmpty"))}</div>`;
      return;
    }
    container.innerHTML = results.map(resultCard).join("");
    container.querySelectorAll("[data-why]").forEach((b) =>
      b.addEventListener("click", () => {
        const el = document.getElementById("why-" + b.dataset.why);
        if (el) el.classList.toggle("hidden");
      }));
    container.querySelectorAll("[data-detail]").forEach((b) =>
      b.addEventListener("click", async () => {
        const el = document.getElementById("detail-" + b.dataset.detail);
        if (el && !el.dataset.loaded) {
          el.dataset.loaded = "1";
          el.innerHTML = `<div class="sih-empty">${esc(tr("sih.loading"))}</div>`;
          try {
            const d = await api("GET", "/matching-results/" + b.dataset.detail);
            el.innerHTML = detailBody(d);
          } catch (e) { el.innerHTML = `<div class="sih-empty">${esc(e.message)}</div>`; }
        }
        if (el) el.classList.toggle("hidden");
      }));
    container.querySelectorAll("[data-shortlist]").forEach((b) =>
      b.addEventListener("click", async () => {
        const id = b.dataset.shortlist;
        try {
          await api("POST", "/matching-results/" + id + "/shortlist", { note: "Shortlisted by officer" });
          await loadChallengeData();
          renderChallenge($("matchBody"));
        } catch (e) { toast(e.message); }
      }));
    container.querySelectorAll("[data-unshortlist]").forEach((b) =>
      b.addEventListener("click", async () => {
        const id = b.dataset.unshortlist;
        try {
          await api("DELETE", "/matching-results/" + id + "/shortlist", { reason: "Removed by officer" });
          await loadChallengeData();
          renderChallenge($("matchBody"));
        } catch (e) { toast(e.message); }
      }));
    container.querySelectorAll("[data-override]").forEach((b) => {
      const row = document.getElementById("ovr-" + b.dataset.override);
      if (row) {
        b.addEventListener("click", () => row.classList.toggle("hidden"));
        row.querySelector("button").addEventListener("click", async () => {
          const rankVal = Number(row.querySelector("input").value || 0);
          try {
            await api("POST", "/matching-results/" + b.dataset.override + "/override", { action: row.dataset.action || "REORDER", newRank: rankVal, reason: "Manual override" });
            await loadChallengeData();
            renderChallenge($("matchBody"));
          } catch (e) { toast(e.message); }
        });
      }
    });
  }

  function resultCard(r) {
    const st = r.startup || {};
    const whyId = r.id;
    const ev = r.evidence || {};
    const dims = (r.dimensionResults || []).map((d) => ({
      key: d.key, label: d.label || DIM_LABELS[d.key] || d.key, weight: d.weight, score: d.score, state: d.state,
    }));
    return `
      <article class="card sih-card">
        <div class="sih-card-top">
          <span class="gov-state st-unknown">#${esc(r.rank || "")}</span>
          <strong>${esc(st.brandName || st.legalName || r.startupId)}</strong>
          ${poolBadge(r.eligibilityPool)}
          ${r.shortlisted ? `<span class="gov-state st-verified">${esc(tr("matching.shortlisted"))}</span>` : ""}
          <span class="sih-muted" style="font-size:11px">${esc(tr("matching.score"))}: <b>${pct(r.matchScore)}</b> · ${esc(tr("matching.confidence"))}: ${pct(r.matchConfidence)}</span>
        </div>
        <div class="sih-card-meta">
          <button type="button" class="btn btn-sm" data-why="${esc(whyId)}">${esc(tr("matching.why"))}</button>
          <button type="button" class="btn btn-sm" data-detail="${esc(r.id)}">${esc(tr("matching.detail"))}</button>
          ${r.shortlisted
            ? `<button type="button" class="btn btn-sm" data-unshortlist="${esc(r.id)}">${esc(tr("matching.removeShortlist"))}</button>`
            : `<button type="button" class="btn btn-sm btn-primary" data-shortlist="${esc(r.id)}">${esc(tr("matching.addShortlist"))}</button>`}
          <button type="button" class="btn btn-sm" data-override="${esc(r.id)}">${esc(tr("matching.override"))}</button>
        </div>
        <div id="why-${esc(whyId)}" class="hidden" style="margin-top:8px">
          <p class="sih-muted" style="font-size:12px">${esc((r.explanation && r.explanation.plain) || "")}</p>
          ${r.strengths && r.strengths.length ? `<p><b>${esc(tr("matching.strengths"))}:</b></p><ul class="sih-ul">${r.strengths.map((s) => `<li>${esc(s.text || "")}</li>`).join("")}</ul>` : ""}
          ${r.gaps && r.gaps.length ? `<p><b>${esc(tr("matching.gaps"))}:</b></p><ul class="sih-ul">${r.gaps.map((g) => `<li>${esc(g.text || "")}</li>`).join("")}</ul>` : ""}
          ${r.riskFlags && r.riskFlags.length ? `<p><b>${esc(tr("matching.risks"))}:</b></p><ul class="sih-ul">${r.riskFlags.map((f) => `<li>${esc(f.text || f.type || "")}</li>`).join("")}</ul>` : ""}
        </div>
        <div id="detail-${esc(r.id)}" class="hidden" style="margin-top:8px">
          ${dims.length ? dims.map((d) => `
            <div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0">
              <span class="sih-muted" style="font-size:12px">${esc(d.label)} <span class="gov-state st-unknown">${esc(d.state || "")}</span></span>
              <span style="font-size:12px"><b>${pct(d.score)}</b> × <span class="sih-muted">${esc(d.weight || 0)}%</span></span>
            </div>`).join("") : `<div class="sih-empty">${esc(tr("matching.resultsEmpty"))}</div>`}
          <p class="sih-muted" style="font-size:12px;margin-top:6px">${esc(tr("matching.evidence"))}: ${esc(ev.documents || 0)} ${esc(tr("matching.docs"))} · ${esc(ev.verifiedVerifications || 0)} ${esc(tr("matching.verifications"))} · ${esc(ev.certifications || 0)} ${esc(tr("matching.certs"))}</p>
        </div>
        <div id="ovr-${esc(r.id)}" class="hidden" data-action="REORDER" style="margin-top:8px">
          <span class="sih-muted" style="font-size:12px">${esc(tr("matching.overrideHint"))}</span>
          <div style="display:flex;gap:6px;margin-top:6px">
            <input type="number" class="input" min="1" placeholder="${esc(tr("matching.manualRank"))}" style="width:120px"/>
            <button type="button" class="btn btn-sm">${esc(tr("matching.override"))}</button>
          </div>
        </div>
      </article>`;
  }

  function detailBody(d) {
    const dims = d.dimensions || [];
    return `
      ${dims.length ? dims.map((x) => `
        <div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0">
          <span class="sih-muted" style="font-size:12px">${esc(x.label || DIM_LABELS[x.key] || x.key)} <span class="gov-state st-unknown">${esc(x.state || "")}</span></span>
          <span style="font-size:12px"><b>${pct(x.score)}</b> × <span class="sih-muted">${esc(x.weight || 0)}%</span></span>
        </div>
        <p class="sih-muted" style="font-size:11px;margin:2px 0 0 0">${esc(x.note || "")}</p>`).join("") : ""}
      ${(d.actions || []).length ? `<p><b>${esc(tr("matching.actions"))}:</b></p><ul class="sih-ul">${d.actions.map((a) => `<li>${esc(a.action)}${a.newRank != null ? " → " + esc(a.newRank) : ""} · ${esc(a.actorId || "")} · ${esc(fmtDate(a.createdAt))}</li>`).join("")}</ul>` : ""}
    `;
  }

  /* ───────── shortlist + human trail ───────── */
  function renderShortlist(container) {
    if (!container) return;
    const entries = S.shortlists;
    container.innerHTML = `
      <div class="card sih-card">
        <div class="sih-toolbar"><h3>${esc(tr("matching.rankCurrent"))}</h3></div>
        ${entries.length ? entries.map((e) => `
          <div class="sih-card-top">
            <span class="gov-state st-unknown">#${esc(e.manualRank ?? "-")}</span>
            <strong>${esc((e.startup && e.startup.brandName) || e.startupId)}</strong>
            <span class="sih-muted" style="font-size:11px">${esc(fmtDate(e.createdAt))}</span>
          </div>
          <p class="sih-muted" style="font-size:12px">${esc(e.note || "")}</p>`).join("")
        : `<div class="sih-empty">${esc(tr("matching.emptyShortlist"))}</div>`}
      </div>
      <div class="card sih-card">
        <div class="sih-toolbar"><h3>${esc(tr("matching.actions"))} (${esc(S.actions.length)})</h3></div>
        ${S.actions.length ? S.actions.map((a) => `
          <div class="elig-result">
            <div class="sih-card-top">
              <strong>${esc(a.action)}</strong>
              ${a.newRank != null ? `<span class="sih-muted" style="font-size:11px">→ rank ${esc(a.newRank)}</span>` : ""}
              <span class="sih-muted" style="font-size:11px">${esc(fmtDate(a.createdAt))}</span>
            </div>
            <p class="sih-muted" style="font-size:12px">${esc(a.reason || "")} · ${esc(a.actorId || "")}</p>
          </div>`).join("")
        : `<div class="sih-empty">${esc(tr("matching.noActions"))}</div>`}
      </div>`;
  }

  /* ───────── configuration + versions ───────── */
  function renderConfig(container) {
    if (!container) return;
    const cfg = S.config;
    const dims = (cfg && (cfg.activeDimensions && cfg.activeDimensions.length ? cfg.activeDimensions : cfg.dimensions)) || [];
    const total = dims.reduce((s, d) => s + Number(d.weight || 0), 0);
    container.innerHTML = `
      <div class="card sih-card">
        ${dims.length ? dims.map((d) => `
          <div style="display:flex;align-items:center;gap:8px;padding:3px 0">
            <span class="sih-muted" style="font-size:12px;flex:1">${esc(d.label || DIM_LABELS[d.key] || d.key)}</span>
            <input type="number" class="input cfgw" data-key="${esc(d.key)}" min="0" max="100" value="${esc(d.weight || 0)}" style="width:90px"/>
            <span class="sih-muted" style="font-size:12px;width:60px">${esc(d.active === false ? "" : "%")}</span>
          </div>`).join("")
        : `<div class="sih-empty">${esc(tr("sih.none"))}</div>`}
        <div class="sih-card-top" style="margin-top:8px">
          <strong>${esc(tr("matching.sum"))}</strong>
          <span id="cfgSum" class="${total === 100 ? "st-verified" : "st-expired"} gov-state" style="font-weight:600">${esc(total)}%</span>
        </div>
        <button type="button" class="btn btn-sm btn-primary" id="saveConfig" style="margin-top:8px">${esc(tr("matching.saveConfig"))}</button>
        <p class="sih-muted" style="font-size:11px;margin-top:4px">${esc(tr("matching.configVersion"))}: v${esc((cfg && cfg.configVersion) || 1)} · ${esc(S.versions.length)} ${esc(tr("matching.versions"))}</p>
      </div>`;
    container.querySelectorAll(".cfgw").forEach((inp) =>
      inp.addEventListener("input", () => {
        const s = Array.from(container.querySelectorAll(".cfgw")).reduce((acc, i) => acc + Number(i.value || 0), 0);
        const el = $("cfgSum");
        if (el) { el.textContent = s + "%"; el.className = "gov-state " + (s === 100 ? "st-verified" : "st-expired"); }
      }));
    const save = $("saveConfig");
    if (save) save.addEventListener("click", async () => {
      const raw = {};
      container.querySelectorAll(".cfgw").forEach((i) => { raw[i.dataset.key] = Number(i.value || 0); });
      try {
        await api("PATCH", "/challenges/" + S.challenge.id + "/matching/configuration", { weights: raw });
        await loadChallengeData();
        renderChallenge($("matchBody"));
        toast(tr("matching.saved"));
      } catch (e) { toast(e.message); }
    });
  }

  window.SIHMatching = { render };
})();