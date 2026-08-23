/* ═══════════════════════════════════════════════════════════
   ReguLens — Landing page controller (landing.js)
   Loads LAST (after regulens.js) so window.ReguLens exists.
   Reuses the platform's own i18n (t/setLang), theme (switchTheme)
   and navigation (navigate) systems. No new state systems.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var SKIP_KEY = "rl.entered";
  var ENTER_MS = 450;

  var root = document.getElementById("landingRoot");
  if (!root) return;

  var RL = window.ReguLens || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var entered = false;

  function tk(key) {
    try { return RL.t ? RL.t(key) : key; } catch (e) { return key; }
  }

  /* ── instant-skip for revisits in the same tab ─────────── */
  var seen = false;
  try { seen = sessionStorage.getItem(SKIP_KEY) === "1"; } catch (e) {}
  if (seen) {
    root.classList.add("landing-hidden");
    return;
  }

  /* ── helpers ───────────────────────────────────────────── */
  function $$(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function fillStaticTexts() {
    $$("[data-i18n]").forEach(function (el) { el.textContent = tk(el.getAttribute("data-i18n")); });
    $$("[data-i18n-title]").forEach(function (el) { el.setAttribute("title", tk(el.getAttribute("data-i18n-title"))); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", tk(el.getAttribute("data-i18n-aria"))); });
  }

  /* ── headline letter split ─────────────────────────────── */
  var headEl = document.getElementById("landingHeadline");
  var charSpans = [];
  var letterTimers = [];

  function clearLetters() {
    letterTimers.forEach(clearTimeout);
    letterTimers = [];
  }

  function buildLetters(text, animate) {
    if (!headEl) return;
    clearLetters();
    headEl.textContent = "";
    headEl.classList.remove("plain-reveal");
    charSpans = [];

    var hasSpace = /\S\s+\S/.test(text);
    var words = text.split(/(\s+)/);
    var i = 0;
    var count = text.replace(/\s+/g, "").length || 1;
    var step = animate ? Math.min(34, 1200 / count) : 0;
    var base = animate ? 480 : 0;

    words.forEach(function (w) {
      if (!w) return;
      if (/^\s+$/.test(w)) {
        headEl.appendChild(document.createTextNode(w));
        return;
      }
      var wrap = null;
      if (hasSpace) {
        wrap = document.createElement("span");
        wrap.className = "lword";
        headEl.appendChild(wrap);
      }
      Array.prototype.forEach.call(w, function (ch) {
        var s = document.createElement("span");
        s.className = "lchar";
        s.textContent = ch;
        s.setAttribute("aria-hidden", "true");
        (wrap || headEl).appendChild(s);
        charSpans.push(s);
        i++;
      });
    });

    /* screen readers read the plain sentence */
    headEl.setAttribute("aria-label", text);

    if (!animate || reduceMotion) {
      charSpans.forEach(function (s) { s.classList.add("in"); });
      return;
    }
    charSpans.forEach(function (s, idx) {
      letterTimers.push(setTimeout(function () { s.classList.add("in"); }, base + idx * step));
    });
  }

  function renderHeadline(animate) {
    buildLetters(tk(headEl.getAttribute("data-lkey")) || "", animate);
  }

  /* ── language selector ─────────────────────────────────── */
  var langSel = document.getElementById("landingLang");
  function populateLangs() {
    if (!langSel) return;
    var langs = window.LANGUAGES || [];
    var seenCodes = {};
    var frag = document.createDocumentFragment();
    langs.forEach(function (L) {
      if (!L || !L.code || seenCodes[L.code]) return;
      seenCodes[L.code] = true;
      var opt = document.createElement("option");
      opt.value = L.code;
      opt.textContent = L.nativeName || L.name || L.code;
      frag.appendChild(opt);
    });
    langSel.textContent = "";
    langSel.appendChild(frag);
    syncLangValue();
  }
  function syncLangValue() {
    if (!langSel) return;
    var cur = "en";
    try { cur = RL.getLang ? RL.getLang() : cur; } catch (e) {}
    langSel.value = cur;
    if (langSel.selectedIndex < 0) langSel.value = "en";
  }
  if (langSel) {
    populateLangs();
    langSel.addEventListener("change", function () {
      if (!RL.setLang) return;
      RL.setLang(langSel.value);
      fillStaticTexts();          /* instant swap, no replay */
      renderHeadline(false);
    });
  }

  /* ── theme toggle (reuses switchTheme; icons follow body.dark) ── */
  var themeBtn = document.getElementById("landingThemeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      if (!RL.switchTheme) return;
      RL.switchTheme(document.body.classList.contains("dark") ? "light" : "dark");
    });
  }

  /* ── enter the app ─────────────────────────────────────── */
  function enterApp(view) {
    if (entered) return;
    entered = true;
    clearLetters();
    try { sessionStorage.setItem(SKIP_KEY, "1"); } catch (e) {}
    root.classList.add("landing-leaving");
    setTimeout(function () {
      root.classList.add("landing-hidden");
      try { if (RL.navigate) RL.navigate(view); } catch (e) {}
    }, ENTER_MS);
  }

  var startBtn = document.getElementById("landingStartBtn");
  if (startBtn) startBtn.addEventListener("click", function () { enterApp("can-i-launch"); });

  var settingsBtn = document.getElementById("landingSettingsBtn");
  if (settingsBtn) settingsBtn.addEventListener("click", function () { enterApp("settings"); });

  var methodsEl = document.getElementById("landingMethods");
  function scrollToMethods() {
    if (!methodsEl) return;
    if (reduceMotion) { methodsEl.scrollIntoView(); return; }
    methodsEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  var exploreBtn = document.getElementById("landingExploreBtn");
  if (exploreBtn) exploreBtn.addEventListener("click", scrollToMethods);
  var scrollCue = document.getElementById("landingScrollCue");
  if (scrollCue) scrollCue.addEventListener("click", scrollToMethods);
  var brand = document.getElementById("landingBrand");
  if (brand) brand.addEventListener("click", function (e) {
    e.preventDefault();
    var sc = document.getElementById("landingScroll");
    if (sc) sc.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ── concept-section reveals ───────────────────────────── */
  var revealEls = $$(".lreveal");
  if (reduceMotion || !window.IntersectionObserver) {
    revealEls.forEach(function (el) { el.classList.add("show"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── boot sequence ─────────────────────────────────────── */
  fillStaticTexts();
  renderHeadline(true);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      root.classList.add("landing-root-ready");
      var sub = document.getElementById("landingSub");
      var row = document.getElementById("landingCtaRow");
      var cue = document.getElementById("landingScrollCue");
      var delay = reduceMotion ? 0 : 900;
      setTimeout(function () {
        if (sub) sub.classList.add("show");
        if (row) row.classList.add("show");
        if (cue) cue.classList.add("show");
      }, delay);
    });
  });
})();
