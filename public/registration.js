/* ═══════════════════════════════════════════════════════════
   ReguLens — Registration Portal Module
   Multi-step organization & solution registration
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const STORAGE_KEY = "regulens.registration.draft.v1";
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
    solutions: [],
    draft: {
      org: {},
      business: {},
      solutions: [],
      technology: {},
      experience: [],
      financial: {},
      compliance: [],
      documents: [],
      team: {},
    },
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    form: null,
    stepper: null,
    progressEl: null,
    backBtn: null,
    saveBtn: null,
    nextBtn: null,
    submitBtn: null,
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """)
      .replace(/'/g, "'");
  }

  function t(key, vars) {
    try {
      const api = window.ReguLens;
      if (api && typeof api.t === "function") {
        let s = api.t(key);
        if (vars) {
          for (const k of Object.keys(vars)) {
            s = String(s).split("{{" + k + "}}").join(String(vars[k]));
          }
        }
        return s;
      }
    } catch (e) {}
    return key;
  }

  function tf(key, vars) {
    return t(key, vars);
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStep: state.currentStep,
        draft: state.draft,
        timestamp: Date.now(),
      }));
      toast(t("regPortal.draftSaved", { n: Math.round((Date.now() % 86400000) / 60000) }) || "Draft saved");
    } catch (e) {
      console.warn("Failed to save draft:", e);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.draft) {
          state.draft = { ...state.draft, ...parsed.draft };
          state.currentStep = parsed.currentStep || 0;
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
    toast._t = setTimeout(() => el.classList.add("hidden"), 3000);
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

  function updateStepper() {
    if (!els.stepper) return;
    const steps = els.stepper.querySelectorAll(".stepper-step");
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === state.currentStep);
      step.classList.toggle("completed", idx < state.currentStep);
    });
  }

  function updateProgress() {
    if (!els.progressEl) return;
    const totalFields = countTotalFields();
    const filledFields = countFilledFields();
    const pct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    els.progressEl.textContent = tf("regPortal.profileCompletion", { n: pct });
  }

  function countTotalFields() {
    let count = 0;
    count += 12; // org fields
    count += 10; // business fields
    count += state.solutions.length * 15; // solution fields
    count += 8; // technology
    count += state.draft.experience.length * 10; // experience
    count += 6; // financial
    count += state.draft.compliance.length * 5; // compliance
    count += state.draft.documents.length * 4; // documents
    count += 6; // team
    return count;
  }

  function countFilledFields() {
    let count = 0;
    const d = state.draft;
    // Org
    ["name", "orgType", "legalEntityType", "regNumber", "incorpDate", "country", "state", "city", "regAddress", "opAddress", "website", "email", "phone", "description", "logo", "contactName", "contactDesignation", "contactEmail", "contactPhone"].forEach(k => {
      if (d.org[k]) count++;
    });
    // Business
    ["businessDesc", "industry", "primaryDomain", "businessModel", "yearStarted", "operatingLocations", "targetSectors", "expertise", "orgSize", "teamSize", "geoReach", "regions", "businessStage"].forEach(k => {
      if (d.business[k]) count++;
    });
    // Solutions
    state.solutions.forEach(s => {
      ["name", "type", "shortDesc", "desc", "problemSolved", "targetUsers", "targetDepts", "sectors", "useCases", "features", "valueProp", "stage", "deployStatus", "availability", "geoAvailability"].forEach(k => {
        if (s[k]) count++;
      });
    });
    // Technology
    ["techStack", "coreTechs", "aiMl", "hardware", "software", "cloud", "apis", "integration", "dataReqs", "deployModel", "security", "scalability", "support", "implementation"].forEach(k => {
      if (d.technology[k]) count++;
    });
    // Experience
    d.experience.forEach(p => {
      ["name", "clientType", "sector", "problem", "solution", "desc", "location", "startDate", "endDate", "status", "scale", "value", "outcomes", "results", "reference"].forEach(k => {
        if (p[k]) count++;
      });
    });
    // Financial
    ["revenueRange", "revenueTrend", "fundingStatus", "fundingStage", "finYear", "projectCapacity", "typicalProjectSize", "largestProject", "pilotCapacity", "scaleCapacity"].forEach(k => {
      if (d.financial[k]) count++;
    });
    // Compliance
    d.compliance.forEach(c => {
      ["name", "authority", "number", "issueDate", "expiryDate", "status", "document"].forEach(k => {
        if (c[k]) count++;
      });
    });
    // Documents
    d.documents.forEach(doc => {
      ["type", "name", "desc", "file", "issueDate", "expiryDate", "status"].forEach(k => {
        if (doc[k]) count++;
      });
    });
    // Team
    ["teamSize", "techTeamSize", "management", "expertise", "implTeam", "supportTeam", "geoOps", "supportAvail", "deployCapacity", "maxProjects", "training", "deliveryModel"].forEach(k => {
      if (d.team[k]) count++;
    });
    return count;
  }

  function validateStep(stepIdx) {
    const step = STEPS[stepIdx];
    const d = state.draft;
    const errors = [];

    switch (step.id) {
      case "org":
        if (!d.org.name) errors.push(t("regPortal.err.orgName"));
        if (!d.org.orgType) errors.push(t("regPortal.err.orgType"));
        if (!d.org.country) errors.push(t("regPortal.err.country"));
        if (!d.org.email) errors.push(t("regPortal.err.email"));
        if (!d.org.contactName) errors.push(t("regPortal.err.contactName"));
        if (!d.org.contactEmail) errors.push(t("regPortal.err.contactEmail"));
        break;
      case "business":
        if (!d.business.businessDesc) errors.push(t("regPortal.err.bizDesc"));
        if (!d.business.industry) errors.push(t("regPortal.err.industry"));
        break;
      case "solutions":
        if (state.solutions.length === 0) errors.push(t("regPortal.err.noSolutions"));
        state.solutions.forEach((s, i) => {
          if (!s.name) errors.push(tf("regPortal.err.solutionName", { n: i + 1 }));
          if (!s.shortDesc) errors.push(tf("regPortal.err.solutionDesc", { n: i + 1 }));
        });
        break;
      case "technology":
        break;
      case "experience":
        break;
      case "financial":
        break;
      case "compliance":
        break;
      case "documents":
        break;
      case "team":
        break;
      case "review":
        break;
    }
    return errors;
  }

  function renderStep() {
    if (!els.form) return;
    const step = STEPS[state.currentStep];
    const renderFn = window.RegistrationSteps && window.RegistrationSteps[step.id];
    if (renderFn) {
      els.form.innerHTML = renderFn(state.draft, state.solutions);
      bindStepEvents(step.id);
    }
    updateStepper();
    updateProgress();
    updateNavButtons();
  }

  function updateNavButtons() {
    const isFirst = state.currentStep === 0;
    const isLast = state.currentStep === STEPS.length - 1;

    if (els.backBtn) els.backBtn.style.display = isFirst ? "none" : "inline-flex";
    if (els.saveBtn) els.saveBtn.style.display = "inline-flex";
    if (els.nextBtn) els.nextBtn.style.display = isLast ? "none" : "inline-flex";
    if (els.submitBtn) els.submitBtn.style.display = isLast ? "inline-flex" : "none";
  }

  function bindStepEvents(stepId) {
    // Common form input handlers
    els.form.querySelectorAll("input, select, textarea").forEach(el => {
      el.addEventListener("change", () => {
        const path = el.dataset.path;
        if (path) setDraftValue(path, el.type === "checkbox" ? el.checked : el.value);
      });
      el.addEventListener("input", () => {
        const path = el.dataset.path;
        if (path) setDraftValue(path, el.type === "checkbox" ? el.checked : el.value);
      });
    });
  }

  function setDraftValue(path, value) {
    const parts = path.split(".");
    let obj = state.draft;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    updateProgress();
  }

  function goToStep(stepIdx) {
    const errors = validateStep(state.currentStep);
    if (errors.length > 0 && stepIdx > state.currentStep) {
      toast(errors[0]);
      return;
    }
    state.currentStep = Math.max(0, Math.min(STEPS.length - 1, stepIdx));
    renderStep();
  }

  function goNext() {
    goToStep(state.currentStep + 1);
  }

  function goBack() {
    goToStep(state.currentStep - 1);
  }

  async function submitRegistration() {
    const errors = validateStep(state.currentStep);
    if (errors.length > 0) {
      toast(errors[0]);
      return;
    }

    try {
      // Create organization
      const orgData = {
        orgType: "STARTUP",
        name: state.draft.org.name,
        shortName: state.draft.org.shortName,
        description: state.draft.org.description,
        contactEmail: state.draft.org.email,
        contactPhone: state.draft.org.phone,
        status: "ACTIVE",
      };
      const org = await api("POST", "/organizations", orgData);
      state.org = org;

      // Create solutions
      for (const sol of state.solutions) {
        const startupData = {
          organizationId: org.id,
          legalName: sol.name,
          brandName: sol.brandName || sol.name,
          description: sol.desc,
          sector: sol.sector,
          stage: sol.stage,
          website: sol.website,
          location: sol.location,
          state: sol.state,
          isDemo: false,
        };
        await api("POST", "/startups", startupData);
      }

      clearDraft();
      toast(t("regPortal.submitted") || "Registration submitted successfully!");

      // Navigate to dashboard or show success
      if (window.ReguLens && window.ReguLens.navigate) {
        window.ReguLens.navigate("dashboard");
      }
    } catch (e) {
      toast(e.message || "Submission failed");
    }
  }

  function init() {
    loadDraft();
    els.form = $("registrationForm");
    els.stepper = document.querySelector(".registration-stepper");
    els.progressEl = document.querySelector(".registration-progress");
    els.backBtn = $("regBackBtn");
    els.saveBtn = $("regSaveBtn");
    els.nextBtn = $("regNextBtn");
    els.submitBtn = $("regSubmitBtn");

    if (els.backBtn) els.backBtn.addEventListener("click", goBack);
    if (els.saveBtn) els.saveBtn.addEventListener("click", saveDraft);
    if (els.nextBtn) els.nextBtn.addEventListener("click", goNext);
    if (els.submitBtn) els.submitBtn.addEventListener("click", submitRegistration);

    renderStep();
  }

  // Expose for app.js
  window.RegistrationPortal = { init, renderStep, goToStep, saveDraft, submitRegistration };

  // Step renderers
  window.RegistrationSteps = {
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

  // Auto-init when view is shown
  document.addEventListener("viewchange", (e) => {
    if (e.detail === "registration-portal") {
      init();
    }
  });

  // Also init if already on registration view
  if (document.getElementById("view-registration-portal") && !document.getElementById("view-registration-portal").classList.contains("hidden")) {
    init();
  }
})();