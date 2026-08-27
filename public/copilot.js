/* ═══════════════════════════════════════════════════════════════════════
   REGULENS Copilot — ChatGPT-style AI assistant  v2
   Right-side sliding panel, context-aware, language-aware.
   Graph→Copilot context connection, report summary, action plan.
   Exposes window.ReguLensCopilot
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var isOpen = false;
  var messages = [];
  var isStreaming = false;
  var panel = null;
  var msgsEl = null;
  var inputEl = null;
  var sendBtn = null;
  var statusEl = null;
  var quickEl = null;
  var lastGraphContext = null;

  /* ───────── i18n helper ───────── */
  function t(key) {
    if (window.ReguLens && typeof window.ReguLens.t === "function") return window.ReguLens.t(key);
    return key;
  }
  function tf(key, params) {
    var s = t(key);
    for (var k in params) { if (params.hasOwnProperty(k)) s = s.split("{" + k + "}").join(String(params[k])); }
    return s;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  /* ───────── build context from analysisData ───────── */
  function buildContext() {
    var d = (window.ReguLens && window.ReguLens.getAnalysisData) ? window.ReguLens.getAnalysisData() : null;
    if (!d) return null;

    var s = d.stats || {};
    var risks = (d.riskMatrix || d.risks || []).map(function (r) {
      return { title: r.title || r.name, severity: r.severity, probability: r.probability, impact: r.impact, mitigation: r.mitigation };
    });
    var gaps = (d.gaps || []).slice(0, 15).map(function (g) {
      return { name: g.name || g.requirement || g.reqId, severity: g.severity || g.priority, status: g.status };
    });
    var regs = (d.regulations || []).slice(0, 10).map(function (r) {
      return { title: r.title, code: r.code, authority: r.authority, kind: r.kind };
    });
    var reqs = (d.requirements || []).slice(0, 15).map(function (r) {
      return { name: r.name, priority: r.priority, status: r.status, authority: r.authority };
    });
    var actions = (d.actions || []).slice(0, 10).map(function (a) {
      return { title: a.title || a.action, priority: a.priority || a.severity, status: a.status, relatedRequirement: a.relatedRequirement };
    });

    return {
      business: { company: d.company, product: d.product, industry: d.industry },
      origin: { country: d.origin, region: d.originRegion, code: d.originId },
      target: { country: d.target, region: d.targetRegion, code: d.targetId },
      readiness: { score: d.readiness, status: d.readinessStatus, riskLevel: d.riskLevel },
      stats: { total: s.total, critical: s.critical, important: s.important, standard: s.standard, completed: s.completed, inProgress: s.inProgress, pending: s.pending },
      regulations: regs,
      requirements: reqs,
      gaps: gaps,
      risks: risks,
      actionPlan: actions,
      estimatedCost: d.estimatedCost,
      estimatedDays: d.estimatedDays,
      canLaunch: d.canLaunch,
    };
  }

  /* ───────── quick questions ───────── */
  function getQuickQuestions() {
    var ctx = buildContext();
    var qs = [
      { key: "copilot.quick.summarize", q: t("copilot.quick.summarize") },
      { key: "copilot.quick.risk", q: t("copilot.quick.risk") },
      { key: "copilot.quick.first", q: t("copilot.quick.first") },
      { key: "copilot.quick.readiness", q: t("copilot.quick.readiness") },
      { key: "copilot.quick.gaps", q: t("copilot.quick.gaps") },
      { key: "copilot.quick.launch", q: t("copilot.quick.launch") },
      { key: "copilot.quick.actionPlan", q: t("copilot.quick.actionPlan") },
    ];
    if (ctx && ctx.origin && ctx.target && ctx.origin.country && ctx.target.country) {
      qs.splice(5, 0, {
        key: "copilot.quick.compare",
        q: tf("copilot.quick.compare", { o: ctx.origin.country, t: ctx.target.country }),
      });
    }
    return qs;
  }

  /* ───────── detect special commands ───────── */
  function detectCommand(text) {
    var lower = (text || "").toLowerCase().trim();
    if (/^(summarize|summary|summarise|give me a summary|give me summary)/.test(lower)) return "summary";
    if (/(action plan|actionplan|what should i do|steps to|roadmap|step-by-step|step by step|what are the steps|give me (my |the )?action)/.test(lower)) return "actionPlan";
    if (/(report|download|export|generate report)/.test(lower)) return "report";
    return null;
  }

  /* ───────── send message ───────── */
  async function sendMessage(text, graphContext) {
    if (!text || !text.trim() || isStreaming) return;
    text = text.trim();
    inputEl.value = "";
    quickEl.classList.add("hidden");

    /* append user message */
    appendMessage("user", text);
    isStreaming = true;
    statusEl.textContent = t("copilot.thinking");
    statusEl.classList.remove("hidden");
    sendBtn.disabled = true;
    inputEl.disabled = true;

    var ctx = buildContext();
    var lang = (window.ReguLens && window.ReguLens.getLang) ? window.ReguLens.getLang() : "en";

    /* detect special commands */
    var cmd = detectCommand(text);
    var body = {
      question: text,
      context: ctx,
      lang: lang,
    };
    if (cmd) body.command = cmd;
    if (graphContext) body.graphContext = graphContext;
    else if (lastGraphContext) body.graphContext = lastGraphContext;

    try {
      var res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        var errBody;
        try { errBody = await res.json(); } catch (_) { errBody = {}; }
        var msg = errBody.error || t("copilot.error");
        if (res.status === 429) msg = t("copilot.errorRateLimit") || "Too many requests. Please wait a moment.";
        else if (res.status === 503) msg = t("copilot.errorUnavailable") || "REGULENS Copilot is temporarily unavailable. Please try again.";
        else if (res.status === 401 || res.status === 403) msg = t("copilot.errorAuth") || "Authentication error. Please sign in again.";
        throw new Error(msg);
      }

      var json = await res.json();
      appendMessage("assistant", json.answer || t("copilot.noAnswer"), json.mode);
    } catch (err) {
      var errMsg = err.message || t("copilot.error");
      /* network failure */
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errMsg = t("copilot.errorNetwork") || "Network error. Please check your connection.";
      }
      appendMessage("assistant", errMsg, "error");
    } finally {
      isStreaming = false;
      statusEl.classList.add("hidden");
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  }

  /* ───────── render ───────── */
  function appendMessage(role, text, mode) {
    var div = document.createElement("div");
    div.className = "copilot-msg copilot-msg-" + role;
    var icon = role === "user"
      ? '<div class="copilot-avatar copilot-avatar-user"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'
      : '<div class="copilot-avatar copilot-avatar-bot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2z"/></svg></div>';

    var modeTag = "";
    if (mode === "fallback") {
      modeTag = '<span class="copilot-mode-tag">' + t("copilot.offline") + '</span>';
    }
    if (mode === "report") {
      modeTag = '<span class="copilot-mode-tag">' + t("copilot.reportTag") + '</span>';
    }
    if (mode === "actionPlan") {
      modeTag = '<span class="copilot-mode-tag">' + t("copilot.actionPlanTag") + '</span>';
    }

    var textClass = "copilot-msg-text" + (mode === "error" ? " error-msg" : "");

    div.innerHTML = icon +
      '<div class="copilot-msg-body">' +
        '<div class="' + textClass + '">' + formatAnswer(text) + modeTag + '</div>' +
      '</div>';

    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    messages.push({ role: role, text: text });
  }

  function formatAnswer(text) {
    /* markdown-like formatting: **bold**, numbered lists, bullet lists, newlines */
    var s = esc(text);
    /* bold */
    s = s.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    /* italic */
    s = s.replace(/\*(.*?)\*/g, "<em>$1</em>");
    /* numbered lists: 1. text  → <br>1. text */
    s = s.replace(/(?:^|\n)(\d+)\.\s(.+)/g, function (m, num, content) {
      return "<br><span class=\"copilot-list-num\">" + num + ".</span> " + content;
    });
    /* bullet lists: - text or • text */
    s = s.replace(/(?:^|\n)[-•]\s(.+)/g, function (m, p1) { return "<br>\u2022 " + p1; });
    /* horizontal rule */
    s = s.replace(/\n---\n/g, "<br><hr style=\"border:none;border-top:1px solid var(--border);margin:8px 0\">");
    /* newlines */
    s = s.replace(/\n/g, "<br>");
    return s;
  }

  /* ───────── open / close ───────── */
  function open(graphContext) {
    if (!panel) buildPanel();
    isOpen = true;
    panel.classList.add("open");
    document.body.classList.add("copilot-open");
    inputEl.focus();
    if (messages.length === 0) renderQuickQuestions();

    /* store graph context for follow-up questions */
    if (graphContext) {
      lastGraphContext = graphContext;
      /* add visual indicator */
      var ctxTag = document.getElementById("copilotContextTag");
      if (ctxTag && graphContext.canvasId) {
        var chartNames = {
          chartComplianceStatus: "Compliance Status",
          chartPriorityDist: "Priority Distribution",
          chartComplianceProgress: "Compliance Progress",
          chartGapSeverity: "Gap Analysis",
          chartCountryCompare: "Country Comparison",
          chartRiskMatrix: "Risk Matrix",
          riskMatrixCanvas: "Risk Matrix",
          riskDistCanvas: "Risk Distribution",
          fbGaugeCanvas: "Market Fit",
          bhGaugeCanvas: "Business Health",
          dcGaugeCanvas: "Document Coverage",
          ihGaugeCanvas: "Investor Readiness",
          guideGauge: "Setup Progress",
        };
        var chartLabel = chartNames[graphContext.canvasId] || graphContext.canvasId;
        ctxTag.textContent = tf("copilot.viewingChart", { chart: chartLabel });
        ctxTag.classList.remove("hidden");
      }
    } else {
      lastGraphContext = null;
      var ctxTag2 = document.getElementById("copilotContextTag");
      if (ctxTag2) ctxTag2.classList.add("hidden");
    }

    /* if graph context with question, auto-send */
    if (graphContext && graphContext.question) {
      setTimeout(function () { sendMessage(graphContext.question, graphContext); }, 300);
    }
  }

  function close() {
    if (panel) panel.classList.remove("open");
    isOpen = false;
    document.body.classList.remove("copilot-open");
  }

  function toggle() { isOpen ? close() : open(); }

  /* ───────── quick questions UI ───────── */
  function renderQuickQuestions() {
    var qs = getQuickQuestions();
    quickEl.innerHTML = qs.map(function (q) {
      return '<button class="copilot-quick-btn" data-q="' + esc(q.q) + '">' + esc(q.q) + '</button>';
    }).join("");
    quickEl.classList.remove("hidden");
  }

  /* ───────── build panel DOM ───────── */
  function buildPanel() {
    panel = document.createElement("div");
    panel.id = "copilotPanel";
    panel.className = "copilot-panel";
    panel.innerHTML =
      '<div class="copilot-header">' +
        '<div class="copilot-header-left">' +
          '<svg class="copilot-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2z"/></svg>' +
          '<span class="copilot-title">REGULENS Copilot</span>' +
        '</div>' +
        '<button class="copilot-close" id="copilotClose" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="copilot-subtitle">' + t("copilot.subtitle") + '</div>' +
      '<div class="copilot-context-tag hidden" id="copilotContextTag"></div>' +
      '<div class="copilot-messages" id="copilotMessages">' +
        '<div class="copilot-welcome">' +
          '<div class="copilot-welcome-icon"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="8" width="36" height="32" rx="4"/><path d="M16 20h16"/><path d="M16 26h10"/><circle cx="36" cy="10" r="6" fill="var(--primary)" stroke="none"/><path d="M34 10h4M36 8v4" stroke="#fff" stroke-width="1.5"/></svg></div>' +
          '<p class="copilot-welcome-text">' + t("copilot.welcome") + '</p>' +
          '<div class="copilot-commands-hint">' +
            '<span class="copilot-command-chip" data-cmd="summary">' + t("copilot.command.summary") + '</span>' +
            '<span class="copilot-command-chip" data-cmd="actionPlan">' + t("copilot.command.actionPlan") + '</span>' +
            '<span class="copilot-command-chip" data-cmd="report">' + t("copilot.command.report") + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="copilot-quick" id="copilotQuick"></div>' +
      '<div class="copilot-status hidden" id="copilotStatus">' + t("copilot.thinking") + '</div>' +
      '<div class="copilot-input-row">' +
        '<input class="copilot-input" id="copilotInput" type="text" placeholder="' + esc(t("copilot.placeholder")) + '" autocomplete="off" />' +
        '<button class="copilot-send" id="copilotSend" aria-label="Send">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '</button>' +
      '</div>';

    document.body.appendChild(panel);

    msgsEl = panel.querySelector("#copilotMessages");
    inputEl = panel.querySelector("#copilotInput");
    sendBtn = panel.querySelector("#copilotSend");
    statusEl = panel.querySelector("#copilotStatus");
    quickEl = panel.querySelector("#copilotQuick");

    panel.querySelector("#copilotClose").addEventListener("click", close);

    sendBtn.addEventListener("click", function () { sendMessage(inputEl.value); });

    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputEl.value);
      }
    });

    /* quick question clicks */
    quickEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".copilot-quick-btn");
      if (btn) sendMessage(btn.dataset.q);
    });

    /* command chip clicks */
    panel.addEventListener("click", function (e) {
      var chip = e.target.closest(".copilot-command-chip");
      if (chip) {
        var cmd = chip.dataset.cmd;
        if (cmd === "summary") sendMessage(t("copilot.quick.summarize"));
        else if (cmd === "actionPlan") sendMessage(t("copilot.quick.actionPlan"));
        else if (cmd === "report") sendMessage(t("copilot.command.report"));
      }
    });

    /* click outside to close on mobile */
    panel.addEventListener("click", function (e) {
      if (e.target === panel) close();
    });
  }

  /* ───────── public API ───────── */
  window.ReguLensCopilot = {
    open: open,
    close: close,
    toggle: toggle,
    sendMessage: sendMessage,
    isOpen: function () { return isOpen; },
    isContextual: function () { return buildContext() !== null; },
    getGraphContext: function () { return lastGraphContext; },
  };
})();
