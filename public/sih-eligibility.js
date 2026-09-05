/* ════════════════════════════════════════════════════════════════════
   ReguLens STARTUP ELIGIBILITY (SIH26136) — additive frontend
   ──────────────────────────────────────────────────────────────────
   Decision-support only. Transparent, evidence-aware eligibility
   assessment: challenge rules (configurable + versioned + provenance)
   → Rule Builder workflow (DRAFT→UNDER_REVIEW→APPROVED→ACTIVE) →
   startup → verified evidence → deterministic evaluation → snapshot.
   Govt officials stay in control; AI never auto-verifies or decides.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const BASE = "/api/sih";
  const LS = "regulens.siheligibility.v1";

  const S = {
    org: null,
    orgs: [],
    challenges: [],
    startups: [],
    challenge: null,
    startup: null,
    rules: [],
    conflicts: [],
    snapshot: null,
    busy: false,
  };

  function lang() {
    return window.ReguLens && typeof window.ReguLens.getLang === "function" ? window.ReguLens.getLang() || "en" : "en";
  }
  const I18N = {
    en: {
      org: "Organization", challenge: "Challenge", pickCh: "Choose a challenge", pickChHint: "Choose a challenge to build and run eligibility rules.",
      hint: "Decision-support only. Eligibility is transparency + traceability: challenge → approved rules → verified evidence → assessment. Authorized officials keep control.",
      rules: "Eligibility Requirements (Rules)", newRule: "+ New Rule", noRules: "No rules yet. Create one as DRAFT — it only affects production after approval + activation.",
      ruleName: "Requirement name", criteriaPath: "Solution field path (e.g. dpiitStatus)", refValue: "Reference value (or JSON)", sourceRef: "Source reference (policy/authority)",
      saveDraft: "Save as DRAFT", saved: "Draft saved. Submit → approve → activate to apply.",
      evaluate: "Evaluate Eligibility", startup: "Solution", pickStartup: "Choose a solution", pickBoth: "Choose both challenge and solution",
      evaluated: "Assessment recorded", assessment: "Eligibility Assessment", reevaluate: "Re-evaluate", reevaluated: "Re-evaluated",
      mandPassed: "Mandatory passed", mandFailed: "Mandatory failed", missing: "Missing info", review: "Review items",
      explain: "Why this result? (Rule → Fact → Evidence → Verification → Result)",
      trust: "Trust", noSnapshot: "No assessment yet — choose a solution and run Evaluate.",
      conflictsFound: "Potential rule conflict(s) — route to human/policy review",
      reviewSubmitted: "Submitted for review.", approveDone: "Approved.", rejectDone: "Rejected — returned to draft.",
      activateDone: "Activated.", deactivateDone: "Deactivated.",
    },
    hi: {
      org: "संगठन", challenge: "चुनौती", pickCh: "चुनौती चुनें", pickChHint: "एक चुनौती चुनें।",
      hint: "निर्णय-सहायक मात्र। पारदर्शिता + ट्रेसेबिलिटी।",
      rules: "पात्रता नियम", newRule: "+ नया नियम", noRules: "अभी कोई नियम नहीं।",
      ruleName: "आवश्यकता का नाम", criteriaPath: "समाधान फ़ील्ड पथ", refValue: "संदर्भ मान", sourceRef: "स्रोत संदर्भ",
      saveDraft: "ड्राफ़्ट सहेजें", saved: "सहेजा गया।",
      evaluate: "पात्रता का मूल्यांकन", startup: "समाधान", pickStartup: "समाधान चुनें", pickBoth: "चुनौती व समाधान चुनें",
      evaluated: "मूल्यांकन दर्ज", assessment: "पात्रता आकलन", reevaluate: "पुनः मूल्यांकन", reevaluated: "पुनः मूल्यांकन हुआ",
      mandPassed: "अनिवार्य उत्तीर्ण", mandFailed: "अनिवार्य अनुत्तीर्ण", missing: "लुप्त जानकारी", review: "समीक्षा",
      explain: "यह परिणाम क्यों?",
      trust: "विश्वास", noSnapshot: "अभी कोई आकलन नहीं।",
      conflictsFound: "संभावित नियम विरोध",
      reviewSubmitted: "समीक्षा हेतु भेजा गया।", approveDone: "अनुमोदित।", rejectDone: "अस्वीकृत — ड्राफ़्ट पर वापस।",
      activateDone: "सक्रिय।", deactivateDone: "निष्क्रिय।",
    },
  };
  function tr(key) {
    const l = lang();
    return (I18N[l] && I18N[l][key]) || (I18N.en && I18N.en[key]) || key;
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
  async function loadStartups() {
    if (!S.org) { S.startups = []; return; }
    const d = await api("GET", "/startups?organizationId=" + encodeURIComponent(S.org.id));
    S.startups = d.startups || [];
  }
  async function loadChallengeData() {
    if (!S.challenge) return;
    const rules = await api("GET", "/eligibility/rules?challengeId=" + encodeURIComponent(S.challenge.id));
    S.rules = rules.rules || [];
    const conf = await api("GET", "/eligibility/conflicts?challengeId=" + encodeURIComponent(S.challenge.id));
    S.conflicts = (conf && conf.conflicts) || [];
  }
  async function loadStartupSnapshot() {
    S.snapshot = null;
    if (!S.startup) return;
    try {
      const d = await api("GET", "/eligibility/startups/" + S.startup.id);
      S.snapshot = d.latest || null;
    } catch (_) { S.snapshot = null; }
  }

  function render(view) {
    const root = $("sihEligibilityBody");
    if (!root) return;
    if (view === "sih-eligibility") renderHome(root);
  }

  async function renderHome(root) {
    root.innerHTML = `<div class="sih-empty">Loading…</div>`;
    try {
      await loadOrgs();
      await Promise.all([loadChallenges(), loadStartups()]);
    } catch (e) {
      root.innerHTML = `<div class="sih-empty">${esc(e.message)}</div>`;
      return;
    }
    root.innerHTML = `
      <div class="sih-orgbar">
        <span class="field-label">${esc(tr("org"))}</span>
        <select id="eligOrg" class="select">${S.orgs.map((o) =>
          `<option value="${esc(o.id)}" ${S.org && o.id === S.org.id ? "selected" : ""}>${esc(o.name)}</option>`).join("")}
        </select>
        <span class="field-label">${esc(tr("challenge"))}</span>
        <select id="eligChallenge" class="select">
          <option value="">${esc(tr("pickCh"))}</option>
          ${S.challenges.map((c) => `<option value="${esc(c.id)}">${esc(c.title || c.challengeCode || "")}</option>`).join("")}
        </select>
      </div>
      <div class="sih-hint">${esc(tr("hint"))}</div>
      <div id="eligBody"></div>`;

    const orgSel = $("eligOrg");
    orgSel.addEventListener("change", async () => {
      S.org = S.orgs.find((o) => o.id === orgSel.value) || null;
      saveCtx();
      await Promise.all([loadChallenges(), loadStartups()]);
      renderHome(root);
    });
    const chSel = $("eligChallenge");
    chSel.addEventListener("change", () => {
      S.challenge = S.challenges.find((c) => c.id === chSel.value) || null;
      loadChallengeData().then(() => renderChallenge(root));
    });

    const matchSaved = S.challenge;
    if (matchSaved && chSel) chSel.value = matchSaved.id;
    if (S.challenge) loadChallengeData().then(() => renderChallenge(root));
    else { const b = $("eligBody"); if (b) b.innerHTML = `<div class="sih-empty">${esc(tr("pickChHint"))}</div>`; }
  }

  function lifecycleBadge(ls) {
    const map = {
      DRAFT: "st-unknown", UNDER_REVIEW: "st-under_review", APPROVED: "st-partially_verified",
      ACTIVE: "st-verified", SUPERSEDED: "st-suspended", INACTIVE: "st-expired",
    };
    const cls = map[ls] || "st-unknown";
    return `<span class="gov-state ${cls}">${esc(ls)}</span>`;
  }

  function stateDot(state) {
    const cls = {
      PASS: "st-verified", FAIL: "st-expired", MISSING_INFORMATION: "st-not_provided",
      REQUIRES_EVIDENCE: "st-under_review", REQUIRES_HUMAN_REVIEW: "st-requires_update",
      NOT_APPLICABLE: "st-unknown", RULE_CONFLICT: "st-requires_update", UNKNOWN: "st-unknown",
    };
    return `<span class="gov-state ${cls[state] || "st-unknown"}">${esc(state)}</span>`;
  }

  function verdictBadge(v) {
    const map = {
      ELIGIBLE: "st-verified", ELIGIBLE_WITH_REVIEW: "st-requires_update",
      CONDITIONAL: "st-under_review", REQUIRES_EVIDENCE: "st-under_review",
      REQUIRES_HUMAN_REVIEW: "st-requires_update", NOT_ELIGIBLE: "st-expired",
      RULE_CONFLICT: "st-requires_update", UNKNOWN: "st-unknown",
    };
    return `<span class="gov-state ${map[v] || "st-unknown"}">${esc(v)}</span>`;
  }

  async function renderChallenge(root) {
    const body = $("eligBody");
    if (!body) return;
    const ch = S.challenge;
    body.innerHTML = `
      <div class="sih-toolbar">
        <h3>${esc(ch.title || ch.challengeCode || "")}</h3>
        ${verdictBadge(S.snapshot ? S.snapshot.overallStatus : "UNKNOWN")}
      </div>

      ${S.conflicts.length ? `<div class="sih-hint" style="color:#b3261e">⚠ ${esc(tr("conflictsFound"))}: ${S.conflicts.length}</div>` : ""}

      <div class="sih-toolbar"><h3>${esc(tr("rules"))}</h3>
        <button type="button" class="btn btn-sm" id="eligNewRule">${esc(tr("newRule"))}</button>
      </div>
      ${S.rules.length ? S.rules.map(ruleRow).join("") : `<div class="sih-empty">${esc(tr("noRules"))}</div>`}

      <div id="eligRuleForm"></div>
      <div class="sih-hint">&nbsp;</div>

      <div class="sih-toolbar"><h3>${esc(tr("evaluate"))}</h3></div>
      <div class="sih-orgbar">
        <span class="field-label">${esc(tr("startup"))}</span>
        <select id="eligStartup" class="select">
          <option value="">${esc(tr("pickStartup"))}</option>
          ${S.startups.map((s) => `<option value="${esc(s.id)}">${esc(s.brandName || s.legalName || "")}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-sm btn-primary" id="eligEvaluate">${esc(tr("evaluate"))}</button>
      </div>
      <div id="eligSnapshot"></div>`;

    const newRule = $("eligNewRule");
    if (newRule) newRule.addEventListener("click", () => renderRuleForm($("eligRuleForm"), null));

    root.querySelectorAll("[data-rerender]").forEach((b) =>
      b.addEventListener("click", async () => { try { await loadChallengeData(); renderChallenge(root); } catch (e) { toast(e.message); } }));

    root.querySelectorAll("[data-rule-action]").forEach((b) =>
      b.addEventListener("click", async () => {
        const action = b.dataset.ruleAction;
        const ruleId = b.dataset.rule;
        b.disabled = true;
        try {
          await api("POST", `/eligibility/rules/${ruleId}/${action}`, {});
          const key = action === "submit-review" ? "reviewSubmitted" : action + "Done";
          toast(tr(key));
          await loadChallengeData();
          renderChallenge(root);
        } catch (e) { toast(e.message); b.disabled = false; }
      }));

    const stSel = $("eligStartup");
    if (stSel) stSel.addEventListener("change", async () => {
      S.startup = S.startups.find((s) => s.id === stSel.value) || null;
      await loadStartupSnapshot();
      renderSnapshot($("eligSnapshot"));
    });
    const ev = $("eligEvaluate");
    if (ev) ev.addEventListener("click", doEvaluate);

    if (S.startup && stSel) stSel.value = S.startup.id;
    renderSnapshot($("eligSnapshot"));
  }

  function ruleRow(r) {
    return `
      <article class="card sih-card">
        <div class="sih-card-top">
          <span class="sih-sector">${esc(r.name || "")}</span>
          ${lifecycleBadge(r.lifecycleStatus || "DRAFT")}
          <span class="gov-state st-${r.severity === 'MANDATORY' ? 'expired' : 'under_review'}">${esc(r.severity || "MANDATORY")}</span>
        </div>
        <p class="sih-card-sub">${esc(r.ruleType || "REQUIRED_ATTRIBUTE")} · v${esc(r.ruleVersion || 1)} · ${esc(r.authorityScope || "UNSPECIFIED")}</p>
        <p class="sih-muted" style="font-size:12px">${esc(r.sourceReference || r.source || "")}</p>
        <div class="sih-card-meta">
          ${['submit-review','approve','reject','activate','deactivate'].map((a) =>
            `<button type="button" class="btn btn-sm" data-rule-action="${esc(a)}" data-rule="${esc(r.id)}">${esc(a)}</button>`).join("")}
        </div>
      </article>`;
  }

  function renderRuleForm(container, rule) {
    if (!container) return;
    container.innerHTML = `
      <div class="card sih-card sih-hint">
        <h3>${esc(tr("newRule"))}</h3>
        <input id="rfName" class="input" placeholder="${esc(tr("ruleName"))}" style="width:100%;margin-bottom:6px"/>
        <select id="rfType" class="select" style="margin-bottom:6px">
          ${["REQUIRED_ATTRIBUTE","ATTRIBUTE_EQUALS","ATTRIBUTE_IN_SET","ATTRIBUTE_NOT_IN_SET","BOOLEAN_REQUIREMENT","DOCUMENT_REQUIRED","DOCUMENT_VALID","CERTIFICATION_REQUIRED","CAPABILITY_REQUIRED","SECTOR_MATCH","GEOGRAPHY_MATCH","EXPERIENCE_REQUIRED","DEPLOYMENT_REQUIRED","DATE_VALIDITY","CUSTOM_REVIEW_REQUIRED","COMPOSITE_RULE"]
            .map((t) => `<option>${t}</option>`).join("")}
        </select>
        <input id="rfPath" class="input" placeholder="${esc(tr("criteriaPath"))}" style="width:100%;margin-bottom:6px"/>
        <input id="rfRef" class="input" placeholder="${esc(tr("refValue"))}" style="width:100%;margin-bottom:6px"/>
        <select id="rfSev" class="select" style="margin-bottom:6px">
          ${["MANDATORY","IMPORTANT","ADVISORY","REVIEW_REQUIRED"].map((s) => `<option>${s}</option>`).join("")}
        </select>
        <input id="rfSource" class="input" placeholder="${esc(tr("sourceRef"))}" style="width:100%;margin-bottom:6px"/>
        <button type="button" class="btn btn-sm btn-primary" id="rfSave">${esc(tr("saveDraft"))}</button>
      </div>`;
    const save = $("rfSave");
    if (save) save.addEventListener("click", async () => {
      const body = {
        challengeId: S.challenge.id,
        name: $("rfName").value.trim() || "Untitled requirement",
        ruleType: $("rfType").value,
        criteriaPath: $("rfPath").value.trim(),
        referenceValue: $("rfRef").value.trim(),
        severity: $("rfSev").value,
        sourceReference: $("rfSource").value.trim() || "SOURCE_REQUIRES_VERIFICATION",
        lifecycleStatus: "DRAFT",
      };
      try {
        await api("POST", "/eligibility/rules", body);
        toast(tr("saved"));
        await loadChallengeData();
        renderChallenge($("eligBody"));
      } catch (e) { toast(e.message); }
    });
  }

  async function doEvaluate() {
    if (!S.challenge || !S.startup) { toast(tr("pickBoth")); return; }
    try {
      await api("POST", "/eligibility/check/advanced", { challengeId: S.challenge.id, startupId: S.startup.id });
      await loadStartupSnapshot();
      renderSnapshot($("eligSnapshot"));
      toast(tr("evaluated"));
    } catch (e) { toast(e.message); }
  }

  function renderSnapshot(container) {
    if (!container) return;
    const snap = S.snapshot;
    if (!snap) { container.innerHTML = `<div class="sih-empty">${esc(tr("noSnapshot"))}</div>`; return; }
    const sum = snap.summary || {};
    container.innerHTML = `
      <div class="card sih-card">
        <div class="sih-toolbar">
          <h3>${esc(tr("assessment"))}</h3>
          ${verdictBadge(snap.overallStatus)}
          <span class="sih-muted">v${esc(snap.ruleVersion || 1)} · ${esc(snap.evaluatedAt ? new Date(snap.evaluatedAt).toLocaleString() : "")}</span>
          <button type="button" class="btn btn-sm" id="eligReeval">${esc(tr("reevaluate"))}</button>
        </div>
        <div class="sih-meta-grid">
          <div><span class="sih-meta-label">${esc(tr("mandPassed"))}</span><strong>${esc(sum.mandatoryPassed == null ? 0 : sum.mandatoryPassed)}</strong></div>
          <div><span class="sih-meta-label">${esc(tr("mandFailed"))}</span><strong>${esc(sum.mandatoryFailed == null ? 0 : sum.mandatoryFailed)}</strong></div>
          <div><span class="sih-meta-label">${esc(tr("missing"))}</span><strong>${esc(sum.missingInformation == null ? 0 : sum.missingInformation)}</strong></div>
          <div><span class="sih-meta-label">${esc(tr("review"))}</span><strong>${esc(sum.reviewRequired == null ? 0 : sum.reviewRequired)}</strong></div>
        </div>
        <div class="sih-hint">${esc(snap.reason || "")}</div>
        <h4>${esc(tr("explain"))}</h4>
        ${(snap.results || []).map(resultRow).join("")}
      </div>`;
    const reeval = $("eligReeval");
    if (reeval) reeval.addEventListener("click", async () => {
      try {
        await api("POST", "/eligibility/snapshots/" + snap.id + "/reevaluate", { reason: "Re-evaluated by officer" });
        await loadStartupSnapshot();
        renderSnapshot(container);
        toast(tr("reevaluated"));
      } catch (e) { toast(e.message); }
    });
  }

  function resultRow(r) {
    return `
      <div class="elig-result">
        <div class="sih-card-top">
          <strong>${esc(r.ruleName || "")}</strong>
          ${stateDot(r.state)}
          <span class="sih-muted" style="font-size:11px">${esc(r.ruleType || "")} · v${esc(r.ruleVersion || 1)}</span>
        </div>
        <p class="sih-muted" style="font-size:12px">${esc(r.reason || "")}</p>
        <p class="sih-muted" style="font-size:11px">${esc(tr("trust"))}: <b>${esc(r.trustLevel || "")}</b> · ${esc(r.sourceReference || "")}</p>
        ${r.recommendedAction ? `<p class="sih-muted" style="font-size:12px">→ ${esc(r.recommendedAction)}</p>` : ""}
      </div>`;
  }

  window.SIHEligibility = { render };
})();
