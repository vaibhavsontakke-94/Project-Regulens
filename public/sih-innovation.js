/* ════════════════════════════════════════════════════════════════════
   ReguLens INNOVATION PROCUREMENT (SIH26136) — additive frontend
   ──────────────────────────────────────────────────────────────────
   Guided workflow:  Government Problem → AI structuring (optional) →
   Review → Approval → Innovation Challenge → Review → Approval → Publish.
   No AI ever publishes. Every action goes through /api/sih with a
   Firebase ID-token Bearer header (mirrors app.js authHeaders pattern).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const BASE = "/api/sih";
  const LS = "regulens.sihctx.v1";

  const S = {
    org: null,
    orgs: [],
    problems: [],
    challenges: [],
    busy: false,
    error: null,
    view: "",
    problem: null,
    structure: null,
    provenance: null,
    challenge: null,
    quality: null,
    generated: null,
    zv: {}, // working copy for new problem form
  };

  /* ───────── i18n ───────── */
  function lang() {
    const api = window.ReguLens;
    return api && typeof api.getLang === "function" ? api.getLang() || "en" : "en";
  }
  const LSX = window.SIH_I18N || {};
  function tr(key, vars) {
    const l = lang();
    let s = (LSX[l] && LSX[l][key]) || (LSX.en && LSX.en[key]) || key;
    if (vars) for (const k of Object.keys(vars)) s = String(s).split("{{" + k + "}}").join(String(vars[k]));
    return s;
  }
  const T = tr;

  /* ───────── helpers ───────── */
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
  function money(n) {
    const num = Number(n || 0);
    if (!num) return "₹0";
    return "₹" + num.toLocaleString("en-IN");
  }

  function saveCtx() {
    try {
      localStorage.setItem(LS, JSON.stringify({ orgId: S.org ? S.org.id : "" }));
    } catch (_) {}
  }
  function loadCtxOrgId() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS) || "null");
      return raw && raw.orgId ? raw.orgId : "";
    } catch (_) {
      return "";
    }
  }

  /* ───────── auth'd fetch (mirrors app.js authHeaders) ───────── */
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
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(BASE + path, opts);
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error((data && data.error) || "HTTP " + res.status);
    return data;
  }

  /* ───────── data loading ───────── */
  async function loadOrgs() {
    const data = await api("GET", "/organizations");
    S.orgs = (data.organizations || []).filter((o) => o.orgType === "GOVERNMENT");
    const saved = loadCtxOrgId();
    S.org = S.orgs.find((o) => o.id === saved) || S.orgs[0] || null;
    saveCtx();
  }

  async function loadProblems() {
    if (!S.org) { S.problems = []; return; }
    const d = await api("GET", "/problems?organizationId=" + encodeURIComponent(S.org.id));
    S.problems = d.problems || [];
  }

  async function loadChallenges() {
    if (!S.org) { S.challenges = []; return; }
    try {
      const d = await api("GET", "/challenges?organizationId=" + encodeURIComponent(S.org.id));
      S.challenges = d.challenges || [];
    } catch (_) {
      S.challenges = [];
    }
  }

  async function openProblem(id) {
    S.problem = await api("GET", "/problems/" + id);
    S.structure = null;
    S.provenance = null;
    S.quality = null;
    S.generated = null;
    S.challenge = null;
    S.view = "sih-problem";
  }

  async function openChallenge(id) {
    S.challenge = await api("GET", "/challenges/" + id);
    S.view = "sih-challenge";
  }

  async function refreshProblem() {
    if (S.problem) S.problem = await api("GET", "/problems/" + S.problem.id);
  }
  async function refreshChallenge() {
    if (S.challenge) S.challenge = await api("GET", "/challenges/" + S.challenge.id);
  }

  /* ───────── render dispatcher ───────── */
  function render(view) {
    S.view = view;
    const root = $("sihBody");
    if (!root) return;
    if (view === "sih-procurement") return renderProcurement(root);
    if (view === "sih-problem-detail") return renderProblemDetail(root);
    if (view === "sih-challenge-detail") return renderChallengeDetail(root);
  }

  /* ───────── VIEW: procurement (problem list) ───────── */
  function renderProcurement(root) {
    root.innerHTML = `
      <div class="sih-orgbar">
        <label class="field-label">${esc(T("sih.org"))}</label>
        <select id="sihOrgSel" class="select">
          ${S.orgs.map((o) => `<option value="${esc(o.id)}" ${o.id === (S.org && S.org.id) ? "selected" : ""}>${esc(o.name)}</option>`).join("") || `<option value="">${esc(T("sih.noorg"))}</option>`}
        </select>
        <button id="sihRefresh" class="btn btn-ghost">${esc(T("sih.refresh"))}</button>
      </div>
      <div class="sih-toolbar">
        <h3>${esc(T("sih.problems.title"))}</h3>
        <button id="sihNewProblem" class="btn btn-primary">+ ${esc(T("sih.newproblem"))}</button>
      </div>
      <div class="sih-grid">${renderProblemCards()}</div>
      <hr class="sih-divider">
      <h3>${esc(T("sih.challenges.title"))}</h3>
      <div class="sih-grid">${renderChallengeCards()}</div>
    `;
    bindOrgSel(root);
  }

  function renderProblemCards() {
    if (!S.problems.length) return `<p class="sih-empty">${esc(T("sih.problems.empty"))}</p>`;
    return S.problems.map((p) => `
      <div class="card sih-card">
        <div class="sih-card-top">
          <span class="gov-state st-${esc(String(p.status).toLowerCase())}">${esc(T("sih.state." + p.status))}</span>
          <span class="sih-sector">${esc(p.sector || T("sih.unspecified"))}</span>
        </div>
        <h4 class="sih-card-title">${esc(p.title)}</h4>
        <p class="sih-card-sub">${esc(String(p.problemStatement || "").slice(0, 110))}${p.problemStatement && p.problemStatement.length > 110 ? "…" : ""}</p>
        <div class="sih-card-meta">
          <span>${esc(money(p.estimatedBudget))}</span>
          <button class="btn btn-ghost btn-sm" data-open-problem="${esc(p.id)}">${esc(T("sih.open"))}</button>
        </div>
      </div>
    `).join("");
  }

  function renderChallengeCards() {
    if (!S.challenges.length) return `<p class="sih-empty">${esc(T("sih.challenges.empty"))}</p>`;
    return S.challenges.map((c) => `
      <div class="card sih-card">
        <div class="sih-card-top">
          <span class="gov-state st-${esc(String(c.challengeStatus).toLowerCase())}">${esc(T("sih.state." + c.challengeStatus))}</span>
          <span class="sih-sector">${esc(c.challengeCode || "")}</span>
        </div>
        <h4 class="sih-card-title">${esc(c.title)}</h4>
        <p class="sih-card-sub">${esc(c.objective || String(c.description || "").slice(0, 110))}</p>
        <div class="sih-card-meta">
          <span>${esc(money(c.budgetMin))} – ${esc(money(c.budgetMax))}</span>
          <button class="btn btn-ghost btn-sm" data-open-challenge="${esc(c.id)}">${esc(T("sih.open"))}</button>
        </div>
      </div>
    `).join("");
  }

  function bindOrgSel(root) {
    const sel = root.querySelector("#sihOrgSel");
    if (sel) sel.addEventListener("change", async () => {
      S.org = S.orgs.find((o) => o.id === sel.value) || null;
      saveCtx();
      await Promise.all([loadProblems(), loadChallenges()]);
      renderProcurement(root);
    });
    const ref = root.querySelector("#sihRefresh");
    if (ref) ref.addEventListener("click", async () => {
      await Promise.all([loadProblems(), loadChallenges()]);
      renderProcurement(root);
    });
    const nb = root.querySelector("#sihNewProblem");
    if (nb) nb.addEventListener("click", () => {
      S.zv = {};
      S.view = "sih-newproblem";
      renderNewProblem(root);
    });
    root.querySelectorAll("[data-open-problem]").forEach((b) =>
      b.addEventListener("click", async () => {
        S.problem = await api("GET", "/problems/" + b.dataset.openProblem);
        S.structure = null; S.provenance = null; S.quality = null; S.generated = null; S.challenge = null;
        renderProblemDetail(root);
      })
    );
    root.querySelectorAll("[data-open-challenge]").forEach((b) =>
      b.addEventListener("click", async () => {
        S.challenge = await api("GET", "/challenges/" + b.dataset.openChallenge);
        renderChallengeDetail(root);
      })
    );
  }

  /* ───────── VIEW: new problem ───────── */
  function renderNewProblem(root) {
    const z = S.zv;
    root.innerHTML = `
      <div class="sih-toolbar"><button id="sihBack1" class="btn btn-ghost">← ${esc(T("sih.back"))}</button><h3>${esc(T("sih.newproblem"))}</h3></div>
      <div class="card sih-form">
        <div class="field"><label class="field-label">${esc(T("sih.field.title"))} *</label>
          <input class="input" id="zTitle" value="${esc(z.title || "")}" placeholder="${esc(T("sih.placeholder.title"))}"></div>
        <div class="field"><label class="field-label">${esc(T("sih.field.statement"))} *</label>
          <textarea class="input" id="zStatement" rows="3">${esc(z.problemStatement || "")}</textarea></div>
        <div class="field"><label class="field-label">${esc(T("sih.field.current"))}</label>
          <textarea class="input" id="zCurrent" rows="2">${esc(z.currentState || "")}</textarea></div>
        <div class="field"><label class="field-label">${esc(T("sih.field.desired"))}</label>
          <textarea class="input" id="zDesired" rows="2">${esc(z.desiredState || "")}</textarea></div>
        <div class="field"><label class="field-label">${esc(T("sih.field.affected"))}</label>
          <input class="input" id="zAffected" value="${esc(z.affectedUsers || "")}"></div>
        <div class="field"><label class="field-label">${esc(T("sih.field.geography"))}</label>
          <input class="input" id="zGeography" value="${esc(z.geography || "")}"></div>
        <div class="row">
          <div class="field"><label class="field-label">${esc(T("sih.field.sector"))}</label>
            <input class="input" id="zSector" value="${esc(z.sector || "")}"></div>
          <div class="field"><label class="field-label">${esc(T("sih.field.budget"))}</label>
            <input class="input" type="number" id="zBudget" value="${esc(z.estimatedBudget || "")}" min="0"></div>
        </div>
        <div class="sih-form-actions">
          <button id="zSave" class="btn btn-primary">${esc(T("sih.save"))}</button>
        </div>
      </div>
    `;
    const back = root.querySelector("#sihBack1");
    if (back) back.addEventListener("click", async () => {
      await Promise.all([loadProblems(), loadChallenges()]);
      renderProcurement(root);
    });
    const save = root.querySelector("#zSave");
    if (save) save.addEventListener("click", async () => {
      const body = {
        organizationId: S.org.id,
        title: root.querySelector("#zTitle").value.trim(),
        problemStatement: root.querySelector("#zStatement").value.trim(),
        currentState: root.querySelector("#zCurrent").value.trim(),
        desiredState: root.querySelector("#zDesired").value.trim(),
        affectedUsers: root.querySelector("#zAffected").value.trim(),
        geography: root.querySelector("#zGeography").value.trim(),
        sector: root.querySelector("#zSector").value.trim(),
        estimatedBudget: Number(root.querySelector("#zBudget").value || 0),
      };
      if (!body.title || !body.problemStatement) { toast(T("sih.err.required")); return; }
      try {
        S.problem = await api("POST", "/problems", body);
        S.structure = null; S.provenance = null; S.quality = null; S.generated = null; S.challenge = null;
        toast(T("sih.created"));
        await loadProblems();
        renderProblemDetail(root);
      } catch (e) { toast(e.message); }
    });
  }

  /* ───────── VIEW: problem detail ───────── */
  function renderProblemDetail(root) {
    const p = S.problem;
    if (!p) { renderProcurement(root); return; }
    const q = S.quality;
    const ring = q ? `<div class="sih-ring" style="--p:${Math.round(q.completeness)}"><span>${Math.round(q.completeness)}%</span></div>` : "";
    const qualityBlock = q ? `
      <div class="card sih-qa">
        <div class="sih-qa-head">
          ${ring}
          <div>
            <h4>${esc(T("sih.qc.title"))}</h4>
            <p class="sih-hint">${esc(T("sih.qc.hint"))}</p>
          </div>
        </div>
        <p class="sih-qc-verdict ${q.canCreateChallenge ? "ok" : "bad"}">${q.canCreateChallenge ? "✓ " + esc(T("sih.qc.ready")) : esc(T("sih.qc.notready"))}</p>
        <ul class="sih-issues">
          ${q.issues.map((i) => `<li class="${i.severity === "blocking" ? "bad" : "warn"}">${esc(i.label)} — ${esc(i.note || "")}</li>`).join("") || `<li>${esc(T("sih.qc.none"))}</li>`}
        </ul>
      </div>` : "";

    const structureBlock = S.structure ? renderStructureBlock() : "";
    const generatedBlock = S.generated ? renderGeneratedBlock() : "";

    root.innerHTML = `
      <div class="sih-toolbar">
        <button id="sihBack2" class="btn btn-ghost">← ${esc(T("sih.back"))}</button>
        <span class="gov-state st-${esc(String(p.status).toLowerCase())}">${esc(T("sih.state." + p.status))}</span>
      </div>
      <h2 class="sih-problem-title">${esc(p.title)}</h2>
      <p class="sih-statement">${esc(p.problemStatement)}</p>
      <div class="sih-meta-grid">
        <div><span class="sih-meta-label">${esc(T("sih.field.sector"))}</span>${esc(p.sector || "—")}</div>
        <div><span class="sih-meta-label">${esc(T("sih.field.geography"))}</span>${esc(p.geography || "—")}</div>
        <div><span class="sih-meta-label">${esc(T("sih.field.budget"))}</span>${esc(money(p.estimatedBudget))}</div>
      </div>

      <div class="sih-actions">
        <button id="sihRunQc" class="btn btn-ghost">${esc(T("sih.qc.run"))}</button>
        <button id="sihRunAi" class="btn btn-ghost">${esc(T("sih.ai.structure"))}</button>
        <button id="sihApproveProb" class="btn btn-primary">${esc(T("sih.approve"))}</button>
        <button id="sihGenCh" class="btn btn-primary">${esc(T("sih.genchallenge"))}</button>
      </div>

      ${qualityBlock}
      ${structureBlock}
      ${generatedBlock}
    `;

    const back = root.querySelector("#sihBack2");
    if (back) back.addEventListener("click", async () => {
      await Promise.all([loadProblems(), loadChallenges()]);
      renderProcurement(root);
    });
    const runQc = root.querySelector("#sihRunQc");
    if (runQc) runQc.addEventListener("click", async () => {
      try { S.quality = await api("POST", `/problems/${p.id}/quality-check`); renderProblemDetail(root); }
      catch (e) { toast(e.message); }
    });
    const runAi = root.querySelector("#sihRunAi");
    if (runAi) runAi.addEventListener("click", async () => {
      try {
        const d = await api("POST", `/problems/${p.id}/ai-structure`, { lang: lang() });
        S.structure = d.structure; S.provenance = d.provenance; S.quality = d.quality;
        toast(d.record.mode === "DETERMINISTIC" ? T("sih.ai.fallback") : T("sih.ai.done"));
        renderProblemDetail(root);
      } catch (e) { toast(e.message); }
    });
    const apr = root.querySelector("#sihApproveProb");
    if (apr) apr.addEventListener("click", async () => {
      try { S.problem = await api("POST", `/problems/${p.id}/approve`); toast(T("sih.approved")); await loadProblems(); renderProblemDetail(root); }
      catch (e) { toast(e.message); }
    });
    const gen = root.querySelector("#sihGenCh");
    if (gen) gen.addEventListener("click", async () => {
      try {
        const d = await api("POST", `/problems/${p.id}/generate-challenge`, {
          lang: lang(),
          structure: S.structure || undefined,
        });
        S.generated = d.preview;
        renderProblemDetail(root);
      } catch (e) { toast(e.message); }
    });
  }

  function renderStructureBlock() {
    const s = S.structure;
    const items = (arr, empty) => (Array.isArray(arr) && arr.length ? arr.map((x) => `<li>${esc(typeof x === "string" ? x : (x && x.name) || JSON.stringify(x))}</li>`).join("") : `<li class="sih-muted">${esc(empty || "—")}</li>`);
    const prov = S.provenance || {};
    return `
      <div class="card sih-structure">
        <div class="sih-toolbar"><h4>${esc(T("sih.ai.structure"))}</h4>
          <span class="gov-state st-${s.confidence && s.confidence >= 60 ? "ready" : "warn"}">${esc(T("sih.ai.conf"))}: ${Math.round(s.confidence || 0)}%</span></div>
        <p><strong>${esc(T("sih.ai.summary"))}:</strong> ${esc(s.problem_summary || "—")}</p>
        ${renderProvBar(prov.problem_summary)}
        <div class="sih-struct-cols">
          <div><h5>${esc(T("sih.ai.objectives"))}</h5><ul>${items(s.objectives)}</ul></div>
          <div><h5>${esc(T("sih.ai.outcomes"))}</h5><ul>${items(s.outcomes)}</ul></div>
        </div>
        <h5>${esc(T("sih.ai.kpis"))}</h5><ul>${items(s.potential_kpis)}</ul>
        <h5>${esc(T("sih.ai.capabilities"))}</h5><ul>${items(s.required_capabilities)}</ul>
        <h5>${esc(T("sih.ai.constraints"))}</h5><ul>${items(s.constraints)}</ul>
        <h5>${esc(T("sih.ai.missing"))}</h5><ul>${items(s.missing_information)}</ul>
        ${s.assumptions && s.assumptions.length ? `<h5>${esc(T("sih.ai.assumptions"))}</h5><ul>${items(s.assumptions)}</ul>` : ""}
        <p class="sih-hint">${esc(T("sih.ai.reviewhint"))}</p>
      </div>`;
  }

  function renderProvBar(entry) {
    if (!entry || !entry.provenance) return "";
    const cls = "src-" + String(entry.provenance).toLowerCase().replace(/_/g, "-");
    return `<p class="sih-hint">${esc(T("sih.prov"))}: <span class="gov-badge ${cls}">${esc(T("sih.prov." + entry.provenance))}</span></p>`;
  }

  function renderGeneratedBlock() {
    const g = S.generated;
    if (!g) return "";
    const items = (arr, empty) => (Array.isArray(arr) && arr.length ? arr.map((x) => `<li>${esc(typeof x === "string" ? x : x && x.name || JSON.stringify(x))}</li>`).join("") : `<li class="sih-muted">${esc(empty || "—")}</li>`);
    return `
      <div class="card sih-structure">
        <div class="sih-toolbar"><h4>${esc(T("sih.challenge.preview"))}</h4>
          ${g.needsConfirmation ? `<span class="gov-state st-warn">${esc(T("sih.budget.confirm"))}</span>` : ""}</div>
        <p><strong>${esc(g.title)}</strong></p>
        <p>${esc(g.objective || "")}</p>
        <h5>${esc(T("sih.field.scope"))}</h5><ul>${items([g.scope], T("sih.none"))}</ul>
        <h5>${esc(T("sih.ai.outcomes"))}</h5><ul>${items(g.expectedOutcomes)}</ul>
        <h5>${esc(T("sih.ai.capabilities"))}</h5><ul>${items(g.technicalCapabilities)}</ul>
        ${g.budgetText ? `<p><strong>${esc(T("sih.field.budget"))}:</strong> ${esc(g.budgetText)}</p>` : `<p><strong>${esc(T("sih.field.budget"))}:</strong> ${esc(money(g.budgetMin))} – ${esc(money(g.budgetMax))}</p>`}
        <div class="sih-form-actions">
          <button id="sihSaveDraft" class="btn btn-primary">${esc(T("sih.savedraft"))}</button>
        </div>
      </div>`;
  }

  /* ───────── VIEW: challenge detail ───────── */
  function renderChallengeDetail(root) {
    const c = S.challenge;
    if (!c) { renderProcurement(root); return; }
    const eff = (c.evaluationFramework && c.evaluationFramework.criteria) || [];
    root.innerHTML = `
      <div class="sih-toolbar">
        <button id="sihBack3" class="btn btn-ghost">← ${esc(T("sih.back"))}</button>
        <span class="gov-state st-${esc(String(c.challengeStatus).toLowerCase())}">${esc(T("sih.state." + c.challengeStatus))}</span>
        ${c.challengeCode ? `<span class="sih-sector">${esc(c.challengeCode)}</span>` : ""}
      </div>
      <h2 class="sih-problem-title">${esc(c.title)}</h2>
      <p class="sih-statement">${esc(c.objective || c.description || "")}</p>
      <div class="sih-meta-grid">
        <div><span class="sih-meta-label">${esc(T("sih.field.budget"))}</span>${esc(money(c.budgetMin))} – ${esc(money(c.budgetMax))}</div>
        <div><span class="sih-meta-label">${esc(T("sih.field.scope"))}</span>${esc(c.scope || "—")}</div>
        <div><span class="sih-meta-label">${esc(T("sih.pilot.days"))}</span>${esc(c.pilotDurationDays || "—")}</div>
      </div>
      <div class="sih-actions">
        <button id="sihSubmitReview" class="btn btn-ghost">${esc(T("sih.submitreview"))}</button>
        <button id="sihApproveCh" class="btn btn-primary">${esc(T("sih.approve"))}</button>
        <button id="sihPublish" class="btn btn-primary">${esc(T("sih.publish"))}</button>
      </div>
      <div class="card sih-structure">
        <h5>${esc(T("sih.ai.outcomes"))}</h5><ul>${(c.expectedOutcomes || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <h5>${esc(T("sih.ai.capabilities"))}</h5><ul>${(c.technicalCapabilities || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <h5>${esc(T("sih.ai.kpis"))}</h5><ul>${(c.successMetrics || []).map((x) => `<li>${esc(typeof x === "string" ? x : (x.name || "") + (x.target ? " → " + x.target : ""))}</li>`).join("") || `<li class="sih-muted">—</li>`}</ul>
        ${eff.length ? `<h5>${esc(T("sih.eval.criteria"))}</h5><ul>${eff.map((x) => `<li>${esc(x.name || x.key)} — ${esc(x.weight)}%</li>`).join("")}</ul>` : ""}
      </div>
    `;
    const back = root.querySelector("#sihBack3");
    if (back) back.addEventListener("click", async () => { await loadChallenges(); renderProcurement(root); });
    const sub = root.querySelector("#sihSubmitReview");
    if (sub) sub.addEventListener("click", async () => {
      try { S.challenge = await api("POST", `/challenges/${c.id}/submit-review`); toast(T("sih.submitted")); await loadChallenges(); renderChallengeDetail(root); }
      catch (e) { toast(e.message); }
    });
    const apr = root.querySelector("#sihApproveCh");
    if (apr) apr.addEventListener("click", async () => {
      try { S.challenge = await api("POST", `/challenges/${c.id}/approve`); toast(T("sih.approved")); await loadChallenges(); renderChallengeDetail(root); }
      catch (e) { toast(e.message); }
    });
    const pub = root.querySelector("#sihPublish");
    if (pub) pub.addEventListener("click", async () => {
      try { S.challenge = await api("POST", `/challenges/${c.id}/publish`); toast(T("sih.published")); await loadChallenges(); renderChallengeDetail(root); }
      catch (e) { toast(e.message); }
    });
  }

  /* ───────── entrypoint ───────── */
  async function renderView(view) {
    const root = $("sihBody");
    if (!root) return;
    S.view = view;
    root.innerHTML = `<p class="sih-empty">${esc(T("sih.loading"))}</p>`;
    try {
      if (!S.orgs.length) await loadOrgs();
      if (!S.org) {
        showNoOrg(root);
        return;
      }
      await Promise.all([loadProblems(), loadChallenges()]);
    } catch (e) {
      S.error = e.message;
      setTimeout(() => renderProcurement(root), 0);
      return;
    }
    render(view, true);
  }

  function showNoOrg(root) {
    root.innerHTML = `
      <div class="card sih-form">
        <h3>${esc(T("sih.noorg.title"))}</h3>
        <p class="sih-hint">${esc(T("sih.noorg.hint"))}</p>
        <div class="field"><label class="field-label">${esc(T("sih.noorg.name"))}</label>
          <input class="input" id="noOrgName"></div>
        <div class="field"><label class="field-label">${esc(T("sih.field.state"))}</label>
          <input class="input" id="noOrgState"></div>
        <div class="sih-form-actions"><button id="noOrgCreate" class="btn btn-primary">${esc(T("sih.noorg.create"))}</button></div>
      </div>`;
    const create = root.querySelector("#noOrgCreate");
    if (create) create.addEventListener("click", async () => {
      try {
        S.org = await api("POST", "/organizations", {
          orgType: "GOVERNMENT",
          name: (root.querySelector("#noOrgName").value || "").trim(),
          state: root.querySelector("#noOrgState").value.trim(),
        });
        S.orgs = [S.org];
        saveCtx();
        await Promise.all([loadProblems(), loadChallenges()]);
        render(view);
      } catch (e) { toast(e.message); }
    });
  }

  function init() {
    const root = $("sihBody");
    if (root) root.innerHTML = `<p class="sih-empty">${esc(T("sih.loading"))}</p>`;
  }

  /* lazy first paint on nav */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.SIHInnovation = { render: renderView, init, refreshOrg: loadOrgs };
})();
