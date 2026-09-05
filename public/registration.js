/* ═══════════════════════════════════════════════════════════
   ReguLens — Registration Portal Module
   Multi-step organization & solution registration.
   Creates a real organization + one startup per solution,
   with full intelligence profiles, capabilities, document
   metadata and certifications. Government discovers these
   registrations through challenges / applications.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const STORAGE_KEY = "regulens.registration.draft.v1";
  const COMPLETE_KEY = "regulens.registration.complete";
  const API_BASE = "/api/sih";

  const STEPS = [
    { id: "org", key: "regPortal.step1", title: "Organization Details" },
    { id: "business", key: "regPortal.step2", title: "Business Information" },
    { id: "solutions", key: "regPortal.step3", title: "Solutions & Products" },
    { id: "technology", key: "regPortal.step4", title: "Technology & Capabilities" },
    { id: "experience", key: "regPortal.step5", title: "Experience & Track Record" },
    { id: "financial", key: "regPortal.step6", title: "Financial Capacity" },
    { id: "compliance", key: "regPortal.step7", title: "Compliance & Certifications" },
    { id: "documents", key: "regPortal.step8", title: "Documents & Evidence" },
    { id: "team", key: "regPortal.step9", title: "Team & Operations" },
    { id: "review", key: "regPortal.step10", title: "Review & Submit" },
  ];

  let state = {
    currentStep: 0,
    org: null,
    capabilities: [],
    capabilityLoaded: false,
    editingSolution: -1,      // >=0: solution index being edited
    editingIsNew: false,      // the edited solution was just added
    editingRow: null,         // { collection, index, isNew }
    submitResult: null,
    submitting: false,
    draft: {
      org: {},
      business: {},
      solutions: [],
      technology: {},
      experience: [],
      financial: {},
      compliance: [],
      complianceStatus: {},
      documents: [],
      team: {},
    },
  };

  let els = {
    form: null,
    stepper: null,
    progressEl: null,
    backBtn: null,
    saveBtn: null,
    nextBtn: null,
    submitBtn: null,
    bound: false,
  };

  const ORG_TYPES = [
    ["startup", "Startup / Innovator"],
    ["business", "Business (SME / Enterprise)"],
    ["psu", "Public Sector / Government Unit"],
  ];

  const LEGAL_ENTITIES = [
    "Private Limited Company", "LLP (Limited Liability Partnership)",
    "One Person Company", "Public Limited Company", "Sole Proprietorship",
    "Partnership Firm", "Society / Trust", "Government Unit", "Other",
  ];

  const INDUSTRIES = [
    "Healthcare", "Education", "Agriculture", "FinTech", "Logistics & Mobility",
    "Smart Cities", "Public Services", "Cybersecurity", "Energy & Utilities",
    "Manufacturing", "Retail & E-commerce", "Media & Entertainment",
    "Environment & Climate", "Construction & Infrastructure", "Other",
  ];

  const BUSINESS_MODELS = ["B2G", "B2B", "B2C", "B2B2G", "Hybrid", "Not-for-profit"];
  const GEO_REACH = ["Local", "Statewide", "National", "Pan-India", "Global"];
  const BIZ_STAGES = ["Ideation", "MVP", "Pilot", "Early Revenue", "Scaling", "Established"];
  const ORG_SIZE = ["1-10", "11-50", "51-200", "201-500", "500+"];

  const SOLUTION_TYPES = ["Platform", "Product", "Service", "Module", "Hardware", "Software + Hardware"];
  const SOLUTION_STAGES = [
    ["PRE_SEED", "Pre-seed / Ideation"], ["SEED", "Seed"],
    ["EARLY_GROWTH", "Early Growth"], ["GROWTH", "Growth"], ["SERIES_A_PLUS", "Series A+"],
  ];
  const DEPLOY_STATUS = ["NOT_DEPLOYED", "BETA", "PILOT", "PRODUCTION_LIVE"];
  const AVAILABILITY = ["On-request", "Licensed", "Open Source", "SaaS subscription", "Custom deployment"];

  const CLIENT_TYPES = ["Government", "Public Sector Unit", "Enterprise", "SME", "NGO / Development", "Other"];
  const PROJECT_STATUS = ["COMPLETED", "ONGOING", "TERMINATED"];

  const FUNDING_STATUS = ["Bootstrapped", "Angel funded", "Venture funded", "Government grant", "Self-sustaining"];
  const FUNDING_STAGE = ["Pre-seed", "Seed", "Series A", "Series B+", "Not raising"];
  const REVENUE_RANGE = ["< ₹25L", "₹25L – ₹1Cr", "₹1Cr – ₹5Cr", "₹5Cr – ₹20Cr", "₹20Cr+", "Pre-revenue"];
  const REVENUE_TREND = ["Growing", "Stable", "Declining", "Pre-revenue"];

  const CERT_STATUS = ["ACTIVE", "EXPIRED"];
  const DOC_TYPES = [
    "DPIIT_CERTIFICATE", "GST_CERTIFICATE", "MSME_CERTIFICATE", "INCORPORATION",
    "TECHNICAL", "DEPLOYMENT_EVIDENCE", "FINANCIAL", "CYBERSECURITY", "CERTIFICATION", "PRODUCT", "OTHER",
  ];
  const DOC_STATUS = ["UPLOADED", "PROCESSING", "EXTRACTED", "VERIFIED", "REJECTED", "EXPIRED"];

  const DPIIT_STATUS = ["NOT_MARKED", "UNREGISTERED", "PENDING", "REGISTERED", "NOT_APPLICABLE"];
  const MSME_STATUS = ["NOT_MARKED", "NO", "REGISTERED", "MICRO", "SMALL", "MEDIUM"];
  const GST_STATUS = ["NOT_MARKED", "NOT_REGISTERED", "REGISTERED", "EXEMPT"];

  const $ = (id) => document.getElementById(id);

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  function t(key) {
    try {
      const api = window.ReguLens;
      if (api && typeof api.t === "function") {
        const v = api.t(key);
        if (v && v !== key) return v;
      }
    } catch (e) {}
    return key;
  }

  /* translation with English fallback (returns fallback when key is missing) */
  function L(key, fallback) {
    const v = t(key);
    return v && v !== key ? v : fallback;
  }

  function splitList(v) {
    return String(v == null ? "" : v)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function yearOf(dateStr) {
    const n = Number(String(dateStr || "").slice(0, 4));
    return Number.isInteger(n) ? n : null;
  }

  function numOf(v) {
    const n = Number(v);
    return Number.isFinite(n) && String(v).trim() !== "" ? n : null;
  }

  function emptySolution() {
    return {
      name: "", brandName: "", type: "", shortDesc: "", desc: "", problemSolved: "",
      targetUsers: "", targetDepts: "", sectors: "", useCases: "", features: "",
      valueProp: "", stage: "", deployStatus: "", availability: "", geoAvailability: "",
    };
  }

  function emptyProject() {
    return {
      name: "", clientType: "", sector: "", problem: "", solution: "", desc: "",
      location: "", startDate: "", endDate: "", status: "COMPLETED",
      scale: "", value: "", outcomes: "", results: "", reference: "",
    };
  }

  function emptyCert() {
    return { name: "", authority: "", number: "", issueDate: "", expiryDate: "", status: "ACTIVE", document: "" };
  }

  function emptyDoc() {
    return { type: "", name: "", desc: "", file: "", issueDate: "", expiryDate: "", status: "UPLOADED" };
  }

  function emptyRowFor(kind) {
    return kind === "experience" ? emptyProject() : kind === "compliance" ? emptyCert() : emptyDoc();
  }

  /* ───────── draft persistence ───────── */
  function saveDraft() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentStep: state.currentStep, draft: state.draft, timestamp: Date.now() })
      );
      toast(L("regPortal.draftSaved", "Draft saved"));
    } catch (e) {
      console.warn("Failed to save draft:", e);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.draft) {
          const incoming = parsed.draft;
          state.draft = {
            org: Object.assign({}, incoming.org || {}),
            business: Object.assign({}, incoming.business || {}),
            solutions: Array.isArray(incoming.solutions) ? incoming.solutions : [],
            technology: Object.assign({}, incoming.technology || {}),
            experience: Array.isArray(incoming.experience) ? incoming.experience : [],
            financial: Object.assign({}, incoming.financial || {}),
            compliance: Array.isArray(incoming.compliance) ? incoming.compliance : [],
            complianceStatus: Object.assign({}, incoming.complianceStatus || {}),
            documents: Array.isArray(incoming.documents) ? incoming.documents : [],
            team: Object.assign({}, incoming.team || {}),
          };
          state.currentStep = Math.max(0, Math.min(STEPS.length - 1, parsed.currentStep || 0));
        }
      }
    } catch (e) {
      console.warn("Failed to load draft:", e);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 3200);
  }

  async function api(method, path, body) {
    try {
      const fb = window.AuroraFirebase || (window.firebase && { getAuth: () => window.firebase.auth() });
      const auth = fb && fb.getAuth ? fb.getAuth() : null;
      const cu = auth && auth.currentUser ? auth.currentUser : null;
      const headers = { "Content-Type": "application/json" };
      if (cu && typeof cu.getIdToken === "function") {
        const token = await cu.getIdToken();
        if (token) headers.Authorization = "Bearer " + token;
      }
      const opts = { method, headers };
      if (body !== undefined) opts.body = JSON.stringify(body);
      const res = await fetch(API_BASE + path, opts);
      let data = null;
      try { data = await res.json(); } catch (_) {}
      if (!res.ok) throw new Error((data && data.error) || "HTTP " + res.status);
      return data;
    } catch (e) {
      console.error("API error:", e);
      throw e;
    }
  }

  async function loadCapabilities() {
    if (state.capabilityLoaded) return;
    try {
      const data = await api("GET", "/capabilities");
      state.capabilities = (data && data.capabilities) || [];
    } catch (e) {
      state.capabilities = [];
    }
    state.capabilityLoaded = true;
    if (STEPS[state.currentStep] && STEPS[state.currentStep].id === "technology" && els.form) renderStep();
  }

  /* ───────── field building blocks ───────── */
  function field(label, inner, hint) {
    return (
      `<label class="rp-field"><span class="rp-field-label">${esc(label)}</span>${inner}` +
      (hint ? `<span class="rp-hint">${esc(hint)}</span>` : "") +
      `</label>`
    );
  }

  function textInput(dataPath, value, ph) {
    return `<input class="input" data-path="${esc(dataPath)}" placeholder="${esc(ph || "")}" value="${esc(value || "")}" autocomplete="off">`;
  }

  function numInput(dataPath, value, ph) {
    return `<input class="input" type="number" data-path="${esc(dataPath)}" placeholder="${esc(ph || "")}" value="${esc(value == null ? "" : value)}">`;
  }

  function dateInput(dataPath, value) {
    return `<input class="input" type="date" data-path="${esc(dataPath)}" value="${esc(value || "")}">`;
  }

  function dateRowInput(key, value) {
    return `<input class="input" type="date" data-sf-row="${esc(key)}" value="${esc(value || "")}">`;
  }

  function textArea(dataPath, value, rows, ph) {
    return `<textarea class="input" data-path="${esc(dataPath)}" rows="${rows || 3}" placeholder="${esc(ph || "")}">${esc(value || "")}</textarea>`;
  }

  function selectInput(dataPath, pairs, value, ph) {
    const opts = (ph ? `<option value="">${esc(ph)}</option>` : "") +
      pairs.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value) ? " selected" : ""}>${esc(l)}</option>`).join("");
    return `<select class="select" data-path="${esc(dataPath)}">${opts}</select>`;
  }

  function pnl(title, inner) {
    return `<div class="rp-panel"><div class="rp-panel-title">${esc(title)}</div>${inner}</div>`;
  }

  const GRID = (inner) => `<div class="rp-grid">${inner}</div>`;
  const SECTION = (title, inner) => `<div class="rp-section"><h3 class="rp-section-title">${esc(title)}</h3>${inner}</div>`;

  /* ───────── stepper / progress / nav ───────── */
  function updateStepper() {
    if (!els.stepper) return;
    els.stepper.querySelectorAll(".stepper-step").forEach((step, idx) => {
      step.classList.toggle("active", idx === state.currentStep);
      step.classList.toggle("completed", idx < state.currentStep);
    });
  }

  function updateProgress() {
    if (!els.progressEl) return;
    const pct = profileCompletion();
    els.progressEl.textContent = L("regPortal.profileCompletion", "Profile Completion: {n}%").replace("{n}", pct);
  }

  function profileCompletion() {
    const total = countTotalFields();
    const filled = countFilledFields();
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }

  function countTotalFields() {
    let count = 21;
    count += 15;
    count += (state.draft.solutions.length || 1) * 16;
    count += 14;
    count += (state.draft.experience.length || 1) * 9;
    count += 10;
    count += (state.draft.compliance.length || 1) * 4;
    count += (state.draft.documents.length || 1) * 4;
    count += 12;
    return count;
  }

  function countFilledFields() {
    let count = 0;
    const d = state.draft;
    ["orgType", "name", "shortName", "legalEntityType", "regNumber", "incorpDate", "country", "state", "city", "regAddress", "opAddress", "website", "email", "phone", "description", "contactName", "contactDesignation", "contactEmail", "contactPhone", "logo", "poc"].forEach(
      (k) => { if (d.org[k]) count++; }
    );
    ["businessDesc", "industry", "primaryDomain", "businessModel", "yearStarted", "operatingLocations", "targetSectors", "expertise", "orgSize", "teamSize", "geoReach", "regions", "businessStage"].forEach(
      (k) => { if (d.business[k]) count++; }
    );
    d.solutions.forEach((s) => {
      ["name", "brandName", "type", "shortDesc", "desc", "problemSolved", "targetUsers", "targetDepts", "sectors", "useCases", "features", "valueProp", "stage", "deployStatus", "availability", "geoAvailability"].forEach(
        (k) => { if (s[k]) count++; }
      );
    });
    ["techStack", "coreTechs", "aiMl", "hardware", "software", "cloud", "apis", "integration", "dataReqs", "deployModel", "security", "scalability", "support", "implementation"].forEach(
      (k) => { if (d.technology[k]) count++; }
    );
    d.experience.forEach((p) => {
      ["name", "clientType", "sector", "problem", "solution", "desc", "location", "startDate", "endDate", "status", "scale", "value", "outcomes", "results", "reference"].forEach(
        (k) => { if (p[k]) count++; }
      );
    });
    ["revenueRange", "revenueTrend", "fundingStatus", "fundingStage", "finYear", "projectCapacity", "typicalProjectSize", "largestProject", "pilotCapacity", "scaleCapacity"].forEach(
      (k) => { if (d.financial[k]) count++; }
    );
    d.compliance.forEach((c) => {
      ["name", "authority", "number", "issueDate", "expiryDate", "status", "document"].forEach(
        (k) => { if (c[k]) count++; }
      );
    });
    d.documents.forEach((doc) => {
      ["type", "name", "desc", "file", "issueDate", "expiryDate", "status"].forEach(
        (k) => { if (doc[k]) count++; }
      );
    });
    ["teamSize", "techTeamSize", "management", "expertise", "implTeam", "supportTeam", "geoOps", "supportAvail", "deployCapacity", "maxProjects", "training", "deliveryModel"].forEach(
      (k) => { if (d.team[k]) count++; }
    );
    return count;
  }

  function updateNavButtons() {
    const isLast = state.currentStep === STEPS.length - 1;
    const hidden = !!state.submitResult;
    if (els.backBtn) els.backBtn.style.display = hidden || state.currentStep === 0 ? "none" : "inline-flex";
    if (els.saveBtn) els.saveBtn.style.display = hidden ? "none" : "inline-flex";
    if (els.nextBtn) els.nextBtn.style.display = hidden || isLast ? "none" : "inline-flex";
    if (els.submitBtn) {
      els.submitBtn.style.display = hidden || !isLast ? "none" : "inline-flex";
      els.submitBtn.disabled = state.submitting;
    }
  }

  /* ───────── validation ───────── */
  function validateStep(stepIdx) {
    const step = STEPS[stepIdx];
    const d = state.draft;
    const errors = [];
    const v = (o, k) => String((o || {})[k] || "").trim() !== "";

    switch (step.id) {
      case "org":
        if (!v(d.org, "orgType")) errors.push("Select an organization type");
        if (!v(d.org, "name")) errors.push("Legal organization name is required");
        if (!v(d.org, "legalEntityType")) errors.push("Select a legal entity type");
        if (!v(d.org, "email")) errors.push("Official email is required");
        if (!v(d.org, "contactName")) errors.push("Contact person name is required");
        if (!v(d.org, "contactEmail")) errors.push("Contact email is required");
        break;
      case "business":
        if (!v(d.business, "businessDesc")) errors.push("Describe your business");
        if (!v(d.business, "industry")) errors.push("Select an industry");
        if (!v(d.business, "businessModel")) errors.push("Select a business model");
        break;
      case "solutions":
        if (!state.draft.solutions.length) errors.push("Add at least one solution");
        state.draft.solutions.forEach((s, i) => {
          if (!v(s, "name")) errors.push("Solution " + (i + 1) + ": name is required");
          if (!v(s, "shortDesc")) errors.push("Solution " + (i + 1) + ": short description is required");
          if (!v(s, "sectors")) errors.push("Solution " + (i + 1) + ": target sectors are required");
        });
        break;
      case "technology":
      case "experience":
      case "financial":
      case "compliance":
      case "documents":
      case "team":
        break;
      case "review":
        STEPS.slice(0, STEPS.length - 1).forEach((s, i) => {
          validateStep(i).forEach((m) => errors.push(m));
        });
        break;
    }
    return errors;
  }

  /* ───────── navigation ───────── */
  function setDraftValue(path, value) {
    const parts = path.split(".");
    let obj = state.draft;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]] || (obj[parts[i]] = {});
    obj[parts[parts.length - 1]] = value;
    updateProgress();
  }

  function bindDraft(root) {
    if (!root) return;
    root.querySelectorAll("[data-path]").forEach((el) => {
      const path = el.dataset.path;
      const sync = () => {
        setDraftValue(path, el.type === "checkbox" ? el.checked : el.value);
      };
      el.addEventListener("change", sync);
      el.addEventListener("input", () => { if (el.type !== "checkbox") sync(); });
    });
  }

  function goToStep(stepIdx) {
    const errors = validateStep(state.currentStep);
    if (errors.length > 0 && stepIdx > state.currentStep) {
      toast(errors[0]);
      return;
    }
    state.currentStep = Math.max(0, Math.min(STEPS.length - 1, stepIdx));
    state.editingSolution = -1;
    state.editingIsNew = false;
    state.editingRow = null;
    renderStep();
  }

  function goNext() { goToStep(state.currentStep + 1); }
  function goBack() { goToStep(state.currentStep - 1); }

  function renderStep() {
    if (!els.form) return;
    const step = STEPS[state.currentStep];
    const fn = STEP_RENDERERS[step.id];
    els.form.innerHTML = fn ? fn() : "";
    bindStepEvents(step.id);
    updateStepper();
    updateProgress();
    updateNavButtons();
  }

  /* ═════════════════════ STEP RENDERERS ═════════════════════ */

  function renderOrgStep() {
    const o = state.draft.org;
    const typeRadios = ORG_TYPES.map(([val, label]) =>
      `<label class="rp-radio"><input type="radio" name="rp-orgType" data-path="org.orgType" value="${val}"${String(o.orgType || "startup") === val ? " checked" : ""}><span>${esc(label)}</span></label>`
    ).join("");
    return SECTION("Organization type", `<div class="rp-radiogroup">${typeRadios}</div>`) +
      SECTION("Identity", GRID(
        field("Legal organization name *", textInput("org.name", o.name, "e.g. Acme Innovations Pvt. Ltd."))
        + field("Short name / brand", textInput("org.shortName", o.shortName, "e.g. Acme"))
        + field("Legal entity type *", selectInput("org.legalEntityType", LEGAL_ENTITIES.map((x) => [x, x]), o.legalEntityType, "Select entity type"))
        + field("Registration number (CIN / LLPIN / Regd.)", textInput("org.regNumber", o.regNumber))
        + field("Incorporation / founding date", dateInput("org.incorpDate", o.incorpDate))
        + field("Country", textInput("org.country", o.country || "India"))
        + field("State / UT", textInput("org.state", o.state))
        + field("City", textInput("org.city", o.city))
      )) +
      SECTION("Address", GRID(
        field("Registered address", textInput("org.regAddress", o.regAddress))
        + field("Operating / corporate address", textInput("org.opAddress", o.opAddress))
      )) +
      SECTION("Contact", GRID(
        field("Website", textInput("org.website", o.website, "https://…"))
        + field("Official email *", textInput("org.email", o.email))
        + field("Official phone", textInput("org.phone", o.phone))
      )) +
      SECTION("About", GRID(
        field("Describe your organization", textArea("org.description", o.description, 4, "What does the organization do?"))
      )) +
      SECTION("Authorized contact", GRID(
        field("Contact person name *", textInput("org.contactName", o.contactName))
        + field("Designation", textInput("org.contactDesignation", o.contactDesignation))
        + field("Contact email *", textInput("org.contactEmail", o.contactEmail))
        + field("Contact phone", textInput("org.contactPhone", o.contactPhone))
      ));
  }

  function renderBusinessStep() {
    const b = state.draft.business;
    return SECTION("Business", GRID(
      field("Business description *", textArea("business.businessDesc", b.businessDesc, 4, "What does your organization do, for whom?"))
      + field("Industry *", selectInput("business.industry", INDUSTRIES.map((x) => [x, x]), b.industry, "Select industry"))
      + field("Primary domain", textInput("business.primaryDomain", b.primaryDomain, "e.g. Healthcare IT"))
      + field("Business model *", selectInput("business.businessModel", BUSINESS_MODELS.map((x) => [x, x]), b.businessModel, "Select business model"))
      + field("Year started", numInput("business.yearStarted", b.yearStarted, "YYYY"))
    )) +
      SECTION("Scale & reach", GRID(
        field("Organization size", selectInput("business.orgSize", ORG_SIZE.map((x) => [x, x]), b.orgSize, "Select size"))
        + field("Team size", numInput("business.teamSize", b.teamSize))
        + field("Geographic reach", selectInput("business.geoReach", GEO_REACH.map((x) => [x, x]), b.geoReach, "Select reach"))
        + field("Operating regions / states", textInput("business.regions", b.regions, "comma-separated"))
        + field("Operating locations", textInput("business.operatingLocations", b.operatingLocations))
        + field("Target sectors / departments", textInput("business.targetSectors", b.targetSectors, "comma-separated"))
        + field("Business stage", selectInput("business.businessStage", BIZ_STAGES.map((x) => [x, x]), b.businessStage, "Select stage"))
        + field("Core expertise", textArea("business.expertise", b.expertise, 3))
      ));
  }

  /* ───────── solutions step (list + editor) ───────── */
  function solutionStageName(v) {
    const hit = SOLUTION_STAGES.find(([x]) => x === v);
    return hit ? hit[1] : "";
  }

  function renderSolutionsStep() {
    if (state.editingSolution >= 0) return renderSolutionEditor();
    const rows = state.draft.solutions.length
      ? state.draft.solutions.map((s, i) => {
          const tags = [s.type, s.sectors, solutionStageName(s.stage)]
            .filter(Boolean)
            .map((x) => `<span class="rp-tag">${esc(String(x))}</span>`)
            .join("");
          return `<div class="rp-row">
            <div class="rp-row-main">
              <div class="rp-row-title">${esc(s.name || "Solution " + (i + 1) + " (unnamed)")}</div>
              <div class="rp-row-sub">${esc(s.shortDesc || "No description yet")}</div>
              <div class="rp-row-tags">${tags}</div>
            </div>
            <div class="rp-row-actions">
              <button type="button" class="btn btn-outline btn-sm" data-reg-sol-edit="${i}">Edit</button>
              <button type="button" class="btn btn-ghost btn-sm" data-reg-sol-remove="${i}">Remove</button>
            </div>
          </div>`;
        }).join("")
      : `<div class="rp-empty">No solutions yet. Add your first solution — Government evaluates each registered solution individually.</div>`;
    return SECTION("Solutions & Products", rows) +
      `<div class="rp-toolbar"><button type="button" class="btn btn-primary" data-reg-sol-add>+ Add solution</button></div>` +
      `<p class="rp-hint">Each solution becomes a registered, evaluable profile. You can register several solutions under the same organization.</p>`;
  }

  function renderSolutionEditor() {
    const s = state.draft.solutions[state.editingSolution] || emptySolution();
    const isNew = state.editingIsNew;
    return SECTION(isNew ? "New solution" : "Edit solution", GRID(
      field("Solution name *", `<input class="input" data-sf="name" value="${esc(s.name)}" placeholder="e.g. Citizen Grievance Analytics Platform">`)
      + field("Brand name", `<input class="input" data-sf="brandName" value="${esc(s.brandName)}">`)
      + field("Type *", `<select class="select" data-sf="type">${SOLUTION_TYPES.map((x) => `<option value="${esc(x)}"${x === s.type ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>`)
      + field("Stage", `<select class="select" data-sf="stage">${SOLUTION_STAGES.map(([vv, l]) => `<option value="${esc(vv)}"${vv === s.stage ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`)
      + field("Deployment status", `<select class="select" data-sf="deployStatus">${DEPLOY_STATUS.map((x) => `<option value="${esc(x)}"${x === s.deployStatus ? " selected" : ""}>${esc(x.replace(/_/g, " "))}</option>`).join("")}</select>`)
      + field("Availability model", `<select class="select" data-sf="availability">${AVAILABILITY.map((x) => `<option value="${esc(x)}"${x === s.availability ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>`)
    )) +
      SECTION("Description", GRID(
        field("Short description * (one line for discovery)", `<input class="input" data-sf="shortDesc" value="${esc(s.shortDesc)}" placeholder="AI platform that triages citizen grievances in real time">`)
        + field("Full description", `<textarea class="input" data-sf="desc" rows="4">${esc(s.desc)}</textarea>`)
        + field("Problem solved", `<textarea class="input" data-sf="problemSolved" rows="3">${esc(s.problemSolved)}</textarea>`)
        + field("Target users", `<input class="input" data-sf="targetUsers" value="${esc(s.targetUsers)}">`)
        + field("Target departments", `<input class="input" data-sf="targetDepts" value="${esc(s.targetDepts)}" placeholder="e.g. Health, Urban Development">`)
        + field("Sectors / domains *", `<input class="input" data-sf="sectors" value="${esc(s.sectors)}" placeholder="e.g. Healthcare, Smart Cities">`)
        + field("Use cases (comma-separated)", `<input class="input" data-sf="useCases" value="${esc(s.useCases)}">`)
        + field("Key features (comma-separated)", `<textarea class="input" data-sf="features" rows="2">${esc(s.features)}</textarea>`)
        + field("Value proposition", `<textarea class="input" data-sf="valueProp" rows="3">${esc(s.valueProp)}</textarea>`)
        + field("Geo availability", `<input class="input" data-sf="geoAvailability" value="${esc(s.geoAvailability)}">`)
      )) +
      `<div class="rp-toolbar">
        <button type="button" class="btn btn-primary" data-reg-sol-save>${isNew ? "Add solution" : "Save changes"}</button>
        <button type="button" class="btn btn-ghost" data-reg-sol-cancel>Cancel</button>
      </div>`;
  }

  function renderTechnologyStep() {
    const tech = state.draft.technology;
    const caps = state.capabilities;
    const capGroups = {};
    caps.forEach((c) => { (capGroups[c.category] = capGroups[c.category] || []).push(c); });
    const selected = splitList(tech.capabilities);
    let capHtml = "";
    if (caps.length) {
      capHtml = Object.keys(capGroups).map((cat) =>
        `<div class="rp-capgroup"><div class="rp-capgroup-name">${esc(cat.replace(/_/g, " "))}</div><div class="rp-capgrid">` +
        capGroups[cat].map((c) =>
          `<label class="rp-radio"><input type="checkbox" data-cap="${esc(c.key)}"${selected.includes(c.key) ? " checked" : ""}><span title="${esc(c.description || "")}">${esc(c.label)}</span></label>`
        ).join("") +
        `</div></div>`
      ).join("");
    } else {
      capHtml = `<p class="rp-hint">Capability vocabulary will load after you sign in — or type your capabilities below.</p>`;
    }
    return SECTION("Technology & Capabilities", GRID(
      field("Tech stack", `<input class="input" data-path="technology.techStack" value="${esc(tech.techStack)}" placeholder="e.g. React, Node.js, PostgreSQL">`)
      + field("Core technologies (comma-separated)", `<input class="input" data-path="technology.coreTechs" value="${esc(tech.coreTechs)}">`)
      + field("AI / ML usage", `<textarea class="input" data-path="technology.aiMl" rows="3">${esc(tech.aiMl)}</textarea>`)
      + field("Hardware (if any)", `<input class="input" data-path="technology.hardware" value="${esc(tech.hardware)}">`)
      + field("Software / apps", `<input class="input" data-path="technology.software" value="${esc(tech.software)}">`)
      + field("Cloud hosting", `<input class="input" data-path="technology.cloud" value="${esc(tech.cloud)}" placeholder="e.g. AWS, Azure, On-premises">`)
      + field("APIs / integrations", `<textarea class="input" data-path="technology.apis" rows="2">${esc(tech.apis)}</textarea>`)
      + field("Integration methods", `<input class="input" data-path="technology.integration" value="${esc(tech.integration)}">`)
      + field("Data requirements", `<textarea class="input" data-path="technology.dataReqs" rows="2">${esc(tech.dataReqs)}</textarea>`)
      + field("Deployment model", `<input class="input" data-path="technology.deployModel" value="${esc(tech.deployModel)}">`)
      + field("Security & privacy measures", `<textarea class="input" data-path="technology.security" rows="3">${esc(tech.security)}</textarea>`)
      + field("Scalability approach", `<textarea class="input" data-path="technology.scalability" rows="2">${esc(tech.scalability)}</textarea>`)
      + field("Support & maintenance", `<input class="input" data-path="technology.support" value="${esc(tech.support)}">`)
      + field("Implementation approach", `<input class="input" data-path="technology.implementation" value="${esc(tech.implementation)}">`)
    )) + SECTION("Capability areas", capHtml ||
      `<input class="input" data-path="technology.capabilityManual" value="${esc(tech.capabilityManual || "")}" placeholder="Type capabilities, comma-separated">`);
  }

  /* ───────── experience / compliance / documents collection steps ───────── */
  function renderCollectionStep(kind, rows, label, emptyText) {
    if (state.editingRow && state.editingRow.collection === kind) return renderRowEditor(kind);
    const kindLabel = { experience: "projects", compliance: "certifications", documents: "documents" }[kind];
    const rowTitle = (r, i) => {
      if (kind === "experience") return (r.name && r.name.trim() !== "") ? r.name : (r.clientType || "Project " + (i + 1));
      return (r.name && r.name.trim() !== "") ? r.name : ("Item " + (i + 1));
    };
    const rowSub = (r) => {
      if (kind === "experience") return [r.clientType, r.sector, r.startDate].filter(Boolean).join(" · ");
      if (kind === "compliance") return [r.authority, r.number].filter(Boolean).join(" · ");
      return [r.type, r.desc].filter(Boolean).join(" · ");
    };
    const rowHtml = rows.length ? rows.map((r, i) =>
      `<div class="rp-row">
        <div class="rp-row-main">
          <div class="rp-row-title">${esc(rowTitle(r, i))}</div>
          <div class="rp-row-sub">${esc(rowSub(r))}</div>
        </div>
        <div class="rp-row-actions">
          <button type="button" class="btn btn-outline btn-sm" data-reg-row-edit="${kind}:${i}">Edit</button>
          <button type="button" class="btn btn-ghost btn-sm" data-reg-row-remove="${kind}:${i}">Remove</button>
        </div>
      </div>`
    ).join("") : `<div class="rp-empty">${esc(emptyText || "Nothing added yet.")}</div>`;
    return SECTION(label, rowHtml) +
      `<div class="rp-toolbar"><button type="button" class="btn btn-primary" data-reg-row-add="${kind}">+ Add ${kind === "experience" ? "project" : kind === "compliance" ? "certification" : "document"}</button></div>`;
  }

  function renderExperienceStep() {
    return pnl("Experience & Track Record", renderCollectionStep("experience", state.draft.experience, "Track record", "No projects added yet — add deployments, tenders or pilots you have delivered.")) +
      `<p class="rp-hint">Government uses your track record to judge delivery capability. Include public-sector and enterprise deployments where relevant.</p>`;
  }

  function renderFinancialStep() {
    const f = state.draft.financial;
    return SECTION("Financial capacity", GRID(
      field("Annual revenue range", selectInput("financial.revenueRange", REVENUE_RANGE.map((x) => [x, x]), f.revenueRange, "Select range"))
      + field("Revenue trend", selectInput("financial.revenueTrend", REVENUE_TREND.map((x) => [x, x]), f.revenueTrend, "Select trend"))
      + field("Funding status", selectInput("financial.fundingStatus", FUNDING_STATUS.map((x) => [x, x]), f.fundingStatus, "Select status"))
      + field("Funding stage", selectInput("financial.fundingStage", FUNDING_STAGE.map((x) => [x, x]), f.fundingStage, "Select stage"))
      + field("Fiscal year reference", `<input class="input" data-path="financial.finYear" value="${esc(f.finYear)}" placeholder="e.g. FY 2025-26">`)
      )) + SECTION("Contracting capacity", GRID(
      field("Max concurrent projects", numInput("financial.projectCapacity", f.projectCapacity))
      + field("Typical project size", `<input class="input" data-path="financial.typicalProjectSize" value="${esc(f.typicalProjectSize)}" placeholder="e.g. ₹25L">`)
      + field("Largest project delivered", `<input class="input" data-path="financial.largestProject" value="${esc(f.largestProject)}">`)
      + field("Pilot capacity (count)", numInput("financial.pilotCapacity", f.pilotCapacity))
      + field("Scale-up capacity", `<input class="input" data-path="financial.scaleCapacity" value="${esc(f.scaleCapacity)}">`)
    ));
  }

  function renderComplianceStep() {
    const d = state.draft;
    return SECTION("Registration status", GRID(
      field("DPIIT / Startup India status", selectInput("complianceStatus.dpiitStatus", DPIIT_STATUS.map((x) => [x, x.replace(/_/g, " ")]), d.complianceStatus.dpiitStatus, "Not marked"))
      + field("MSME / Udyam status", selectInput("complianceStatus.msmeStatus", MSME_STATUS.map((x) => [x, x.replace(/_/g, " ")]), d.complianceStatus.msmeStatus, "Not marked"))
      + field("GST status", selectInput("complianceStatus.gstStatus", GST_STATUS.map((x) => [x, x.replace(/_/g, " ")]), d.complianceStatus.gstStatus, "Not marked"))
    )) +
      pnl("Certifications", renderCollectionStep("compliance", d.compliance, "Certifications, licenses & registrations", "No certifications yet — add GST certificate, ISO, security or industry certifications.")) +
      `<p class="rp-hint">Certifications are stored with issue/expiry dates and flagged automatically as VALID / EXPIRING_SOON / EXPIRED.</p>`;
  }

  function renderDocumentsStep() {
    return pnl("Documents & Evidence", renderCollectionStep("documents", state.draft.documents, "Uploaded documents", "Attach metadata for incorporation, GST, DPIIT, deployment evidence, technical docs, etc.")) +
      `<p class="rp-hint">Documents are metadata references in this workspace. An authority marks them VERIFIED during registration review.</p>`;
  }

  function renderTeamStep() {
    const team = state.draft.team;
    return SECTION("Team & operations", GRID(
      field("Total team size", numInput("team.teamSize", team.teamSize))
      + field("Technology / product team size", numInput("team.techTeamSize", team.techTeamSize))
      + field("Management structure", `<textarea class="input" data-path="team.management" rows="2">${esc(team.management)}</textarea>`)
      + field("Core expertise areas", `<input class="input" data-path="team.expertise" value="${esc(team.expertise)}">`)
      + field("Implementation team", `<input class="input" data-path="team.implTeam" value="${esc(team.implTeam)}">`)
      + field("Support team / SLA", `<input class="input" data-path="team.supportTeam" value="${esc(team.supportTeam)}">`)
      )) + SECTION("Delivery capability", GRID(
      field("Geography of operations", `<input class="input" data-path="team.geoOps" value="${esc(team.geoOps)}">`)
      + field("Support availability", `<input class="input" data-path="team.supportAvail" value="${esc(team.supportAvail)}" placeholder="e.g. 24x7, 9am-6pm IST">`)
      + field("Concurrent deployment capacity", numInput("team.deployCapacity", team.deployCapacity))
      + field("Max simultaneous projects", numInput("team.maxProjects", team.maxProjects))
      + field("Training offered", `<input class="input" data-path="team.training" value="${esc(team.training)}">`)
      + field("Delivery model", `<input class="input" data-path="team.deliveryModel" value="${esc(team.deliveryModel)}">`)
    ));
  }

  function missBlock(errors) {
    return `<div class="rp-miss-title">Resolve before submitting:</div><ul>${errors.slice(0, 6).map((e) => `<li>${esc(e)}</li>`).join("")}${errors.length > 6 ? `<li>+ ${errors.length - 6} more</li>` : ""}</ul>`;
  }

  function renderReviewStep() {
    const d = state.draft;
    const sols = d.solutions;
    const errors = validateStep(9);
    const row = (label, ok, detail) =>
      `<div class="rp-review-row"><div class="rp-review-label">${esc(label)}</div><div class="rp-review-detail">${esc(detail || "—")}</div><div class="rp-review-status ${ok ? "is-ok" : "is-missing"}">${ok ? "Complete" : "Missing"}</div></div>`;
    const solRows = sols.length
      ? sols.map((s, i) => row("Solution " + (i + 1), !!(s.name && s.shortDesc && s.sectors), s.name + " — " + (s.shortDesc || "") + (s.sectors ? " [" + s.sectors + "]" : ""))).join("")
      : row("Solutions", false, "No solution added");

    return (
      `<div class="rp-review-head">
        <div class="rp-review-score">${profileCompletion()}%</div>
        <div class="rp-review-meta">
          <div class="rp-review-meta-title">Profile completion</div>
          <div class="rp-review-meta-sub">${STEPS.map((s, i) => i < 9 ? (validateStep(i).length ? "" : s.title) : "").filter(Boolean).join(" · ") || "All sections begun"}</div>
        </div>
      </div>` +
      (errors.length
        ? `<div class="rp-error-box">${missBlock(errors)}</div>`
        : `<div class="rp-ok-box">All required sections complete. Submit to register your organization for verification and Government discovery.</div>`) +
      pnl("Organization", GRID(
        row("Legal name", !!d.org.name, d.org.name) +
        row("Type", !!d.org.orgType, (ORG_TYPES.find(([vv]) => vv === d.org.orgType) || [])[1] || d.org.orgType) +
        row("Entity type", !!d.org.legalEntityType, d.org.legalEntityType) +
        row("Official email", !!d.org.email, d.org.email) +
        row("Contact", !!d.org.contactName, d.org.contactName + (d.org.contactEmail ? " · " + d.org.contactEmail : ""))
      )) +
      pnl("Business", GRID(
        row("Industry", !!d.business.industry, d.business.industry) +
        row("Business model", !!d.business.businessModel, d.business.businessModel) +
        row("Description", !!d.business.businessDesc, (d.business.businessDesc || "").slice(0, 90) + ((d.business.businessDesc || "").length > 90 ? "…" : ""))
      )) +
      pnl("Solutions (" + sols.length + ")", GRID(solRows)) +
      pnl("Technology", GRID(
        row("Capabilities", !!(d.technology.capabilities || d.technology.capabilityManual), splitList(d.technology.capabilities).join(", ") || d.technology.capabilityManual || "—")
      )) +
      pnl("Experience", GRID(
        row("Projects", d.experience.length > 0, d.experience.length + " project(s) recorded")
      )) +
      pnl("Financial capacity", GRID(
        row("Revenue range", !!d.financial.revenueRange, d.financial.revenueRange || "—") +
        row("Funding", !!d.financial.fundingStatus, d.financial.fundingStatus || "—")
      )) +
      pnl("Compliance", GRID(
        row("Certifications", d.compliance.length > 0, d.compliance.length + " certification(s)") +
        row("DPIIT / MSME / GST", true, [d.complianceStatus.dpiitStatus, d.complianceStatus.msmeStatus, d.complianceStatus.gstStatus].filter(Boolean).join(" · ") || "Not marked")
      )) +
      pnl("Documents", GRID(
        row("Document metadata", d.documents.length > 0, d.documents.length + " document(s)")
      )) +
      pnl("Team", GRID(
        row("Team size", !!d.team.teamSize, d.team.teamSize ? "Team of " + d.team.teamSize + " (tech: " + (d.team.techTeamSize || "n/a") + ")" : "—")
      )) +
      `<div class="rp-disclosure">On submit: 1 organization + ${sols.length} solution profile(s), with their capabilities, documents and certifications, are created and submitted for verification. A Registration Officer then verifies your records before they become visible to Government challenges.</div>`
    );
  }

  const STEP_RENDERERS = {
    org: renderOrgStep,
    business: renderBusinessStep,
    solutions: renderSolutionsStep,
    technology: renderTechnologyStep,
    experience: renderExperienceStep,
    financial: renderFinancialStep,
    compliance: renderComplianceStep,
    documents: renderDocumentsStep,
    team: renderTeamStep,
    review: renderReviewStep,
  };

  /* ═══════════════ events per step ═══════════════ */
  function bindStepEvents(stepId) {
    if (!els.form) return;
    bindDraft(els.form);

    const f = els.form;
      f.querySelectorAll("[data-sf]").forEach((el) => {
        const key = el.dataset.sf;
        const sync = () => {
          const sol = state.draft.solutions[state.editingSolution];
          if (!sol) return;
          sol[key] = el.type === "checkbox" ? el.checked : el.value;
          updateProgress();
        };
        el.addEventListener("change", sync);
        el.addEventListener("input", () => { if (el.type !== "checkbox") sync(); });
      });

      f.querySelectorAll("[data-cap]").forEach((el) => {
        el.addEventListener("change", () => {
          const keys = f.querySelectorAll("[data-cap]:checked");
          state.draft.technology.capabilities = Array.from(keys).map((k) => k.dataset.cap).join(",");
          updateProgress();
        });
      });

    if (stepId === "solutions") {
      const add = els.form.querySelector("[data-reg-sol-add]");
      if (add) add.addEventListener("click", () => {
        state.draft.solutions.push(emptySolution());
        state.editingIsNew = true;
        state.editingSolution = state.draft.solutions.length - 1;
        renderStep();
      });
      const save = els.form.querySelector("[data-reg-sol-save]");
      if (save) save.addEventListener("click", saveSolutionEditor);
      const cancel = els.form.querySelector("[data-reg-sol-cancel]");
      if (cancel) cancel.addEventListener("click", () => {
        if (state.editingIsNew) state.draft.solutions.pop();
        state.editingSolution = -1;
        state.editingIsNew = false;
        renderStep();
      });
      els.form.querySelectorAll("[data-reg-sol-edit]").forEach((b) =>
        b.addEventListener("click", () => {
          state.editingSolution = Number(b.dataset.regSolEdit);
          state.editingIsNew = false;
          renderStep();
        })
      );
      els.form.querySelectorAll("[data-reg-sol-remove]").forEach((b) =>
        b.addEventListener("click", () => {
          state.draft.solutions.splice(Number(b.dataset.regSolRemove), 1);
          renderStep();
        })
      );
    }

    if (stepId === "experience" || stepId === "compliance" || stepId === "documents") {
      const kind = stepId;
      const addBtn = els.form.querySelector("[data-reg-row-add]");
      if (addBtn) addBtn.addEventListener("click", () => {
        state.draft[kind].push(emptyRowFor(kind));
        state.editingRow = { collection: kind, index: state.draft[kind].length - 1, isNew: true };
        renderStep();
      });
      els.form.querySelectorAll("[data-reg-row-edit]").forEach((b) => {
        b.addEventListener("click", () => {
          const [col, idx] = String(b.dataset.regRowEdit).split(":");
          state.editingRow = { collection: col, index: Number(idx), isNew: false };
          renderStep();
        });
      });
      els.form.querySelectorAll("[data-reg-row-remove]").forEach((b) => {
        b.addEventListener("click", () => {
          const [col, idx] = String(b.dataset.regRowRemove).split(":");
          state.draft[col].splice(Number(idx), 1);
          renderStep();
        });
      });
      const rowSave = els.form.querySelector("[data-reg-row-save]");
      if (rowSave) rowSave.addEventListener("click", () => {
        state.editingRow = null;
        renderStep();
      });
      const rowCancel = els.form.querySelector("[data-reg-row-cancel]");
      if (rowCancel) rowCancel.addEventListener("click", () => {
        const ed = state.editingRow;
        if (ed && ed.isNew) state.draft[ed.collection].pop();
        state.editingRow = null;
        renderStep();
      });
      if (state.editingRow && state.editingRow.collection === kind) bindRowEditor(els.form, kind);
    }
  }

  function saveSolutionEditor() {
    const sol = state.draft.solutions[state.editingSolution];
    if (!sol) return;
    if (!String(sol.name || "").trim()) { toast("Solution name is required"); return; }
    if (!String(sol.shortDesc || "").trim()) { toast("Short description is required"); return; }
    if (!String(sol.sectors || "").trim()) { toast("Target sectors are required"); return; }
    state.editingIsNew = false;
    state.editingSolution = -1;
    renderStep();
  }

  function renderRowEditor(kind) {
    const ed = state.editingRow || { collection: kind, index: -1 };
    const row = ed.index >= 0 ? state.draft[kind][ed.index] : emptyRowFor(kind);
    let inner = "";
    if (kind === "experience") {
      inner = GRID(
        field("Project / deployment name *", `<input class="input" data-sf-row="name" value="${esc(row.name)}">`)
        + field("Client type", `<select class="select" data-sf-row="clientType"><option value=""></option>${CLIENT_TYPES.map((x) => `<option value="${esc(x)}"${x === row.clientType ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>`)
        + field("Sector", `<input class="input" data-sf-row="sector" value="${esc(row.sector)}">`)
        + field("Location", `<input class="input" data-sf-row="location" value="${esc(row.location)}">`)
        + field("Start date", dateRowInput("startDate", row.startDate))
        + field("End date", dateRowInput("endDate", row.endDate))
        + field("Status", `<select class="select" data-sf-row="status">${PROJECT_STATUS.map((x) => `<option value="${esc(x)}"${x === row.status ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>`)
        + field("Problem addressed", `<textarea class="input" data-sf-row="problem" rows="2">${esc(row.problem)}</textarea>`)
        + field("Solution provided", `<textarea class="input" data-sf-row="solution" rows="2">${esc(row.solution)}</textarea>`)
        + field("Description", `<textarea class="input" data-sf-row="desc" rows="3">${esc(row.desc)}</textarea>`)
        + field("Scale / users", `<input class="input" data-sf-row="scale" value="${esc(row.scale)}">`)
        + field("Contract value", `<input class="input" data-sf-row="value" value="${esc(row.value)}">`)
        + field("Outcomes", `<textarea class="input" data-sf-row="outcomes" rows="2">${esc(row.outcomes)}</textarea>`)
        + field("Results / KPIs", `<textarea class="input" data-sf-row="results" rows="2">${esc(row.results)}</textarea>`)
        + field("Reference contact", `<input class="input" data-sf-row="reference" value="${esc(row.reference)}">`)
      );
    } else if (kind === "compliance") {
      inner = GRID(
        field("Certification name *", `<input class="input" data-sf-row="name" value="${esc(row.name)}" placeholder="e.g. ISO 27001, GST Registration">`)
        + field("Issuing authority", `<input class="input" data-sf-row="authority" value="${esc(row.authority)}">`)
        + field("Number / ID", `<input class="input" data-sf-row="number" value="${esc(row.number)}">`)
        + field("Issue date", dateRowInput("issueDate", row.issueDate))
        + field("Expiry date", dateRowInput("expiryDate", row.expiryDate))
        + field("Status", `<select class="select" data-sf-row="status">${CERT_STATUS.map((x) => `<option value="${esc(x)}"${x === row.status ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>`)
        + field("Document reference", `<input class="input" data-sf-row="document" value="${esc(row.document)}">`)
      );
    } else {
      inner = GRID(
        field("Document type *", `<select class="select" data-sf-row="type"><option value=""></option>${DOC_TYPES.map((x) => `<option value="${esc(x)}"${x === row.type ? " selected" : ""}>${esc(x.replace(/_/g, " "))}</option>`).join("")}</select>`)
        + field("Document name", `<input class="input" data-sf-row="name" value="${esc(row.name)}">`)
        + field("Reference / description", `<input class="input" data-sf-row="desc" value="${esc(row.desc)}">`)
        + field("File reference", `<input class="input" data-sf-row="file" value="${esc(row.file)}">`)
        + field("Issue date", dateRowInput("issueDate", row.issueDate))
        + field("Expiry date", dateRowInput("expiryDate", row.expiryDate))
        + field("Status", `<select class="select" data-sf-row="status">${DOC_STATUS.map((x) => `<option value="${esc(x)}"${x === row.status ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>`)
      );
    }
    return SECTION((ed.isNew ? "Add " : "Edit ") + kind, inner) +
      `<div class="rp-toolbar">
        <button type="button" class="btn btn-primary" data-reg-row-save>${ed.isNew ? "Add" : "Save changes"}</button>
        <button type="button" class="btn btn-ghost" data-reg-row-cancel>Cancel</button>
      </div>`;
  }

  function bindRowEditor(root, kind) {
    root.querySelectorAll("[data-sf-row]").forEach((el) => {
      const key = el.dataset.sfRow;
      const sync = () => {
        const ed = state.editingRow;
        if (!ed) return;
        const row = state.draft[kind][ed.index];
        if (!row) return;
        row[key] = el.type === "checkbox" ? el.checked : el.value;
        updateProgress();
      };
      el.addEventListener("change", sync);
      el.addEventListener("input", () => { if (el.type !== "checkbox") sync(); });
    });
  }

  /* ───────── submit ───────── */
  function orgPayload() {
    const o = state.draft.org;
    const p = {
      orgType: o.orgType === "startup" ? "STARTUP" : o.orgType === "business" ? "PARTNER" : "GOVERNMENT",
      name: String(o.name || "").trim(),
      shortName: String(o.shortName || "").trim(),
      state: String(o.state || "").trim() || undefined,
      description: String(o.description || "").trim(),
      contactEmail: String(o.email || "").trim(),
      contactPhone: String(o.phone || "").trim(),
      isDemo: false,
    };
    if (o.orgType === "psu") {
      p.departmentType = String(o.legalEntityType || "").trim() || undefined;
      p.ministry = String(o.departmentType || "").trim() || undefined;
    }
    return p;
  }

  function compatStatus() {
    const cs = state.draft.complianceStatus || {};
    return { dpiit: cs.dpiitStatus || "", msme: cs.msmeStatus || "", gst: cs.gstStatus || "" };
  }

  function startupPayload(orgId, idx) {
    const sol = state.draft.solutions[idx] || {};
    const o = state.draft.org;
    const b = state.draft.business;
    const st = compatStatus();
    return {
      organizationId: orgId,
      legalName: String(sol.name || "").trim(),
      brandName: String(sol.brandName || o.shortName || o.name || "").trim(),
      registrationInfo: {
        legalEntityType: o.legalEntityType || "",
        registrationNumber: o.regNumber || "",
        incorporationDate: o.incorpDate || "",
        country: o.country || "India",
        city: o.city || "",
        state: o.state || "",
      },
      description: String(sol.desc || sol.shortDesc || "").trim(),
      sector: String(sol.sectors || b.primaryDomain || "").trim(),
      stage: String(sol.stage || "").trim(),
      website: String(o.website || "").trim(),
      location: String(o.city || "").trim(),
      state: String(o.state || "").trim(),
      employeeCount: numOf(b.teamSize),
      foundedYear: yearOf(o.incorpDate),
      dpiitStatus: st.dpiit || "",
      msmeStatus: st.msme || "",
      gstStatus: st.gst || "",
      isDemo: false,
    };
  }

  function buildProfile(idx) {
    const sol = state.draft.solutions[idx] || {};
    const o = state.draft.org;
    const b = state.draft.business;
    const tech = state.draft.technology;
    const fin = state.draft.financial;
    const team = state.draft.team;
    const st = compatStatus();
    const govDeployments = state.draft.experience
      .filter((p) => /govt|government|public sector|psu/i.test(String(p.clientType || "")))
      .map((p) => p.name)
      .filter(Boolean);
    const previousDeployments = state.draft.experience.map((p) => p.name).filter(Boolean);

    const profileJson = {
      identity: {
        name: String(o.name || "").trim(),
        legalEntityName: String(o.name || "").trim(),
        companyType: String(o.legalEntityType || "").trim(),
        incorporationDate: o.incorpDate || "",
        registeredLocation: String(o.regAddress || o.city || "").trim(),
        website: String(o.website || "").trim(),
        businessEmail: String(o.email || "").trim(),
      },
      startupStatus: { dpiitStatus: st.dpiit || "" },
      business: {
        industry: String(b.industry || "").trim(),
        sector: String(sol.sectors || b.primaryDomain || "").trim(),
        businessModel: String(b.businessModel || "").trim(),
        products: [String(sol.name || "").trim()].filter(Boolean),
      },
      technology: {
        coreCapabilities: splitList(tech.coreTechs),
        technologies: splitList(tech.techStack),
      },
      useCases: {
        primary: String(sol.shortDesc || "").trim(),
        problemDomains: splitList(sol.problemSolved),
        government: splitList(sol.targetDepts),
      },
      deployment: {
        count: state.draft.experience.length || 0,
        previousDeployments,
        hasGovernmentDeployment: govDeployments.length > 0,
      },
      team: {
        founders: String(o.contactName || "").trim(),
        techTeamSize: numOf(team.techTeamSize),
      },
      geography: {
        headquarters: String(o.city || o.state || "").trim(),
        operatingRegions: splitList(b.regions),
        canDeployAcrossIndia: /pan[-\s]?india|global|national/i.test(String(b.geoReach || "")),
      },
      scalability: {
        currentCustomers: String(fin.revenueRange || "").trim(),
        currentScale: String(fin.typicalProjectSize || "").trim(),
        expectedScale: String(fin.scaleCapacity || "").trim(),
      },
      pilot: {
        ready: [sol.stage, sol.deployStatus].filter(Boolean).join(" ") || "",
        pilotTeamAvailable: team.implTeam ? true : undefined,
      },
      security: {
        privacyCompliance: String(tech.security || "").trim(),
        dataProtectionMeasures: String(tech.security || "").trim(),
      },
    };

    const attributes = {
      sector: String(sol.sectors || b.primaryDomain || "").trim(),
      state: String(o.state || "").trim(),
      useCases: splitList(sol.useCases),
      products: [String(sol.name || "").trim()].filter(Boolean),
      deploymentDomains: splitList(sol.sectors),
      governmentDeployments: govDeployments,
      pilotReadiness: { ready: String(sol.deployStatus || "") },
      scaleCapacity: {
        currentCustomers: String(fin.revenueRange || ""),
        typicalProjectSize: String(fin.typicalProjectSize || ""),
        concurrent: numOf(fin.projectCapacity),
        maxProjects: numOf(team.maxProjects),
      },
    };
    return { profileJson, attributes };
  }

  function selectedCapabilityIds() {
    const keys = splitList(String(state.draft.technology.capabilities || state.draft.technology.capabilityManual || ""));
    if (!keys.length) return [];
    const byKey = {};
    state.capabilities.forEach((c) => { byKey[c.key] = c.id; });
    return keys.map((k) => byKey[k]).filter(Boolean);
  }

  function setSubmitBusy(text) {
    if (!els.submitBtn) return;
    if (text) {
      els.submitBtn._html = els.submitBtn.innerHTML;
      els.submitBtn.disabled = true;
      els.submitBtn.textContent = text;
    } else if (els.submitBtn._html) {
      els.submitBtn.disabled = false;
      els.submitBtn.innerHTML = els.submitBtn._html;
      els.submitBtn._html = null;
    }
    updateNavButtons();
  }

  async function submitRegistration() {
    const errors = validateStep(9);
    if (errors.length) {
      toast(errors[0]);
      renderStep();
      return;
    }
    if (state.submitting) return;
    state.submitting = true;

    const n = state.draft.solutions.length;
    try {
      let org;
      try {
        org = await api("POST", "/organizations", orgPayload());
      } catch (e) {
        if (String(e.message || "").indexOf("401") >= 0 || /sign/i.test(String(e.message || ""))) {
          throw new Error("You must be signed in to register. Please sign in first.");
        }
        throw e;
      }

      const results = [];
      for (let i = 0; i < n; i++) {
        setSubmitBusy("Registering " + (i + 1) + "/" + n + " solutions …");
        const startup = await api("POST", "/startups", startupPayload(org.id, i));
        const profile = buildProfile(i);
        try { await api("POST", "/startups/" + startup.id + "/profile", Object.assign({}, profile.profileJson, { attributes: profile.attributes })); }
        catch (e) { console.warn("profile:", e.message); }

        for (const cid of selectedCapabilityIds()) {
          try { await api("POST", "/startups/" + startup.id + "/capabilities", { capabilityId: cid }); }
          catch (e) { console.warn("capability:", e.message); }
        }

        for (const doc of state.draft.documents) {
          try {
            await api("POST", "/startups/" + startup.id + "/documents", {
              docType: String(doc.type && doc.type.trim() ? doc.type : "OTHER").trim().toUpperCase(),
              label: String(doc.name || "Document").trim(),
              reference: String(doc.desc || doc.file || "").trim(),
              status: String(doc.status || "UPLOADED").trim().toUpperCase(),
            });
          } catch (e) { console.warn("document:", e.message); }
        }

        for (const cert of state.draft.compliance) {
          try {
            await api("POST", "/startups/" + startup.id + "/certifications", {
              name: String(cert.name || "").trim(),
              issuer: String(cert.authority || "").trim(),
              issuedDate: cert.issueDate || null,
              expiryDate: cert.expiryDate || null,
            });
          } catch (e) { console.warn("certification:", e.message); }
        }

        setSubmitBusy("Finalizing profile " + (i + 1) + "/" + n + " …");
        try { await api("POST", "/startups/" + startup.id + "/profile/submit", {}); }
        catch (e) { console.warn("profile submit gate:", e.message); }

        results.push({ startupId: startup.id, name: String(startup.brandName || startup.legalName || "Solution") });
      }

      clearDraft();
      state.submitResult = {
        organizationId: org.id,
        organizationName: org.name || state.draft.org.name,
        startups: results,
        submittedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(COMPLETE_KEY, JSON.stringify({ organizationId: org.id, at: state.submitResult.submittedAt, count: results.length }));
      } catch (e) {}

      updateNavButtons();
      renderSuccess();
      toast(L("regPortal.submitted", "Registration submitted for verification"));
    } catch (e) {
      toast(e.message || "Submission failed");
    } finally {
      state.submitting = false;
      setSubmitBusy(null);
    }
  }

  function renderSuccess() {
    if (!els.form) return;
    updateNavButtons();
    const r = state.submitResult || {};
    els.form.innerHTML = `
      <div class="rp-success">
        <div class="rp-success-title">Registration submitted</div>
        <p class="rp-success-sub">${esc(r.organizationName || "Your organization")} and ${r.startups ? r.startups.length : 0} solution profile(s) are now pending verification by a Registration Officer.</p>
        <div class="rp-success-list">
          <div><span class="rp-success-k">Organization ID</span><span class="mono">${esc(r.organizationId ? r.organizationId.slice(0, 8) : "—")}</span></div>
          ${(r.startups || []).map((s) => `<div><span class="rp-success-k">Solution</span><span>${esc(s.name)}</span></div>`).join("")}
        </div>
        <div class="rp-toolbar">
          <button type="button" class="btn btn-primary" data-reg-done-dash>Go to Dashboard</button>
          <button type="button" class="btn btn-outline" data-reg-done-again>Register another organization</button>
        </div>
        <p class="rp-hint">Next: browse open Government challenges and apply with your registered solutions so officers can evaluate them for pilots and procurement.</p>
      </div>`;
    els.form.querySelector("[data-reg-done-dash]").addEventListener("click", () => {
      if (window.ReguLens && window.ReguLens.navigate) window.ReguLens.navigate("dashboard");
    });
    els.form.querySelector("[data-reg-done-again]").addEventListener("click", () => {
      state.draft = {
        org: {}, business: {}, solutions: [], technology: {}, experience: [],
        financial: {}, compliance: [], complianceStatus: {}, documents: [], team: {},
      };
      state.org = null;
      state.submitResult = null;
      state.currentStep = 0;
      renderStep();
      updateNavButtons();
      saveDraft();
    });
  }

  /* ═══════════════ init ═══════════════ */
  function init() {
    loadDraft();
    loadCapabilities();
    els.form = $("registrationForm");
    els.stepper = document.querySelector(".registration-stepper");
    els.progressEl = document.querySelector(".registration-progress");
    els.backBtn = $("regBackBtn");
    els.saveBtn = $("regSaveBtn");
    els.nextBtn = $("regNextBtn");
    els.submitBtn = $("regSubmitBtn");

    if (state.submitResult) { updateNavButtons(); renderSuccess(); return; }

    if (!els.bound) {
      els.bound = true;
      if (els.backBtn) els.backBtn.addEventListener("click", goBack);
      if (els.nextBtn) els.nextBtn.addEventListener("click", goNext);
      if (els.saveBtn) els.saveBtn.addEventListener("click", saveDraft);
      if (els.submitBtn) els.submitBtn.addEventListener("click", submitRegistration);
      if (els.stepper) {
        els.stepper.querySelectorAll(".stepper-step").forEach((step, idx) => {
          step.addEventListener("click", () => goToStep(idx));
        });
      }
    }
    renderStep();
  }

  window.RegistrationPortal = {
    init,
    renderStep,
    goToStep,
    goNext,
    goBack,
    saveDraft,
    submitRegistration,
  };

  document.addEventListener("viewchange", (e) => {
    if (e.detail === "registration-portal") init();
  });

  if (document.getElementById("view-registration-portal") && !document.getElementById("view-registration-portal").classList.contains("hidden")) {
    init();
  }
})();