window.AuroraFirebase = (function () {
  let app = null;
  let auth = null;
  let configured = false;
  let initPromise = null;

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      if (typeof firebase === "undefined" || typeof firebase.initializeApp !== "function") {
        configured = false;
        return null;
      }
      let cfg = {};
      try {
        const res = await fetch("/api/firebase-config");
        cfg = await res.json();
      } catch {
        cfg = {};
      }
      const ready = cfg && cfg.apiKey && cfg.authDomain && cfg.projectId;
      if (!ready) {
        configured = false;
        return null;
      }
      app = firebase.initializeApp(cfg, "aurora");
      auth = firebase.auth(app);
      configured = true;
      return auth;
    })();
    return initPromise;
  }

  function isConfigured() {
    return configured;
  }

  function getAuth() {
    return auth;
  }

  return { init, isConfigured, getAuth };
})();
