/* ───────── Vercel deployment integration (Settings → Deployment) ─────────
   Self-contained module: talks ONLY to /api/vercel/* on this origin.
   No Vercel tokens ever reach the browser — the backend holds them. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    dot: $("vdDot"),
    account: $("vdAccount"),
    select: $("vdProjectSelect"),
    newRow: $("vdNewRow"),
    newName: $("vdNewName"),
    connectBtn: $("vdConnectBtn"),
    disconnectBtn: $("vdDisconnectBtn"),
    deployBtn: $("vdDeployBtn"),
    progressRow: $("vdProgressRow"),
    progressText: $("vdProgressText"),
    spinner: $("vdSpinner"),
    resultRow: $("vdResultRow"),
    resultLink: $("vdResultLink"),
    openBtn: $("vdOpenBtn"),
    redeployBtn: $("vdRedeployBtn"),
    errorRow: $("vdErrorRow"),
    errorText: $("vdErrorText"),
  };
  if (!el.dot || !el.connectBtn) return;

  var FRIENDLY = {
    NOT_SIGNED_IN: "Sign in to your account first, then connect Vercel.",
    VERCEL_NOT_CONFIGURED: "Vercel deployment is not configured on this server yet.",
    VERCEL_NOT_CONNECTED: "Connect your Vercel account first.",
    VERCEL_AUTH_EXPIRED: "Your Vercel connection has expired. Please reconnect your account.",
    VERCEL_AUTH_FAILED: "Vercel sign-in failed or was canceled. Please try connecting again.",
    VERCEL_STATE_INVALID: "The connection attempt expired. Please try connecting again.",
    VERCEL_FORBIDDEN: "Your Vercel account does not have permission for this action.",
    VERCEL_RATE_LIMITED: "Vercel rate limit reached. Wait a moment and try again.",
    VERCEL_NETWORK: "Could not reach Vercel. Check your connection and try again.",
    VERCEL_API_ERROR: "A Vercel API request failed. Please try again.",
    VERCEL_FILES_UNAVAILABLE: "Deployment sources could not be read on the server.",
    VERCEL_STORE_ERROR: "The credentials store is unavailable right now. Try again shortly.",
    INVALID_PROJECT_NAME: "Use lowercase letters, numbers, dots, dashes or underscores for the project name.",
    NO_PROJECT_SELECTED: "Choose a Vercel project before deploying.",
    NETWORK: "Network error. Check your connection and try again.",
  };

  var status = null;
  var projectsLoaded = false;
  var busy = false;
  var pollTimer = null;

  /* ── tiny helpers ── */
  function friendly(code, fallback) {
    return FRIENDLY[code] || fallback || "Something went wrong. Please try again.";
  }

  function signedIn() {
    try {
      var a = window.AuroraFirebase && window.AuroraFirebase.getAuth();
      return Boolean(a && a.currentUser);
    } catch (e) { return false; }
  }

  async function idToken() {
    try {
      var a = window.AuroraFirebase && window.AuroraFirebase.getAuth();
      if (a && a.currentUser) return await a.currentUser.getIdToken();
    } catch (e) {}
    return "";
  }

  async function api(path, opts) {
    opts = opts || {};
    var headers = {};
    var token = await idToken();
    if (token) headers.Authorization = "Bearer " + token;
    var body;
    if (opts.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
    var res;
    try {
      res = await fetch(path, { method: opts.method || (body ? "POST" : "GET"), headers: headers, body: body });
    } catch (e) {
      throw mkError("NETWORK");
    }
    var data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw mkError(data.code, data.error);
    return data;
  }

  function mkError(code, fallback) {
    var err = new Error(friendly(code, fallback));
    err.code = code || "";
    return err;
  }

  /* ── UI helpers ── */
  function setDot(cls) { el.dot.className = "vd-dot" + (cls ? " " + cls : ""); }
  function show(node) { node.hidden = false; }
  function hide(node) { node.hidden = true; }
  function progress(text) { el.progressText.textContent = text || ""; show(el.progressRow); el.spinner.hidden = false; }
  function progressDone(text) { el.progressText.textContent = text || ""; el.spinner.hidden = true; setTimeout(hide, 2500, el.progressRow); }
  function showError(msg) { el.errorText.textContent = msg || ""; show(el.errorRow); }
  function clearError() { el.errorText.textContent = ""; hide(el.errorRow); }
  function setButtons(disabled) {
    el.connectBtn.disabled = disabled;
    el.deployBtn.disabled = disabled;
    el.disconnectBtn.disabled = disabled;
    el.redeployBtn.disabled = disabled;
  }

  function waitForAuth(ms) {
    return new Promise(function (resolve) {
      var waited = 0;
      (function tick() {
        if (signedIn() || waited >= ms) return resolve();
        waited += 200;
        setTimeout(tick, 200);
      })();
    });
  }

  /* ── rendering ── */
  function render() {
    hide(el.resultRow);
    if (!status || !status.configured) {
      setDot("");
      el.account.textContent = "Not configured";
      show(el.connectBtn);
      el.connectBtn.textContent = "Connect Vercel";
      el.connectBtn.disabled = true;
      hide(el.disconnectBtn);
      hide(el.deployBtn);
      el.select.disabled = true;
      return;
    }
    if (!status.connected) {
      setDot(status.expired ? "err" : "");
      el.account.textContent = status.expired ? "Connection expired" : "Not connected";
      el.connectBtn.textContent = status.expired ? "Reconnect Vercel" : "Connect Vercel";
      show(el.connectBtn);
      el.connectBtn.disabled = false;
      hide(el.disconnectBtn);
      hide(el.deployBtn);
      el.select.disabled = true;
      return;
    }

    setDot("ok");
    el.account.textContent = status.account && status.account.username ? "@" + status.account.username : "Connected";
    el.connectBtn.textContent = "Connected";
    hide(el.connectBtn);
    show(el.disconnectBtn);
    show(el.deployBtn);
    el.select.disabled = false;
    projectsLoaded = false;
    loadProjects();

    var last = status.lastDeployment;
    if (last && last.state === "ready" && last.url) showResult(last.url);
  }

  function ensureProjectOption(id, name) {
    var exists = Array.prototype.some.call(el.select.options, function (o) { return o.value === id; });
    if (!exists) {
      var opt = document.createElement("option");
      opt.value = id;
      opt.textContent = name;
      opt.dataset.name = name;
      el.select.insertBefore(opt, el.select.options[el.select.selectedIndex] || el.select.firstChild);
    }
  }

  async function loadProjects(force) {
    if (projectsLoaded && !force) return;
    el.select.innerHTML = "";
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Loading projects…";
    placeholder.disabled = true;
    placeholder.selected = true;
    el.select.appendChild(placeholder);

    try {
      var data = await api("/api/vercel/projects");
      el.select.innerHTML = "";
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "Select a project…";
      empty.disabled = true;
      el.select.appendChild(empty);

      (data.projects || []).forEach(function (p) {
        var opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        opt.dataset.name = p.name;
        el.select.appendChild(opt);
      });

      var newOpt = document.createElement("option");
      newOpt.value = "__new__";
      newOpt.textContent = "Create new project…";
      el.select.appendChild(newOpt);

      if (status.project && status.project.id) {
        ensureProjectOption(status.project.id, status.project.name || status.project.id);
        el.select.value = status.project.id;
        el.newName.value = status.project.name || "";
      }
      projectsLoaded = true;
    } catch (e) {
      el.select.innerHTML = "";
      var errOpt = document.createElement("option");
      errOpt.value = "";
      errOpt.textContent = "Could not load projects";
      el.select.appendChild(errOpt);
      showError(e.message);
    }
  }

  function showResult(url) {
    el.resultLink.href = url;
    el.resultLink.textContent = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    show(el.resultRow);
  }

  /* ── actions ── */
  async function connect() {
    clearError();
    if (!signedIn()) {
      showError(FRIENDLY.NOT_SIGNED_IN);
      return;
    }
    if (busy) return;
    busy = true;
    setButtons(true);
    setDot("busy");
    el.account.textContent = "Connecting…";
    try {
      var data = await api("/api/vercel/start", { body: {} });
      window.location.assign(data.url);
    } catch (e) {
      busy = false;
      setDot(status && status.connected ? "ok" : "");
      el.account.textContent = status && status.connected ? "@..." : "Not connected";
      showError(e.message);
      refreshStatus();
    }
  }

  async function disconnect() {
    clearError();
    stopPolling();
    try { await api("/api/vercel/disconnect", { body: {} }); } catch (e) {}
    hide(el.resultRow);
    hide(el.newRow);
    projectsLoaded = false;
    refreshStatus();
  }

  async function resolveProject() {
    var val = el.select.value;
    if (val === "__new__") {
      var name = el.newName.value.trim().toLowerCase();
      if (!name) {
        showError("Enter a name for the new project.");
        return null;
      }
      var created = await api("/api/vercel/project", { body: { action: "create", name: name } });
      ensureProjectOption(created.project.id, created.project.name);
      el.select.value = created.project.id;
      hide(el.newRow);
      return created.project;
    }
    if (!val) {
      showError("Choose a Vercel project before deploying.");
      return null;
    }
    if (status.project && status.project.id === val) return status.project;
    var opt = el.select.options[el.select.selectedIndex];
    var chosen = await api("/api/vercel/project", { body: { action: "select", id: val, name: (opt && opt.dataset.name) || val } });
    status.project = chosen.project;
    return chosen.project;
  }

  function stopPolling() {
    if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  }

  function pollDeployment(id) {
    stopPolling();
    var startedAt = Date.now();
    pollTimer = setInterval(async function () {
      if (Date.now() - startedAt > 10 * 60 * 1000) {
        stopPolling();
        setDot("err");
        progressDone("Timed out");
        showError("The deployment is taking unusually long. Check its progress in your Vercel dashboard.");
        busy = false;
        setButtons(false);
        return;
      }
      try {
        var data = await api("/api/vercel/deploy/" + encodeURIComponent(id) + "/status");
        var d = data.deployment;
        if (d.state === "ready" || d.state === "error" || d.state === "canceled") {
          stopPolling();
          busy = false;
          setButtons(false);
          if (d.state === "ready") {
            setDot("ok");
            progressDone("Deployment successful");
            showResult(d.alias || d.url);
          } else {
            setDot("err");
            progressDone("");
            showError(d.state === "canceled" ? "The deployment was canceled." : "Deployment failed. Check the build logs in your Vercel dashboard.");
          }
          refreshStatus();
          return;
        }
        progress(d.state === "queued" ? "Preparing deployment…" : "Building…");
      } catch (e) {
        /* transient polling errors are retried on the next tick */
      }
    }, 3000);
  }

  async function deploy() {
    if (busy) return;
    clearError();
    if (!signedIn()) {
      showError(FRIENDLY.NOT_SIGNED_IN);
      return;
    }
    busy = true;
    setButtons(true);
    hide(el.resultRow);
    setDot("busy");
    try {
      progress("Preparing deployment…");
      await resolveProject();
      progress("Uploading files…");
      var data = await api("/api/vercel/deploy", { body: {} });
      progress("Building…");
      pollDeployment(data.deployment.id);
    } catch (e) {
      busy = false;
      setButtons(false);
      setDot(status && status.connected ? "ok" : "err");
      progressDone("");
      showError(e.message);
    }
  }

  async function refreshStatus() {
    try {
      status = await api("/api/vercel/status");
    } catch (e) {
      status = { configured: false };
    }
    render();
  }

  function handleCallbackFlag() {
    var m = /[?&]vercel=([^&]+)/.exec(window.location.search || "");
    if (!m) return;
    var flag = decodeURIComponent(m[1]);
    history.replaceState(null, "", window.location.pathname);
    if (flag === "connected") {
      setDot("ok");
      el.account.textContent = "Verifying connection…";
      return;
    }
    if (flag === "auth_failed") showError(FRIENDLY.VERCEL_AUTH_FAILED);
    else if (flag === "invalid_state") showError(FRIENDLY.VERCEL_STATE_INVALID);
    else showError("Could not complete the Vercel connection. Please try again.");
  }

  /* ── wire up ── */
  el.connectBtn.addEventListener("click", connect);
  el.disconnectBtn.addEventListener("click", disconnect);
  el.deployBtn.addEventListener("click", deploy);
  el.redeployBtn.addEventListener("click", deploy);
  el.openBtn.addEventListener("click", function () {
    var url = el.resultLink.href;
    if (url && url !== "#") window.open(url, "_blank", "noopener");
  });
  el.select.addEventListener("change", function () {
    if (el.select.value === "__new__") {
      show(el.newRow);
      el.newName.focus();
    } else {
      hide(el.newRow);
      clearError();
    }
  });
  el.newName.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") { ev.preventDefault(); deploy(); }
  });

  (async function init() {
    handleCallbackFlag();
    await waitForAuth(4000);
    refreshStatus();
  })();
})();
