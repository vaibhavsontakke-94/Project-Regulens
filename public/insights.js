/* ═══════════════════════════════════════════════════════════════════════
   ReguLens Graph Insight Engine
   Data-driven explanations for every chart/graph.
   Consumed by app.js after each chart render.
   Exposes window.ReguLensInsights
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /**
   * Build an insight object for a given canvas.
   * @param {string} canvasId   Canvas element id
   * @param {object} data       analysisData (or sub-data)
   * @param {function} t        i18n helper
   * @param {object} [extra]    Optional extra context (e.g. countryCompare data)
   * @returns {object|null}     { explanation, takeaway, action, highlight, howToRead }
   */
  function generateInsight(canvasId, data, t, extra) {
    if (!data) return null;
    var fn = generators[canvasId];
    if (!fn) return null;
    try {
      return fn(data, t, extra);
    } catch (_) {
      return null;
    }
  }

  /* ───────── helpers ───────── */

  function pct(n, total) {
    if (!total) return 0;
    return Math.round((n / total) * 100);
  }

  function pick(arr) {
    return arr.filter(Boolean);
  }

  /* ───────── per-chart generators ───────── */

  var generators = {};

  /* 1. Compliance Status Donut */
  generators.chartComplianceStatus = function (d, t) {
    var s = d.stats || {};
    var total = s.total || 0;
    var completed = s.completed || 0;
    var inProgress = s.inProgress || 0;
    var pending = s.pending || 0;
    var nA = s.nA || 0;
    var ready = pct(completed, total);
    var openCount = pending + inProgress;

    var explanation = t("insight.compliance.explain")
      .replace("{ready}", ready)
      .replace("{completed}", completed)
      .replace("{open}", openCount);

    var takeaway;
    if (ready >= 80) {
      takeaway = t("insight.compliance.takeaway.high").replace("{ready}", ready);
    } else if (ready >= 50) {
      takeaway = t("insight.compliance.takeaway.mid").replace("{ready}", ready);
    } else {
      takeaway = t("insight.compliance.takeaway.low").replace("{ready}", ready);
    }

    var action = t("insight.compliance.action")
      .replace("{open}", openCount);

    var highlight = null;
    if (s.critical > 0) {
      highlight = { icon: "\u26A0", label: t("insight.highlight.criticalReqs"), value: s.critical };
    } else if (ready >= 80) {
      highlight = { icon: "\u2713", label: t("insight.highlight.strongArea"), value: ready + "%" };
    }

    return {
      explanation: explanation,
      takeaway: takeaway,
      action: action,
      highlight: highlight,
      howToRead: t("insight.howToRead.donut"),
    };
  };

  /* 2. Priority Distribution Bar */
  generators.chartPriorityDist = function (d, t) {
    var s = d.stats || {};
    var total = s.total || 0;
    var critical = s.critical || 0;
    var important = s.important || 0;
    var standard = s.standard || 0;

    var explanation = t("insight.priority.explain")
      .replace("{critical}", critical)
      .replace("{important}", important)
      .replace("{standard}", standard);

    var dominant = critical >= important && critical >= standard
      ? "critical" : important >= standard ? "important" : "standard";
    var dominantLabel = t("req." + dominant);
    var dominantCount = { critical: critical, important: important, standard: standard }[dominant];

    var takeaway = t("insight.priority.takeaway")
      .replace("{label}", dominantLabel)
      .replace("{count}", dominantCount);

    var action;
    if (critical > 0) {
      action = t("insight.priority.action.critical").replace("{count}", critical);
    } else {
      action = t("insight.priority.action.clear");
    }

    var highlight = critical > 0
      ? { icon: "\u26A0", label: t("insight.highlight.criticalReqs"), value: critical }
      : null;

    return {
      explanation: explanation,
      takeaway: takeaway,
      action: action,
      highlight: highlight,
      howToRead: t("insight.howToRead.bar"),
    };
  };

  /* 3. Compliance Progress */
  generators.chartComplianceProgress = function (d, t) {
    var s = d.stats || {};
    var total = s.total || 0;
    var completed = s.completed || 0;
    var ready = pct(completed, total);

    var explanation = t("insight.progress.explain")
      .replace("{completed}", completed)
      .replace("{total}", total)
      .replace("{ready}", ready);

    var action = t("insight.progress.action");

    var highlight = ready >= 70
      ? { icon: "\u2191", label: t("insight.highlight.progress"), value: ready + "%" }
      : null;

    return {
      explanation: explanation,
      takeaway: explanation,
      action: action,
      highlight: highlight,
      howToRead: t("insight.howToRead.progress"),
    };
  };

  /* 4. Gap Severity Distribution */
  generators.chartGapSeverity = function (d, t) {
    var gaps = d.gaps || [];
    var total = gaps.length;
    var norm = function (g) { return String(g.severity || g.priority || "").toLowerCase(); };
    var critical = gaps.filter(function (g) { return norm(g) === "critical"; }).length;
    var high = gaps.filter(function (g) { return norm(g) === "high" || norm(g) === "important"; }).length;

    var explanation = t("insight.gap.explain")
      .replace("{total}", total)
      .replace("{critical}", critical)
      .replace("{high}", high);

    var takeaway;
    if (critical > 0) {
      takeaway = t("insight.gap.takeaway.critical").replace("{count}", critical);
    } else if (high > 0) {
      takeaway = t("insight.gap.takeaway.high").replace("{count}", high);
    } else {
      takeaway = t("insight.gap.takeaway.clear");
    }

    var action = t("insight.gap.action").replace("{total}", total);

    var highlight = critical > 0
      ? { icon: "\u26A0", label: t("insight.highlight.criticalGaps"), value: critical }
      : null;

    return {
      explanation: explanation,
      takeaway: takeaway,
      action: action,
      highlight: highlight,
      howToRead: t("insight.howToRead.bar"),
    };
  };

  /* 5. Country Compare (Origin vs Target) */
  generators.chartCountryCompare = function (d, t, extra) {
    if (!extra) return null;
    var origin = extra.originName || t("insight.compare.originDefault");
    var target = extra.targetName || t("insight.compare.targetDefault");
    var categories = extra.categories || [];
    var catRows = extra.catRows || [];

    var explanation = t("insight.compare.explain")
      .replace("{origin}", origin)
      .replace("{target}", target);

    var largestGap = null;
    var maxDelta = 0;
    catRows.forEach(function (r) {
      if (Math.abs(r.delta) > Math.abs(maxDelta)) {
        maxDelta = r.delta;
        largestGap = r;
      }
    });

    var takeaway;
    if (largestGap) {
      takeaway = t("insight.compare.takeaway")
        .replace("{category}", largestGap.category)
        .replace("{delta}", Math.abs(largestGap.delta));
    } else {
      takeaway = t("insight.compare.takeaway.same");
    }

    var action = t("insight.compare.action").replace("{target}", target);

    var highlight = largestGap
      ? { icon: "\u2194", label: t("insight.highlight.largestDiff"), value: largestGap.category + " (\u0394 " + Math.abs(largestGap.delta) + ")" }
      : null;

    return {
      explanation: explanation,
      takeaway: takeaway,
      action: action,
      highlight: highlight,
      howToRead: t("insight.howToRead.groupedBar"),
    };
  };

  /* 6. Risk Matrix (Impact Analysis view) */
  generators.chartRiskMatrix = function (d, t) {
    var risks = d.riskMatrix || d.risks || [];
    var total = risks.length;
    var highRisks = risks.filter(function (r) {
      var sev = String(r.severity || "").toLowerCase();
      return sev === "critical" || sev === "high";
    });

    var explanation = t("insight.risk.explain")
      .replace("{total}", total)
      .replace("{high}", highRisks.length);

    var takeaway;
    if (highRisks.length > 0) {
      var topRisk = highRisks[0];
      takeaway = t("insight.risk.takeaway.top")
        .replace("{name}", topRisk.title || topRisk.name || t("insight.risk.unnamed"));
    } else {
      takeaway = t("insight.risk.takeaway.low");
    }

    var action = t("insight.risk.action");

    var highlight = highRisks.length > 0
      ? { icon: "\u26A0", label: t("insight.highlight.highRisks"), value: highRisks.length }
      : null;

    return {
      explanation: explanation,
      takeaway: takeaway,
      action: action,
      highlight: highlight,
      howToRead: t("insight.howToRead.riskMatrix"),
    };
  };

  /* 7. Risk Distribution Donut (risk matrix view) */
  generators.riskDistCanvas = function (d, t) {
    var risks = d.riskMatrix || d.risks || [];
    var dist = { critical: 0, high: 0, medium: 0, low: 0 };
    risks.forEach(function (r) {
      var k = String(r.severity || "medium").toLowerCase();
      if (dist[k] !== undefined) dist[k] += 1;
    });

    var total = risks.length;
    var explanation = t("insight.riskDist.explain")
      .replace("{total}", total)
      .replace("{critical}", dist.critical)
      .replace("{high}", dist.high);

    var takeaway;
    if (dist.critical > 0) {
      takeaway = t("insight.riskDist.takeaway.critical").replace("{count}", dist.critical);
    } else {
      takeaway = t("insight.riskDist.takeaway.clear");
    }

    return {
      explanation: explanation,
      takeaway: takeaway,
      action: t("insight.riskDist.action"),
      highlight: dist.critical > 0
        ? { icon: "\u26A0", label: t("insight.highlight.criticalRisks"), value: dist.critical }
        : null,
      howToRead: t("insight.howToRead.donut"),
    };
  };

  /* 8. Gauge charts (feasibility, business health, doc checklist, investor readiness, setup guide) */
  function gaugeInsight(canvasId, value, label, t) {
    var explanation = t("insight.gauge.explain")
      .replace("{score}", value)
      .replace("{label}", label);

    var takeaway;
    if (value >= 70) {
      takeaway = t("insight.gauge.takeaway.high").replace("{score}", value);
    } else if (value >= 40) {
      takeaway = t("insight.gauge.takeaway.mid").replace("{score}", value);
    } else {
      takeaway = t("insight.gauge.takeaway.low").replace("{score}", value);
    }

    return {
      explanation: explanation,
      takeaway: takeaway,
      action: t("insight.gauge.action").replace("{label}", label),
      highlight: value >= 70
        ? { icon: "\u2713", label: t("insight.highlight.strongArea"), value: value + "%" }
        : value < 40
          ? { icon: "\u26A0", label: t("insight.highlight.needsAttention"), value: value + "%" }
          : null,
      howToRead: t("insight.howToRead.gauge"),
    };
  }

  generators.fbGaugeCanvas = function (d, t) {
    var score = d.marketFitScore != null ? Math.round(d.marketFitScore * 100) : 0;
    return gaugeInsight("fbGaugeCanvas", score, t("insight.gauge.marketFit"), t);
  };

  generators.bhGaugeCanvas = function (d, t) {
    var score = d.overall != null ? d.overall : 0;
    return gaugeInsight("bhGaugeCanvas", score, t("insight.gauge.businessHealth"), t);
  };

  generators.dcGaugeCanvas = function (d, t) {
    var docs = d.docLibrary || d.docs || [];
    var reqs = (d.requirements || []).length || 1;
    var score = Math.round((docs.length / reqs) * 100);
    return gaugeInsight("dcGaugeCanvas", score, t("insight.gauge.docCoverage"), t);
  };

  generators.ihGaugeCanvas = function (d, t) {
    var score = d.investorReadiness != null ? d.investorReadiness : 0;
    return gaugeInsight("ihGaugeCanvas", score, t("insight.gauge.investorReadiness"), t);
  };

  generators.guideGauge = function (d, t) {
    var steps = d.setupGuide || d.actions || [];
    var done = steps.filter(function (a) { return String(a.status || "").toLowerCase() === "completed" || String(a.status || "").toLowerCase() === "done"; }).length;
    var score = pct(done, steps.length || 1);
    return gaugeInsight("guideGauge", score, t("insight.gauge.setupProgress"), t);
  };

  /* ───────── render insight into a container ───────── */

  function renderInsight(containerId, insight) {
    var el = document.getElementById(containerId);
    if (!el || !insight) {
      if (el) el.innerHTML = "";
      return;
    }

    var html = '<div class="insight-box">';

    /* highlight badge */
    if (insight.highlight) {
      html += '<div class="insight-highlight">' +
        '<span class="insight-highlight-icon">' + esc(insight.highlight.icon) + '</span> ' +
        '<span class="insight-highlight-label">' + esc(insight.highlight.label) + '</span> ' +
        '<span class="insight-highlight-value">' + esc(insight.highlight.value) + '</span>' +
        '</div>';
    }

    /* what does this mean? */
    html += '<div class="insight-section">' +
      '<div class="insight-label">' + (window.ReguLens ? window.ReguLens.t("insight.whatThisMean") : "What does this mean?") + '</div>' +
      '<div class="insight-text">' + esc(insight.explanation) + '</div>' +
      '</div>';

    /* key takeaway */
    html += '<div class="insight-section">' +
      '<div class="insight-label">' + (window.ReguLens ? window.ReguLens.t("insight.keyTakeaway") : "Key takeaway:") + '</div>' +
      '<div class="insight-text">' + esc(insight.takeaway) + '</div>' +
      '</div>';

    /* action */
    if (insight.action) {
      html += '<div class="insight-section">' +
        '<div class="insight-label">' + (window.ReguLens ? window.ReguLens.t("insight.whatToDo") : "What should you do?") + '</div>' +
        '<div class="insight-text">' + esc(insight.action) + '</div>' +
        '</div>';
    }

    /* how to read (collapsible) */
    if (insight.howToRead) {
      html += '<details class="insight-details">' +
        '<summary>' + (window.ReguLens ? window.ReguLens.t("insight.howToReadTitle") : "How to read this") + '</summary>' +
        '<div class="insight-text">' + esc(insight.howToRead) + '</div>' +
        '</details>';
    }

    /* ask copilot link */
    html += '<button class="insight-copilot-btn" data-insight-copilot="' + esc(el.dataset.canvasId || "") + '">' +
      (window.ReguLens ? window.ReguLens.t("insight.askRegulens") : "Ask REGULENS about this") +
      '</button>';

    html += '</div>';
    el.innerHTML = html;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  /* ───────── public API ───────── */
  window.ReguLensInsights = {
    generateInsight: generateInsight,
    renderInsight: renderInsight,
  };
})();
