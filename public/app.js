(() => {
  "use strict";

  window.addEventListener("error", (e) => showErr(e.message || "Unknown error"));
  window.addEventListener("unhandledrejection", (e) =>
    showErr(e.reason && e.reason.message ? e.reason.message : "Unhandled promise rejection")
  );
  function showErr(msg) {
    const b = document.getElementById("errBadge");
    if (b) {
      b.textContent = "⚠ " + msg;
      b.hidden = false;
    }
  }

  /* ───────── element refs ───────── */
  const els = {
    body: document.body,
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("sidebarOverlay"),
    menuBtn: document.getElementById("menuBtn"),
    navItems: Array.from(document.querySelectorAll(".nav-item")),
    views: Array.from(document.querySelectorAll(".view")),
    userBtn: document.getElementById("userBtn"),
    userMenu: document.getElementById("userMenu"),
    userMenuSignOut: document.getElementById("userMenuSignOut"),
    langBtn: document.getElementById("langBtn"),
    langMenu: document.getElementById("langMenu"),
    searchInput: document.getElementById("searchInput"),
    downloadReportBtn: document.getElementById("downloadReportBtn"),
    bookCallBtn: document.getElementById("bookCallBtn"),
    uploadDocBtn: document.getElementById("uploadDocBtn"),
    docInput: document.getElementById("docInput"),
    simPolicy: document.getElementById("simPolicy"),
    simulateBtn: document.getElementById("simulateBtn"),
    simStatus: document.getElementById("simStatus"),
    themeSeg: document.getElementById("themeSeg"),
    setAppLang: document.getElementById("setAppLang"),
    setDensity: document.getElementById("setDensity"),
    accountIdentity: document.getElementById("accountIdentity"),
    authBtn: document.getElementById("authBtn"),
    aiStatus: document.getElementById("aiStatus"),
    aiRetryBtn: document.getElementById("aiRetryBtn"),
    clearMemoryBtn: document.getElementById("clearMemoryBtn"),
    avatar: document.getElementById("avatar"),
    profileName: document.getElementById("profileName"),
    profileEmail: document.getElementById("profileEmail"),
    profileLogoutBtn: document.getElementById("profileLogoutBtn"),
    userName: document.getElementById("userName"),
    loginModal: document.getElementById("loginModal"),
    loginCloseBtn: document.getElementById("loginCloseBtn"),
    authTabs: Array.from(document.querySelectorAll(".auth-tab")),
    authForm: document.getElementById("authForm"),
    nameField: document.getElementById("nameField"),
    authName: document.getElementById("authName"),
    authEmail: document.getElementById("authEmail"),
    authPassword: document.getElementById("authPassword"),
    authError: document.getElementById("authError"),
    authSubmit: document.getElementById("authSubmit"),
    loginTitle: document.getElementById("loginTitle"),
    loginSubtitle: document.getElementById("loginSubtitle"),
    authMain: document.getElementById("authMain"),
    forgotLink: document.getElementById("forgotLink"),
    guestBtn: document.getElementById("guestBtn"),
    guestLabel: document.getElementById("guestLabel"),
    authSwitchText: document.getElementById("authSwitchText"),
    authSwitchBtn: document.getElementById("authSwitchBtn"),
    authResetForm: document.getElementById("authResetForm"),
    authResetEmail: document.getElementById("authResetEmail"),
    authResetError: document.getElementById("authResetError"),
    authResetBtn: document.getElementById("authResetBtn"),
    authResetBack: document.getElementById("authResetBack"),
    confirmModal: document.getElementById("confirmModal"),
    confirmCancel: document.getElementById("confirmCancel"),
    confirmOk: document.getElementById("confirmOk"),
    toast: document.getElementById("toast"),
    bellBtn: document.getElementById("bellBtn"),
    bellBadge: document.getElementById("bellBadge"),
    notifMenu: document.getElementById("notifMenu"),
    notifList: document.getElementById("notifList"),
    notifEmpty: document.getElementById("notifEmpty"),
    notifMarkAll: document.getElementById("notifMarkAll"),
    docGrid: document.getElementById("docGrid"),
    docModal: document.getElementById("docModal"),
    docModalClose: document.getElementById("docModalClose"),
    docModalIcon: document.getElementById("docModalIcon"),
    docModalTitle: document.getElementById("docModalTitle"),
    docModalMeta: document.getElementById("docModalMeta"),
    docModalPreview: document.getElementById("docModalPreview"),
    docModalDownload: document.getElementById("docModalDownload"),
    docModalOk: document.getElementById("docModalOk"),
    reqTbody: document.getElementById("reqTbody"),
    reqCount: document.getElementById("reqCount"),
    reqModal: document.getElementById("reqModal"),
    reqModalClose: document.getElementById("reqModalClose"),
    reqModalTitle: document.getElementById("reqModalTitle"),
    reqModalMeta: document.getElementById("reqModalMeta"),
    reqModalDesc: document.getElementById("reqModalDesc"),
    reqModalPriority: document.getElementById("reqModalPriority"),
    reqModalStatus: document.getElementById("reqModalStatus"),
    reqModalActions: document.getElementById("reqModalActions"),
    simResults: document.getElementById("simResults"),
    simResultsBody: document.getElementById("simResultsBody"),
    verdictRing: document.getElementById("verdictRing"),
    verdictValue: document.getElementById("verdictValue"),
    verdictText: document.getElementById("verdictText"),
    callModal: document.getElementById("callModal"),
    callModalClose: document.getElementById("callModalClose"),
    callForm: document.getElementById("callForm"),
    callEmail: document.getElementById("callEmail"),
    callTime: document.getElementById("callTime"),
    regModal: document.getElementById("regModal"),
    regModalClose: document.getElementById("regModalClose"),
    regModalTitle: document.getElementById("regModalTitle"),
    regModalMeta: document.getElementById("regModalMeta"),
    regModalSummary: document.getElementById("regModalSummary"),
    regModalSource: document.getElementById("regModalSource"),
    regModalOk: document.getElementById("regModalOk"),
    aiCompany: document.getElementById("aiCompany"),
    aiProduct: document.getElementById("aiProduct"),
    aiOrigin: document.getElementById("aiOrigin"),
    aiOriginRegion: document.getElementById("aiOriginRegion"),
    aiOriginRegionRow: document.getElementById("aiOriginRegionRow"),
    aiOriginRegionLabel: document.getElementById("aiOriginRegionLabel"),
    aiTarget: document.getElementById("aiTarget"),
    aiTargetRegion: document.getElementById("aiTargetRegion"),
    aiTargetRegionRow: document.getElementById("aiTargetRegionRow"),
    aiTargetRegionLabel: document.getElementById("aiTargetRegionLabel"),
    aiIndustry: document.getElementById("aiIndustry"),
    aiRunBtn: document.getElementById("aiRunBtn"),
    aiRunStatus: document.getElementById("aiRunStatus"),
    fbCompany: document.getElementById("fbCompany"),
    fbProduct: document.getElementById("fbProduct"),
    fbOrigin: document.getElementById("fbOrigin"),
    fbOriginRegion: document.getElementById("fbOriginRegion"),
    fbOriginRegionRow: document.getElementById("fbOriginRegionRow"),
    fbOriginRegionLabel: document.getElementById("fbOriginRegionLabel"),
    fbTarget: document.getElementById("fbTarget"),
    fbTargetRegion: document.getElementById("fbTargetRegion"),
    fbTargetRegionRow: document.getElementById("fbTargetRegionRow"),
    fbTargetRegionLabel: document.getElementById("fbTargetRegionLabel"),
    fbIndustry: document.getElementById("fbIndustry"),
    fbNotes: document.getElementById("fbNotes"),
    fbRunBtn: document.getElementById("fbRunBtn"),
    fbRunStatus: document.getElementById("fbRunStatus"),
    fbEmptyState: document.getElementById("fbEmptyState"),
    fbResultWrap: document.getElementById("fbResultWrap"),
    fbVerdictBanner: document.getElementById("fbVerdictBanner"),
    fbVerdictBadge: document.getElementById("fbVerdictBadge"),
    fbMode: document.getElementById("fbMode"),
    fbSummary: document.getElementById("fbSummary"),
    fbCompetition: document.getElementById("fbCompetition"),
    fbCapital: document.getElementById("fbCapital"),
    fbTimeline: document.getElementById("fbTimeline"),
    fbStrengths: document.getElementById("fbStrengths"),
    fbConcerns: document.getElementById("fbConcerns"),
    fbRisks: document.getElementById("fbRisks"),
    fbRecs: document.getElementById("fbRecs"),
    guideEmptyState: document.getElementById("guideEmptyState"),
    guideWrap: document.getElementById("guideWrap"),
    guidePhases: document.getElementById("guidePhases"),
    guideResetBtn: document.getElementById("guideResetBtn"),
    pcTarget: document.getElementById("pcTarget"),
    pcTargetRegion: document.getElementById("pcTargetRegion"),
    pcTargetRegionRow: document.getElementById("pcTargetRegionRow"),
    pcTargetRegionLabel: document.getElementById("pcTargetRegionLabel"),
    pcIndustry: document.getElementById("pcIndustry"),
    pcProduct: document.getElementById("pcProduct"),
    pcQuestion: document.getElementById("pcQuestion"),
    pcRunBtn: document.getElementById("pcRunBtn"),
    pcRunStatus: document.getElementById("pcRunStatus"),
    pcEmptyState: document.getElementById("pcEmptyState"),
    pcResultWrap: document.getElementById("pcResultWrap"),
    pcTopic: document.getElementById("pcTopic"),
    pcMode: document.getElementById("pcMode"),
    pcAnswer: document.getElementById("pcAnswer"),
    pcObligations: document.getElementById("pcObligations"),
    pcWatchouts: document.getElementById("pcWatchouts"),
    pcFollowUp: document.getElementById("pcFollowUp"),
    bhEmptyState: document.getElementById("bhEmptyState"),
    bhWrap: document.getElementById("bhWrap"),
    bhStatsRow: document.getElementById("bhStatsRow"),
    bhBars: document.getElementById("bhBars"),
    bhSignals: document.getElementById("bhSignals"),
    bhGrade: document.getElementById("bhGrade"),
    bhStatusLabel: document.getElementById("bhStatusLabel"),
    bhRefreshBtn: document.getElementById("bhRefreshBtn"),
    dcEmptyState: document.getElementById("dcEmptyState"),
    dcWrap: document.getElementById("dcWrap"),
    dcRows: document.getElementById("dcRows"),
    dcGaugeCanvas: document.getElementById("dcGaugeCanvas"),
    dcCoverageLabel: document.getElementById("dcCoverageLabel"),
    dcTemplateModal: document.getElementById("dcTemplateModal"),
    dcTplTitle: document.getElementById("dcTplTitle"),
    dcTplMode: document.getElementById("dcTplMode"),
    dcTplPre: document.getElementById("dcTplPre"),
    dcTplCopy: document.getElementById("dcTplCopy"),
    dcTplOk: document.getElementById("dcTplOk"),
    dcTplClose: document.getElementById("dcTplClose"),
    cfEmptyState: document.getElementById("cfEmptyState"),
    cfWrap: document.getElementById("cfWrap"),
    cfRoles: document.getElementById("cfRoles"),
    cfCopyBrief: document.getElementById("cfCopyBrief"),
    ihEmptyState: document.getElementById("ihEmptyState"),
    ihWrap: document.getElementById("ihWrap"),
    ihStatsRow: document.getElementById("ihStatsRow"),
    ihAsks: document.getElementById("ihAsks"),
    ihGaugeCanvas: document.getElementById("ihGaugeCanvas"),
    ihGenBrief: document.getElementById("ihGenBrief"),
    ihStatus: document.getElementById("ihStatus"),
    ihBriefCard: document.getElementById("ihBriefCard"),
    ihBriefMode: document.getElementById("ihBriefMode"),
    ihBriefPre: document.getElementById("ihBriefPre"),
    ihBriefCopy: document.getElementById("ihBriefCopy"),
    historyList: document.getElementById("historyList"),
    historyRefreshBtn: document.getElementById("historyRefreshBtn"),
    historyDetailCard: document.getElementById("historyDetailCard"),
    historyDetailTitle: document.getElementById("historyDetailTitle"),
    historyDetailClose: document.getElementById("historyDetailClose"),
    historyMessages: document.getElementById("historyMessages"),
    assistantLog: document.getElementById("aiChatLog"),
    assistantDocChips: document.getElementById("aiDocChips"),
    assistantInput: document.getElementById("aiChatInput"),
    assistantSendBtn: document.getElementById("aiSendBtn"),
    assistantDocBtn: document.getElementById("aiDocBtn"),
    assistantDocInput: document.getElementById("aiDocInput"),
    assistantClearBtn: document.getElementById("aiChatClear"),
  };

  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  const DEFAULT_SETTINGS = {
    lang: "en",
    density: "comfortable",
    theme: "light",
    enterToSend: true,
    autoScroll: true,
    rememberConversations: true,
    storeLocally: true,
  };
  const SETTINGS_KEY = "aurora.settings";

  let user = null;
  let pendingAuthIntent = null;
  let settings = { ...DEFAULT_SETTINGS };
  let currentView = "dashboard";
  let chats = [];
  let commandsEnabled = false;

  const GUEST_KEY = "aurora.guest";
  function isGuestMode() {
    try {
      return localStorage.getItem(GUEST_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setGuestMode(on) {
    try {
      if (on) localStorage.setItem(GUEST_KEY, "1");
      else localStorage.removeItem(GUEST_KEY);
    } catch {}
  }
  function guestUser() {
    return { id: "guest", name: t("profile.guest"), email: "", guest: true, photoURL: "" };
  }

  function loadSettings() {
    let merged = { ...DEFAULT_SETTINGS };
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (parsed && typeof parsed === "object") merged = { ...merged, ...parsed };
    } catch {}
    return merged;
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
    if (user && !user.guest) {
      api("/api/settings", {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify(settings),
      }).catch(() => {});
    }
  }

  function applySettings() {
    if (els.setAppLang) renderSettingsLang();
    if (els.setAppLang) els.setAppLang.value = settings.lang;
    if (els.setDensity) els.setDensity.value = settings.density;
    els.body.classList.toggle("density-compact", settings.density === "compact");
    els.body.classList.toggle("density-spacious", settings.density === "spacious");
    if (settings.theme === "dark") els.body.classList.add("dark");
    else els.body.classList.remove("dark");
    syncThemeSeg(settings.theme);
    applyI18n();
    updateAccountUI();
  }

  /* ───────── i18n ───────── */
  const I18N = {
    en: {
      "nav.dashboard": "Dashboard",
      "settings.title": "Settings",
      "settings.general": "General",
      "settings.language": "Language",
      "settings.density": "Density",
      "settings.theme": "Theme",
      "settings.theme.light": "Light",
      "settings.theme.dark": "Dark",
      "settings.account": "Account",
      "settings.signedInAs": "Signed in as",
      "settings.notSignedIn": "Not signed in",
      "settings.signIn": "Sign in",
      "settings.signOut": "Sign out",
      "settings.aiEngine": "AI engine",
      "settings.checking": "Checking…",
      "settings.aiConnected": "Connected · {model}",
      "settings.aiDisconnected": "Configured but unreachable",
      "settings.aiNotConfigured": "AI engine not configured",
      "settings.aiConnError": "Could not reach the AI engine",
      "settings.aiRetryHint": "Check your configuration and retry",
      "settings.retry": "Retry",
      "settings.clearMemory": "Clear memory",
      "settings.memoryAlreadyEmpty": "Nothing to clear — no saved conversations.",
      "settings.memoryCleared": "Conversation memory cleared.",
      "settings.memoryClearError": "Could not clear memory. Please try again.",
      "profile.title": "Profile",
      "profile.guest": "Guest",
      "confirm.title": "Clear conversation memory?",
      "confirm.text": "This permanently deletes all of your conversations from this device and account. This can't be undone.",
      "confirm.cancel": "Cancel",
      "confirm.clear": "Clear memory",
      "auth.close": "Close",
      "auth.welcomeBack": "Welcome back",
      "auth.loginSub": "Sign in to continue",
      "auth.createAccount": "Create account",
      "auth.createAccountSub": "Set up your ReguLens account",
      "auth.login": "Sign in",
      "auth.signup": "Create account",
      "auth.name": "Name",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.forgotPassword": "Forgot password?",
      "auth.noAccount": "Don't have an account?",
      "auth.haveAccount": "Already have an account?",
      "auth.or": "OR",
      "auth.continueGuest": "Continue as Guest",
      "auth.signingIn": "Signing in…",
      "auth.signingUp": "Creating account…",
      "auth.creatingAccount": "Creating account…",
      "auth.requiredError": "Please fill in all fields.",
      "auth.sendReset": "Send reset link",
      "auth.backToSignIn": "Back to sign in",
      "auth.resetSent": "Password reset email sent.",
      "auth.signedIn": "Signed in as {email}",
      "auth.signedOut": "Signed out",
      "auth.guestSignedIn": "Continuing as Guest",
      "auth.welcome": "Welcome, {name}",
      "auth.error.invalidEmail": "Please enter a valid email address.",
      "auth.error.weakPassword": "Password must be at least 6 characters.",
      "auth.error.userNotFound": "No account found with this email.",
      "auth.error.invalidCredential": "Incorrect email or password.",
      "auth.error.emailInUse": "An account with this email already exists.",
      "auth.error.network": "Network error. Please check your connection.",
      "auth.error.popupClosed": "Sign-in window was closed.",
      "auth.error.popupBlocked": "Pop-up blocked. Allow pop-ups to sign in.",
      "auth.error.operationNotAllowed": "This sign-in method is not enabled.",
      "auth.error.guestNotEnabled": "Guest sign-in is not enabled.",
      "auth.error.tooManyRequests": "Too many attempts. Please try again later.",
      "auth.error.userDisabled": "This account has been disabled.",
      "auth.error.configError": "Authentication is not configured correctly.",
      "auth.error.generic": "Something went wrong. Please try again.",
      "auth.error.notConfigured": "ReguLens is not configured for authentication yet.",
      "notif.title": "Notifications",
      "notif.markAll": "Mark all read",
      "notif.empty": "You're all caught up",
      "doc.download": "Download",
      "doc.close": "Close",
      "doc.previewNone": "No preview available for this file type.",
      "doc.uploaded": "Uploaded “{name}” to the Document Library",
      "doc.uploadedCount": "{n} documents in library",
      "req.priority": "Priority",
      "req.status": "Status",
      "req.reopen": "Reopen",
      "req.inProgress": "Mark In Progress",
      "req.complete": "Mark Complete",
      "req.done": "Completed",
      "req.pending": "Pending",
      "req.progress": "In Progress",
      "req.critical": "Critical",
      "req.important": "Important",
      "req.standard": "Standard",
      "req.count": "{n} shown",
      "sim.results": "Simulation Results",
      "sim.running": "Running simulation…",
      "sim.done": "Done",
      "sim.reqs": "Requirements added",
      "sim.cost": "Estimated cost impact",
      "sim.days": "Timeline impact",
      "call.title": "Book a call",
      "call.sub": "Tell us how to reach you and our compliance expert will confirm a slot.",
      "call.email": "Your email",
      "call.time": "Preferred time",
      "call.invalid": "Please enter a valid email",
      "call.sent": "Request sent! Our expert will reach out shortly.",
      "rpt.title": "Market Readiness & Regulatory Compliance Report",
      "rpt.generated": "Generated by ReguLens",
      "rpt.aiGenerated": "AI-Generated Analysis",
      "rpt.regulatorySource": "Regulatory Source",
      "rpt.userInput": "User-Provided Information",
      "rpt.executiveSummary": "Executive Summary",
      "rpt.companyProfile": "Company Profile",
      "rpt.productProfile": "Product Profile",
      "rpt.sourceMarket": "Source Market",
      "rpt.targetMarket": "Target Market",
      "rpt.applicableRegulations": "Applicable Regulations",
      "rpt.complianceRequirements": "Compliance Requirements",
      "rpt.completedReqs": "Completed Requirements",
      "rpt.pendingReqs": "Pending Requirements",
      "rpt.complianceGaps": "Compliance Gaps",
      "rpt.riskAssessment": "Risk Assessment",
      "rpt.businessImpact": "Business Impact",
      "rpt.estimatedCost": "Estimated Cost",
      "rpt.estimatedTimeline": "Estimated Timeline",
      "rpt.actionPlan": "Recommended Action Plan",
      "rpt.readinessScore": "Market Readiness Score",
      "rpt.launchRecommendation": "Launch Recommendation",
      "rpt.regulatorySources": "Regulatory Sources",
      "rpt.timestamp": "Analysis Timestamp",
      "rpt.noData": "No analysis data available. Run a launch analysis first.",
      "rpt.generating": "Generating report...",
      "rpt.failed": "Report generation failed. Please try again.",
      "rpt.retry": "Retry",
      "rpt.download": "Download Report",
      "rpt.print": "Print / Save as PDF",
      "rpt.close": "Close",
      "rpt.company": "Company",
      "rpt.product": "Product",
      "rpt.origin": "Origin Country",
      "rpt.target": "Target Market",
      "rpt.industry": "Industry",
      "rpt.priority": "Priority",
      "rpt.status": "Status",
      "rpt.authority": "Authority",
      "rpt.dueDate": "Due Date",
      "rpt.description": "Description",
      "rpt.totalCost": "Total Estimated Cost",
      "rpt.totalTime": "Total Estimated Time",
      "rpt.riskLevel": "Risk Level",
      "rpt.gaps": "Open Gaps",
      "rpt.critical": "Critical",
      "rpt.important": "Important",
      "rpt.standard": "Standard",
      "rpt.pending": "Pending",
      "rpt.inProgress": "In Progress",
      "rpt.done": "Completed",
      "rpt.notApplicable": "Not Applicable",
      "rpt.action": "Action",
      "rpt.estimatedDays": "Estimated Days",
      "rpt.estimatedEur": "Estimated Cost (EUR)",
      "rpt.owner": "Responsible Party",
      "rpt.category": "Category",
      "rpt.source": "Source",
      "rpt.code": "Reference Code",
      "rpt.date": "Date",
      "rpt.kind": "Type",
      "rpt.summary": "Summary",
      "rpt.proceed": "Proceed with Launch",
      "rpt.conditional": "Conditional Launch",
      "rpt.delay": "Delay Launch",
      "rpt.prerequisites": "Prerequisites",
      "rpt.verdict": "Verdict",
      "rpt.timeline": "Timeline to Full Readiness",
      "rpt.disclaimer": "This report contains AI-generated analysis based on regulatory intelligence data. Regulatory information should be verified with official sources before making business decisions. ReguLens does not guarantee the completeness or accuracy of regulatory data.",
      "rpt.page": "Page",
      "rpt.of": "of",
      "disclaimer.dashboard": "ReguLens provides regulatory intelligence and decision support; final legal/compliance decisions should be verified with qualified professionals or authoritative regulatory sources.",
      "ai.agents": "Agents",
      "ai.completed": "Completed",
      "ai.failed": "Failed",
      "ai.totalTime": "Total Time",
      "ai.pending": "Pending",
      "ai.running": "Running",
      "ai.completedStatus": "Completed",
      "ai.failedStatus": "Failed",
      "ai.input": "Input",
      "ai.output": "Output",
      "ai.sources": "Sources",
      "ai.retry": "Retry",
      "ai.emptyTitle": "No Agent Activity",
      "ai.emptyDesc": "Run a launch analysis from the <strong>Can I Launch?</strong> page to activate the multi-agent intelligence pipeline.",
      "ai.startAnalysis": "Start Analysis",
      "ai.objective": "Objective",
      "ai.keyFindings": "Key Findings",
      "ai.metrics": "Metrics",
      "ai.confidence": "Confidence",
      "ai.businessImpact": "Business Impact",
      "ai.recommendations": "Recommendations",
      "ai.findings": "Detailed Findings",
      "ai.phases": "Implementation Phases",
    },
    es: {
      "nav.dashboard": "Panel",
      "settings.title": "Ajustes",
      "settings.general": "General",
      "settings.language": "Idioma",
      "settings.density": "Densidad",
      "settings.theme": "Tema",
      "settings.theme.light": "Claro",
      "settings.theme.dark": "Oscuro",
      "settings.account": "Cuenta",
      "settings.signedInAs": "Sesión iniciada como",
      "settings.notSignedIn": "No has iniciado sesión",
      "settings.signIn": "Iniciar sesión",
      "settings.signOut": "Cerrar sesión",
      "settings.aiEngine": "Motor de IA",
      "settings.checking": "Comprobando…",
      "settings.aiConnected": "Conectado · {model}",
      "settings.aiDisconnected": "Configurado pero inaccesible",
      "settings.aiNotConfigured": "Motor de IA no configurado",
      "settings.aiConnError": "No se pudo conectar con el motor de IA",
      "settings.aiRetryHint": "Revisa tu configuración e inténtalo de nuevo",
      "settings.retry": "Reintentar",
      "settings.clearMemory": "Borrar memoria",
      "settings.memoryAlreadyEmpty": "No hay nada que borrar.",
      "settings.memoryCleared": "Memoria de conversaciones borrada.",
      "settings.memoryClearError": "No se pudo borrar la memoria.",
      "profile.title": "Perfil",
      "profile.guest": "Invitado",
      "confirm.title": "¿Borrar la memoria de conversaciones?",
      "confirm.text": "Esto eliminará permanentemente todas tus conversaciones. No se puede deshacer.",
      "confirm.cancel": "Cancelar",
      "confirm.clear": "Borrar memoria",
      "auth.close": "Cerrar",
      "auth.welcomeBack": "Bienvenido de nuevo",
      "auth.loginSub": "Inicia sesión para continuar",
      "auth.createAccount": "Crear cuenta",
      "auth.createAccountSub": "Crea tu cuenta de ReguLens",
      "auth.login": "Iniciar sesión",
      "auth.signup": "Crear cuenta",
      "auth.name": "Nombre",
      "auth.email": "Correo",
      "auth.password": "Contraseña",
      "auth.forgotPassword": "¿Olvidaste tu contraseña?",
      "auth.noAccount": "¿No tienes cuenta?",
      "auth.haveAccount": "¿Ya tienes cuenta?",
      "auth.or": "O",
      "auth.continueGuest": "Continuar como invitado",
      "auth.signingIn": "Iniciando sesión…",
      "auth.signingUp": "Creando cuenta…",
      "auth.creatingAccount": "Creando cuenta…",
      "auth.requiredError": "Completa todos los campos.",
      "auth.sendReset": "Enviar enlace de recuperación",
      "auth.backToSignIn": "Volver al inicio de sesión",
      "auth.resetSent": "Correo de recuperación enviado.",
      "auth.signedIn": "Sesión iniciada como {email}",
      "auth.signedOut": "Sesión cerrada",
      "auth.guestSignedIn": "Continuando como invitado",
      "auth.welcome": "Bienvenido, {name}",
      "auth.error.invalidEmail": "Introduce un correo válido.",
      "auth.error.weakPassword": "La contraseña debe tener al menos 6 caracteres.",
      "auth.error.userNotFound": "No hay ninguna cuenta con este correo.",
      "auth.error.invalidCredential": "Correo o contraseña incorrectos.",
      "auth.error.emailInUse": "Ya existe una cuenta con este correo.",
      "auth.error.network": "Error de red. Comprueba tu conexión.",
      "auth.error.popupClosed": "La ventana de inicio de sesión se cerró.",
      "auth.error.popupBlocked": "Bloquea emergentes bloqueadas.",
      "auth.error.operationNotAllowed": "Este método de inicio de sesión no está habilitado.",
      "auth.error.guestNotEnabled": "El acceso de invitado no está habilitado.",
      "auth.error.tooManyRequests": "Demasiados intentos. Inténtalo más tarde.",
      "auth.error.userDisabled": "Esta cuenta ha sido deshabilitada.",
      "auth.error.configError": "La autenticación no está configurada correctamente.",
      "auth.error.generic": "Algo salió mal. Inténtalo de nuevo.",
      "auth.error.notConfigured": "ReguLens no está configurado para autenticación.",
      "notif.title": "Notificaciones",
      "notif.markAll": "Marcar como leídas",
      "notif.empty": "Estás al día",
      "doc.download": "Descargar",
      "doc.close": "Cerrar",
      "doc.previewNone": "No hay vista previa para este tipo de archivo.",
      "doc.uploaded": "Subido “{name}” a la biblioteca de documentos",
      "doc.uploadedCount": "{n} documentos en la biblioteca",
      "req.priority": "Prioridad",
      "req.status": "Estado",
      "req.reopen": "Reabrir",
      "req.inProgress": "Marcar en curso",
      "req.complete": "Marcar completado",
      "req.done": "Completado",
      "req.pending": "Pendiente",
      "req.progress": "En curso",
      "req.critical": "Crítico",
      "req.important": "Importante",
      "req.standard": "Estándar",
      "req.count": "{n} mostrados",
      "sim.results": "Resultados de la simulación",
      "sim.running": "Ejecutando simulación…",
      "sim.done": "Listo",
      "sim.reqs": "Requisitos añadidos",
      "sim.cost": "Impacto en el coste estimado",
      "sim.days": "Impacto en el plazo",
      "call.title": "Reservar una llamada",
      "call.sub": "Indícanos cómo contactarte y un experto confirmará una cita.",
      "call.email": "Tu correo",
      "call.time": "Horario preferido",
      "call.invalid": "Introduce un correo válido",
      "call.sent": "Solicitud enviada. Te contactaremos pronto.",
      "rpt.title": "Informe de Preparación de Mercado y Cumplimiento Normativo",
      "rpt.generated": "Generado por ReguLens",
      "rpt.aiGenerated": "Análisis Generado por IA",
      "rpt.regulatorySource": "Fuente Regulatoria",
      "rpt.userInput": "Información Proporcionada por el Usuario",
      "rpt.executiveSummary": "Resumen Ejecutivo",
      "rpt.companyProfile": "Perfil de la Empresa",
      "rpt.productProfile": "Perfil del Producto",
      "rpt.sourceMarket": "Mercado de Origen",
      "rpt.targetMarket": "Mercado Objetivo",
      "rpt.applicableRegulations": "Regulaciones Aplicables",
      "rpt.complianceRequirements": "Requisitos de Cumplimiento",
      "rpt.completedReqs": "Requisitos Completados",
      "rpt.pendingReqs": "Requisitos Pendientes",
      "rpt.complianceGaps": "Brechas de Cumplimiento",
      "rpt.riskAssessment": "Evaluación de Riesgos",
      "rpt.businessImpact": "Impacto en el Negocio",
      "rpt.estimatedCost": "Costo Estimado",
      "rpt.estimatedTimeline": "Cronograma Estimado",
      "rpt.actionPlan": "Plan de Acción Recomendado",
      "rpt.readinessScore": "Puntuación de Preparación del Mercado",
      "rpt.launchRecommendation": "Recomendación de Lanzamiento",
      "rpt.regulatorySources": "Fuentes Regulatorias",
      "rpt.timestamp": "Fecha del Análisis",
      "rpt.noData": "No hay datos de análisis disponibles. Ejecute un análisis de lanzamiento primero.",
      "rpt.generating": "Generando informe...",
      "rpt.failed": "Error al generar el informe. Intente de nuevo.",
      "rpt.retry": "Reintentar",
      "rpt.download": "Descargar Informe",
      "rpt.print": "Imprimir / Guardar como PDF",
      "rpt.close": "Cerrar",
      "rpt.company": "Empresa",
      "rpt.product": "Producto",
      "rpt.origin": "País de Origen",
      "rpt.target": "Mercado Objetivo",
      "rpt.industry": "Industria",
      "rpt.priority": "Prioridad",
      "rpt.status": "Estado",
      "rpt.authority": "Autoridad",
      "rpt.dueDate": "Fecha de Vencimiento",
      "rpt.description": "Descripción",
      "rpt.totalCost": "Costo Total Estimado",
      "rpt.totalTime": "Tiempo Total Estimado",
      "rpt.riskLevel": "Nivel de Riesgo",
      "rpt.gaps": "Brechas Abiertas",
      "rpt.critical": "Crítico",
      "rpt.important": "Importante",
      "rpt.standard": "Estándar",
      "rpt.pending": "Pendiente",
      "rpt.inProgress": "En Progreso",
      "rpt.done": "Completado",
      "rpt.notApplicable": "No Aplicable",
      "rpt.action": "Acción",
      "rpt.estimatedDays": "Días Estimados",
      "rpt.estimatedEur": "Costo Estimado (EUR)",
      "rpt.owner": "Parte Responsable",
      "rpt.category": "Categoría",
      "rpt.source": "Fuente",
      "rpt.code": "Código de Referencia",
      "rpt.date": "Fecha",
      "rpt.kind": "Tipo",
      "rpt.summary": "Resumen",
      "rpt.proceed": "Proceder con el Lanzamiento",
      "rpt.conditional": "Lanzamiento Condicional",
      "rpt.delay": "Retrasar el Lanzamiento",
      "rpt.prerequisites": "Prerrequisitos",
      "rpt.verdict": "Veredicto",
      "rpt.timeline": "Cronograma para Preparación Completa",
      "rpt.disclaimer": "Este informe contiene análisis generado por IA basado en datos de inteligencia regulatoria. La información regulatoria debe verificarse con fuentes oficiales antes de tomar decisiones comerciales. ReguLens no garantiza la exactitud de los datos regulatorios.",
      "rpt.page": "Página",
      "rpt.of": "de",
      "disclaimer.dashboard": "ReguLens proporciona inteligencia regulatoria y soporte de decisión; las decisiones legales/de cumplimiento finales deben ser verificadas con profesionales calificados o fuentes regulatorias autorizadas.",
      "ai.agents": "Agentes",
      "ai.completed": "Completados",
      "ai.failed": "Fallidos",
      "ai.totalTime": "Tiempo Total",
      "ai.pending": "Pendiente",
      "ai.running": "Ejecutando",
      "ai.completedStatus": "Completado",
      "ai.failedStatus": "Fallido",
      "ai.input": "Entrada",
      "ai.output": "Salida",
      "ai.sources": "Fuentes",
      "ai.retry": "Reintentar",
      "ai.emptyTitle": "Sin Actividad de Agentes",
      "ai.emptyDesc": "Ejecute un análisis de lanzamiento desde la página <strong>¿Puedo Lanzar?</strong> para activar el pipeline de inteligencia multi-agente.",
      "ai.startAnalysis": "Iniciar Análisis",
    },
    fr: {
      "nav.dashboard": "Tableau de bord",
      "settings.title": "Paramètres",
      "settings.general": "Général",
      "settings.language": "Langue",
      "settings.density": "Densité",
      "settings.theme": "Thème",
      "settings.theme.light": "Clair",
      "settings.theme.dark": "Sombre",
      "settings.account": "Compte",
      "settings.signedInAs": "Connecté en tant que",
      "settings.notSignedIn": "Non connecté",
      "settings.signIn": "Se connecter",
      "settings.signOut": "Se déconnecter",
      "settings.aiEngine": "Moteur IA",
      "settings.checking": "Vérification…",
      "settings.aiConnected": "Connecté · {model}",
      "settings.aiDisconnected": "Configuré mais inaccessible",
      "settings.aiNotConfigured": "Moteur IA non configuré",
      "settings.aiConnError": "Impossible de joindre le moteur IA",
      "settings.aiRetryHint": "Vérifiez la configuration et réessayez",
      "settings.retry": "Réessayer",
      "settings.clearMemory": "Effacer la mémoire",
      "settings.memoryAlreadyEmpty": "Rien à effacer.",
      "settings.memoryCleared": "Mémoire des conversations effacée.",
      "settings.memoryClearError": "Impossible d'effacer la mémoire.",
      "profile.title": "Profil",
      "profile.guest": "Invité",
      "confirm.title": "Effacer la mémoire des conversations ?",
      "confirm.text": "Cela supprimera définitivement toutes vos conversations. Impossible d'annuler.",
      "confirm.cancel": "Annuler",
      "confirm.clear": "Effacer la mémoire",
      "auth.close": "Fermer",
      "auth.welcomeBack": "Bon retour",
      "auth.loginSub": "Connectez-vous pour continuer",
      "auth.createAccount": "Créer un compte",
      "auth.createAccountSub": "Créez votre compte ReguLens",
      "auth.login": "Se connecter",
      "auth.signup": "Créer un compte",
      "auth.name": "Nom",
      "auth.email": "E-mail",
      "auth.password": "Mot de passe",
      "auth.forgotPassword": "Mot de passe oublié ?",
      "auth.noAccount": "Pas encore de compte ?",
      "auth.haveAccount": "Déjà un compte ?",
      "auth.or": "OU",
      "auth.continueGuest": "Continuer en invité",
      "auth.signingIn": "Connexion…",
      "auth.signingUp": "Création du compte…",
      "auth.creatingAccount": "Création du compte…",
      "auth.requiredError": "Veuillez remplir tous les champs.",
      "auth.sendReset": "Envoyer le lien de réinitialisation",
      "auth.backToSignIn": "Retour à la connexion",
      "auth.resetSent": "E-mail de réinitialisation envoyé.",
      "auth.signedIn": "Connecté en tant que {email}",
      "auth.signedOut": "Déconnecté",
      "auth.guestSignedIn": "Continuer en invité",
      "auth.welcome": "Bienvenue, {name}",
      "auth.error.invalidEmail": "Veuillez saisir un e-mail valide.",
      "auth.error.weakPassword": "Le mot de passe doit comporter au moins 6 caractères.",
      "auth.error.userNotFound": "Aucun compte avec cet e-mail.",
      "auth.error.invalidCredential": "E-mail ou mot de passe incorrect.",
      "auth.error.emailInUse": "Un compte existe déjà avec cet e-mail.",
      "auth.error.network": "Erreur réseau. Vérifiez votre connexion.",
      "auth.error.popupClosed": "La fenêtre de connexion a été fermée.",
      "auth.error.popupBlocked": "Les pop-ups sont bloquées.",
      "auth.error.operationNotAllowed": "Cette méthode de connexion n'est pas activée.",
      "auth.error.guestNotEnabled": "L'accès invité n'est pas activé.",
      "auth.error.tooManyRequests": "Trop de tentatives. Réessayez plus tard.",
      "auth.error.userDisabled": "Ce compte a été désactivé.",
      "auth.error.configError": "L'authentification n'est pas configurée correctement.",
      "auth.error.generic": "Une erreur est survenue. Réessayez.",
      "auth.error.notConfigured": "ReguLens n'est pas configuré pour l'authentification.",
      "notif.title": "Notifications",
      "notif.markAll": "Tout marquer comme lu",
      "notif.empty": "Vous êtes à jour",
      "doc.download": "Télécharger",
      "doc.close": "Fermer",
      "doc.previewNone": "Aucun aperçu disponible pour ce type de fichier.",
      "doc.uploaded": "« {name} » ajouté à la bibliothèque de documents",
      "doc.uploadedCount": "{n} documents dans la bibliothèque",
      "req.priority": "Priorité",
      "req.status": "Statut",
      "req.reopen": "Rouvrir",
      "req.inProgress": "Marquer en cours",
      "req.complete": "Marquer comme terminé",
      "req.done": "Terminé",
      "req.pending": "En attente",
      "req.progress": "En cours",
      "req.critical": "Critique",
      "req.important": "Important",
      "req.standard": "Standard",
      "req.count": "{n} affichés",
      "sim.results": "Résultats de la simulation",
      "sim.running": "Simulation en cours…",
      "sim.done": "Terminé",
      "sim.reqs": "Exigences ajoutées",
      "sim.cost": "Impact estimé sur les coûts",
      "sim.days": "Impact sur le calendrier",
      "call.title": "Réserver un appel",
      "call.sub": "Indiquez-nous comment vous joindre et un expert confirmera un créneau.",
      "call.email": "Votre e-mail",
      "call.time": "Créneau préféré",
      "call.invalid": "Veuillez saisir un e-mail valide",
      "call.sent": "Demande envoyée ! Un expert vous contactera bientôt.",
      "rpt.title": "Rapport de Préparation de Marché et Conformité Réglementaire",
      "rpt.generated": "Généré par ReguLens",
      "rpt.aiGenerated": "Analyse Générée par IA",
      "rpt.regulatorySource": "Source Réglementaire",
      "rpt.userInput": "Informations Fournies par l'Utilisateur",
      "rpt.executiveSummary": "Résumé Exécutif",
      "rpt.companyProfile": "Profil de l'Entreprise",
      "rpt.productProfile": "Profil du Produit",
      "rpt.sourceMarket": "Marché d'Origine",
      "rpt.targetMarket": "Marché Cible",
      "rpt.applicableRegulations": "Réglementations Applicables",
      "rpt.complianceRequirements": "Exigences de Conformité",
      "rpt.completedReqs": "Exigences Accomplies",
      "rpt.pendingReqs": "Exigences en Attente",
      "rpt.complianceGaps": "Écarts de Conformité",
      "rpt.riskAssessment": "Évaluation des Risques",
      "rpt.businessImpact": "Impact Commercial",
      "rpt.estimatedCost": "Coût Estimé",
      "rpt.estimatedTimeline": "Calendrier Estimé",
      "rpt.actionPlan": "Plan d'Action Recommandé",
      "rpt.readinessScore": "Score de Préparation du Marché",
      "rpt.launchRecommendation": "Recommandation de Lancement",
      "rpt.regulatorySources": "Sources Réglementaires",
      "rpt.timestamp": "Horodatage de l'Analyse",
      "rpt.noData": "Aucune donnée d'analyse disponible. Lancez d'abord une analyse de marché.",
      "rpt.generating": "Génération du rapport...",
      "rpt.failed": "Échec de la génération du rapport. Veuillez réessayer.",
      "rpt.retry": "Réessayer",
      "rpt.download": "Télécharger le Rapport",
      "rpt.print": "Imprimer / Enregistrer en PDF",
      "rpt.close": "Fermer",
      "rpt.company": "Entreprise",
      "rpt.product": "Produit",
      "rpt.origin": "Pays d'Origine",
      "rpt.target": "Marché Cible",
      "rpt.industry": "Secteur",
      "rpt.priority": "Priorité",
      "rpt.status": "Statut",
      "rpt.authority": "Autorité",
      "rpt.dueDate": "Date d'Échéance",
      "rpt.description": "Description",
      "rpt.totalCost": "Coût Total Estimé",
      "rpt.totalTime": "Temps Total Estimé",
      "rpt.riskLevel": "Niveau de Risque",
      "rpt.gaps": "Écarts Ouverts",
      "rpt.critical": "Critique",
      "rpt.important": "Important",
      "rpt.standard": "Standard",
      "rpt.pending": "En Attente",
      "rpt.inProgress": "En Cours",
      "rpt.done": "Terminé",
      "rpt.notApplicable": "Non Applicable",
      "rpt.action": "Action",
      "rpt.estimatedDays": "Jours Estimés",
      "rpt.estimatedEur": "Coût Estimé (EUR)",
      "rpt.owner": "Partie Responsable",
      "rpt.category": "Catégorie",
      "rpt.source": "Source",
      "rpt.code": "Code de Référence",
      "rpt.date": "Date",
      "rpt.kind": "Type",
      "rpt.summary": "Résumé",
      "rpt.proceed": "Procéder au Lancement",
      "rpt.conditional": "Lancement Conditionnel",
      "rpt.delay": "Reporter le Lancement",
      "rpt.prerequisites": "Prérequis",
      "rpt.verdict": "Verdict",
      "rpt.timeline": "Calendrier de Préparation Complète",
      "rpt.disclaimer": "Ce rapport contient une analyse générée par IA basée sur des données de veille réglementaire. Les informations réglementaires doivent être vérifiées auprès de sources officielles avant de prendre des décisions commerciales. ReguLens ne garantit pas l'exactitude des données réglementaires.",
      "rpt.page": "Page",
      "rpt.of": "sur",
      "disclaimer.dashboard": "ReguLens fournit des informations réglementaires et un soutien à la décision ; les décisions juridiques/de conformité définitives doivent être vérifiées par des professionnels qualifiés ou des sources réglementaires officielles.",
      "ai.agents": "Agents",
      "ai.completed": "Terminés",
      "ai.failed": "Échoués",
      "ai.totalTime": "Temps Total",
      "ai.pending": "En attente",
      "ai.running": "En cours",
      "ai.completedStatus": "Terminé",
      "ai.failedStatus": "Échoué",
      "ai.input": "Entrée",
      "ai.output": "Sortie",
      "ai.sources": "Sources",
      "ai.retry": "Réessayer",
      "ai.emptyTitle": "Aucune Activité d'Agent",
      "ai.emptyDesc": "Lancez une analyse depuis la page <strong>Puis-je Lancer ?</strong> pour activer le pipeline d'intelligence multi-agents.",
      "ai.startAnalysis": "Lancer l'Analyse",
    },
    hi: {
      "nav.dashboard": "डैशबोर्ड",
      "settings.title": "सेटिंग्स",
      "settings.general": "सामान्य",
      "settings.language": "भाषा",
      "settings.density": "घनत्व",
      "settings.theme": "थीम",
      "settings.theme.light": "लाइट",
      "settings.theme.dark": "डार्क",
      "settings.account": "खाता",
      "settings.signedInAs": "इस रूप में साइन इन",
      "settings.notSignedIn": "साइन इन नहीं",
      "settings.signIn": "साइन इन करें",
      "settings.signOut": "साइन आउट करें",
      "settings.aiEngine": "AI इंजन",
      "settings.checking": "जाँच रहे हैं…",
      "settings.aiConnected": "कनेक्टेड · {model}",
      "settings.aiDisconnected": "कॉन्फ़िगर है पर अनुपलब्ध",
      "settings.aiNotConfigured": "AI इंजन कॉन्फ़िगर नहीं",
      "settings.aiConnError": "AI इंजन से संपर्क नहीं हो सका",
      "settings.aiRetryHint": "कॉन्फ़िगरेशन जाँचें और पुनः प्रयास करें",
      "settings.retry": "पुनः प्रयास",
      "settings.clearMemory": "मेमोरी साफ़ करें",
      "settings.memoryAlreadyEmpty": "साफ़ करने के लिए कुछ नहीं।",
      "settings.memoryCleared": "कन्वर्सेशन मेमोरी साफ़ की गई।",
      "settings.memoryClearError": "मेमोरी साफ़ नहीं हो सकी।",
      "profile.title": "प्रोफ़ाइल",
      "profile.guest": "अतिथि",
      "confirm.title": "कन्वर्सेशन मेमोरी साफ़ करें?",
      "confirm.text": "इससे आपकी सभी कन्वर्सेशन स्थायी रूप से हट जाएँगी। इसे पूर्ववत नहीं किया जा सकता।",
      "confirm.cancel": "रद्द करें",
      "confirm.clear": "मेमोरी साफ़ करें",
      "auth.close": "बंद करें",
      "auth.welcomeBack": "वापसी पर स्वागत है",
      "auth.loginSub": "जारी रखने के लिए साइन इन करें",
      "auth.createAccount": "खाता बनाएँ",
      "auth.createAccountSub": "अपना ReguLens खाता बनाएँ",
      "auth.login": "साइन इन करें",
      "auth.signup": "खाता बनाएँ",
      "auth.name": "नाम",
      "auth.email": "ईमेल",
      "auth.password": "पासवर्ड",
      "auth.forgotPassword": "पासवर्ड भूल गए?",
      "auth.noAccount": "खाता नहीं है?",
      "auth.haveAccount": "पहले से खाता है?",
      "auth.or": "या",
      "auth.continueGuest": "अतिथि के रूप में जारी रखें",
      "auth.signingIn": "साइन इन हो रहा है…",
      "auth.signingUp": "खाता बन रहा है…",
      "auth.creatingAccount": "खाता बन रहा है…",
      "auth.requiredError": "कृपया सभी फ़ील्ड भरें।",
      "auth.sendReset": "रीसेट लिंक भेजें",
      "auth.backToSignIn": "साइन इन पर वापस",
      "auth.resetSent": "पासवर्ड रीसेट ईमेल भेजा गया।",
      "auth.signedIn": "{email} के रूप में साइन इन",
      "auth.signedOut": "साइन आउट",
      "auth.guestSignedIn": "अतिथि के रूप में जारी",
      "auth.welcome": "स्वागत है, {name}",
      "auth.error.invalidEmail": "कृपया मान्य ईमेल दर्ज करें।",
      "auth.error.weakPassword": "पासवर्ड कम से कम 6 अक्षरों का हो।",
      "auth.error.userNotFound": "इस ईमेल से कोई खाता नहीं।",
      "auth.error.invalidCredential": "गलत ईमेल या पासवर्ड।",
      "auth.error.emailInUse": "इस ईमेल से खाता पहले से मौजूद है।",
      "auth.error.network": "नेटवर्क त्रुटि। कनेक्शन जाँचें।",
      "auth.error.popupClosed": "साइन इन विंडो बंद हो गई।",
      "auth.error.popupBlocked": "पॉप-अप ब्लॉक है।",
      "auth.error.operationNotAllowed": "यह साइन इन विधि सक्षम नहीं है।",
      "auth.error.guestNotEnabled": "अतिथि साइन इन सक्षम नहीं है।",
      "auth.error.tooManyRequests": "बहुत अधिक प्रयास। बाद में प्रयास करें।",
      "auth.error.userDisabled": "यह खाता अक्षम कर दिया गया है।",
      "auth.error.configError": "प्रमाणीकरण सही ढंग से कॉन्फ़िगर नहीं है।",
      "auth.error.generic": "कुछ गलत हुआ। पुनः प्रयास करें।",
      "auth.error.notConfigured": "ReguLens प्रमाणीकरण के लिए कॉन्फ़िगर नहीं है।",
      "notif.title": "सूचनाएँ",
      "notif.markAll": "सभी पढ़ी हुई चिह्नित करें",
      "notif.empty": "आप अप-टू-डेट हैं",
      "doc.download": "डाउनलोड",
      "doc.close": "बंद करें",
      "doc.previewNone": "इस फ़ाइल प्रकार के लिए पूर्वावलोकन उपलब्ध नहीं है।",
      "doc.uploaded": "“{name}” डॉक्यूमेंट लाइब्रेरी में अपलोड हुआ",
      "doc.uploadedCount": "लाइब्रेरी में {n} दस्तावेज़",
      "req.priority": "प्राथमिकता",
      "req.status": "स्थिति",
      "req.reopen": "फिर खोलें",
      "req.inProgress": "प्रगति पर चिह्नित करें",
      "req.complete": "पूर्ण चिह्नित करें",
      "req.done": "पूर्ण",
      "req.pending": "लंबित",
      "req.progress": "प्रगति पर",
      "req.critical": "गंभीर",
      "req.important": "महत्वपूर्ण",
      "req.standard": "मानक",
      "req.count": "{n} दिखाए गए",
      "sim.results": "सिमुलेशन परिणाम",
      "sim.running": "सिमुलेशन चल रहा है…",
      "sim.done": "पूर्ण",
      "sim.reqs": "जोड़ी गईं आवश्यकताएँ",
      "sim.cost": "अनुमानित लागत प्रभाव",
      "sim.days": "समयरेखा प्रभाव",
      "call.title": "कॉल बुक करें",
      "call.sub": "हमें अपना संपर्क बताएं और हमारा अनुपालन विशेषज्ञ स्लॉट पुष्टि करेगा।",
      "call.email": "आपका ईमेल",
      "call.time": "पसंदीदा समय",
      "call.invalid": "कृपया मान्य ईमेल दर्ज करें",
      "call.sent": "अनुरोध भेजा गया! हमारा विशेषज्ञ शीघ्र संपर्क करेगा।",
      "rpt.title": "बाज़ार तत्परता और नियामक अनुपालन रिपोर्ट",
      "rpt.generated": "ReguLens द्वारा जनरेट किया गया",
      "rpt.aiGenerated": "AI-जनरेटेड विश्लेषण",
      "rpt.regulatorySource": "नियामक स्रोत",
      "rpt.userInput": "उपयोगकर्ता द्वारा प्रदान की गई जानकारी",
      "rpt.executiveSummary": "कार्यकारी सारांश",
      "rpt.companyProfile": "कंपनी प्रोफ़ाइल",
      "rpt.productProfile": "उत्पाद प्रोफ़ाइल",
      "rpt.sourceMarket": "स्रोत बाज़ार",
      "rpt.targetMarket": "लक्ष्य बाज़ार",
      "rpt.applicableRegulations": "लागू नियम",
      "rpt.complianceRequirements": "अनुपालन आवश्यकताएँ",
      "rpt.completedReqs": "पूर्ण आवश्यकताएँ",
      "rpt.pendingReqs": "लंबित आवश्यकताएँ",
      "rpt.complianceGaps": "अनुपालन अंतर",
      "rpt.riskAssessment": "जोखिम मूल्यांकन",
      "rpt.businessImpact": "व्यापार प्रभाव",
      "rpt.estimatedCost": "अनुमानित लागत",
      "rpt.estimatedTimeline": "अनुमानित समयरेखा",
      "rpt.actionPlan": "अनुशंसित कार्य योजना",
      "rpt.readinessScore": "बाज़ार तत्परता स्कोर",
      "rpt.launchRecommendation": "लॉन्च सिफारिश",
      "rpt.regulatorySources": "नियामक स्रोत",
      "rpt.timestamp": "विश्लेषण समय",
      "rpt.noData": "कोई विश्लेषण डेटा उपलब्ध नहीं। पहले लॉन्च विश्लेषण चलाएँ।",
      "rpt.generating": "रिपोर्ट जनरेट हो रही है...",
      "rpt.failed": "रिपोर्ट जनरेट करने में विफल। कृपया पुनः प्रयास करें।",
      "rpt.retry": "पुनः प्रयास",
      "rpt.download": "रिपोर्ट डाउनलोड करें",
      "rpt.print": "प्रिंट / PDF में सहेजें",
      "rpt.close": "बंद करें",
      "rpt.company": "कंपनी",
      "rpt.product": "उत्पाद",
      "rpt.origin": "मूल देश",
      "rpt.target": "लक्ष्य बाज़ार",
      "rpt.industry": "उद्योग",
      "rpt.priority": "प्राथमिकता",
      "rpt.status": "स्थिति",
      "rpt.authority": "प्राधिकरण",
      "rpt.dueDate": "नियत तिथि",
      "rpt.description": "विवरण",
      "rpt.totalTotal": "कुल अनुमानित लागत",
      "rpt.totalTime": "कुल अनुमानित समय",
      "rpt.riskLevel": "जोखिम स्तर",
      "rpt.gaps": "खुले अंतर",
      "rpt.critical": "गंभीर",
      "rpt.important": "महत्वपूर्ण",
      "rpt.standard": "मानक",
      "rpt.pending": "लंबित",
      "rpt.inProgress": "प्रगति पर",
      "rpt.done": "पूर्ण",
      "rpt.notApplicable": "लागू नहीं",
      "rpt.action": "कार्य",
      "rpt.estimatedDays": "अनुमानित दिन",
      "rpt.estimatedEur": "अनुमानित लागत (EUR)",
      "rpt.owner": "जिम्मेदार पक्ष",
      "rpt.category": "श्रेणी",
      "rpt.source": "स्रोत",
      "rpt.code": "संदर्भ कोड",
      "rpt.date": "तिथि",
      "rpt.kind": "प्रकार",
      "rpt.summary": "सारांश",
      "rpt.proceed": "लॉन्च के साथ आगे बढ़ें",
      "rpt.conditional": "शर्तित लॉन्च",
      "rpt.delay": "लॉन्च में देरी",
      "rpt.prerequisites": "पूर्व शर्तें",
      "rpt.verdict": "निर्णय",
      "rpt.timeline": "पूर्ण तत्परता की समयरेखा",
      "rpt.disclaimer": "इस रिपोर्ट में नियामक बुद्धिमत्ता डेटा पर आधारित AI-जनरेटेड विश्लेषण शामिल है। व्यापार निर्णय लेने से पहले नियामक जानकारी को आधिकारिक स्रोतों से सत्यापित किया जाना चाहिए। ReguLens नियामक डेटा की पूर्णता या सटीकता की गारंटी नहीं देता।",
      "rpt.page": "पृष्ठ",
      "rpt.of": "का",
      "disclaimer.dashboard": "ReguLens नियामक बुद्धिमत्ता और निर्णय सहायता प्रदान करता है; अंतिम कानूनी/अनुपालन निर्णयों को योग्य पेशेवरों या अधिकृत नियामक स्रोतों से सत्यापित किया जाना चाहिए।",
      "ai.agents": "एजेंट",
      "ai.completed": "पूर्ण",
      "ai.failed": "विफल",
      "ai.totalTime": "कुल समय",
      "ai.pending": "लंबित",
      "ai.running": "चल रहा है",
      "ai.completedStatus": "पूर्ण",
      "ai.failedStatus": "विफल",
      "ai.input": "इनपुट",
      "ai.output": "आउटपुट",
      "ai.sources": "स्रोत",
      "ai.retry": "पुनर्प्रयास",
      "ai.emptyTitle": "कोई एजेंट गतिविधि नहीं",
      "ai.emptyDesc": "मल्टी-एजेंट इंटेलिजेंस पाइपलाइन को सक्रिय करने के लिए <strong>क्या मैं लॉन्च कर सकता हूँ?</strong> पृष्ठ से एक लॉन्च विश्लेषण चलाएँ।",
      "ai.startAnalysis": "विश्लेषण शुरू करें",
    },
    de: {
      "nav.dashboard": "Dashboard",
      "settings.title": "Einstellungen",
      "settings.general": "Allgemein",
      "settings.language": "Sprache",
      "settings.density": "Dichte",
      "settings.theme": "Design",
      "settings.theme.light": "Hell",
      "settings.theme.dark": "Dunkel",
      "settings.account": "Konto",
      "settings.signedInAs": "Angemeldet als",
      "settings.notSignedIn": "Nicht angemeldet",
      "settings.signIn": "Anmelden",
      "settings.signOut": "Abmelden",
      "settings.aiEngine": "KI-Engine",
      "settings.checking": "Überprüfung…",
      "settings.aiConnected": "Verbunden · {model}",
      "settings.aiDisconnected": "Konfiguriert, aber nicht erreichbar",
      "settings.aiNotConfigured": "KI-Engine nicht konfiguriert",
      "settings.aiConnError": "KI-Engine konnte nicht erreicht werden",
      "settings.aiRetryHint": "Überprüfen Sie Ihre Konfiguration und versuchen Sie es erneut",
      "settings.retry": "Erneut versuchen",
      "settings.clearMemory": "Speicher löschen",
      "settings.memoryAlreadyEmpty": "Nichts zu löschen – keine gespeicherten Konversationen.",
      "settings.memoryCleared": "Konversationsspeicher gelöscht.",
      "settings.memoryClearError": "Speicher konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
      "profile.title": "Profil",
      "profile.guest": "Gast",
      "confirm.title": "Konversationsspeicher löschen?",
      "confirm.text": "Dies löscht dauerhaft alle Ihre Konversationen von diesem Gerät und Konto. Dies kann nicht rückgängig gemacht werden.",
      "confirm.cancel": "Abbrechen",
      "confirm.clear": "Speicher löschen",
      "auth.close": "Schließen",
      "auth.welcomeBack": "Willkommen zurück",
      "auth.loginSub": "Melden Sie sich an, um fortzufahren",
      "auth.createAccount": "Konto erstellen",
      "auth.createAccountSub": "Richten Sie Ihr ReguLens-Konto ein",
      "auth.login": "Anmelden",
      "auth.signup": "Konto erstellen",
      "auth.name": "Name",
      "auth.email": "E-Mail",
      "auth.password": "Passwort",
      "auth.forgotPassword": "Passwort vergessen?",
      "auth.noAccount": "Noch kein Konto?",
      "auth.haveAccount": "Bereits ein Konto?",
      "auth.or": "ODER",
      "auth.continueGuest": "Als Gast fortfahren",
      "auth.signingIn": "Anmeldung läuft…",
      "auth.signingUp": "Konto wird erstellt…",
      "auth.creatingAccount": "Konto wird erstellt…",
      "auth.requiredError": "Bitte füllen Sie alle Felder aus.",
      "auth.sendReset": "Link zum Zurücksetzen senden",
      "auth.backToSignIn": "Zurück zur Anmeldung",
      "auth.resetSent": "E-Mail zum Zurücksetzen des Passworts gesendet.",
      "auth.signedIn": "Angemeldet als {email}",
      "auth.signedOut": "Abgemeldet",
      "auth.guestSignedIn": "Fortfahren als Gast",
      "auth.welcome": "Willkommen, {name}",
      "auth.error.invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      "auth.error.weakPassword": "Das Passwort muss mindestens 6 Zeichen lang sein.",
      "auth.error.userNotFound": "Kein Konto mit dieser E-Mail gefunden.",
      "auth.error.invalidCredential": "Falsche E-Mail oder Passwort.",
      "auth.error.emailInUse": "Ein Konto mit dieser E-Mail existiert bereits.",
      "auth.error.network": "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
      "auth.error.popupClosed": "Anmeldefenster wurde geschlossen.",
      "auth.error.popupBlocked": "Pop-up blockiert. Erlauben Sie Pop-ups zur Anmeldung.",
      "auth.error.operationNotAllowed": "Diese Anmeldemethode ist nicht aktiviert.",
      "auth.error.guestNotEnabled": "Gastanmeldung ist nicht aktiviert.",
      "auth.error.tooManyRequests": "Zu viele Versuche. Bitte versuchen Sie es später erneut.",
      "auth.error.userDisabled": "Dieses Konto wurde deaktiviert.",
      "auth.error.configError": "Die Authentifizierung ist nicht korrekt konfiguriert.",
      "auth.error.generic": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      "auth.error.notConfigured": "ReguLens ist noch nicht für die Authentifizierung konfiguriert.",
      "notif.title": "Benachrichtigungen",
      "notif.markAll": "Alle als gelesen markieren",
      "notif.empty": "Alles erledigt",
      "doc.download": "Herunterladen",
      "doc.close": "Schließen",
      "doc.previewNone": "Keine Vorschau für diesen Dateityp verfügbar.",
      "doc.uploaded": "„{name}“ in die Dokumentenbibliothek hochgeladen",
      "doc.uploadedCount": "{n} Dokumente in der Bibliothek",
      "req.priority": "Priorität",
      "req.status": "Status",
      "req.reopen": "Wieder öffnen",
      "req.inProgress": "In Bearbeitung markieren",
      "req.complete": "Als abgeschlossen markieren",
      "req.done": "Abgeschlossen",
      "req.pending": "Ausstehend",
      "req.progress": "In Bearbeitung",
      "req.critical": "Kritisch",
      "req.important": "Wichtig",
      "req.standard": "Standard",
      "req.count": "{n} angezeigt",
      "sim.results": "Simulationsergebnisse",
      "sim.running": "Simulation läuft…",
      "sim.done": "Fertig",
      "sim.reqs": "Hinzugefügte Anforderungen",
      "sim.cost": "Geschätzte Kostenwirkung",
      "sim.days": "Zeitplanwirkung",
      "call.title": "Rückruf vereinbaren",
      "call.sub": "Teilen Sie uns mit, wie wir Sie erreichen können, und unser Compliance-Experte bestätigt einen Termin.",
      "call.email": "Ihre E-Mail",
      "call.time": "Bevorzugte Zeit",
      "call.invalid": "Bitte geben Sie eine gültige E-Mail ein",
      "call.sent": "Anfrage gesendet! Unser Experte wird sich in Kürze bei Ihnen melden.",
      "rpt.title": "Marktbereitschaft & regulatorischer Compliance-Bericht",
      "rpt.generated": "Erstellt von ReguLens",
      "rpt.aiGenerated": "KI-generierte Analyse",
      "rpt.regulatorySource": "Regulatorische Quelle",
      "rpt.userInput": "Vom Benutzer bereitgestellte Informationen",
      "rpt.executiveSummary": "Zusammenfassung",
      "rpt.companyProfile": "Unternehmensprofil",
      "rpt.productProfile": "Produktprofil",
      "rpt.sourceMarket": "Herkunftsmarkt",
      "rpt.targetMarket": "Zielmarkt",
      "rpt.applicableRegulations": "Geltende Vorschriften",
      "rpt.complianceRequirements": "Compliance-Anforderungen",
      "rpt.completedReqs": "Abgeschlossene Anforderungen",
      "rpt.pendingReqs": "Ausstehende Anforderungen",
      "rpt.complianceGaps": "Compliance-Lücken",
      "rpt.riskAssessment": "Risikobewertung",
      "rpt.businessImpact": "Geschäftsauswirkung",
      "rpt.estimatedCost": "Geschätzte Kosten",
      "rpt.estimatedTimeline": "Geschätzter Zeitplan",
      "rpt.actionPlan": "Empfohlener Aktionsplan",
      "rpt.readinessScore": "Marktbereitschaftswert",
      "rpt.launchRecommendation": "Startempfehlung",
      "rpt.regulatorySources": "Regulatorische Quellen",
      "rpt.timestamp": "Analysezeitstempel",
      "rpt.noData": "Keine Analysedaten verfügbar. Führen Sie zuerst eine Launch-Analyse durch.",
      "rpt.generating": "Bericht wird erstellt...",
      "rpt.failed": "Berichtserstellung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      "rpt.retry": "Erneut versuchen",
      "rpt.download": "Bericht herunterladen",
      "rpt.print": "Drucken / Als PDF speichern",
      "rpt.close": "Schließen",
      "rpt.company": "Unternehmen",
      "rpt.product": "Produkt",
      "rpt.origin": "Herkunftsland",
      "rpt.target": "Zielmarkt",
      "rpt.industry": "Branche",
      "rpt.priority": "Priorität",
      "rpt.status": "Status",
      "rpt.authority": "Behörde",
      "rpt.dueDate": "Fälligkeitsdatum",
      "rpt.description": "Beschreibung",
      "rpt.totalCost": "Geschätzte Gesamtkosten",
      "rpt.totalTime": "Geschätzte Gesamtzeit",
      "rpt.riskLevel": "Risikostufe",
      "rpt.gaps": "Offene Lücken",
      "rpt.critical": "Kritisch",
      "rpt.important": "Wichtig",
      "rpt.standard": "Standard",
      "rpt.pending": "Ausstehend",
      "rpt.inProgress": "In Bearbeitung",
      "rpt.done": "Abgeschlossen",
      "rpt.notApplicable": "Nicht zutreffend",
      "rpt.action": "Aktion",
      "rpt.estimatedDays": "Geschätzte Tage",
      "rpt.estimatedEur": "Geschätzte Kosten (EUR)",
      "rpt.owner": "Verantwortliche Partei",
      "rpt.category": "Kategorie",
      "rpt.source": "Quelle",
      "rpt.code": "Referenzcode",
      "rpt.date": "Datum",
      "rpt.kind": "Typ",
      "rpt.summary": "Zusammenfassung",
      "rpt.proceed": "Launch fortsetzen",
      "rpt.conditional": "Bedingter Launch",
      "rpt.delay": "Launch verzögern",
      "rpt.prerequisites": "Voraussetzungen",
      "rpt.verdict": "Urteil",
      "rpt.timeline": "Zeitplan bis zur vollständigen Bereitschaft",
      "rpt.disclaimer": "Dieser Bericht enthält eine KI-generierte Analyse auf Basis von regulatorischen Intelligenzdaten. Regulatorische Informationen sollten vor Geschäftsentscheidungen mit offiziellen Quellen überprüft werden. ReguLens garantiert nicht die Vollständigkeit oder Richtigkeit regulatorischer Daten.",
      "rpt.page": "Seite",
      "rpt.of": "von",
      "disclaimer.dashboard": "ReguLens bietet regulatorische Intelligenz und Entscheidungsunterstützung; endgültige rechtliche/compliance Entscheidungen sollten mit qualifizierten Fachleuten oder maßgeblichen regulatorischen Quellen überprüft werden.",
      "ai.agents": "Agenten",
      "ai.completed": "Abgeschlossen",
      "ai.failed": "Fehlgeschlagen",
      "ai.totalTime": "Gesamtzeit",
      "ai.pending": "Ausstehend",
      "ai.running": "Läuft",
      "ai.completedStatus": "Abgeschlossen",
      "ai.failedStatus": "Fehlgeschlagen",
      "ai.input": "Eingabe",
      "ai.output": "Ausgabe",
      "ai.sources": "Quellen",
      "ai.retry": "Erneut versuchen",
      "ai.emptyTitle": "Keine Agentenaktivität",
      "ai.emptyDesc": "Führen Sie eine Launch-Analyse von der Seite <strong>Kann ich starten?</strong> aus, um die Multi-Agent-Intelligenz-Pipeline zu aktivieren.",
      "ai.startAnalysis": "Analyse starten",
    },
    pt: {
      "nav.dashboard": "Painel",
      "settings.title": "Configurações",
      "settings.general": "Geral",
      "settings.language": "Idioma",
      "settings.density": "Densidade",
      "settings.theme": "Tema",
      "settings.theme.light": "Claro",
      "settings.theme.dark": "Escuro",
      "settings.account": "Conta",
      "settings.signedInAs": "Conectado como",
      "settings.notSignedIn": "Não conectado",
      "settings.signIn": "Entrar",
      "settings.signOut": "Sair",
      "settings.aiEngine": "Motor de IA",
      "settings.checking": "Verificando…",
      "settings.aiConnected": "Conectado · {model}",
      "settings.aiDisconnected": "Configurado mas inacessível",
      "settings.aiNotConfigured": "Motor de IA não configurado",
      "settings.aiConnError": "Não foi possível acessar o motor de IA",
      "settings.aiRetryHint": "Verifique sua configuração e tente novamente",
      "settings.retry": "Tentar novamente",
      "settings.clearMemory": "Limpar memória",
      "settings.memoryAlreadyEmpty": "Nada para limpar — nenhuma conversa salva.",
      "settings.memoryCleared": "Memória de conversas limpa.",
      "settings.memoryClearError": "Não foi possível limpar a memória. Por favor, tente novamente.",
      "profile.title": "Perfil",
      "profile.guest": "Convidado",
      "confirm.title": "Limpar memória de conversas?",
      "confirm.text": "Isso exclui permanentemente todas as suas conversas deste dispositivo e conta. Esta ação não pode ser desfeita.",
      "confirm.cancel": "Cancelar",
      "confirm.clear": "Limpar memória",
      "auth.close": "Fechar",
      "auth.welcomeBack": "Bem-vindo de volta",
      "auth.loginSub": "Entre para continuar",
      "auth.createAccount": "Criar conta",
      "auth.createAccountSub": "Configure sua conta ReguLens",
      "auth.login": "Entrar",
      "auth.signup": "Criar conta",
      "auth.name": "Nome",
      "auth.email": "E-mail",
      "auth.password": "Senha",
      "auth.forgotPassword": "Esqueceu a senha?",
      "auth.noAccount": "Não tem uma conta?",
      "auth.haveAccount": "Já tem uma conta?",
      "auth.or": "OU",
      "auth.continueGuest": "Continuar como Convidado",
      "auth.signingIn": "Entrando…",
      "auth.signingUp": "Criando conta…",
      "auth.creatingAccount": "Criando conta…",
      "auth.requiredError": "Por favor, preencha todos os campos.",
      "auth.sendReset": "Enviar link de redefinição",
      "auth.backToSignIn": "Voltar ao login",
      "auth.resetSent": "E-mail de redefinição de senha enviado.",
      "auth.signedIn": "Conectado como {email}",
      "auth.signedOut": "Desconectado",
      "auth.guestSignedIn": "Continuando como Convidado",
      "auth.welcome": "Bem-vindo, {name}",
      "auth.error.invalidEmail": "Por favor, insira um endereço de e-mail válido.",
      "auth.error.weakPassword": "A senha deve ter pelo menos 6 caracteres.",
      "auth.error.userNotFound": "Nenhuma conta encontrada com este e-mail.",
      "auth.error.invalidCredential": "E-mail ou senha incorretos.",
      "auth.error.emailInUse": "Já existe uma conta com este e-mail.",
      "auth.error.network": "Erro de rede. Por favor, verifique sua conexão.",
      "auth.error.popupClosed": "A janela de login foi fechada.",
      "auth.error.popupBlocked": "Pop-up bloqueado. Permita pop-ups para fazer login.",
      "auth.error.operationNotAllowed": "Este método de login não está habilitado.",
      "auth.error.guestNotEnabled": "Login como convidado não está habilitado.",
      "auth.error.tooManyRequests": "Muitas tentativas. Por favor, tente novamente mais tarde.",
      "auth.error.userDisabled": "Esta conta foi desativada.",
      "auth.error.configError": "A autenticação não está configurada corretamente.",
      "auth.error.generic": "Algo deu errado. Por favor, tente novamente.",
      "auth.error.notConfigured": "ReguLens ainda não está configurado para autenticação.",
      "notif.title": "Notificações",
      "notif.markAll": "Marcar tudo como lido",
      "notif.empty": "Tudo em dia",
      "doc.download": "Baixar",
      "doc.close": "Fechar",
      "doc.previewNone": "Nenhuma visualização disponível para este tipo de arquivo.",
      "doc.uploaded": "„{name}“ enviado para a Biblioteca de Documentos",
      "doc.uploadedCount": "{n} documentos na biblioteca",
      "req.priority": "Prioridade",
      "req.status": "Status",
      "req.reopen": "Reabrir",
      "req.inProgress": "Marcar Em Andamento",
      "req.complete": "Marcar Concluído",
      "req.done": "Concluído",
      "req.pending": "Pendente",
      "req.progress": "Em Andamento",
      "req.critical": "Crítico",
      "req.important": "Importante",
      "req.standard": "Padrão",
      "req.count": "{n} exibidos",
      "sim.results": "Resultados da Simulação",
      "sim.running": "Executando simulação…",
      "sim.done": "Concluído",
      "sim.reqs": "Requisitos adicionados",
      "sim.cost": "Impacto estimado nos custos",
      "sim.days": "Impacto no cronograma",
      "call.title": "Agendar uma ligação",
      "call.sub": "Informe como podemos entrar em contato e nosso especialista em conformidade confirmará um horário.",
      "call.email": "Seu e-mail",
      "call.time": "Horário preferido",
      "call.invalid": "Por favor, insira um e-mail válido",
      "call.sent": "Solicitação enviada! Nosso especialista entrará em contato em breve.",
      "rpt.title": "Relatório de Prontidão de Mercado e Conformidade Regulatória",
      "rpt.generated": "Gerado por ReguLens",
      "rpt.aiGenerated": "Análise Gerada por IA",
      "rpt.regulatorySource": "Fonte Regulatória",
      "rpt.userInput": "Informações Fornecidas pelo Usuário",
      "rpt.executiveSummary": "Resumo Executivo",
      "rpt.companyProfile": "Perfil da Empresa",
      "rpt.productProfile": "Perfil do Produto",
      "rpt.sourceMarket": "Mercado de Origem",
      "rpt.targetMarket": "Mercado Alvo",
      "rpt.applicableRegulations": "Regulamentações Aplicáveis",
      "rpt.complianceRequirements": "Requisitos de Conformidade",
      "rpt.completedReqs": "Requisitos Concluídos",
      "rpt.pendingReqs": "Requisitos Pendentes",
      "rpt.complianceGaps": "Lacunas de Conformidade",
      "rpt.riskAssessment": "Avaliação de Risco",
      "rpt.businessImpact": "Impacto nos Negócios",
      "rpt.estimatedCost": "Custo Estimado",
      "rpt.estimatedTimeline": "Cronograma Estimado",
      "rpt.actionPlan": "Plano de Ação Recomendado",
      "rpt.readinessScore": "Pontuação de Prontidão",
      "rpt.launchRecommendation": "Recomendação de Lançamento",
      "rpt.regulatorySources": "Fontes Regulatórias",
      "rpt.timestamp": "Carimbo de Data/Hora da Análise",
      "rpt.noData": "Nenhum dado de análise disponível. Execute uma análise de lançamento primeiro.",
      "rpt.generating": "Gerando relatório...",
      "rpt.failed": "Falha na geração do relatório. Por favor, tente novamente.",
      "rpt.retry": "Tentar novamente",
      "rpt.download": "Baixar Relatório",
      "rpt.print": "Imprimir / Salvar como PDF",
      "rpt.close": "Fechar",
      "rpt.company": "Empresa",
      "rpt.product": "Produto",
      "rpt.origin": "País de Origem",
      "rpt.target": "Mercado Alvo",
      "rpt.industry": "Indústria",
      "rpt.priority": "Prioridade",
      "rpt.status": "Status",
      "rpt.authority": "Autoridade",
      "rpt.dueDate": "Data de Vencimento",
      "rpt.description": "Descrição",
      "rpt.totalCost": "Custo Total Estimado",
      "rpt.totalTime": "Tempo Total Estimado",
      "rpt.riskLevel": "Nível de Risco",
      "rpt.gaps": "Lacunas Abertas",
      "rpt.critical": "Crítico",
      "rpt.important": "Importante",
      "rpt.standard": "Padrão",
      "rpt.pending": "Pendente",
      "rpt.inProgress": "Em Andamento",
      "rpt.done": "Concluído",
      "rpt.notApplicable": "Não Aplicável",
      "rpt.action": "Ação",
      "rpt.estimatedDays": "Dias Estimados",
      "rpt.estimatedEur": "Custo Estimado (EUR)",
      "rpt.owner": "Parte Responsável",
      "rpt.category": "Categoria",
      "rpt.source": "Fonte",
      "rpt.code": "Código de Referência",
      "rpt.date": "Data",
      "rpt.kind": "Tipo",
      "rpt.summary": "Resumo",
      "rpt.proceed": "Prosseguir com o Lançamento",
      "rpt.conditional": "Lançamento Condicional",
      "rpt.delay": "Atrasar Lançamento",
      "rpt.prerequisites": "Pré-requisitos",
      "rpt.verdict": "Veredicto",
      "rpt.timeline": "Cronograma até a Prontidão Total",
      "rpt.disclaimer": "Este relatório contém uma análise gerada por IA baseada em dados de inteligência regulatória. As informações regulatórias devem ser verificadas com fontes oficiais antes de tomar decisões de negócios. ReguLens não garante a completude ou precisão dos dados regulatórios.",
      "rpt.page": "Página",
      "rpt.of": "de",
      "disclaimer.dashboard": "ReguLens fornece inteligência regulatória e suporte à decisão; decisões legais/de conformidade finais devem ser verificadas com profissionais qualificados ou fontes regulatórias autoritativas.",
      "ai.agents": "Agentes",
      "ai.completed": "Concluídos",
      "ai.failed": "Falharam",
      "ai.totalTime": "Tempo Total",
      "ai.pending": "Pendentes",
      "ai.running": "Executando",
      "ai.completedStatus": "Concluído",
      "ai.failedStatus": "Falhou",
      "ai.input": "Entrada",
      "ai.output": "Saída",
      "ai.sources": "Fontes",
      "ai.retry": "Tentar novamente",
      "ai.emptyTitle": "Nenhuma Atividade de Agente",
      "ai.emptyDesc": "Execute uma análise de lançamento na página <strong>Posso Lançar?</strong> para ativar o pipeline de inteligência multi-agente.",
      "ai.startAnalysis": "Iniciar Análise",
    },
    ru: {
      "nav.dashboard": "Панель управления",
      "settings.title": "Настройки",
      "settings.general": "Общие",
      "settings.language": "Язык",
      "settings.density": "Плотность",
      "settings.theme": "Тема",
      "settings.theme.light": "Светлая",
      "settings.theme.dark": "Тёмная",
      "settings.account": "Учётная запись",
      "settings.signedInAs": "Вы вошли как",
      "settings.notSignedIn": "Не вошли",
      "settings.signIn": "Войти",
      "settings.signOut": "Выйти",
      "settings.aiEngine": "ИИ-движок",
      "settings.checking": "Проверка…",
      "settings.aiConnected": "Подключён · {model}",
      "settings.aiDisconnected": "Настроен, но недоступен",
      "settings.aiNotConfigured": "ИИ-движок не настроен",
      "settings.aiConnError": "Не удалось подключиться к ИИ-движку",
      "settings.aiRetryHint": "Проверьте настройки и попробуйте снова",
      "settings.retry": "Повторить",
      "settings.clearMemory": "Очистить память",
      "settings.memoryAlreadyEmpty": "Нечего очищать — нет сохранённых разговоров.",
      "settings.memoryCleared": "Память разговоров очищена.",
      "settings.memoryClearError": "Не удалось очистить память. Пожалуйста, попробуйте снова.",
      "profile.title": "Профиль",
      "profile.guest": "Гость",
      "confirm.title": "Очистить память разговоров?",
      "confirm.text": "Это навсегда удалит все ваши разговоры с этого устройства и учётной записи. Это действие нельзя отменить.",
      "confirm.cancel": "Отмена",
      "confirm.clear": "Очистить память",
      "auth.close": "Закрыть",
      "auth.welcomeBack": "С возвращением",
      "auth.loginSub": "Войдите, чтобы продолжить",
      "auth.createAccount": "Создать аккаунт",
      "auth.createAccountSub": "Настройте свой аккаунт ReguLens",
      "auth.login": "Войти",
      "auth.signup": "Создать аккаунт",
      "auth.name": "Имя",
      "auth.email": "Электронная почта",
      "auth.password": "Пароль",
      "auth.forgotPassword": "Забыли пароль?",
      "auth.noAccount": "Нет аккаунта?",
      "auth.haveAccount": "Уже есть аккаунт?",
      "auth.or": "ИЛИ",
      "auth.continueGuest": "Продолжить как гость",
      "auth.signingIn": "Вход…",
      "auth.signingUp": "Создание аккаунта…",
      "auth.creatingAccount": "Создание аккаунта…",
      "auth.requiredError": "Пожалуйста, заполните все поля.",
      "auth.sendReset": "Отправить ссылку для сброса",
      "auth.backToSignIn": "Вернуться к входу",
      "auth.resetSent": "Письмо для сброса пароля отправлено.",
      "auth.signedIn": "Вы вошли как {email}",
      "auth.signedOut": "Вы вышли",
      "auth.guestSignedIn": "Продолжаем как гость",
      "auth.welcome": "Добро пожаловать, {name}",
      "auth.error.invalidEmail": "Пожалуйста, введите действительный адрес электронной почты.",
      "auth.error.weakPassword": "Пароль должен содержать не менее 6 символов.",
      "auth.error.userNotFound": "Аккаунт с таким адресом не найден.",
      "auth.error.invalidCredential": "Неверный адрес или пароль.",
      "auth.error.emailInUse": "Аккаунт с таким адресом уже существует.",
      "auth.error.network": "Ошибка сети. Проверьте подключение.",
      "auth.error.popupClosed": "Окно входа было закрыто.",
      "auth.error.popupBlocked": "Всплывающее окно заблокировано. Разрешите всплывающие окна для входа.",
      "auth.error.operationNotAllowed": "Этот метод входа не включён.",
      "auth.error.guestNotEnabled": "Гостевой вход не включён.",
      "auth.error.tooManyRequests": "Слишком много попыток. Пожалуйста, попробуйте позже.",
      "auth.error.userDisabled": "Эта учётная запись была отключена.",
      "auth.error.configError": "Аутентификация настроена неправильно.",
      "auth.error.generic": "Что-то пошло не так. Пожалуйста, попробуйте снова.",
      "auth.error.notConfigured": "ReguLens ещё не настроен для аутентификации.",
      "notif.title": "Уведомления",
      "notif.markAll": "Отметить все как прочитанные",
      "notif.empty": "Все прочитано",
      "doc.download": "Скачать",
      "doc.close": "Закрыть",
      "doc.previewNone": "Предварительный просмотр недоступен для этого типа файла.",
      "doc.uploaded": "„{name}“ загружен в библиотеку документов",
      "doc.uploadedCount": "{n} документов в библиотеке",
      "req.priority": "Приоритет",
      "req.status": "Статус",
      "req.reopen": "Открыть заново",
      "req.inProgress": "Отметить в работе",
      "req.complete": "Отметить выполненным",
      "req.done": "Выполнено",
      "req.pending": "В ожидании",
      "req.progress": "В работе",
      "req.critical": "Критический",
      "req.important": "Важный",
      "req.standard": "Стандартный",
      "req.count": "{n} показано",
      "sim.results": "Результаты симуляции",
      "sim.running": "Выполняется симуляция…",
      "sim.done": "Готово",
      "sim.reqs": "Добавленные требования",
      "sim.cost": "Ожидаемое влияние на стоимость",
      "sim.days": "Влияние на график",
      "call.title": "Заказать звонок",
      "call.sub": "Скажите, как с вами связаться, и наш специалист по комплаенсу подтвердит время.",
      "call.email": "Ваша электронная почта",
      "call.time": "Предпочтительное время",
      "call.invalid": "Пожалуйста, введите действительный адрес электронной почты",
      "call.sent": "Запрос отправлен! Наш специалист свяжется с вами в ближайшее время.",
      "rpt.title": "Отчёт о готовности к рынку и регуляторном соответствии",
      "rpt.generated": "Создано ReguLens",
      "rpt.aiGenerated": "Анализ, созданный ИИ",
      "rpt.regulatorySource": "Регуляторный источник",
      "rpt.userInput": "Информация, предоставленная пользователем",
      "rpt.executiveSummary": "Резюме",
      "rpt.companyProfile": "Профиль компании",
      "rpt.productProfile": "Профиль продукта",
      "rpt.sourceMarket": "Рынок происхождения",
      "rpt.targetMarket": "Целевой рынок",
      "rpt.applicableRegulations": "Применимые регуляции",
      "rpt.complianceRequirements": "Требования к соответствию",
      "rpt.completedReqs": "Выполненные требования",
      "rpt.pendingReqs": "Требования в ожидании",
      "rpt.complianceGaps": "Пробелы в соответствии",
      "rpt.riskAssessment": "Оценка рисков",
      "rpt.businessImpact": "Влияние на бизнес",
      "rpt.estimatedCost": "Ожидаемая стоимость",
      "rpt.estimatedTimeline": "Ожидаемый график",
      "rpt.actionPlan": "Рекомендуемый план действий",
      "rpt.readinessScore": "Показатель готовности",
      "rpt.launchRecommendation": "Рекомендация по запуску",
      "rpt.regulatorySources": "Регуляторные источники",
      "rpt.timestamp": "Временная метка анализа",
      "rpt.noData": "Данные анализа отсутствуют. Сначала выполните анализ запуска.",
      "rpt.generating": "Генерация отчёта...",
      "rpt.failed": "Ошибка генерации отчёта. Пожалуйста, попробуйте снова.",
      "rpt.retry": "Повторить",
      "rpt.download": "Скачать отчёт",
      "rpt.print": "Печать / Сохранить как PDF",
      "rpt.close": "Закрыть",
      "rpt.company": "Компания",
      "rpt.product": "Продукт",
      "rpt.origin": "Страна происхождения",
      "rpt.target": "Целевой рынок",
      "rpt.industry": "Отрасль",
      "rpt.priority": "Приоритет",
      "rpt.status": "Статус",
      "rpt.authority": "Орган",
      "rpt.dueDate": "Срок",
      "rpt.description": "Описание",
      "rpt.totalTime": "Общее ожидаемое время",
      "rpt.totalCost": "Общая ожидаемая стоимость",
      "rpt.riskLevel": "Уровень риска",
      "rpt.gaps": "Открытые пробелы",
      "rpt.critical": "Критический",
      "rpt.important": "Важный",
      "rpt.standard": "Стандартный",
      "rpt.pending": "В ожидании",
      "rpt.inProgress": "В работе",
      "rpt.done": "Выполнено",
      "rpt.notApplicable": "Не применимо",
      "rpt.action": "Действие",
      "rpt.estimatedDays": "Ожидаемые дни",
      "rpt.estimatedEur": "Ожидаемая стоимость (EUR)",
      "rpt.owner": "Ответственная сторона",
      "rpt.category": "Категория",
      "rpt.source": "Источник",
      "rpt.code": "Код ссылки",
      "rpt.date": "Дата",
      "rpt.kind": "Тип",
      "rpt.summary": "Резюме",
      "rpt.proceed": "Продолжить запуск",
      "rpt.conditional": "Условный запуск",
      "rpt.delay": "Отложить запуск",
      "rpt.prerequisites": "Предварительные условия",
      "rpt.verdict": "Вердикт",
      "rpt.timeline": "График до полной готовности",
      "rpt.disclaimer": "Этот отчёт содержит анализ, созданный ИИ на основе данных регуляторной разведки. Регуляторную информацию следует проверять с официальными источниками перед принятием бизнес-решений. ReguLens не гарантирует полноту или точность регуляторных данных.",
      "rpt.page": "Страница",
      "rpt.of": "из",
      "disclaimer.dashboard": "ReguLens предоставляет регуляторную разведку и поддержку принятия решений; окончательные юридические/комплаенс решения должны быть проверены квалифицированными специалистами или авторитетными регуляторными источниками.",
      "ai.agents": "Агенты",
      "ai.completed": "Завершены",
      "ai.failed": "Ошибка",
      "ai.totalTime": "Общее время",
      "ai.pending": "Ожидание",
      "ai.running": "Выполняется",
      "ai.completedStatus": "Завершено",
      "ai.failedStatus": "Ошибка",
      "ai.input": "Ввод",
      "ai.output": "Вывод",
      "ai.sources": "Источники",
      "ai.retry": "Повторить",
      "ai.emptyTitle": "Нет активности агентов",
      "ai.emptyDesc": "Запустите анализ запуска на странице <strong>Могу ли я запустить?</strong> для активации конвейера мультиагентной разведки.",
      "ai.startAnalysis": "Начать анализ",
    },
    ja: {
      "nav.dashboard": "ダッシュボード",
      "settings.title": "設定",
      "settings.general": "一般",
      "settings.language": "言語",
      "settings.density": "表示密度",
      "settings.theme": "テーマ",
      "settings.theme.light": "ライト",
      "settings.theme.dark": "ダーク",
      "settings.account": "アカウント",
      "settings.signedInAs": "ログイン中",
      "settings.notSignedIn": "未ログイン",
      "settings.signIn": "サインイン",
      "settings.signOut": "サインアウト",
      "settings.aiEngine": "AIエンジン",
      "settings.checking": "確認中…",
      "settings.aiConnected": "接続済み · {model}",
      "settings.aiDisconnected": "設定済みだが到達不可",
      "settings.aiNotConfigured": "AIエンジンが設定されていません",
      "settings.aiConnError": "AIエンジンに接続できませんでした",
      "settings.aiRetryHint": "設定を確認して再試行してください",
      "settings.retry": "再試行",
      "settings.clearMemory": "メモリをクリア",
      "settings.memoryAlreadyEmpty": "クリアするものはありません。保存された会話はありません。",
      "settings.memoryCleared": "会話メモリがクリアされました。",
      "settings.memoryClearError": "メモリをクリアできませんでした。もう一度お試しください。",
      "profile.title": "プロフィール",
      "profile.guest": "ゲスト",
      "confirm.title": "会話メモリをクリアしますか？",
      "confirm.text": "このデバイスとアカウントのすべての会話が完全に削除されます。この操作は元に戻せません。",
      "confirm.cancel": "キャンセル",
      "confirm.clear": "メモリをクリア",
      "auth.close": "閉じる",
      "auth.welcomeBack": "おかえりなさい",
      "auth.loginSub": "サインインして続行",
      "auth.createAccount": "アカウント作成",
      "auth.createAccountSub": "ReguLensアカウントを設定",
      "auth.login": "サインイン",
      "auth.signup": "アカウント作成",
      "auth.name": "名前",
      "auth.email": "メールアドレス",
      "auth.password": "パスワード",
      "auth.forgotPassword": "パスワードをお忘れですか？",
      "auth.noAccount": "アカウントをお持ちでないですか？",
      "auth.haveAccount": "既にアカウントをお持ちですか？",
      "auth.or": "または",
      "auth.continueGuest": "ゲストとして続行",
      "auth.signingIn": "サインイン中…",
      "auth.signingUp": "アカウント作成中…",
      "auth.creatingAccount": "アカウント作成中…",
      "auth.requiredError": "すべての項目を入力してください。",
      "auth.sendReset": "リセットリンクを送信",
      "auth.backToSignIn": "サインインに戻る",
      "auth.resetSent": "パスワードリセットメールを送信しました。",
      "auth.signedIn": "{email} でサインイン中",
      "auth.signedOut": "サインアウトしました",
      "auth.guestSignedIn": "ゲストとして続行中",
      "auth.welcome": "ようこそ、{name}",
      "auth.error.invalidEmail": "有効なメールアドレスを入力してください。",
      "auth.error.weakPassword": "パスワードは6文字以上で入力してください。",
      "auth.error.userNotFound": "このメールアドレスのアカウントが見つかりません。",
      "auth.error.invalidCredential": "メールアドレスまたはパスワードが正しくありません。",
      "auth.error.emailInUse": "このメールアドレスのアカウントは既に存在します。",
      "auth.error.network": "ネットワークエラー。接続を確認してください。",
      "auth.error.popupClosed": "サインインウィンドウが閉じられました。",
      "auth.error.popupBlocked": "ポップアップがブロックされました。サインインするためにポップアップを許可してください。",
      "auth.error.operationNotAllowed": "このサインイン方法は有効になっていません。",
      "auth.error.guestNotEnabled": "ゲストサインインが有効になっていません。",
      "auth.error.tooManyRequests": "試行回数が多すぎます。しばらくしてからもう一度お試しください。",
      "auth.error.userDisabled": "このアカウントは無効になっています。",
      "auth.error.configError": "認証が正しく設定されていません。",
      "auth.error.generic": "問題が発生しました。もう一度お試しください。",
      "auth.error.notConfigured": "ReguLensはまだ認証用に設定されていません。",
      "notif.title": "通知",
      "notif.markAll": "すべて既読にする",
      "notif.empty": "すべて確認済み",
      "doc.download": "ダウンロード",
      "doc.close": "閉じる",
      "doc.previewNone": "このファイルタイプのプレビューは利用できません。",
      "doc.uploaded": "「{name}」をドキュメントライブラリにアップロードしました",
      "doc.uploadedCount": "ライブラリに{n}件のドキュメント",
      "req.priority": "優先度",
      "req.status": "ステータス",
      "req.reopen": "再オープン",
      "req.inProgress": "進行中にする",
      "req.complete": "完了にする",
      "req.done": "完了",
      "req.pending": "保留中",
      "req.progress": "進行中",
      "req.critical": "緊急",
      "req.important": "重要",
      "req.standard": "標準",
      "req.count": "{n}件表示中",
      "sim.results": "シミュレーション結果",
      "sim.running": "シミュレーション実行中…",
      "sim.done": "完了",
      "sim.reqs": "追加された要件",
      "sim.cost": "コストへの影響",
      "sim.days": "スケジュールへの影響",
      "call.title": "電話を予約",
      "call.sub": "連絡方法をお伝えください。コンプライアンス専門家がスケジュールを確認します。",
      "call.email": "メールアドレス",
      "call.time": "希望時間",
      "call.invalid": "有効なメールアドレスを入力してください",
      "call.sent": "リクエストが送信されました！専門家が近日中にご連絡いたします。",
      "rpt.title": "市場準備状況・規制コンプライアンスレポート",
      "rpt.generated": "ReguLens が生成",
      "rpt.aiGenerated": "AIによる分析",
      "rpt.regulatorySource": "規制ソース",
      "rpt.userInput": "ユーザー提供情報",
      "rpt.executiveSummary": "エグゼクティブサマリー",
      "rpt.companyProfile": "会社プロフィール",
      "rpt.productProfile": "製品プロフィール",
      "rpt.sourceMarket": "発信元市場",
      "rpt.targetMarket": "ターゲット市場",
      "rpt.applicableRegulations": "適用規制",
      "rpt.complianceRequirements": "コンプライアンス要件",
      "rpt.completedReqs": "完了した要件",
      "rpt.pendingReqs": "保留中の要件",
      "rpt.complianceGaps": "コンプライアンスギャップ",
      "rpt.riskAssessment": "リスク評価",
      "rpt.businessImpact": "ビジネスへの影響",
      "rpt.estimatedCost": "推定コスト",
      "rpt.estimatedTimeline": "推定スケジュール",
      "rpt.actionPlan": "推奨アクションプラン",
      "rpt.readinessScore": "市場準備スコア",
      "rpt.launchRecommendation": "ローンチ推奨",
      "rpt.regulatorySources": "規制ソース",
      "rpt.timestamp": "分析タイムスタンプ",
      "rpt.noData": "分析データがありません。まずローンチ分析を実行してください。",
      "rpt.generating": "レポート生成中...",
      "rpt.failed": "レポートの生成に失敗しました。もう一度お試しください。",
      "rpt.retry": "再試行",
      "rpt.download": "レポートをダウンロード",
      "rpt.print": "印刷 / PDFとして保存",
      "rpt.close": "閉じる",
      "rpt.company": "会社",
      "rpt.product": "製品",
      "rpt.origin": "原産国",
      "rpt.target": "ターゲット市場",
      "rpt.industry": "業界",
      "rpt.priority": "優先度",
      "rpt.status": "ステータス",
      "rpt.authority": "管轄当局",
      "rpt.dueDate": "期限",
      "rpt.description": "説明",
      "rpt.totalCost": "推定総コスト",
      "rpt.totalTime": "推定総時間",
      "rpt.riskLevel": "リスクレベル",
      "rpt.gaps": "未解決のギャップ",
      "rpt.critical": "緊急",
      "rpt.important": "重要",
      "rpt.standard": "標準",
      "rpt.pending": "保留中",
      "rpt.inProgress": "進行中",
      "rpt.done": "完了",
      "rpt.notApplicable": "該当なし",
      "rpt.action": "アクション",
      "rpt.estimatedDays": "推定日数",
      "rpt.estimatedEur": "推定コスト (EUR)",
      "rpt.owner": "担当者",
      "rpt.category": "カテゴリ",
      "rpt.source": "ソース",
      "rpt.code": "参照コード",
      "rpt.date": "日付",
      "rpt.kind": "種類",
      "rpt.summary": "概要",
      "rpt.proceed": "ローンチを続行",
      "rpt.conditional": "条件付きローンチ",
      "rpt.delay": "ローンチを延期",
      "rpt.prerequisites": "前提条件",
      "rpt.verdict": "判定",
      "rpt.timeline": "完全な準備までのスケジュール",
      "rpt.disclaimer": "このレポートには、規制インテリジェンスデータに基づくAI生成の分析が含まれています。規制情報は、ビジネス判断を行う前に公式ソースで確認する必要があります。ReguLensは、規制データの完全性または正確性を保証するものではありません。",
      "rpt.page": "ページ",
      "rpt.of": "/",
      "disclaimer.dashboard": "ReguLensは規制インテリジェンスと意思決定サポートを提供します。最終的な法的/コンプライアンスの判断は、有資格の専門家または権威ある規制ソースで確認する必要があります。",
      "ai.agents": "エージェント",
      "ai.completed": "完了",
      "ai.failed": "失敗",
      "ai.totalTime": "合計時間",
      "ai.pending": "保留中",
      "ai.running": "実行中",
      "ai.completedStatus": "完了",
      "ai.failedStatus": "失敗",
      "ai.input": "入力",
      "ai.output": "出力",
      "ai.sources": "ソース",
      "ai.retry": "再試行",
      "ai.emptyTitle": "エージェントのアクティビティなし",
      "ai.emptyDesc": "<strong>ローンチできますか？</strong>ページからローンチ分析を実行して、マルチエージェントインテリジェンスパイプラインを有効にしてください。",
      "ai.startAnalysis": "分析を開始",
    },
    zh: {
      "nav.dashboard": "仪表板",
      "settings.title": "设置",
      "settings.general": "常规",
      "settings.language": "语言",
      "settings.density": "显示密度",
      "settings.theme": "主题",
      "settings.theme.light": "浅色",
      "settings.theme.dark": "深色",
      "settings.account": "账户",
      "settings.signedInAs": "已登录为",
      "settings.notSignedIn": "未登录",
      "settings.signIn": "登录",
      "settings.signOut": "退出登录",
      "settings.aiEngine": "AI引擎",
      "settings.checking": "检查中…",
      "settings.aiConnected": "已连接 · {model}",
      "settings.aiDisconnected": "已配置但无法连接",
      "settings.aiNotConfigured": "AI引擎未配置",
      "settings.aiConnError": "无法连接到AI引擎",
      "settings.aiRetryHint": "请检查配置并重试",
      "settings.retry": "重试",
      "settings.clearMemory": "清除记忆",
      "settings.memoryAlreadyEmpty": "没有可清除的内容，没有保存的对话。",
      "settings.memoryCleared": "对话记忆已清除。",
      "settings.memoryClearError": "无法清除记忆，请重试。",
      "profile.title": "个人资料",
      "profile.guest": "访客",
      "confirm.title": "清除对话记忆？",
      "confirm.text": "这将永久删除此设备和账户上的所有对话，此操作不可撤销。",
      "confirm.cancel": "取消",
      "confirm.clear": "清除记忆",
      "auth.close": "关闭",
      "auth.welcomeBack": "欢迎回来",
      "auth.loginSub": "登录以继续",
      "auth.createAccount": "创建账户",
      "auth.createAccountSub": "设置您的ReguLens账户",
      "auth.login": "登录",
      "auth.signup": "创建账户",
      "auth.name": "姓名",
      "auth.email": "电子邮件",
      "auth.password": "密码",
      "auth.forgotPassword": "忘记密码？",
      "auth.noAccount": "没有账户？",
      "auth.haveAccount": "已有账户？",
      "auth.or": "或",
      "auth.continueGuest": "以访客身份继续",
      "auth.signingIn": "登录中…",
      "auth.signingUp": "创建账户中…",
      "auth.creatingAccount": "创建账户中…",
      "auth.requiredError": "请填写所有字段。",
      "auth.sendReset": "发送重置链接",
      "auth.backToSignIn": "返回登录",
      "auth.resetSent": "密码重置邮件已发送。",
      "auth.signedIn": "已登录为 {email}",
      "auth.signedOut": "已退出登录",
      "auth.guestSignedIn": "以访客身份继续",
      "auth.welcome": "欢迎，{name}",
      "auth.error.invalidEmail": "请输入有效的电子邮件地址。",
      "auth.error.weakPassword": "密码至少需要6个字符。",
      "auth.error.userNotFound": "未找到此邮箱的账户。",
      "auth.error.invalidCredential": "邮箱或密码不正确。",
      "auth.error.emailInUse": "此邮箱的账户已存在。",
      "auth.error.network": "网络错误，请检查连接。",
      "auth.error.popupClosed": "登录窗口已关闭。",
      "auth.error.popupBlocked": "弹窗被阻止，请允许弹窗以登录。",
      "auth.error.operationNotAllowed": "此登录方式未启用。",
      "auth.error.guestNotEnabled": "访客登录未启用。",
      "auth.error.tooManyRequests": "尝试次数过多，请稍后重试。",
      "auth.error.userDisabled": "此账户已被禁用。",
      "auth.error.configError": "认证配置不正确。",
      "auth.error.generic": "出了点问题，请重试。",
      "auth.error.notConfigured": "ReguLens尚未配置认证。",
      "notif.title": "通知",
      "notif.markAll": "全部标为已读",
      "notif.empty": "全部已处理",
      "doc.download": "下载",
      "doc.close": "关闭",
      "doc.previewNone": "此文件类型无可用预览。",
      "doc.uploaded": "已将\"{name}\"上传至文档库",
      "doc.uploadedCount": "库中有{n}个文档",
      "req.priority": "优先级",
      "req.status": "状态",
      "req.reopen": "重新打开",
      "req.inProgress": "标记为进行中",
      "req.complete": "标记为已完成",
      "req.done": "已完成",
      "req.pending": "待处理",
      "req.progress": "进行中",
      "req.critical": "紧急",
      "req.important": "重要",
      "req.standard": "标准",
      "req.count": "显示{n}项",
      "sim.results": "模拟结果",
      "sim.running": "正在运行模拟…",
      "sim.done": "完成",
      "sim.reqs": "新增要求",
      "sim.cost": "预计成本影响",
      "sim.days": "时间表影响",
      "call.title": "预约电话",
      "call.sub": "请告知我们如何联系您，我们的合规专家将确认时间。",
      "call.email": "您的邮箱",
      "call.time": "首选时间",
      "call.invalid": "请输入有效的邮箱",
      "call.sent": "请求已发送！我们的专家将尽快与您联系。",
      "rpt.title": "市场准备度与法规合规报告",
      "rpt.generated": "由ReguLens生成",
      "rpt.aiGenerated": "AI生成分析",
      "rpt.regulatorySource": "监管来源",
      "rpt.userInput": "用户提供的信息",
      "rpt.executiveSummary": "执行摘要",
      "rpt.companyProfile": "公司概况",
      "rpt.productProfile": "产品概况",
      "rpt.sourceMarket": "来源市场",
      "rpt.targetMarket": "目标市场",
      "rpt.applicableRegulations": "适用法规",
      "rpt.complianceRequirements": "合规要求",
      "rpt.completedReqs": "已完成的要求",
      "rpt.pendingReqs": "待处理的要求",
      "rpt.complianceGaps": "合规差距",
      "rpt.riskAssessment": "风险评估",
      "rpt.businessImpact": "商业影响",
      "rpt.estimatedCost": "预计成本",
      "rpt.estimatedTimeline": "预计时间表",
      "rpt.actionPlan": "建议行动计划",
      "rpt.readinessScore": "市场准备度评分",
      "rpt.launchRecommendation": "发布建议",
      "rpt.regulatorySources": "监管来源",
      "rpt.timestamp": "分析时间戳",
      "rpt.noData": "没有可用的分析数据，请先运行发布分析。",
      "rpt.generating": "正在生成报告...",
      "rpt.failed": "报告生成失败，请重试。",
      "rpt.retry": "重试",
      "rpt.download": "下载报告",
      "rpt.print": "打印 / 另存为PDF",
      "rpt.close": "关闭",
      "rpt.company": "公司",
      "rpt.product": "产品",
      "rpt.origin": "原产国",
      "rpt.target": "目标市场",
      "rpt.industry": "行业",
      "rpt.priority": "优先级",
      "rpt.status": "状态",
      "rpt.authority": "主管机构",
      "rpt.dueDate": "截止日期",
      "rpt.description": "描述",
      "rpt.totalCost": "预计总成本",
      "rpt.totalTime": "预计总时间",
      "rpt.riskLevel": "风险等级",
      "rpt.gaps": "未解决的差距",
      "rpt.critical": "紧急",
      "rpt.important": "重要",
      "rpt.standard": "标准",
      "rpt.pending": "待处理",
      "rpt.inProgress": "进行中",
      "rpt.done": "已完成",
      "rpt.notApplicable": "不适用",
      "rpt.action": "行动",
      "rpt.estimatedDays": "预计天数",
      "rpt.estimatedEur": "预计成本（EUR）",
      "rpt.owner": "责任方",
      "rpt.category": "类别",
      "rpt.source": "来源",
      "rpt.code": "参考代码",
      "rpt.date": "日期",
      "rpt.kind": "类型",
      "rpt.summary": "摘要",
      "rpt.proceed": "继续发布",
      "rpt.conditional": "有条件发布",
      "rpt.delay": "延迟发布",
      "rpt.prerequisites": "先决条件",
      "rpt.verdict": "结论",
      "rpt.timeline": "达到完全准备的时间表",
      "rpt.disclaimer": "本报告包含基于监管情报数据的AI生成分析。在做出商业决策之前，应通过官方来源核实监管信息。ReguLens不保证监管数据的完整性或准确性。",
      "rpt.page": "页",
      "rpt.of": "/",
      "disclaimer.dashboard": "ReguLens提供监管情报和决策支持；最终的法律/合规决定应由合格的专业人员或权威监管来源进行核实。",
      "ai.agents": "智能体",
      "ai.completed": "已完成",
      "ai.failed": "失败",
      "ai.totalTime": "总时间",
      "ai.pending": "待处理",
      "ai.running": "运行中",
      "ai.completedStatus": "已完成",
      "ai.failedStatus": "失败",
      "ai.input": "输入",
      "ai.output": "输出",
      "ai.sources": "来源",
      "ai.retry": "重试",
      "ai.emptyTitle": "无智能体活动",
      "ai.emptyDesc": "从<strong>我可以发布吗？</strong>页面运行发布分析以激活多智能体情报管线。",
      "ai.startAnalysis": "开始分析",
    },
    ko: {
      "nav.dashboard": "대시보드",
      "settings.title": "설정",
      "settings.general": "일반",
      "settings.language": "언어",
      "settings.density": "표시 밀도",
      "settings.theme": "테마",
      "settings.theme.light": "라이트",
      "settings.theme.dark": "다크",
      "settings.account": "계정",
      "settings.signedInAs": "로그인:",
      "settings.notSignedIn": "로그인 안 됨",
      "settings.signIn": "로그인",
      "settings.signOut": "로그아웃",
      "settings.aiEngine": "AI 엔진",
      "settings.checking": "확인 중…",
      "settings.aiConnected": "연결됨 · {model}",
      "settings.aiDisconnected": "구성되었지만 연결 불가",
      "settings.aiNotConfigured": "AI 엔진이 구성되지 않음",
      "settings.aiConnError": "AI 엔진에 연결할 수 없음",
      "settings.aiRetryHint": "구성을 확인하고 다시 시도하세요",
      "settings.retry": "재시도",
      "settings.clearMemory": "메모리 지우기",
      "settings.memoryAlreadyEmpty": "지울 것이 없습니다. 저장된 대화가 없습니다.",
      "settings.memoryCleared": "대화 메모리가 지워졌습니다.",
      "settings.memoryClearError": "메모리를 지울 수 없습니다. 다시 시도해 주세요.",
      "profile.title": "프로필",
      "profile.guest": "게스트",
      "confirm.title": "대화 메모리를 지우시겠습니까?",
      "confirm.text": "이 기기와 계정의 모든 대화가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.",
      "confirm.cancel": "취소",
      "confirm.clear": "메모리 지우기",
      "auth.close": "닫기",
      "auth.welcomeBack": "다시 오신 것을 환영합니다",
      "auth.loginSub": "계속하려면 로그인하세요",
      "auth.createAccount": "계정 만들기",
      "auth.createAccountSub": "ReguLens 계정 설정",
      "auth.login": "로그인",
      "auth.signup": "계정 만들기",
      "auth.name": "이름",
      "auth.email": "이메일",
      "auth.password": "비밀번호",
      "auth.forgotPassword": "비밀번호를 잊으셨나요?",
      "auth.noAccount": "계정이 없으신가요?",
      "auth.haveAccount": "이미 계정이 있으신가요?",
      "auth.or": "또는",
      "auth.continueGuest": "게스트로 계속",
      "auth.signingIn": "로그인 중…",
      "auth.signingUp": "계정 생성 중…",
      "auth.creatingAccount": "계정 생성 중…",
      "auth.requiredError": "모든 항목을 입력해 주세요.",
      "auth.sendReset": "재설정 링크 보내기",
      "auth.backToSignIn": "로그인으로 돌아가기",
      "auth.resetSent": "비밀번호 재설정 이메일이 전송되었습니다.",
      "auth.signedIn": "{email}(으)로 로그인됨",
      "auth.signedOut": "로그아웃됨",
      "auth.guestSignedIn": "게스트로 계속",
      "auth.welcome": "환영합니다, {name}",
      "auth.error.invalidEmail": "유효한 이메일 주소를 입력하세요.",
      "auth.error.weakPassword": "비밀번호는 최소 6자 이상이어야 합니다.",
      "auth.error.userNotFound": "이 이메일로 등록된 계정을 찾을 수 없습니다.",
      "auth.error.invalidCredential": "이메일 또는 비밀번호가 올바르지 않습니다.",
      "auth.error.emailInUse": "이 이메일의 계정이 이미 존재합니다.",
      "auth.error.network": "네트워크 오류입니다. 연결을 확인하세요.",
      "auth.error.popupClosed": "로그인 창이 닫혔습니다.",
      "auth.error.popupBlocked": "팝업이 차단되었습니다. 로그인하려면 팝업을 허용하세요.",
      "auth.error.operationNotAllowed": "이 로그인 방법이 활성화되지 않았습니다.",
      "auth.error.guestNotEnabled": "게스트 로그인이 활성화되지 않았습니다.",
      "auth.error.tooManyRequests": "시도 횟수가 너무 많습니다. 나중에 다시 시도해 주세요.",
      "auth.error.userDisabled": "이 계정이 비활성화되었습니다.",
      "auth.error.configError": "인증이 올바르게 구성되지 않았습니다.",
      "auth.error.generic": "문제가 발생했습니다. 다시 시도해 주세요.",
      "auth.error.notConfigured": "ReguLens가 아직 인증용으로 구성되지 않았습니다.",
      "notif.title": "알림",
      "notif.markAll": "모두 읽음으로 표시",
      "notif.empty": "모두 확인 완료",
      "doc.download": "다운로드",
      "doc.close": "닫기",
      "doc.previewNone": "이 파일 유형의 미리보기를 사용할 수 없습니다.",
      "doc.uploaded": "\"{name}\"을(를) 문서 라이브러리에 업로드했습니다",
      "doc.uploadedCount": "라이브러리에 {n}개의 문서",
      "req.priority": "우선순위",
      "req.status": "상태",
      "req.reopen": "다시 열기",
      "req.inProgress": "진행 중으로 표시",
      "req.complete": "완료로 표시",
      "req.done": "완료",
      "req.pending": "대기 중",
      "req.progress": "진행 중",
      "req.critical": "긴급",
      "req.important": "중요",
      "req.standard": "표준",
      "req.count": "{n}개 표시",
      "sim.results": "시뮬레이션 결과",
      "sim.running": "시뮬레이션 실행 중…",
      "sim.done": "완료",
      "sim.reqs": "추가된 요구사항",
      "sim.cost": "예상 비용 영향",
      "sim.days": "일정 영향",
      "call.title": "전화 예약",
      "call.sub": "연락 방법을 알려주시면 전문가가 일정을 확인합니다.",
      "call.email": "이메일",
      "call.time": "희망 시간",
      "call.invalid": "유효한 이메일을 입력하세요",
      "call.sent": "요청이 전송되었습니다! 전문가가 곧 연락드립니다.",
      "rpt.title": "시장 준비도 및 규제 준수 보고서",
      "rpt.generated": "ReguLens에서 생성",
      "rpt.aiGenerated": "AI 생성 분석",
      "rpt.regulatorySource": "규제 소스",
      "rpt.userInput": "사용자 제공 정보",
      "rpt.executiveSummary": "요약",
      "rpt.companyProfile": "회사 프로필",
      "rpt.productProfile": "제품 프로필",
      "rpt.sourceMarket": "원산지 시장",
      "rpt.targetMarket": "대상 시장",
      "rpt.applicableRegulations": "해당 규제",
      "rpt.complianceRequirements": "준수 요구사항",
      "rpt.completedReqs": "완료된 요구사항",
      "rpt.pendingReqs": "대기 중인 요구사항",
      "rpt.complianceGaps": "준수 격차",
      "rpt.riskAssessment": "위험 평가",
      "rpt.businessImpact": "비즈니스 영향",
      "rpt.estimatedCost": "예상 비용",
      "rpt.estimatedTimeline": "예상 일정",
      "rpt.actionPlan": "권장行动计划",
      "rpt.readinessScore": "시장 준비도 점수",
      "rpt.launchRecommendation": "출시 권장사항",
      "rpt.regulatorySources": "규제 소스",
      "rpt.timestamp": "분석 타임스탬프",
      "rpt.noData": "분석 데이터가 없습니다. 먼저 출시 분석을 실행하세요.",
      "rpt.generating": "보고서 생성 중...",
      "rpt.failed": "보고서 생성에 실패했습니다. 다시 시도해 주세요.",
      "rpt.retry": "재시도",
      "rpt.download": "보고서 다운로드",
      "rpt.print": "인쇄 / PDF로 저장",
      "rpt.close": "닫기",
      "rpt.company": "회사",
      "rpt.product": "제품",
      "rpt.origin": "원산국",
      "rpt.target": "대상 시장",
      "rpt.industry": "산업",
      "rpt.priority": "우선순위",
      "rpt.status": "상태",
      "rpt.authority": "관할기관",
      "rpt.dueDate": "마감일",
      "rpt.description": "설명",
      "rpt.totalCost": "총 예상 비용",
      "rpt.totalTime": "총 예상 시간",
      "rpt.riskLevel": "위험 수준",
      "rpt.gaps": "미해결 격차",
      "rpt.critical": "긴급",
      "rpt.important": "중요",
      "rpt.standard": "표준",
      "rpt.pending": "대기 중",
      "rpt.inProgress": "진행 중",
      "rpt.done": "완료",
      "rpt.notApplicable": "해당 없음",
      "rpt.action": "조치",
      "rpt.estimatedDays": "예상 일수",
      "rpt.estimatedEur": "예상 비용 (EUR)",
      "rpt.owner": "담당자",
      "rpt.category": "카테고리",
      "rpt.source": "소스",
      "rpt.code": "참조 코드",
      "rpt.date": "날짜",
      "rpt.kind": "유형",
      "rpt.summary": "요약",
      "rpt.proceed": "출시 진행",
      "rpt.conditional": "조건부 출시",
      "rpt.delay": "출시 연기",
      "rpt.prerequisites": "전제 조건",
      "rpt.verdict": "결론",
      "rpt.timeline": "완전한 준비까지의 일정",
      "rpt.disclaimer": "이 보고서에는 규제 인텔리지언스 데이터를 기반으로 한 AI 생성 분석이 포함되어 있습니다. 비즈니스 결정을 내리기 전에 공식 소스에서 규제 정보를 확인해야 합니다. ReguLens는 규제 데이터의 완전성이나 정확성을 보장하지 않습니다.",
      "rpt.page": "페이지",
      "rpt.of": "/",
      "disclaimer.dashboard": "ReguLens는 규제 인텔리지언스와 의사결정 지원을 제공합니다. 최종 법적/컴플라이언스 결정은 자격을 갖춘 전문가나 권위 있는 규제 소스로 확인해야 합니다.",
      "ai.agents": "에이전트",
      "ai.completed": "완료",
      "ai.failed": "실패",
      "ai.totalTime": "총 시간",
      "ai.pending": "대기 중",
      "ai.running": "실행 중",
      "ai.completedStatus": "완료",
      "ai.failedStatus": "실패",
      "ai.input": "입력",
      "ai.output": "출력",
      "ai.sources": "소스",
      "ai.retry": "재시도",
      "ai.emptyTitle": "에이전트 활동 없음",
      "ai.emptyDesc": "<strong>출시할 수 있나요?</strong> 페이지에서 출시 분석을 실행하여 멀티에이전트 인텔리지언스 파이프라인을 활성화하세요.",
      "ai.startAnalysis": "분석 시작",
    },
    mr: {
      "nav.dashboard": "डॅशबोर्ड",
      "settings.title": "सेटिंग्ज",
      "settings.general": "सामान्य",
      "settings.language": "भाषा",
      "settings.density": "घनता",
      "settings.theme": "थीम",
      "settings.theme.light": "लाइट",
      "settings.theme.dark": "डार्क",
      "settings.account": "खाते",
      "settings.signedInAs": "यामध्ये साइन इन",
      "settings.notSignedIn": "साइन इन नाही",
      "settings.signIn": "साइन इन",
      "settings.signOut": "साइन आउट",
      "settings.aiEngine": "AI इंजिन",
      "settings.checking": "तपासणी…",
      "settings.aiConnected": "जोडलेले · {model}",
      "settings.aiDisconnected": "कॉन्फिगर केलेले पण पोहोचता येत नाही",
      "settings.aiNotConfigured": "AI इंजिन कॉन्फिगर केलेली नाही",
      "settings.aiConnError": "AI इंजिनशी कनेक्ट करता आले नाही",
      "settings.aiRetryHint": "तुमची कॉन्फिगरेशन तपासा आणि पुन्हा प्रयत्न करा",
      "settings.retry": "पुन्हा प्रयत्न करा",
      "settings.clearMemory": "मेमरी साफ करा",
      "settings.memoryAlreadyEmpty": "साफ करण्यासारखे काही नाही — जतन केलेल्या संवाद नाहीत.",
      "settings.memoryCleared": "संवाद मेमरी साफ केली.",
      "settings.memoryClearError": "मेमरी साफ करता आली नाही. कृपया पुन्हा प्रयत्न करा.",
      "profile.title": "प्रोफाइल",
      "profile.guest": "पाहुणा",
      "confirm.title": "संवाद मेमरी साफ करायची?",
      "confirm.text": "हे या उपकरणावरून आणि खात्यातील सर्व संवाद कायमचे हटवेल. ही क्रिया परत करता येणार नाही.",
      "confirm.cancel": "रद्द करा",
      "confirm.clear": "मेमरी साफ करा",
      "auth.close": "बंद करा",
      "auth.welcomeBack": "परत आपले स्वागत आहे",
      "auth.loginSub": "सुरू ठेवण्यासाठी साइन इन करा",
      "auth.createAccount": "खाते तयार करा",
      "auth.createAccountSub": "तुमचे ReguLens खाते सेट करा",
      "auth.login": "साइन इन",
      "auth.signup": "खाते तयार करा",
      "auth.name": "नाव",
      "auth.email": "ईमेल",
      "auth.password": "पासवर्ड",
      "auth.forgotPassword": "पासवर्ड विसरलात?",
      "auth.noAccount": "खाते नाही?",
      "auth.haveAccount": "आधीच खाते आहे?",
      "auth.or": "किंवा",
      "auth.continueGuest": "पाहुणा म्हणून सुरू ठेवा",
      "auth.signingIn": "साइन इन होत आहे…",
      "auth.signingUp": "खाते तयार होत आहे…",
      "auth.creatingAccount": "खाते तयार होत आहे…",
      "auth.requiredError": "कृपया सर्व फील्ड भरा.",
      "auth.sendReset": "रीसेट लिंक पाठवा",
      "auth.backToSignIn": "साइन इनवर परत",
      "auth.resetSent": "पासवर्ड रीसेट ईमेल पाठवला.",
      "auth.signedIn": "{email} म्हणून साइन इन",
      "auth.signedOut": "साइन आउट",
      "auth.guestSignedIn": "पाहुणा म्हणून सुरू ठेवत आहे",
      "auth.welcome": "स्वागत आहे, {name}",
      "auth.error.invalidEmail": "कृपया वैध ईमेल पत्ता प्रविष्ट करा.",
      "auth.error.weakPassword": "पासवर्ड किमान 6 अक्षरांचा असणे आवश्यक आहे.",
      "auth.error.userNotFound": "या ईमेलसह खाते सापडले नाही.",
      "auth.error.invalidCredential": "ईमेल किंवा पासवर्ड चुकीचा आहे.",
      "auth.error.emailInUse": "या ईमेलसह खाते आधीपासून अस्तित्वात आहे.",
      "auth.error.network": "नेटवर्क त्रुटी. कृपया तुमचे कनेक्शन तपासा.",
      "auth.error.popupClosed": "साइन इन विंडो बंद केली.",
      "auth.error.popupBlocked": "पॉपअप अवरोधित. साइन इन करण्यासाठी पॉपअपला अनुमती द्या.",
      "auth.error.operationNotAllowed": "हा साइन इन प्रकार सक्षम नाही.",
      "auth.error.guestNotEnabled": "पाहुणा साइन इन सक्षम नाही.",
      "auth.error.tooManyRequests": "खूप प्रयत्न. कृपया नंतर पुन्हा प्रयत्न करा.",
      "auth.error.userDisabled": "हे खाते अक्षम केले आहे.",
      "auth.error.configError": "प्रमाणीकरण योग्यरित्या कॉन्फिगर केलेले नाही.",
      "auth.error.generic": "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
      "auth.error.notConfigured": "ReguLens अद्याप प्रमाणीकरणासाठी कॉन्फिगर केलेले नाही.",
      "notif.title": "सूचना",
      "notif.markAll": "सर्व वाचलेले म्हणून चिन्हांकित करा",
      "notif.empty": "सर्व पूर्ण झाले",
      "doc.download": "डाउनलोड",
      "doc.close": "बंद करा",
      "doc.previewNone": "या फाइल प्रकारासाठी पूर्वावलोकन उपलब्ध नाही.",
      "doc.uploaded": "\"{name}\" डॉक्युमेंट लायब्ररीमध्ये अपलोड केले",
      "doc.uploadedCount": "लायब्ररीमध्ये {n} दस्तऐवज",
      "req.priority": "प्राधान्य",
      "req.status": "स्थिती",
      "req.reopen": "पुन्हा उघडा",
      "req.inProgress": "प्रगतीमध्ये चिन्हांकित करा",
      "req.complete": "पूर्ण म्हणून चिन्हांकित करा",
      "req.done": "पूर्ण",
      "req.pending": "प्रलंबित",
      "req.progress": "प्रगतीमध्ये",
      "req.critical": "तातडीचे",
      "req.important": "महत्त्वाचे",
      "req.standard": "मानक",
      "req.count": "{n} दर्शवले",
      "sim.results": "सिम्युलेशन परिणाम",
      "sim.running": "सिम्युलेशन चालू…",
      "sim.done": "पूर्ण",
      "sim.reqs": "जोडलेली आवश्यकता",
      "sim.cost": "अंदाजे खर्च परिणाम",
      "sim.days": "वेळापत्रक परिणाम",
      "call.title": "कॉल बुक करा",
      "call.sub": "आम्ही तुम्हाला कसे संपर्क करू ते सांगा आणि आमचा अनुरूपता तज्ज्ञ वेळ पक्की करेल.",
      "call.email": "तुमचा ईमेल",
      "call.time": "पसंतीचा वेळ",
      "call.invalid": "कृपया वैध ईमेल प्रविष्ट करा",
      "call.sent": "विनंती पाठवली! आमचा तज्ज्ञ लवकरच तुमच्याशी संपर्क साधेल.",
      "rpt.title": "बाजार तयारी आणि नियामक अनुरूपता अहवाल",
      "rpt.generated": "ReguLens ने तयार केला",
      "rpt.aiGenerated": "AI-निर्मित विश्लेषण",
      "rpt.regulatorySource": "नियामक स्रोत",
      "rpt.userInput": "वापरकर्त्याने दिलेली माहिती",
      "rpt.executiveSummary": "कार्यकारी सारांश",
      "rpt.companyProfile": "कंपनी प्रोफाइल",
      "rpt.productProfile": "उत्पादन प्रोफाइल",
      "rpt.sourceMarket": "स्रोत बाजार",
      "rpt.targetMarket": "लक्ष्य बाजार",
      "rpt.applicableRegulations": "लागू नियमन",
      "rpt.complianceRequirements": "अनुरूपता आवश्यकता",
      "rpt.completedReqs": "पूर्ण झालेल्या आवश्यकता",
      "rpt.pendingReqs": "प्रलंबित आवश्यकता",
      "rpt.complianceGaps": "अनुरूपता तरी",
      "rpt.riskAssessment": "धोका मूल्यांकन",
      "rpt.businessImpact": "व्यवसाय परिणाम",
      "rpt.estimatedCost": "अंदाजे खर्च",
      "rpt.estimatedTimeline": "अंदाजे वेळापत्रक",
      "rpt.actionPlan": "शिफारस केलेली क्रिया योजना",
      "rpt.readinessScore": "बाजार तयारी स्कोअर",
      "rpt.launchRecommendation": "सुरूवात शिफारस",
      "rpt.regulatorySources": "नियामक स्रोत",
      "rpt.timestamp": "विश्लेषण वेळाचिन्ह",
      "rpt.noData": "विश्लेषण डेटा उपलब्ध नाही. प्रथम सुरूवात विश्लेषण चालवा.",
      "rpt.generating": "अहवाल तयार होत आहे...",
      "rpt.failed": "अहवाल तयार करण्यात अपयश. कृपया पुन्हा प्रयत्न करा.",
      "rpt.retry": "पुन्हा प्रयत्न करा",
      "rpt.download": "अहवाल डाउनलोड करा",
      "rpt.print": "प्रिंट / PDF म्हणून जतन करा",
      "rpt.close": "बंद करा",
      "rpt.company": "कंपनी",
      "rpt.product": "उत्पादन",
      "rpt.origin": "मूळ देश",
      "rpt.target": "लक्ष्य बाजार",
      "rpt.industry": "उद्योग",
      "rpt.priority": "प्राधान्य",
      "rpt.status": "स्थिती",
      "rpt.authority": "अधिकार",
      "rpt.dueDate": "देय तारीख",
      "rpt.description": "वर्णन",
      "rpt.totalTotal": "एकूण अंदाजे खर्च",
      "rpt.totalTime": "एकूण अंदाजे वेळ",
      "rpt.riskLevel": "धोका स्तर",
      "rpt.gaps": "उघड्या तरी",
      "rpt.critical": "तातडीचे",
      "rpt.important": "महत्त्वाचे",
      "rpt.standard": "मानक",
      "rpt.pending": "प्रलंबित",
      "rpt.inProgress": "प्रगतीमध्ये",
      "rpt.done": "पूर्ण",
      "rpt.notApplicable": "लागू नाही",
      "rpt.action": "क्रिया",
      "rpt.estimatedDays": "अंदाजे दिवस",
      "rpt.estimatedEur": "अंदाजे खर्च (EUR)",
      "rpt.owner": "जबाबदार पक्ष",
      "rpt.category": "वर्ग",
      "rpt.source": "स्रोत",
      "rpt.code": "संदर्भ कोड",
      "rpt.date": "तारीख",
      "rpt.kind": "प्रकार",
      "rpt.summary": "सारांश",
      "rpt.proceed": "सुरूवात सुरू ठेवा",
      "rpt.conditional": "शर्तअधीन सुरूवात",
      "rpt.delay": "सुरूवात विलंबित करा",
      "rpt.prerequisites": "पूर्वअटी",
      "rpt.verdict": "निर्णय",
      "rpt.timeline": "पूर्ण तयारीपर्यंतचा वेळापत्रक",
      "rpt.disclaimer": "या अहवालामध्ये नियामक बुद्धिमत्ता डेटावर आधारित AI-निर्मित विश्लेषण आहे. व्यवसाय निर्णय घेण्यापूर्वी नियामक माहिती अधिकृत स्रोतांसह तपासली पाहिजे. ReguLens नियामक डेटाची पूर्णता किंवा अचूकता हमी देत नाही.",
      "rpt.page": "पृष्ठ",
      "rpt.of": "पैकी",
      "disclaimer.dashboard": "ReguLens नियामक बुद्धिमत्ता आणि निर्णय समर्थन प्रदान करतो; अंतिम कायदेशीर/अनुरूपता निर्णय पात्र व्यावसायिक किंवा अधिकृत नियामक स्रोतांसह तपासले पाहिजेत.",
      "ai.agents": "एजंट्स",
      "ai.completed": "पूर्ण",
      "ai.failed": "अपयशी",
      "ai.totalTotal": "एकूण वेळ",
      "ai.pending": "प्रलंबित",
      "ai.running": "चालू",
      "ai.completedStatus": "पूर्ण",
      "ai.failedStatus": "अपयशी",
      "ai.input": "इनपुट",
      "ai.output": "आउटपुट",
      "ai.sources": "स्रोत",
      "ai.retry": "पुन्हा प्रयत्न करा",
      "ai.emptyTitle": "कोई एजेंट गतिविधि नाही",
      "ai.emptyDesc": "मल्टी-एजेंट बुद्धिमत्ता पाइपलाइन सक्रिय करण्यासाठी <strong>का मी सुरू करू शकतो?</strong> पृष्ठावरून सुरूवात विश्लेषण चालवा.",
      "ai.startAnalysis": "विश्लेषण सुरू करा",
    },
  };

  /* Merge external translation bundles (public/i18n/*.js → window.AURORA_I18N) */
  if (window.AURORA_I18N) {
    Object.keys(window.AURORA_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = window.AURORA_I18N[code];
    });
  }

  /* Merge Government Intelligence bundle (public/i18n/gov-bundle.js → window.GOV_I18N) */
  if (window.GOV_I18N) {
    Object.keys(window.GOV_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = {};
      Object.assign(I18N[code], window.GOV_I18N[code]);
    });
  }

  /* Merge Landing page bundle (public/i18n/landing-bundle.js → window.LANDING_I18N) */
  if (window.LANDING_I18N) {
    Object.keys(window.LANDING_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = {};
      Object.assign(I18N[code], window.LANDING_I18N[code]);
    });
  }

  /* Merge Core bundle (public/i18n/core-bundle.js → window.CORE_I18N) — global language master fix */
  if (window.CORE_I18N) {
    Object.keys(window.CORE_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = {};
      Object.assign(I18N[code], window.CORE_I18N[code]);
    });
  }

  const _missingLogged = new Set();
  function t(key) {
    const dict = I18N[settings.lang];
    if (dict && dict[key]) return dict[key];
    if (I18N.en && I18N.en[key]) {
      if (!_missingLogged.has(key)) {
        _missingLogged.add(key);
        try { console.warn("[MISSING_TRANSLATION] language=" + settings.lang + " key=" + key); } catch {}
      }
      return I18N.en[key];
    }
    return key;
  }

  /* Template helper: tf("verdict.ready", { c: "Acme", p: 82 }) replaces {x} tokens */
  function tf(key, params) {
    params = params || {};
    let s = t(key);
    for (const k in params) s = s.split("{" + k + "}").join(String(params[k]));
    return s;
  }

  /* ───────── locale-aware formatting ───────── */
  const LOCALE_TAGS = {
    en: "en-US", hi: "hi-IN", mr: "mr-IN", de: "de-DE", fr: "fr-FR",
    es: "es-ES", pt: "pt-BR", ru: "ru-RU", ja: "ja-JP", zh: "zh-CN",
    ko: "ko-KR", it: "it-IT", nl: "nl-NL", pl: "pl-PL", cs: "cs-CZ",
  };
  function locale() { return LOCALE_TAGS[settings.lang] || settings.lang || "en-US"; }
  function fmtNum(n) {
    try { return new Intl.NumberFormat(locale()).format(Number(n) || 0); }
    catch { return String(n); }
  }
  function fmtMoney(n) {
    try {
      return new Intl.NumberFormat(locale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(n) || 0);
    } catch { return "€" + fmtNum(n); }
  }
  function fmtDays(n) { return fmtNum(n) + " " + t("time.days"); }
  function marketName(id) {
    try {
      const regionCode = id === "uk" ? "GB" : String(id).toUpperCase();
      return new Intl.DisplayNames([locale()], { type: "region" }).of(regionCode) || id.toUpperCase();
    } catch { return String(id).toUpperCase(); }
  }
  function industryName(id) {
    const key = "industry." + id;
    return t(key) === key ? id : t(key);
  }
  function sevLabel(v) {
    if (!v) return v;
    const key = "sev." + String(v).toLowerCase();
    return t(key) === key ? v : t(key);
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (key) el.title = t(key);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.dataset.i18nPh;
      if (key) el.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.dataset.i18nAria;
      if (key) el.setAttribute("aria-label", t(key));
    });
    if (window.getLanguageDirection) {
      const dir = window.getLanguageDirection(settings.lang);
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", settings.lang);
      document.body.classList.toggle("rtl", dir === "rtl");
    }
    refreshDynamic();
    updateAccountUI();
  }

  function refreshDynamic() {
    renderNotifications();
    renderRequirements();
    renderDocs();
    renderVerdict();
    renderGaps();
    renderActions();
    renderCosts();
    renderWatch();
    renderUpdates();
    renderImpact();
    renderTopPending();
    renderDashTimeline();
    renderDashWatch();
    /* global language master fix: re-render language-sensitive dynamic surfaces */
    try { renderAgentIntelligence(); } catch {}
    try { populateAnalysisForm(); } catch {}
    try { renderModuleBar(); } catch {}
    try { refreshRegionLabels(); } catch {}
    setTimeout(() => {
      try {
        if (document.getElementById("chartComplianceStatus")) renderDashboardCharts();
        if (document.getElementById("chartGapSeverity")) renderGapCharts();
        if (document.getElementById("actionMetrics")) renderActionCharts();
        if (document.getElementById("planPhaseTimeline")) renderPlanTimeline();
        if (document.getElementById("watchTimeline")) renderWatchTimeline();
        if (document.getElementById("chartRiskMatrix")) renderRiskMatrix();
        if (document.getElementById("chartCountryCompare")) renderCountryCompare();
      } catch {}
      try { if (currentView === "risk-matrix") renderRiskMatrixView(); } catch {}
      try {
        if (currentView === "feasibility") {
          populateFeasibilityForm();
          const cached = loadCachedFeasibility();
          if (cached) renderFeasibilityResult(cached);
        }
      } catch {}
      try { if (currentView === "setup-guide") renderSetupGuide(); } catch {}
      try {
        if (currentView === "policy-checker") {
          populatePolicyForm();
          const pc = loadCachedPolicy();
          if (pc) renderPolicyResult(pc);
        }
      } catch {}
      try { if (currentView === "business-health") renderBusinessHealth(); } catch {}
      try { if (currentView === "doc-checklist") renderDocChecklist(); } catch {}
      try { if (currentView === "co-founder") renderCoFounder(); } catch {}
      try { if (currentView === "investor-hub") renderInvestorHub(); } catch {}
    }, 0);
    if (window.ReguLensGov) window.ReguLensGov.refresh();
  }

  settings = loadSettings();
  renderLangMenu();

  /* ───────── api helpers ───────── */
  async function idToken() {
    try {
      const auth = window.AuroraFirebase.getAuth();
      if (auth && auth.currentUser) return await auth.currentUser.getIdToken();
    } catch {}
    return "";
  }

  async function authHeaders() {
    const token = await idToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function api(path, opts = {}) {
    const headers = { ...(await authHeaders()), ...(opts.headers || {}) };
    const res = await fetch(path, { ...opts, headers });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        msg = (await res.json()).error || msg;
      } catch {}
      throw new Error(msg);
    }
    return res;
  }

  const jsonHeaders = { "Content-Type": "application/json" };

  /* ───────── navigation ───────── */
  const GOV_VIEWS = [
    "gov-analyzer",
    "gov-stakeholders",
    "gov-outcomes",
    "gov-scenario",
    "gov-copilot",
    "gov-consultations",
  ];
  const VIEWS = [
    "dashboard",
    "history",
    "assistant",

    "can-i-launch",
    "feasibility",
    "setup-guide",
    "requirements",
    "policy-checker",
    "gap-analysis",
    "action-plan",
    "business-health",
    "cost-estimator",
    "document-library",
    "doc-checklist",
    "regulation-watch",
    "updates",
    "impact-analysis",
    "policy-simulator",
    "industry-impact",
    "compare-scenarios",
    "gov-analyzer",
    "gov-stakeholders",
    "gov-outcomes",
    "gov-scenario",
    "gov-copilot",
    "gov-consultations",
    "agent-intelligence",
    "risk-matrix",
    "business-health",
    "network",
    "co-founder",
    "investor-hub",
    "settings",
    "profile",
  ];

  /* ───────── consolidated modules ─────────
     One sidebar item per business module; each module owns a set of
     existing leaf views shown as internal tabs. Leaf ids, DOM sections,
     renders and APIs stay untouched. */
  const MODULES = {
    market: {
      labelKey: "nav.module.market",
      defaultView: "can-i-launch",
      views: ["can-i-launch", "feasibility", "setup-guide", "cost-estimator"],
    },
    compliance: {
      labelKey: "nav.module.compliance",
      defaultView: "requirements",
      views: ["requirements", "policy-checker", "gap-analysis", "action-plan"],
    },
    risk: {
      labelKey: "nav.module.risk",
      defaultView: "risk-matrix",
      views: ["risk-matrix", "business-health"],
    },
    growth: {
      labelKey: "nav.module.growth",
      defaultView: "network",
      views: ["network", "co-founder", "investor-hub"],
    },
    policy: {
      labelKey: "nav.module.policy",
      defaultView: "regulation-watch",
      views: [
        "regulation-watch",
        "updates",
        "gov-analyzer",
        "gov-stakeholders",
        "gov-outcomes",
        "gov-consultations",
      ],
    },
    impact: {
      labelKey: "nav.module.impact",
      defaultView: "impact-analysis",
      views: [
        "impact-analysis",
        "policy-simulator",
        "industry-impact",
        "compare-scenarios",
        "gov-scenario",
      ],
    },
    copilot: {
      labelKey: "nav.module.copilot",
      defaultView: "assistant",
      views: ["assistant", "history", "gov-copilot", "agent-intelligence"],
    },
    documents: {
      labelKey: "nav.module.documents",
      defaultView: "doc-checklist",
      views: ["doc-checklist", "document-library"],
    },
  };
  Object.keys(MODULES).forEach((k) => { MODULES[k].lastView = null; });

  const LEAF_TO_MODULE = {};
  Object.keys(MODULES).forEach((m) => {
    MODULES[m].views.forEach((v) => { LEAF_TO_MODULE[v] = m; });
  });
  let currentModule = null;

  /* leaf view -> i18n key for its tab caption (fallback: TITLES) */
  const LEAF_LABEL_KEYS = {
    "can-i-launch": "nav.canILaunch",
    feasibility: "nav.feasibility",
    "setup-guide": "nav.setupGuide",
    "cost-estimator": "nav.costEstimator",
    requirements: "nav.requirements",
    "policy-checker": "nav.policyChecker",
    "gap-analysis": "nav.gapAnalysis",
    "action-plan": "nav.actionPlan",
    "regulation-watch": "nav.regWatch",
    updates: "nav.updates",
    "gov-analyzer": "gov.nav.analyzer",
    "gov-stakeholders": "gov.nav.stakeholders",
    "gov-outcomes": "gov.nav.outcomes",
    "gov-consultations": "gov.nav.consultations",
    "impact-analysis": "nav.impactAnalysis",
    "policy-simulator": "gov.nav.simulator",
    "industry-impact": "gov.nav.industry",
    "compare-scenarios": "gov.nav.compare",
    "gov-scenario": "gov.nav.scenario",
    assistant: "nav.assistant",
    history: "nav.history",
    "gov-copilot": "gov.nav.copilot",
    "agent-intelligence": "nav.agentIntel",
    "document-library": "nav.docLibrary",
    "doc-checklist": "nav.docChecklist",
    "risk-matrix": "crumb.riskMatrix",
    "business-health": "nav.businessHealth",
    network: "crumb.network",
    "co-founder": "nav.coFounder",
    "investor-hub": "nav.investorHub",
  };

  const TITLES = {
    dashboard: "Market Readiness Overview",
    history: "History",
    assistant: "AI Assistant",

    "can-i-launch": "Can I Launch?",
    feasibility: "Feasibility Analyzer",
    "setup-guide": "Step-by-Step Setup Guide",
    "policy-checker": "AI Country Policy Checker",
    "business-health": "Business Health Monitor",
    "agent-intelligence": "Agent Intelligence",
    requirements: "Requirements",
    "gap-analysis": "Gap Analysis",
    "action-plan": "Action Plan",
    "cost-estimator": "Cost Estimator",
    "document-library": "Document Library",
    "doc-checklist": "Document Checklist & Templates",
    network: "Growth & Global Network",
    "co-founder": "Co-Founder Finder",
    "investor-hub": "Investor Readiness",
    "regulation-watch": "Regulation Watch",
    updates: "Updates",
    "impact-analysis": "Impact Analysis",
    "policy-simulator": "Policy Impact Simulator",
    "industry-impact": "Industry Impact",
    "compare-scenarios": "Compare Scenarios",
    "gov-analyzer": "Policy Analyzer",
    "gov-stakeholders": "Who Is Affected",
    "gov-outcomes": "What Could Happen",
    "gov-scenario": "Scenario Simulator",
    "gov-copilot": "Government Copilot",
    "gov-consultations": "Consultations",
    "risk-matrix": "Risk Matrix",
    network: "Growth & Global Network",
    settings: t("settings.title"),
    profile: t("profile.title"),
  };

  function navigate(view) {
    const target = view ? document.getElementById(`view-${view}`) : null;
    if (!target || !VIEWS.includes(view)) return;
    els.views.forEach((v) => v.classList.add("hidden"));
    target.classList.remove("hidden");
    currentView = view;
    const modKey = LEAF_TO_MODULE[view] || null;
    if (modKey && MODULES[modKey].views.includes(view)) MODULES[modKey].lastView = view;
    setActiveModule(modKey);
    els.navItems.forEach((i) =>
      i.classList.toggle("active", i.dataset.view === view || (!!modKey && i.dataset.module === modKey))
    );
    closeSidebar();
    window.scrollTo(0, 0);
    renderView(view);
  }

  /* ───────── module shell (sticky header + tab bar) ───────── */

  function ensureModuleBar() {
    const main = document.getElementById("main");
    if (!main || document.getElementById("moduleBar")) return;
    const bar = document.createElement("div");
    bar.id = "moduleBar";
    bar.className = "module-bar hidden";
    const head = document.createElement("div");
    head.className = "module-head";
    const title = document.createElement("h2");
    title.className = "module-title";
    head.appendChild(title);
    const tabs = document.createElement("div");
    tabs.className = "module-tabs";
    tabs.setAttribute("role", "tablist");
    bar.appendChild(head);
    bar.appendChild(tabs);
    main.insertBefore(bar, main.firstChild);
  }

  function renderModuleBar() {
    ensureModuleBar();
    const bar = document.getElementById("moduleBar");
    if (!bar) return;
    const mod = currentModule ? MODULES[currentModule] : null;
    if (!mod || !currentView || !mod.views.includes(currentView)) {
      bar.classList.add("hidden");
      return;
    }
    bar.classList.remove("hidden");
    const titleEl = bar.querySelector(".module-title");
    if (titleEl) titleEl.textContent = t(mod.labelKey);
    const tabsEl = bar.querySelector(".module-tabs");
    if (!tabsEl) return;
    tabsEl.innerHTML = "";
    mod.views.forEach((v) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "module-tab" + (v === currentView ? " active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(v === currentView));
      const key = LEAF_LABEL_KEYS[v];
      b.textContent = key ? t(key) : (TITLES[v] || v);
      b.addEventListener("click", () => navigate(v));
      tabsEl.appendChild(b);
    });
  }

  function setActiveModule(moduleKey) {
    currentModule = moduleKey || null;
    renderModuleBar();
  }

  function navigateModule(moduleKey) {
    const mod = MODULES[moduleKey];
    if (!mod) return;
    const target =
      mod.lastView && mod.views.includes(mod.lastView) ? mod.lastView : mod.defaultView;
    navigate(target);
  }

  function renderView(view) {
    if (GOV_VIEWS.includes(view) || view === "policy-simulator" || view === "industry-impact" || view === "compare-scenarios") {
      if (window.ReguLensGov) window.ReguLensGov.render(view);
      return;
    }
    if (view === "dashboard") { renderStats(); renderDashboardCharts(); }
    else if (view === "can-i-launch") renderVerdict();
    else if (view === "feasibility") renderFeasibility();
    else if (view === "setup-guide") renderSetupGuide();
    else if (view === "requirements") renderRequirements();
    else if (view === "policy-checker") renderPolicyChecker();
    else if (view === "gap-analysis") { renderGaps(); renderGapCharts(); renderCountryCompare(); }
    else if (view === "action-plan") { renderActions(); renderActionCharts(); renderPlanTimeline(); }
    else if (view === "business-health") renderBusinessHealth();
    else if (view === "cost-estimator") renderCosts();
    else if (view === "document-library") renderDocs();
    else if (view === "doc-checklist") renderDocChecklist();
    else if (view === "regulation-watch") { renderWatch(); renderWatchTimeline(); }
    else if (view === "updates") renderUpdates();
    else if (view === "impact-analysis") { renderImpact(); renderRiskMatrix(); }
    else if (view === "agent-intelligence") renderAgentIntelligence();
    else if (view === "history") renderHistory();
    else if (view === "assistant") renderAssistant();
    else if (view === "risk-matrix") renderRiskMatrixView();
    else if (view === "co-founder") renderCoFounder();
    else if (view === "investor-hub") renderInvestorHub();

  }

  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(el.dataset.goto);
    });
  });

  /* ───────── sidebar ───────── */
  const mqMobile = window.matchMedia("(max-width: 820px)");
  let sidebarOpen = !mqMobile.matches;

  function setSidebar(open) {
    sidebarOpen = open;
    els.body.classList.toggle("sidebar-collapsed", !open);
    if (els.menuBtn) els.menuBtn.setAttribute("aria-expanded", String(open));
  }

  function toggleSidebar() {
    setSidebar(!sidebarOpen);
  }

  function closeSidebar() {
    if (mqMobile.matches) setSidebar(false);
  }

  els.menuBtn.addEventListener("click", toggleSidebar);
  els.overlay.addEventListener("click", () => setSidebar(false));

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.dataset.view) navigate(item.dataset.view);
      else if (item.dataset.module) navigateModule(item.dataset.module);
    });
  });

  /* ───────── header menus ───────── */
  function closeMenus() {
    els.userMenu.classList.add("hidden");
    els.langMenu.classList.add("hidden");
    els.notifMenu.classList.add("hidden");
  }

  function openMenu(menu, anchor) {
    closeMenus();
    menu.classList.remove("hidden");
    const r = anchor.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = Math.min(r.right - mw, window.innerWidth - mw - 8);
    left = Math.max(8, left);
    let top = r.bottom + 6;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function toggleMenu(menu, anchor) {
    if (!menu.classList.contains("hidden")) {
      menu.classList.add("hidden");
      return;
    }
    openMenu(menu, anchor);
  }

  els.userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu(els.userMenu, els.userBtn);
  });
  els.langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu(els.langMenu, els.langBtn);
  });
  els.bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu(els.notifMenu, els.bellBtn);
  });
  document.addEventListener("click", closeMenus);

  els.userMenuSignOut.addEventListener("click", () => {
    closeMenus();
    doSignOut();
  });

  /* ───────── dynamic language menu ───────── */
  function renderLangMenu() {
    const body = document.getElementById("langMenuBody");
    if (!body || !window.LANGUAGES) return;
    body.innerHTML = "";
    const regions = window.getLanguagesByRegion ? window.getLanguagesByRegion() : {};
    const regionOrder = ["Europe", "Asia", "Middle East", "Africa"];
    regionOrder.forEach(function(region) {
      const langs = regions[region];
      if (!langs || !langs.length) return;
      const header = document.createElement("div");
      header.className = "lang-region-header";
      header.textContent = region;
      body.appendChild(header);
      langs.forEach(function(lang) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "menu-item lang-item";
        btn.dataset.lang = lang.code;
        const check = lang.code === settings.lang ? '<span class="lang-check">✓</span>' : "";
        btn.innerHTML = '<span class="lang-flag">' + lang.flag + "</span>" +
          '<span class="lang-label"><span class="lang-native">' + lang.nativeName + "</span>" +
          '<span class="lang-english">' + lang.name + "</span></span>" + check;
        body.appendChild(btn);
      });
    });
    body.querySelectorAll(".lang-item").forEach(function(item) {
      item.addEventListener("click", function() {
        settings.lang = item.dataset.lang;
        saveSettings();
        applySettings();
        closeMenus();
      });
    });
  }

  function renderSettingsLang() {
    if (!els.setAppLang || !window.LANGUAGES) return;
    els.setAppLang.innerHTML = "";
    window.LANGUAGES.forEach(function(lang) {
      const opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = lang.flag + " " + lang.nativeName + " — " + lang.name;
      if (lang.code === settings.lang) opt.selected = true;
      els.setAppLang.appendChild(opt);
    });
  }

  /* ───────── notifications ───────── */
  let notifications = [];

  function buildNotifications() {
    return [];
  }

  function renderNotifications() {
    if (!els.notifList) return;
    const unread = notifications.filter((n) => n.unread).length;
    if (els.bellBadge) els.bellBadge.style.display = unread ? "block" : "none";
    els.notifList.innerHTML = "";
    els.notifEmpty.classList.toggle("hidden", notifications.length > 0);
    notifications.forEach((n, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "notif-item" + (n.unread ? "" : " read");
      btn.innerHTML =
        '<span class="notif-dot"></span>' +
        '<span class="notif-body"><span class="notif-item-title"></span><div class="notif-item-date"></div></span>';
      btn.querySelector(".notif-item-title").textContent = t(n.title);
      btn.querySelector(".notif-item-date").textContent = t(n.date);
      btn.addEventListener("click", () => {
        notifications[i].unread = false;
        renderNotifications();
        closeMenus();
        navigate(n.goto);
      });
      els.notifList.appendChild(btn);
    });
  }

  els.notifMarkAll.addEventListener("click", (e) => {
    e.stopPropagation();
    notifications.forEach((n) => (n.unread = false));
    renderNotifications();
  });

  renderNotifications();

  /* ───────── dashboard widgets ───────── */
  const readinessRing = document.getElementById("readinessRing");
  const readinessValue = document.getElementById("readinessValue");

  function animateRing(circle, valueEl, target) {
    if (!circle) return;
    const C = 2 * Math.PI * 58;
    circle.style.strokeDasharray = String(C);
    let current = 0;
    const step = () => {
      current = Math.min(target, Math.round((current + Math.max(1, target / 60)) * 10) / 10);
      circle.style.strokeDashoffset = String(C - (C * current) / 100);
      if (valueEl) valueEl.textContent = Math.round(current) + "%";
      if (current < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ───────── dropdown data constants ───────── */
  const TARGET_MARKETS = [
    { id: "in", name: "🇮🇳 India" },
    { id: "us", name: "🇺🇸 United States" },
    { id: "uk", name: "🇬🇧 United Kingdom" },
    { id: "ae", name: "🇦🇪 UAE" },
    { id: "de", name: "🇩🇪 Germany" },
    { id: "sg", name: "🇸🇬 Singapore" },
    { id: "au", name: "🇦🇺 Australia" },
    { id: "ca", name: "🇨🇦 Canada" },
    { id: "jp", name: "🇯🇵 Japan" },
    { id: "eu", name: "🇪🇺 European Union" },
    { id: "fr", name: "🇫🇷 France" },
    { id: "cn", name: "🇨🇳 China" },
    { id: "br", name: "🇧🇷 Brazil" },
    { id: "kr", name: "🇰🇷 South Korea" },
    { id: "sa", name: "🇸🇦 Saudi Arabia" },
    { id: "mx", name: "🇲🇽 Mexico" },
    { id: "it", name: "🇮🇹 Italy" },
    { id: "es", name: "🇪🇸 Spain" },
    { id: "nl", name: "🇳🇱 Netherlands" },
    { id: "se", name: "🇸🇪 Sweden" },
    { id: "ch", name: "🇨🇭 Switzerland" },
  ];

  const INDUSTRIES = [
    { id: "fintech", name: "FinTech" },
    { id: "banking-financial", name: "Banking & Financial Services" },
    { id: "healthcare", name: "Healthcare" },
    { id: "healthtech", name: "HealthTech" },
    { id: "edtech", name: "EdTech" },
    { id: "ecommerce", name: "E-commerce" },
    { id: "saas", name: "SaaS" },
    { id: "ai-ml", name: "AI & Machine Learning" },
    { id: "manufacturing", name: "Manufacturing" },
    { id: "retail", name: "Retail" },
    { id: "food-beverage", name: "Food & Beverage" },
    { id: "logistics", name: "Logistics & Supply Chain" },
    { id: "energy", name: "Energy" },
    { id: "automotive", name: "Automotive" },
    { id: "telecommunications", name: "Telecommunications" },
    { id: "insurance", name: "Insurance" },
    { id: "pharmaceuticals", name: "Pharmaceuticals" },
    { id: "travel-tourism", name: "Travel & Tourism" },
    { id: "general", name: "General / Other" },
  ];

  /* ───────── country → administrative division selection ───────── */
  const COUNTRY_NAME_TO_CODE = {};
  TARGET_MARKETS.forEach((m) => { COUNTRY_NAME_TO_CODE[m.name.replace(/^.{2}\s/, "")] = m.id; });
  COUNTRY_NAME_TO_CODE["India"] = "in";
  COUNTRY_NAME_TO_CODE["United States"] = "us";
  COUNTRY_NAME_TO_CODE["United Kingdom"] = "uk";
  COUNTRY_NAME_TO_CODE["UAE"] = "ae";
  COUNTRY_NAME_TO_CODE["Germany"] = "de";
  COUNTRY_NAME_TO_CODE["Singapore"] = "sg";
  COUNTRY_NAME_TO_CODE["Australia"] = "au";
  COUNTRY_NAME_TO_CODE["Canada"] = "ca";
  COUNTRY_NAME_TO_CODE["Japan"] = "jp";
  COUNTRY_NAME_TO_CODE["European Union"] = "eu";
  COUNTRY_NAME_TO_CODE["France"] = "fr";
  COUNTRY_NAME_TO_CODE["China"] = "cn";
  COUNTRY_NAME_TO_CODE["Brazil"] = "br";
  COUNTRY_NAME_TO_CODE["South Korea"] = "kr";
  COUNTRY_NAME_TO_CODE["Saudi Arabia"] = "sa";
  COUNTRY_NAME_TO_CODE["Mexico"] = "mx";
  COUNTRY_NAME_TO_CODE["Italy"] = "it";
  COUNTRY_NAME_TO_CODE["Spain"] = "es";
  COUNTRY_NAME_TO_CODE["Netherlands"] = "nl";
  COUNTRY_NAME_TO_CODE["Sweden"] = "se";
  COUNTRY_NAME_TO_CODE["Switzerland"] = "ch";
  COUNTRY_NAME_TO_CODE["Other"] = "";

  let _countryRegionsCache = null;
  let _countryRegionsLoading = null;

  function loadCountryRegions() {
    if (_countryRegionsCache) return Promise.resolve(_countryRegionsCache);
    if (_countryRegionsLoading) return _countryRegionsLoading;
    _countryRegionsLoading = fetch("/api/country-regions")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((data) => { _countryRegionsCache = data; return data; })
      .catch((err) => { console.warn("[country-regions] load failed:", err); _countryRegionsLoading = null; return null; });
    return _countryRegionsLoading;
  }

  function getCountryCode(countryName) {
    if (!countryName) return "";
    const v = String(countryName).trim();
    if (COUNTRY_NAME_TO_CODE[v] !== undefined) return COUNTRY_NAME_TO_CODE[v];
    if (_countryRegionsCache && _countryRegionsCache[v.toLowerCase()]) return v.toLowerCase();
    const stripped = v.replace(/^.{2}\s/, "").trim();
    if (COUNTRY_NAME_TO_CODE[stripped] !== undefined) return COUNTRY_NAME_TO_CODE[stripped];
    return "";
  }

  function getRegionLabel(countryCode) {
    if (!_countryRegionsCache || !countryCode) return t("region.label.default");
    const meta = _countryRegionsCache[countryCode];
    if (!meta) return t("region.label.default");
    const i18nKey = "region.label." + countryCode;
    const translated = t(i18nKey);
    return translated !== i18nKey ? translated : meta.divisionLabel;
  }

  function populateRegionDropdown(regionSelect, countryCode) {
    if (!regionSelect) return;
    regionSelect.innerHTML = "";
    if (!countryCode || !_countryRegionsCache) {
      const ph = document.createElement("option");
      ph.value = "";
      ph.disabled = true;
      ph.selected = true;
      ph.textContent = t("region.selectRegion");
      regionSelect.appendChild(ph);
      return;
    }
    const meta = _countryRegionsCache[countryCode];
    if (!meta || meta.noDivisions || !meta.divisions.length) {
      const ph = document.createElement("option");
      ph.value = "";
      ph.disabled = true;
      ph.selected = true;
      ph.textContent = t("region.noneAvailable");
      regionSelect.appendChild(ph);
      return;
    }
    const ph = document.createElement("option");
    ph.value = "";
    ph.disabled = true;
    ph.selected = true;
    ph.textContent = t("region.selectRegion");
    regionSelect.appendChild(ph);
    meta.divisions.forEach((div) => {
      const opt = document.createElement("option");
      opt.value = div;
      opt.textContent = div;
      regionSelect.appendChild(opt);
    });
  }

  function showRegionField(rowEl, labelEl, countryCode) {
    if (!rowEl) return;
    if (!countryCode || !_countryRegionsCache) { rowEl.style.display = "none"; return; }
    const meta = _countryRegionsCache[countryCode];
    if (!meta || meta.noDivisions) { rowEl.style.display = "none"; return; }
    rowEl.style.display = "";
    if (labelEl) labelEl.textContent = getRegionLabel(countryCode);
  }

  function handleOriginCountryChange(originSelect, regionSelect, rowEl, labelEl) {
    const countryCode = getCountryCode(originSelect.value);
    populateRegionDropdown(regionSelect, countryCode);
    showRegionField(rowEl, labelEl, countryCode);
    if (regionSelect) regionSelect.value = "";
  }

  function handleTargetCountryChange(targetSelect, regionSelect, rowEl, labelEl) {
    const countryCode = getCountryCode(targetSelect.value);
    populateRegionDropdown(regionSelect, countryCode);
    showRegionField(rowEl, labelEl, countryCode);
    if (regionSelect) regionSelect.value = "";
  }

  function refreshRegionLabels() {
    const pairs = [
      [els.aiOrigin, els.aiOriginRegion, els.aiOriginRegionRow, els.aiOriginRegionLabel],
      [els.aiTarget, els.aiTargetRegion, els.aiTargetRegionRow, els.aiTargetRegionLabel],
      [els.fbOrigin, els.fbOriginRegion, els.fbOriginRegionRow, els.fbOriginRegionLabel],
      [els.fbTarget, els.fbTargetRegion, els.fbTargetRegionRow, els.fbTargetRegionLabel],
      [els.pcTarget, els.pcTargetRegion, els.pcTargetRegionRow, els.pcTargetRegionLabel],
    ];
    pairs.forEach(([countrySel, regionSel, rowEl, labelEl]) => {
      if (!countrySel || !rowEl) return;
      const cc = getCountryCode(countrySel.value);
      if (cc && rowEl.style.display !== "none") {
        showRegionField(rowEl, labelEl, cc);
      }
    });
  }

  /* ───────── analysis state (multi-agent system) ───────── */
  let analysisData = null;
  let analysisRunning = false;
  let analysisProgress = { research: "pending", requirements: "pending", gaps: "pending", risks: "pending", actions: "pending", readiness: "pending" };
  let analysisError = null;
  let analysisErrorObj = null;
  let analysisCompletedStages = [];

  const ANALYSIS_KEY = "regulens.analysis";
  function saveAnalysisToStorage() {
    try {
      if (analysisData) localStorage.setItem(ANALYSIS_KEY, JSON.stringify(analysisData));
    } catch {}
  }
  function loadAnalysisFromStorage() {
    try {
      const raw = localStorage.getItem(ANALYSIS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.company && data.product) {
          analysisData = data;
      analysisProgress = { research: "done", requirements: "done", gaps: "done", risks: "done", actions: "done", readiness: "done" };
          AGENTS.forEach((a) => {
            agentStates[a.id] = { status: "completed", startTime: null, endTime: null, inputSummary: "", outputSummary: "", sourceCount: 0, retryCount: 0 };
            agentStates[a.id].outputSummary = buildAgentOutputSummary(a, analysisData, null);
            agentStates[a.id].sourceCount = buildAgentSourceCount(a, analysisData, null);
          });
        }
      }
    } catch {}
  }

  const ANALYSIS_STAGES = [
    { key: "research", label: "Researching applicable regulations" },
    { key: "requirements", label: "Building compliance requirements" },
    { key: "gaps", label: "Identifying compliance gaps" },
    { key: "risks", label: "Assessing risks & impact" },
    { key: "actions", label: "Creating action plan" },
    { key: "readiness", label: "Calculating readiness score" },
  ];

  /* ───────── agent intelligence panel ───────── */
  const AGENTS = [
    {
      id: "research",
      stage: "research",
      name: "Regulatory Research Agent",
      purpose: "Identifies applicable regulations and compliance sources for your target market",
      icon: "🔍",
    },
    {
      id: "requirements",
      stage: "requirements",
      name: "Compliance Requirements Agent",
      purpose: "Generates specific compliance requirements from identified regulations",
      icon: "📋",
    },
    {
      id: "gaps",
      stage: "gaps",
      name: "Gap Analysis Agent",
      purpose: "Analyzes gaps between current state and compliance requirements",
      icon: "🔎",
    },
    {
      id: "risk",
      stage: "readiness",
      name: "Risk & Impact Agent",
      purpose: "Assesses launch risk level and calculates market readiness score",
      icon: "⚡",
    },
    {
      id: "actions",
      stage: "actions",
      name: "Action Plan Agent",
      purpose: "Creates prioritized remediation plan with cost and timeline estimates",
      icon: "🎯",
    },
  ];

  let agentStates = {};
  let agentInputParams = null;

  function resetAgentStates() {
    agentStates = {};
    AGENTS.forEach((a) => {
      agentStates[a.id] = {
        status: "pending",
        startTime: null,
        endTime: null,
        inputSummary: "",
        outputSummary: "",
        sourceCount: 0,
        retryCount: 0,
      };
    });
  }
  resetAgentStates();
  loadAnalysisFromStorage();

  function getAgentByStage(stageKey) {
    return AGENTS.find((a) => a.stage === stageKey);
  }

  function formatMs(ms) {
    if (!ms || ms < 0) return "—";
    if (ms < 1000) return ms + "ms";
    return (ms / 1000).toFixed(1) + "s";
  }

  function buildAgentInputSummary(agent, ctx) {
    if (!ctx) return "";
    switch (agent.stage) {
      case "research":
        return ctx.company + " → " + ctx.target + " · " + ctx.industry;
      case "requirements":
        return (ctx.regCount || 0) + " regulations identified";
      case "gaps":
        return (ctx.reqCount || 0) + " requirements mapped";
      case "readiness":
        return (ctx.gapCount || 0) + " gaps · " + (ctx.reqCount || 0) + " requirements";
      case "actions":
        return (ctx.reqCount || 0) + " requirements · risk " + (ctx.riskLevel || "—");
      default:
        return "";
    }
  }

  function buildAgentOutputSummary(agent, data, stageData) {
    if (!data && !stageData) return "";
    switch (agent.stage) {
      case "research": {
        const regs = (data || stageData || {}).regulations || [];
        const high = regs.filter((r) => r.confidence === "high").length;
        return "Identified " + regs.length + " potentially applicable regulatory sources" + (high ? " (" + high + " high-confidence)" : "") + ".";
      }
      case "requirements": {
        const reqs = (data || stageData || {}).requirements || [];
        const crit = reqs.filter((r) => r.priority === "critical").length;
        return "Generated " + reqs.length + " compliance requirements" + (crit ? " (" + crit + " critical)" : "") + ".";
      }
      case "gaps": {
        const gaps = (data || stageData || {}).gaps || [];
        const open = (data || stageData || {}).openGaps || gaps.length;
        const high = gaps.filter((g) => g.severity === "high" || g.priority === "critical").length;
        return "Found " + open + " compliance gaps" + (high ? " (" + high + " high-priority)" : "") + ".";
      }
      case "readiness": {
        const readiness = (data || {}).readiness;
        const risk = (data || {}).riskLevel || (stageData || {}).riskLevel;
        return readiness != null
          ? "Readiness score: " + readiness + "%" + (risk ? " · Risk: " + risk : "") + "."
          : "Calculated market readiness score.";
      }
      case "actions": {
        const acts = (data || stageData || {}).actions || [];
        const costs = (data || stageData || {}).costItems || [];
        const totalCost = costs.reduce((s, c) => s + (c.amount || 0), 0);
        return "Generated " + acts.length + " prioritized remediation actions" + (totalCost ? " · Est. €" + Math.round(totalCost).toLocaleString("en-US") : "") + ".";
      }
      default:
        return "";
    }
  }

  function buildAgentSourceCount(agent, data, stageData) {
    if (!data && !stageData) return 0;
    switch (agent.stage) {
      case "research": return ((data || stageData || {}).regulations || []).length;
      case "requirements": return ((data || stageData || {}).requirements || []).length;
      case "gaps": return ((data || stageData || {}).gaps || []).length;
      case "actions": return ((data || stageData || {}).actions || []).length;
      default: return 0;
    }
  }

  function updateAgentFromStage(stageKey, status, stageData) {
    const agent = getAgentByStage(stageKey);
    if (!agent) return;
    const s = agentStates[agent.id];
    if (status === "running") {
      s.status = "running";
      s.startTime = Date.now();
      const p = agentInputParams || {};
      s.inputSummary = buildAgentInputSummary(agent, {
        company: p.company || "",
        target: p.target || "",
        industry: p.industry || "",
        regCount: analysisData ? analysisData.regulations.length : 0,
        reqCount: analysisData ? analysisData.requirements.length : 0,
        gapCount: analysisData ? (analysisData.gaps || []).length : 0,
        riskLevel: analysisData ? analysisData.riskLevel : "",
      });
    } else if (status === "done") {
      s.status = "completed";
      s.endTime = Date.now();
      s.outputSummary = buildAgentOutputSummary(agent, analysisData, stageData);
      s.sourceCount = buildAgentSourceCount(agent, analysisData, stageData);
    } else if (status === "error") {
      s.status = "failed";
      s.endTime = Date.now();
    }
  }

  function getAgentOverallTime() {
    const starts = Object.values(agentStates).filter((s) => s.startTime).map((s) => s.startTime);
    const ends = Object.values(agentStates).filter((s) => s.endTime).map((s) => s.endTime);
    if (!starts.length) return null;
    const earliest = Math.min(...starts);
    const latest = ends.length ? Math.max(...ends) : Date.now();
    return latest - earliest;
  }

  const AGENT_OUTPUT_KEYS = {
    research: "regulatoryResearch",
    requirements: "complianceRequirements",
    gaps: "gapAnalysis",
    readiness: "riskImpact",
    actions: "actionPlan",
  };

  function getAgentOutput(stageKey) {
    if (!analysisData || !analysisData.agentOutputs) return null;
    const key = AGENT_OUTPUT_KEYS[stageKey];
    return (key && analysisData.agentOutputs[key]) || null;
  }

  function metricLabel(key) {
    const spaced = String(key).replace(/([A-Z])/g, " $1").trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  function countBy(items, field) {
    const counts = {};
    (items || []).forEach((it) => {
      const v = it && it[field] ? String(it[field]).toLowerCase() : "other";
      counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  }

  function renderAgentFindings(agentKey) {
    if (!analysisData || !analysisData.agentOutputs) return "";
    const agent = analysisData.agentOutputs[agentKey];
    if (!agent) return "";

    let html = "";

    // Objective
    if (agent.objective) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.objective")) + '</div>' +
        '<div class="agent-detail-content">' + esc(agent.objective) + '</div>' +
        '</div>';
    }

    // Key Findings
    if (agent.keyFindings) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.keyFindings")) + '</div>' +
        '<div class="agent-detail-content">' + esc(agent.keyFindings) + '</div>' +
        '</div>';
    }

    // Metrics
    if (agent.metrics && typeof agent.metrics === "object") {
      const metricEntries = Object.entries(agent.metrics);
      if (metricEntries.length > 0) {
        html += '<div class="agent-detail-section">' +
          '<div class="agent-detail-title">' + esc(t("ai.metrics")) + '</div>' +
          '<div class="agent-metrics-grid">' +
          metricEntries.map(([key, val]) =>
            '<div class="agent-metric">' +
              '<div class="agent-metric-value">' + esc(val) + '</div>' +
              '<div class="agent-metric-label">' + esc(metricLabel(key)) + '</div>' +
            '</div>'
          ).join("") +
          '</div>' +
          '</div>';
      }
    }

    // Confidence
    if (agent.confidence) {
      const conf = String(agent.confidence);
      const confClass = conf === "High" ? "green" : conf === "Medium" ? "orange" : "gray";
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.confidence")) + '</div>' +
        '<div class="agent-detail-content"><span class="chip chip-' + confClass + '">' + esc(conf) + '</span></div>' +
        '</div>';
    }

    // Impact
    if (agent.impact) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.businessImpact")) + '</div>' +
        '<div class="agent-detail-content">' + esc(agent.impact) + '</div>' +
        '</div>';
    }

    // Recommendations
    if (Array.isArray(agent.recommendations) && agent.recommendations.length > 0) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.recommendations")) + '</div>' +
        '<ul class="agent-detail-list">' +
        agent.recommendations.map((r) => '<li>' + esc(r) + '</li>').join("") +
        '</ul>' +
        '</div>';
    }

    // Agent-specific sections

    // Agent 1 — Regulatory Research: list of regulations found
    if (agentKey === "regulatoryResearch" && Array.isArray(agent.findings) && agent.findings.length > 0) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.findings")) + ' (' + agent.findings.length + ')</div>' +
        '<ul class="agent-detail-list">' +
        agent.findings.slice(0, 10).map((f) =>
          '<li><strong>' + esc(f.regulation || f.name || "") + '</strong> — ' +
          esc(f.jurisdiction || "") + ' (' + esc(f.applicability || "") + ')' +
          (f.source ? ' · <span class="ai-source-count">' + esc(f.source) + '</span>' : '') +
          '</li>'
        ).join("") +
        (agent.findings.length > 10 ? '<li>+' + (agent.findings.length - 10) + ' more…</li>' : "") +
        '</ul>' +
        '</div>';
    }

    // Agent 2 — Compliance Requirements: requirement count by priority
    if (agentKey === "complianceRequirements" && Array.isArray(agent.findings)) {
      const byPriority = countBy(agent.findings, "priority");
      const order = ["critical", "important", "standard"];
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">Requirements by Priority</div>' +
        '<ul class="agent-detail-list">' +
        order.filter((p) => byPriority[p]).map((p) =>
          '<li><strong>' + p.charAt(0).toUpperCase() + p.slice(1) + '</strong>: ' + byPriority[p] + ' requirements</li>'
        ).join("") +
        Object.keys(byPriority).filter((p) => !order.includes(p)).map((p) =>
          '<li><strong>' + esc(p.charAt(0).toUpperCase() + p.slice(1)) + '</strong>: ' + byPriority[p] + ' requirements</li>'
        ).join("") +
        '</ul>' +
        '</div>';
    }

    // Agent 3 — Gap Analysis: gap count by severity
    if (agentKey === "gapAnalysis" && Array.isArray(agent.findings)) {
      const bySeverity = countBy(agent.findings, "severity");
      const order = ["critical", "high", "medium", "low"];
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">Gaps by Severity</div>' +
        '<ul class="agent-detail-list">' +
        order.filter((sv) => bySeverity[sv]).map((sv) =>
          '<li><strong>' + sv.charAt(0).toUpperCase() + sv.slice(1) + '</strong>: ' + bySeverity[sv] + ' gaps</li>'
        ).join("") +
        Object.keys(bySeverity).filter((sv) => !order.includes(sv)).map((sv) =>
          '<li><strong>' + esc(sv.charAt(0).toUpperCase() + sv.slice(1)) + '</strong>: ' + bySeverity[sv] + ' gaps</li>'
        ).join("") +
        '</ul>' +
        '</div>';
    }

    // Agent 4 — Risk & Impact: risk matrix summary by severity
    if (agentKey === "riskImpact" && Array.isArray(agent.findings)) {
      const bySeverity = countBy(agent.findings, "severity");
      const order = ["critical", "high", "medium", "low"];
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">Risk Matrix Summary</div>' +
        '<ul class="agent-detail-list">' +
        order.filter((sv) => bySeverity[sv]).map((sv) =>
          '<li><strong>' + sv.charAt(0).toUpperCase() + sv.slice(1) + '</strong>: ' + bySeverity[sv] + ' risks</li>'
        ).join("") +
        Object.keys(bySeverity).filter((sv) => !order.includes(sv)).map((sv) =>
          '<li><strong>' + esc(sv.charAt(0).toUpperCase() + sv.slice(1)) + '</strong>: ' + bySeverity[sv] + ' risks</li>'
        ).join("") +
        (agent.riskLevel ? '<li><strong>Overall Risk Level</strong>: ' + esc(agent.riskLevel) + '</li>' : "") +
        '</ul>' +
        '</div>';
    }

    // Agent 5 — Action Plan: phase breakdown
    if (agentKey === "actionPlan" && Array.isArray(agent.phases) && agent.phases.length > 0) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.phases")) + '</div>' +
        '<ul class="agent-detail-list">' +
        agent.phases.map((p) =>
          '<li><strong>' + esc(p.name || "") + '</strong> — ' + esc(p.actions != null ? p.actions : 0) +
          ' actions' + (p.focus ? ', focus: ' + esc(p.focus) : '') + '</li>'
        ).join("") +
        '</ul>' +
        '</div>';
    }

    return html;
  }


  function renderAgentIntelligence() {
    const grid = document.getElementById("aiAgentsGrid");
    const visual = document.getElementById("aiPipelineVisual");
    const empty = document.getElementById("aiEmptyState");
    const countEl = document.getElementById("aiCompletedCount");
    const failEl = document.getElementById("aiFailedCount");
    const timeEl = document.getElementById("aiTotalTime");

    if (!grid) return;

    const hasActivity = Object.values(agentStates).some(
      (s) => s.status !== "pending"
    );

    if (!hasActivity && !analysisData) {
      grid.innerHTML = "";
      if (visual) visual.innerHTML = "";
      if (empty) empty.classList.remove("hidden");
      if (countEl) countEl.textContent = "0";
      if (failEl) failEl.textContent = "0";
      if (timeEl) timeEl.textContent = "—";
      return;
    }

    if (empty) empty.classList.add("hidden");

    const completed = Object.values(agentStates).filter((s) => s.status === "completed").length;
    const failed = Object.values(agentStates).filter((s) => s.status === "failed").length;
    if (countEl) countEl.textContent = String(completed);
    if (failEl) failEl.textContent = String(failed);

    const overallTime = getAgentOverallTime();
    if (timeEl) timeEl.textContent = overallTime ? formatMs(overallTime) : "—";

    if (visual) {
      let pipeHTML = "";
      AGENTS.forEach((agent, i) => {
        const s = agentStates[agent.id];
        let dotCls = "";
        let lineCls = "";
        if (s.status === "running") dotCls = "ai-pipe-active";
        else if (s.status === "completed") dotCls = "ai-pipe-done";
        else if (s.status === "failed") dotCls = "ai-pipe-error";

        if (i < AGENTS.length - 1) {
          const next = agentStates[AGENTS[i + 1].id];
          if (s.status === "completed" && (next.status === "running" || next.status === "completed")) lineCls = "ai-pipe-done";
          else if (s.status === "completed" && next.status === "pending") lineCls = "ai-pipe-active";
        }

        pipeHTML += '<div class="ai-pipe-node"><div class="ai-pipe-dot ' + dotCls + '"></div></div>';
        if (i < AGENTS.length - 1) {
          pipeHTML += '<div class="ai-pipe-line ' + lineCls + '"></div>';
        }
      });
      visual.innerHTML = pipeHTML;
    }

    grid.innerHTML = "";
    AGENTS.forEach((agent) => {
      const s = agentStates[agent.id];
      const card = document.createElement("div");
      let cardCls = "ai-agent-card";
      if (s.status === "running") cardCls += " ai-agent-active";
      else if (s.status === "completed") cardCls += " ai-agent-done";
      else if (s.status === "failed") cardCls += " ai-agent-error";
      card.className = cardCls;

      let statusBadgeCls = "ai-badge-pending";
      let statusLabel = "Pending";
      if (s.status === "running") { statusBadgeCls = "ai-badge-running"; statusLabel = "Running"; }
      else if (s.status === "completed") { statusBadgeCls = "ai-badge-done"; statusLabel = "Completed"; }
      else if (s.status === "failed") { statusBadgeCls = "ai-badge-error"; statusLabel = "Failed"; }

      const elapsed = s.startTime ? (s.endTime || Date.now()) - s.startTime : 0;
      const iconPulse = s.status === "running" ? " ai-agent-icon-pulse" : "";

      let bodyHTML = "";
      if (s.status !== "pending") {
        bodyHTML += '<div class="ai-agent-body">';
        if (s.status === "running") {
          bodyHTML += '<div class="ai-agent-progress"><div class="ai-agent-progress-bar"></div></div>';
        }
        if (s.inputSummary) {
          bodyHTML += '<div class="ai-agent-row"><span class="ai-agent-row-label">Input</span><span class="ai-agent-row-value">' + esc(s.inputSummary) + '</span></div>';
        }
        if (s.outputSummary) {
          bodyHTML += '<div class="ai-agent-row"><span class="ai-agent-row-label">Output</span><span class="ai-agent-row-value">' + esc(s.outputSummary) + '</span></div>';
        }
        if (s.sourceCount > 0) {
          bodyHTML += '<div class="ai-agent-row"><span class="ai-agent-row-label">Sources</span><span class="ai-agent-row-value"><span class="ai-source-count">' + s.sourceCount + ' sources</span></span></div>';
        }
        if (s.status === "completed") {
          const agentOutput = getAgentOutput(agent.stage);
          if (agentOutput) {
            bodyHTML += renderAgentFindings(AGENT_OUTPUT_KEYS[agent.stage]);
          }
        }
        bodyHTML += '</div>';
      }

      let retryHTML = "";
      if (s.status === "failed") {
        retryHTML = '<button class="ai-agent-retry" data-agent-retry="' + agent.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Retry</button>';
      }

      card.innerHTML =
        '<div class="ai-agent-header">' +
          '<div class="ai-agent-icon' + iconPulse + '">' + agent.icon + '</div>' +
          '<div class="ai-agent-info">' +
            '<div class="ai-agent-name">' + esc(agent.name) + '</div>' +
            '<div class="ai-agent-purpose">' + esc(agent.purpose) + '</div>' +
          '</div>' +
          '<span class="ai-agent-status-badge ' + statusBadgeCls + '"><span class="ai-badge-dot"></span>' + statusLabel + '</span>' +
          '<span class="ai-agent-time">' + formatMs(elapsed) + '</span>' +
          retryHTML +
        '</div>' +
        bodyHTML;

      grid.appendChild(card);
    });

    grid.querySelectorAll("[data-agent-retry]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const agentId = btn.dataset.agentRetry;
        const s = agentStates[agentId];
        if (s) {
          s.status = "pending";
          s.startTime = null;
          s.endTime = null;
          s.outputSummary = "";
          s.sourceCount = 0;
        }
        renderAgentIntelligence();
      });
    });
  }

  function getAnalysisRequirements() {
    return analysisData ? analysisData.requirements : REQUIREMENTS;
  }

  function getAnalysisRegulations() {
    return analysisData ? analysisData.regulations : REGULATIONS;
  }

  function getAnalysisStats() {
    if (!analysisData) return stats();
    const s = { ...analysisData.stats };
    const rb = computeReadiness();
    s.readiness = rb.score;
    return s;
  }

  function getAnalysisCostItems() {
    return analysisData ? analysisData.costItems : COST_ITEMS;
  }

  /* ───────── domain data model (single source of truth) ───────── */
  const STATUS_KEYS = ["pending", "progress", "done"];
  const REQ_STATUSES_KEY = "regulens.reqStatuses";

  const REQUIREMENTS = [];

  function loadReqStatuses() {
    try {
      const map = JSON.parse(localStorage.getItem(REQ_STATUSES_KEY) || "null");
      if (map && typeof map === "object") {
        const reqs = getAnalysisRequirements();
        reqs.forEach((r) => {
          if (STATUS_KEYS.includes(map[r.id])) r.status = map[r.id];
        });
      }
    } catch {}
  }
  loadReqStatuses();

  function saveReqStatuses() {
    try {
      const map = {};
      const reqs = getAnalysisRequirements();
      reqs.forEach((r) => (map[r.id] = r.status));
      localStorage.setItem(REQ_STATUSES_KEY, JSON.stringify(map));
    } catch {}
  }

  function statusCounts() {
    const reqs = getAnalysisRequirements();
    const c = { pending: 0, progress: 0, done: 0 };
    reqs.forEach((r) => c[r.status]++);
    return {
      total: reqs.length,
      critical: reqs.filter((r) => r.priority === "critical").length,
      important: reqs.filter((r) => r.priority === "important").length,
      pending: c.pending,
      inProgress: c.progress,
      completed: c.done,
      nA: 0,
    };
  }

  /* Shared readiness engine (same formula as backend — window.RegulensCore) */
  function computeReadiness() {
    const reqs = getAnalysisRequirements();
    const gaps = analysisData ? (analysisData.gaps || []) : [];
    const risks = analysisData ? (analysisData.riskMatrix || analysisData.risks || []) : [];
    if (window.RegulensCore) {
      return window.RegulensCore.calculateReadiness({ requirements: reqs, gaps, risks });
    }
    /* fallback if core failed to load */
    const done = reqs.filter((r) => r.status === "done").length;
    const applicable = reqs.length;
    const score = applicable ? Math.round((done / applicable) * 100) : 0;
    return { score, status: score >= 95 ? "Ready" : score >= 80 ? "Nearly Ready" : score >= 60 ? "Partially Ready" : score >= 40 ? "High Risk" : "Not Ready", breakdown: {}, reasons: [] };
  }

  function stats() {
    const s = statusCounts();
    s.readiness = computeReadiness().score;
    return s;
  }

  /* ───────── cost & schedule estimates (derived from requirement state) ───────── */
  const COST_ITEMS = [];

  function fmtEUR(n) {
    return "€" + Math.round(n).toLocaleString("en-US");
  }

  function readinessStatus(readiness) {
    if (readiness >= 90) return "Excellent Readiness — Launch recommended";
    if (readiness >= 60) return "Moderate Readiness — Proceed with preparation";
    return "Low Readiness — Significant work required";
  }

  function readinessLabel(readiness) {
    if (readiness >= 90) return "Excellent";
    if (readiness >= 60) return "Moderate";
    return "Low";
  }

  /* ───────── regulation knowledge base ───────── */
  const REGULATIONS = [];

  const MARKET_PROFILES = {};
  const MARKETS = Object.keys(MARKET_PROFILES);
  notifications = buildNotifications();

  function analyzeMarket(marketId) {
    const p = MARKET_PROFILES[marketId];
    return p
      ? { market: p, readiness: 0, cost: 0, days: 0, open: 0, risk: "—", empty: false }
      : { market: null, readiness: 0, cost: 0, days: 0, open: 0, risk: "—", empty: true };
  }


  const PRIORITY_CHIP = { critical: "chip-red", important: "chip-orange", standard: "chip-gray" };
  const STATUS_CHIP = { pending: "chip-red-outline", progress: "chip-orange-outline", done: "chip-green-outline" };
  let reqFilter = "all";

  function reqChip(cls, label) {
    return '<span class="chip ' + cls + '">' + label + "</span>";
  }

  function renderRequirements() {
    if (!els.reqTbody) return;
    const reqs = getAnalysisRequirements();
    const rows = reqs.filter((r) => reqFilter === "all" || r.priority === reqFilter);
    els.reqTbody.innerHTML = "";
    rows.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML =
        "<td>" + r.name + "</td>" +
        "<td>" + r.authority + "</td>" +
        "<td>" + reqChip(PRIORITY_CHIP[r.priority], t("req." + r.priority)) + "</td>" +
        "<td>" + reqChip(STATUS_CHIP[r.status], t("req." + r.status)) + "</td>" +
        "<td>" + (r.due || "—") + "</td>";
      tr.addEventListener("click", () => openReqModal(rows[i]));
      els.reqTbody.appendChild(tr);
    });
    els.reqCount.textContent = t("req.count").replace("{n}", String(rows.length));
  }

  function renderStats() {
    const s = analysisData ? getAnalysisStats() : stats();
    const hasData = !!analysisData;
    const days = hasData ? analysisData.estimatedDays : 0;
    const cost = hasData ? analysisData.estimatedCost : 0;
    const risk = hasData ? analysisData.riskLevel : "—";
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("statTotal", s.total);
    set("statCompleted", s.completed);
    set("statInProgress", s.inProgress);
    set("statPending", s.pending);
    set("statNA", s.nA);
    set("statDays", !hasData ? "—" : days + " days");
    set("statCost", !hasData ? "—" : fmtEUR(cost));
    set("statRisk", !hasData ? "—" : risk);
    set("readinessLabel", !hasData ? "—" : readinessLabel(s.readiness));
    // status list + readiness ring
    document.querySelectorAll("#view-dashboard .status-list li").forEach((li, idx) => {
      const num = li.querySelector("span:not(.status-dot)");
      const vals = [s.critical, s.important, s.completed, s.nA];
      if (num && vals[idx] !== undefined) num.textContent = vals[idx];
    });
    animateRing(readinessRing, readinessValue, !hasData ? 0 : s.readiness);
    // context bar
    if (analysisData) {
      const ctxValues = document.querySelectorAll(".context-card .ctx-value");
      if (ctxValues[0]) ctxValues[0].textContent = analysisData.company;
      if (ctxValues[1]) ctxValues[1].textContent = analysisData.product;
      if (ctxValues[3]) {
        const flag = getMarketFlag(analysisData.targetId);
        ctxValues[3].innerHTML = '<span class="flag" aria-hidden="true">' + flag + '</span> ' + analysisData.target;
      }
    }
    renderVerdict();
    renderTopPending();
    renderDashTimeline();
    renderDashWatch();
  }

  function getMarketFlag(id) {
    const flags = { de: "🇩🇪", fr: "🇫🇷", us: "🇺🇸", uk: "🇬🇧", jp: "🇯🇵", cn: "🇨🇳", in: "🇮🇳", br: "🇧🇷", au: "🇦🇺", ca: "🇨🇦", kr: "🇰🇷", sg: "🇸🇬", ae: "🇦🇪", sa: "🇸🇦", mx: "🇲🇽", it: "🇮🇹", es: "🇪🇸", nl: "🇳🇱", se: "🇸🇪", ch: "🇨🇭", eu: "🇪🇺" };
    return flags[id] || "🌍";
  }

  function transitionReq(r, next) {
    if (r.status === next) return;
    r.status = next;
    if (analysisData) {
      const reqs = analysisData.requirements;
      const s = { total: reqs.length, critical: 0, important: 0, standard: 0, completed: 0, inProgress: 0, pending: 0, nA: 0 };
      reqs.forEach((r) => {
        s[r.priority] = (s[r.priority] || 0) + 1;
        if (r.status === "done") s.completed++;
        else if (r.status === "progress") s.inProgress++;
        else s.pending++;
      });
      analysisData.stats = s;
      /* keep gaps and actions consistent with requirement state */
      const GAP_STATUS = { done: "closed", progress: "in_progress", pending: "open" };
      (analysisData.gaps || []).forEach((g) => { if (g.reqId === r.id) g.status = GAP_STATUS[next]; });
      (analysisData.actions || []).forEach((a) => { if (a.relatedRequirement === r.id) a.status = next; });
      if (window.RegulensCore) {
        analysisData.gapStats = {
          open: analysisData.gaps.filter((g) => !String(g.status).match(/closed|resolved|done/)).length,
          closed: analysisData.gaps.filter((g) => String(g.status).match(/closed|resolved|done/)).length,
          inProgress: 0,
        };
      }
      const rb = computeReadiness();
      analysisData.readiness = rb.score;
      analysisData.readinessStatus = rb.status;
      analysisData.readinessBreakdown = rb;
      if (window.RegulensCore) {
        analysisData.canLaunch = window.RegulensCore.canLaunch(analysisData);
      }
    } else {
      saveReqStatuses();
    }
    renderRequirements();
    renderStats();
    renderGaps();
    renderActions();
    renderCosts();
    renderCompare();
    /* keep every affected visualization in sync with the new status */
    refreshStatusCharts();
  }

  /* Charts that depend on requirement/gap/action state. Only the active
     view's charts are refreshed now; navigating to another view re-renders
     that view's charts (see renderView), so nothing can go stale. */
  function refreshStatusCharts() {
    try {
      if (currentView === "dashboard") renderDashboardCharts();
      else if (currentView === "gap-analysis") renderGapCharts();
      else if (currentView === "risk-matrix") renderRiskMatrixView();
      else if (currentView === "action-plan") renderPlanTimeline();
    } catch (e) { console.warn("Chart refresh after status change failed:", e); }
  }

  function openReqModal(r) {
    els.reqModalTitle.textContent = r.name;
    els.reqModalMeta.textContent = r.authority + " · " + (r.due || t("req.done"));
    els.reqModalDesc.textContent = r.desc;
    els.reqModalPriority.innerHTML = reqChip(PRIORITY_CHIP[r.priority], t("req." + r.priority));
    els.reqModalStatus.innerHTML = reqChip(STATUS_CHIP[r.status], t("req." + r.status));
    els.reqModalActions.innerHTML = "";
    const mk = (label, cls, next, hide) => {
      if (hide) return;
      const b = document.createElement("button");
      b.className = "btn " + cls;
      b.textContent = label;
      b.addEventListener("click", () => {
        transitionReq(r, next);
        closeReqModal();
      });
      els.reqModalActions.appendChild(b);
    };
    mk(t("req.reopen"), "btn-ghost", "pending", r.status === "pending");
    mk(t("req.inProgress"), "btn-outline", "progress", r.status === "progress");
    mk(t("req.complete"), "btn-primary", "done", r.status === "done");
    els.reqModal.classList.remove("hidden");
  }

  function closeReqModal() {
    els.reqModal.classList.add("hidden");
  }

  els.reqModalClose.addEventListener("click", closeReqModal);
  els.reqModal.addEventListener("click", (e) => {
    if (e.target === els.reqModal) closeReqModal();
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((c) => c.classList.toggle("active", c === chip));
      reqFilter = chip.dataset.priority;
      renderRequirements();
    });
  });

  renderRequirements();

  /* ───────── document library ───────── */
  const DOCS_KEY = "regulens.docs";
  const DOC_COLORS = { pdf: "doc-red", xls: "doc-blue", xlsx: "doc-blue", doc: "doc-green", docx: "doc-green", txt: "doc-gray", md: "doc-gray", csv: "doc-gray", json: "doc-gray", html: "doc-gray", xml: "doc-gray", py: "doc-gray", js: "doc-gray", default: "doc-gray" };

  function loadDocs() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DOCS_KEY) || "null");
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
  }

  function saveDocs() {
    try {
      localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    } catch {}
  }

  let docs = loadDocs();
  let currentDoc = null;

  function extColor(name) {
    const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
    return DOC_COLORS[m ? m[1] : "default"] || "doc-gray";
  }

  function extType(name) {
    const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1].toUpperCase() : "FILE";
  }

  function fmtSize(bytes) {
    if (bytes === undefined) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function renderDocs() {
    if (!els.docGrid) return;
    els.docGrid.innerHTML = "";
    docs.forEach((d, i) => {
      const card = document.createElement("div");
      card.className = "card doc-card";
      card.innerHTML =
        '<span class="doc-icon ' + (d.color || extColor(d.name)) + '">' + (d.type || extType(d.name)) + "</span>" +
        '<p class="doc-name"></p><p class="doc-meta"></p>';
      card.querySelector(".doc-name").textContent = d.name;
      card.querySelector(".doc-meta").textContent = (d.desc || "Document") + " · " + (d.size || fmtSize(d.bytes) || "—");
      card.addEventListener("click", () => openDocModal(d));
      els.docGrid.appendChild(card);
    });
    if (!docs.length) {
      const empty = document.createElement("div");
      empty.className = "card doc-card empty-state";
      empty.style.gridColumn = "1 / -1";
      empty.innerHTML = '<p class="doc-empty-title">No documents yet</p><p class="doc-empty-desc">Upload files to build your compliance evidence library.</p>';
      els.docGrid.appendChild(empty);
    }
  }

  function openDocModal(d) {
    currentDoc = d;
    els.docModalTitle.textContent = d.name;
    els.docModalMeta.textContent = (d.desc || "Document") + " · " + (d.size || fmtSize(d.bytes) || "—");
    els.docModalIcon.textContent = d.type || extType(d.name);
    els.docModalIcon.className = "doc-icon " + (d.color || extColor(d.name));
    const hasContent = !!d.content;
    els.docModalPreview.textContent = hasContent ? d.content : t("doc.previewNone");
    els.docModalPreview.classList.toggle("doc-preview-empty", !hasContent);
    els.docModalDownload.disabled = !hasContent;
    els.docModal.classList.remove("hidden");
  }

  function closeDocModal() {
    els.docModal.classList.add("hidden");
    currentDoc = null;
  }

  function downloadDoc() {
    if (!currentDoc) return;
    if (!currentDoc.content) {
      toast("No text content available to download for this file.");
      return;
    }
    const blob = new Blob([currentDoc.content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = currentDoc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  els.docModalClose.addEventListener("click", closeDocModal);
  els.docModalOk.addEventListener("click", closeDocModal);
  els.docModalDownload.addEventListener("click", downloadDoc);
  els.docModal.addEventListener("click", (e) => {
    if (e.target === els.docModal) closeDocModal();
  });

  els.uploadDocBtn.addEventListener("click", () => els.docInput.click());
  els.docInput.addEventListener("change", () => {
    const files = Array.from(els.docInput.files || []);
    els.docInput.value = "";
    files.forEach(async (f) => {
      let content = "";
      if (f.size <= 512 * 1024) {
        try {
          content = await f.text();
        } catch {}
      }
      docs.push({
        id: "u" + Date.now() + Math.random().toString(16).slice(2, 6),
        name: f.name,
        type: extType(f.name),
        size: fmtSize(f.size),
        bytes: f.size,
        desc: "Uploaded",
        color: extColor(f.name),
        content,
      });
      saveDocs();
      renderDocs();
      toast(t("doc.uploaded").replace("{name}", f.name));
    });
  });

  renderDocs();

  /* ───────── policy simulator moved to public/government.js (gov engine) ───────── */

  /* ───────── book a call ───────── */
  els.bookCallBtn.addEventListener("click", () => {
    els.callForm.reset();
    if (user && user.email) els.callEmail.value = user.email;
    els.callModal.classList.remove("hidden");
    els.callEmail.focus();
  });
  els.callModalClose.addEventListener("click", () => els.callModal.classList.add("hidden"));
  els.callModal.addEventListener("click", (e) => {
    if (e.target === els.callModal) els.callModal.classList.add("hidden");
  });
  els.callForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = els.callEmail.value.trim();
    if (!isValidEmail(email)) {
      toast(t("call.invalid"));
      return;
    }
    els.callModal.classList.add("hidden");
    els.callForm.reset();
    toast(t("call.sent"));
  });

  /* ───────── download report (dynamic) ───────── */
  /* ───────── Report Generation System ───────── */
  function generateReportHTML(data, aiReport) {
    const t = (key) => I18N[settings.lang]?.[key] || I18N.en[key] || key;
    const d = data;
    const s = d.stats || {};
    const gs = d.gapStats || {};
    const now = new Date().toISOString().slice(0, 10);
    const readinessColor = d.readiness >= 70 ? "#22c55e" : d.readiness >= 40 ? "#f59e0b" : "#ef4444";
    const riskColor = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" }[d.riskLevel] || "#6b7280";
    const recLabel = aiReport?.recommendation?.recommendation || (d.readiness >= 70 ? "Proceed" : d.readiness >= 40 ? "Conditional" : "Delay");
    const recColor = { Proceed: "#22c55e", Conditional: "#f59e0b", Delay: "#ef4444" }[recLabel] || "#6b7280";
    const recText = t("rpt." + recLabel.toLowerCase()) || recLabel;

    function priorityBadge(p) {
      const c = { critical: "#ef4444", important: "#f59e0b", standard: "#3b82f6" }[p] || "#6b7280";
      return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;color:#fff;background:${c};text-transform:capitalize">${esc(p)}</span>`;
    }
    function statusBadge(st) {
      const c = { pending: "#f59e0b", completed: "#22c55e", "in-progress": "#3b82f6", "not-applicable": "#9ca3af" }[st] || "#6b7280";
      const lbl = t("rpt." + (st === "in-progress" ? "inProgress" : st === "not-applicable" ? "notApplicable" : st)) || st;
      return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;color:#fff;background:${c};text-transform:capitalize">${esc(lbl)}</span>`;
    }

    let reqRows = "";
    (d.requirements || []).forEach((r) => {
      reqRows += `<tr>
        <td>${esc(r.name)}</td>
        <td>${esc(r.authority)}</td>
        <td>${priorityBadge(r.priority)}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${esc(r.due)}</td>
      </tr>`;
    });

    let gapRows = "";
    (d.gaps || []).forEach((g) => {
      gapRows += `<tr>
        <td>${esc(g.title)}</td>
        <td>${esc(g.description)}</td>
        <td>${priorityBadge(g.priority)}</td>
        <td>${priorityBadge(g.severity)}</td>
      </tr>`;
    });

    let actionRows = "";
    (d.actions || []).forEach((a) => {
      actionRows += `<tr>
        <td>${esc(a.title)}</td>
        <td>${esc(a.description)}</td>
        <td>${priorityBadge(a.priority)}</td>
        <td>${esc(a.estimatedDays)} days</td>
        <td>${fmtEUR(a.estimatedCost)}</td>
        <td>${esc(a.owner)}</td>
      </tr>`;
    });

    let costRows = "";
    (d.costItems || []).forEach((c) => {
      costRows += `<tr>
        <td>${esc(c.name)}</td>
        <td>${fmtEUR(c.amount)}</td>
        <td>${esc(c.days)} days</td>
        <td>${esc(c.category)}</td>
      </tr>`;
    });

    let regRows = "";
    (d.regulations || []).forEach((r) => {
      regRows += `<tr>
        <td>${esc(r.flag)} ${esc(r.title)}</td>
        <td>${esc(r.authority)}</td>
        <td>${esc(r.code)}</td>
        <td>${esc(r.source)}</td>
      </tr>`;
    });

    const prereqList = (aiReport?.recommendation?.prerequisites || [])
      .map((p) => `<li style="margin-bottom:6px">${esc(p)}</li>`).join("");

    return `<!DOCTYPE html>
<html lang="${settings.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t("rpt.title")} — ${esc(d.company)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; background: #f8fafc; line-height: 1.6; }
  .report { max-width: 900px; margin: 0 auto; padding: 40px 30px; background: #fff; }
  @media print { .report { padding: 20px; box-shadow: none; } body { background: #fff; } }
  .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #6366f1; }
  .header h1 { font-size: 28px; color: #4f46e5; margin-bottom: 8px; }
  .header .subtitle { font-size: 14px; color: #64748b; }
  .header .logo { font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: -1px; }
  .source-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px; vertical-align: middle; }
  .tag-ai { background: #ede9fe; color: #6d28d9; }
  .tag-reg { background: #dbeafe; color: #1d4ed8; }
  .tag-user { background: #fef3c7; color: #92400e; }
  h2 { font-size: 20px; color: #4f46e5; margin: 36px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
  h3 { font-size: 16px; color: #334155; margin: 20px 0 10px; }
  p { margin-bottom: 12px; color: #475569; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 16px 0; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; }
  .card .label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .card .value { font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 13px; }
  th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:hover td { background: #f8fafc; }
  .score-ring { width: 140px; height: 140px; margin: 20px auto; position: relative; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring .value { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 36px; font-weight: 800; }
  .rec-box { padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid; }
  .rec-box .label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .rec-box .verdict { font-size: 18px; font-weight: 700; }
  .disclaimer { margin-top: 40px; padding: 20px; background: #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; border: 1px solid #fde68a; }
  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  @media print {
    .no-print { display: none !important; }
    .report { max-width: 100%; padding: 15px; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="report">

  <!-- 1. Header -->
  <div class="header">
    <div class="logo">ReguLens</div>
    <h1>${t("rpt.title")}</h1>
    <div class="subtitle">${t("rpt.generated")} &middot; ${now}</div>
  </div>

  <!-- 2. Executive Summary -->
  <h2>${t("rpt.executiveSummary")} <span class="source-tag tag-ai">${t("rpt.aiGenerated")}</span></h2>
  <p>${esc(aiReport?.executiveSummary || "—")}</p>

  <!-- 3. Company Profile -->
  <h2>${t("rpt.companyProfile")} <span class="source-tag tag-user">${t("rpt.userInput")}</span></h2>
  <div class="grid-2">
    <div class="card"><div class="label">${t("rpt.company")}</div><div class="value">${esc(d.company)}</div></div>
    <div class="card"><div class="label">${t("rpt.industry")}</div><div class="value">${esc(d.industry)}</div></div>
  </div>

  <!-- 4. Product Profile -->
  <h2>${t("rpt.productProfile")} <span class="source-tag tag-user">${t("rpt.userInput")}</span></h2>
  <div class="grid-2">
    <div class="card"><div class="label">${t("rpt.product")}</div><div class="value">${esc(d.product)}</div></div>
    <div class="card"><div class="label">${t("rpt.origin")}</div><div class="value">${esc(d.origin)}</div></div>
  </div>

  <!-- 5. Source Market -->
  <h2>${t("rpt.sourceMarket")} <span class="source-tag tag-user">${t("rpt.userInput")}</span></h2>
  <div class="card"><div class="value">${esc(d.origin)}</div></div>

  <!-- 6. Target Market -->
  <h2>${t("rpt.targetMarket")} <span class="source-tag tag-user">${t("rpt.userInput")}</span></h2>
  <div class="grid-2">
    <div class="card"><div class="label">${t("rpt.target")}</div><div class="value">${esc(d.target)}</div></div>
    <div class="card"><div class="label">${t("rpt.riskLevel")}</div><div class="value" style="color:${riskColor}">${esc(d.riskLevel)}</div></div>
  </div>

  <!-- 7. Applicable Regulations -->
  <h2>${t("rpt.applicableRegulations")} <span class="source-tag tag-reg">${t("rpt.regulatorySource")}</span></h2>
  <table>
    <thead><tr><th>${t("rpt.applicableRegulations")}</th><th>${t("rpt.authority")}</th><th>${t("rpt.code")}</th><th>${t("rpt.source")}</th></tr></thead>
    <tbody>${regRows || `<tr><td colspan="4">—</td></tr>`}</tbody>
  </table>

  <!-- 8. Compliance Requirements -->
  <h2>${t("rpt.complianceRequirements")} <span class="source-tag tag-reg">${t("rpt.regulatorySource")}</span></h2>
  <div class="grid-2">
    <div class="card"><div class="label">${t("rpt.critical")}</div><div class="value" style="color:#ef4444">${s.critical || 0}</div></div>
    <div class="card"><div class="label">${t("rpt.important")}</div><div class="value" style="color:#f59e0b">${s.important || 0}</div></div>
    <div class="card"><div class="label">${t("rpt.standard")}</div><div class="value" style="color:#3b82f6">${s.standard || 0}</div></div>
    <div class="card"><div class="label">${t("rpt.pending")}</div><div class="value" style="color:#f59e0b">${s.pending || 0}</div></div>
  </div>
  <table>
    <thead><tr><th>${t("rpt.applicableRegulations")}</th><th>${t("rpt.authority")}</th><th>${t("rpt.priority")}</th><th>${t("rpt.status")}</th><th>${t("rpt.dueDate")}</th></tr></thead>
    <tbody>${reqRows || `<tr><td colspan="5">—</td></tr>`}</tbody>
  </table>

  <!-- 9. Completed Requirements -->
  <h2>${t("rpt.completedReqs")}</h2>
  <p>${(d.requirements || []).filter(r => r.status === "completed").length} / ${(d.requirements || []).length} requirements completed.</p>

  <!-- 10. Pending Requirements -->
  <h2>${t("rpt.pendingReqs")}</h2>
  <p>${(d.requirements || []).filter(r => r.status === "pending").length} requirements pending action.</p>

  <!-- 11. Compliance Gaps -->
  <h2>${t("rpt.complianceGaps")} <span class="source-tag tag-ai">${t("rpt.aiGenerated")}</span></h2>
  <div class="grid-2">
    <div class="card"><div class="label">${t("rpt.gaps")}</div><div class="value" style="color:#ef4444">${gs.open || 0}</div></div>
    <div class="card"><div class="label">${t("rpt.done")}</div><div class="value" style="color:#22c55e">${gs.closed || 0}</div></div>
  </div>
  <table>
    <thead><tr><th>${t("rpt.applicableRegulations")}</th><th>${t("rpt.description")}</th><th>${t("rpt.priority")}</th><th>Severity</th></tr></thead>
    <tbody>${gapRows || `<tr><td colspan="4">—</td></tr>`}</tbody>
  </table>

  <!-- 12. Risk Assessment -->
  <h2>${t("rpt.riskAssessment")} <span class="source-tag tag-ai">${t("rpt.aiGenerated")}</span></h2>
  <div class="card" style="text-align:center;border-color:${riskColor}">
    <div class="label">${t("rpt.riskLevel")}</div>
    <div class="value" style="font-size:28px;color:${riskColor}">${esc(d.riskLevel)}</div>
  </div>

  <!-- 13. Business Impact -->
  <h2>${t("rpt.businessImpact")} <span class="source-tag tag-reg">${t("rpt.regulatorySource")}</span></h2>
  <table>
    <thead><tr><th>${t("rpt.applicableRegulations")}</th><th>${t("rpt.description")}</th><th>Impact</th></tr></thead>
    <tbody>${(d.regulations || []).map(r => `<tr><td>${esc(r.title)}</td><td>${esc(r.impactDesc)}</td><td>${priorityBadge(r.impact)}</td></tr>`).join("") || `<tr><td colspan="3">—</td></tr>`}</tbody>
  </table>

  <!-- 14. Estimated Cost -->
  <h2>${t("rpt.estimatedCost")} <span class="source-tag tag-reg">${t("rpt.regulatorySource")}</span></h2>
  <div class="card" style="text-align:center">
    <div class="label">${t("rpt.totalCost")}</div>
    <div class="value" style="font-size:32px;color:#4f46e5">${fmtEUR(d.estimatedCost)}</div>
  </div>
  <table>
    <thead><tr><th>${t("rpt.applicableRegulations")}</th><th>${t("rpt.estimatedEur")}</th><th>${t("rpt.estimatedDays")}</th><th>${t("rpt.category")}</th></tr></thead>
    <tbody>${costRows || `<tr><td colspan="4">—</td></tr>`}</tbody>
  </table>

  <!-- 15. Estimated Timeline -->
  <h2>${t("rpt.estimatedTimeline")} <span class="source-tag tag-reg">${t("rpt.regulatorySource")}</span></h2>
  <div class="card" style="text-align:center">
    <div class="label">${t("rpt.totalTime")}</div>
    <div class="value" style="font-size:32px;color:#4f46e5">${d.estimatedDays} days</div>
  </div>

  <!-- 16. Recommended Action Plan -->
  <h2>${t("rpt.actionPlan")} <span class="source-tag tag-ai">${t("rpt.aiGenerated")}</span></h2>
  <table>
    <thead><tr><th>${t("rpt.action")}</th><th>${t("rpt.description")}</th><th>${t("rpt.priority")}</th><th>${t("rpt.estimatedDays")}</th><th>${t("rpt.estimatedEur")}</th><th>${t("rpt.owner")}</th></tr></thead>
    <tbody>${actionRows || `<tr><td colspan="6">—</td></tr>`}</tbody>
  </table>

  <!-- 17. Market Readiness Score -->
  <h2>${t("rpt.readinessScore")} <span class="source-tag tag-ai">${t("rpt.aiGenerated")}</span></h2>
  <div class="score-ring">
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="60" fill="none" stroke="#e2e8f0" stroke-width="12"/>
      <circle cx="70" cy="70" r="60" fill="none" stroke="${readinessColor}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${(d.readiness / 100) * 377} 377"/>
    </svg>
    <div class="value" style="color:${readinessColor}">${d.readiness}%</div>
  </div>
  <p style="text-align:center;font-weight:600;color:${readinessColor}">${readinessStatus(d.readiness)}</p>

  <!-- 18. Launch Recommendation -->
  <h2>${t("rpt.launchRecommendation")} <span class="source-tag tag-ai">${t("rpt.aiGenerated")}</span></h2>
  <div class="rec-box" style="border-color:${recColor};background:${recColor}11">
    <div class="label" style="color:${recColor}">${t("rpt.launchRecommendation")}</div>
    <div class="verdict" style="color:${recColor}">${recText}</div>
    <p style="margin-top:10px;color:#475569">${esc(aiReport?.recommendation?.verdict || "")}</p>
  </div>
  ${prereqList ? `<h3>${t("rpt.prerequisites")}</h3><ul style="margin-left:20px">${prereqList}</ul>` : ""}
  <p><strong>${t("rpt.timeline")}:</strong> ${esc(aiReport?.recommendation?.timeline || d.estimatedDays + " days")}</p>

  <!-- 19. Regulatory Sources -->
  <h2>${t("rpt.regulatorySources")} <span class="source-tag tag-reg">${t("rpt.regulatorySource")}</span></h2>
  <table>
    <thead><tr><th>${t("rpt.applicableRegulations")}</th><th>${t("rpt.code")}</th><th>${t("rpt.source")}</th></tr></thead>
    <tbody>${(d.regulations || []).map(r => `<tr><td>${esc(r.title)}</td><td>${esc(r.code)}</td><td>${esc(r.source)}</td></tr>`).join("") || `<tr><td colspan="3">—</td></tr>`}</tbody>
  </table>

  <!-- Disclaimer -->
  <div class="disclaimer">${t("rpt.disclaimer")}</div>

  <!-- Footer -->
  <div class="footer">ReguLens &copy; ${new Date().getFullYear()} &middot; ${t("rpt.generated")} ${now}</div>

</div>
</body>
</html>`;
  }

  let reportAbort = null;
  async function generateReport() {
    const d = analysisData;
    if (!d) {
      toast(t("rpt.noData"));
      return;
    }
    const btn = els.downloadReportBtn;
    if (btn.disabled) return;
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite"></span> ${t("rpt.generating")}`;
    btn.disabled = true;

    if (reportAbort) reportAbort.abort();
    reportAbort = new AbortController();

    let aiReport = null;
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: d, lang: settings.lang }),
        signal: reportAbort.signal,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Report generation failed");
      aiReport = await res.json();
    } catch (err) {
      if (err.name === "AbortError") return;
      console.warn("AI report generation failed, trying demo report:", err);
      try {
        const res2 = await fetch("/api/report/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: d, lang: settings.lang }),
        });
        if (res2.ok) aiReport = await res2.json();
      } catch {}
    } finally {
      btn.innerHTML = origHTML;
      btn.disabled = false;
    }

    try {
      const html = generateReportHTML(d, aiReport);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      toast(t("rpt.download") + " ✓");
    } catch (err) {
      console.warn("Report rendering failed:", err);
      toast("Report rendering failed");
    }
  }

  els.downloadReportBtn.addEventListener("click", generateReport);

  /* ───────── can i launch? verdict ───────── */
  let activeMarket = "de";

  const LAUNCH_BADGE = {
    READY: ["chip-green", "READY"],
    READY_WITH_CONDITIONS: ["chip-orange", "READY WITH CONDITIONS"],
    HIGH_RISK: ["chip-red", "HIGH RISK"],
    NOT_READY: ["chip-red", "NOT READY"],
  };

  function renderVerdict() {
    const s = analysisData ? getAnalysisStats() : stats();
    const hasData = !!analysisData;
    const readiness = hasData ? s.readiness : 0;
    if (els.verdictRing) animateRing(els.verdictRing, els.verdictValue, readiness);
    const title = document.getElementById("verdictTitle");
    if (title) title.textContent = !hasData ? "No analysis available" : readinessStatus(readiness);
    if (els.verdictText) {
      els.verdictText.textContent = !hasData
        ? "Enter your company, product and target market above to generate a launch-readiness analysis."
        : analysisData.company + " is " + readiness + "% ready to launch " + analysisData.product + " in " + analysisData.target +
          ". " + (s.pending > 0 ? "Resolve the " + s.pending + " pending requirements before entering the market to reduce compliance risk." : "All requirements are addressed — you are ready to proceed.");
    }
    /* deterministic launch decision from the shared engine */
    const badge = document.getElementById("verdictBadge");
    const reasonsBox = document.getElementById("verdictReasons");
    if (badge && reasonsBox) {
      badge.classList.add("hidden");
      reasonsBox.innerHTML = "";
      if (hasData) {
        let cl = null;
        try { cl = window.RegulensCore ? window.RegulensCore.canLaunch(analysisData) : analysisData.canLaunch || null; } catch {}
        if (cl) {
          const [cls, label] = LAUNCH_BADGE[cl.state] || ["chip-gray", cl.state];
          badge.className = "chip " + cls;
          badge.textContent = label;
          (cl.reasons || []).forEach((r) => {
            const row = document.createElement("div");
            row.className = "verdict-reason";
            const sevCls = r.severity === "critical" ? "chip-red" : r.severity === "high" ? "chip-orange" : "chip-gray";
            row.innerHTML = '<span class="chip ' + sevCls + '">' + esc(String(r.severity || "info").toUpperCase()) + "</span><div><p></p>" + (r.detail ? "<small></small>" : "") + "</div>";
            row.querySelector("p").textContent = r.label || "";
            if (r.detail) row.querySelector("small").textContent = r.detail;
            if (r.target) {
              row.style.cursor = "pointer";
              const TARGET_VIEW = { requirements: "requirements", gaps: "gap-analysis", risks: "impact-analysis", actions: "action-plan" };
              row.title = "Open " + (TARGET_VIEW[r.target] ? r.target : "analysis");
              row.addEventListener("click", () => navigate(TARGET_VIEW[r.target] || "dashboard"));
            }
            reasonsBox.appendChild(row);
          });
        }
      }
    }
  }

  function renderTopPending() {
    const list = document.getElementById("topPendingList");
    if (!list) return;
    list.innerHTML = "";
    const reqs = getAnalysisRequirements();
    const order = { pending: 0, progress: 1, done: 2 };
    const items = reqs
      .filter((r) => r.status !== "done")
      .sort((x, y) => order[x.status] - order[y.status] || (x.dueDays || 999) - (y.dueDays || 999))
      .slice(0, 3);
    items.forEach((r) => {
        const item = document.createElement("div");
        item.className = "req-item";
        item.style.cursor = "pointer";
        item.innerHTML =
          '<span class="req-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>' +
          '<div class="req-body"><span class="chip ' + PRIORITY_CHIP[r.priority] + '">' + t("req." + r.priority) +
          '</span><p class="req-title"></p><p class="req-desc"></p><p class="req-due">Due in ' + (r.dueDays || "—") + ' days</p></div>';
        item.querySelector(".req-title").textContent = r.name;
        item.querySelector(".req-desc").textContent = r.desc;
        item.addEventListener("click", () => openReqModal(r));
        list.appendChild(item);
    });
    if (!items.length) {
      if (analysisData) {
        list.innerHTML = '<div class="req-item"><div class="req-body"><p class="req-title">All requirements completed</p><p class="req-desc">No pending requirements remain.</p></div></div>';
      } else {
        list.innerHTML = '<div class="req-item"><div class="req-body"><p class="req-title">No pending requirements yet</p><p class="req-desc">Run a launch analysis to identify pending requirements.</p></div></div>';
      }
    }
  }

  function renderDashTimeline() {
    const list = document.getElementById("dashTimeline");
    if (!list) return;
    list.innerHTML = "";
    const reqs = getAnalysisRequirements();
    const order = { critical: 0, important: 1, standard: 2 };
    const PRIORITY_ACTION = { critical: ["chip-red", "High Priority"], important: ["chip-orange", "Medium Priority"], standard: ["chip-green", "Low Priority"] };
    const items = reqs
      .filter((r) => r.status !== "done")
      .sort((x, y) => order[x.priority] - order[y.priority] || (x.dueDays || 999) - (y.dueDays || 999))
      .slice(0, 4);
    items.forEach((r, i) => {
        const li = document.createElement("li");
        li.className = "tl-item";
        li.style.cursor = "pointer";
        const [cls, label] = PRIORITY_ACTION[r.priority];
        li.innerHTML = '<span class="tl-num">' + String(i + 1).padStart(2, "0") + '</span><div class="tl-body"><p class="tl-title"></p><div class="tl-meta"><span class="chip ' + cls + '">' + label + '</span><span class="tl-days">' + (r.dueDays || "—") + " days</span></div></div>";
        li.querySelector(".tl-title").textContent = r.actionTitle || r.name;
        li.addEventListener("click", () => openReqModal(r));
        list.appendChild(li);
    });
    if (!items.length) {
      if (analysisData) {
        list.innerHTML = '<li class="tl-item"><div class="tl-body"><p class="tl-title">All actions completed</p><p class="tl-days">No pending action items.</p></div></li>';
      } else {
        list.innerHTML = '<li class="tl-item"><div class="tl-body"><p class="tl-title">No action items yet</p><p class="tl-days">Run a launch analysis to generate an action plan.</p></div></li>';
      }
    }
  }

  function renderDashWatch() {
    const list = document.getElementById("dashWatchList");
    if (!list) return;
    list.innerHTML = "";
    const regs = getAnalysisRegulations();
    const watch = regs.filter((r) => r.watch).slice(0, 3);
    if (!watch.length) {
      if (analysisData) {
        list.innerHTML = '<div class="watch-item"><span class="chip chip-gray">None</span><p class="watch-title">No regulations flagged for watching</p><p class="watch-meta">All identified regulations are being tracked.</p></div>';
      } else {
        list.innerHTML = '<div class="watch-item"><span class="chip chip-gray">None</span><p class="watch-title">No regulations to watch yet</p><p class="watch-meta">Run a launch analysis to identify regulations.</p></div>';
      }
      return;
    }
    watch.forEach((reg) => {
      const item = document.createElement("div");
      item.className = "watch-item";
      item.style.cursor = "pointer";
      const chipCls = reg.kind === "New" ? "chip-blue" : "chip-orange";
      item.innerHTML = '<span class="chip ' + chipCls + '">' + reg.kind + '</span><p class="watch-title"></p><p class="watch-meta"><span class="flag" aria-hidden="true">' + (reg.flag || "🌍") + '</span> ' + reg.authority + " · Published on " + reg.date + "</p>";
      item.querySelector(".watch-title").textContent = reg.title;
      item.addEventListener("click", () => openRegModal(reg));
      list.appendChild(item);
    });
  }

  /* ───────── gap analysis ───────── */
  function renderGaps() {
    const s = analysisData ? getAnalysisStats() : stats();
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("gapOpen", analysisData ? (analysisData.gapStats ? analysisData.gapStats.open : s.pending + s.inProgress) : s.pending + s.inProgress);
    set("gapClosed", analysisData ? (analysisData.gapStats ? analysisData.gapStats.closed : s.completed) : s.completed);
    set("gapInProgress", analysisData ? (analysisData.gapStats ? analysisData.gapStats.inProgress : s.inProgress) : s.inProgress);
    const list = document.getElementById("gapList");
    if (!list) return;
    list.innerHTML = "";
    const gaps = analysisData ? analysisData.gaps : [];
    if (gaps.length) {
      gaps.forEach((g) => {
        const item = document.createElement("div");
        item.className = "gap-item";
        item.style.cursor = "pointer";
        const pCls = PRIORITY_CHIP[g.priority] || "chip-gray";
        item.innerHTML = '<span class="chip ' + pCls + '">' + (g.priority || "standard") + '</span><div class="gap-body"><p class="gap-title"></p><p class="gap-desc"></p></div>';
        item.querySelector(".gap-title").textContent = g.title;
        item.querySelector(".gap-desc").textContent = g.description;
        list.appendChild(item);
      });
    } else {
      const order = { critical: 0, important: 1, standard: 2 };
      const reqs = getAnalysisRequirements();
      const open = reqs.filter((r) => r.status !== "done").sort((a, b) => order[a.priority] - order[b.priority] || (a.dueDays || 999) - (b.dueDays || 999));
      open.forEach((r) => {
        const item = document.createElement("div");
        item.className = "gap-item";
        item.style.cursor = "pointer";
        item.innerHTML = '<span class="chip ' + PRIORITY_CHIP[r.priority] + '">' + t("req." + r.priority) + '</span><div class="gap-body"><p class="gap-title"></p><p class="gap-desc"></p></div>';
        item.querySelector(".gap-title").textContent = r.gapTitle || r.name;
        item.querySelector(".gap-desc").textContent = r.gapDesc || r.desc;
        item.addEventListener("click", () => openReqModal(r));
        list.appendChild(item);
      });
    }
    if (!gaps.length && !analysisData) {
      list.innerHTML = '<div class="gap-item"><span class="chip chip-gray">None</span><div class="gap-body"><p class="gap-title">No compliance data yet</p><p class="gap-desc">Run a launch analysis to identify compliance gaps.</p></div></div>';
    }
  }

  /* ───────── action plan ───────── */
  function renderActions() {
    const list = document.getElementById("actionTimeline");
    if (!list) return;
    list.innerHTML = "";
    const order = { critical: 0, important: 1, standard: 2 };
    const PRIORITY_ACTION = { critical: ["chip-red", "High Priority"], important: ["chip-orange", "Medium Priority"], standard: ["chip-green", "Low Priority"] };
    const reqs = getAnalysisRequirements();
    const open = reqs.filter((r) => r.status !== "done").sort((a, b) => order[a.priority] - order[b.priority] || (a.dueDays || 999) - (b.dueDays || 999));
    open.forEach((r, i) => {
      const li = document.createElement("li");
      li.className = "tl-item";
      li.style.cursor = "pointer";
      const [cls, label] = PRIORITY_ACTION[r.priority];
      li.innerHTML = '<span class="tl-num">' + String(i + 1).padStart(2, "0") + '</span><div class="tl-body"><p class="tl-title"></p><div class="tl-meta"><span class="chip ' + cls + '">' + label + '</span><span class="tl-days">' + (r.dueDays || "—") + " days</span></div></div>";
      li.querySelector(".tl-title").textContent = r.actionTitle || r.name;
      li.addEventListener("click", () => openReqModal(r));
      list.appendChild(li);
    });
    if (!open.length) {
      if (analysisData) {
        list.innerHTML = '<div class="gap-item"><span class="chip chip-green">Complete</span><div class="gap-body"><p class="gap-title">All actions completed</p><p class="gap-desc">No pending action items remain.</p></div></div>';
      } else {
        list.innerHTML = '<div class="gap-item"><span class="chip chip-gray">Empty</span><div class="gap-body"><p class="gap-title">No action plan available yet</p><p class="gap-desc">Run a launch analysis to generate a compliance action plan.</p></div></div>';
      }
    }
  }

  /* ───────── cost estimator ───────── */
  function renderCosts() {
    const hasData = !!analysisData;
    const days = hasData ? analysisData.estimatedDays : 0;
    const cost = hasData ? analysisData.estimatedCost : 0;
    const risk = hasData ? analysisData.riskLevel : "—";
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("costDays", !hasData ? "—" : days + " days");
    set("costTotal", !hasData ? "—" : fmtEUR(cost));
    set("costRisk", !hasData ? "—" : risk);
    const tbody = document.getElementById("costTbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    const items = getAnalysisCostItems();
    if (!items.length) {
      if (hasData) {
        tbody.innerHTML = '<tr><td class="empty-cell" colspan="3">Cost breakdown will appear as requirements are addressed.</td></tr>';
      } else {
        tbody.innerHTML = '<tr><td class="empty-cell" colspan="3">No cost data yet. Complete your product analysis to see estimates.</td></tr>';
      }
      return;
    }
    items.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = "<td>" + item.name + "</td><td>" + fmtEUR(item.amount) + "</td><td>" + (item.days || "—") + " days</td>";
      tbody.appendChild(tr);
    });
  }

  /* ───────── regulation watch ───────── */
  function openRegModal(reg) {
    els.regModalTitle.textContent = reg.title;
    els.regModalMeta.textContent = reg.flag + " " + reg.authority + " · " + reg.kind + " · " + reg.date;
    els.regModalSummary.textContent = reg.summary;
    els.regModalSource.textContent = reg.source + " · " + reg.code;
    els.regModal.classList.remove("hidden");
  }
  function closeRegModal() {
    els.regModal.classList.add("hidden");
  }
  els.regModalClose.addEventListener("click", closeRegModal);
  els.regModalOk.addEventListener("click", closeRegModal);
  els.regModal.addEventListener("click", (e) => {
    if (e.target === els.regModal) closeRegModal();
  });

  function renderWatch() {
    const list = document.getElementById("watchList");
    if (!list) return;
    list.innerHTML = "";
    const regs = getAnalysisRegulations();
    const watch = regs.filter((r) => r.watch);
    watch.forEach((reg) => {
      const item = document.createElement("div");
      item.className = "watch-item";
      item.style.cursor = "pointer";
      const chipCls = reg.kind === "New" ? "chip-blue" : "chip-orange";
      item.innerHTML = '<span class="chip ' + chipCls + '">' + reg.kind + '</span><p class="watch-title"></p><p class="watch-meta"><span class="flag" aria-hidden="true">' + (reg.flag || "🌍") + '</span> ' + reg.authority + " · Published on " + reg.date + "</p>";
      item.querySelector(".watch-title").textContent = reg.title;
      item.addEventListener("click", () => openRegModal(reg));
      list.appendChild(item);
    });
    if (!watch.length) {
      if (analysisData) {
        list.innerHTML = '<div class="watch-item"><span class="chip chip-gray">None</span><p class="watch-title">No regulations flagged for watching</p></div>';
      } else {
        list.innerHTML = '<div class="watch-item"><span class="chip chip-gray">None</span><p class="watch-title">No regulations being watched</p></div>';
      }
    }
  }

  /* ───────── updates ───────── */
  function renderUpdates() {
    const list = document.getElementById("updateList");
    if (!list) return;
    list.innerHTML = "";
    let updates = [];
    if (analysisData && analysisData.regulatoryUpdates && analysisData.regulatoryUpdates.length) {
      updates = analysisData.regulatoryUpdates;
    } else {
      const regs = getAnalysisRegulations();
      updates = regs.filter((r) => r.update);
    }
    updates.forEach((u) => {
      const item = document.createElement("div");
      item.className = "update-item";
      item.style.cursor = "pointer";
      item.innerHTML = '<span class="update-date"></span><p class="update-title"></p><p class="update-desc"></p>';
      item.querySelector(".update-date").textContent = u.date || "—";
      item.querySelector(".update-title").textContent = u.title || "Update";
      item.querySelector(".update-desc").textContent = u.description || u.updateDesc || u.summary || "";
      const matchingReg = (getAnalysisRegulations()).find((r) => r.title === u.title);
      if (matchingReg) item.addEventListener("click", () => openRegModal(matchingReg));
      list.appendChild(item);
    });
    if (!updates.length) {
      if (analysisData) {
        list.innerHTML = '<div class="update-item"><span class="update-date">—</span><p class="update-title">No recent updates</p><p class="update-desc">No regulatory updates identified in the analysis.</p></div>';
      } else {
        list.innerHTML = '<div class="update-item"><span class="update-date">—</span><p class="update-title">No updates</p><p class="update-desc">Nothing has changed recently.</p></div>';
      }
    }
  }

  /* ───────── impact analysis ───────── */
  const IMPACT_CHIP = { high: "chip-red", medium: "chip-orange", low: "chip-green" };
  function renderImpact() {
    const hasData = !!analysisData;
    const readiness = hasData ? getAnalysisStats().readiness : 0;
    const cost = hasData ? analysisData.estimatedCost : 0;
    const days = hasData ? analysisData.estimatedDays : 0;
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("impactReadiness", !hasData ? "—" : readiness + "%");
    set("impactCost", !hasData ? "—" : fmtEUR(cost));
    set("impactDays", !hasData ? "—" : days + " days");
    const list = document.getElementById("impactList");
    if (!list) return;
    list.innerHTML = "";
    const regs = getAnalysisRegulations();
    const sev = { high: 0, medium: 1, low: 2 };
    const impacts = regs.filter((r) => r.impact).sort((x, y) => sev[x.impact] - sev[y.impact]);
    if (!impacts.length) {
      if (hasData) {
        list.innerHTML = '<div class="gap-item"><span class="chip chip-gray">None</span><div class="gap-body"><p class="gap-title">No impact data identified</p><p class="gap-desc">Regulatory impacts for your product will appear here.</p></div></div>';
      } else {
        list.innerHTML = '<div class="gap-item"><span class="chip chip-gray">None</span><div class="gap-body"><p class="gap-title">No impact data yet</p><p class="gap-desc">Run a launch analysis to see regulatory impacts.</p></div></div>';
      }
      return;
    }
    impacts.forEach((reg) => {
      const item = document.createElement("div");
      item.className = "gap-item";
      item.style.cursor = "pointer";
      item.innerHTML = '<span class="chip ' + IMPACT_CHIP[reg.impact] + '">' + reg.impact.charAt(0).toUpperCase() + reg.impact.slice(1) + '</span><div class="gap-body"><p class="gap-title"></p><p class="gap-desc"></p></div>';
      item.querySelector(".gap-title").textContent = reg.impactTitle;
      item.querySelector(".gap-desc").textContent = reg.impactDesc;
      item.addEventListener("click", () => openRegModal(reg));
      list.appendChild(item);
    });
  }

  /* ───────── industry impact (gov engine via government.js) ───────── */
  function renderIndustry() {
    if (window.ReguLensGov) window.ReguLensGov.refresh();
  }

  /* ───────── compare scenarios (gov engine via government.js) ───────── */
  function renderCompare() {
    if (window.ReguLensGov) window.ReguLensGov.refresh();
  }

  /* ───────── can i launch? analysis form ───────── */
  function populateAnalysisForm() {
    const prevTarget = els.aiTarget.value;
    const prevIndustry = els.aiIndustry.value;

    function renderDropdowns(data) {
      els.aiTarget.innerHTML = '<option value="" disabled selected>Select target market…</option>';
      data.markets.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        els.aiTarget.appendChild(opt);
      });

      els.aiIndustry.innerHTML = '<option value="" disabled selected>Select industry…</option>';
      data.industries.forEach((ind) => {
        const opt = document.createElement("option");
        opt.value = ind.id;
        opt.textContent = ind.name;
        els.aiIndustry.appendChild(opt);
      });

      if (analysisData && analysisData.targetId) {
        els.aiTarget.value = analysisData.targetId;
      } else if (prevTarget) {
        els.aiTarget.value = prevTarget;
      }
      if (analysisData && analysisData.industry) {
        els.aiIndustry.value = analysisData.industry;
      } else if (prevIndustry) {
        els.aiIndustry.value = prevIndustry;
      }
    }

    const localData = { markets: TARGET_MARKETS, industries: INDUSTRIES };

    fetch("/api/markets")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((data) => {
        if (Array.isArray(data.markets) && data.markets.length > 0 && Array.isArray(data.industries) && data.industries.length > 0) {
          renderDropdowns(data);
        } else {
          renderDropdowns(localData);
        }
      })
      .catch(() => { renderDropdowns(localData); });
  }

  /* ───────── region selection event listeners (Can I Launch?) ───────── */
  loadCountryRegions().then(() => {
    els.aiOrigin.addEventListener("change", () => {
      handleOriginCountryChange(els.aiOrigin, els.aiOriginRegion, els.aiOriginRegionRow, els.aiOriginRegionLabel);
    });
    els.aiTarget.addEventListener("change", () => {
      handleTargetCountryChange(els.aiTarget, els.aiTargetRegion, els.aiTargetRegionRow, els.aiTargetRegionLabel);
    });
    els.fbOrigin.addEventListener("change", () => {
      handleOriginCountryChange(els.fbOrigin, els.fbOriginRegion, els.fbOriginRegionRow, els.fbOriginRegionLabel);
    });
    els.fbTarget.addEventListener("change", () => {
      handleTargetCountryChange(els.fbTarget, els.fbTargetRegion, els.fbTargetRegionRow, els.fbTargetRegionLabel);
    });
    els.pcTarget.addEventListener("change", () => {
      handleTargetCountryChange(els.pcTarget, els.pcTargetRegion, els.pcTargetRegionRow, els.pcTargetRegionLabel);
    });
    if (els.aiOrigin.value) {
      const cc = getCountryCode(els.aiOrigin.value);
      populateRegionDropdown(els.aiOriginRegion, cc);
      showRegionField(els.aiOriginRegionRow, els.aiOriginRegionLabel, cc);
    }
    if (els.aiTarget.value) {
      const cc = getCountryCode(els.aiTarget.value);
      populateRegionDropdown(els.aiTargetRegion, cc);
      showRegionField(els.aiTargetRegionRow, els.aiTargetRegionLabel, cc);
    }
  });

  els.aiRunBtn.addEventListener("click", () => {
    const company = (els.aiCompany.value || "").trim();
    const product = (els.aiProduct.value || "").trim();
    const origin = els.aiOrigin.value || "India";
    const originRegion = els.aiOriginRegion ? els.aiOriginRegion.value : "";
    const target = els.aiTarget.value;
    const targetRegion = els.aiTargetRegion ? els.aiTargetRegion.value : "";
    const industry = els.aiIndustry.value;

    if (!company) { toast("Please enter your company name."); return; }
    if (!product) { toast("Please enter your product name."); return; }
    if (!target) { toast("Please select a target market."); return; }
    if (!industry) { toast("Please select an industry."); return; }

    startAnalysis({ company, product, origin, originRegion, target, targetRegion, industry });
  });

  /* ───────── feasibility analyzer ─────────
     Honest AI evaluation with a deterministic fallback. The response's
     "mode" ("ai" | "demo") is always shown so demo estimates are never
     presented as AI output. */
  const FEAS_KEY = "regulens.feasibility.v1";
  const FEAS_TONES = { Proceed: "tone-proceed", Conditional: "tone-conditional", Delay: "tone-delay" };

  function loadCachedFeasibility() {
    try {
      const raw = localStorage.getItem(FEAS_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.feasibility && data.feasibility.verdict) return data;
    } catch {}
    return null;
  }

  function populateFeasibilityForm() {
    if (els.fbTarget && !els.fbTarget.options.length) {
      const ph = document.createElement("option");
      ph.value = "";
      ph.disabled = true;
      ph.selected = true;
      ph.textContent = t("feas.selectMarket");
      els.fbTarget.appendChild(ph);
      TARGET_MARKETS.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        els.fbTarget.appendChild(opt);
      });
    }
    if (els.fbIndustry && !els.fbIndustry.options.length) {
      const ph = document.createElement("option");
      ph.value = "";
      ph.disabled = true;
      ph.selected = true;
      ph.textContent = t("feas.selectIndustry");
      els.fbIndustry.appendChild(ph);
      INDUSTRIES.forEach((ind) => {
        const opt = document.createElement("option");
        opt.value = ind.id;
        opt.textContent = ind.name;
        els.fbIndustry.appendChild(opt);
      });
    }
    if (analysisData) {
      if (!els.fbCompany.value) els.fbCompany.value = analysisData.company || "";
      if (!els.fbProduct.value) els.fbProduct.value = analysisData.product || "";
      if (analysisData.origin) {
        for (const opt of els.fbOrigin.options) {
          if (opt.value === analysisData.origin) { els.fbOrigin.value = analysisData.origin; break; }
        }
      }
      if (analysisData.targetId) els.fbTarget.value = analysisData.targetId;
      if (analysisData.industry) els.fbIndustry.value = analysisData.industry;
    }
  }

  function renderFeasibilityResult(data) {
    const f = data.feasibility || {};
    els.fbEmptyState.classList.add("hidden");
    els.fbResultWrap.classList.remove("hidden");

    els.fbVerdictBanner.className = "fb-verdict " + (FEAS_TONES[f.verdict] || "tone-conditional");
    els.fbVerdictBadge.textContent = f.verdict || "—";
    els.fbMode.textContent = data.mode === "ai" ? t("feas.modeAi") : t("feas.modeDemo");
    els.fbSummary.textContent = f.summary || "";
    els.fbCompetition.textContent = f.competitionLevel || "—";
    els.fbCapital.textContent = f.capitalEstimate || "—";
    els.fbTimeline.textContent = f.timeline || "—";

    const fillList = (ul, items) => {
      ul.innerHTML = "";
      (items || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      ul.classList.toggle("hidden", !(items || []).length);
    };
    fillList(els.fbStrengths, f.strengths);
    fillList(els.fbConcerns, f.concerns);

    els.fbRisks.innerHTML = "";
    (f.risks || []).forEach((r) => {
      const chip = document.createElement("span");
      chip.className = "sev-badge sev-" + String(r.severity || "Medium").toLowerCase();
      chip.textContent = r.title + " · " + sevLabel(String(r.severity || "medium").toLowerCase());
      els.fbRisks.appendChild(chip);
    });

    els.fbRecs.innerHTML = "";
    (f.recommendations || []).forEach((rec) => {
      const li = document.createElement("li");
      li.textContent = rec;
      els.fbRecs.appendChild(li);
    });
    els.fbRecs.classList.toggle("hidden", !(f.recommendations || []).length);

    if (window.ReguLensCharts) {
      chartGuard("fbGaugeCanvas", Number.isFinite(f.marketFitScore));
      window.ReguLensCharts.createGaugeChart("fbGaugeCanvas", f.marketFitScore || 0, 100, t("feas.fitScore"));
    }
  }

  async function runFeasibility() {
    const company = (els.fbCompany.value || "").trim();
    const product = (els.fbProduct.value || "").trim();
    if (!company) { toast(t("feas.errCompany")); return; }
    if (!product) { toast(t("feas.errProduct")); return; }

    const btn = els.fbRunBtn;
    btn.disabled = true;
    btn.classList.add("loading");
    btn.textContent = t("feas.running");
    els.fbRunStatus.textContent = "";

    try {
      const res = await api("/api/feasibility", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          company,
          product,
          origin: els.fbOrigin.value || "",
          originRegion: els.fbOriginRegion ? els.fbOriginRegion.value : "",
          target: els.fbTarget.value || "",
          targetRegion: els.fbTargetRegion ? els.fbTargetRegion.value : "",
          industry: els.fbIndustry.value || "",
          notes: (els.fbNotes.value || "").trim(),
        }),
      });
      const data = await res.json();
      try { localStorage.setItem(FEAS_KEY, JSON.stringify(data)); } catch {}
      renderFeasibilityResult(data);
    } catch (err) {
      els.fbRunStatus.textContent = err.message || t("feas.errFailed");
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
      btn.textContent = t("feas.run");
    }
  }

  function renderFeasibility() {
    populateFeasibilityForm();
    const cached = loadCachedFeasibility();
    if (cached) renderFeasibilityResult(cached);
    else {
      els.fbResultWrap.classList.add("hidden");
      els.fbEmptyState.classList.remove("hidden");
    }
  }

  els.fbRunBtn.addEventListener("click", runFeasibility);

  /* ───────── step-by-step setup guide ─────────
     Sequential launch checklist derived from the analysis action plan.
     Completion state is stored locally; no data is invented. */
  const GUIDE_DONE_KEY = "regulens.guideDone.v1";
  const guidePhaseKeys = ["guide.phase1", "guide.phase2", "guide.phase3", "guide.phase4"];
  /* priority -> existing sev-badge tone class */
  const GUIDE_PRIORITY_SEV = { critical: "critical", important: "medium", standard: "low" };

  function guideDoneSet() {
    try {
      const arr = JSON.parse(localStorage.getItem(GUIDE_DONE_KEY) || "[]");
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function saveGuideDone(set) {
    try { localStorage.setItem(GUIDE_DONE_KEY, JSON.stringify([...set])); } catch {}
  }

  function guidePhaseOf(dueDays) {
    if (dueDays <= 30) return { key: "guide.phase1", idx: 0 };
    if (dueDays <= 90) return { key: "guide.phase2", idx: 1 };
    if (dueDays <= 180) return { key: "guide.phase3", idx: 2 };
    return { key: "guide.phase4", idx: 3 };
  }

  function renderSetupGuide() {
    const actions = analysisData && Array.isArray(analysisData.actions) ? analysisData.actions : [];
    if (!actions.length) {
      els.guideWrap.classList.add("hidden");
      els.guideEmptyState.classList.remove("hidden");
      chartGuard("guideGauge", false);
      return;
    }
    els.guideEmptyState.classList.add("hidden");
    els.guideWrap.classList.remove("hidden");

    const doneSet = guideDoneSet();
    const steps = actions.map((a, i) => ({
      id: a.reqId || "step-" + i,
      title: a.title || a.name || "Step",
      desc: a.description || "",
      owner: a.owner || "",
      dueDays: Number(a.dueDays) || 9999,
      priority: a.priority || "standard",
    }));
    steps.sort((x, y) => x.dueDays - y.dueDays);

    const phases = [[], [], [], []];
    steps.forEach((s) => phases[guidePhaseOf(s.dueDays).idx].push(s));

    els.guidePhases.innerHTML = "";
    let doneCount = 0;

    phases.forEach((phaseSteps, pi) => {
      if (!phaseSteps.length) return;
      const phaseDone = phaseSteps.filter((s) => doneSet.has(s.id)).length;
      doneCount += phaseDone;

      const phaseEl = document.createElement("div");
      phaseEl.className = "guide-phase";
      const head = document.createElement("div");
      head.className = "guide-phase-head";
      head.innerHTML =
        '<span class="guide-phase-title">' + esc(t(guidePhaseKeys[pi])) + "</span>" +
        '<span class="guide-phase-count">' + phaseDone + "/" + phaseSteps.length + "</span>";
      phaseEl.appendChild(head);

      phaseSteps.forEach((s, si) => {
        const isDone = doneSet.has(s.id);
        const row = document.createElement("label");
        row.className = "guide-step" + (isDone ? " done" : "");
        row.innerHTML =
          '<input type="checkbox" ' + (isDone ? "checked" : "") + " />" +
          '<span class="guide-step-num">' + (steps.indexOf(s) + 1) + "</span>" +
          '<span class="guide-step-body"><span class="guide-step-title">' + esc(s.title) + "</span>" +
          (s.desc ? '<span class="guide-step-desc">' + esc(s.desc) + "</span>" : "") +
          "</span>" +
          '<span class="guide-step-meta">' +
          (s.owner ? '<span class="chip chip-gray">' + esc(s.owner) + "</span>" : "") +
          '<span class="sev-badge sev-' + GUIDE_PRIORITY_SEV[s.priority] + '">' + sevLabel(s.priority) + "</span>" +
          "</span>";

        row.querySelector("input").addEventListener("change", (e) => {
          const set = guideDoneSet();
          if (e.target.checked) set.add(s.id);
          else set.delete(s.id);
          saveGuideDone(set);
          renderSetupGuideProgress(steps.length, set.size);
          row.classList.toggle("done", e.target.checked);
        });
        phaseEl.appendChild(row);
      });
      els.guidePhases.appendChild(phaseEl);
    });

    renderSetupGuideProgress(steps.length, doneCount);
  }

  function renderSetupGuideProgress(total, done) {
    const label = document.getElementById("guideProgressLabel");
    if (label) label.textContent = done + "/" + total;
    const pct = total ? Math.round((done / total) * 100) : 0;
    chartGuard("guideGauge", total > 0);
    if (window.ReguLensCharts) {
      window.ReguLensCharts.createGaugeChart("guideGauge", pct, 100, pct + "%");
    }
  }

  els.guideResetBtn.addEventListener("click", () => {
    saveGuideDone(new Set());
    renderSetupGuide();
  });

  /* ───────── AI country policy checker ───────── */
  const PC_KEY = "regulens.policyCheck.v1";

  function loadCachedPolicy() {
    try {
      const raw = localStorage.getItem(PC_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.check && data.check.answer) return data;
    } catch {}
    return null;
  }

  function populatePolicyForm() {
    if (els.pcTarget && !els.pcTarget.options.length) {
      const ph = document.createElement("option");
      ph.value = "";
      ph.disabled = true;
      ph.selected = true;
      ph.textContent = t("feas.selectMarket");
      els.pcTarget.appendChild(ph);
      TARGET_MARKETS.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        els.pcTarget.appendChild(opt);
      });
    }
    if (els.pcIndustry && !els.pcIndustry.options.length) {
      const any = document.createElement("option");
      any.value = "";
      any.textContent = t("pc.anyIndustry");
      els.pcIndustry.appendChild(any);
      INDUSTRIES.forEach((ind) => {
        const opt = document.createElement("option");
        opt.value = ind.id;
        opt.textContent = ind.name;
        els.pcIndustry.appendChild(opt);
      });
    }
    if (analysisData) {
      if (analysisData.targetId && !els.pcTarget.value) els.pcTarget.value = analysisData.targetId;
      if (analysisData.industry && !els.pcIndustry.value) els.pcIndustry.value = analysisData.industry;
      if (analysisData.product && !els.pcProduct.value) els.pcProduct.value = analysisData.product;
    }
  }

  function renderPolicyResult(data) {
    const c = data.check || {};
    els.pcEmptyState.classList.add("hidden");
    els.pcResultWrap.classList.remove("hidden");

    els.pcMode.textContent = data.mode === "ai" ? t("feas.modeAi") : t("feas.modeDemo");
    els.pcTopic.textContent = c.topic || "";
    els.pcTopic.classList.toggle("hidden", !c.topic);
    els.pcAnswer.textContent = c.answer || "";

    const fillList = (ul, items, ordered) => {
      ul.innerHTML = "";
      (items || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      ul.classList.toggle("hidden", !(items || []).length);
    };
    fillList(els.pcObligations, c.obligations);
    fillList(els.pcWatchouts, c.watchouts);
    fillList(els.pcFollowUp, c.followUp);
  }

  function renderPolicyChecker() {
    populatePolicyForm();
    const cached = loadCachedPolicy();
    if (cached) renderPolicyResult(cached);
    else {
      els.pcResultWrap.classList.add("hidden");
      els.pcEmptyState.classList.remove("hidden");
    }
  }

  async function runPolicyCheck() {
    const target = els.pcTarget.value || "";
    const question = (els.pcQuestion.value || "").trim();
    if (!target) { toast(t("pc.errMarket")); return; }
    if (question.length < 8) { toast(t("pc.errQuestion")); return; }

    const btn = els.pcRunBtn;
    btn.disabled = true;
    btn.classList.add("loading");
    btn.textContent = t("pc.running");
    els.pcRunStatus.textContent = "";

    try {
      const res = await api("/api/policy-check", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          target,
          targetRegion: els.pcTargetRegion ? els.pcTargetRegion.value : "",
          industry: els.pcIndustry.value || "",
          product: (els.pcProduct.value || "").trim(),
          question,
        }),
      });
      const data = await res.json();
      try { localStorage.setItem(PC_KEY, JSON.stringify(data)); } catch {}
      renderPolicyResult(data);
    } catch (err) {
      els.pcRunStatus.textContent = err.message || t("pc.errFailed");
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
      btn.textContent = t("pc.run");
    }
  }

  els.pcRunBtn.addEventListener("click", runPolicyCheck);

  /* ───────── business health monitor ─────────
     Scorecard computed live from real project state: requirement
     statuses, gap closure, risk register and document library. */
  const BH_SEV_WEIGHTS = { Critical: 15, High: 10, Medium: 5, Low: 2 };

  function computeBusinessHealth() {
    if (!analysisData) return null;

    const reqs = getAnalysisRequirements();
    const counts = statusCounts();
    const complianceScore = counts.total
      ? Math.round(((counts.completed + counts.inProgress * 0.5) / counts.total) * 100)
      : 0;

    const gs = analysisData.gapStats || {};
    const gapTotal = (gs.open || 0) + (gs.closed || 0) + (gs.inProgress || 0);
    const gapScore = gapTotal
      ? Math.round((((gs.closed || 0) + (gs.inProgress || 0) * 0.5) / gapTotal) * 100)
      : null;

    const risks = Array.isArray(analysisData.riskMatrix) ? analysisData.riskMatrix : [];
    let riskPenalty = 0;
    risks.forEach((r) => {
      const w = BH_SEV_WEIGHTS[r.severity] != null ? BH_SEV_WEIGHTS[r.severity] : 3;
      riskPenalty += r.status && r.status !== "Open" ? w * 0.3 : w;
    });
    const riskScore = risks.length ? Math.max(0, Math.min(100, Math.round(100 - riskPenalty))) : null;

    const docsCount = Array.isArray(docs) ? docs.length : 0;
    const docsTarget = Math.max(3, Math.min(10, Math.ceil(counts.total / 3)));
    const docScore = Math.min(100, Math.round((docsCount / docsTarget) * 100));

    const components = [
      { key: "bh.comp.compliance", score: complianceScore },
      gapScore !== null ? { key: "bh.comp.gaps", score: gapScore } : null,
      riskScore !== null ? { key: "bh.comp.risk", score: riskScore } : null,
      { key: "bh.comp.docs", score: docScore },
    ].filter(Boolean);

    const overall = Math.round(components.reduce((s, c) => s + c.score, 0) / components.length);
    return { overall, components, reqs, counts, risks, docsCount };
  }

  function computeHealthSignals(h) {
    const signals = [];

    /* overdue / imminent critical requirements still pending */
    const dueCritical = h.reqs.filter(
      (r) => r.priority === "critical" && r.status !== "done" && Number(r.dueDays) <= 30
    );
    if (dueCritical.length >= 3) {
      signals.push({ sev: "critical", key: "bh.sig.criticalDue", n: dueCritical.length });
    } else if (dueCritical.length > 0) {
      signals.push({ sev: "high", key: "bh.sig.criticalDueFew", n: dueCritical.length });
    }

    /* nothing moving while work piles up */
    if (h.counts.pending > 0 && h.counts.inProgress === 0 && h.counts.completed === 0) {
      signals.push({ sev: "medium", key: "bh.sig.stalled" });
    }

    /* action plan items without an owner */
    const actions = Array.isArray(analysisData.actions) ? analysisData.actions : [];
    const unowned = actions.filter((a) => !a.owner).length;
    if (actions.length >= 4 && unowned / actions.length > 0.5) {
      signals.push({ sev: "medium", key: "bh.sig.unowned", n: unowned });
    }

    /* timeline compression: many near-term deadlines at once */
    const soonActions = actions.filter((a) => Number(a.dueDays) <= 30).length;
    if (soonActions >= 5) {
      signals.push({ sev: "high", key: "bh.sig.compression", n: soonActions });
    }

    /* thin documentation relative to scope */
    if (h.counts.total >= 6 && h.docsCount < 3) {
      signals.push({ sev: "medium", key: "bh.sig.thinDocs", n: h.docsCount });
    }

    /* elevated open-risk concentration */
    const elevated = h.risks.filter(
      (r) => (r.severity === "Critical" || r.severity === "High") && (!r.status || r.status === "Open")
    ).length;
    if (elevated >= 4) {
      signals.push({ sev: "critical", key: "bh.sig.riskCluster", n: elevated });
    }

    return signals;
  }

  function bhBarRow(labelText, score) {
    const row = document.createElement("div");
    row.className = "bh-bar-row";
    const tone = score >= 70 ? "good" : score >= 45 ? "warn" : "bad";
    row.innerHTML =
      '<span class="bh-bar-label"></span>' +
      '<span class="bh-bar"><span class="bh-bar-fill tone-' + tone + '" style="width:' + Math.max(2, score) + '%"></span></span>' +
      '<span class="bh-bar-value">' + score + "</span>";
    row.querySelector(".bh-bar-label").textContent = labelText;
    return row;
  }

  function renderBusinessHealth() {
    const health = computeBusinessHealth();
    if (!health) {
      els.bhWrap.classList.add("hidden");
      els.bhEmptyState.classList.remove("hidden");
      chartGuard("bhGaugeCanvas", false);
      return;
    }
    els.bhEmptyState.classList.add("hidden");
    els.bhWrap.classList.remove("hidden");

    /* grade + status */
    const grade = health.overall >= 85 ? "A" : health.overall >= 70 ? "B" : health.overall >= 55 ? "C" : health.overall >= 40 ? "D" : "F";
    els.bhGrade.textContent = grade;
    els.bhGrade.className = "chip " + (grade === "A" || grade === "B" ? "chip-green" : grade === "C" ? "chip-orange" : "chip-red");

    const statusKey = health.overall >= 70 ? "bh.status.healthy" : health.overall >= 45 ? "bh.status.attention" : "bh.status.critical";
    els.bhStatusLabel.textContent = t(statusKey);

    chartGuard("bhGaugeCanvas", true);
    if (window.ReguLensCharts) {
      window.ReguLensCharts.createGaugeChart("bhGaugeCanvas", health.overall, 100, t("bh.score"));
    }

    /* component bars */
    els.bhBars.innerHTML = "";
    health.components.forEach((c) => els.bhBars.appendChild(bhBarRow(t(c.key), c.score)));

    /* headline stats */
    els.bhStatsRow.innerHTML =
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(health.counts.completed)) + '</span><span class="risk-stat-label">' + esc(t("bh.stat.done")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(health.counts.pending)) + '</span><span class="risk-stat-label">' + esc(t("bh.stat.pending")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(health.risks.length)) + '</span><span class="risk-stat-label">' + esc(t("bh.stat.risks")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(health.docsCount)) + '</span><span class="risk-stat-label">' + esc(t("bh.stat.docs")) + "</span></div>";

    /* integrity & fraud-style signals */
    const signals = computeHealthSignals(health);
    els.bhSignals.innerHTML = "";
    if (!signals.length) {
      const ok = document.createElement("div");
      ok.className = "bh-signal bh-signal-ok";
      ok.innerHTML = '<span class="sev-badge low">' + esc(sevLabel("low")) + "</span><p></p>";
      ok.querySelector("p").textContent = t("bh.sig.none");
      els.bhSignals.appendChild(ok);
    } else {
      const sevClass = { critical: "critical", high: "high", medium: "medium" };
      signals.forEach((sig) => {
        const el = document.createElement("div");
        el.className = "bh-signal";
        el.innerHTML = '<span class="sev-badge ' + (sevClass[sig.sev] || "medium") + '">' + esc(sevLabel(sig.sev)) + "</span><p></p>";
        el.querySelector("p").textContent = tf(sig.key, { n: sig.n });
        els.bhSignals.appendChild(el);
      });
    }
  }

  els.bhRefreshBtn.addEventListener("click", renderBusinessHealth);

  /* ───────── document checklist & templates ─────────
     Maps each analysis requirement to the documents that evidence it,
     and generates starting-point templates (AI when configured). */
  const DC_SUGGESTION_MAP = [
    { re: /(privacy|gdpr|ccpa|dpdp|personal data|data prot)/i, types: ["privacy-policy", "dpagreement"] },
    { re: /(security|cyber|encryption|access control|nis)/i, types: ["security-policy"] },
    { re: /(audit|record|register|reporting)/i, types: ["compliance-register"] },
    { re: /(risk|impact assessment|dpia|assessment)/i, types: ["dpiachecklist"] },
    { re: /(transfer|cross.border|international)/i, types: ["dpagreement"] },
    { re: /(license|capital|registration|tax)/i, types: ["compliance-register"] },
  ];
  const DC_TYPE_LABELS = {
    "privacy-policy": "Privacy Policy",
    dpagreement: "DPA",
    "security-policy": "Security Policy",
    "compliance-register": "Compliance Register",
    dpiachecklist: "DPIA Checklist",
  };

  function suggestDocTypes(req) {
    const hay = [req.name || "", req.desc || "", req.actionTitle || ""].join(" ");
    const found = [];
    DC_SUGGESTION_MAP.forEach((m) => {
      if (m.re.test(hay)) m.types.forEach((tp) => { if (!found.includes(tp)) found.push(tp); });
    });
    return found.length ? found.slice(0, 2) : ["compliance-register"];
  }

  function dcTemplateToText(tpl) {
    let out = tpl.title + "\n" + "=".repeat(tpl.title.length) + "\n";
    if (tpl.intro) out += "\n" + tpl.intro + "\n";
    (tpl.sections || []).forEach((s) => {
      out += "\n" + s.heading + "\n";
      (s.points || []).forEach((p) => { out += "  - " + p + "\n"; });
    });
    return out;
  }

  async function openDocTemplate(type) {
    els.dcTplTitle.textContent = DC_TYPE_LABELS[type] || type;
    els.dcTplMode.textContent = t("dc.generating");
    els.dcTplPre.textContent = "";
    els.dcTemplateModal.classList.remove("hidden");
    try {
      const res = await api("/api/doc-template", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          type,
          company: (analysisData && analysisData.company) || "",
          product: (analysisData && analysisData.product) || "",
          target: (analysisData && (analysisData.target || analysisData.targetId)) || "",
          industry: (analysisData && analysisData.industry) || "",
        }),
      });
      const data = await res.json();
      els.dcTplMode.textContent = data.mode === "ai" ? t("feas.modeAi") : t("dc.modeSkeleton");
      currentDocTplText = dcTemplateToText(data.template);
      els.dcTplPre.textContent = currentDocTplText;
    } catch (err) {
      els.dcTplMode.textContent = "";
      els.dcTplPre.textContent = err.message || t("dc.errFailed");
    }
  }
  let currentDocTplText = "";

  function renderDocChecklist() {
    const reqs = analysisData && Array.isArray(analysisData.requirements) ? analysisData.requirements : [];
    if (!reqs.length) {
      els.dcWrap.classList.add("hidden");
      els.dcEmptyState.classList.remove("hidden");
      chartGuard("dcGaugeCanvas", false);
      return;
    }
    els.dcEmptyState.classList.add("hidden");
    els.dcWrap.classList.remove("hidden");

    const docsCount = Array.isArray(docs) ? docs.length : 0;
    const target = Math.max(3, reqs.length);
    const coverage = Math.min(100, Math.round((docsCount / target) * 100));
    chartGuard("dcGaugeCanvas", true);
    if (window.ReguLensCharts) {
      window.ReguLensCharts.createGaugeChart("dcGaugeCanvas", coverage, 100, coverage + "%");
    }
    els.dcCoverageLabel.textContent = tf("dc.coverage", { n: docsCount, m: target });

    els.dcRows.innerHTML = "";
    reqs.forEach((req) => {
      const row = document.createElement("div");
      row.className = "guide-phase";
      const head = document.createElement("div");
      head.className = "guide-phase-head";
      head.innerHTML =
        '<span class="guide-step-title">' + esc(req.name || req.id) + "</span>" +
        '<span class="sev-badge sev-' + GUIDE_PRIORITY_SEV[req.priority] + '">' + esc(sevLabel(req.priority)) + "</span>";
      row.appendChild(head);

      const bodyEl = document.createElement("div");
      bodyEl.className = "dc-row-body";
      suggestDocTypes(req).forEach((tp) => {
        const item = document.createElement("div");
        item.className = "dc-suggest-row";
        item.innerHTML =
          '<span class="chip chip-blue">' + esc(DC_TYPE_LABELS[tp] || tp) + "</span>" +
          '<button class="btn btn-outline btn-sm">' + esc(t("dc.template")) + "</button>";
        item.querySelector("button").addEventListener("click", () => openDocTemplate(tp));
        bodyEl.appendChild(item);
      });
      row.appendChild(bodyEl);
      els.dcRows.appendChild(row);
    });
  }

  els.dcTplClose.addEventListener("click", () => els.dcTemplateModal.classList.add("hidden"));
  els.dcTplOk.addEventListener("click", () => els.dcTemplateModal.classList.add("hidden"));
  els.dcTemplateModal.addEventListener("click", (e) => {
    if (e.target === els.dcTemplateModal) els.dcTemplateModal.classList.add("hidden");
  });

  /* clipboard helper with fallback */
  function copyText(text) {
    const done = () => toast(t("copied"));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      done();
    } catch {}
  }
  els.dcTplCopy.addEventListener("click", () => copyText(currentDocTplText));

  /* ───────── co-founder finder ─────────
     Role priorities derived from real project signals in the analysis. */
  const CF_ROLES = {
    complianceLead: {
      labelKey: "cf.role.compliance",
      lookFor: ["cf.look.compliance"],
      venueKey: "cf.venue.compliance",
    },
    dpo: {
      labelKey: "cf.role.dpo",
      lookFor: ["cf.look.dpo"],
      venueKey: "cf.venue.dpo",
    },
    localExpert: {
      labelKey: "cf.role.local",
      lookFor: ["cf.look.local", "cf.look.local2"],
      venueKey: "cf.venue.local",
    },
    regAnalyst: {
      labelKey: "cf.role.reganalyst",
      lookFor: ["cf.look.reganalyst"],
      venueKey: "cf.venue.reganalyst",
    },
    techLead: {
      labelKey: "cf.role.tech",
      lookFor: ["cf.look.tech"],
      venueKey: "cf.venue.tech",
    },
    financeLead: {
      labelKey: "cf.role.finance",
      lookFor: ["cf.look.finance"],
      venueKey: "cf.venue.finance",
    },
  };

  function computeRoleNeeds() {
    const counts = statusCounts();
    const reqs = getAnalysisRequirements();
    const ia = analysisData.impactAnalysis || {};
    const privacyHits = reqs.filter((r) => /(privacy|data prot|gdpr|ccpa|dpdp)/i.test([r.name, r.desc].join(" "))).length;
    const scores = {
      complianceLead: (counts.critical || 0) * 18 + (counts.important || 0) * 6,
      dpo: privacyHits * 22,
      localExpert: 28 + ((analysisData.regulations || []).length) * 4,
      regAnalyst: counts.total >= 10 ? 52 : counts.total * 5,
      techLead: Number(ia.technical && ia.technical.score) || 0,
      financeLead: Number(ia.financial && ia.financial.score) || 0,
    };
    return Object.entries(scores)
      .map(([key, score]) => ({ key, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function renderCoFounder() {
    if (!analysisData) {
      els.cfWrap.classList.add("hidden");
      els.cfEmptyState.classList.remove("hidden");
      return;
    }
    els.cfEmptyState.classList.add("hidden");
    els.cfWrap.classList.remove("hidden");

    const counts = statusCounts();
    const roles = computeRoleNeeds();
    els.cfRoles.innerHTML = "";

    roles.forEach(({ key, score }) => {
      const role = CF_ROLES[key];
      const tier = score >= 55 ? "chip-red" : score >= 30 ? "chip-orange" : "chip-gray";
      const tierKey = score >= 55 ? "cf.tier.high" : score >= 30 ? "cf.tier.medium" : "cf.tier.nice";
      const card = document.createElement("div");
      card.className = "card cf-role-card";
      card.innerHTML =
        '<div class="card-head"><h3 class="card-title">' + esc(t(role.labelKey)) + '</h3><span class="chip ' + tier + '">' + esc(t(tierKey)) + "</span></div>" +
        '<p class="cf-why"></p>' +
        '<ul class="fb-list fb-list-check cf-lookfor"></ul>' +
        '<p class="cf-venue"></p>';
      card.querySelector(".cf-why").textContent = tf("cf.why." + key, {
        company: analysisData.company || "",
        target: analysisData.target || "",
        critical: counts.critical || 0,
        total: counts.total || 0,
        privacy: Math.min(9, getAnalysisRequirements().filter((r) => /(privacy|data prot|gdpr|ccpa|dpdp)/i.test([r.name, r.desc].join(" "))).length),
        tech: Number(analysisData.impactAnalysis && analysisData.impactAnalysis.technical && analysisData.impactAnalysis.technical.score) || 0,
        fin: Number(analysisData.impactAnalysis && analysisData.impactAnalysis.financial && analysisData.impactAnalysis.financial.score) || 0,
      });
      const ul = card.querySelector(".cf-lookfor");
      role.lookFor.forEach((lk) => {
        const li = document.createElement("li");
        li.textContent = t(lk);
        ul.appendChild(li);
      });
      card.querySelector(".cf-venue").textContent = t(role.venueKey);
      els.cfRoles.appendChild(card);
    });
  }

  els.cfCopyBrief.addEventListener("click", () => {
    if (!analysisData) { toast(t("cf.emptyTitle")); return; }
    const counts = statusCounts();
    const lines = [
      "Search brief — " + (analysisData.company || ""),
      "Product: " + (analysisData.product || ""),
      "Target market: " + (analysisData.target || "") + " · Industry: " + (analysisData.industry || ""),
      "Status: " + (counts.total || 0) + " compliance requirements (" + (counts.critical || 0) + " critical), readiness " + (analysisData.readiness || 0) + "%.",
      "",
      "Looking for:",
    ];
    computeRoleNeeds().forEach(({ key, score }) => {
      const role = CF_ROLES[key];
      const tier = score >= 55 ? "[High priority]" : score >= 30 ? "[Medium]" : "[Nice to have]";
      lines.push("- " + t(role.labelKey) + " " + tier);
    });
    copyText(lines.join("\n"));
  });

  /* ───────── investor readiness ───────── */
  function computeInvestorReadiness() {
    if (!analysisData) return null;
    const h = computeBusinessHealth();
    const comp = Object.fromEntries(h.components.map((c) => [c.key, c.score]));
    const readiness = Number(analysisData.readiness) || 0;
    const parts = [
      readiness * 0.35,
      (comp["bh.comp.compliance"] || 0) * 0.25,
      (comp["bh.comp.risk"] != null ? comp["bh.comp.risk"] : 50) * 0.2,
      (comp["bh.comp.docs"] || 0) * 0.2,
    ];
    return {
      score: Math.round(parts.reduce((s, p) => s + p, 0)),
      h,
    };
  }

  function renderInvestorHub() {
    const ir = computeInvestorReadiness();
    if (!ir) {
      els.ihWrap.classList.add("hidden");
      els.ihEmptyState.classList.remove("hidden");
      chartGuard("ihGaugeCanvas", false);
      return;
    }
    els.ihEmptyState.classList.add("hidden");
    els.ihWrap.classList.remove("hidden");

    chartGuard("ihGaugeCanvas", true);
    if (window.ReguLensCharts) {
      window.ReguLensCharts.createGaugeChart("ihGaugeCanvas", ir.score, 100, ir.score + "%");
    }

    const counts = ir.h.counts;
    els.ihStatsRow.innerHTML =
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(analysisData.readiness || 0)) + '%</span><span class="risk-stat-label">' + esc(t("ih.stat.readiness")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">$' + esc(Number(analysisData.estimatedCost || 0).toLocaleString("en-US")) + '</span><span class="risk-stat-label">' + esc(t("ih.stat.cost")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(analysisData.estimatedDays || 0)) + '</span><span class="risk-stat-label">' + esc(t("ih.stat.days")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(counts.pending || 0)) + '</span><span class="risk-stat-label">' + esc(t("ih.stat.open")) + "</span></div>";

    /* what investors will probe — each answered from project state */
    const elevatedOpen = ir.h.risks.filter(
      (r) => (r.severity === "Critical" || r.severity === "High") && (!r.status || r.status === "Open")
    ).length;
    const docsTarget = Math.max(3, Math.ceil(counts.total / 3));
    const asks = [
      { key: "ih.ask.clearance", cls: counts.pending === 0 ? "chip-green" : counts.completed > 0 ? "chip-orange" : "chip-red", val: tf("ih.ask.clearanceVal", { done: counts.completed, total: counts.total }) },
      { key: "ih.ask.risk", cls: elevatedOpen === 0 ? "chip-green" : elevatedOpen <= 2 ? "chip-orange" : "chip-red", val: String(elevatedOpen) },
      { key: "ih.ask.timeline", cls: (Number(analysisData.estimatedDays) || 999) <= 180 ? "chip-green" : "chip-orange", val: String(analysisData.estimatedDays || 0) + "d" },
      { key: "ih.ask.docs", cls: (Array.isArray(docs) ? docs.length : 0) >= docsTarget ? "chip-green" : "chip-orange", val: (Array.isArray(docs) ? docs.length : 0) + "/" + docsTarget },
      { key: "ih.ask.team", cls: "chip-gray", val: t("ih.ask.teamVal") },
    ];
    els.ihAsks.innerHTML = "";
    asks.forEach((a) => {
      const row = document.createElement("div");
      row.className = "bh-signal";
      row.innerHTML = '<p style="flex:1;margin:0;font-size:13.5px;"></p><span class="chip ' + a.cls + '">' + esc(a.val) + "</span>";
      row.querySelector("p").textContent = t(a.key);
      els.ihAsks.appendChild(row);
    });
  }

  async function generateOnePager() {
    if (!analysisData) return;
    const btn = els.ihGenBrief;
    btn.disabled = true;
    btn.textContent = t("ih.generating");
    els.ihStatus.textContent = "";
    const counts = statusCounts();
    const h = computeBusinessHealth();

    const header =
      analysisData.company + " — Investor one-pager draft\n" +
      "".padEnd(40, "=") + "\n" +
      "Product: " + (analysisData.product || "") + "\n" +
      "Market: " + (analysisData.target || "") + " (from " + (analysisData.origin || "-") + ")\n" +
      "Industry: " + (analysisData.industry || "") + "\n" +
      "Compliance readiness: " + (analysisData.readiness || 0) + "% · Risk level: " + (analysisData.riskLevel || "-") + "\n" +
      "Requirements: " + counts.completed + "/" + counts.total + " completed (" + counts.critical + " critical)\n" +
      "Estimated cost: $" + Number(analysisData.estimatedCost || 0).toLocaleString("en-US") + " over " + analysisData.estimatedDays + " days\n";

    try {
      const res = await api("/api/report", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ analysis: analysisData, lang: settings.lang }),
      });
      const data = await res.json();
      const rec = data.recommendation || {};
      let brief = header + "\nEXECUTIVE SUMMARY\n" + (data.executiveSummary || "") + "\n";
      brief += "\nLAUNCH RECOMMENDATION: " + (rec.recommendation || "-") + "\n";
      brief += (rec.verdict || "") + "\n";
      if (Array.isArray(rec.prerequisites) && rec.prerequisites.length) {
        brief += "\nPREREQUISITES\n" + rec.prerequisites.map((p) => "- " + p).join("\n") + "\n";
      }
      brief += "\nTimeline: " + (rec.timeline || analysisData.estimatedDays + " days") + "\n";
      showBrief(brief, true);
    } catch (err) {
      /* deterministic fallback so the feature still works without AI */
      let brief = header + "\nSTATUS SUMMARY\n";
      brief += "-" + counts.completed + " of " + counts.total + " requirements completed (" + counts.inProgress + " in progress).\n";
      brief += "-" + (h.risks.filter((r) => r.severity === "Critical" || r.severity === "High").length) + " high-severity risks tracked in the register.\n";
      brief += "-Gap closure at " + (analysisData.gapStats ? Math.round(((analysisData.gapStats.closed + 0.5 * analysisData.gapStats.inProgress) / Math.max(1, analysisData.gapStats.closed + analysisData.gapStats.open + analysisData.gapStats.inProgress)) * 100) : 0) + "%.\n";
      brief += "\nNOTE: AI summary unavailable (" + (err.message || "no key") + ") — figures above are computed directly from your analysis.\n";
      showBrief(brief, false);
    } finally {
      btn.disabled = false;
      btn.textContent = t("ih.generate");
    }
  }

  function showBrief(text, isAi) {
    els.ihBriefCard.classList.remove("hidden");
    els.ihBriefMode.textContent = isAi ? t("feas.modeAi") : t("feas.modeDemo");
    els.ihBriefPre.textContent = text;
    els.ihBriefCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  els.ihGenBrief.addEventListener("click", generateOnePager);
  els.ihBriefCopy.addEventListener("click", () => {
    const txt = els.ihBriefPre.textContent || "";
    if (txt) copyText(txt);
  });

  /* ───────── analysis workflow (demo-first orchestrator) ───────── */
  let analysisAbort = null;
  function startAnalysis(params) {
    if (analysisRunning) return;
    analysisRunning = true;
    analysisError = null;
    analysisErrorObj = null;
    analysisProgress = { research: "pending", requirements: "pending", gaps: "pending", risks: "pending", actions: "pending", readiness: "pending" };
    analysisCompletedStages = [];
    resetAgentStates();
    agentInputParams = params;

    if (analysisAbort) analysisAbort.abort();
    analysisAbort = new AbortController();

    const runBtn = els.aiRunBtn;
    const statusEl = els.aiRunStatus;
    runBtn.disabled = true;
    runBtn.classList.add("loading");
    runBtn.textContent = "Analyzing...";
    statusEl.textContent = "";
    renderAnalysisLoading();

    const STAGES = ["research", "requirements", "gaps", "risks", "actions", "readiness"];
    let stageIdx = 0;
    let stageTimer = null;

    function advanceStage() {
      if (!analysisRunning) return;
      if (stageIdx < STAGES.length) {
        const key = STAGES[stageIdx];
        analysisProgress[key] = "running";
        const agent = getAgentByStage(key);
        if (agent) {
          agentStates[agent.id].status = "running";
          agentStates[agent.id].startTime = Date.now();
          const p = agentInputParams || {};
          agentStates[agent.id].inputSummary = buildAgentInputSummary(agent, {
            company: p.company || "", target: p.target || "", industry: p.industry || "",
            regCount: analysisData ? analysisData.regulations.length : 0,
            reqCount: analysisData ? analysisData.requirements.length : 0,
            gapCount: analysisData ? (analysisData.gaps || []).length : 0,
            riskLevel: analysisData ? analysisData.riskLevel : "",
          });
        }
        renderAnalysisLoading();
        renderAgentIntelligence();
        stageIdx++;
        stageTimer = setTimeout(advanceStage, 300 + Math.random() * 200);
      }
    }
    advanceStage();

    fetch("/api/analysis/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: params.company, product: params.product, origin: params.origin, originRegion: params.originRegion || "", target: params.target, targetRegion: params.targetRegion || "", industry: params.industry }),
      signal: analysisAbort.signal,
    }).then((r) => {
      if (!r.ok) {
        return r.json().catch(() => ({})).then((body) => {
          const e = new Error("Analysis request failed (" + r.status + ")");
          e.payload = {
            status: r.status,
            errorCode: body.code || body.errorCode || (r.status === 400 ? "VALIDATION_FAILED" : "REQUEST_FAILED"),
            message: body.message || body.error || "",
            details: body.ref ? ("error ref: " + body.ref) : "",
          };
          throw e;
        });
      }
      return r.json();
    }).then((data) => {
      if (stageTimer) clearTimeout(stageTimer);
      STAGES.forEach((key) => { analysisProgress[key] = "done"; });
      analysisData = data;
      analysisCompletedStages = [...STAGES];
      AGENTS.forEach((a) => {
        const s = agentStates[a.id];
        s.status = "completed";
        s.endTime = Date.now();
        s.outputSummary = buildAgentOutputSummary(a, analysisData, null);
        s.sourceCount = buildAgentSourceCount(a, analysisData, null);
      });
      saveAnalysisToStorage();
      renderAnalysisLoading();
      renderAgentIntelligence();
      analysisRunning = false;
      runBtn.disabled = false;
      runBtn.classList.remove("loading");
      runBtn.textContent = "Analyze";
      finishAnalysis();
    }).catch((err) => {
      if (err.name === "AbortError") return;
      if (stageTimer) clearTimeout(stageTimer);
      console.error("Analysis failed:", err);
      analysisRunning = false;
      const p = err.payload || {};
      const networkFail = /failed to fetch|networkerror|load failed|econnrefused/i.test(String(err.message || ""));
      const failedStage = ANALYSIS_STAGES.find((s) => analysisProgress[s.key] === "running") ||
                          ANALYSIS_STAGES.find((s) => analysisProgress[s.key] !== "done");
      const localBackend = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
      analysisErrorObj = {
        stage: failedStage ? failedStage.key : "",
        stageLabel: failedStage ? failedStage.label : "Analysis",
        errorCode: p.errorCode || (networkFail ? "SERVER_UNREACHABLE" : "REQUEST_FAILED"),
        message: networkFail
          ? (localBackend
            ? "The ReguLens backend is not reachable. Start it with \u201Cnpm start\u201D and open the app at http://localhost:3000."
            : "The ReguLens backend is temporarily unreachable. Please retry in a moment.")
          : (p.message || "The analysis service could not be reached."),
        retryable: true,
        recommendedAction: networkFail
          ? (location.protocol === "file:"
            ? "You opened this page as a local file. Run \u201Cnpm start\u201D in the project folder and open http://localhost:3000 instead."
            : localBackend
              ? "Run \u201Cnpm start\u201D, wait for \u201CSynora server\u201D in the terminal, then reload this page and retry."
              : "Please retry the analysis. If it keeps failing, the service may be temporarily down.")
          : "Please retry the analysis. If it keeps failing, verify the server is running and reachable.",
        details: p.details || (err.message || "unknown error"),
      };
      if (failedStage) analysisProgress[failedStage.key] = "error";
      analysisError = analysisErrorObj.message;
      runBtn.disabled = false;
      runBtn.classList.remove("loading");
      runBtn.textContent = "Analyze";
      renderAnalysisLoading();
    });
  }

  function handleAnalysisMessage(msg) {
    if (msg.type === "stage") {
      if (msg.status === "running") {
        analysisProgress[msg.stage] = "running";
        updateAgentFromStage(msg.stage, "running", msg.data);
      } else if (msg.status === "done") {
        analysisProgress[msg.stage] = "done";
        analysisCompletedStages.push(msg.stage);
        updateAgentFromStage(msg.stage, "done", msg.data);
      } else if (msg.status === "error") {
        analysisProgress[msg.stage] = "error";
        analysisError = msg.error || "Stage failed";
        updateAgentFromStage(msg.stage, "error", null);
      }
      renderAnalysisLoading();
      renderAgentIntelligence();
    } else if (msg.type === "done") {
      analysisData = msg.data;
      saveAnalysisToStorage();
      analysisProgress = { research: "done", requirements: "done", gaps: "done", actions: "done", readiness: "done" };
      AGENTS.forEach((a) => {
        const s = agentStates[a.id];
        if (s.status === "running") {
          s.status = "completed";
          s.endTime = Date.now();
          s.outputSummary = buildAgentOutputSummary(a, analysisData, null);
          s.sourceCount = buildAgentSourceCount(a, analysisData, null);
        }
      });
      renderAnalysisLoading();
      renderAgentIntelligence();
    } else if (msg.type === "error") {
      const stageKey = msg.stage ? ANALYSIS_STAGES.find((s) => s.key === msg.stage || msg.stage.includes(s.key)) : null;
      if (stageKey) analysisProgress[stageKey.key] = "error";
      const runningStage = ANALYSIS_STAGES.find((s) => analysisProgress[s.key] === "running");
      if (runningStage && !msg.stage) analysisProgress[runningStage.key] = "error";
      const failedStage = stageKey || runningStage;
      analysisErrorObj = {
        stage: failedStage ? failedStage.key : (msg.stage || ""),
        stageLabel: msg.stageLabel || (failedStage ? failedStage.label : "Analysis"),
        errorCode: msg.errorCode || "STAGE_FAILED",
        message: msg.message || "Analysis failed",
        retryable: msg.retryable !== false,
        recommendedAction: msg.recommendedAction || "Please retry the analysis.",
        details: msg.details || "",
        analysisId: msg.analysisId || "",
      };
      analysisError = analysisErrorObj.message;
      renderAnalysisLoading();
      renderAgentIntelligence();
    }
  }

  function finishAnalysis() {
    const statusEl = els.aiRunStatus;
    if (analysisData) {
      statusEl.textContent = "Analysis complete";
      statusEl.style.color = "var(--green)";
      setTimeout(() => { statusEl.textContent = ""; statusEl.style.color = ""; }, 3000);
      refreshAllViews();
    } else if (analysisError) {
      statusEl.textContent = "";
    }
  }

  function refreshAllViews() {
    renderStats();
    renderRequirements();
    renderGaps();
    renderActions();
    renderCosts();
    renderWatch();
    renderUpdates();
    renderImpact();
    renderIndustry();
    renderCompare();
    renderVerdict();
    renderTopPending();
    renderDashTimeline();
    renderDashWatch();
    renderAgentIntelligence();
    populateAnalysisForm();

    // Render charts after views are updated
    setTimeout(() => {
      try {
        if (document.getElementById('chartComplianceStatus')) renderDashboardCharts();
        if (document.getElementById('chartGapSeverity')) renderGapCharts();
        if (document.getElementById('actionMetrics')) renderActionCharts();
        if (document.getElementById('planPhaseTimeline')) renderPlanTimeline();
        if (document.getElementById('watchTimeline')) renderWatchTimeline();
        if (document.getElementById('chartRiskMatrix')) renderRiskMatrix();
        if (document.getElementById('chartCountryCompare')) { countryCompareCache = { key: "", data: null }; renderCountryCompare(); }
      } catch(e) { console.warn('Chart render error:', e); }
    }, 100);
  }

  function renderAnalysisLoading() {
    const statusEl = els.aiRunStatus;
    if (!analysisRunning && !analysisError && !analysisData) {
      statusEl.innerHTML = "";
      return;
    }

    if (analysisError && !analysisRunning) {
      const e = analysisErrorObj || { stageLabel: "Analysis", message: analysisError, errorCode: "STAGE_FAILED", retryable: true, recommendedAction: "Please retry the analysis.", details: "" };
      statusEl.innerHTML =
        '<div class="analysis-error analysis-error-rich">' +
          '<div class="analysis-error-head">' +
            '<span class="analysis-error-icon">⚠</span>' +
            '<strong>Analysis could not be completed</strong>' +
          '</div>' +
          '<div class="analysis-error-rows">' +
            '<div class="analysis-error-row"><span class="aer-label">Stage</span><span class="aer-value">' + esc(e.stageLabel || "Analysis") + '</span></div>' +
            '<div class="analysis-error-row"><span class="aer-label">Reason</span><span class="aer-value">' + esc(e.message || "Unknown failure") + '</span></div>' +
            '<div class="analysis-error-row"><span class="aer-label">Error</span><span class="aer-code">' + esc(e.errorCode || "STAGE_FAILED") + '</span></div>' +
            '<div class="analysis-error-row"><span class="aer-label">Recommended action</span><span class="aer-value">' + esc(e.recommendedAction || "Please retry the analysis.") + '</span></div>' +
          '</div>' +
          ((e.details || e.analysisId) ?
            '<details class="analysis-error-details"><summary>View diagnostic details</summary><pre>' +
            esc(JSON.stringify({ analysisId: e.analysisId || undefined, stage: e.stage || undefined, errorCode: e.errorCode, retryable: e.retryable !== false, details: e.details || "" }, null, 2)) +
            '</pre></details>' : '') +
          '<div class="analysis-error-actions">' +
            '<button type="button" class="btn-primary-sm" id="analysisRetryBtn">Retry Analysis</button>' +
          '</div>' +
        '</div>';
      const retryBtn = statusEl.querySelector("#analysisRetryBtn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          const p = agentInputParams;
          if (p && !analysisRunning) startAnalysis(p);
        });
      }
      return;
    }

    if (!analysisRunning && !analysisData) return;

    let html = '<div class="analysis-progress">';
    html += '<div class="analysis-progress-title">Analyzing your market...</div>';
    ANALYSIS_STAGES.forEach((stage) => {
      const state = analysisProgress[stage.key];
      let icon, cls;
      if (state === "done") { icon = "✓"; cls = "analysis-step-done"; }
      else if (state === "running") { icon = "⟳"; cls = "analysis-step-running"; }
      else if (state === "error") { icon = "✗"; cls = "analysis-step-error"; }
      else { icon = "○"; cls = "analysis-step-pending"; }
      html += '<div class="analysis-step ' + cls + '"><span class="analysis-step-icon">' + icon + '</span><span class="analysis-step-label">' + stage.label + '</span></div>';
    });
    html += '</div>';
    statusEl.innerHTML = html;
  }
  populateAnalysisForm();

  /* ───────── theme ───────── */
  function applyTheme(theme) {
    els.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("aurora.theme", theme);
    settings.theme = theme;
  }

  function switchTheme(theme) {
    if ((theme === "dark") === els.body.classList.contains("dark")) return;
    els.body.classList.add("theme-swap");
    applyTheme(theme);
    syncThemeSeg(theme);
    window.setTimeout(() => els.body.classList.remove("theme-swap"), 300);

    // Reconnect charts with new theme colors
    if (window.ReguLensCharts) {
      setTimeout(() => window.ReguLensCharts.reconnectAllCharts(), 50);
    }
  }

  function syncThemeSeg(theme) {
    if (!els.themeSeg) return;
    els.themeSeg.querySelectorAll(".seg-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.theme === theme);
    });
  }

  els.themeSeg.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTheme(btn.dataset.theme));
  });

  // Header theme toggle button
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      switchTheme(els.body.classList.contains("dark") ? "light" : "dark");
    });
  }

  /* ───────── settings toggles ───────── */
  els.setAppLang.addEventListener("change", () => {
    settings.lang = els.setAppLang.value;
    saveSettings();
    applySettings();
  });

  els.setDensity.addEventListener("change", () => {
    settings.density = els.setDensity.value;
    saveSettings();
    applySettings();
  });

  /* ───────── toast ───────── */
  let toastTimer = null;
  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 2400);
  }

  /* ───────── clear memory (confirm modal) ───────── */
  function openConfirm() {
    els.confirmModal.classList.remove("hidden");
  }
  function closeConfirm() {
    els.confirmModal.classList.add("hidden");
  }

  async function clearMemory() {
    const hadMemory = chats.length > 0;
    closeConfirm();
    if (!hadMemory) {
      toast(t("settings.memoryAlreadyEmpty"));
      return;
    }
    try {
      await api("/api/chats", { method: "DELETE" });
      chats = [];
      toast(t("settings.memoryCleared"));
    } catch {
      toast(t("settings.memoryClearError"));
    }
  }

  els.clearMemoryBtn.addEventListener("click", openConfirm);
  els.confirmCancel.addEventListener("click", closeConfirm);
  els.confirmOk.addEventListener("click", clearMemory);

  /* ───────── auth ───────── */
  function mapFirebaseUser(fbUser) {
    if (!fbUser) return null;
    const email = fbUser.email || "";
    const guest = !!fbUser.isAnonymous;
    return {
      id: fbUser.uid,
      name: guest ? t("profile.guest") : fbUser.displayName || email.split("@")[0] || "Guest",
      email,
      guest,
      photoURL: fbUser.photoURL || "",
    };
  }

  function updateAccountUI() {
    const name = user ? (user.guest ? t("profile.guest") : user.name) : t("profile.guest");
    const email = user && user.email ? user.email : user && user.guest ? "Guest session" : t("settings.notSignedIn");
    if (els.accountIdentity) els.accountIdentity.textContent = email;
    if (els.authBtn) els.authBtn.textContent = user ? t("settings.signOut") : t("settings.signIn");
    if (els.userName) els.userName.textContent = user ? (user.guest ? t("profile.guest") : user.name) : t("profile.guest");
    if (els.profileName) els.profileName.textContent = name;
    if (els.profileEmail) els.profileEmail.textContent = email;
    const av = user && user.name ? user.name : t("profile.guest");
    const initials = av.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "G";
    if (els.avatar) {
      els.avatar.textContent = initials;
      els.avatar.style.backgroundImage = "";
    }
    if (els.profileLogoutBtn) els.profileLogoutBtn.classList.toggle("hidden", !user);
  }

  function openLoginModal() {
    setAuthTab("login");
    els.authError.classList.add("hidden");
    els.authForm.reset();
    els.loginModal.classList.remove("hidden");
    els.authEmail.focus();
  }

  function closeLoginModal() {
    if (authGated) return;
    els.loginModal.classList.add("hidden");
  }

  let authGated = false;

  function setAuthGate(gated) {
    authGated = gated;
    els.body.classList.toggle("auth-gated", gated);
    els.loginCloseBtn.classList.toggle("hidden", gated);
    if (gated) openLoginModal();
    else closeLoginModal();
  }

  function setAuthTab(tab) {
    const isSignup = tab === "signup";
    els.authTabs.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    els.nameField.classList.toggle("hidden", !isSignup);
    els.forgotLink.classList.toggle("hidden", isSignup);
    els.loginTitle.textContent = isSignup ? t("auth.createAccount") : t("auth.welcomeBack");
    els.loginSubtitle.textContent = isSignup ? t("auth.createAccountSub") : t("auth.loginSub");
    els.authSwitchText.textContent = isSignup ? t("auth.haveAccount") : t("auth.noAccount");
    els.authSwitchBtn.textContent = isSignup ? t("auth.login") : t("auth.signup");
    els.authSubmit.textContent = isSignup ? t("auth.signingUp") : t("auth.login");
    els.authForm.dataset.mode = tab;
    els.authError.classList.add("hidden");
  }

  els.authTabs.forEach((b) => b.addEventListener("click", () => setAuthTab(b.dataset.tab)));
  els.authSwitchBtn.addEventListener("click", () => {
    setAuthTab(els.authForm.dataset.mode === "signup" ? "login" : "signup");
  });

  function showAuthError(msg) {
    els.authError.textContent = msg;
    els.authError.classList.remove("hidden");
  }

  function friendlyAuthError(err) {
    const key = window.AuroraAuthService.mapFirebaseError(err);
    return t(`auth.error.${key}`);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function setAuthLoading(loading) {
    const isSignup = els.authForm.dataset.mode === "signup";
    els.authSubmit.disabled = loading;
    els.authSubmit.textContent = loading
      ? isSignup ? t("auth.creatingAccount") : t("auth.signingIn")
      : isSignup ? t("auth.signingUp") : t("auth.login");
    els.guestBtn.disabled = loading;
  }

  async function tryLegacyMigration(email, password) {
    try {
      const res = await fetch("/api/auth/migrate", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const json = await res.json();
      return json.status === "created" || json.status === "exists";
    } catch {
      return false;
    }
  }

  async function submitAuth(ev) {
    ev.preventDefault();
    const mode = els.authForm.dataset.mode === "signup" ? "signup" : "login";
    const email = els.authEmail.value.trim();
    const password = els.authPassword.value;
    const name = els.authName.value.trim();
    if (!email || !password) {
      showAuthError(t("auth.requiredError"));
      return;
    }
    if (!isValidEmail(email)) {
      showAuthError(t("auth.error.invalidEmail"));
      return;
    }
    if (password.length < 6) {
      showAuthError(t("auth.error.weakPassword"));
      return;
    }
    els.authError.classList.add("hidden");
    setAuthLoading(true);
    try {
      if (mode === "signup") {
        pendingAuthIntent = "signup";
        await window.AuroraAuthService.signUp(name, email, password);
      } else {
        try {
          await window.AuroraAuthService.signIn(email, password);
        } catch (err) {
          if (window.AuroraAuthService.mapFirebaseError(err) === "userNotFound") {
            const migrated = await tryLegacyMigration(email, password);
            if (!migrated) throw err;
            await window.AuroraAuthService.signIn(email, password);
          } else {
            throw err;
          }
        }
        pendingAuthIntent = "login";
      }
    } catch (err) {
      pendingAuthIntent = null;
      showAuthError(friendlyAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  }

  els.guestBtn.addEventListener("click", () => {
    setGuestMode(true);
    pendingAuthIntent = "guest";
    enterSession(guestUser(), "guest");
  });

  function openResetMode() {
    els.authMain.classList.add("hidden");
    els.authResetForm.classList.remove("hidden");
    els.authResetError.classList.add("hidden");
    els.authResetForm.reset();
    els.authResetEmail.focus();
  }

  function closeResetMode() {
    els.authResetForm.classList.add("hidden");
    els.authMain.classList.remove("hidden");
  }

  els.forgotLink.addEventListener("click", openResetMode);
  els.authResetBack.addEventListener("click", closeResetMode);
  els.authResetForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const email = els.authResetEmail.value.trim();
    if (!isValidEmail(email)) {
      els.authResetError.textContent = t("auth.error.invalidEmail");
      els.authResetError.classList.remove("hidden");
      return;
    }
    els.authResetError.classList.add("hidden");
    els.authResetBtn.disabled = true;
    try {
      await window.AuroraAuthService.sendPasswordReset(email);
      toast(t("auth.resetSent"));
      closeResetMode();
      setAuthTab(els.authForm.dataset.mode || "login");
    } catch (err) {
      els.authResetError.textContent = friendlyAuthError(err);
      els.authResetError.classList.remove("hidden");
    } finally {
      els.authResetBtn.disabled = false;
    }
  });

  async function loadChats() {
    try {
      const res = await api("/api/chats");
      const data = await res.json();
      chats = Array.isArray(data) ? data : [];
    } catch {
      chats = [];
    }
  }

  /* ───────── history view ───────── */
  function fmtChatDate(iso) {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return (
        d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return "";
    }
  }

  async function deleteChat(id) {
    try {
      await api("/api/chats/" + encodeURIComponent(id), { method: "DELETE" });
    } catch {}
    if (assistantChatId === id) resetAssistantConversation();
    await loadChats();
    renderHistory();
    toast("Conversation deleted");
  }

  function renderHistory() {
    const list = els.historyList;
    if (!list) return;
    list.innerHTML = "";
    if (!chats.length) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "No conversations yet. Start one from the AI Assistant page.";
      list.appendChild(empty);
      return;
    }
    chats.forEach((c) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML =
        '<span class="history-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg></span>' +
        '<span class="history-item-main"><p class="history-item-title"></p><p class="history-item-meta"></p></span>' +
        '<button type="button" class="icon-btn history-item-delete" aria-label="Delete conversation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>';
      item.querySelector(".history-item-title").textContent = c.title || "New conversation";
      item.querySelector(".history-item-meta").textContent = fmtChatDate(c.updatedAt || c.createdAt);
      item.querySelector(".history-item-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteChat(c.id);
      });
      item.addEventListener("click", () => openHistoryDetail(c.id));
      list.appendChild(item);
    });
  }

  async function openHistoryDetail(id) {
    let chat = null;
    try {
      const res = await api("/api/chats/" + encodeURIComponent(id));
      chat = await res.json();
    } catch {}
    if (!chat || !Array.isArray(chat.messages)) {
      toast("Could not load this conversation.");
      return;
    }
    els.historyDetailTitle.textContent = chat.title || "New conversation";
    const box = els.historyMessages;
    box.innerHTML = "";
    chat.messages.forEach((m) => {
      const wrap = document.createElement("div");
      wrap.className = "history-msg";
      const role = document.createElement("p");
      role.className = "history-msg-role";
      role.textContent = m.role === "user" ? "You" : "Assistant";
      const body = document.createElement("p");
      body.className = "history-msg-content";
      body.textContent = m.content || "";
      wrap.append(role, body);
      box.appendChild(wrap);
    });
    els.historyDetailCard.classList.remove("hidden");
    box.scrollTop = box.scrollHeight;
  }

  function closeHistoryDetail() {
    if (!els.historyDetailCard) return;
    els.historyDetailCard.classList.add("hidden");
  }

  els.historyRefreshBtn.addEventListener("click", async () => {
    closeHistoryDetail();
    await loadChats();
    renderHistory();
  });
  els.historyDetailClose.addEventListener("click", closeHistoryDetail);

  /* ───────── assistant view ───────── */
  const ASSISTANT_MAX_DOCS = 5;
  let assistantChatId = null;
  let assistantMessages = [];
  let assistantStagedDocs = [];
  let assistantBusy = false;

  function resetAssistantConversation() {
    assistantChatId = null;
    assistantMessages = [];
    assistantStagedDocs = [];
    paintAssistantDocs();
    paintAssistantLog();
  }

  function assistantBubble(role, content) {
    const row = document.createElement("div");
    row.className = "chat-msg " + (role === "user" ? "user" : "bot");
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = content || "";
    row.appendChild(bubble);
    return row;
  }

  function scrollAssistant() {
    const log = els.assistantLog;
    if (log && settings.autoScroll !== false) log.scrollTop = log.scrollHeight;
  }

  function paintAssistantLog() {
    const log = els.assistantLog;
    if (!log) return;
    log.innerHTML = "";
    if (!assistantMessages.length) {
      log.appendChild(
        assistantBubble(
          "bot",
          "Hi! Ask me anything about regulatory compliance, or attach a document to ask questions about its contents."
        )
      );
    }
    assistantMessages.forEach((m) => log.appendChild(assistantBubble(m.role, m.content)));
    scrollAssistant();
  }

  function paintAssistantDocs() {
    const chips = els.assistantDocChips;
    if (!chips) return;
    chips.innerHTML = "";
    assistantStagedDocs.forEach((d, i) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "assistant-doc-chip";
      chip.title = "Click to remove " + d.name;
      chip.textContent = d.name + "  ×";
      chip.setAttribute("aria-label", "Remove document " + d.name);
      chip.addEventListener("click", () => {
        assistantStagedDocs.splice(i, 1);
        paintAssistantDocs();
      });
      chips.appendChild(chip);
    });
  }

  function renderAssistant() {
    paintAssistantDocs();
    paintAssistantLog();
  }

  async function ensureAssistantChat() {
    if (assistantChatId) {
      if (assistantStagedDocs.length) {
        const docs = assistantStagedDocs;
        assistantStagedDocs = [];
        try {
          await api("/api/chats/" + encodeURIComponent(assistantChatId) + "/documents", {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({ documents: docs }),
          });
        } catch {
          assistantStagedDocs = docs.concat(assistantStagedDocs);
          throw new Error("Could not attach documents.");
        }
      }
      return assistantChatId;
    }
    const docs = assistantStagedDocs;
    assistantStagedDocs = [];
    try {
      const res = await api("/api/chats", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ documents: docs }),
      });
      const chat = await res.json();
      assistantChatId = chat.id;
      return chat.id;
    } catch (err) {
      assistantStagedDocs = docs.concat(assistantStagedDocs);
      throw err;
    }
  }

  async function sendAssistantMessage() {
    const input = els.assistantInput;
    const text = (input && input.value.trim()) || "";
    if (!text || assistantBusy) return;
    if (input) input.value = "";
    assistantMessages.push({ role: "user", content: text });
    paintAssistantLog();

    assistantBusy = true;
    if (els.assistantSendBtn) els.assistantSendBtn.disabled = true;
    const reply = { role: "assistant", content: "" };
    assistantMessages.push(reply);
    const liveBubble = assistantBubble("assistant", "");
    els.assistantLog.appendChild(liveBubble);
    const liveText = liveBubble.querySelector(".bubble");
    liveText.textContent = "…";
    scrollAssistant();

    try {
      const chatId = await ensureAssistantChat();
      const res = await fetch("/api/chats/" + encodeURIComponent(chatId) + "/messages", {
        method: "POST",
        headers: { ...(await authHeaders()), ...jsonHeaders },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        let msg = "HTTP " + res.status;
        try {
          msg = (await res.json()).error || msg;
        } catch {}
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          let evt;
          try {
            evt = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (evt.type === "delta" && evt.content) {
            reply.content += evt.content;
            liveText.textContent = reply.content;
            scrollAssistant();
          } else if (evt.type === "done" && evt.content && !reply.content) {
            /* buffered transports deliver everything at the end */
            reply.content = evt.content;
            liveText.textContent = reply.content;
          } else if (evt.type === "error") {
            reply.content = reply.content || "The assistant could not complete this reply. Please try again.";
            liveText.textContent = reply.content;
          }
        }
      }
      if (!reply.content) reply.content = "(No response)";
    } catch (err) {
      reply.content =
        reply.content || "Sorry — the assistant is unavailable right now. Please try again in a moment.";
    } finally {
      assistantBusy = false;
      if (els.assistantSendBtn) els.assistantSendBtn.disabled = false;
      paintAssistantLog();
      loadChats().then(renderHistory);
    }
  }

  els.assistantSendBtn.addEventListener("click", sendAssistantMessage);
  els.assistantInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && settings.enterToSend !== false) {
      e.preventDefault();
      sendAssistantMessage();
    }
  });

  els.assistantDocBtn.addEventListener("click", () => els.assistantDocInput.click());
  els.assistantDocInput.addEventListener("change", async () => {
    const files = Array.from(els.assistantDocInput.files || []);
    els.assistantDocInput.value = "";
    for (const f of files) {
      if (assistantStagedDocs.length >= ASSISTANT_MAX_DOCS) {
        toast("Max " + ASSISTANT_MAX_DOCS + " documents per conversation.");
        break;
      }
      let text = "";
      if (f.size <= 512 * 1024) {
        try {
          text = await f.text();
        } catch {}
      }
      if (!text.trim()) {
        toast('"' + f.name + '" has no readable text.');
        continue;
      }
      assistantStagedDocs.push({ name: f.name, text });
    }
    paintAssistantDocs();
  });

  els.assistantClearBtn.addEventListener("click", async () => {
    if (assistantBusy) return;
    const id = assistantChatId;
    resetAssistantConversation();
    if (id) {
      try {
        await api("/api/chats/" + encodeURIComponent(id), { method: "DELETE" });
      } catch {}
      await loadChats();
      renderHistory();
    }
    toast("Chat cleared");
  });

  async function syncServerSettings() {
    let serverSettings = null;
    try {
      const res = await api("/api/settings");
      serverSettings = await res.json();
    } catch {}
    if (serverSettings && Object.keys(serverSettings).length) {
      settings = { ...DEFAULT_SETTINGS, ...serverSettings };
    } else {
      try {
        await api("/api/settings", {
          method: "PUT",
          headers: jsonHeaders,
          body: JSON.stringify(settings),
        });
      } catch {}
    }
    saveSettings();
    applySettings();
  }

  async function doSignOut() {
    if (user && user.guest) {
      setGuestMode(false);
      leaveSession();
      return;
    }
    try {
      await window.AuroraAuthService.signOutUser();
    } catch {}
  }

  let prevAuthState = null;

  async function enterSession(nextUser, intent) {
    pendingAuthIntent = null;
    user = nextUser;
    setAuthGate(false);
    prevAuthState = true;
    if (user.guest) {
  settings = loadSettings();
      applySettings();
    } else {
      await syncServerSettings();
    }
    updateAccountUI();
    await loadChats();
    navigate("dashboard");
    if (prevAuthStateWasFalse()) {
      if (intent === "signup") {
        toast(t("auth.welcome").replace("{name}", user.name));
      } else if (intent === "guest") {
        toast(t("auth.guestSignedIn"));
      } else if (intent) {
        toast(t("auth.signedIn").replace("{email}", user.email));
      }
    }
  }

  function leaveSession() {
    const hadSession = prevAuthState === true;
    user = null;
    chats = [];
    settings = loadSettings();
    updateAccountUI();
    applySettings();
    setAuthGate(true);
    prevAuthState = false;
    if (hadSession) toast(t("auth.signedOut"));
  }

  function prevAuthStateWasFalse() {
    const was = prevAuthState === false;
    prevAuthState = true;
    return was;
  }

  async function handleAuthState(fbUser) {
    if (fbUser) {
      await enterSession(mapFirebaseUser(fbUser), pendingAuthIntent);
    } else if (isGuestMode()) {
      await enterSession(guestUser(), "guest");
    } else {
      leaveSession();
    }
  }

  els.authBtn.addEventListener("click", () => {
    if (user) doSignOut();
    else openLoginModal();
  });
  els.profileLogoutBtn.addEventListener("click", doSignOut);
  els.loginCloseBtn.addEventListener("click", closeLoginModal);
  els.authForm.addEventListener("submit", submitAuth);

  /* ───────── health / ai status ───────── */
  let aiChecking = false;

  async function refreshAiStatus() {
    if (aiChecking) return;
    aiChecking = true;
    els.aiRetryBtn.disabled = true;
    els.aiStatus.textContent = t("settings.checking");
    try {
      const h = await (await api("/api/health?probe=1")).json();
      if (h.reachable) {
        els.aiStatus.textContent = t("settings.aiConnected").replace("{model}", h.model);
      } else if (h.configured) {
        els.aiStatus.textContent = t("settings.aiDisconnected");
      } else {
        els.aiStatus.textContent = t("settings.aiNotConfigured");
      }
    } catch {
      els.aiStatus.textContent = t("settings.aiConnError");
      toast(t("settings.aiConnError") + " — " + t("settings.aiRetryHint"));
    } finally {
      aiChecking = false;
      els.aiRetryBtn.disabled = false;
    }
  }

  els.aiRetryBtn.addEventListener("click", refreshAiStatus);
  refreshAiStatus();

  /* ═══════════════════════════════════════════════════════════
     CHART RENDERING — exactly 7 visualizations, all data-driven,
     each with loading / empty / error / success states.
     1 Dashboard: Compliance Status donut
     2 Dashboard: Priority Distribution bar
     3 Dashboard: Compliance Progress (action progress)
     4 Gap Analysis: Severity bar
     5 Impact Analysis: Risk Matrix scatter (probability × impact)
     6 Regulation Watch: Regulatory timeline (HTML)
     7 Compare Scenarios: grouped bar
     ═══════════════════════════════════════════════════════════ */

  /* Shows an honest empty state instead of a fake/blank graph.
     While an analysis is running it shows a loading state instead. */
  function chartGuard(id, hasData, message) {
    const canvas = document.getElementById(id);
    if (!canvas) return false;
    const box = canvas.closest(".chart-container") || canvas.parentElement;
    let msg = box ? box.querySelector(".chart-empty") : null;
    if (!hasData) {
      canvas.classList.add("hidden");
      if (box && !msg) {
        msg = document.createElement("div");
        msg.className = "chart-empty";
        box.appendChild(msg);
      }
      if (msg) {
        if (!analysisData && analysisRunning) {
          msg.innerHTML = '<span class="spinner" aria-hidden="true"></span> ' + esc(t("charts.loading"));
        } else {
          msg.textContent = message || t("charts.empty");
        }
      }
      return false;
    }
    canvas.classList.remove("hidden");
    if (msg) msg.remove();
    return true;
  }

  function renderDashboardCharts() {
    const metricsEl = document.getElementById('dashboardMetrics');
    const d = analysisData;
    if (!d) {
      chartGuard('chartComplianceStatus', false);
      chartGuard('chartPriorityDist', false);
      chartGuard('chartComplianceProgress', false);
      if (metricsEl) metricsEl.innerHTML = "";
      return;
    }
    if (!window.ReguLensCharts) return;
    const RC = window.ReguLensCharts;
    const stats = d.stats || {};

    if (metricsEl) {
      metricsEl.innerHTML = `
        <div class="metric-card">
          <div class="metric-card-value">${stats.total || 0}</div>
          <div class="metric-card-label">${t('dashboard.totalRequirements')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-value" style="color:var(--red)">${stats.critical || 0}</div>
          <div class="metric-card-label">${t('req.critical')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-value" style="color:var(--green)">${stats.completed || 0}</div>
          <div class="metric-card-label">${t('req.statusCompleted')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-value">${d.riskLevel || 'N/A'}</div>
          <div class="metric-card-label">${t('dashboard.riskLevel')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-value">$${(d.estimatedCost || 0).toLocaleString()}</div>
          <div class="metric-card-label">${t('cost.total')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-value">${d.estimatedDays || 0}</div>
          <div class="metric-card-label">${t('dashboard.estimatedDays')}</div>
        </div>
      `;
    }

    // 1 · Compliance Status Donut
    if (chartGuard('chartComplianceStatus', (stats.total || 0) > 0)) {
      RC.createDonutChart('chartComplianceStatus',
        [t('req.statusCompleted'), t('req.statusInProgress'), t('req.statusPending'), t('req.statusNA')],
        [stats.completed || 0, stats.inProgress || 0, stats.pending || 0, stats.nA || 0],
        [RC.getColors().completed, RC.getColors().inProgress, RC.getColors().pending, RC.getColors().notApplicable],
        { centreTitle: t('charts.total') }
      );
    }

    // 2 · Priority Distribution Bar
    if (chartGuard('chartPriorityDist', (stats.total || 0) > 0)) {
      RC.createBarChart('chartPriorityDist',
        [t('req.critical'), t('req.important'), t('req.standard')],
        [stats.critical || 0, stats.important || 0, stats.standard || 0],
        [RC.getColors().critical, RC.getColors().high, RC.getColors().medium]
      );
    }

    // 3 · Compliance Progress (action progress)
    if (chartGuard('chartComplianceProgress', (stats.total || 0) > 0)) {
      RC.createProgressChart('chartComplianceProgress',
        stats.completed || 0,
        stats.total || 1,
        t('dashboard.complianceProgress')
      );
    }
  }

  function renderGapCharts() {
    const gaps = analysisData ? (analysisData.gaps || []) : [];

    // Gap metrics cards
    const gapMetricsEl = document.getElementById('gapMetrics');
    const norm = (g) => String(g.severity || g.priority || "").toLowerCase();
    const critical = gaps.filter(g => norm(g) === 'critical').length;
    const high = gaps.filter(g => norm(g) === 'high' || norm(g) === 'important').length;
    const mediumLow = gaps.filter(g => ['medium', 'low', 'standard'].includes(norm(g))).length;
    if (gapMetricsEl) {
      gapMetricsEl.innerHTML = `
        <div class="metric-card"><div class="metric-card-value">${gaps.length}</div><div class="metric-card-label">${t('gap.totalGaps')}</div></div>
        <div class="metric-card"><div class="metric-card-value" style="color:var(--red)">${critical}</div><div class="metric-card-label">${t('gap.critical')}</div></div>
        <div class="metric-card"><div class="metric-card-value" style="color:var(--orange)">${high}</div><div class="metric-card-label">${t('gap.high')}</div></div>
        <div class="metric-card"><div class="metric-card-value" style="color:var(--green)">${mediumLow}</div><div class="metric-card-label">${t('gap.medium')} / ${t('gap.low')}</div></div>
      `;
    }

    // 4 · Severity Distribution
    if (!window.ReguLensCharts) return;
    const RC = window.ReguLensCharts;
    if (chartGuard('chartGapSeverity', gaps.length > 0)) {
      RC.createBarChart('chartGapSeverity',
        [t('gap.critical'), t('gap.high'), t('gap.mediumLow')],
        [critical, high, mediumLow],
        [RC.getColors().critical, RC.getColors().high, RC.getColors().medium]
      );
    }
  }

  /* ───────── Gap Analysis: Origin vs Target market comparison ─────────
     Data comes from GET /api/gov/compare-markets (canonical gov engine,
     POLICY_DB). Deterministic burden profile per policy category — no
     fabricated numbers; empty/error states are honest. */
  let countryCompareCache = { key: "", data: null };

  function compareMarketLabel(m) {
    return (m.flag ? m.flag + " " : "") + m.name;
  }

  /* Deterministic priority from the burden delta between the two markets.
     Same metric for both countries: Requirement Intensity Score (0-100). */
  function compareGapPriority(delta) {
    if (delta >= 20) return { label: t("gap.high"), cls: "chip-red" };
    if (delta >= 10) return { label: t("gap.medium"), cls: "chip-orange" };
    return { label: t("gap.low"), cls: "chip-green" };
  }

  function renderCountryCompareFromCache(data) {
    const RC = window.ReguLensCharts;
    if (!RC || !data || !Array.isArray(data.markets) || !data.markets.length) {
      chartGuard('chartCountryCompare', false);
      return;
    }
    const origin = data.markets[0];
    const target = data.sameMarket ? null : (data.markets[1] || null);

    const sub = document.getElementById("compareSub");
    if (sub) {
      sub.textContent = target
        ? `${compareMarketLabel(origin)} → ${compareMarketLabel(target)} · ${data.industryName || ""}`
        : `${compareMarketLabel(origin)} · ${data.industryName || ""}`;
    }
    const sameNote = document.getElementById("compareSameNote");
    if (sameNote) {
      sameNote.textContent = data.sameMarket ? t("gap.compareSameMarket") : "";
      sameNote.classList.toggle("hidden", !data.sameMarket);
    }

    /* per-category lookups + deterministic gap stats */
    const catRows = (data.categories || []).map((cat) => {
      const oc = (origin.categories || []).find((x) => x.category === cat) || null;
      const tc = target ? ((target.categories || []).find((x) => x.category === cat) || null) : null;
      const oScore = oc ? Number(oc.burdenScore) || 0 : 0;
      const tScore = tc ? Number(tc.burdenScore) || 0 : 0;
      return {
        category: cat,
        oc, tc,
        oScore, tScore,
        oReqs: oc ? Number(oc.requirements) || 0 : 0,
        tReqs: tc ? Number(tc.requirements) || 0 : 0,
        delta: Math.round(tScore - oScore),
      };
    });
    const largestGapRow = target
      ? catRows.reduce((m, r) => (Math.abs(r.delta) > Math.abs(m.delta) ? r : m), catRows[0] || null)
      : null;
    const higherMarket = target
      ? (origin.avgBurden >= target.avgBurden ? origin : target)
      : null;

    const metrics = document.getElementById("compareMetrics");
    if (metrics) {
      const cards = [
        { v: origin.avgBurden + "/100", l: t("gap.avgBurden") + " — " + t("gap.compareOrigin"), tone: "color:var(--primary)" },
        { v: fmtNum(origin.totalRequirements), l: t("gap.applicableReqs") + " — " + t("gap.compareOrigin"), tone: "" },
      ];
      if (target) {
        cards.push(
          { v: target.avgBurden + "/100", l: t("gap.avgBurden") + " — " + t("gap.compareTarget"), tone: "color:var(--orange)" },
          { v: fmtNum(target.totalRequirements), l: t("gap.applicableReqs") + " — " + t("gap.compareTarget"), tone: "" },
          { v: String(catRows.length), l: t("gap.cmp.categories"), tone: "" },
          { v: compareMarketLabel(higherMarket), l: t("gap.cmp.higherBurden"), tone: "" },
          largestGapRow && largestGapRow.category
            ? { v: `${largestGapRow.category} (Δ ${Math.abs(largestGapRow.delta)})`, l: t("gap.cmp.largestGap"), tone: "" }
            : null
        );
      }
      metrics.innerHTML = cards.filter(Boolean).map((c) =>
        `<div class="metric-card"><div class="metric-card-value" style="${c.tone}">${esc(String(c.v))}</div><div class="metric-card-label">${esc(c.l)}</div></div>`
      ).join("");
    }

    if (chartGuard('chartCountryCompare', catRows.length > 0)) {
      const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
      const tooltipCallbacks = {
        title: function (items) {
          return items.length ? String(items[0].label) : "";
        },
        label: function (item) {
          const i = item.dataIndex;
          const row = catRows[i] || {};
          const isOrigin = item.datasetIndex === 0;
          const market = isOrigin ? origin : target;
          const score = isOrigin ? row.oScore : row.tScore;
          const reqs = isOrigin ? row.oReqs : row.tReqs;
          const lines = [
            (market ? compareMarketLabel(market) : item.dataset.label) + ": " + num(score) + "/100",
            t("gap.applicableReqs") + ": " + fmtNum(reqs),
          ];
          if (target) {
            const d = num(row.delta);
            lines.push(t("gap.compareGap") + " (" + t("gap.compareTarget") + " − " + t("gap.compareOrigin") + "): " + (d > 0 ? "+" : "") + d);
          }
          return lines;
        },
      };
      const datasets = [
        { label: compareMarketLabel(origin), data: data.series.origin, color: RC.getColors().primary },
      ];
      if (target) {
        datasets.push({ label: compareMarketLabel(target), data: data.series.target, color: RC.getColors().orange });
      }
      RC.createGroupedBarChart('chartCountryCompare', data.categories, datasets, {
        yMax: 100,
        yLabel: t("gap.avgBurden"),
        tooltipCallbacks,
      });
    }

    const tbody = document.getElementById("compareTbody");
    if (tbody) {
      tbody.innerHTML = catRows.map((r) => {
        const prio = compareGapPriority(Math.abs(r.delta));
        const originCell =
          `<td><strong>${esc(String(r.oScore))}</strong>/100<span class="cell-sub">${fmtNum(r.oReqs)} ${esc(t("gap.applicableReqs"))}</span></td>`;
        const targetCell = target
          ? `<td><strong>${esc(String(r.tScore))}</strong>/100<span class="cell-sub">${fmtNum(r.tReqs)} ${esc(t("gap.applicableReqs"))}</span></td>`
          : `<td>—</td>`;
        const gapCell = target
          ? `<td class="${r.delta > 0 ? "compare-gap-up" : r.delta < 0 ? "compare-gap-down" : "compare-gap-flat"}">${r.delta > 0 ? "+" : ""}${r.delta}</td>`
          : `<td>—</td>`;
        const prioCell = target
          ? `<td><span class="chip ${prio.cls}">${esc(prio.label)}</span></td>`
          : `<td>—</td>`;
        const driverCell =
          `<td>${r.tc && r.tc.topRegulation ? esc(r.tc.topRegulation.code + " — " + r.tc.topRegulation.title) : "—"}</td>`;
        return (
          "<tr>" +
          `<td>${esc(r.category)}</td>` +
          originCell +
          targetCell +
          gapCell +
          prioCell +
          driverCell +
          "</tr>"
        );
      }).join("");
    }

    const note = document.getElementById("compareMethodology");
    if (note) note.textContent = data.methodology || t("gap.methodologyNote");
  }

  async function renderCountryCompare() {
    const canvasEl = document.getElementById('chartCountryCompare');
    if (!canvasEl || !window.ReguLensCharts) return;

    const d = analysisData;
    if (!d || (!d.targetId && !d.target)) {
      chartGuard('chartCountryCompare', false);
      const tb = document.getElementById("compareTbody");
      if (tb) tb.innerHTML = "";
      const mx = document.getElementById("compareMetrics");
      if (mx) mx.innerHTML = "";
      const sb = document.getElementById("compareSub");
      if (sb) sb.textContent = analysisData ? "" : t("charts.empty");
      return;
    }

    const params = new URLSearchParams({
      origin: String(d.originId || d.origin || ""),
      target: String(d.targetId || d.target || ""),
      industry: String(d.industryId || d.industry || ""),
    });
    const key = params.toString();

    if (countryCompareCache.key === key && countryCompareCache.data) {
      renderCountryCompareFromCache(countryCompareCache.data);
      return;
    }

    try {
      const res = await api("/api/gov/compare-markets?" + key);
      const data = await res.json();
      countryCompareCache = { key, data };
      renderCountryCompareFromCache(data);
    } catch {
      chartGuard('chartCountryCompare', false, t("gap.compareError"));
      const tb = document.getElementById("compareTbody");
      if (tb) tb.innerHTML = "";
    }
  }

  function renderActionCharts() {
    const actions = analysisData ? (analysisData.actions || []) : [];
    const el = document.getElementById('actionMetrics');
    if (!el) return;
    if (!actions.length) { el.innerHTML = ""; return; }
    const prio = { critical: 0, important: 0, standard: 0 };
    actions.forEach(a => { prio[String(a.priority || "standard").toLowerCase()] = (prio[String(a.priority || "standard").toLowerCase()] || 0) + 1; });
    const doneCount = actions.filter(a => a.status === "done" || a.status === "completed").length;
    el.innerHTML = `
      <div class="metric-card"><div class="metric-card-value">${actions.length}</div><div class="metric-card-label">${t('action.total')}</div></div>
      <div class="metric-card"><div class="metric-card-value" style="color:var(--red)">${prio.critical || 0}</div><div class="metric-card-label">${t('req.critical')}</div></div>
      <div class="metric-card"><div class="metric-card-value" style="color:var(--green)">${doneCount}</div><div class="metric-card-label">${t('req.statusCompleted')}</div></div>
      <div class="metric-card"><div class="metric-card-value">${(analysisData.timeline && analysisData.timeline.totalDays) || analysisData.estimatedDays || 0}</div><div class="metric-card-label">${t('action.daysToReady')}</div></div>
    `;
  }

  function renderPlanTimeline() {
    const list = document.getElementById('planPhaseTimeline');
    if (!list) return;
    list.innerHTML = "";
    const tl = analysisData ? analysisData.timeline : null;
    const phases = tl && Array.isArray(tl.phases) ? tl.phases : [];
    const critPath = tl && Array.isArray(tl.criticalPath) ? tl.criticalPath : [];
    const meta = document.getElementById('planTimelineMeta');
    if (meta) {
      meta.textContent = !analysisData ? t("charts.empty")
        : tl ? `${t("charts.total")} ${fmtNum(tl.totalDays)} ${t("time.days")} (~${fmtNum(tl.totalWeeks)} ${t("time.weeks")}) · ${tf("plan.criticalPath", { p: critPath.map(c => c.title).join(" → ") })}` : "";
    }
    if (!analysisData || !tl || !phases.length) {
      list.innerHTML = `<li class="tl-item"><div class="tl-body"><p class="tl-title">${esc(t("charts.empty"))}</p><p class="tl-days">Run an analysis to compute the plan timeline.</p></div></li>`;
      return;
    }
    phases.forEach((p) => {
      const li = document.createElement("li");
      li.className = "tl-item";
      li.innerHTML = '<span class="tl-num">' + esc("P" + p.phase) + '</span><div class="tl-body"><p class="tl-title"></p><div class="tl-meta"><span class="chip chip-gray">' + fmtNum(p.actionCount || 0) + ' ' + esc(t("time.actions")) + '</span><span class="tl-days">' + esc(t("time.day")) + ' ' + p.startDay + '–' + p.endDay + '</span></div></div>';
      li.querySelector(".tl-title").textContent = p.name;
      list.appendChild(li);
    });
  }

  function renderWatchTimeline() {
    const list = document.getElementById('watchTimeline');
    if (!list) return;
    list.innerHTML = "";
    const regs = getAnalysisRegulations();
    if (!regs.length) {
      list.innerHTML = '<li class="tl-item"><div class="tl-body"><p class="tl-title">' + esc(t("charts.empty")) + '</p><p class="tl-days">No regulations are being tracked yet.</p></div></li>';
      return;
    }
    const sorted = [...regs].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    sorted.forEach((r, i) => {
      const li = document.createElement("li");
      li.className = "tl-item";
      li.innerHTML = '<span class="tl-num">' + String(i + 1).padStart(2, "0") + '</span><div class="tl-body"><p class="tl-title"></p><div class="tl-meta"><span class="chip chip-gray">' + esc(r.kind || "Regulation") + '</span><span class="tl-days">' + esc(r.date || "Date N/A") + '</span><span>' + esc(r.authority || "") + '</span></div></div>';
      li.querySelector(".tl-title").textContent = r.title || "";
      list.appendChild(li);
    });
  }

  function renderRiskMatrix() {
    if (!analysisData) { chartGuard('chartRiskMatrix', false); return; }
    if (!window.ReguLensCharts) return;
    const RC = window.ReguLensCharts;
    const risks = analysisData.riskMatrix || analysisData.risks || [];
    if (!chartGuard('chartRiskMatrix', Array.isArray(risks) && risks.length > 0)) return;
    RC.createRiskMatrix('chartRiskMatrix', risks, {
      xLabel: t("charts.probability"),
      yLabel: t("charts.impact"),
      severityLabel: t("risk.col.severity"),
      mitigationLabel: t("charts.mitigation"),
    });
  }

  /* ───────── Risk & Business Health module ───────── */

  function renderRiskMatrixView() {
    const wrap = document.getElementById("riskDataWrap");
    const empty = document.getElementById("riskEmptyState");
    if (!wrap || !empty) return;
    const risks =
      analysisData && Array.isArray(analysisData.riskMatrix) ? analysisData.riskMatrix : [];
    const hasData = risks.length > 0;
    empty.classList.toggle("hidden", hasData);
    wrap.classList.toggle("hidden", !hasData);
    if (!hasData) return;

    const dist = { critical: 0, high: 0, medium: 0, low: 0 };
    risks.forEach((r) => {
      const k = String(r.severity || "medium").toLowerCase();
      if (dist[k] !== undefined) dist[k] += 1;
    });
    const openCount = risks.filter((r) => String(r.status || "Open").toLowerCase() === "open").length;

    const row = document.getElementById("riskStatsRow");
    if (row) {
      const cards = [
        { v: risks.length, l: t("risk.stat.total"), tone: "" },
        { v: dist.critical, l: t("gap.critical") , tone: "tone-critical" },
        { v: dist.high + dist.medium, l: t("risk.stat.elevated"), tone: "tone-high" },
        { v: dist.low, l: t("sev.low"), tone: "tone-low" },
        { v: openCount, l: t("risk.stat.open"), tone: "" },
      ];
      row.innerHTML = cards
        .map(
          (c) =>
            `<div class="risk-stat ${c.tone}"><span class="risk-stat-value">${esc(
              String(c.v)
            )}</span><span class="risk-stat-label">${esc(c.l)}</span></div>`
        )
        .join("");
    }

    const tbody = document.getElementById("riskTbody");
    if (tbody) {
      tbody.innerHTML = risks
        .map((r) => {
          const sev = String(r.severity || "medium").toLowerCase();
          return (
            "<tr>" +
            `<td>${esc(r.title || r.name || "—")}</td>` +
            `<td>${esc(r.category || "—")}</td>` +
            `<td><span class="sev-badge ${esc(sev)}">${esc(sevLabel(sev))}</span></td>` +
            `<td>${esc(String(r.probability != null ? r.probability : "—"))}</td>` +
            `<td>${esc(String(r.impact != null ? r.impact : "—"))}</td>` +
            `<td><span class="status-badge">${esc(r.status || "Open")}</span></td>` +
            "</tr>"
          );
        })
        .join("");
    }

    if (!window.ReguLensCharts) return;
    const RC = window.ReguLensCharts;
    RC.createRiskMatrix("riskMatrixCanvas", risks, {
      xLabel: t("charts.probability"),
      yLabel: t("charts.impact"),
      severityLabel: t("risk.col.severity"),
      mitigationLabel: t("charts.mitigation"),
    });
    RC.createDonutChart(
      "riskDistCanvas",
      [t("gap.critical"), t("gap.high"), t("gap.medium"), t("gap.low")],
      [dist.critical, dist.high, dist.medium, dist.low],
      [RC.getColors().critical, RC.getColors().high, RC.getColors().medium, RC.getColors().low],
      { centreTitle: t("charts.total") }
    );
  }

  /* ───────── public API (consumed by regulens.js experience layer) ───────── */
  window.ReguLens = {
    navigate,
    switchTheme,
    t,
    getLang: () => settings.lang,
    setLang: (lang) => {
      settings.lang = String(lang || "en").slice(0, 8);
      saveSettings();
      applySettings();
    },
    getAnalysisData: () => analysisData,
    setCommands: (on) => {
      commandsEnabled = !!on;
    },
    openConfirm,
    closeConfirm,
    doSignOut,
    openLoginModal,
    openDocumentPicker: () => els.docInput.click(),
    getState: () => ({
      user,
      chats,
      currentView,
      currentModule,
      commandsEnabled,
      dark: els.body.classList.contains("dark"),
      analysis: analysisData,
    }),
  };

  /* ───────── init ───────── */
  settings = loadSettings();
  applySettings();
  navigate("dashboard");
  updateAccountUI();

  (async () => {
    try {
      await window.AuroraFirebase.init();
      if (!window.AuroraFirebase.isConfigured()) {
        showAuthError(t("auth.error.notConfigured"));
        setAuthGate(true);
        return;
      }
      window.AuroraAuthService.onAuthStateChanged(handleAuthState);
    } catch (err) {
      showAuthError(err.message);
      setAuthGate(true);
    }
  })();
})();
