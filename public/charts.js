/* ═══════════════════════════════════════════════════════════
   ReguLens — Chart Rendering Utilities (Chart.js 4.x)
   Themed · Destroy-safe · Register-once pattern
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ───────── token helpers ───────── */

  function getToken(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  function isDark() {
    return document.body.classList.contains("dark");
  }

  function getColors() {
    return {
      primary:    getToken("--primary")    || "#2563eb",
      green:      getToken("--green")      || "#16a34a",
      orange:     getToken("--orange")     || "#d97706",
      red:        getToken("--red")        || "#dc2626",
      blue:       getToken("--blue")       || "#2563eb",
      gray:       getToken("--gray")       || "#6b7280",
      text:       getToken("--text")       || "#0f172a",
      text2:      getToken("--text-2")     || "#334155",
      text3:      getToken("--text-3")     || "#64748b",
      border:     getToken("--border")     || "rgba(200,210,225,0.55)",
      surface:    getToken("--surface-solid") || "#ffffff",
      critical:   "#dc2626",
      high:       "#f97316",
      medium:     "#eab308",
      low:        "#22c55e",
      completed:  "#22c55e",
      inProgress: "#3b82f6",
      pending:    "#94a3b8",
      notApplicable: "#d1d5db",
    };
  }

  /* ───────── global registry ───────── */

  var chartRegistry = new Map();

  function trackChart(id, chart) {
    if (chartRegistry.has(id)) {
      var old = chartRegistry.get(id);
      if (old && typeof old.destroy === "function") old.destroy();
    }
    chartRegistry.set(id, chart);
    return chart;
  }

  function destroyChart(chartInstance) {
    if (chartInstance && typeof chartInstance.destroy === "function") {
      chartInstance.destroy();
    }
  }

  function destroyAllCharts() {
    chartRegistry.forEach(function (c) {
      if (c && typeof c.destroy === "function") c.destroy();
    });
    chartRegistry.clear();
  }

  /* ───────── Chart.js global defaults ───────── */

  function applyDefaults() {
    var c = getColors();
    var font = (getToken("--font") || '"Inter", system-ui, -apple-system, sans-serif');

    Chart.defaults.font.family = font;
    Chart.defaults.font.size   = 13;
    Chart.defaults.color       = c.text3;
    Chart.defaults.responsive  = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation   = { duration: 800, easing: "easeOutQuart" };

    Chart.defaults.plugins.legend.labels.padding  = 16;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;

    Chart.defaults.plugins.tooltip.backgroundColor = isDark()
      ? "rgba(17,22,30,0.92)"
      : "rgba(15,23,42,0.92)";
    Chart.defaults.plugins.tooltip.titleColor   = "#f8fafc";
    Chart.defaults.plugins.tooltip.bodyColor    = "#e2e8f0";
    Chart.defaults.plugins.tooltip.borderColor  = "rgba(148,163,184,0.18)";
    Chart.defaults.plugins.tooltip.borderWidth  = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.padding      = { top: 10, bottom: 10, left: 14, right: 14 };
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding    = 4;
  }

  /* ───────── centre-text plugin (for doughnuts) ───────── */

  var centreTextPlugin = {
    id: "regulensCentreText",
    afterDraw: function (chart) {
      if (chart.config.type !== "doughnut") return;
      if (!chart.options.plugins.regulensCentreText) return;

      var cfg = chart.options.plugins.regulensCentreText;
      var ctx = chart.ctx;
      /* Chart.js 4.x: per-dataset metadata lives on getDatasetMeta(index). */
      var meta = typeof chart.getDatasetMeta === "function" ? chart.getDatasetMeta(0) : null;
      if (!meta || !meta.data || meta.data.length === 0) return;

      var arc = meta.data[0];
      if (!arc || typeof arc.x !== "number" || typeof arc.y !== "number") return;
      var cx = arc.x;
      var cy = arc.y;

      ctx.save();
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      if (cfg.title) {
        ctx.font      = "600 13px " + (getToken("--font") || "Inter, system-ui, sans-serif");
        ctx.fillStyle = getColors().text3;
        ctx.fillText(cfg.title, cx, cy - 8);
      }

      if (cfg.value !== undefined) {
        ctx.font      = "700 22px " + (getToken("--font") || "Inter, system-ui, sans-serif");
        ctx.fillStyle = getColors().text;
        ctx.fillText(String(cfg.value), cx, cfg.title ? cy + 14 : cy);
      }

      ctx.restore();
    },
  };

  /* ───────── quadrant plugin (risk-matrix background) ───────── */

  var quadrantPlugin = {
    id: "regulensQuadrants",
    beforeDraw: function (chart) {
      if (!chart.options.plugins.regulensQuadrants) return;

      var ctx  = chart.ctx;
      var area = chart.chartArea;
      if (!area) return;

      var w = area.right  - area.left;
      var h = area.bottom - area.top;
      var hw = w / 2;
      var hh = h / 2;

      var quads = [
        { x: area.left,      y: area.top,       w: hw, h: hh, color: "rgba(34,197,94,0.10)"  },
        { x: area.left + hw, y: area.top,       w: hw, h: hh, color: "rgba(234,179,8,0.10)"  },
        { x: area.left,      y: area.top + hh,  w: hw, h: hh, color: "rgba(234,179,8,0.08)"  },
        { x: area.left + hw, y: area.top + hh,  w: hw, h: hh, color: "rgba(220,38,38,0.10)"  },
      ];

      ctx.save();
      quads.forEach(function (q) {
        ctx.fillStyle = q.color;
        ctx.fillRect(q.x, q.y, q.w, q.h);
      });
      ctx.restore();
    },
  };

  /* ───────── register plugins once ───────── */

  var pluginsRegistered = false;

  function ensurePlugins() {
    if (pluginsRegistered) return;
    if (typeof Chart === "undefined") return;
    Chart.register(centreTextPlugin, quadrantPlugin);
    applyDefaults();
    pluginsRegistered = true;
  }

  /* ───────── private helpers ───────── */

  function getCanvas(canvasId) {
    var el = document.getElementById(canvasId);
    if (!el || el.getContext === undefined) {
      try { el = document.querySelector(canvasId); } catch (_) { /* ignore */ }
    }
    if (!el) return null;
    return el;
  }

  function alphaColor(hex, alpha) {
    if (hex.charAt(0) !== "#") return hex;
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }

  function gradient(ctx, el, topColor, bottomColor) {
    var grad = ctx.createLinearGradient(0, 0, 0, el.height || 300);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    return grad;
  }

  /* ───────── factory: donut ───────── */

  function createDonutChart(canvasId, labels, data, colors) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    var total = data.reduce(function (a, b) { return a + b; }, 0);
    var ctx = canvas.getContext("2d");

    var chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 8,
          borderRadius: 4,
        }],
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: { position: "bottom" },
          regulensCentreText: { value: total, title: labels.length === 1 ? "" : "Total" },
        },
      },
    });

    return trackChart(canvasId, chart);
  }

  /* ───────── factory: bar (vertical) ───────── */

  function createBarChart(canvasId, labels, data, colors, options) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    options = options || {};
    var horizontal = !!options.horizontal;
    var c = getColors();
    var ctx = canvas.getContext("2d");

    var barColors = Array.isArray(colors) ? colors : (typeof colors === "string" ? colors : c.primary);

    var cfg = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: barColors,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 56,
        }],
      },
      options: {
        indexAxis: horizontal ? "y" : "x",
        scales: {
          x: {
            grid: { color: c.border, drawBorder: false },
            ticks: { color: c.text3 },
          },
          y: {
            grid: { color: c.border, drawBorder: false },
            ticks: { color: c.text3 },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    };

    var chart = new Chart(ctx, cfg);
    return trackChart(canvasId, chart);
  }

  /* ───────── factory: horizontal bar (shorthand) ───────── */

  function createHorizontalBarChart(canvasId, labels, data, colors) {
    return createBarChart(canvasId, labels, data, colors, { horizontal: true });
  }

  /* ───────── factory: radar ───────── */

  function createRadarChart(canvasId, labels, data, color) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    var c = getColors();
    var radarColor = color || c.primary;
    var ctx = canvas.getContext("2d");

    var maxVal = Math.max.apply(null, data);
    var suggestedMax = maxVal <= 5 ? 5 : 100;

    var chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: alphaColor(radarColor, 0.18),
          borderColor: radarColor,
          borderWidth: 2,
          pointBackgroundColor: radarColor,
          pointBorderColor: "#fff",
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        }],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: suggestedMax,
            grid: { color: c.border },
            angleLines: { color: c.border },
            pointLabels: { color: c.text2, font: { size: 12 } },
            ticks: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    });

    return trackChart(canvasId, chart);
  }

  /* ───────── factory: line ───────── */

  function createLineChart(canvasId, labels, datasets, options) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    options = options || {};
    var c = getColors();
    var ctx = canvas.getContext("2d");

    var styledDatasets = datasets.map(function (ds, i) {
      var col = ds.color || c.primary;
      var fillColor = ds.fill
        ? (typeof ds.fill === "string" && ds.fill.charAt(0) === "#"
          ? alphaColor(ds.fill, 0.12)
          : alphaColor(col, 0.12))
        : false;

      return {
        label: ds.label || ("Series " + (i + 1)),
        data: ds.data,
        borderColor: col,
        backgroundColor: fillColor || "transparent",
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: col,
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        fill: !!fillColor,
      };
    });

    var chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: styledDatasets,
      },
      options: {
        scales: {
          x: {
            grid: { color: c.border, drawBorder: false },
            ticks: { color: c.text3 },
          },
          y: {
            grid: { color: c.border, drawBorder: false },
            ticks: { color: c.text3 },
          },
        },
        plugins: {
          legend: { position: "bottom" },
        },
        interaction: { intersect: false, mode: "index" },
      },
    });

    return trackChart(canvasId, chart);
  }

  /* ───────── factory: progress bar ───────── */

  function createProgressChart(canvasId, completed, total, label) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    var c   = getColors();
    var pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    var remaining = total - completed;
    var ctx = canvas.getContext("2d");

    var chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [label || "Progress"],
        datasets: [
          {
            label: "Completed",
            data: [completed],
            backgroundColor: c.green,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Remaining",
            data: [remaining],
            backgroundColor: c.notApplicable,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        scales: {
          x: { stacked: true, display: false },
          y: { stacked: true, display: false },
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          regulensCentreText: {
            value: pct + "%",
            title: label || "",
          },
        },
      },
    });

    return trackChart(canvasId, chart);
  }

  /* ───────── factory: risk-matrix (scatter) ───────── */

  function createRiskMatrix(canvasId, risks) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    var c   = getColors();
    var ctx = canvas.getContext("2d");

    var severityColorMap = {
      critical: c.critical,
      high:     c.high,
      medium:   c.medium,
      low:      c.low,
    };

    var severitySizeMap = {
      critical: 14,
      high:     11,
      medium:   9,
      low:      7,
    };

    var points = (risks || []).map(function (r) {
      var sev = (r.severity || "medium").toLowerCase();
      return {
        x: r.probability || 3,
        y: r.impact || 3,
        r: severitySizeMap[sev] || 9,
        _risk: r,
        _sev: sev,
      };
    });

    var chart = new Chart(ctx, {
      type: "bubble",
      data: {
        datasets: [{
          data: points,
          backgroundColor: points.map(function (p) {
            return alphaColor(severityColorMap[p._sev] || c.medium, 0.65);
          }),
          borderColor: points.map(function (p) {
            return severityColorMap[p._sev] || c.medium;
          }),
          borderWidth: 1.5,
        }],
      },
      options: {
        plugins: {
          legend: { display: false },
          regulensQuadrants: true,
          tooltip: {
            callbacks: {
              title: function (items) {
                if (!items.length) return "";
                var pt = items[0].raw;
                return pt._risk.title || pt._risk.name || "Risk";
              },
              label: function (item) {
                var r = item.raw._risk;
                return [
                  "Severity: " + (r.severity || "medium"),
                  "Probability: " + (r.probability || item.raw.x),
                  "Impact: " + (r.impact || item.raw.y),
                ];
              },
            },
          },
        },
        scales: {
          x: {
            min: 0.5,
            max: 5.5,
            title: { display: true, text: "Probability", color: c.text3 },
            grid: { color: c.border, drawBorder: false },
            ticks: {
              stepSize: 1,
              color: c.text3,
              callback: function (v) { return Number.isInteger(v) ? v : ""; },
            },
          },
          y: {
            min: 0.5,
            max: 5.5,
            title: { display: true, text: "Impact", color: c.text3 },
            grid: { color: c.border, drawBorder: false },
            ticks: {
              stepSize: 1,
              color: c.text3,
              callback: function (v) { return Number.isInteger(v) ? v : ""; },
            },
          },
        },
      },
    });

    return trackChart(canvasId, chart);
  }

  /* ───────── factory: grouped bar (multi-dataset) ───────── */

  function createGroupedBarChart(canvasId, labels, datasets, options) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    options = options || {};
    var c = getColors();
    var ctx = canvas.getContext("2d");

    var chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: (datasets || []).map(function (ds) {
          return {
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.color,
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 42,
          };
        }),
      },
      options: {
        scales: {
          x: { grid: { color: c.border, drawBorder: false }, ticks: { color: c.text3 } },
          y: {
            grid: { color: c.border, drawBorder: false },
            ticks: { color: c.text3 },
            beginAtZero: true,
            suggestedMax: options.yMax || undefined,
          },
        },
        plugins: { legend: { position: "bottom" } },
      },
    });

    return trackChart(canvasId, chart);
  }

  /* ───────── factory: gauge (half-circle doughnut) ───────── */

  function createGaugeChart(canvasId, value, max, label) {
    ensurePlugins();
    var canvas = getCanvas(canvasId);
    if (!canvas) return null;

    var c   = getColors();
    var ctx = canvas.getContext("2d");

    var pct    = max > 0 ? Math.min(value / max, 1) : 0;
    var filled = pct * 180;
    var empty  = 180 - filled;

    var fillColor;
    if (pct < 0.33)      fillColor = c.red;
    else if (pct < 0.66) fillColor = c.orange;
    else                  fillColor = c.green;

    var chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [filled, empty],
          backgroundColor: [fillColor, alphaColor(c.gray, 0.15)],
          borderWidth: 0,
        }],
      },
      options: {
        rotation: -90,
        circumference: 180,
        cutout: "75%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          regulensCentreText: {
            value: Math.round(pct * 100) + "%",
            title: label || "",
          },
        },
      },
    });

    return trackChart(canvasId, chart);
  }

  /* ───────── theme reconnection ───────── */

  function updateChartTheme(chartInstance) {
    if (!chartInstance) return;
    applyDefaults();

    var c = getColors();

    if (chartInstance.options.scales) {
      ["x", "y", "r"].forEach(function (axis) {
        var sc = chartInstance.options.scales[axis];
        if (!sc) return;
        if (sc.grid)   sc.grid.color = c.border;
        if (sc.ticks)  sc.ticks.color = c.text3;
        if (sc.angleLines) sc.angleLines.color = c.border;
        if (sc.pointLabels) sc.pointLabels.color = c.text2;
        if (sc.title)  sc.title.color = c.text3;
      });
    }

    chartInstance.update();
  }

  function reconnectAllCharts() {
    chartRegistry.forEach(function (chart) {
      updateChartTheme(chart);
    });
  }

  /* ───────── public API ───────── */

  window.ReguLensCharts = {
    createDonutChart:         createDonutChart,
    createBarChart:           createBarChart,
    createHorizontalBarChart: createHorizontalBarChart,
    createRadarChart:         createRadarChart,
    createLineChart:          createLineChart,
    createProgressChart:      createProgressChart,
    createRiskMatrix:         createRiskMatrix,
    createGroupedBarChart:    createGroupedBarChart,
    createGaugeChart:         createGaugeChart,
    destroyChart:             destroyChart,
    updateChartTheme:         updateChartTheme,
    destroyAllCharts:         destroyAllCharts,
    reconnectAllCharts:       reconnectAllCharts,
    getColors:                getColors,
    isDark:                   isDark,
    trackChart:               trackChart,
  };

  /* ───────── auto-init when DOM ready ───────── */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensurePlugins);
  } else {
    ensurePlugins();
  }
})();
