/* SIH26136 — Evaluation & Shortlist Intelligence Center.
   Deterministic, evidence-aware evaluation of startups against a challenge-
   scoped criteria template. Regulens provides decision support: human
   evaluators score, the engine aggregates and flags variance, and an
   authorized official records the audited final decision + pilot handoff. */
(function () {
  "use strict";

  const BASE = "/api/sih";
  const LS = "regulens.siheval.v1";

  const S = {
    org: null,
    orgs: [],
    startups: [],
    challenges: [],
    challenge: null,
    criteria: [],
    configuration: null,
    workspace: null,
    comparison: null,
    advisory: null,
    busy: false,
    view: "dashboard", // dashboard | config
  };

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
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toast(msg, ok) {
    if (window.ReguLens && typeof window.ReguLens.toast === "function") {
      window.ReguLens.toast(msg, ok ? "success" : "error");
    } else {
      window.alert(msg);
    }
  }
  async function authHeaders() {
    try {
      if (window.AuroraFirebase && typeof window.AuroraFirebase.getIdToken === "function") {
        const token = await window.AuroraFirebase.getIdToken();
        if (token) return { Authorization: "Bearer " + token };
      }
      if (window.firebase && typeof window.firebase.auth === "function") {
        const u = window.firebase.auth().currentUser;
        if (u) { const t = await u.getIdToken(); if (t) return { Authorization: "Bearer " + t }; }
      }
    } catch (_) {}
    return {};
  }
  async function api(method, path, body) {
    const headers = await authHeaders();
    const opts = { method, headers };
    if (body !== undefined) { headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    const res = await fetch(BASE + path, opts);
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error((data && data.error) || "HTTP " + res.status);
    return data;
  }

  /* ───────── state persistence ───────── */
  function loadCtxOrgId() { try { return JSON.parse(localStorage.getItem(LS) || "{}").orgId || null; } catch (_) { return null; } }
  function saveCtx() { try { localStorage.setItem(LS, JSON.stringify({ orgId: S.org ? S.org.id : null })); } catch (_) {} }

  /* ───────── loaders ───────── */
  async function loadOrgs() {
    const data = await api("GET", "/organizations");
    S.orgs = (data.organizations || []).filter((o) => o.orgType === "GOVERNMENT");
    const saved = loadCtxOrgId();
    S.org = S.orgs.find((o) => o.id === saved) || S.orgs[0] || null;
    saveCtx();
  }
  async function loadChallenges() {
    if (!S.org) { S.challenges = []; S.challenge = null; return; }
    const d = await api("GET", "/challenges?organizationId=" + encodeURIComponent(S.org.id));
    S.challenges = d.challenges || [];
    const firstWithEval = S.challenges.find((c) => c.evaluationStatus && c.evaluationStatus !== "NOT_STARTED");
    if (!S.challenge || !S.challenges.some((c) => c.id === S.challenge.id)) {
      S.challenge = firstWithEval || S.challenges[0] || null;
    }
  }
  async function loadStartups() {
    if (!S.org) { S.startups = []; return; }
    try {
      const d = await api("GET", "/startups?organizationId=" + encodeURIComponent(S.org.id));
      S.startups = d.startups || [];
    } catch (_) { S.startups = []; }
  }
  async function loadChallengeData() {
    if (!S.challenge) {
      S.criteria = []; S.configuration = null; S.workspace = null; S.comparison = null; S.advisory = null;
      return;
    }
    const cid = S.challenge.id;
    const [crit, ws, cmp] = await Promise.all([
      api("GET", "/challenges/" + cid + "/evaluation/criteria"),
      api("GET", "/challenges/" + cid + "/evaluation/workspace"),
      api("GET", "/challenges/" + cid + "/evaluation/comparison"),
    ]);
    S.criteria = (crit.criteria || []).filter((c) => c.criterionStatus === "ACTIVE");
    S.configuration = crit.configuration || null;
    S.workspace = ws;
    S.comparison = cmp;
    S.advisory = null;
  }

  /* ───────── style helpers ───────── */
  function resultBadge(result) {
    const map = {
      ADVANCE: "st-verified", ADVANCE_WITH_REVIEW: "st-requires_update",
      REVIEW_REQUIRED: "st-under_review", DO_NOT_ADVANCE: "st-expired",
      INCOMPLETE: "st-unknown", NOT_EVALUATED: "st-unknown",
    };
    return `<span class="gov-state ${map[result] || "st-unknown"}">${esc(result || "")}</span>`;
  }
  function statusBadge(status) {
    const map = { LOCKED: "st-expired", SUBMITTED: "st-verified", IN_PROGRESS: "st-under_review", NOT_STARTED: "st-unknown", REOPENED: "st-requires_update", DRAFT: "st-unknown" };
    return `<span class="gov-state ${map[status] || "st-unknown"}">${esc(status || "")}</span>`;
  }
  function decisionBadge(decision) {
    const map = { PROCEED_TO_PILOT: "st-verified", REQUEST_MORE_INFORMATION: "st-requires_update", HOLD: "st-under_review", DO_NOT_PROCEED: "st-expired", CUSTOM: "st-unknown" };
    return decision ? `<span class="gov-state ${map[decision] || "st-unknown"}">${esc(decision)}</span>` : "";
  }
  function pct(n) { const v = Number(n || 0); return Math.round(v * 100) + "%"; }
  function fmtDate(iso) { try { return iso ? new Date(iso).toLocaleString() : ""; } catch (_) { return ""; } }

  /* ───────── render entry ───────── */
  function render(view) {
    const root = $("sihEvaluationBody");
    if (!root) return;
    root.innerHTML = `<div class="sih-orgbar">
      <label class="field-label">${esc(tr("evaluation.org"))}</label>
      <select class="select" id="evalOrgSel"></select>
      <label class="field-label">${esc(tr("evaluation.challenge"))}</label>
      <select class="select" id="evalChSel"></select>
    </div><div id="evalBody"></div>`;
    (async () => {
      try {
        await loadOrgs();
        await loadChallenges();
        await loadStartups();
        await loadChallengeData();
        bindOrgBar();
        renderBody();
      } catch (e) { root.innerHTML = `<div class="sih-empty">${esc(e.message)}</div>`; }
    })();
  }

  function bindOrgBar() {
    const os = $("evalOrgSel");
    if (os) {
      os.innerHTML = S.orgs.map((o) => `<option value="${esc(o.id)}">${esc(o.name)}</option>`).join("") ||
        `<option value="">${esc(tr("evaluation.noOrg"))}</option>`;
      os.value = S.org ? S.org.id : "";
      os.onchange = async () => {
        S.org = S.orgs.find((o) => o.id === os.value) || null;
        saveCtx();
        await loadChallenges();
        await loadStartups();
        await loadChallengeData();
        bindOrgBar();
        renderBody();
      };
    }
    const cs = $("evalChSel");
    if (cs) {
      cs.innerHTML = S.challenges.map((c) => {
        const label = c.challengeCode || c.title || "";
        return `<option value="${esc(c.id)}">${esc(label)}</option>`;
      }).join("") || `<option value="">${esc(tr("evaluation.pickCh"))}</option>`;
      cs.value = S.challenge ? S.challenge.id : "";
      cs.onchange = async () => {
        S.challenge = S.challenges.find((c) => c.id === cs.value) || null;
        await loadChallengeData();
        renderBody();
      };
    }
  }

  function renderBody() {
    const body = $("evalBody");
    if (!body) return;
    if (!S.org) { body.innerHTML = `<div class="sih-empty">${esc(tr("evaluation.noOrgHint"))}</div>`; return; }
    if (!S.challenge) { body.innerHTML = `<div class="sih-empty">${esc(tr("evaluation.noChallengeHint"))}</div>`; return; }
    if (S.view === "config") { renderConfig(body); return; }
    body.innerHTML = `
      ${headerHtml()}
      ${workspaceHtml()}
      ${comparisonHtml()}
      ${assignHtml()}
      ${advisoryHtml()}`;
    wireHeader(body);
    wireWorkspace(body);
    wireComparison(body);
    wireAssign(body);
  }

  function headerHtml() {
    const ch = S.challenge || {};
    return `<div class="card sih-card">
      <div class="sih-toolbar">
        <h3>${esc(ch.title || ch.challengeCode || "")}</h3>
        <span class="gov-state ${ch.evaluationStatus === "IN_PROGRESS" ? "st-under_review" : "st-unknown"}">${esc(ch.evaluationStatus || "")}</span>
        <button type="button" class="btn btn-sm" id="evalRefresh">${esc(tr("sih.refresh"))}</button>
        <button type="button" class="btn btn-sm" id="evalConfigBtn">${esc(tr("evaluation.config"))}</button>
        <button type="button" class="btn btn-sm" id="evalSurge">${esc(tr("evaluation.aggregate"))}</button>
      </div>
      <p class="sih-hint small">${esc(tr("evaluation.hint"))}</p>
      <div id="evalSurgeOut"></div>
    </div>`;
  }
  function wireHeader(body) {
    const r = body.querySelector("#evalRefresh");
    if (r) r.onclick = async () => { try { await loadChallengeData(); renderBody(); } catch (e) { toast(e.message); } };
    const cfg = body.querySelector("#evalConfigBtn");
    if (cfg) cfg.onclick = () => { S.view = "config"; renderBody(); };
    const sur = body.querySelector("#evalSurge");
    if (sur) sur.onclick = async () => {
      if (S.busy) return;
      S.busy = true;
      const out = body.querySelector("#evalSurgeOut");
      out.innerHTML = `<div class="sih-empty">${esc(tr("evaluation.loading"))}…</div>`;
      try {
        const r = await api("POST", "/challenges/" + S.challenge.id + "/evaluation/aggregate");
        out.innerHTML = `<span class="gov-state st-verified">OK</span> ${esc(tr("evaluation.aggregated"))} (${r.counts.startupsAggregated})`;
        await loadChallengeData();
        renderBody();
      } catch (e) { out.innerHTML = `<span class="gov-state st-expired">${esc(e.message)}</span>`; }
      S.busy = false;
    };
  }

  /* ── evaluator workspace ── */
  function workspaceHtml() {
    const evs = (S.workspace && S.workspace.evaluations) || [];
    const rows = evs.map((ev) => {
      const crits = ev.summary && ev.summary.rows ? ev.summary.rows : [];
      const scores = crits.map((c) => `
        <div class="sih-score-row">
          <span class="sih-score-key">${esc(c.label || c.key)}</span>
          <span class="sih-score-val">${c.score == null ? esc(tr("evaluation.notScored")) : c.score}</span>
          <span class="sih-score-w">× ${c.weight}%</span>
        </div>`).join("");
      const req = (ev.summary && ev.summary.commentsRequired) || [];
      const reqCount = req.length;
      const comments = (ev.comments || []).map((c) => `<div class="sih-card-meta">${esc(c.comment)} <span class="gov-state ${c.required ? "st-expired" : "st-unknown"}">${esc(c.kind || "")}${c.reason ? " · " + esc(c.reason) : ""}</span></div>`).join("");
      const scorable = !(ev.status === "SUBMITTED" || ev.status === "LOCKED");
      const scoreControls = scorable ? `
        <div class="sih-scoreform">
          ${crits.map((c) => `
            <div class="sih-scoreform-row">
              <label>${esc(c.label || c.key)}${c.mandatory ? " *" : ""} (0–${c.maxScore || 100})</label>
              <input type="number" min="0" max="${c.maxScore || 100}" data-score-key="${esc(c.key)}" data-score-cur="${c.score == null ? "" : c.score}" class="input" style="width:80px" placeholder="—">
              <input type="text" class="input" data-note-key="${esc(c.key)}" placeholder="${esc(tr("evaluation.note"))}" style="flex:1">
            </div>`).join("")}
          <div class="sih-toolbar">
            <button type="button" class="btn btn-sm btn-primary" data-save="${esc(ev.id)}">${esc(tr("evaluation.saveScore"))}</button>
            ${(reqCount > 0 || true) ? `<button type="button" class="btn btn-sm" data-submit="${esc(ev.id)}">${esc(tr("evaluation.submit"))}</button>` : ""}
          </div>
        </div>` : "";
      return `
      <div class="card sih-card" style="margin:8px 0">
        <div class="sih-toolbar">
          <h4>${esc((ev.startup && ev.startup.brandName) || "—")}</h4>
          ${statusBadge(ev.status)}
          <span class="sih-meta">${esc(tr("evaluation.evaluator"))}: ${esc(ev.evaluatorUid || "")}</span>
          <span class="sih-meta">${esc(tr("evaluation.total"))}: ${ev.summary && ev.summary.total != null ? ev.summary.total : "—"}</span>
        </div>
        ${scores}
        ${req.length ? `<div class="sih-card-meta">${esc(tr("evaluation.requiredComments"))}: ${reqCount}&nbsp;${esc(tr("evaluation.pending"))}</div>` : ""}
        ${comments}
        ${scoreControls}
      </div>`;
    }).join("");
    return `<div class="sih-toolbar" style="margin-top:16px"><h3>${esc(tr("evaluation.workspace"))}</h3></div>${rows || `<div class="sih-empty">${esc(tr("evaluation.workspaceEmpty"))}</div>`}`;
  }
  function wireWorkspace(body) {
    body.querySelectorAll("[data-save]").forEach((btn) => {
      btn.onclick = async () => {
        const evId = btn.dataset.save;
        const card = btn.closest(".sih-card");
        let any = false;
        card.querySelectorAll("[data-score-key]").forEach((inp) => {
          if (inp.value === "") return;
          const key = inp.dataset.scoreKey;
          any = true;
          (async () => {
            const noteInp = card.querySelector(`[data-note-key="${key}"]`);
            try {
              await api("POST", "/evaluations/" + evId + "/score", { criterionKey: key, score: Number(inp.value), comment: noteInp ? noteInp.value : undefined });
              toast(tr("evaluation.scoreSaved"), true);
              await loadChallengeData();
              renderBody();
            } catch (e) { toast(e.message); }
          })();
        });
        if (!any) toast(tr("evaluation.noScore"), false);
      };
    });
    body.querySelectorAll("[data-submit]").forEach((btn) => {
      btn.onclick = async () => {
        try {
          await api("POST", "/evaluations/" + btn.dataset.submit + "/submit");
          toast(tr("evaluation.submitted"), true);
          await loadChallengeData();
          renderBody();
        } catch (e) { toast(e.message); }
      };
    });
  }

  /* ── comparison ── */
  function comparisonHtml() {
    const rows = (S.comparison && S.comparison.rows) || [];
    if (!rows.length) return `<div class="sih-toolbar" style="margin-top:16px"><h3>${esc(tr("evaluation.compare"))}</h3></div><div class="sih-empty">${esc(tr("evaluation.compareEmpty"))}</div>`;
    const list = rows.map((row) => {
      const critInfo = (row.criteria || []).map((c) => {
        const bad = c.variance && c.variance.highVariance ? `<span class="gov-state st-expired">Δ</span>` : "";
        return `<span class="sih-chip">${bad}${esc(c.key)}: ${c.stat}</span>`;
      }).join("");
      return `
      <div class="card sih-card" style="margin:8px 0">
        <div class="sih-toolbar">
          <h4>${esc((row.startup && row.startup.brandName) || "—")}</h4>
          ${resultBadge(row.result)}
          ${decisionBadge(row.latestDecision && row.latestDecision.decision)}
        </div>
        <div class="sih-meta-grid">
          <div><span class="sih-meta-label">${esc(tr("evaluation.total"))}</span><strong>${row.total}</strong></div>
          <div><span class="sih-meta-label">${esc(tr("evaluation.participation"))}</span>${row.participationCount}/${row.assignedCount}</div>
          <div><span class="sih-meta-label">${esc(tr("evaluation.evidence"))}</span>${pct(row.evidenceCoverage)}</div>
          <div><span class="sih-meta-label">${esc(tr("evaluation.confidence"))}</span>${pct(row.confidence)}</div>
        </div>
        <div class="sih-card-meta">${critInfo}</div>
        ${(row.criticalItems && row.criticalItems.length) ? `<div class="sih-card-meta">${(row.criticalItems).map((c) => `<span class="gov-state st-expired">${esc(c.type || "")}</span> ${esc(c.text || "")}`).join("<br>")}</div>` : ""}
        <div class="sih-toolbar">
          <button type="button" class="btn btn-sm" data-assist="${esc(row.startup.id)}">${esc(tr("evaluation.assist"))}</button>
          <button type="button" class="btn btn-sm" data-decision="${esc(row.startup.id)}">${esc(tr("evaluation.decide"))}</button>
          <button type="button" class="btn btn-sm" data-reqinfo="${esc(row.startup.id)}">${esc(tr("evaluation.requestInfo"))}</button>
          <button type="button" class="btn btn-sm" data-handoff="${esc(row.startup.id)}">${esc(tr("evaluation.handoff"))}</button>
        </div>
        <div class="sih-hidden" data-detail="${esc(row.startup.id)}"></div>
      </div>`;
    }).join("");
    return `<div class="sih-toolbar" style="margin-top:16px"><h3>${esc(tr("evaluation.compare"))}</h3></div>${list}`;
  }
  function wireComparison(body) {
    const startupName = (id) => {
      const r = ((S.comparison && S.comparison.rows) || []).find((x) => x.startup && x.startup.id === id);
      return r && r.startup ? r.startup.brandName : id;
    };
    body.querySelectorAll("[data-assist]").forEach((btn) => {
      btn.onclick = async () => {
        const sid = btn.dataset.assist;
        const target = body.querySelector(`[data-detail="${sid}"]`);
        target.innerHTML = `<div class="sih-empty">${esc(tr("evaluation.loading"))}…</div>`;
        try {
          const r = await api("POST", "/challenges/" + S.challenge.id + "/evaluation/assist", { startupId: sid });
          let bodyTxt = "";
          if (r.mode === "ai-advisory") {
            bodyTxt = `${esc(r.briefing || "")}<br><em class="sih-meta">${esc(r.disclaimer || "")}</em>`;
          } else if (r.mode === "deterministic-fallback") {
            bodyTxt = `${esc(r.overview ? (r.overview.score != null ? (tr("evaluation.total") + ": " + r.overview.score) : "") : r.reason || "")}<br><em class="sih-meta">${esc(tr("evaluation.aiFallback"))}</em>`;
          } else {
            bodyTxt = esc(JSON.stringify(r));
          }
          target.innerHTML = `<div class="card sih-card"><div class="sih-toolbar"><h4>${esc(startupName(sid))}</h4><span class="gov-state st-verified">${esc(tr("evaluation.advisory"))}</span></div><div class="sih-card-meta">${bodyTxt}</div></div>`;
        } catch (e) { target.innerHTML = `<div class="sih-empty">${esc(e.message)}</div>`; }
      };
    });
    body.querySelectorAll("[data-decision]").forEach((btn) => {
      btn.onclick = () => openDecisionModal(btn.dataset.decision, startupName(btn.dataset.decision));
    });
    body.querySelectorAll("[data-reqinfo]").forEach((btn) => {
      btn.onclick = () => openReqInfoModal(btn.dataset.reqinfo, startupName(btn.dataset.reqinfo));
    });
    body.querySelectorAll("[data-handoff]").forEach((btn) => {
      btn.onclick = async () => {
        if (!window.confirm(tr("evaluation.handoffConfirm"))) return;
        try {
          await api("POST", "/challenges/" + S.challenge.id + "/evaluation/pilot-handoff", { startupId: btn.dataset.handoff });
          toast(tr("evaluation.handoffDone"), true);
          await loadChallengeData();
          renderBody();
        } catch (e) { toast(e.message); }
      };
    });
  }

  /* ── assignments ── */
  function assignHtml() {
    const assigned = new Set(((S.workspace && S.workspace.evaluations) || []).map((e) => e.startupId));
    const unassigned = S.startups.filter((x) => !assigned.has(x.id));
    const lines = unassigned.map((x) => `
      <div class="sih-scoreform-row">
        <span class="sih-score-key">${esc(x.brandName || x.legalName || "—")}</span>
        <input type="text" class="input" data-assignee="${esc(x.id)}" placeholder="${esc(tr("evaluation.evaluatorUid"))}" style="flex:1">
        <button type="button" class="btn btn-sm" data-add-assign="${esc(x.id)}">${esc(tr("evaluation.assign"))}</button>
      </div>`).join("");
    if (!lines) return "";
    return `<div class="sih-toolbar" style="margin-top:16px"><h3>${esc(tr("evaluation.assignTitle"))}</h3></div>
      <div class="card sih-card">${lines || `<div class="sih-empty">${esc(tr("evaluation.assignEmpty"))}</div>`}</div>`;
  }
  function wireAssign(body) {
    body.querySelectorAll("[data-add-assign]").forEach((btn) => {
      btn.onclick = async () => {
        const sid = btn.dataset.addAssign;
        const inp = body.querySelector(`[data-assignee="${sid}"]`);
        const evaluatorUid = inp ? inp.value.trim() : "";
        if (!evaluatorUid) { toast(tr("evaluation.evaluatorUidReq"), false); return; }
        try {
          await api("POST", "/challenges/" + S.challenge.id + "/evaluation/assign", { assignments: [{ startupId: sid, evaluatorUid }] });
          toast(tr("evaluation.assigned"), true);
          await loadChallengeData();
          renderBody();
        } catch (e) { toast(e.message); }
      };
    });
  }

  /* ── advisory (last run) ── */
  function advisoryHtml() {
    if (!S.advisory) return "";
    return `<div class="card sih-card" style="margin-top:16px"><div class="sih-toolbar"><h3>${esc(tr("evaluation.advisory"))}</h3><span class="gov-state st-verified">${esc(S.advisory.mode || "")}</span></div><div class="sih-card-meta"><pre style="white-space:pre-wrap">${esc(JSON.stringify(S.advisory, null, 2))}</pre></div></div>`;
  }

  /* ── config editor ── */
  function renderConfig(body) {
    const rows = S.criteria;
    body.innerHTML = `
      <div class="card sih-card">
        <div class="sih-toolbar">
          <h3>${esc(tr("evaluation.config"))}</h3>
          <button type="button" class="btn btn-sm" id="evalBack">${esc(tr("evaluation.back"))}</button>
        </div>
        <p class="sih-hint small">${esc(tr("matching.configHint"))}</p>
        ${rows.map((c) => `
          <div class="sih-scoreform-row" data-cfg-key="${esc(c.key)}">
            <span class="sih-score-key"><strong>${esc(c.label || c.key)}</strong><br><span class="sih-meta">${esc(c.category || "")} · v${c.version}</span></span>
            <label class="sih-meta">${esc(tr("evaluation.weight"))}</label>
            <input type="number" class="input" style="width:80px" value="${c.weight}" data-w="${esc(c.key)}" min="0" max="100">
            <label class="sih-meta">${esc(tr("evaluation.minScore"))}</label>
            <input type="number" class="input" style="width:80px" value="${c.minimumScore == null ? "" : c.minimumScore}" data-min="${esc(c.key)}" min="0" max="100">
            <label class="sih-meta">${esc(tr("evaluation.maxScore"))}</label>
            <input type="number" class="input" style="width:80px" value="${c.maxScore == null ? 100 : c.maxScore}" data-max="${esc(c.key)}" min="1" max="100">
            <label class="sih-check"><input type="checkbox" data-mand="${esc(c.key)}" ${c.mandatory ? "checked" : ""}> ${esc(tr("evaluation.mandatory"))}</label>
            <label class="sih-check"><input type="checkbox" data-evid="${esc(c.key)}" ${c.evidenceRequired ? "checked" : ""}> ${esc(tr("evaluation.evidence"))}</label>
          </div>`).join("")}
        <div class="sih-toolbar">
          <span id="evalSum" class="sih-meta"></span>
          <button type="button" class="btn btn-sm btn-primary" id="evalSaveCfg">${esc(tr("matching.saveConfig"))}</button>
        </div>
        <div id="evalCfgOut"></div>
      </div>`;
    const sum = () => {
      let s = 0;
      rows.forEach((c) => { s += Number(body.querySelector(`[data-w="${c.key}"]`).value || 0); });
      const el = body.querySelector("#evalSum");
      el.textContent = tr("matching.sum") + ": " + s + "%";
      el.style.color = Math.abs(s - 100) < 0.001 ? "inherit" : "#d97706";
    };
    body.querySelectorAll("[data-w]").forEach((i) => i.oninput = sum);
    sum();
    body.querySelector("#evalBack").onclick = () => { S.view = "dashboard"; renderBody(); };
    body.querySelector("#evalSaveCfg").onclick = async () => {
      const criteria = rows.map((c) => ({
        key: c.key, label: c.label, description: c.description || "", category: c.category || "OTHER",
        weight: Number(body.querySelector(`[data-w="${c.key}"]`).value || 0),
        minimumScore: body.querySelector(`[data-min="${c.key}"]`).value === "" ? null : Number(body.querySelector(`[data-min="${c.key}"]`).value),
        maxScore: Number(body.querySelector(`[data-max="${c.key}"]`).value || 100),
        mandatory: body.querySelector(`[data-mand="${c.key}"]`).checked,
        evidenceRequired: body.querySelector(`[data-evid="${c.key}"]`).checked,
      }));
      try {
        const r = await api("POST", "/challenges/" + S.challenge.id + "/evaluation/configure", { criteria, changeReason: "Configured from Evaluation Center" });
        toast(tr("matching.saved"), true);
        S.view = "dashboard";
        await loadChallengeData();
        renderBody();
      } catch (e) {
        const out = body.querySelector("#evalCfgOut");
        out.innerHTML = `<span class="gov-state st-expired">${esc(e.message)}</span>`;
      }
    };
  }

  /* ── modals (decision / request-info) ── */
  function overlay(inner) {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;inset:0;background:rgba(9,15,28,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";
    el.innerHTML = `<div class="card" style="max-width:560px;width:100%;background:#fff;border-radius:12px">${inner}</div>`;
    el.addEventListener("click", (e) => { if (e.target === el) el.remove(); });
    document.body.appendChild(el);
    return el;
  }
  function openDecisionModal(startupId, startupName) {
    const el = overlay(`
      <div class="sih-toolbar"><h3>${esc(tr("evaluation.decide"))} — ${esc(startupName)}</h3></div>
      <label class="field-label">${esc(tr("evaluation.decision"))}</label>
      <select class="select" id="mdDecision">
        <option>PROCEED_TO_PILOT</option><option>REQUEST_MORE_INFORMATION</option>
        <option>HOLD</option><option>DO_NOT_PROCEED</option><option>CUSTOM</option>
      </select>
      <label class="field-label">${esc(tr("evaluation.reason"))}</label>
      <textarea class="input" id="mdReason" rows="3" style="width:100%" placeholder="${esc(tr("evaluation.reasonHint"))}"></textarea>
      <label class="field-label">${esc(tr("evaluation.conditions"))}</label>
      <textarea class="input" id="mdConditions" rows="2" style="width:100%" placeholder="${esc(tr("evaluation.conditionsHint"))}"></textarea>
      <label class="sih-check"><input type="checkbox" id="mdAck"> ${esc(tr("evaluation.acknowledge"))}</label>
      <div class="sih-toolbar">
        <button type="button" class="btn btn-sm" id="mdCancel">${esc(tr("evaluation.back"))}</button>
        <button type="button" class="btn btn-sm btn-primary" id="mdGo">${esc(tr("evaluation.record"))}</button>
      </div>
      <div id="mdOut"></div>`);
    el.querySelector("#mdCancel").onclick = () => el.remove();
    el.querySelector("#mdGo").onclick = async () => {
      const body = {
        startupId,
        decision: el.querySelector("#mdDecision").value,
        reason: el.querySelector("#mdReason").value.trim(),
        conditions: el.querySelector("#mdConditions").value.split("\n").map((s) => s.trim()).filter(Boolean).map((text) => ({ text })),
        acknowledge: el.querySelector("#mdAck").checked,
      };
      try {
        await api("POST", "/challenges/" + S.challenge.id + "/evaluation/decision", body);
        toast(tr("evaluation.recorded"), true);
        el.remove();
        await loadChallengeData();
        renderBody();
      } catch (e) {
        el.querySelector("#mdOut").innerHTML = `<span class="gov-state st-expired">${esc(e.message)}</span>`;
      }
    };
  }
  function openReqInfoModal(startupId, startupName) {
    const el = overlay(`
      <div class="sih-toolbar"><h3>${esc(tr("evaluation.requestInfo"))} — ${esc(startupName)}</h3></div>
      <label class="field-label">${esc(tr("evaluation.subject"))}</label>
      <input type="text" class="input" id="riSubject" style="width:100%">
      <label class="field-label">${esc(tr("evaluation.details"))}</label>
      <textarea class="input" id="riDetails" rows="3" style="width:100%"></textarea>
      <div class="sih-toolbar">
        <button type="button" class="btn btn-sm" id="riCancel">${esc(tr("evaluation.back"))}</button>
        <button type="button" class="btn btn-sm btn-primary" id="riGo">${esc(tr("evaluation.send"))}</button>
      </div>`);
    el.querySelector("#riCancel").onclick = () => el.remove();
    el.querySelector("#riGo").onclick = async () => {
      const subject = el.querySelector("#riSubject").value.trim();
      const details = el.querySelector("#riDetails").value.trim();
      if (!subject) { toast(tr("evaluation.subjectReq"), false); return; }
      try {
        await api("POST", "/challenges/" + S.challenge.id + "/evaluation/request-information", { startupId, subject, details });
        toast(tr("evaluation.requestSent"), true);
        el.remove();
        await loadChallengeData();
        renderBody();
      } catch (e) { toast(e.message); }
    };
  }

  window.SIHEvaluation = { render };
})();