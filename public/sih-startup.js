/* ════════════════════════════════════════════════════════════════════
   ReguLens STARTUP INTELLIGENCE PROFILE (SIH26136) — additive frontend
   ──────────────────────────────────────────────────────────────────
   Startup Profile (~20 sections) → completeness (not eligibility) →
   AI capability extraction (human-confirmed) → Verification Center →
   Evidence → Documents (expiry + duplicate detection) → Profile Health.
   Provenance and verification stay separate; AI never auto-verifies.
   All actions go through /api/sih with a Firebase ID-token Bearer header.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const BASE = "/api/sih";
  const LS = "regulens.sihstartup.v1";

  const S = {
    org: null,
    orgs: [],
    startups: [],
    startup: null,
    intel: null,
    busy: false,
    view: "",
    panel: "sections",
  };

  /* ───────── i18n ───────── */
  function lang() {
    const api = window.ReguLens;
    return api && typeof api.getLang === "function" ? api.getLang() || "en" : "en";
  }
  const LSX = window.SIHStartupI18N || {};
  function tr(key, vars) {
    const l = lang();
    let s = (LSX[l] && LSX[l][key]) || (LSX.en && LSX.en[key]) || key;
    if (vars) for (const k of Object.keys(vars)) s = String(s).split("{{" + k + "}}").join(String(vars[k]));
    return s;
  }

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
  function saveCtx() {
    try { localStorage.setItem(LS, JSON.stringify({ orgId: S.org ? S.org.id : "" })); } catch (_) {}
  }
  function loadCtxOrgId() {
    try { const raw = JSON.parse(localStorage.getItem(LS) || "null"); return raw && raw.orgId ? raw.orgId : ""; } catch (_) { return ""; }
  }
  function provLabel(p) {
    return tr("ss.prov." + (p || "NOT_PROVIDED"), {}) === ("ss.prov." + (p || "NOT_PROVIDED"))
      ? (p || "NOT_PROVIDED") : tr("ss.prov." + (p || "NOT_PROVIDED"));
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
    if (body !== undefined) { headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
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
  async function loadStartups() {
    if (!S.org) { S.startups = []; return; }
    const d = await api("GET", "/startups?organizationId=" + encodeURIComponent(S.org.id));
    S.startups = d.startups || [];
  }
  async function openStartup(id) {
    S.startup = await api("GET", "/startups/" + id);
    S.panel = "sections";
    await refreshIntel();
  }
  async function refreshIntel() {
    if (!S.startup) return;
    S.intel = await api("GET", "/startups/" + S.startup.id + "/intelligence");
  }
  async function recompute() {
    if (!S.startup) return;
    const r = await api("POST", "/startups/" + S.startup.id + "/profile/recompute");
    S.intel = r.intel || S.intel;
    return r;
  }

  /* ───────── render dispatcher ───────── */
  function render(view) {
    S.view = view;
    const root = $("sihStartupBody");
    if (!root) return;
    if (S.view === "sih-startup") return renderHome(root);
  }

  /* ───────── VIEW: startup home (org + list) ───────── */
  async function renderHome(root) {
    root.innerHTML = `<div class="sih-empty">${esc(tr("ss.loading"))}</div>`;
    try {
      await loadOrgs();
      await loadStartups();
    } catch (e) {
      root.innerHTML = `<div class="sih-empty">${esc(e.message)}</div>`;
      return;
    }
    root.innerHTML = `
      <div class="sih-orgbar">
        <span class="field-label">${esc(tr("ss.org"))}</span>
        <select id="startupOrgSelect" class="select">${S.orgs.map((o) =>
          `<option value="${esc(o.id)}" ${S.org && o.id === S.org.id ? "selected" : ""}>${esc(o.name)}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-sm btn-ghost" id="startupRefresh">${esc(tr("ss.refresh"))}</button>
      </div>
      <h2>${esc(tr("ss.profile"))}</h2>
      <div class="sih-hint">${esc(tr("ss.completeness.notEligibility"))}</div>
      <div class="sih-toolbar">
        <h3>Startups</h3>
      </div>
      ${S.startups.length ? `<div class="sih-grid">${S.startups.map(startupCard).join("")}</div>`
        : `<div class="sih-empty">${esc(tr("ss.nostartup"))}</div>`}`;
    const sel = $("startupOrgSelect");
    if (sel) sel.addEventListener("change", async () => {
      const id = sel.value;
      S.org = S.orgs.find((o) => o.id === id) || null;
      saveCtx();
      await loadStartups();
      renderHome(root);
    });
    const ref = $("startupRefresh");
    if (ref) ref.addEventListener("click", () => renderHome(root));
    root.querySelectorAll("[data-open]").forEach((b) =>
      b.addEventListener("click", () => openStartup(b.getAttribute("data-open")).then(() => renderDetail(root))));
  }

  function startupCard(s) {
    return `
      <article class="card sih-card">
        <div class="sih-card-top">
          <span class="sih-sector">${esc(s.brandName || s.legalName || "")}</span>
          <span class="gov-state st-${esc(String(s.verificationStatus || "unverified").toLowerCase())}">${esc(s.verificationStatus || "UNVERIFIED")}</span>
        </div>
        <h3 class="sih-card-title">${esc(s.legalName || "")}</h3>
        <p class="sih-card-sub">${esc(s.sector || "")} · ${esc(s.stage || "")}</p>
        <div class="sih-card-meta">
          <span>DPIIT: ${esc(s.dpiitStatus || "—")}</span>
          <button type="button" class="btn btn-sm" data-open="${esc(s.id)}">${esc(tr("ss.open"))}</button>
        </div>
      </article>`;
  }

  /* ───────── VIEW: startup detail dashboard ───────── */
  function renderDetail(root) {
    const pj = ((S.intel && S.intel.profile && S.intel.profile.profileJson) || {});
    const completeness = ((S.intel && S.intel.profile && S.intel.profile.completeness) || {});
    const status = ((S.intel && S.intel.profile && S.intel.profile.profileStatus) || "DRAFT");
    const health = (S.intel && S.intel.health) || computeHealth();
    root.innerHTML = `
      <div class="sih-toolbar">
        <button type="button" class="btn btn-sm btn-ghost" id="startupBack">← ${esc(tr("ss.back"))}</button>
        <h2>${esc(S.startup.legalName || S.startup.brandName || "")}</h2>
        <span class="gov-state st-${esc(String(status).toLowerCase())}">${esc(status)}</span>
      </div>
      <div class="sih-meta-grid">
        <div><span class="sih-meta-label">${esc(tr("ss.completeness"))}</span>
          <div class="progress" style="height:10px;max-width:220px"><span class="progress-bar" style="width:${esc(completeness.score || 0)}%"></span></div>
          <span class="sih-muted">${esc(completeness.score || 0)}%</span>
        </div>
        <div><span class="sih-meta-label">${esc(tr("ss.health.verification"))}</span><strong>${esc(health.verification || 0)}%</strong></div>
        <div><span class="sih-meta-label">${esc(tr("ss.health.evidence"))}</span><strong>${esc(health.evidenceCoverage || 0)}%</strong></div>
        <div><span class="sih-meta-label">${esc(tr("ss.health.critical"))}</span><strong>${esc(health.criticalIssues || 0)}</strong></div>
      </div>
      <div class="sih-actions">
        <button type="button" class="btn btn-sm" id="startupAnalyze">${esc(tr("ss.analyze"))}</button>
        <button type="button" class="btn btn-sm" id="startupRecompute">${esc(tr("ss.recompute"))}</button>
        <button type="button" class="btn btn-sm btn-primary" id="startupSubmit">${esc(tr("ss.submit"))}</button>
      </div>
      <div class="gov-tabs" role="tablist">
        ${tabs.map((t) => `<button type="button" role="tab" class="gov-tab ${S.panel === t.id ? "active" : ""}" data-tab="${t.id}">${esc(t.lbl)}</button>`).join("")}
      </div>
      <div id="startupPanel"></div>`;

    $("startupBack").addEventListener("click", () => { S.startup = null; S.intel = null; renderHome(root); });
    $("startupAnalyze").addEventListener("click", () => doAnalyze(root));
    $("startupRecompute").addEventListener("click", async () => {
      try { await recompute(); toast(tr("ss.recompute")); renderDetail(root); } catch (e) { toast(e.message); }
    });
    $("startupSubmit").addEventListener("click", () => doSubmit(root));
    root.querySelectorAll("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => { S.panel = b.getAttribute("data-tab"); renderDetail(root); }));
    renderPanel();
  }

  const tabs = [
    { id: "sections", lbl: "Sections" },
    { id: "suggestions", lbl: "AI Suggestions" },
    { id: "verification", lbl: "Verification Center" },
    { id: "documents", lbl: "Documents" },
    { id: "flags", lbl: "Flags" },
    { id: "capabilities", lbl: "Capabilities" },
  ];

  function computeHealth() {
    const sections = SECTION_SCHEMA.length;
    const pros = ((S.intel && S.intel.verifications) || []);
    const verified = pros.filter((v) => v.status === "VERIFIED").length;
    const covered = pros.filter((v) => v.status && v.status !== "NOT_PROVIDED").length;
    const flags = (S.intel && S.intel.flags) || [];
    return {
      verification: Math.round((verified / Math.max(1, sections)) * 100),
      evidenceCoverage: Math.round((covered / Math.max(1, sections)) * 100),
      criticalIssues: flags.filter((f) => f.severity === "CRITICAL").length,
    };
  }

  function renderPanel() {
    const panel = $("startupPanel");
    if (!panel) return;
    if (S.panel === "sections") panel.innerHTML = renderSections();
    else if (S.panel === "suggestions") panel.innerHTML = renderSuggestions();
    else if (S.panel === "verification") panel.innerHTML = renderVerification();
    else if (S.panel === "documents") panel.innerHTML = renderDocuments();
    else if (S.panel === "flags") panel.innerHTML = renderFlags();
    else if (S.panel === "capabilities") panel.innerHTML = renderCapabilities();
  }

  /* ───────── sections editor ───────── */
  const SECTION_SCHEMA = [
    { key: "identity", label: "Identity", fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "legalEntityName", label: "Legal Entity Name", type: "text" },
      { key: "companyType", label: "Company Type", type: "text" },
      { key: "incorporationDate", label: "Incorporation Date", type: "text" },
      { key: "registeredLocation", label: "Registered Location", type: "text" },
      { key: "website", label: "Website", type: "text" },
      { key: "businessEmail", label: "Business Email", type: "text" },
    ]},
    { key: "startupStatus", label: "Startup Status", fields: [
      { key: "dpiitStatus", label: "DPIIT Status", type: "text" },
    ]},
    { key: "business", label: "Business", fields: [
      { key: "industry", label: "Industry", type: "text" },
      { key: "sector", label: "Sector", type: "text" },
      { key: "businessModel", label: "Business Model", type: "text" },
      { key: "products", label: "Products (comma separated)", type: "array" },
    ]},
    { key: "technology", label: "Technology", fields: [
      { key: "coreCapabilities", label: "Core Capabilities (comma separated)", type: "array" },
      { key: "technologies", label: "Technologies (comma separated)", type: "array" },
    ]},
    { key: "useCases", label: "Use Cases", fields: [
      { key: "primary", label: "Primary Use Cases (comma separated)", type: "array" },
      { key: "problemDomains", label: "Problem Domains (comma separated)", type: "array" },
      { key: "government", label: "Government Use Cases (comma separated)", type: "array" },
    ]},
    { key: "deployment", label: "Deployment", fields: [
      { key: "count", label: "Deployment Count", type: "num" },
      { key: "hasGovernmentDeployment", label: "Has Government Deployment", type: "bool" },
    ]},
    { key: "team", label: "Team", fields: [
      { key: "founders", label: "Founders", type: "text" },
      { key: "techTeamSize", label: "Tech Team Size", type: "num" },
    ]},
    { key: "geography", label: "Geography", fields: [
      { key: "headquarters", label: "Headquarters", type: "text" },
      { key: "operatingRegions", label: "Operating Regions (comma separated)", type: "array" },
      { key: "canDeployAcrossIndia", label: "Can Deploy Across India", type: "bool" },
    ]},
    { key: "scalability", label: "Scalability", fields: [
      { key: "currentCustomers", label: "Current Customers", type: "num" },
      { key: "currentScale", label: "Current Scale", type: "text" },
      { key: "expectedScale", label: "Expected Scale", type: "text" },
    ]},
    { key: "pilot", label: "Pilot Readiness", fields: [
      { key: "ready", label: "Ready", type: "bool" },
      { key: "pilotTeamAvailable", label: "Pilot Team Available", type: "bool" },
      { key: "estimatedDurationDays", label: "Estimated Duration (days)", type: "num" },
    ]},
    { key: "security", label: "Security / Compliance", fields: [
      { key: "privacyCompliance", label: "Privacy Compliance", type: "text" },
      { key: "dataProtectionMeasures", label: "Data Protection Measures", type: "text" },
    ]},
  ];

  function renderSections() {
    const pj = ((S.intel && S.intel.profile && S.intel.profile.profileJson) || {});
    return `
      <div class="sih-hint">${esc(tr("ss.sections"))}: ${esc(tr("ss.save"))}</div>
      <form id="sectionsForm" class="sih-form">
        ${SECTION_SCHEMA.map((sec) => {
          const data = pj[sec.key] || {};
          return `<h5 class="sih-structure">${esc(sec.label)}</h5>
            <div class="row">${sec.fields.map((f) => fieldInput(sec.key, f, data[f.key])).join("")}</div>`;
        }).join("")}
        <div class="sih-form-actions">
          <button type="submit" class="btn btn-sm btn-primary">${esc(tr("ss.save"))}</button>
        </div>
      </form>`;
  }

  function fieldInput(sec, f, value) {
    const id = "f_" + sec + "_" + f.key;
    if (f.type === "bool") {
      const on = value === true || value === "true";
      return `<label class="field-label" style="grid-column:auto">${esc(f.label)} <input type="checkbox" id="${id}" ${on ? "checked" : ""}></label>`;
    }
    const val = f.type === "array" ? (Array.isArray(value) ? value.join(", ") : "") : (value == null ? "" : String(value));
    return `<div><label class="field-label" for="${id}">${esc(f.label)}</label>
      <input class="input" id="${id}" type="${f.type === "num" ? "number" : "text"}" value="${esc(val)}"></div>`;
  }

  /* ───────── suggestions ───────── */
  function renderSuggestions() {
    const sugs = (S.intel && S.intel.suggestions) || [];
    const pending = sugs.filter((s) => s.status === "PENDING");
    return `
      <div class="sih-hint">${esc(tr("ss.suggestions.hint"))}</div>
      <h5 class="sih-structure">${esc(tr("ss.suggestions.pending"))}</h5>
      ${pending.length ? pending.map((s) => `
        <div class="sih-qa" style="margin-bottom:8px">
          <div class="sih-qa-head">
            <span class="gov-badge" style="background:rgba(245,158,11,.16);color:#d97706">${esc(s.kind)}</span>
            <strong>${esc(s.label)}</strong>
          </div>
          <div class="sih-actions" style="margin:4px 0">
            <button type="button" class="btn btn-sm" data-resolve="${s.id}" data-d="ACCEPT">${esc(tr("ss.accept"))}</button>
            <button type="button" class="btn btn-sm btn-ghost" data-resolve="${s.id}" data-d="REJECT">${esc(tr("ss.reject"))}</button>
          </div>
        </div>`).join("")
        : `<div class="sih-empty">No pending suggestions.</div>`}
      ${sugs.filter((s) => s.status !== "PENDING").length ? `
        <h5 class="sih-structure">Decided</h5>
        ${sugs.filter((s) => s.status !== "PENDING").map((s) =>
          `<div class="sih-muted" style="font-size:.82rem">${esc(s.status)} — ${esc(s.kind)} · ${esc(s.label)}</div>`).join("")}`
        : ""}`;
  }

  /* ───────── verification center + evidence ───────── */
  function renderVerification() {
    const evs = (S.intel && S.intel.evidence) || [];
    const verifs = (S.intel && S.intel.verifications) || [];
    return `
      <div class="sih-hint">${esc(tr("ss.verification.hint"))}</div>
      <h5 class="sih-structure">${esc(tr("ss.setstatus"))}</h5>
      <div class="sih-form">
        <div class="row">
          <div><label class="field-label">Section</label>
            <input class="input" id="vf_section" value="IDENTITY"></div>
          <div><label class="field-label">Field</label>
            <input class="input" id="vf_field" value="companyName"></div>
          <div><label class="field-label">Status</label>
            <select class="select" id="vf_status">
              <option>REVIEW_REQUIRED</option><option>VERIFIED</option><option>SELF_DECLARED</option><option>NOT_PROVIDED</option>
            </select></div>
          <div><label class="field-label">Evidence id</label>
            <input class="input" id="vf_evidence" placeholder="required for VERIFIED"></div>
        </div>
        <div class="sih-form-actions">
          <button type="button" class="btn btn-sm" id="vf_save">${esc(tr("ss.save"))}</button>
        </div>
      </div>
      <h5 class="sih-structure">${esc(tr("ss.verification"))}</h5>
      ${verifs.length ? verifs.map((v) => `
        <div class="sih-muted" style="font-size:.82rem">
          <strong>${esc(v.section)}</strong> · ${esc(v.field || "—")} → <span class="gov-state st-${esc(String(v.status).toLowerCase())}">${esc(v.status)}</span>
        </div>`).join("") : `<div class="sih-empty">No field verifications yet.</div>`}
      <h5 class="sih-structure">${esc(tr("ss.evidence"))}</h5>
      <div id="evidenceList">${evs.map((e) => `
        <div class="sih-muted" style="font-size:.82rem">
          <strong>${esc(e.section)}.${esc(e.field)}</strong> — ${esc(e.claim)}
          <span class="gov-badge src-${esc(String(e.provenance || "").toLowerCase().replace(/_/g, "-"))}">${esc(provLabel(e.provenance))}</span>
          <span>${esc(e.verificationStatus)}</span>
          <span class="sih-muted">${e.documentId ? "doc:" + esc(short(e.documentId)) : ""}${e.pageRef ? " p." + esc(e.pageRef) : ""}</span>
        </div>`).join("") || `<div class="sih-empty">No evidence yet.</div>`}</div>`;
  }

  /* ───────── documents ───────── */
  function renderDocuments() {
    const docs = (S.intel && S.intel.documents) || [];
    const exp = { VALID: tr("ss.expiry.valid"), EXPIRING_SOON: tr("ss.expiry.expiring"), EXPIRED: tr("ss.expiry.expired"), UNKNOWN: tr("ss.expiry.unknown") };
    return `
      <div class="sih-form">
        <div class="row">
          <div><label class="field-label">${esc(tr("ss.documents.dup"))}</label>
            <input class="input" id="dupHash" placeholder="document hash / fingerprint"></div>
          <div style="align-self:end"><button type="button" class="btn btn-sm" id="dupCheck">${esc(tr("ss.documents.dupcheck"))}</button></div>
        </div>
      </div>
      <div id="dupResult" class="sih-hint"></div>
      <h5 class="sih-structure">${esc(tr("ss.documents"))}</h5>
      ${docs.map((d) => `
        <div class="sih-qa" style="margin-bottom:8px">
          <div class="sih-qa-head">
            <strong>${esc(d.label || d.docType)}</strong>
            <span class="gov-state st-${esc(String(d.expiryStatus || "UNKNOWN").toLowerCase().replace(/_/g, "-"))}">${esc(exp[d.expiryStatus] || d.expiryStatus)}</span>
            <span class="sih-muted">${esc(d.status)}</span>
          </div>
          <div class="sih-actions" style="margin:4px 0">
            <button type="button" class="btn btn-sm" data-analyze="${esc(d.id)}">${esc(tr("ss.documents.analyze"))}</button>
          </div>
        </div>`).join("") || `<div class="sih-empty">No documents.</div>`}`;
  }

  /* ───────── flags + capabilities ───────── */
  function renderFlags() {
    const flags = (S.intel && S.intel.flags) || [];
    const sev = { INFO: "#0284c7", WARN: "#d97706", CRITICAL: "#dc2626" };
    return flags.length ? flags.map((f) => `
      <div class="sih-qa" style="margin-bottom:8px">
        <div class="sih-qa-head">
          <span class="gov-badge" style="background:${sev[f.severity] || "#6b7280"}22;color:${sev[f.severity] || "#6b7280"}">${esc(f.severity)}</span>
          <strong>${esc(f.type)}</strong>
          <span class="sih-muted">${esc(f.status)}</span>
        </div>
        <div class="sih-statement">${esc(f.message)}</div>
      </div>`).join("") : `<div class="sih-empty">${esc(tr("ss.flags.none"))}</div>`;
  }
  function renderCapabilities() {
    const caps = (S.intel && S.intel.capabilities) || [];
    return caps.length ? caps.map((c) => `
      <div class="sih-qa" style="margin-bottom:8px">
        <div class="sih-qa-head">
          <span class="gov-badge">${esc(c.category || "?")}</span>
          <strong>${esc(c.label || c.capabilityKey || "")}</strong>
          <span class="sih-muted">${esc(c.level || "")} · ${esc(c.source || "")}</span>
        </div>
      </div>`).join("") : `<div class="sih-empty">No capabilities declared.</div>`;
  }

  /* ───────── actions ───────── */
  async function doAnalyze(root) {
    try {
      await api("POST", "/startups/" + S.startup.id + "/profile/analyze", { lang: lang() });
      toast(tr("ss.analyzed"));
      await refreshIntel();
      if (S.panel !== "suggestions") { S.panel = "suggestions"; }
      renderDetail(root);
    } catch (e) { toast(e.message); }
  }
  async function doSubmit(root) {
    try {
      await api("POST", "/startups/" + S.startup.id + "/profile/submit");
      toast(tr("ss.submitted"));
      await refreshIntel();
      renderDetail(root);
    } catch (e) {
      toast(e.message === "Incomplete profile. Complete key sections before submitting."
        ? tr("ss.submit.blocked") : e.message);
    }
  }

  function short(id) { return id ? String(id).slice(0, 8) : ""; }

  /* ───────── wire document-level listeners (delegated) ───────── */
  document.addEventListener("click", async (ev) => {
    const t = ev.target;
    if (t && $("startupPanel") && $("startupPanel").contains(t)) {
      if (t.hasAttribute("data-resolve") && S.startup) {
        const id = t.getAttribute("data-resolve");
        const decision = t.getAttribute("data-d");
        try {
          await api("POST", `/startups/${S.startup.id}/suggestions/${id}/resolve`, { decision });
          toast(decision === "ACCEPT" ? tr("ss.accept") : tr("ss.reject"));
          await refreshIntel();
          renderPanel();
        } catch (e) { toast(e.message); }
      }
      if (t.hasAttribute("data-analyze") && S.startup) {
        const did = t.getAttribute("data-analyze");
        try {
          await api("POST", `/startups/${S.startup.id}/documents/${did}/analyze`, { extraction: {} });
          toast(tr("ss.documents.analyze"));
          await refreshIntel();
          renderPanel();
        } catch (e) { toast(e.message); }
      }
    }
  });

  document.addEventListener("change", async (ev) => {
    const t = ev.target;
    if (t && $("startupPanel") && $("startupPanel").contains(t)) {
      if (t.id === "dupHash" && S.startup) {
        const dup = await api("POST", `/startups/${S.startup.id}/documents/duplicate-check`, { docHash: t.value }).catch(() => null);
        const el = $("dupResult");
        if (el) el.textContent = dup && dup.duplicate ? tr("ss.documents.duplicate") : tr("ss.documents.notduplicate");
      }
    }
  });

  document.addEventListener("submit", async (ev) => {
    const form = ev.target;
    if (form && form.id === "sectionsForm" && S.startup) {
      ev.preventDefault();
      const payload = {};
      SECTION_SCHEMA.forEach((sec) => {
        const obj = {};
        sec.fields.forEach((f) => {
          const el = $("f_" + sec.key + "_" + f.key);
          if (!el) return;
          if (f.type === "bool") obj[f.key] = el.checked;
          else if (f.type === "array") {
            obj[f.key] = String(el.value || "").split(",").map((s) => s.trim()).filter(Boolean);
          } else if (f.type === "num") {
            obj[f.key] = el.value !== "" ? Number(el.value) : null;
          } else obj[f.key] = el.value;
        });
        payload[sec.key] = obj;
      });
      try {
        await api("PATCH", "/startups/" + S.startup.id + "/profile", { payload });
        toast(tr("ss.saved"));
        await refreshIntel();
      } catch (e) { toast(e.message); }
    }
  });

  document.addEventListener("click", async (ev) => {
    const t = ev.target;
    if (t && t.id === "vf_save" && S.startup) {
      const status = $("vf_status").value;
      const evidenceId = ($("vf_evidence") && $("vf_evidence").value) || null;
      if (status === "VERIFIED" && !evidenceId) { toast(tr("ss.verified.requires.evidence")); return; }
      try {
        await api("POST", "/startups/" + S.startup.id + "/verifications/field", {
          section: $("vf_section").value, field: $("vf_field").value, status, evidenceId,
        });
        toast(tr("ss.saved"));
        await refreshIntel();
        renderPanel();
      } catch (e) { toast(e.message); }
    }
    if (t && t.id === "dupCheck" && S.startup) {
      const hash = ($("dupHash") && $("dupHash").value) || "";
      const dup = await api("POST", `/startups/${S.startup.id}/documents/duplicate-check`, { docHash: hash }).catch(() => null);
      const el = $("dupResult");
      if (el) el.textContent = dup && dup.duplicate ? tr("ss.documents.duplicate") : tr("ss.documents.notduplicate");
    }
  });

  window.SIHStartup = { render };
})();
