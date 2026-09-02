/* ═══════════════════════════════════════════════════════════
   ReguLens — experience layer (light enterprise)
   ⌘K command palette · subtle cursor glow
   Pure enhancement. Never touches app logic.
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel) => document.querySelector(sel);
  const app = () => window.ReguLens;

  /* ═══════════════ CURSOR GLOW (subtle, fine pointers only) ═══════════════ */
  if (finePointer && !reduceMotion) {
    const el = document.getElementById("rlCursor");
    if (el) {
      let x = window.innerWidth / 2, y = window.innerHeight / 2;
      let tx = x, ty = y;
      let raf = 0;
      document.addEventListener("mousemove", (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!raf) {
          raf = requestAnimationFrame(function loop() {
            raf = 0;
            x += (tx - x) * 0.14;
            y += (ty - y) * 0.14;
            el.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
            if (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(loop);
          });
        }
      }, { passive: true });
    }
  }

  /* ═══════════════ COMMAND PALETTE ═══════════════ */
  const palette = (() => {
    const root = document.getElementById("rlPalette");
    const input = document.getElementById("rlPaletteInput");
    const list = document.getElementById("rlPaletteList");
    if (!root || !input || !list) return null;

    const ICONS = {
      dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
      launch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
      req: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>',
      gap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/><path d="m8.5 11 1.8 1.8 3.2-3.6"/></svg>',
      plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
      cost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      docs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
      watch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12a10 10 0 0 1 10-10"/><path d="M2 12a10 10 0 0 0 10 10"/><path d="M2 12h4"/><path d="M22 12a10 10 0 0 1-10 10"/><path d="M22 12H14"/></svg>',
      updates: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      impact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
      sim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-4z"/><path d="M5 13v6a2 2 0 0 0 2 2h2"/><path d="M15 11h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/></svg>',
      industry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 6 6 4-4 8 8"/><path d="M17 7h4v4"/></svg>',
      settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
      theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.4"/><path d="M12 2v2.4M12 19.6V22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2 12h2.4M19.6 12H22M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></svg>',
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
      doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    };

    let items = [];
    let index = 0;
    let lastFocus = null;
    let isOpen = false;

    function buildItems() {
      const api = app();
      if (!api) return [];
      const state = api.getState ? api.getState() : {};
      const items = [];

      items.push({ group: "Navigate", icon: ICONS.dashboard, label: "Dashboard", hint: "home", keywords: "dashboard home overview readiness", run: () => api.navigate("dashboard") });
items.push({ group: "Modules", icon: ICONS.industry, label: "Market Intelligence", hint: "module", keywords: "market intelligence feasibility cost entry", run: () => api.navigate("feasibility") });
      items.push({ group: "Modules", icon: ICONS.req, label: "Compliance Assessment", hint: "module", keywords: "compliance assessment requirements gaps plan", run: () => api.navigate("requirements") });
      items.push({ group: "Modules", icon: ICONS.gap, label: "Business Health Scorecard", hint: "module", keywords: "risk business health matrix monitor", run: () => api.navigate("risk-matrix") });
      items.push({ group: "Modules", icon: ICONS.user, label: "Growth & Partnerships", hint: "module", keywords: "growth partnerships cofounder investor global", run: () => api.navigate("network") });
      items.push({ group: "Modules", icon: ICONS.sim, label: "Impact Analysis", hint: "module", keywords: "impact analysis scenarios simulator compare industry", run: () => api.navigate("impact-analysis") });
      items.push({ group: "Modules", icon: ICONS.launch, label: "Decision Support Assistant", hint: "module", keywords: "decision support assistant chat agents history", run: () => api.navigate("assistant") });
      items.push({ group: "Modules", icon: ICONS.docs, label: "Documents & Evidence", hint: "module", keywords: "documents evidence checklist templates library files workspace", run: () => api.navigate("doc-checklist") });
      items.push({ group: "Navigate", icon: ICONS.launch, label: "Business Feasibility Assessment", hint: "market", keywords: "feasibility assessment idea evaluate viability", run: () => api.navigate("feasibility") });
      items.push({ group: "Navigate", icon: ICONS.watch, label: "Country Policy Inquiry", hint: "compliance", keywords: "policy checker country question ai", run: () => api.navigate("policy-checker") });
      items.push({ group: "Navigate", icon: ICONS.industry, label: "Business Health Scorecard", hint: "risk", keywords: "business health scorecard signals fraud", run: () => api.navigate("business-health") });
      items.push({ group: "Navigate", icon: ICONS.user, label: "Team Role Finder", hint: "growth", keywords: "team role finder cofounder roles search brief", run: () => api.navigate("co-founder") });
      items.push({ group: "Navigate", icon: ICONS.gap, label: "Investor Readiness Assessment", hint: "growth", keywords: "investor readiness assessment one pager pitch fundraise", run: () => api.navigate("investor-hub") });
      items.push({ group: "Navigate", icon: ICONS.launch, label: "Organization Registration", hint: "register business", keywords: "register business overview readiness", run: () => api.navigate("registration-portal") });
      items.push({ group: "Navigate", icon: ICONS.req, label: "Requirements", hint: "req", keywords: "requirements compliance checklist", run: () => api.navigate("requirements") });
      items.push({ group: "Navigate", icon: ICONS.gap, label: "Gap Analysis", hint: "gap", keywords: "gap analysis gaps", run: () => api.navigate("gap-analysis") });
      items.push({ group: "Navigate", icon: ICONS.plan, label: "Action Plan", hint: "plan", keywords: "action plan next steps timeline", run: () => api.navigate("action-plan") });
      items.push({ group: "Navigate", icon: ICONS.cost, label: "Cost Estimator", hint: "cost", keywords: "cost estimator budget money", run: () => api.navigate("cost-estimator") });
      items.push({ group: "Navigate", icon: ICONS.docs, label: "Document Library", hint: "docs", keywords: "documents library files", run: () => api.navigate("document-library") });
      items.push({ group: "Navigate", icon: ICONS.watch, label: "Regulation Watch", hint: "watch", keywords: "regulation watch monitor", run: () => api.navigate("regulation-watch") });
      items.push({ group: "Navigate", icon: ICONS.updates, label: "Regulatory Updates", hint: "updates", keywords: "updates feed changes", run: () => api.navigate("updates") });
      items.push({ group: "Navigate", icon: ICONS.impact, label: "Regulatory Impact Analysis", hint: "impact", keywords: "impact analysis", run: () => api.navigate("impact-analysis") });
      items.push({ group: "Navigate", icon: ICONS.sim, label: "Regulatory Impact Simulator", hint: "policy", keywords: "policy simulator scenarios", run: () => api.navigate("policy-simulator") });
      items.push({ group: "Navigate", icon: ICONS.industry, label: "Cross-Industry Burden Analysis", hint: "industry", keywords: "industry impact", run: () => api.navigate("industry-impact") });
      items.push({ group: "Navigate", icon: ICONS.compare, label: "Scenario Comparison", hint: "compare", keywords: "compare scenarios markets", run: () => api.navigate("compare-scenarios") });
      items.push({ group: "Navigate", icon: ICONS.settings, label: "Settings", hint: "settings", keywords: "settings preferences", run: () => api.navigate("settings") });
      items.push({ group: "Navigate", icon: ICONS.profile, label: "Profile", hint: "profile", keywords: "profile account", run: () => api.navigate("profile") });

      items.push({ group: "Actions", icon: ICONS.theme, label: "Switch theme", hint: "theme", keywords: "dark light mode theme appearance", run: () => api.switchTheme(state.dark ? "light" : "dark") });
      items.push({ group: "Actions", icon: ICONS.doc, label: "Upload document", hint: "file", keywords: "upload document attach file", run: () => api.openDocumentPicker && api.openDocumentPicker() });
      items.push({ group: "Actions", icon: ICONS.trash, label: "Clear conversation memory", hint: "danger", keywords: "clear memory delete conversations privacy", run: () => api.openConfirm && api.openConfirm() });
      items.push({ group: "Actions", icon: ICONS.user, label: state.user ? "Sign out" : "Sign in", hint: "account", keywords: "sign in out login auth account", run: () => state.user ? api.doSignOut() : api.openLoginModal() });

      return items;
    }

    function render(q) {
      const api = app();
      if (!api) {
        list.innerHTML = "";
        return;
      }
      items = buildItems();
      const query = (q || "").trim().toLowerCase();
      const filtered = items.filter((it) => !query || it.label.toLowerCase().includes(query) || it.keywords.includes(query));
      index = 0;
      list.innerHTML = "";
      if (!filtered.length) {
        list.innerHTML = '<div class="rl-palette-empty">No commands match "' + (q || "") + '"</div>';
        return;
      }
      let group = null;
      filtered.forEach((it, idx) => {
        if (group !== it.group) {
          group = it.group;
          const g = document.createElement("div");
          g.className = "rl-palette-group";
          g.textContent = it.group;
          list.appendChild(g);
        }
        const btn = document.createElement("button");
        btn.className = "rl-palette-item" + (idx === 0 ? " active" : "");
        btn.type = "button";
        btn.dataset.idx = String(idx);
        btn.innerHTML = it.icon + '<span class="palette-item-label"></span><span class="palette-item-kbd"></span>';
        btn.querySelector(".palette-item-label").textContent = it.label;
        btn.querySelector(".palette-item-kbd").textContent = it.hint || "";
        btn.addEventListener("mousemove", () => setActive(idx));
        btn.addEventListener("click", () => execute(idx));
        list.appendChild(btn);
      });
    }

    function setActive(idx) {
      const els = list.querySelectorAll(".rl-palette-item");
      if (idx < 0 || idx >= els.length) return;
      index = idx;
      els.forEach((el, i) => el.classList.toggle("active", i === idx));
      els[idx].scrollIntoView({ block: "nearest" });
    }

    function execute(idx) {
      const itemEl = list.querySelectorAll(".rl-palette-item")[idx];
      if (itemEl && items[idx] && items[idx].run) {
        const fn = items[idx].run;
        close();
        fn();
      }
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      lastFocus = document.activeElement;
      buildItems();
      root.classList.remove("hidden");
      document.body.classList.add("rl-palette-open");
      input.value = "";
      render("");
      input.focus();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      root.classList.add("hidden");
      document.body.classList.remove("rl-palette-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen ? close() : open();
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const n = list.querySelectorAll(".rl-palette-item").length;
        if (n) setActive((index + 1) % n);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const n = list.querySelectorAll(".rl-palette-item").length;
        if (n) setActive((index - 1 + n) % n);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const els = list.querySelectorAll(".rl-palette-item");
        if (els[index]) els[index].click();
      }
    });

    input.addEventListener("input", () => render(input.value));
    root.addEventListener("click", (e) => {
      if (e.target === root) close();
    });

    const btn = document.getElementById("rlCommandBtn");
    if (btn) btn.addEventListener("click", (e) => {
      if (e.target.id === "searchInput") return;
      open();
    });
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("focus", open);

    root.setAttribute("role", "dialog");
    return { open, close };
  })();

  window.ReguLensUI = {
    openPalette: () => palette && palette.open(),
    closePalette: () => palette && palette.close(),
  };
})();
