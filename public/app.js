(() => {
  "use strict";

  window.addEventListener("error", (e) => showErr(e.message || "Unknown error"));
  window.addEventListener("unhandledrejection", (e) =>
    showErr(e.reason && e.reason.message ? e.reason.message : "Unhandled promise rejection")
  );
  function showErr(msg) {
    const b = document.getElementById("errBadge");
    if (b && typeof msg === "string" && msg.length > 0) {
      b.textContent = msg;
      b.hidden = false;
    }
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ toast timer â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let toastTimer = null;
  
  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ element refs â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const els = {
    body: document.body,
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("sidebarOverlay"),
    navItems: Array.from(document.querySelectorAll(".nav-item")),
    views: Array.from(document.querySelectorAll(".view")),
    userBtn: document.getElementById("userBtn"),
    userMenu: document.getElementById("userMenu"),
    userMenuSignOut: document.getElementById("userMenuSignOut"),
    langBtn: document.getElementById("langBtn"),
    langMenu: document.getElementById("langMenu"),
    downloadReportBtn: document.getElementById("downloadReportBtn"),
    bookCallBtn: null,
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
    syncThemeSeg(settings.theme);
    applyI18n();
    updateAccountUI();
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const I18N = {
    en: {
      "nav.govCommand": "Gov Procurement Command Center",
      "nav.govWorkflow": "Problem Intelligence",
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
      "settings.checking": "Checkingâ€¦",
      "settings.aiConnected": "Connected Â· {model}",
      "settings.aiDisconnected": "Configured but unreachable",
      "settings.aiNotConfigured": "AI engine not configured",
      "settings.aiConnError": "Could not reach the AI engine",
      "settings.aiRetryHint": "Check your configuration and retry",
      "settings.retry": "Retry",
      "settings.clearMemory": "Clear memory",
      "settings.memoryAlreadyEmpty": "Nothing to clear â€” no saved conversations.",
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
      "auth.signingIn": "Signing inâ€¦",
      "auth.signingUp": "Creating accountâ€¦",
      "auth.creatingAccount": "Creating accountâ€¦",
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
      "doc.uploaded": "Uploaded â€œ{name}â€ to the Document Library",
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
      "sim.running": "Running simulationâ€¦",
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
      "ai.emptyDesc": "Run a launch analysis from the <strong>Organization Registration</strong> page to activate the multi-agent intelligence pipeline.",
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
      "settings.signedInAs": "SesiÃ³n iniciada como",
      "settings.notSignedIn": "No has iniciado sesiÃ³n",
      "settings.signIn": "Iniciar sesiÃ³n",
      "settings.signOut": "Cerrar sesiÃ³n",
      "settings.aiEngine": "Motor de IA",
      "settings.checking": "Comprobandoâ€¦",
      "settings.aiConnected": "Conectado Â· {model}",
      "settings.aiDisconnected": "Configurado pero inaccesible",
      "settings.aiNotConfigured": "Motor de IA no configurado",
      "settings.aiConnError": "No se pudo conectar con el motor de IA",
      "settings.aiRetryHint": "Revisa tu configuraciÃ³n e intÃ©ntalo de nuevo",
      "settings.retry": "Reintentar",
      "settings.clearMemory": "Borrar memoria",
      "settings.memoryAlreadyEmpty": "No hay nada que borrar.",
      "settings.memoryCleared": "Memoria de conversaciones borrada.",
      "settings.memoryClearError": "No se pudo borrar la memoria.",
      "profile.title": "Perfil",
      "profile.guest": "Invitado",
      "confirm.title": "Â¿Borrar la memoria de conversaciones?",
      "confirm.text": "Esto eliminarÃ¡ permanentemente todas tus conversaciones. No se puede deshacer.",
      "confirm.cancel": "Cancelar",
      "confirm.clear": "Borrar memoria",
      "auth.close": "Cerrar",
      "auth.welcomeBack": "Bienvenido de nuevo",
      "auth.loginSub": "Inicia sesiÃ³n para continuar",
      "auth.createAccount": "Crear cuenta",
      "auth.createAccountSub": "Crea tu cuenta de ReguLens",
      "auth.login": "Iniciar sesiÃ³n",
      "auth.signup": "Crear cuenta",
      "auth.name": "Nombre",
      "auth.email": "Correo",
      "auth.password": "ContraseÃ±a",
      "auth.forgotPassword": "Â¿Olvidaste tu contraseÃ±a?",
      "auth.noAccount": "Â¿No tienes cuenta?",
      "auth.haveAccount": "Â¿Ya tienes cuenta?",
      "auth.or": "O",
      "auth.continueGuest": "Continuar como invitado",
      "auth.signingIn": "Iniciando sesiÃ³nâ€¦",
      "auth.signingUp": "Creando cuentaâ€¦",
      "auth.creatingAccount": "Creando cuentaâ€¦",
      "auth.requiredError": "Completa todos los campos.",
      "auth.sendReset": "Enviar enlace de recuperaciÃ³n",
      "auth.backToSignIn": "Volver al inicio de sesiÃ³n",
      "auth.resetSent": "Correo de recuperaciÃ³n enviado.",
      "auth.signedIn": "SesiÃ³n iniciada como {email}",
      "auth.signedOut": "SesiÃ³n cerrada",
      "auth.guestSignedIn": "Continuando como invitado",
      "auth.welcome": "Bienvenido, {name}",
      "auth.error.invalidEmail": "Introduce un correo vÃ¡lido.",
      "auth.error.weakPassword": "La contraseÃ±a debe tener al menos 6 caracteres.",
      "auth.error.userNotFound": "No hay ninguna cuenta con este correo.",
      "auth.error.invalidCredential": "Correo o contraseÃ±a incorrectos.",
      "auth.error.emailInUse": "Ya existe una cuenta con este correo.",
      "auth.error.network": "Error de red. Comprueba tu conexiÃ³n.",
      "auth.error.popupClosed": "La ventana de inicio de sesiÃ³n se cerrÃ³.",
      "auth.error.popupBlocked": "Bloquea emergentes bloqueadas.",
      "auth.error.operationNotAllowed": "Este mÃ©todo de inicio de sesiÃ³n no estÃ¡ habilitado.",
      "auth.error.guestNotEnabled": "El acceso de invitado no estÃ¡ habilitado.",
      "auth.error.tooManyRequests": "Demasiados intentos. IntÃ©ntalo mÃ¡s tarde.",
      "auth.error.userDisabled": "Esta cuenta ha sido deshabilitada.",
      "auth.error.configError": "La autenticaciÃ³n no estÃ¡ configurada correctamente.",
      "auth.error.generic": "Algo saliÃ³ mal. IntÃ©ntalo de nuevo.",
      "auth.error.notConfigured": "ReguLens no estÃ¡ configurado para autenticaciÃ³n.",
      "notif.title": "Notificaciones",
      "notif.markAll": "Marcar como leÃ­das",
      "notif.empty": "EstÃ¡s al dÃ­a",
      "doc.download": "Descargar",
      "doc.close": "Cerrar",
      "doc.previewNone": "No hay vista previa para este tipo de archivo.",
      "doc.uploaded": "Subido â€œ{name}â€ a la biblioteca de documentos",
      "doc.uploadedCount": "{n} documentos en la biblioteca",
      "req.priority": "Prioridad",
      "req.status": "Estado",
      "req.reopen": "Reabrir",
      "req.inProgress": "Marcar en curso",
      "req.complete": "Marcar completado",
      "req.done": "Completado",
      "req.pending": "Pendiente",
      "req.progress": "En curso",
      "req.critical": "CrÃ­tico",
      "req.important": "Importante",
      "req.standard": "EstÃ¡ndar",
      "req.count": "{n} mostrados",
      "sim.results": "Resultados de la simulaciÃ³n",
      "sim.running": "Ejecutando simulaciÃ³nâ€¦",
      "sim.done": "Listo",
      "sim.reqs": "Requisitos aÃ±adidos",
      "sim.cost": "Impacto en el coste estimado",
      "sim.days": "Impacto en el plazo",
      "call.title": "Reservar una llamada",
      "call.sub": "IndÃ­canos cÃ³mo contactarte y un experto confirmarÃ¡ una cita.",
      "call.email": "Tu correo",
      "call.time": "Horario preferido",
      "call.invalid": "Introduce un correo vÃ¡lido",
      "call.sent": "Solicitud enviada. Te contactaremos pronto.",
      "rpt.title": "Informe de PreparaciÃ³n de Mercado y Cumplimiento Normativo",
      "rpt.generated": "Generado por ReguLens",
      "rpt.aiGenerated": "AnÃ¡lisis Generado por IA",
      "rpt.regulatorySource": "Fuente Regulatoria",
      "rpt.userInput": "InformaciÃ³n Proporcionada por el Usuario",
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
      "rpt.riskAssessment": "EvaluaciÃ³n de Riesgos",
      "rpt.businessImpact": "Impacto en el Negocio",
      "rpt.estimatedCost": "Costo Estimado",
      "rpt.estimatedTimeline": "Cronograma Estimado",
      "rpt.actionPlan": "Plan de AcciÃ³n Recomendado",
      "rpt.readinessScore": "PuntuaciÃ³n de PreparaciÃ³n del Mercado",
      "rpt.launchRecommendation": "RecomendaciÃ³n de Lanzamiento",
      "rpt.regulatorySources": "Fuentes Regulatorias",
      "rpt.timestamp": "Fecha del AnÃ¡lisis",
      "rpt.noData": "No hay datos de anÃ¡lisis disponibles. Ejecute un anÃ¡lisis de lanzamiento primero.",
      "rpt.generating": "Generando informe...",
      "rpt.failed": "Error al generar el informe. Intente de nuevo.",
      "rpt.retry": "Reintentar",
      "rpt.download": "Descargar Informe",
      "rpt.print": "Imprimir / Guardar como PDF",
      "rpt.close": "Cerrar",
      "rpt.company": "Empresa",
      "rpt.product": "Producto",
      "rpt.origin": "PaÃ­s de Origen",
      "rpt.target": "Mercado Objetivo",
      "rpt.industry": "Industria",
      "rpt.priority": "Prioridad",
      "rpt.status": "Estado",
      "rpt.authority": "Autoridad",
      "rpt.dueDate": "Fecha de Vencimiento",
      "rpt.description": "DescripciÃ³n",
      "rpt.totalCost": "Costo Total Estimado",
      "rpt.totalTime": "Tiempo Total Estimado",
      "rpt.riskLevel": "Nivel de Riesgo",
      "rpt.gaps": "Brechas Abiertas",
      "rpt.critical": "CrÃ­tico",
      "rpt.important": "Importante",
      "rpt.standard": "EstÃ¡ndar",
      "rpt.pending": "Pendiente",
      "rpt.inProgress": "En Progreso",
      "rpt.done": "Completado",
      "rpt.notApplicable": "No Aplicable",
      "rpt.action": "AcciÃ³n",
      "rpt.estimatedDays": "DÃ­as Estimados",
      "rpt.estimatedEur": "Costo Estimado (EUR)",
      "rpt.owner": "Parte Responsable",
      "rpt.category": "CategorÃ­a",
      "rpt.source": "Fuente",
      "rpt.code": "CÃ³digo de Referencia",
      "rpt.date": "Fecha",
      "rpt.kind": "Tipo",
      "rpt.summary": "Resumen",
      "rpt.proceed": "Proceder con el Lanzamiento",
      "rpt.conditional": "Lanzamiento Condicional",
      "rpt.delay": "Retrasar el Lanzamiento",
      "rpt.prerequisites": "Prerrequisitos",
      "rpt.verdict": "Veredicto",
      "rpt.timeline": "Cronograma para PreparaciÃ³n Completa",
      "rpt.disclaimer": "Este informe contiene anÃ¡lisis generado por IA basado en datos de inteligencia regulatoria. La informaciÃ³n regulatoria debe verificarse con fuentes oficiales antes de tomar decisiones comerciales. ReguLens no garantiza la exactitud de los datos regulatorios.",
      "rpt.page": "PÃ¡gina",
      "rpt.of": "de",
      "disclaimer.dashboard": "ReguLens proporciona inteligencia regulatoria y soporte de decisiÃ³n; las decisiones legales/de cumplimiento finales deben ser verificadas con profesionales calificados o fuentes regulatorias autorizadas.",
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
      "ai.emptyDesc": "Ejecute un anÃ¡lisis de lanzamiento desde la pÃ¡gina <strong>Â¿Puedo Lanzar?</strong> para activar el pipeline de inteligencia multi-agente.",
      "ai.startAnalysis": "Iniciar AnÃ¡lisis",
    },
    fr: {
      "nav.dashboard": "Tableau de bord",
      "settings.title": "ParamÃ¨tres",
      "settings.general": "GÃ©nÃ©ral",
      "settings.language": "Langue",
      "settings.density": "DensitÃ©",
      "settings.theme": "ThÃ¨me",
      "settings.theme.light": "Clair",
      "settings.theme.dark": "Sombre",
      "settings.account": "Compte",
      "settings.signedInAs": "ConnectÃ© en tant que",
      "settings.notSignedIn": "Non connectÃ©",
      "settings.signIn": "Se connecter",
      "settings.signOut": "Se dÃ©connecter",
      "settings.aiEngine": "Moteur IA",
      "settings.checking": "VÃ©rificationâ€¦",
      "settings.aiConnected": "ConnectÃ© Â· {model}",
      "settings.aiDisconnected": "ConfigurÃ© mais inaccessible",
      "settings.aiNotConfigured": "Moteur IA non configurÃ©",
      "settings.aiConnError": "Impossible de joindre le moteur IA",
      "settings.aiRetryHint": "VÃ©rifiez la configuration et rÃ©essayez",
      "settings.retry": "RÃ©essayer",
      "settings.clearMemory": "Effacer la mÃ©moire",
      "settings.memoryAlreadyEmpty": "Rien Ã  effacer.",
      "settings.memoryCleared": "MÃ©moire des conversations effacÃ©e.",
      "settings.memoryClearError": "Impossible d'effacer la mÃ©moire.",
      "profile.title": "Profil",
      "profile.guest": "InvitÃ©",
      "confirm.title": "Effacer la mÃ©moire des conversations ?",
      "confirm.text": "Cela supprimera dÃ©finitivement toutes vos conversations. Impossible d'annuler.",
      "confirm.cancel": "Annuler",
      "confirm.clear": "Effacer la mÃ©moire",
      "auth.close": "Fermer",
      "auth.welcomeBack": "Bon retour",
      "auth.loginSub": "Connectez-vous pour continuer",
      "auth.createAccount": "CrÃ©er un compte",
      "auth.createAccountSub": "CrÃ©ez votre compte ReguLens",
      "auth.login": "Se connecter",
      "auth.signup": "CrÃ©er un compte",
      "auth.name": "Nom",
      "auth.email": "E-mail",
      "auth.password": "Mot de passe",
      "auth.forgotPassword": "Mot de passe oubliÃ© ?",
      "auth.noAccount": "Pas encore de compte ?",
      "auth.haveAccount": "DÃ©jÃ  un compte ?",
      "auth.or": "OU",
      "auth.continueGuest": "Continuer en invitÃ©",
      "auth.signingIn": "Connexionâ€¦",
      "auth.signingUp": "CrÃ©ation du compteâ€¦",
      "auth.creatingAccount": "CrÃ©ation du compteâ€¦",
      "auth.requiredError": "Veuillez remplir tous les champs.",
      "auth.sendReset": "Envoyer le lien de rÃ©initialisation",
      "auth.backToSignIn": "Retour Ã  la connexion",
      "auth.resetSent": "E-mail de rÃ©initialisation envoyÃ©.",
      "auth.signedIn": "ConnectÃ© en tant que {email}",
      "auth.signedOut": "DÃ©connectÃ©",
      "auth.guestSignedIn": "Continuer en invitÃ©",
      "auth.welcome": "Bienvenue, {name}",
      "auth.error.invalidEmail": "Veuillez saisir un e-mail valide.",
      "auth.error.weakPassword": "Le mot de passe doit comporter au moins 6 caractÃ¨res.",
      "auth.error.userNotFound": "Aucun compte avec cet e-mail.",
      "auth.error.invalidCredential": "E-mail ou mot de passe incorrect.",
      "auth.error.emailInUse": "Un compte existe dÃ©jÃ  avec cet e-mail.",
      "auth.error.network": "Erreur rÃ©seau. VÃ©rifiez votre connexion.",
      "auth.error.popupClosed": "La fenÃªtre de connexion a Ã©tÃ© fermÃ©e.",
      "auth.error.popupBlocked": "Les pop-ups sont bloquÃ©es.",
      "auth.error.operationNotAllowed": "Cette mÃ©thode de connexion n'est pas activÃ©e.",
      "auth.error.guestNotEnabled": "L'accÃ¨s invitÃ© n'est pas activÃ©.",
      "auth.error.tooManyRequests": "Trop de tentatives. RÃ©essayez plus tard.",
      "auth.error.userDisabled": "Ce compte a Ã©tÃ© dÃ©sactivÃ©.",
      "auth.error.configError": "L'authentification n'est pas configurÃ©e correctement.",
      "auth.error.generic": "Une erreur est survenue. RÃ©essayez.",
      "auth.error.notConfigured": "ReguLens n'est pas configurÃ© pour l'authentification.",
      "notif.title": "Notifications",
      "notif.markAll": "Tout marquer comme lu",
      "notif.empty": "Vous Ãªtes Ã  jour",
      "doc.download": "TÃ©lÃ©charger",
      "doc.close": "Fermer",
      "doc.previewNone": "Aucun aperÃ§u disponible pour ce type de fichier.",
      "doc.uploaded": "Â« {name} Â» ajoutÃ© Ã  la bibliothÃ¨que de documents",
      "doc.uploadedCount": "{n} documents dans la bibliothÃ¨que",
      "req.priority": "PrioritÃ©",
      "req.status": "Statut",
      "req.reopen": "Rouvrir",
      "req.inProgress": "Marquer en cours",
      "req.complete": "Marquer comme terminÃ©",
      "req.done": "TerminÃ©",
      "req.pending": "En attente",
      "req.progress": "En cours",
      "req.critical": "Critique",
      "req.important": "Important",
      "req.standard": "Standard",
      "req.count": "{n} affichÃ©s",
      "sim.results": "RÃ©sultats de la simulation",
      "sim.running": "Simulation en coursâ€¦",
      "sim.done": "TerminÃ©",
      "sim.reqs": "Exigences ajoutÃ©es",
      "sim.cost": "Impact estimÃ© sur les coÃ»ts",
      "sim.days": "Impact sur le calendrier",
      "call.title": "RÃ©server un appel",
      "call.sub": "Indiquez-nous comment vous joindre et un expert confirmera un crÃ©neau.",
      "call.email": "Votre e-mail",
      "call.time": "CrÃ©neau prÃ©fÃ©rÃ©",
      "call.invalid": "Veuillez saisir un e-mail valide",
      "call.sent": "Demande envoyÃ©e ! Un expert vous contactera bientÃ´t.",
      "rpt.title": "Rapport de PrÃ©paration de MarchÃ© et ConformitÃ© RÃ©glementaire",
      "rpt.generated": "GÃ©nÃ©rÃ© par ReguLens",
      "rpt.aiGenerated": "Analyse GÃ©nÃ©rÃ©e par IA",
      "rpt.regulatorySource": "Source RÃ©glementaire",
      "rpt.userInput": "Informations Fournies par l'Utilisateur",
      "rpt.executiveSummary": "RÃ©sumÃ© ExÃ©cutif",
      "rpt.companyProfile": "Profil de l'Entreprise",
      "rpt.productProfile": "Profil du Produit",
      "rpt.sourceMarket": "MarchÃ© d'Origine",
      "rpt.targetMarket": "MarchÃ© Cible",
      "rpt.applicableRegulations": "RÃ©glementations Applicables",
      "rpt.complianceRequirements": "Exigences de ConformitÃ©",
      "rpt.completedReqs": "Exigences Accomplies",
      "rpt.pendingReqs": "Exigences en Attente",
      "rpt.complianceGaps": "Ã‰carts de ConformitÃ©",
      "rpt.riskAssessment": "Ã‰valuation des Risques",
      "rpt.businessImpact": "Impact Commercial",
      "rpt.estimatedCost": "CoÃ»t EstimÃ©",
      "rpt.estimatedTimeline": "Calendrier EstimÃ©",
      "rpt.actionPlan": "Plan d'Action RecommandÃ©",
      "rpt.readinessScore": "Score de PrÃ©paration du MarchÃ©",
      "rpt.launchRecommendation": "Recommandation de Lancement",
      "rpt.regulatorySources": "Sources RÃ©glementaires",
      "rpt.timestamp": "Horodatage de l'Analyse",
      "rpt.noData": "Aucune donnÃ©e d'analyse disponible. Lancez d'abord une analyse de marchÃ©.",
      "rpt.generating": "GÃ©nÃ©ration du rapport...",
      "rpt.failed": "Ã‰chec de la gÃ©nÃ©ration du rapport. Veuillez rÃ©essayer.",
      "rpt.retry": "RÃ©essayer",
      "rpt.download": "TÃ©lÃ©charger le Rapport",
      "rpt.print": "Imprimer / Enregistrer en PDF",
      "rpt.close": "Fermer",
      "rpt.company": "Entreprise",
      "rpt.product": "Produit",
      "rpt.origin": "Pays d'Origine",
      "rpt.target": "MarchÃ© Cible",
      "rpt.industry": "Secteur",
      "rpt.priority": "PrioritÃ©",
      "rpt.status": "Statut",
      "rpt.authority": "AutoritÃ©",
      "rpt.dueDate": "Date d'Ã‰chÃ©ance",
      "rpt.description": "Description",
      "rpt.totalCost": "CoÃ»t Total EstimÃ©",
      "rpt.totalTime": "Temps Total EstimÃ©",
      "rpt.riskLevel": "Niveau de Risque",
      "rpt.gaps": "Ã‰carts Ouverts",
      "rpt.critical": "Critique",
      "rpt.important": "Important",
      "rpt.standard": "Standard",
      "rpt.pending": "En Attente",
      "rpt.inProgress": "En Cours",
      "rpt.done": "TerminÃ©",
      "rpt.notApplicable": "Non Applicable",
      "rpt.action": "Action",
      "rpt.estimatedDays": "Jours EstimÃ©s",
      "rpt.estimatedEur": "CoÃ»t EstimÃ© (EUR)",
      "rpt.owner": "Partie Responsable",
      "rpt.category": "CatÃ©gorie",
      "rpt.source": "Source",
      "rpt.code": "Code de RÃ©fÃ©rence",
      "rpt.date": "Date",
      "rpt.kind": "Type",
      "rpt.summary": "RÃ©sumÃ©",
      "rpt.proceed": "ProcÃ©der au Lancement",
      "rpt.conditional": "Lancement Conditionnel",
      "rpt.delay": "Reporter le Lancement",
      "rpt.prerequisites": "PrÃ©requis",
      "rpt.verdict": "Verdict",
      "rpt.timeline": "Calendrier de PrÃ©paration ComplÃ¨te",
      "rpt.disclaimer": "Ce rapport contient une analyse gÃ©nÃ©rÃ©e par IA basÃ©e sur des donnÃ©es de veille rÃ©glementaire. Les informations rÃ©glementaires doivent Ãªtre vÃ©rifiÃ©es auprÃ¨s de sources officielles avant de prendre des dÃ©cisions commerciales. ReguLens ne garantit pas l'exactitude des donnÃ©es rÃ©glementaires.",
      "rpt.page": "Page",
      "rpt.of": "sur",
      "disclaimer.dashboard": "ReguLens fournit des informations rÃ©glementaires et un soutien Ã  la dÃ©cision ; les dÃ©cisions juridiques/de conformitÃ© dÃ©finitives doivent Ãªtre vÃ©rifiÃ©es par des professionnels qualifiÃ©s ou des sources rÃ©glementaires officielles.",
      "ai.agents": "Agents",
      "ai.completed": "TerminÃ©s",
      "ai.failed": "Ã‰chouÃ©s",
      "ai.totalTime": "Temps Total",
      "ai.pending": "En attente",
      "ai.running": "En cours",
      "ai.completedStatus": "TerminÃ©",
      "ai.failedStatus": "Ã‰chouÃ©",
      "ai.input": "EntrÃ©e",
      "ai.output": "Sortie",
      "ai.sources": "Sources",
      "ai.retry": "RÃ©essayer",
      "ai.emptyTitle": "Aucune ActivitÃ© d'Agent",
      "ai.emptyDesc": "Lancez une analyse depuis la page <strong>Puis-je Lancer ?</strong> pour activer le pipeline d'intelligence multi-agents.",
      "ai.startAnalysis": "Lancer l'Analyse",
    },
    hi: {
      "nav.dashboard": "à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡",
      "settings.title": "à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸",
      "settings.general": "à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯",
      "settings.language": "à¤­à¤¾à¤·à¤¾",
      "settings.density": "à¤˜à¤¨à¤¤à¥à¤µ",
      "settings.theme": "à¤¥à¥€à¤®",
      "settings.theme.light": "à¤²à¤¾à¤‡à¤Ÿ",
      "settings.theme.dark": "à¤¡à¤¾à¤°à¥à¤•",
      "settings.account": "à¤–à¤¾à¤¤à¤¾",
      "settings.signedInAs": "à¤‡à¤¸ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨",
      "settings.notSignedIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤¨à¤¹à¥€à¤‚",
      "settings.signIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤•à¤°à¥‡à¤‚",
      "settings.signOut": "à¤¸à¤¾à¤‡à¤¨ à¤†à¤‰à¤Ÿ à¤•à¤°à¥‡à¤‚",
      "settings.aiEngine": "AI à¤‡à¤‚à¤œà¤¨",
      "settings.checking": "à¤œà¤¾à¤à¤š à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚â€¦",
      "settings.aiConnected": "à¤•à¤¨à¥‡à¤•à¥à¤Ÿà¥‡à¤¡ Â· {model}",
      "settings.aiDisconnected": "à¤•à¥‰à¤¨à¥à¤«à¤¼à¤¿à¤—à¤° à¤¹à¥ˆ à¤ªà¤° à¤…à¤¨à¥à¤ªà¤²à¤¬à¥à¤§",
      "settings.aiNotConfigured": "AI à¤‡à¤‚à¤œà¤¨ à¤•à¥‰à¤¨à¥à¤«à¤¼à¤¿à¤—à¤° à¤¨à¤¹à¥€à¤‚",
      "settings.aiConnError": "AI à¤‡à¤‚à¤œà¤¨ à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¤¾",
      "settings.aiRetryHint": "à¤•à¥‰à¤¨à¥à¤«à¤¼à¤¿à¤—à¤°à¥‡à¤¶à¤¨ à¤œà¤¾à¤à¤šà¥‡à¤‚ à¤”à¤° à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚",
      "settings.retry": "à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸",
      "settings.clearMemory": "à¤®à¥‡à¤®à¥‹à¤°à¥€ à¤¸à¤¾à¤«à¤¼ à¤•à¤°à¥‡à¤‚",
      "settings.memoryAlreadyEmpty": "à¤¸à¤¾à¤«à¤¼ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥à¤› à¤¨à¤¹à¥€à¤‚à¥¤",
      "settings.memoryCleared": "à¤•à¤¨à¥à¤µà¤°à¥à¤¸à¥‡à¤¶à¤¨ à¤®à¥‡à¤®à¥‹à¤°à¥€ à¤¸à¤¾à¤«à¤¼ à¤•à¥€ à¤—à¤ˆà¥¤",
      "settings.memoryClearError": "à¤®à¥‡à¤®à¥‹à¤°à¥€ à¤¸à¤¾à¤«à¤¼ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¥€à¥¤",
      "profile.title": "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤²",
      "profile.guest": "à¤…à¤¤à¤¿à¤¥à¤¿",
      "confirm.title": "à¤•à¤¨à¥à¤µà¤°à¥à¤¸à¥‡à¤¶à¤¨ à¤®à¥‡à¤®à¥‹à¤°à¥€ à¤¸à¤¾à¤«à¤¼ à¤•à¤°à¥‡à¤‚?",
      "confirm.text": "à¤‡à¤¸à¤¸à¥‡ à¤†à¤ªà¤•à¥€ à¤¸à¤­à¥€ à¤•à¤¨à¥à¤µà¤°à¥à¤¸à¥‡à¤¶à¤¨ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤°à¥‚à¤ª à¤¸à¥‡ à¤¹à¤Ÿ à¤œà¤¾à¤à¤à¤—à¥€à¥¤ à¤‡à¤¸à¥‡ à¤ªà¥‚à¤°à¥à¤µà¤µà¤¤ à¤¨à¤¹à¥€à¤‚ à¤•à¤¿à¤¯à¤¾ à¤œà¤¾ à¤¸à¤•à¤¤à¤¾à¥¤",
      "confirm.cancel": "à¤°à¤¦à¥à¤¦ à¤•à¤°à¥‡à¤‚",
      "confirm.clear": "à¤®à¥‡à¤®à¥‹à¤°à¥€ à¤¸à¤¾à¤«à¤¼ à¤•à¤°à¥‡à¤‚",
      "auth.close": "à¤¬à¤‚à¤¦ à¤•à¤°à¥‡à¤‚",
      "auth.welcomeBack": "à¤µà¤¾à¤ªà¤¸à¥€ à¤ªà¤° à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ",
      "auth.loginSub": "à¤œà¤¾à¤°à¥€ à¤°à¤–à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤•à¤°à¥‡à¤‚",
      "auth.createAccount": "à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨à¤¾à¤à¤",
      "auth.createAccountSub": "à¤…à¤ªà¤¨à¤¾ ReguLens à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨à¤¾à¤à¤",
      "auth.login": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤•à¤°à¥‡à¤‚",
      "auth.signup": "à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨à¤¾à¤à¤",
      "auth.name": "à¤¨à¤¾à¤®",
      "auth.email": "à¤ˆà¤®à¥‡à¤²",
      "auth.password": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡",
      "auth.forgotPassword": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡ à¤­à¥‚à¤² à¤—à¤?",
      "auth.noAccount": "à¤–à¤¾à¤¤à¤¾ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆ?",
      "auth.haveAccount": "à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤–à¤¾à¤¤à¤¾ à¤¹à¥ˆ?",
      "auth.or": "à¤¯à¤¾",
      "auth.continueGuest": "à¤…à¤¤à¤¿à¤¥à¤¿ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤œà¤¾à¤°à¥€ à¤°à¤–à¥‡à¤‚",
      "auth.signingIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆâ€¦",
      "auth.signingUp": "à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨ à¤°à¤¹à¤¾ à¤¹à¥ˆâ€¦",
      "auth.creatingAccount": "à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨ à¤°à¤¹à¤¾ à¤¹à¥ˆâ€¦",
      "auth.requiredError": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¸à¤­à¥€ à¤«à¤¼à¥€à¤²à¥à¤¡ à¤­à¤°à¥‡à¤‚à¥¤",
      "auth.sendReset": "à¤°à¥€à¤¸à¥‡à¤Ÿ à¤²à¤¿à¤‚à¤• à¤­à¥‡à¤œà¥‡à¤‚",
      "auth.backToSignIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤ªà¤° à¤µà¤¾à¤ªà¤¸",
      "auth.resetSent": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡ à¤°à¥€à¤¸à¥‡à¤Ÿ à¤ˆà¤®à¥‡à¤² à¤­à¥‡à¤œà¤¾ à¤—à¤¯à¤¾à¥¤",
      "auth.signedIn": "{email} à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨",
      "auth.signedOut": "à¤¸à¤¾à¤‡à¤¨ à¤†à¤‰à¤Ÿ",
      "auth.guestSignedIn": "à¤…à¤¤à¤¿à¤¥à¤¿ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤œà¤¾à¤°à¥€",
      "auth.welcome": "à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ, {name}",
      "auth.error.invalidEmail": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤®à¤¾à¤¨à¥à¤¯ à¤ˆà¤®à¥‡à¤² à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤",
      "auth.error.weakPassword": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡ à¤•à¤® à¤¸à¥‡ à¤•à¤® 6 à¤…à¤•à¥à¤·à¤°à¥‹à¤‚ à¤•à¤¾ à¤¹à¥‹à¥¤",
      "auth.error.userNotFound": "à¤‡à¤¸ à¤ˆà¤®à¥‡à¤² à¤¸à¥‡ à¤•à¥‹à¤ˆ à¤–à¤¾à¤¤à¤¾ à¤¨à¤¹à¥€à¤‚à¥¤",
      "auth.error.invalidCredential": "à¤—à¤²à¤¤ à¤ˆà¤®à¥‡à¤² à¤¯à¤¾ à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡à¥¤",
      "auth.error.emailInUse": "à¤‡à¤¸ à¤ˆà¤®à¥‡à¤² à¤¸à¥‡ à¤–à¤¾à¤¤à¤¾ à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤®à¥Œà¤œà¥‚à¤¦ à¤¹à¥ˆà¥¤",
      "auth.error.network": "à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤• à¤¤à¥à¤°à¥à¤Ÿà¤¿à¥¤ à¤•à¤¨à¥‡à¤•à¥à¤¶à¤¨ à¤œà¤¾à¤à¤šà¥‡à¤‚à¥¤",
      "auth.error.popupClosed": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤µà¤¿à¤‚à¤¡à¥‹ à¤¬à¤‚à¤¦ à¤¹à¥‹ à¤—à¤ˆà¥¤",
      "auth.error.popupBlocked": "à¤ªà¥‰à¤ª-à¤…à¤ª à¤¬à¥à¤²à¥‰à¤• à¤¹à¥ˆà¥¤",
      "auth.error.operationNotAllowed": "à¤¯à¤¹ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤µà¤¿à¤§à¤¿ à¤¸à¤•à¥à¤·à¤® à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
      "auth.error.guestNotEnabled": "à¤…à¤¤à¤¿à¤¥à¤¿ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤¸à¤•à¥à¤·à¤® à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
      "auth.error.tooManyRequests": "à¤¬à¤¹à¥à¤¤ à¤…à¤§à¤¿à¤• à¤ªà¥à¤°à¤¯à¤¾à¤¸à¥¤ à¤¬à¤¾à¤¦ à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚à¥¤",
      "auth.error.userDisabled": "à¤¯à¤¹ à¤–à¤¾à¤¤à¤¾ à¤…à¤•à¥à¤·à¤® à¤•à¤° à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¹à¥ˆà¥¤",
      "auth.error.configError": "à¤ªà¥à¤°à¤®à¤¾à¤£à¥€à¤•à¤°à¤£ à¤¸à¤¹à¥€ à¤¢à¤‚à¤— à¤¸à¥‡ à¤•à¥‰à¤¨à¥à¤«à¤¼à¤¿à¤—à¤° à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
      "auth.error.generic": "à¤•à¥à¤› à¤—à¤²à¤¤ à¤¹à¥à¤†à¥¤ à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚à¥¤",
      "auth.error.notConfigured": "ReguLens à¤ªà¥à¤°à¤®à¤¾à¤£à¥€à¤•à¤°à¤£ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥‰à¤¨à¥à¤«à¤¼à¤¿à¤—à¤° à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
      "notif.title": "à¤¸à¥‚à¤šà¤¨à¤¾à¤à¤",
      "notif.markAll": "à¤¸à¤­à¥€ à¤ªà¤¢à¤¼à¥€ à¤¹à¥à¤ˆ à¤šà¤¿à¤¹à¥à¤¨à¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
      "notif.empty": "à¤†à¤ª à¤…à¤ª-à¤Ÿà¥‚-à¤¡à¥‡à¤Ÿ à¤¹à¥ˆà¤‚",
      "doc.download": "à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡",
      "doc.close": "à¤¬à¤‚à¤¦ à¤•à¤°à¥‡à¤‚",
      "doc.previewNone": "à¤‡à¤¸ à¤«à¤¼à¤¾à¤‡à¤² à¤ªà¥à¤°à¤•à¤¾à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤ªà¥‚à¤°à¥à¤µà¤¾à¤µà¤²à¥‹à¤•à¤¨ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
      "doc.uploaded": "â€œ{name}â€ à¤¡à¥‰à¤•à¥à¤¯à¥‚à¤®à¥‡à¤‚à¤Ÿ à¤²à¤¾à¤‡à¤¬à¥à¤°à¥‡à¤°à¥€ à¤®à¥‡à¤‚ à¤…à¤ªà¤²à¥‹à¤¡ à¤¹à¥à¤†",
      "doc.uploadedCount": "à¤²à¤¾à¤‡à¤¬à¥à¤°à¥‡à¤°à¥€ à¤®à¥‡à¤‚ {n} à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼",
      "req.priority": "à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤•à¤¤à¤¾",
      "req.status": "à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
      "req.reopen": "à¤«à¤¿à¤° à¤–à¥‹à¤²à¥‡à¤‚",
      "req.inProgress": "à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ªà¤° à¤šà¤¿à¤¹à¥à¤¨à¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
      "req.complete": "à¤ªà¥‚à¤°à¥à¤£ à¤šà¤¿à¤¹à¥à¤¨à¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
      "req.done": "à¤ªà¥‚à¤°à¥à¤£",
      "req.pending": "à¤²à¤‚à¤¬à¤¿à¤¤",
      "req.progress": "à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ªà¤°",
      "req.critical": "à¤—à¤‚à¤­à¥€à¤°",
      "req.important": "à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£",
      "req.standard": "à¤®à¤¾à¤¨à¤•",
      "req.count": "{n} à¤¦à¤¿à¤–à¤¾à¤ à¤—à¤",
      "sim.results": "à¤¸à¤¿à¤®à¥à¤²à¥‡à¤¶à¤¨ à¤ªà¤°à¤¿à¤£à¤¾à¤®",
      "sim.running": "à¤¸à¤¿à¤®à¥à¤²à¥‡à¤¶à¤¨ à¤šà¤² à¤°à¤¹à¤¾ à¤¹à¥ˆâ€¦",
      "sim.done": "à¤ªà¥‚à¤°à¥à¤£",
      "sim.reqs": "à¤œà¥‹à¤¡à¤¼à¥€ à¤—à¤ˆà¤‚ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤",
      "sim.cost": "à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤²à¤¾à¤—à¤¤ à¤ªà¥à¤°à¤­à¤¾à¤µ",
      "sim.days": "à¤¸à¤®à¤¯à¤°à¥‡à¤–à¤¾ à¤ªà¥à¤°à¤­à¤¾à¤µ",
      "call.title": "à¤•à¥‰à¤² à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚",
      "call.sub": "à¤¹à¤®à¥‡à¤‚ à¤…à¤ªà¤¨à¤¾ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤¬à¤¤à¤¾à¤à¤‚ à¤”à¤° à¤¹à¤®à¤¾à¤°à¤¾ à¤…à¤¨à¥à¤ªà¤¾à¤²à¤¨ à¤µà¤¿à¤¶à¥‡à¤·à¤œà¥à¤ž à¤¸à¥à¤²à¥‰à¤Ÿ à¤ªà¥à¤·à¥à¤Ÿà¤¿ à¤•à¤°à¥‡à¤—à¤¾à¥¤",
      "call.email": "à¤†à¤ªà¤•à¤¾ à¤ˆà¤®à¥‡à¤²",
      "call.time": "à¤ªà¤¸à¤‚à¤¦à¥€à¤¦à¤¾ à¤¸à¤®à¤¯",
      "call.invalid": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤®à¤¾à¤¨à¥à¤¯ à¤ˆà¤®à¥‡à¤² à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚",
      "call.sent": "à¤…à¤¨à¥à¤°à¥‹à¤§ à¤­à¥‡à¤œà¤¾ à¤—à¤¯à¤¾! à¤¹à¤®à¤¾à¤°à¤¾ à¤µà¤¿à¤¶à¥‡à¤·à¤œà¥à¤ž à¤¶à¥€à¤˜à¥à¤° à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤—à¤¾à¥¤",
      "rpt.title": "à¤¬à¤¾à¤œà¤¼à¤¾à¤° à¤¤à¤¤à¥à¤ªà¤°à¤¤à¤¾ à¤”à¤° à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤…à¤¨à¥à¤ªà¤¾à¤²à¤¨ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ",
      "rpt.generated": "ReguLens à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¨à¤°à¥‡à¤Ÿ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
      "rpt.aiGenerated": "AI-à¤œà¤¨à¤°à¥‡à¤Ÿà¥‡à¤¡ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
      "rpt.regulatorySource": "à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¸à¥à¤°à¥‹à¤¤",
      "rpt.userInput": "à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤ªà¥à¤°à¤¦à¤¾à¤¨ à¤•à¥€ à¤—à¤ˆ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€",
      "rpt.executiveSummary": "à¤•à¤¾à¤°à¥à¤¯à¤•à¤¾à¤°à¥€ à¤¸à¤¾à¤°à¤¾à¤‚à¤¶",
      "rpt.companyProfile": "à¤•à¤‚à¤ªà¤¨à¥€ à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤²",
      "rpt.productProfile": "à¤‰à¤¤à¥à¤ªà¤¾à¤¦ à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤²",
      "rpt.sourceMarket": "à¤¸à¥à¤°à¥‹à¤¤ à¤¬à¤¾à¤œà¤¼à¤¾à¤°",
      "rpt.targetMarket": "à¤²à¤•à¥à¤·à¥à¤¯ à¤¬à¤¾à¤œà¤¼à¤¾à¤°",
      "rpt.applicableRegulations": "à¤²à¤¾à¤—à¥‚ à¤¨à¤¿à¤¯à¤®",
      "rpt.complianceRequirements": "à¤…à¤¨à¥à¤ªà¤¾à¤²à¤¨ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤",
      "rpt.completedReqs": "à¤ªà¥‚à¤°à¥à¤£ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤",
      "rpt.pendingReqs": "à¤²à¤‚à¤¬à¤¿à¤¤ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾à¤à¤",
      "rpt.complianceGaps": "à¤…à¤¨à¥à¤ªà¤¾à¤²à¤¨ à¤…à¤‚à¤¤à¤°",
      "rpt.riskAssessment": "à¤œà¥‹à¤–à¤¿à¤® à¤®à¥‚à¤²à¥à¤¯à¤¾à¤‚à¤•à¤¨",
      "rpt.businessImpact": "à¤µà¥à¤¯à¤¾à¤ªà¤¾à¤° à¤ªà¥à¤°à¤­à¤¾à¤µ",
      "rpt.estimatedCost": "à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤²à¤¾à¤—à¤¤",
      "rpt.estimatedTimeline": "à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤¸à¤®à¤¯à¤°à¥‡à¤–à¤¾",
      "rpt.actionPlan": "à¤…à¤¨à¥à¤¶à¤‚à¤¸à¤¿à¤¤ à¤•à¤¾à¤°à¥à¤¯ à¤¯à¥‹à¤œà¤¨à¤¾",
      "rpt.readinessScore": "à¤¬à¤¾à¤œà¤¼à¤¾à¤° à¤¤à¤¤à¥à¤ªà¤°à¤¤à¤¾ à¤¸à¥à¤•à¥‹à¤°",
      "rpt.launchRecommendation": "à¤²à¥‰à¤¨à¥à¤š à¤¸à¤¿à¤«à¤¾à¤°à¤¿à¤¶",
      "rpt.regulatorySources": "à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¸à¥à¤°à¥‹à¤¤",
      "rpt.timestamp": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¸à¤®à¤¯",
      "rpt.noData": "à¤•à¥‹à¤ˆ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¡à¥‡à¤Ÿà¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚à¥¤ à¤ªà¤¹à¤²à¥‡ à¤²à¥‰à¤¨à¥à¤š à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤šà¤²à¤¾à¤à¤à¥¤",
      "rpt.generating": "à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤œà¤¨à¤°à¥‡à¤Ÿ à¤¹à¥‹ à¤°à¤¹à¥€ à¤¹à¥ˆ...",
      "rpt.failed": "à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤œà¤¨à¤°à¥‡à¤Ÿ à¤•à¤°à¤¨à¥‡ à¤®à¥‡à¤‚ à¤µà¤¿à¤«à¤²à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚à¥¤",
      "rpt.retry": "à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸",
      "rpt.download": "à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚",
      "rpt.print": "à¤ªà¥à¤°à¤¿à¤‚à¤Ÿ / PDF à¤®à¥‡à¤‚ à¤¸à¤¹à¥‡à¤œà¥‡à¤‚",
      "rpt.close": "à¤¬à¤‚à¤¦ à¤•à¤°à¥‡à¤‚",
      "rpt.company": "à¤•à¤‚à¤ªà¤¨à¥€",
      "rpt.product": "à¤‰à¤¤à¥à¤ªà¤¾à¤¦",
      "rpt.origin": "à¤®à¥‚à¤² à¤¦à¥‡à¤¶",
      "rpt.target": "à¤²à¤•à¥à¤·à¥à¤¯ à¤¬à¤¾à¤œà¤¼à¤¾à¤°",
      "rpt.industry": "à¤‰à¤¦à¥à¤¯à¥‹à¤—",
      "rpt.priority": "à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤•à¤¤à¤¾",
      "rpt.status": "à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
      "rpt.authority": "à¤ªà¥à¤°à¤¾à¤§à¤¿à¤•à¤°à¤£",
      "rpt.dueDate": "à¤¨à¤¿à¤¯à¤¤ à¤¤à¤¿à¤¥à¤¿",
      "rpt.description": "à¤µà¤¿à¤µà¤°à¤£",
      "rpt.totalTotal": "à¤•à¥à¤² à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤²à¤¾à¤—à¤¤",
      "rpt.totalTime": "à¤•à¥à¤² à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤¸à¤®à¤¯",
      "rpt.riskLevel": "à¤œà¥‹à¤–à¤¿à¤® à¤¸à¥à¤¤à¤°",
      "rpt.gaps": "à¤–à¥à¤²à¥‡ à¤…à¤‚à¤¤à¤°",
      "rpt.critical": "à¤—à¤‚à¤­à¥€à¤°",
      "rpt.important": "à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£",
      "rpt.standard": "à¤®à¤¾à¤¨à¤•",
      "rpt.pending": "à¤²à¤‚à¤¬à¤¿à¤¤",
      "rpt.inProgress": "à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ªà¤°",
      "rpt.done": "à¤ªà¥‚à¤°à¥à¤£",
      "rpt.notApplicable": "à¤²à¤¾à¤—à¥‚ à¤¨à¤¹à¥€à¤‚",
      "rpt.action": "à¤•à¤¾à¤°à¥à¤¯",
      "rpt.estimatedDays": "à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤¦à¤¿à¤¨",
      "rpt.estimatedEur": "à¤…à¤¨à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤²à¤¾à¤—à¤¤ (EUR)",
      "rpt.owner": "à¤œà¤¿à¤®à¥à¤®à¥‡à¤¦à¤¾à¤° à¤ªà¤•à¥à¤·",
      "rpt.category": "à¤¶à¥à¤°à¥‡à¤£à¥€",
      "rpt.source": "à¤¸à¥à¤°à¥‹à¤¤",
      "rpt.code": "à¤¸à¤‚à¤¦à¤°à¥à¤­ à¤•à¥‹à¤¡",
      "rpt.date": "à¤¤à¤¿à¤¥à¤¿",
      "rpt.kind": "à¤ªà¥à¤°à¤•à¤¾à¤°",
      "rpt.summary": "à¤¸à¤¾à¤°à¤¾à¤‚à¤¶",
      "rpt.proceed": "à¤²à¥‰à¤¨à¥à¤š à¤•à¥‡ à¤¸à¤¾à¤¥ à¤†à¤—à¥‡ à¤¬à¤¢à¤¼à¥‡à¤‚",
      "rpt.conditional": "à¤¶à¤°à¥à¤¤à¤¿à¤¤ à¤²à¥‰à¤¨à¥à¤š",
      "rpt.delay": "à¤²à¥‰à¤¨à¥à¤š à¤®à¥‡à¤‚ à¤¦à¥‡à¤°à¥€",
      "rpt.prerequisites": "à¤ªà¥‚à¤°à¥à¤µ à¤¶à¤°à¥à¤¤à¥‡à¤‚",
      "rpt.verdict": "à¤¨à¤¿à¤°à¥à¤£à¤¯",
      "rpt.timeline": "à¤ªà¥‚à¤°à¥à¤£ à¤¤à¤¤à¥à¤ªà¤°à¤¤à¤¾ à¤•à¥€ à¤¸à¤®à¤¯à¤°à¥‡à¤–à¤¾",
      "rpt.disclaimer": "à¤‡à¤¸ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤®à¥‡à¤‚ à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾ à¤¡à¥‡à¤Ÿà¤¾ à¤ªà¤° à¤†à¤§à¤¾à¤°à¤¿à¤¤ AI-à¤œà¤¨à¤°à¥‡à¤Ÿà¥‡à¤¡ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆà¥¤ à¤µà¥à¤¯à¤¾à¤ªà¤¾à¤° à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤²à¥‡à¤¨à¥‡ à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤•à¥‹ à¤†à¤§à¤¿à¤•à¤¾à¤°à¤¿à¤• à¤¸à¥à¤°à¥‹à¤¤à¥‹à¤‚ à¤¸à¥‡ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¨à¤¾ à¤šà¤¾à¤¹à¤¿à¤à¥¤ ReguLens à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¡à¥‡à¤Ÿà¤¾ à¤•à¥€ à¤ªà¥‚à¤°à¥à¤£à¤¤à¤¾ à¤¯à¤¾ à¤¸à¤Ÿà¥€à¤•à¤¤à¤¾ à¤•à¥€ à¤—à¤¾à¤°à¤‚à¤Ÿà¥€ à¤¨à¤¹à¥€à¤‚ à¤¦à¥‡à¤¤à¤¾à¥¤",
      "rpt.page": "à¤ªà¥ƒà¤·à¥à¤ ",
      "rpt.of": "à¤•à¤¾",
      "disclaimer.dashboard": "ReguLens à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾ à¤”à¤° à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤ªà¥à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ; à¤…à¤‚à¤¤à¤¿à¤® à¤•à¤¾à¤¨à¥‚à¤¨à¥€/à¤…à¤¨à¥à¤ªà¤¾à¤²à¤¨ à¤¨à¤¿à¤°à¥à¤£à¤¯à¥‹à¤‚ à¤•à¥‹ à¤¯à¥‹à¤—à¥à¤¯ à¤ªà¥‡à¤¶à¥‡à¤µà¤°à¥‹à¤‚ à¤¯à¤¾ à¤…à¤§à¤¿à¤•à¥ƒà¤¤ à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¸à¥à¤°à¥‹à¤¤à¥‹à¤‚ à¤¸à¥‡ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¨à¤¾ à¤šà¤¾à¤¹à¤¿à¤à¥¤",
      "ai.agents": "à¤à¤œà¥‡à¤‚à¤Ÿ",
      "ai.completed": "à¤ªà¥‚à¤°à¥à¤£",
      "ai.failed": "à¤µà¤¿à¤«à¤²",
      "ai.totalTime": "à¤•à¥à¤² à¤¸à¤®à¤¯",
      "ai.pending": "à¤²à¤‚à¤¬à¤¿à¤¤",
      "ai.running": "à¤šà¤² à¤°à¤¹à¤¾ à¤¹à¥ˆ",
      "ai.completedStatus": "à¤ªà¥‚à¤°à¥à¤£",
      "ai.failedStatus": "à¤µà¤¿à¤«à¤²",
      "ai.input": "à¤‡à¤¨à¤ªà¥à¤Ÿ",
      "ai.output": "à¤†à¤‰à¤Ÿà¤ªà¥à¤Ÿ",
      "ai.sources": "à¤¸à¥à¤°à¥‹à¤¤",
      "ai.retry": "à¤ªà¥à¤¨à¤°à¥à¤ªà¥à¤°à¤¯à¤¾à¤¸",
      "ai.emptyTitle": "à¤•à¥‹à¤ˆ à¤à¤œà¥‡à¤‚à¤Ÿ à¤—à¤¤à¤¿à¤µà¤¿à¤§à¤¿ à¤¨à¤¹à¥€à¤‚",
      "ai.emptyDesc": "à¤®à¤²à¥à¤Ÿà¥€-à¤à¤œà¥‡à¤‚à¤Ÿ à¤‡à¤‚à¤Ÿà¥‡à¤²à¤¿à¤œà¥‡à¤‚à¤¸ à¤ªà¤¾à¤‡à¤ªà¤²à¤¾à¤‡à¤¨ à¤•à¥‹ à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ <strong>à¤•à¥à¤¯à¤¾ à¤®à¥ˆà¤‚ à¤²à¥‰à¤¨à¥à¤š à¤•à¤° à¤¸à¤•à¤¤à¤¾ à¤¹à¥‚à¤?</strong> à¤ªà¥ƒà¤·à¥à¤  à¤¸à¥‡ à¤à¤• à¤²à¥‰à¤¨à¥à¤š à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤šà¤²à¤¾à¤à¤à¥¤",
      "ai.startAnalysis": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚",
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
      "settings.checking": "ÃœberprÃ¼fungâ€¦",
      "settings.aiConnected": "Verbunden Â· {model}",
      "settings.aiDisconnected": "Konfiguriert, aber nicht erreichbar",
      "settings.aiNotConfigured": "KI-Engine nicht konfiguriert",
      "settings.aiConnError": "KI-Engine konnte nicht erreicht werden",
      "settings.aiRetryHint": "ÃœberprÃ¼fen Sie Ihre Konfiguration und versuchen Sie es erneut",
      "settings.retry": "Erneut versuchen",
      "settings.clearMemory": "Speicher lÃ¶schen",
      "settings.memoryAlreadyEmpty": "Nichts zu lÃ¶schen â€“ keine gespeicherten Konversationen.",
      "settings.memoryCleared": "Konversationsspeicher gelÃ¶scht.",
      "settings.memoryClearError": "Speicher konnte nicht gelÃ¶scht werden. Bitte versuchen Sie es erneut.",
      "profile.title": "Profil",
      "profile.guest": "Gast",
      "confirm.title": "Konversationsspeicher lÃ¶schen?",
      "confirm.text": "Dies lÃ¶scht dauerhaft alle Ihre Konversationen von diesem GerÃ¤t und Konto. Dies kann nicht rÃ¼ckgÃ¤ngig gemacht werden.",
      "confirm.cancel": "Abbrechen",
      "confirm.clear": "Speicher lÃ¶schen",
      "auth.close": "SchlieÃŸen",
      "auth.welcomeBack": "Willkommen zurÃ¼ck",
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
      "auth.signingIn": "Anmeldung lÃ¤uftâ€¦",
      "auth.signingUp": "Konto wird erstelltâ€¦",
      "auth.creatingAccount": "Konto wird erstelltâ€¦",
      "auth.requiredError": "Bitte fÃ¼llen Sie alle Felder aus.",
      "auth.sendReset": "Link zum ZurÃ¼cksetzen senden",
      "auth.backToSignIn": "ZurÃ¼ck zur Anmeldung",
      "auth.resetSent": "E-Mail zum ZurÃ¼cksetzen des Passworts gesendet.",
      "auth.signedIn": "Angemeldet als {email}",
      "auth.signedOut": "Abgemeldet",
      "auth.guestSignedIn": "Fortfahren als Gast",
      "auth.welcome": "Willkommen, {name}",
      "auth.error.invalidEmail": "Bitte geben Sie eine gÃ¼ltige E-Mail-Adresse ein.",
      "auth.error.weakPassword": "Das Passwort muss mindestens 6 Zeichen lang sein.",
      "auth.error.userNotFound": "Kein Konto mit dieser E-Mail gefunden.",
      "auth.error.invalidCredential": "Falsche E-Mail oder Passwort.",
      "auth.error.emailInUse": "Ein Konto mit dieser E-Mail existiert bereits.",
      "auth.error.network": "Netzwerkfehler. Bitte Ã¼berprÃ¼fen Sie Ihre Verbindung.",
      "auth.error.popupClosed": "Anmeldefenster wurde geschlossen.",
      "auth.error.popupBlocked": "Pop-up blockiert. Erlauben Sie Pop-ups zur Anmeldung.",
      "auth.error.operationNotAllowed": "Diese Anmeldemethode ist nicht aktiviert.",
      "auth.error.guestNotEnabled": "Gastanmeldung ist nicht aktiviert.",
      "auth.error.tooManyRequests": "Zu viele Versuche. Bitte versuchen Sie es spÃ¤ter erneut.",
      "auth.error.userDisabled": "Dieses Konto wurde deaktiviert.",
      "auth.error.configError": "Die Authentifizierung ist nicht korrekt konfiguriert.",
      "auth.error.generic": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      "auth.error.notConfigured": "ReguLens ist noch nicht fÃ¼r die Authentifizierung konfiguriert.",
      "notif.title": "Benachrichtigungen",
      "notif.markAll": "Alle als gelesen markieren",
      "notif.empty": "Alles erledigt",
      "doc.download": "Herunterladen",
      "doc.close": "SchlieÃŸen",
      "doc.previewNone": "Keine Vorschau fÃ¼r diesen Dateityp verfÃ¼gbar.",
      "doc.uploaded": "â€ž{name}â€œ in die Dokumentenbibliothek hochgeladen",
      "doc.uploadedCount": "{n} Dokumente in der Bibliothek",
      "req.priority": "PrioritÃ¤t",
      "req.status": "Status",
      "req.reopen": "Wieder Ã¶ffnen",
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
      "sim.running": "Simulation lÃ¤uftâ€¦",
      "sim.done": "Fertig",
      "sim.reqs": "HinzugefÃ¼gte Anforderungen",
      "sim.cost": "GeschÃ¤tzte Kostenwirkung",
      "sim.days": "Zeitplanwirkung",
      "call.title": "RÃ¼ckruf vereinbaren",
      "call.sub": "Teilen Sie uns mit, wie wir Sie erreichen kÃ¶nnen, und unser Compliance-Experte bestÃ¤tigt einen Termin.",
      "call.email": "Ihre E-Mail",
      "call.time": "Bevorzugte Zeit",
      "call.invalid": "Bitte geben Sie eine gÃ¼ltige E-Mail ein",
      "call.sent": "Anfrage gesendet! Unser Experte wird sich in KÃ¼rze bei Ihnen melden.",
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
      "rpt.complianceGaps": "Compliance-LÃ¼cken",
      "rpt.riskAssessment": "Risikobewertung",
      "rpt.businessImpact": "GeschÃ¤ftsauswirkung",
      "rpt.estimatedCost": "GeschÃ¤tzte Kosten",
      "rpt.estimatedTimeline": "GeschÃ¤tzter Zeitplan",
      "rpt.actionPlan": "Empfohlener Aktionsplan",
      "rpt.readinessScore": "Marktbereitschaftswert",
      "rpt.launchRecommendation": "Startempfehlung",
      "rpt.regulatorySources": "Regulatorische Quellen",
      "rpt.timestamp": "Analysezeitstempel",
      "rpt.noData": "Keine Analysedaten verfÃ¼gbar. FÃ¼hren Sie zuerst eine Launch-Analyse durch.",
      "rpt.generating": "Bericht wird erstellt...",
      "rpt.failed": "Berichtserstellung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      "rpt.retry": "Erneut versuchen",
      "rpt.download": "Bericht herunterladen",
      "rpt.print": "Drucken / Als PDF speichern",
      "rpt.close": "SchlieÃŸen",
      "rpt.company": "Unternehmen",
      "rpt.product": "Produkt",
      "rpt.origin": "Herkunftsland",
      "rpt.target": "Zielmarkt",
      "rpt.industry": "Branche",
      "rpt.priority": "PrioritÃ¤t",
      "rpt.status": "Status",
      "rpt.authority": "BehÃ¶rde",
      "rpt.dueDate": "FÃ¤lligkeitsdatum",
      "rpt.description": "Beschreibung",
      "rpt.totalCost": "GeschÃ¤tzte Gesamtkosten",
      "rpt.totalTime": "GeschÃ¤tzte Gesamtzeit",
      "rpt.riskLevel": "Risikostufe",
      "rpt.gaps": "Offene LÃ¼cken",
      "rpt.critical": "Kritisch",
      "rpt.important": "Wichtig",
      "rpt.standard": "Standard",
      "rpt.pending": "Ausstehend",
      "rpt.inProgress": "In Bearbeitung",
      "rpt.done": "Abgeschlossen",
      "rpt.notApplicable": "Nicht zutreffend",
      "rpt.action": "Aktion",
      "rpt.estimatedDays": "GeschÃ¤tzte Tage",
      "rpt.estimatedEur": "GeschÃ¤tzte Kosten (EUR)",
      "rpt.owner": "Verantwortliche Partei",
      "rpt.category": "Kategorie",
      "rpt.source": "Quelle",
      "rpt.code": "Referenzcode",
      "rpt.date": "Datum",
      "rpt.kind": "Typ",
      "rpt.summary": "Zusammenfassung",
      "rpt.proceed": "Launch fortsetzen",
      "rpt.conditional": "Bedingter Launch",
      "rpt.delay": "Launch verzÃ¶gern",
      "rpt.prerequisites": "Voraussetzungen",
      "rpt.verdict": "Urteil",
      "rpt.timeline": "Zeitplan bis zur vollstÃ¤ndigen Bereitschaft",
      "rpt.disclaimer": "Dieser Bericht enthÃ¤lt eine KI-generierte Analyse auf Basis von regulatorischen Intelligenzdaten. Regulatorische Informationen sollten vor GeschÃ¤ftsentscheidungen mit offiziellen Quellen Ã¼berprÃ¼ft werden. ReguLens garantiert nicht die VollstÃ¤ndigkeit oder Richtigkeit regulatorischer Daten.",
      "rpt.page": "Seite",
      "rpt.of": "von",
      "disclaimer.dashboard": "ReguLens bietet regulatorische Intelligenz und EntscheidungsunterstÃ¼tzung; endgÃ¼ltige rechtliche/compliance Entscheidungen sollten mit qualifizierten Fachleuten oder maÃŸgeblichen regulatorischen Quellen Ã¼berprÃ¼ft werden.",
      "ai.agents": "Agenten",
      "ai.completed": "Abgeschlossen",
      "ai.failed": "Fehlgeschlagen",
      "ai.totalTime": "Gesamtzeit",
      "ai.pending": "Ausstehend",
      "ai.running": "LÃ¤uft",
      "ai.completedStatus": "Abgeschlossen",
      "ai.failedStatus": "Fehlgeschlagen",
      "ai.input": "Eingabe",
      "ai.output": "Ausgabe",
      "ai.sources": "Quellen",
      "ai.retry": "Erneut versuchen",
      "ai.emptyTitle": "Keine AgentenaktivitÃ¤t",
      "ai.emptyDesc": "FÃ¼hren Sie eine Launch-Analyse von der Seite <strong>Kann ich starten?</strong> aus, um die Multi-Agent-Intelligenz-Pipeline zu aktivieren.",
      "ai.startAnalysis": "Analyse starten",
    },
    pt: {
      "nav.dashboard": "Painel",
      "settings.title": "ConfiguraÃ§Ãµes",
      "settings.general": "Geral",
      "settings.language": "Idioma",
      "settings.density": "Densidade",
      "settings.theme": "Tema",
      "settings.theme.light": "Claro",
      "settings.theme.dark": "Escuro",
      "settings.account": "Conta",
      "settings.signedInAs": "Conectado como",
      "settings.notSignedIn": "NÃ£o conectado",
      "settings.signIn": "Entrar",
      "settings.signOut": "Sair",
      "settings.aiEngine": "Motor de IA",
      "settings.checking": "Verificandoâ€¦",
      "settings.aiConnected": "Conectado Â· {model}",
      "settings.aiDisconnected": "Configurado mas inacessÃ­vel",
      "settings.aiNotConfigured": "Motor de IA nÃ£o configurado",
      "settings.aiConnError": "NÃ£o foi possÃ­vel acessar o motor de IA",
      "settings.aiRetryHint": "Verifique sua configuraÃ§Ã£o e tente novamente",
      "settings.retry": "Tentar novamente",
      "settings.clearMemory": "Limpar memÃ³ria",
      "settings.memoryAlreadyEmpty": "Nada para limpar â€” nenhuma conversa salva.",
      "settings.memoryCleared": "MemÃ³ria de conversas limpa.",
      "settings.memoryClearError": "NÃ£o foi possÃ­vel limpar a memÃ³ria. Por favor, tente novamente.",
      "profile.title": "Perfil",
      "profile.guest": "Convidado",
      "confirm.title": "Limpar memÃ³ria de conversas?",
      "confirm.text": "Isso exclui permanentemente todas as suas conversas deste dispositivo e conta. Esta aÃ§Ã£o nÃ£o pode ser desfeita.",
      "confirm.cancel": "Cancelar",
      "confirm.clear": "Limpar memÃ³ria",
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
      "auth.noAccount": "NÃ£o tem uma conta?",
      "auth.haveAccount": "JÃ¡ tem uma conta?",
      "auth.or": "OU",
      "auth.continueGuest": "Continuar como Convidado",
      "auth.signingIn": "Entrandoâ€¦",
      "auth.signingUp": "Criando contaâ€¦",
      "auth.creatingAccount": "Criando contaâ€¦",
      "auth.requiredError": "Por favor, preencha todos os campos.",
      "auth.sendReset": "Enviar link de redefiniÃ§Ã£o",
      "auth.backToSignIn": "Voltar ao login",
      "auth.resetSent": "E-mail de redefiniÃ§Ã£o de senha enviado.",
      "auth.signedIn": "Conectado como {email}",
      "auth.signedOut": "Desconectado",
      "auth.guestSignedIn": "Continuando como Convidado",
      "auth.welcome": "Bem-vindo, {name}",
      "auth.error.invalidEmail": "Por favor, insira um endereÃ§o de e-mail vÃ¡lido.",
      "auth.error.weakPassword": "A senha deve ter pelo menos 6 caracteres.",
      "auth.error.userNotFound": "Nenhuma conta encontrada com este e-mail.",
      "auth.error.invalidCredential": "E-mail ou senha incorretos.",
      "auth.error.emailInUse": "JÃ¡ existe uma conta com este e-mail.",
      "auth.error.network": "Erro de rede. Por favor, verifique sua conexÃ£o.",
      "auth.error.popupClosed": "A janela de login foi fechada.",
      "auth.error.popupBlocked": "Pop-up bloqueado. Permita pop-ups para fazer login.",
      "auth.error.operationNotAllowed": "Este mÃ©todo de login nÃ£o estÃ¡ habilitado.",
      "auth.error.guestNotEnabled": "Login como convidado nÃ£o estÃ¡ habilitado.",
      "auth.error.tooManyRequests": "Muitas tentativas. Por favor, tente novamente mais tarde.",
      "auth.error.userDisabled": "Esta conta foi desativada.",
      "auth.error.configError": "A autenticaÃ§Ã£o nÃ£o estÃ¡ configurada corretamente.",
      "auth.error.generic": "Algo deu errado. Por favor, tente novamente.",
      "auth.error.notConfigured": "ReguLens ainda nÃ£o estÃ¡ configurado para autenticaÃ§Ã£o.",
      "notif.title": "NotificaÃ§Ãµes",
      "notif.markAll": "Marcar tudo como lido",
      "notif.empty": "Tudo em dia",
      "doc.download": "Baixar",
      "doc.close": "Fechar",
      "doc.previewNone": "Nenhuma visualizaÃ§Ã£o disponÃ­vel para este tipo de arquivo.",
      "doc.uploaded": "â€ž{name}â€œ enviado para a Biblioteca de Documentos",
      "doc.uploadedCount": "{n} documentos na biblioteca",
      "req.priority": "Prioridade",
      "req.status": "Status",
      "req.reopen": "Reabrir",
      "req.inProgress": "Marcar Em Andamento",
      "req.complete": "Marcar ConcluÃ­do",
      "req.done": "ConcluÃ­do",
      "req.pending": "Pendente",
      "req.progress": "Em Andamento",
      "req.critical": "CrÃ­tico",
      "req.important": "Importante",
      "req.standard": "PadrÃ£o",
      "req.count": "{n} exibidos",
      "sim.results": "Resultados da SimulaÃ§Ã£o",
      "sim.running": "Executando simulaÃ§Ã£oâ€¦",
      "sim.done": "ConcluÃ­do",
      "sim.reqs": "Requisitos adicionados",
      "sim.cost": "Impacto estimado nos custos",
      "sim.days": "Impacto no cronograma",
      "call.title": "Agendar uma ligaÃ§Ã£o",
      "call.sub": "Informe como podemos entrar em contato e nosso especialista em conformidade confirmarÃ¡ um horÃ¡rio.",
      "call.email": "Seu e-mail",
      "call.time": "HorÃ¡rio preferido",
      "call.invalid": "Por favor, insira um e-mail vÃ¡lido",
      "call.sent": "SolicitaÃ§Ã£o enviada! Nosso especialista entrarÃ¡ em contato em breve.",
      "rpt.title": "RelatÃ³rio de ProntidÃ£o de Mercado e Conformidade RegulatÃ³ria",
      "rpt.generated": "Gerado por ReguLens",
      "rpt.aiGenerated": "AnÃ¡lise Gerada por IA",
      "rpt.regulatorySource": "Fonte RegulatÃ³ria",
      "rpt.userInput": "InformaÃ§Ãµes Fornecidas pelo UsuÃ¡rio",
      "rpt.executiveSummary": "Resumo Executivo",
      "rpt.companyProfile": "Perfil da Empresa",
      "rpt.productProfile": "Perfil do Produto",
      "rpt.sourceMarket": "Mercado de Origem",
      "rpt.targetMarket": "Mercado Alvo",
      "rpt.applicableRegulations": "RegulamentaÃ§Ãµes AplicÃ¡veis",
      "rpt.complianceRequirements": "Requisitos de Conformidade",
      "rpt.completedReqs": "Requisitos ConcluÃ­dos",
      "rpt.pendingReqs": "Requisitos Pendentes",
      "rpt.complianceGaps": "Lacunas de Conformidade",
      "rpt.riskAssessment": "AvaliaÃ§Ã£o de Risco",
      "rpt.businessImpact": "Impacto nos NegÃ³cios",
      "rpt.estimatedCost": "Custo Estimado",
      "rpt.estimatedTimeline": "Cronograma Estimado",
      "rpt.actionPlan": "Plano de AÃ§Ã£o Recomendado",
      "rpt.readinessScore": "PontuaÃ§Ã£o de ProntidÃ£o",
      "rpt.launchRecommendation": "RecomendaÃ§Ã£o de LanÃ§amento",
      "rpt.regulatorySources": "Fontes RegulatÃ³rias",
      "rpt.timestamp": "Carimbo de Data/Hora da AnÃ¡lise",
      "rpt.noData": "Nenhum dado de anÃ¡lise disponÃ­vel. Execute uma anÃ¡lise de lanÃ§amento primeiro.",
      "rpt.generating": "Gerando relatÃ³rio...",
      "rpt.failed": "Falha na geraÃ§Ã£o do relatÃ³rio. Por favor, tente novamente.",
      "rpt.retry": "Tentar novamente",
      "rpt.download": "Baixar RelatÃ³rio",
      "rpt.print": "Imprimir / Salvar como PDF",
      "rpt.close": "Fechar",
      "rpt.company": "Empresa",
      "rpt.product": "Produto",
      "rpt.origin": "PaÃ­s de Origem",
      "rpt.target": "Mercado Alvo",
      "rpt.industry": "IndÃºstria",
      "rpt.priority": "Prioridade",
      "rpt.status": "Status",
      "rpt.authority": "Autoridade",
      "rpt.dueDate": "Data de Vencimento",
      "rpt.description": "DescriÃ§Ã£o",
      "rpt.totalCost": "Custo Total Estimado",
      "rpt.totalTime": "Tempo Total Estimado",
      "rpt.riskLevel": "NÃ­vel de Risco",
      "rpt.gaps": "Lacunas Abertas",
      "rpt.critical": "CrÃ­tico",
      "rpt.important": "Importante",
      "rpt.standard": "PadrÃ£o",
      "rpt.pending": "Pendente",
      "rpt.inProgress": "Em Andamento",
      "rpt.done": "ConcluÃ­do",
      "rpt.notApplicable": "NÃ£o AplicÃ¡vel",
      "rpt.action": "AÃ§Ã£o",
      "rpt.estimatedDays": "Dias Estimados",
      "rpt.estimatedEur": "Custo Estimado (EUR)",
      "rpt.owner": "Parte ResponsÃ¡vel",
      "rpt.category": "Categoria",
      "rpt.source": "Fonte",
      "rpt.code": "CÃ³digo de ReferÃªncia",
      "rpt.date": "Data",
      "rpt.kind": "Tipo",
      "rpt.summary": "Resumo",
      "rpt.proceed": "Prosseguir com o LanÃ§amento",
      "rpt.conditional": "LanÃ§amento Condicional",
      "rpt.delay": "Atrasar LanÃ§amento",
      "rpt.prerequisites": "PrÃ©-requisitos",
      "rpt.verdict": "Veredicto",
      "rpt.timeline": "Cronograma atÃ© a ProntidÃ£o Total",
      "rpt.disclaimer": "Este relatÃ³rio contÃ©m uma anÃ¡lise gerada por IA baseada em dados de inteligÃªncia regulatÃ³ria. As informaÃ§Ãµes regulatÃ³rias devem ser verificadas com fontes oficiais antes de tomar decisÃµes de negÃ³cios. ReguLens nÃ£o garante a completude ou precisÃ£o dos dados regulatÃ³rios.",
      "rpt.page": "PÃ¡gina",
      "rpt.of": "de",
      "disclaimer.dashboard": "ReguLens fornece inteligÃªncia regulatÃ³ria e suporte Ã  decisÃ£o; decisÃµes legais/de conformidade finais devem ser verificadas com profissionais qualificados ou fontes regulatÃ³rias autoritativas.",
      "ai.agents": "Agentes",
      "ai.completed": "ConcluÃ­dos",
      "ai.failed": "Falharam",
      "ai.totalTime": "Tempo Total",
      "ai.pending": "Pendentes",
      "ai.running": "Executando",
      "ai.completedStatus": "ConcluÃ­do",
      "ai.failedStatus": "Falhou",
      "ai.input": "Entrada",
      "ai.output": "SaÃ­da",
      "ai.sources": "Fontes",
      "ai.retry": "Tentar novamente",
      "ai.emptyTitle": "Nenhuma Atividade de Agente",
      "ai.emptyDesc": "Execute uma anÃ¡lise de lanÃ§amento na pÃ¡gina <strong>Posso LanÃ§ar?</strong> para ativar o pipeline de inteligÃªncia multi-agente.",
      "ai.startAnalysis": "Iniciar AnÃ¡lise",
    },
    ru: {
      "nav.dashboard": "ÐŸÐ°Ð½ÐµÐ»ÑŒ ÑƒÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ñ",
      "settings.title": "ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸",
      "settings.general": "ÐžÐ±Ñ‰Ð¸Ðµ",
      "settings.language": "Ð¯Ð·Ñ‹Ðº",
      "settings.density": "ÐŸÐ»Ð¾Ñ‚Ð½Ð¾ÑÑ‚ÑŒ",
      "settings.theme": "Ð¢ÐµÐ¼Ð°",
      "settings.theme.light": "Ð¡Ð²ÐµÑ‚Ð»Ð°Ñ",
      "settings.theme.dark": "Ð¢Ñ‘Ð¼Ð½Ð°Ñ",
      "settings.account": "Ð£Ñ‡Ñ‘Ñ‚Ð½Ð°Ñ Ð·Ð°Ð¿Ð¸ÑÑŒ",
      "settings.signedInAs": "Ð’Ñ‹ Ð²Ð¾ÑˆÐ»Ð¸ ÐºÐ°Ðº",
      "settings.notSignedIn": "ÐÐµ Ð²Ð¾ÑˆÐ»Ð¸",
      "settings.signIn": "Ð’Ð¾Ð¹Ñ‚Ð¸",
      "settings.signOut": "Ð’Ñ‹Ð¹Ñ‚Ð¸",
      "settings.aiEngine": "Ð˜Ð˜-Ð´Ð²Ð¸Ð¶Ð¾Ðº",
      "settings.checking": "ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ°â€¦",
      "settings.aiConnected": "ÐŸÐ¾Ð´ÐºÐ»ÑŽÑ‡Ñ‘Ð½ Â· {model}",
      "settings.aiDisconnected": "ÐÐ°ÑÑ‚Ñ€Ð¾ÐµÐ½, Ð½Ð¾ Ð½ÐµÐ´Ð¾ÑÑ‚ÑƒÐ¿ÐµÐ½",
      "settings.aiNotConfigured": "Ð˜Ð˜-Ð´Ð²Ð¸Ð¶Ð¾Ðº Ð½Ðµ Ð½Ð°ÑÑ‚Ñ€Ð¾ÐµÐ½",
      "settings.aiConnError": "ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð¿Ð¾Ð´ÐºÐ»ÑŽÑ‡Ð¸Ñ‚ÑŒÑÑ Ðº Ð˜Ð˜-Ð´Ð²Ð¸Ð¶ÐºÑƒ",
      "settings.aiRetryHint": "ÐŸÑ€Ð¾Ð²ÐµÑ€ÑŒÑ‚Ðµ Ð½Ð°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸ Ð¸ Ð¿Ð¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð°",
      "settings.retry": "ÐŸÐ¾Ð²Ñ‚Ð¾Ñ€Ð¸Ñ‚ÑŒ",
      "settings.clearMemory": "ÐžÑ‡Ð¸ÑÑ‚Ð¸Ñ‚ÑŒ Ð¿Ð°Ð¼ÑÑ‚ÑŒ",
      "settings.memoryAlreadyEmpty": "ÐÐµÑ‡ÐµÐ³Ð¾ Ð¾Ñ‡Ð¸Ñ‰Ð°Ñ‚ÑŒ â€” Ð½ÐµÑ‚ ÑÐ¾Ñ…Ñ€Ð°Ð½Ñ‘Ð½Ð½Ñ‹Ñ… Ñ€Ð°Ð·Ð³Ð¾Ð²Ð¾Ñ€Ð¾Ð².",
      "settings.memoryCleared": "ÐŸÐ°Ð¼ÑÑ‚ÑŒ Ñ€Ð°Ð·Ð³Ð¾Ð²Ð¾Ñ€Ð¾Ð² Ð¾Ñ‡Ð¸Ñ‰ÐµÐ½Ð°.",
      "settings.memoryClearError": "ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð¾Ñ‡Ð¸ÑÑ‚Ð¸Ñ‚ÑŒ Ð¿Ð°Ð¼ÑÑ‚ÑŒ. ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð¿Ð¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð°.",
      "profile.title": "ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ",
      "profile.guest": "Ð“Ð¾ÑÑ‚ÑŒ",
      "confirm.title": "ÐžÑ‡Ð¸ÑÑ‚Ð¸Ñ‚ÑŒ Ð¿Ð°Ð¼ÑÑ‚ÑŒ Ñ€Ð°Ð·Ð³Ð¾Ð²Ð¾Ñ€Ð¾Ð²?",
      "confirm.text": "Ð­Ñ‚Ð¾ Ð½Ð°Ð²ÑÐµÐ³Ð´Ð° ÑƒÐ´Ð°Ð»Ð¸Ñ‚ Ð²ÑÐµ Ð²Ð°ÑˆÐ¸ Ñ€Ð°Ð·Ð³Ð¾Ð²Ð¾Ñ€Ñ‹ Ñ ÑÑ‚Ð¾Ð³Ð¾ ÑƒÑÑ‚Ñ€Ð¾Ð¹ÑÑ‚Ð²Ð° Ð¸ ÑƒÑ‡Ñ‘Ñ‚Ð½Ð¾Ð¹ Ð·Ð°Ð¿Ð¸ÑÐ¸. Ð­Ñ‚Ð¾ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ðµ Ð½ÐµÐ»ÑŒÐ·Ñ Ð¾Ñ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ.",
      "confirm.cancel": "ÐžÑ‚Ð¼ÐµÐ½Ð°",
      "confirm.clear": "ÐžÑ‡Ð¸ÑÑ‚Ð¸Ñ‚ÑŒ Ð¿Ð°Ð¼ÑÑ‚ÑŒ",
      "auth.close": "Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ",
      "auth.welcomeBack": "Ð¡ Ð²Ð¾Ð·Ð²Ñ€Ð°Ñ‰ÐµÐ½Ð¸ÐµÐ¼",
      "auth.loginSub": "Ð’Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð¸Ñ‚ÑŒ",
      "auth.createAccount": "Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚",
      "auth.createAccountSub": "ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹Ñ‚Ðµ ÑÐ²Ð¾Ð¹ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚ ReguLens",
      "auth.login": "Ð’Ð¾Ð¹Ñ‚Ð¸",
      "auth.signup": "Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚",
      "auth.name": "Ð˜Ð¼Ñ",
      "auth.email": "Ð­Ð»ÐµÐºÑ‚Ñ€Ð¾Ð½Ð½Ð°Ñ Ð¿Ð¾Ñ‡Ñ‚Ð°",
      "auth.password": "ÐŸÐ°Ñ€Ð¾Ð»ÑŒ",
      "auth.forgotPassword": "Ð—Ð°Ð±Ñ‹Ð»Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ?",
      "auth.noAccount": "ÐÐµÑ‚ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð°?",
      "auth.haveAccount": "Ð£Ð¶Ðµ ÐµÑÑ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚?",
      "auth.or": "Ð˜Ð›Ð˜",
      "auth.continueGuest": "ÐŸÑ€Ð¾Ð´Ð¾Ð»Ð¶Ð¸Ñ‚ÑŒ ÐºÐ°Ðº Ð³Ð¾ÑÑ‚ÑŒ",
      "auth.signingIn": "Ð’Ñ…Ð¾Ð´â€¦",
      "auth.signingUp": "Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð°â€¦",
      "auth.creatingAccount": "Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð°â€¦",
      "auth.requiredError": "ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð·Ð°Ð¿Ð¾Ð»Ð½Ð¸Ñ‚Ðµ Ð²ÑÐµ Ð¿Ð¾Ð»Ñ.",
      "auth.sendReset": "ÐžÑ‚Ð¿Ñ€Ð°Ð²Ð¸Ñ‚ÑŒ ÑÑÑ‹Ð»ÐºÑƒ Ð´Ð»Ñ ÑÐ±Ñ€Ð¾ÑÐ°",
      "auth.backToSignIn": "Ð’ÐµÑ€Ð½ÑƒÑ‚ÑŒÑÑ Ðº Ð²Ñ…Ð¾Ð´Ñƒ",
      "auth.resetSent": "ÐŸÐ¸ÑÑŒÐ¼Ð¾ Ð´Ð»Ñ ÑÐ±Ñ€Ð¾ÑÐ° Ð¿Ð°Ñ€Ð¾Ð»Ñ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¾.",
      "auth.signedIn": "Ð’Ñ‹ Ð²Ð¾ÑˆÐ»Ð¸ ÐºÐ°Ðº {email}",
      "auth.signedOut": "Ð’Ñ‹ Ð²Ñ‹ÑˆÐ»Ð¸",
      "auth.guestSignedIn": "ÐŸÑ€Ð¾Ð´Ð¾Ð»Ð¶Ð°ÐµÐ¼ ÐºÐ°Ðº Ð³Ð¾ÑÑ‚ÑŒ",
      "auth.welcome": "Ð”Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ, {name}",
      "auth.error.invalidEmail": "ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð²Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ð¹ Ð°Ð´Ñ€ÐµÑ ÑÐ»ÐµÐºÑ‚Ñ€Ð¾Ð½Ð½Ð¾Ð¹ Ð¿Ð¾Ñ‡Ñ‚Ñ‹.",
      "auth.error.weakPassword": "ÐŸÐ°Ñ€Ð¾Ð»ÑŒ Ð´Ð¾Ð»Ð¶ÐµÐ½ ÑÐ¾Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð½Ðµ Ð¼ÐµÐ½ÐµÐµ 6 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².",
      "auth.error.userNotFound": "ÐÐºÐºÐ°ÑƒÐ½Ñ‚ Ñ Ñ‚Ð°ÐºÐ¸Ð¼ Ð°Ð´Ñ€ÐµÑÐ¾Ð¼ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½.",
      "auth.error.invalidCredential": "ÐÐµÐ²ÐµÑ€Ð½Ñ‹Ð¹ Ð°Ð´Ñ€ÐµÑ Ð¸Ð»Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.",
      "auth.error.emailInUse": "ÐÐºÐºÐ°ÑƒÐ½Ñ‚ Ñ Ñ‚Ð°ÐºÐ¸Ð¼ Ð°Ð´Ñ€ÐµÑÐ¾Ð¼ ÑƒÐ¶Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚.",
      "auth.error.network": "ÐžÑˆÐ¸Ð±ÐºÐ° ÑÐµÑ‚Ð¸. ÐŸÑ€Ð¾Ð²ÐµÑ€ÑŒÑ‚Ðµ Ð¿Ð¾Ð´ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ.",
      "auth.error.popupClosed": "ÐžÐºÐ½Ð¾ Ð²Ñ…Ð¾Ð´Ð° Ð±Ñ‹Ð»Ð¾ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¾.",
      "auth.error.popupBlocked": "Ð’ÑÐ¿Ð»Ñ‹Ð²Ð°ÑŽÑ‰ÐµÐµ Ð¾ÐºÐ½Ð¾ Ð·Ð°Ð±Ð»Ð¾ÐºÐ¸Ñ€Ð¾Ð²Ð°Ð½Ð¾. Ð Ð°Ð·Ñ€ÐµÑˆÐ¸Ñ‚Ðµ Ð²ÑÐ¿Ð»Ñ‹Ð²Ð°ÑŽÑ‰Ð¸Ðµ Ð¾ÐºÐ½Ð° Ð´Ð»Ñ Ð²Ñ…Ð¾Ð´Ð°.",
      "auth.error.operationNotAllowed": "Ð­Ñ‚Ð¾Ñ‚ Ð¼ÐµÑ‚Ð¾Ð´ Ð²Ñ…Ð¾Ð´Ð° Ð½Ðµ Ð²ÐºÐ»ÑŽÑ‡Ñ‘Ð½.",
      "auth.error.guestNotEnabled": "Ð“Ð¾ÑÑ‚ÐµÐ²Ð¾Ð¹ Ð²Ñ…Ð¾Ð´ Ð½Ðµ Ð²ÐºÐ»ÑŽÑ‡Ñ‘Ð½.",
      "auth.error.tooManyRequests": "Ð¡Ð»Ð¸ÑˆÐºÐ¾Ð¼ Ð¼Ð½Ð¾Ð³Ð¾ Ð¿Ð¾Ð¿Ñ‹Ñ‚Ð¾Ðº. ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð¿Ð¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ Ð¿Ð¾Ð·Ð¶Ðµ.",
      "auth.error.userDisabled": "Ð­Ñ‚Ð° ÑƒÑ‡Ñ‘Ñ‚Ð½Ð°Ñ Ð·Ð°Ð¿Ð¸ÑÑŒ Ð±Ñ‹Ð»Ð° Ð¾Ñ‚ÐºÐ»ÑŽÑ‡ÐµÐ½Ð°.",
      "auth.error.configError": "ÐÑƒÑ‚ÐµÐ½Ñ‚Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸Ñ Ð½Ð°ÑÑ‚Ñ€Ð¾ÐµÐ½Ð° Ð½ÐµÐ¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾.",
      "auth.error.generic": "Ð§Ñ‚Ð¾-Ñ‚Ð¾ Ð¿Ð¾ÑˆÐ»Ð¾ Ð½Ðµ Ñ‚Ð°Ðº. ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð¿Ð¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð°.",
      "auth.error.notConfigured": "ReguLens ÐµÑ‰Ñ‘ Ð½Ðµ Ð½Ð°ÑÑ‚Ñ€Ð¾ÐµÐ½ Ð´Ð»Ñ Ð°ÑƒÑ‚ÐµÐ½Ñ‚Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸Ð¸.",
      "notif.title": "Ð£Ð²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ñ",
      "notif.markAll": "ÐžÑ‚Ð¼ÐµÑ‚Ð¸Ñ‚ÑŒ Ð²ÑÐµ ÐºÐ°Ðº Ð¿Ñ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ð½Ð½Ñ‹Ðµ",
      "notif.empty": "Ð’ÑÐµ Ð¿Ñ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ð½Ð¾",
      "doc.download": "Ð¡ÐºÐ°Ñ‡Ð°Ñ‚ÑŒ",
      "doc.close": "Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ",
      "doc.previewNone": "ÐŸÑ€ÐµÐ´Ð²Ð°Ñ€Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ð¹ Ð¿Ñ€Ð¾ÑÐ¼Ð¾Ñ‚Ñ€ Ð½ÐµÐ´Ð¾ÑÑ‚ÑƒÐ¿ÐµÐ½ Ð´Ð»Ñ ÑÑ‚Ð¾Ð³Ð¾ Ñ‚Ð¸Ð¿Ð° Ñ„Ð°Ð¹Ð»Ð°.",
      "doc.uploaded": "â€ž{name}â€œ Ð·Ð°Ð³Ñ€ÑƒÐ¶ÐµÐ½ Ð² Ð±Ð¸Ð±Ð»Ð¸Ð¾Ñ‚ÐµÐºÑƒ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ð¾Ð²",
      "doc.uploadedCount": "{n} Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ð¾Ð² Ð² Ð±Ð¸Ð±Ð»Ð¸Ð¾Ñ‚ÐµÐºÐµ",
      "req.priority": "ÐŸÑ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚",
      "req.status": "Ð¡Ñ‚Ð°Ñ‚ÑƒÑ",
      "req.reopen": "ÐžÑ‚ÐºÑ€Ñ‹Ñ‚ÑŒ Ð·Ð°Ð½Ð¾Ð²Ð¾",
      "req.inProgress": "ÐžÑ‚Ð¼ÐµÑ‚Ð¸Ñ‚ÑŒ Ð² Ñ€Ð°Ð±Ð¾Ñ‚Ðµ",
      "req.complete": "ÐžÑ‚Ð¼ÐµÑ‚Ð¸Ñ‚ÑŒ Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½Ð½Ñ‹Ð¼",
      "req.done": "Ð’Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¾",
      "req.pending": "Ð’ Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ð¸",
      "req.progress": "Ð’ Ñ€Ð°Ð±Ð¾Ñ‚Ðµ",
      "req.critical": "ÐšÑ€Ð¸Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹",
      "req.important": "Ð’Ð°Ð¶Ð½Ñ‹Ð¹",
      "req.standard": "Ð¡Ñ‚Ð°Ð½Ð´Ð°Ñ€Ñ‚Ð½Ñ‹Ð¹",
      "req.count": "{n} Ð¿Ð¾ÐºÐ°Ð·Ð°Ð½Ð¾",
      "sim.results": "Ð ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚Ñ‹ ÑÐ¸Ð¼ÑƒÐ»ÑÑ†Ð¸Ð¸",
      "sim.running": "Ð’Ñ‹Ð¿Ð¾Ð»Ð½ÑÐµÑ‚ÑÑ ÑÐ¸Ð¼ÑƒÐ»ÑÑ†Ð¸Ñâ€¦",
      "sim.done": "Ð“Ð¾Ñ‚Ð¾Ð²Ð¾",
      "sim.reqs": "Ð”Ð¾Ð±Ð°Ð²Ð»ÐµÐ½Ð½Ñ‹Ðµ Ñ‚Ñ€ÐµÐ±Ð¾Ð²Ð°Ð½Ð¸Ñ",
      "sim.cost": "ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ð¾Ðµ Ð²Ð»Ð¸ÑÐ½Ð¸Ðµ Ð½Ð° ÑÑ‚Ð¾Ð¸Ð¼Ð¾ÑÑ‚ÑŒ",
      "sim.days": "Ð’Ð»Ð¸ÑÐ½Ð¸Ðµ Ð½Ð° Ð³Ñ€Ð°Ñ„Ð¸Ðº",
      "call.title": "Ð—Ð°ÐºÐ°Ð·Ð°Ñ‚ÑŒ Ð·Ð²Ð¾Ð½Ð¾Ðº",
      "call.sub": "Ð¡ÐºÐ°Ð¶Ð¸Ñ‚Ðµ, ÐºÐ°Ðº Ñ Ð²Ð°Ð¼Ð¸ ÑÐ²ÑÐ·Ð°Ñ‚ÑŒÑÑ, Ð¸ Ð½Ð°Ñˆ ÑÐ¿ÐµÑ†Ð¸Ð°Ð»Ð¸ÑÑ‚ Ð¿Ð¾ ÐºÐ¾Ð¼Ð¿Ð»Ð°ÐµÐ½ÑÑƒ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ Ð²Ñ€ÐµÐ¼Ñ.",
      "call.email": "Ð’Ð°ÑˆÐ° ÑÐ»ÐµÐºÑ‚Ñ€Ð¾Ð½Ð½Ð°Ñ Ð¿Ð¾Ñ‡Ñ‚Ð°",
      "call.time": "ÐŸÑ€ÐµÐ´Ð¿Ð¾Ñ‡Ñ‚Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾Ðµ Ð²Ñ€ÐµÐ¼Ñ",
      "call.invalid": "ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð²Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ð¹ Ð°Ð´Ñ€ÐµÑ ÑÐ»ÐµÐºÑ‚Ñ€Ð¾Ð½Ð½Ð¾Ð¹ Ð¿Ð¾Ñ‡Ñ‚Ñ‹",
      "call.sent": "Ð—Ð°Ð¿Ñ€Ð¾Ñ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½! ÐÐ°Ñˆ ÑÐ¿ÐµÑ†Ð¸Ð°Ð»Ð¸ÑÑ‚ ÑÐ²ÑÐ¶ÐµÑ‚ÑÑ Ñ Ð²Ð°Ð¼Ð¸ Ð² Ð±Ð»Ð¸Ð¶Ð°Ð¹ÑˆÐµÐµ Ð²Ñ€ÐµÐ¼Ñ.",
      "rpt.title": "ÐžÑ‚Ñ‡Ñ‘Ñ‚ Ð¾ Ð³Ð¾Ñ‚Ð¾Ð²Ð½Ð¾ÑÑ‚Ð¸ Ðº Ñ€Ñ‹Ð½ÐºÑƒ Ð¸ Ñ€ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½Ð¾Ð¼ ÑÐ¾Ð¾Ñ‚Ð²ÐµÑ‚ÑÑ‚Ð²Ð¸Ð¸",
      "rpt.generated": "Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¾ ReguLens",
      "rpt.aiGenerated": "ÐÐ½Ð°Ð»Ð¸Ð·, ÑÐ¾Ð·Ð´Ð°Ð½Ð½Ñ‹Ð¹ Ð˜Ð˜",
      "rpt.regulatorySource": "Ð ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½Ñ‹Ð¹ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº",
      "rpt.userInput": "Ð˜Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ñ, Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½Ð½Ð°Ñ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÐµÐ¼",
      "rpt.executiveSummary": "Ð ÐµÐ·ÑŽÐ¼Ðµ",
      "rpt.companyProfile": "ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ ÐºÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ð¸",
      "rpt.productProfile": "ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð°",
      "rpt.sourceMarket": "Ð Ñ‹Ð½Ð¾Ðº Ð¿Ñ€Ð¾Ð¸ÑÑ…Ð¾Ð¶Ð´ÐµÐ½Ð¸Ñ",
      "rpt.targetMarket": "Ð¦ÐµÐ»ÐµÐ²Ð¾Ð¹ Ñ€Ñ‹Ð½Ð¾Ðº",
      "rpt.applicableRegulations": "ÐŸÑ€Ð¸Ð¼ÐµÐ½Ð¸Ð¼Ñ‹Ðµ Ñ€ÐµÐ³ÑƒÐ»ÑÑ†Ð¸Ð¸",
      "rpt.complianceRequirements": "Ð¢Ñ€ÐµÐ±Ð¾Ð²Ð°Ð½Ð¸Ñ Ðº ÑÐ¾Ð¾Ñ‚Ð²ÐµÑ‚ÑÑ‚Ð²Ð¸ÑŽ",
      "rpt.completedReqs": "Ð’Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½Ð½Ñ‹Ðµ Ñ‚Ñ€ÐµÐ±Ð¾Ð²Ð°Ð½Ð¸Ñ",
      "rpt.pendingReqs": "Ð¢Ñ€ÐµÐ±Ð¾Ð²Ð°Ð½Ð¸Ñ Ð² Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ð¸",
      "rpt.complianceGaps": "ÐŸÑ€Ð¾Ð±ÐµÐ»Ñ‹ Ð² ÑÐ¾Ð¾Ñ‚Ð²ÐµÑ‚ÑÑ‚Ð²Ð¸Ð¸",
      "rpt.riskAssessment": "ÐžÑ†ÐµÐ½ÐºÐ° Ñ€Ð¸ÑÐºÐ¾Ð²",
      "rpt.businessImpact": "Ð’Ð»Ð¸ÑÐ½Ð¸Ðµ Ð½Ð° Ð±Ð¸Ð·Ð½ÐµÑ",
      "rpt.estimatedCost": "ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ð°Ñ ÑÑ‚Ð¾Ð¸Ð¼Ð¾ÑÑ‚ÑŒ",
      "rpt.estimatedTimeline": "ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ñ‹Ð¹ Ð³Ñ€Ð°Ñ„Ð¸Ðº",
      "rpt.actionPlan": "Ð ÐµÐºÐ¾Ð¼ÐµÐ½Ð´ÑƒÐµÐ¼Ñ‹Ð¹ Ð¿Ð»Ð°Ð½ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ð¹",
      "rpt.readinessScore": "ÐŸÐ¾ÐºÐ°Ð·Ð°Ñ‚ÐµÐ»ÑŒ Ð³Ð¾Ñ‚Ð¾Ð²Ð½Ð¾ÑÑ‚Ð¸",
      "rpt.launchRecommendation": "Ð ÐµÐºÐ¾Ð¼ÐµÐ½Ð´Ð°Ñ†Ð¸Ñ Ð¿Ð¾ Ð·Ð°Ð¿ÑƒÑÐºÑƒ",
      "rpt.regulatorySources": "Ð ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½Ñ‹Ðµ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸ÐºÐ¸",
      "rpt.timestamp": "Ð’Ñ€ÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ð¼ÐµÑ‚ÐºÐ° Ð°Ð½Ð°Ð»Ð¸Ð·Ð°",
      "rpt.noData": "Ð”Ð°Ð½Ð½Ñ‹Ðµ Ð°Ð½Ð°Ð»Ð¸Ð·Ð° Ð¾Ñ‚ÑÑƒÑ‚ÑÑ‚Ð²ÑƒÑŽÑ‚. Ð¡Ð½Ð°Ñ‡Ð°Ð»Ð° Ð²Ñ‹Ð¿Ð¾Ð»Ð½Ð¸Ñ‚Ðµ Ð°Ð½Ð°Ð»Ð¸Ð· Ð·Ð°Ð¿ÑƒÑÐºÐ°.",
      "rpt.generating": "Ð“ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ñ Ð¾Ñ‚Ñ‡Ñ‘Ñ‚Ð°...",
      "rpt.failed": "ÐžÑˆÐ¸Ð±ÐºÐ° Ð³ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ð¸ Ð¾Ñ‚Ñ‡Ñ‘Ñ‚Ð°. ÐŸÐ¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°, Ð¿Ð¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð°.",
      "rpt.retry": "ÐŸÐ¾Ð²Ñ‚Ð¾Ñ€Ð¸Ñ‚ÑŒ",
      "rpt.download": "Ð¡ÐºÐ°Ñ‡Ð°Ñ‚ÑŒ Ð¾Ñ‚Ñ‡Ñ‘Ñ‚",
      "rpt.print": "ÐŸÐµÑ‡Ð°Ñ‚ÑŒ / Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ ÐºÐ°Ðº PDF",
      "rpt.close": "Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ",
      "rpt.company": "ÐšÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ñ",
      "rpt.product": "ÐŸÑ€Ð¾Ð´ÑƒÐºÑ‚",
      "rpt.origin": "Ð¡Ñ‚Ñ€Ð°Ð½Ð° Ð¿Ñ€Ð¾Ð¸ÑÑ…Ð¾Ð¶Ð´ÐµÐ½Ð¸Ñ",
      "rpt.target": "Ð¦ÐµÐ»ÐµÐ²Ð¾Ð¹ Ñ€Ñ‹Ð½Ð¾Ðº",
      "rpt.industry": "ÐžÑ‚Ñ€Ð°ÑÐ»ÑŒ",
      "rpt.priority": "ÐŸÑ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚",
      "rpt.status": "Ð¡Ñ‚Ð°Ñ‚ÑƒÑ",
      "rpt.authority": "ÐžÑ€Ð³Ð°Ð½",
      "rpt.dueDate": "Ð¡Ñ€Ð¾Ðº",
      "rpt.description": "ÐžÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ",
      "rpt.totalTime": "ÐžÐ±Ñ‰ÐµÐµ Ð¾Ð¶Ð¸Ð´Ð°ÐµÐ¼Ð¾Ðµ Ð²Ñ€ÐµÐ¼Ñ",
      "rpt.totalCost": "ÐžÐ±Ñ‰Ð°Ñ Ð¾Ð¶Ð¸Ð´Ð°ÐµÐ¼Ð°Ñ ÑÑ‚Ð¾Ð¸Ð¼Ð¾ÑÑ‚ÑŒ",
      "rpt.riskLevel": "Ð£Ñ€Ð¾Ð²ÐµÐ½ÑŒ Ñ€Ð¸ÑÐºÐ°",
      "rpt.gaps": "ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ Ð¿Ñ€Ð¾Ð±ÐµÐ»Ñ‹",
      "rpt.critical": "ÐšÑ€Ð¸Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹",
      "rpt.important": "Ð’Ð°Ð¶Ð½Ñ‹Ð¹",
      "rpt.standard": "Ð¡Ñ‚Ð°Ð½Ð´Ð°Ñ€Ñ‚Ð½Ñ‹Ð¹",
      "rpt.pending": "Ð’ Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ð¸",
      "rpt.inProgress": "Ð’ Ñ€Ð°Ð±Ð¾Ñ‚Ðµ",
      "rpt.done": "Ð’Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¾",
      "rpt.notApplicable": "ÐÐµ Ð¿Ñ€Ð¸Ð¼ÐµÐ½Ð¸Ð¼Ð¾",
      "rpt.action": "Ð”ÐµÐ¹ÑÑ‚Ð²Ð¸Ðµ",
      "rpt.estimatedDays": "ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ñ‹Ðµ Ð´Ð½Ð¸",
      "rpt.estimatedEur": "ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ð°Ñ ÑÑ‚Ð¾Ð¸Ð¼Ð¾ÑÑ‚ÑŒ (EUR)",
      "rpt.owner": "ÐžÑ‚Ð²ÐµÑ‚ÑÑ‚Ð²ÐµÐ½Ð½Ð°Ñ ÑÑ‚Ð¾Ñ€Ð¾Ð½Ð°",
      "rpt.category": "ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ",
      "rpt.source": "Ð˜ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº",
      "rpt.code": "ÐšÐ¾Ð´ ÑÑÑ‹Ð»ÐºÐ¸",
      "rpt.date": "Ð”Ð°Ñ‚Ð°",
      "rpt.kind": "Ð¢Ð¸Ð¿",
      "rpt.summary": "Ð ÐµÐ·ÑŽÐ¼Ðµ",
      "rpt.proceed": "ÐŸÑ€Ð¾Ð´Ð¾Ð»Ð¶Ð¸Ñ‚ÑŒ Ð·Ð°Ð¿ÑƒÑÐº",
      "rpt.conditional": "Ð£ÑÐ»Ð¾Ð²Ð½Ñ‹Ð¹ Ð·Ð°Ð¿ÑƒÑÐº",
      "rpt.delay": "ÐžÑ‚Ð»Ð¾Ð¶Ð¸Ñ‚ÑŒ Ð·Ð°Ð¿ÑƒÑÐº",
      "rpt.prerequisites": "ÐŸÑ€ÐµÐ´Ð²Ð°Ñ€Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ðµ ÑƒÑÐ»Ð¾Ð²Ð¸Ñ",
      "rpt.verdict": "Ð’ÐµÑ€Ð´Ð¸ÐºÑ‚",
      "rpt.timeline": "Ð“Ñ€Ð°Ñ„Ð¸Ðº Ð´Ð¾ Ð¿Ð¾Ð»Ð½Ð¾Ð¹ Ð³Ð¾Ñ‚Ð¾Ð²Ð½Ð¾ÑÑ‚Ð¸",
      "rpt.disclaimer": "Ð­Ñ‚Ð¾Ñ‚ Ð¾Ñ‚Ñ‡Ñ‘Ñ‚ ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ Ð°Ð½Ð°Ð»Ð¸Ð·, ÑÐ¾Ð·Ð´Ð°Ð½Ð½Ñ‹Ð¹ Ð˜Ð˜ Ð½Ð° Ð¾ÑÐ½Ð¾Ð²Ðµ Ð´Ð°Ð½Ð½Ñ‹Ñ… Ñ€ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½Ð¾Ð¹ Ñ€Ð°Ð·Ð²ÐµÐ´ÐºÐ¸. Ð ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½ÑƒÑŽ Ð¸Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸ÑŽ ÑÐ»ÐµÐ´ÑƒÐµÑ‚ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÑÑ‚ÑŒ Ñ Ð¾Ñ„Ð¸Ñ†Ð¸Ð°Ð»ÑŒÐ½Ñ‹Ð¼Ð¸ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸ÐºÐ°Ð¼Ð¸ Ð¿ÐµÑ€ÐµÐ´ Ð¿Ñ€Ð¸Ð½ÑÑ‚Ð¸ÐµÐ¼ Ð±Ð¸Ð·Ð½ÐµÑ-Ñ€ÐµÑˆÐµÐ½Ð¸Ð¹. ReguLens Ð½Ðµ Ð³Ð°Ñ€Ð°Ð½Ñ‚Ð¸Ñ€ÑƒÐµÑ‚ Ð¿Ð¾Ð»Ð½Ð¾Ñ‚Ñƒ Ð¸Ð»Ð¸ Ñ‚Ð¾Ñ‡Ð½Ð¾ÑÑ‚ÑŒ Ñ€ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½Ñ‹Ñ… Ð´Ð°Ð½Ð½Ñ‹Ñ….",
      "rpt.page": "Ð¡Ñ‚Ñ€Ð°Ð½Ð¸Ñ†Ð°",
      "rpt.of": "Ð¸Ð·",
      "disclaimer.dashboard": "ReguLens Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÑÐµÑ‚ Ñ€ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½ÑƒÑŽ Ñ€Ð°Ð·Ð²ÐµÐ´ÐºÑƒ Ð¸ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÑƒ Ð¿Ñ€Ð¸Ð½ÑÑ‚Ð¸Ñ Ñ€ÐµÑˆÐµÐ½Ð¸Ð¹; Ð¾ÐºÐ¾Ð½Ñ‡Ð°Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ðµ ÑŽÑ€Ð¸Ð´Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ/ÐºÐ¾Ð¼Ð¿Ð»Ð°ÐµÐ½Ñ Ñ€ÐµÑˆÐµÐ½Ð¸Ñ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ð±Ñ‹Ñ‚ÑŒ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐµÐ½Ñ‹ ÐºÐ²Ð°Ð»Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¼Ð¸ ÑÐ¿ÐµÑ†Ð¸Ð°Ð»Ð¸ÑÑ‚Ð°Ð¼Ð¸ Ð¸Ð»Ð¸ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚Ð½Ñ‹Ð¼Ð¸ Ñ€ÐµÐ³ÑƒÐ»ÑÑ‚Ð¾Ñ€Ð½Ñ‹Ð¼Ð¸ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸ÐºÐ°Ð¼Ð¸.",
      "ai.agents": "ÐÐ³ÐµÐ½Ñ‚Ñ‹",
      "ai.completed": "Ð—Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ñ‹",
      "ai.failed": "ÐžÑˆÐ¸Ð±ÐºÐ°",
      "ai.totalTime": "ÐžÐ±Ñ‰ÐµÐµ Ð²Ñ€ÐµÐ¼Ñ",
      "ai.pending": "ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ",
      "ai.running": "Ð’Ñ‹Ð¿Ð¾Ð»Ð½ÑÐµÑ‚ÑÑ",
      "ai.completedStatus": "Ð—Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ð¾",
      "ai.failedStatus": "ÐžÑˆÐ¸Ð±ÐºÐ°",
      "ai.input": "Ð’Ð²Ð¾Ð´",
      "ai.output": "Ð’Ñ‹Ð²Ð¾Ð´",
      "ai.sources": "Ð˜ÑÑ‚Ð¾Ñ‡Ð½Ð¸ÐºÐ¸",
      "ai.retry": "ÐŸÐ¾Ð²Ñ‚Ð¾Ñ€Ð¸Ñ‚ÑŒ",
      "ai.emptyTitle": "ÐÐµÑ‚ Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾ÑÑ‚Ð¸ Ð°Ð³ÐµÐ½Ñ‚Ð¾Ð²",
      "ai.emptyDesc": "Ð—Ð°Ð¿ÑƒÑÑ‚Ð¸Ñ‚Ðµ Ð°Ð½Ð°Ð»Ð¸Ð· Ð·Ð°Ð¿ÑƒÑÐºÐ° Ð½Ð° ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ðµ <strong>ÐœÐ¾Ð³Ñƒ Ð»Ð¸ Ñ Ð·Ð°Ð¿ÑƒÑÑ‚Ð¸Ñ‚ÑŒ?</strong> Ð´Ð»Ñ Ð°ÐºÑ‚Ð¸Ð²Ð°Ñ†Ð¸Ð¸ ÐºÐ¾Ð½Ð²ÐµÐ¹ÐµÑ€Ð° Ð¼ÑƒÐ»ÑŒÑ‚Ð¸Ð°Ð³ÐµÐ½Ñ‚Ð½Ð¾Ð¹ Ñ€Ð°Ð·Ð²ÐµÐ´ÐºÐ¸.",
      "ai.startAnalysis": "ÐÐ°Ñ‡Ð°Ñ‚ÑŒ Ð°Ð½Ð°Ð»Ð¸Ð·",
    },
    ja: {
      "nav.dashboard": "ãƒ€ãƒƒã‚·ãƒ¥ãƒœãƒ¼ãƒ‰",
      "settings.title": "è¨­å®š",
      "settings.general": "ä¸€èˆ¬",
      "settings.language": "è¨€èªž",
      "settings.density": "è¡¨ç¤ºå¯†åº¦",
      "settings.theme": "ãƒ†ãƒ¼ãƒž",
      "settings.theme.light": "ãƒ©ã‚¤ãƒˆ",
      "settings.theme.dark": "ãƒ€ãƒ¼ã‚¯",
      "settings.account": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆ",
      "settings.signedInAs": "ãƒ­ã‚°ã‚¤ãƒ³ä¸­",
      "settings.notSignedIn": "æœªãƒ­ã‚°ã‚¤ãƒ³",
      "settings.signIn": "ã‚µã‚¤ãƒ³ã‚¤ãƒ³",
      "settings.signOut": "ã‚µã‚¤ãƒ³ã‚¢ã‚¦ãƒˆ",
      "settings.aiEngine": "AIã‚¨ãƒ³ã‚¸ãƒ³",
      "settings.checking": "ç¢ºèªä¸­â€¦",
      "settings.aiConnected": "æŽ¥ç¶šæ¸ˆã¿ Â· {model}",
      "settings.aiDisconnected": "è¨­å®šæ¸ˆã¿ã ãŒåˆ°é”ä¸å¯",
      "settings.aiNotConfigured": "AIã‚¨ãƒ³ã‚¸ãƒ³ãŒè¨­å®šã•ã‚Œã¦ã„ã¾ã›ã‚“",
      "settings.aiConnError": "AIã‚¨ãƒ³ã‚¸ãƒ³ã«æŽ¥ç¶šã§ãã¾ã›ã‚“ã§ã—ãŸ",
      "settings.aiRetryHint": "è¨­å®šã‚’ç¢ºèªã—ã¦å†è©¦è¡Œã—ã¦ãã ã•ã„",
      "settings.retry": "å†è©¦è¡Œ",
      "settings.clearMemory": "ãƒ¡ãƒ¢ãƒªã‚’ã‚¯ãƒªã‚¢",
      "settings.memoryAlreadyEmpty": "ã‚¯ãƒªã‚¢ã™ã‚‹ã‚‚ã®ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚ä¿å­˜ã•ã‚ŒãŸä¼šè©±ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚",
      "settings.memoryCleared": "ä¼šè©±ãƒ¡ãƒ¢ãƒªãŒã‚¯ãƒªã‚¢ã•ã‚Œã¾ã—ãŸã€‚",
      "settings.memoryClearError": "ãƒ¡ãƒ¢ãƒªã‚’ã‚¯ãƒªã‚¢ã§ãã¾ã›ã‚“ã§ã—ãŸã€‚ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚",
      "profile.title": "ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«",
      "profile.guest": "ã‚²ã‚¹ãƒˆ",
      "confirm.title": "ä¼šè©±ãƒ¡ãƒ¢ãƒªã‚’ã‚¯ãƒªã‚¢ã—ã¾ã™ã‹ï¼Ÿ",
      "confirm.text": "ã“ã®ãƒ‡ãƒã‚¤ã‚¹ã¨ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã®ã™ã¹ã¦ã®ä¼šè©±ãŒå®Œå…¨ã«å‰Šé™¤ã•ã‚Œã¾ã™ã€‚ã“ã®æ“ä½œã¯å…ƒã«æˆ»ã›ã¾ã›ã‚“ã€‚",
      "confirm.cancel": "ã‚­ãƒ£ãƒ³ã‚»ãƒ«",
      "confirm.clear": "ãƒ¡ãƒ¢ãƒªã‚’ã‚¯ãƒªã‚¢",
      "auth.close": "é–‰ã˜ã‚‹",
      "auth.welcomeBack": "ãŠã‹ãˆã‚Šãªã•ã„",
      "auth.loginSub": "ã‚µã‚¤ãƒ³ã‚¤ãƒ³ã—ã¦ç¶šè¡Œ",
      "auth.createAccount": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆä½œæˆ",
      "auth.createAccountSub": "ReguLensã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’è¨­å®š",
      "auth.login": "ã‚µã‚¤ãƒ³ã‚¤ãƒ³",
      "auth.signup": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆä½œæˆ",
      "auth.name": "åå‰",
      "auth.email": "ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹",
      "auth.password": "ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰",
      "auth.forgotPassword": "ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ã‚’ãŠå¿˜ã‚Œã§ã™ã‹ï¼Ÿ",
      "auth.noAccount": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ãŠæŒã¡ã§ãªã„ã§ã™ã‹ï¼Ÿ",
      "auth.haveAccount": "æ—¢ã«ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ãŠæŒã¡ã§ã™ã‹ï¼Ÿ",
      "auth.or": "ã¾ãŸã¯",
      "auth.continueGuest": "ã‚²ã‚¹ãƒˆã¨ã—ã¦ç¶šè¡Œ",
      "auth.signingIn": "ã‚µã‚¤ãƒ³ã‚¤ãƒ³ä¸­â€¦",
      "auth.signingUp": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆä½œæˆä¸­â€¦",
      "auth.creatingAccount": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆä½œæˆä¸­â€¦",
      "auth.requiredError": "ã™ã¹ã¦ã®é …ç›®ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚",
      "auth.sendReset": "ãƒªã‚»ãƒƒãƒˆãƒªãƒ³ã‚¯ã‚’é€ä¿¡",
      "auth.backToSignIn": "ã‚µã‚¤ãƒ³ã‚¤ãƒ³ã«æˆ»ã‚‹",
      "auth.resetSent": "ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ãƒªã‚»ãƒƒãƒˆãƒ¡ãƒ¼ãƒ«ã‚’é€ä¿¡ã—ã¾ã—ãŸã€‚",
      "auth.signedIn": "{email} ã§ã‚µã‚¤ãƒ³ã‚¤ãƒ³ä¸­",
      "auth.signedOut": "ã‚µã‚¤ãƒ³ã‚¢ã‚¦ãƒˆã—ã¾ã—ãŸ",
      "auth.guestSignedIn": "ã‚²ã‚¹ãƒˆã¨ã—ã¦ç¶šè¡Œä¸­",
      "auth.welcome": "ã‚ˆã†ã“ãã€{name}",
      "auth.error.invalidEmail": "æœ‰åŠ¹ãªãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚",
      "auth.error.weakPassword": "ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ã¯6æ–‡å­—ä»¥ä¸Šã§å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚",
      "auth.error.userNotFound": "ã“ã®ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã®ã‚¢ã‚«ã‚¦ãƒ³ãƒˆãŒè¦‹ã¤ã‹ã‚Šã¾ã›ã‚“ã€‚",
      "auth.error.invalidCredential": "ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã¾ãŸã¯ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ãŒæ­£ã—ãã‚ã‚Šã¾ã›ã‚“ã€‚",
      "auth.error.emailInUse": "ã“ã®ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã®ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã¯æ—¢ã«å­˜åœ¨ã—ã¾ã™ã€‚",
      "auth.error.network": "ãƒãƒƒãƒˆãƒ¯ãƒ¼ã‚¯ã‚¨ãƒ©ãƒ¼ã€‚æŽ¥ç¶šã‚’ç¢ºèªã—ã¦ãã ã•ã„ã€‚",
      "auth.error.popupClosed": "ã‚µã‚¤ãƒ³ã‚¤ãƒ³ã‚¦ã‚£ãƒ³ãƒ‰ã‚¦ãŒé–‰ã˜ã‚‰ã‚Œã¾ã—ãŸã€‚",
      "auth.error.popupBlocked": "ãƒãƒƒãƒ—ã‚¢ãƒƒãƒ—ãŒãƒ–ãƒ­ãƒƒã‚¯ã•ã‚Œã¾ã—ãŸã€‚ã‚µã‚¤ãƒ³ã‚¤ãƒ³ã™ã‚‹ãŸã‚ã«ãƒãƒƒãƒ—ã‚¢ãƒƒãƒ—ã‚’è¨±å¯ã—ã¦ãã ã•ã„ã€‚",
      "auth.error.operationNotAllowed": "ã“ã®ã‚µã‚¤ãƒ³ã‚¤ãƒ³æ–¹æ³•ã¯æœ‰åŠ¹ã«ãªã£ã¦ã„ã¾ã›ã‚“ã€‚",
      "auth.error.guestNotEnabled": "ã‚²ã‚¹ãƒˆã‚µã‚¤ãƒ³ã‚¤ãƒ³ãŒæœ‰åŠ¹ã«ãªã£ã¦ã„ã¾ã›ã‚“ã€‚",
      "auth.error.tooManyRequests": "è©¦è¡Œå›žæ•°ãŒå¤šã™ãŽã¾ã™ã€‚ã—ã°ã‚‰ãã—ã¦ã‹ã‚‰ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚",
      "auth.error.userDisabled": "ã“ã®ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã¯ç„¡åŠ¹ã«ãªã£ã¦ã„ã¾ã™ã€‚",
      "auth.error.configError": "èªè¨¼ãŒæ­£ã—ãè¨­å®šã•ã‚Œã¦ã„ã¾ã›ã‚“ã€‚",
      "auth.error.generic": "å•é¡ŒãŒç™ºç”Ÿã—ã¾ã—ãŸã€‚ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚",
      "auth.error.notConfigured": "ReguLensã¯ã¾ã èªè¨¼ç”¨ã«è¨­å®šã•ã‚Œã¦ã„ã¾ã›ã‚“ã€‚",
      "notif.title": "é€šçŸ¥",
      "notif.markAll": "ã™ã¹ã¦æ—¢èª­ã«ã™ã‚‹",
      "notif.empty": "ã™ã¹ã¦ç¢ºèªæ¸ˆã¿",
      "doc.download": "ãƒ€ã‚¦ãƒ³ãƒ­ãƒ¼ãƒ‰",
      "doc.close": "é–‰ã˜ã‚‹",
      "doc.previewNone": "ã“ã®ãƒ•ã‚¡ã‚¤ãƒ«ã‚¿ã‚¤ãƒ—ã®ãƒ—ãƒ¬ãƒ“ãƒ¥ãƒ¼ã¯åˆ©ç”¨ã§ãã¾ã›ã‚“ã€‚",
      "doc.uploaded": "ã€Œ{name}ã€ã‚’ãƒ‰ã‚­ãƒ¥ãƒ¡ãƒ³ãƒˆãƒ©ã‚¤ãƒ–ãƒ©ãƒªã«ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰ã—ã¾ã—ãŸ",
      "doc.uploadedCount": "ãƒ©ã‚¤ãƒ–ãƒ©ãƒªã«{n}ä»¶ã®ãƒ‰ã‚­ãƒ¥ãƒ¡ãƒ³ãƒˆ",
      "req.priority": "å„ªå…ˆåº¦",
      "req.status": "ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹",
      "req.reopen": "å†ã‚ªãƒ¼ãƒ—ãƒ³",
      "req.inProgress": "é€²è¡Œä¸­ã«ã™ã‚‹",
      "req.complete": "å®Œäº†ã«ã™ã‚‹",
      "req.done": "å®Œäº†",
      "req.pending": "ä¿ç•™ä¸­",
      "req.progress": "é€²è¡Œä¸­",
      "req.critical": "ç·Šæ€¥",
      "req.important": "é‡è¦",
      "req.standard": "æ¨™æº–",
      "req.count": "{n}ä»¶è¡¨ç¤ºä¸­",
      "sim.results": "ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ã‚·ãƒ§ãƒ³çµæžœ",
      "sim.running": "ã‚·ãƒŸãƒ¥ãƒ¬ãƒ¼ã‚·ãƒ§ãƒ³å®Ÿè¡Œä¸­â€¦",
      "sim.done": "å®Œäº†",
      "sim.reqs": "è¿½åŠ ã•ã‚ŒãŸè¦ä»¶",
      "sim.cost": "ã‚³ã‚¹ãƒˆã¸ã®å½±éŸ¿",
      "sim.days": "ã‚¹ã‚±ã‚¸ãƒ¥ãƒ¼ãƒ«ã¸ã®å½±éŸ¿",
      "call.title": "é›»è©±ã‚’äºˆç´„",
      "call.sub": "é€£çµ¡æ–¹æ³•ã‚’ãŠä¼ãˆãã ã•ã„ã€‚ã‚³ãƒ³ãƒ—ãƒ©ã‚¤ã‚¢ãƒ³ã‚¹å°‚é–€å®¶ãŒã‚¹ã‚±ã‚¸ãƒ¥ãƒ¼ãƒ«ã‚’ç¢ºèªã—ã¾ã™ã€‚",
      "call.email": "ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹",
      "call.time": "å¸Œæœ›æ™‚é–“",
      "call.invalid": "æœ‰åŠ¹ãªãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„",
      "call.sent": "ãƒªã‚¯ã‚¨ã‚¹ãƒˆãŒé€ä¿¡ã•ã‚Œã¾ã—ãŸï¼å°‚é–€å®¶ãŒè¿‘æ—¥ä¸­ã«ã”é€£çµ¡ã„ãŸã—ã¾ã™ã€‚",
      "rpt.title": "å¸‚å ´æº–å‚™çŠ¶æ³ãƒ»è¦åˆ¶ã‚³ãƒ³ãƒ—ãƒ©ã‚¤ã‚¢ãƒ³ã‚¹ãƒ¬ãƒãƒ¼ãƒˆ",
      "rpt.generated": "ReguLens ãŒç”Ÿæˆ",
      "rpt.aiGenerated": "AIã«ã‚ˆã‚‹åˆ†æž",
      "rpt.regulatorySource": "è¦åˆ¶ã‚½ãƒ¼ã‚¹",
      "rpt.userInput": "ãƒ¦ãƒ¼ã‚¶ãƒ¼æä¾›æƒ…å ±",
      "rpt.executiveSummary": "ã‚¨ã‚°ã‚¼ã‚¯ãƒ†ã‚£ãƒ–ã‚µãƒžãƒªãƒ¼",
      "rpt.companyProfile": "ä¼šç¤¾ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«",
      "rpt.productProfile": "è£½å“ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«",
      "rpt.sourceMarket": "ç™ºä¿¡å…ƒå¸‚å ´",
      "rpt.targetMarket": "ã‚¿ãƒ¼ã‚²ãƒƒãƒˆå¸‚å ´",
      "rpt.applicableRegulations": "é©ç”¨è¦åˆ¶",
      "rpt.complianceRequirements": "ã‚³ãƒ³ãƒ—ãƒ©ã‚¤ã‚¢ãƒ³ã‚¹è¦ä»¶",
      "rpt.completedReqs": "å®Œäº†ã—ãŸè¦ä»¶",
      "rpt.pendingReqs": "ä¿ç•™ä¸­ã®è¦ä»¶",
      "rpt.complianceGaps": "ã‚³ãƒ³ãƒ—ãƒ©ã‚¤ã‚¢ãƒ³ã‚¹ã‚®ãƒ£ãƒƒãƒ—",
      "rpt.riskAssessment": "ãƒªã‚¹ã‚¯è©•ä¾¡",
      "rpt.businessImpact": "ãƒ“ã‚¸ãƒã‚¹ã¸ã®å½±éŸ¿",
      "rpt.estimatedCost": "æŽ¨å®šã‚³ã‚¹ãƒˆ",
      "rpt.estimatedTimeline": "æŽ¨å®šã‚¹ã‚±ã‚¸ãƒ¥ãƒ¼ãƒ«",
      "rpt.actionPlan": "æŽ¨å¥¨ã‚¢ã‚¯ã‚·ãƒ§ãƒ³ãƒ—ãƒ©ãƒ³",
      "rpt.readinessScore": "å¸‚å ´æº–å‚™ã‚¹ã‚³ã‚¢",
      "rpt.launchRecommendation": "ãƒ­ãƒ¼ãƒ³ãƒæŽ¨å¥¨",
      "rpt.regulatorySources": "è¦åˆ¶ã‚½ãƒ¼ã‚¹",
      "rpt.timestamp": "åˆ†æžã‚¿ã‚¤ãƒ ã‚¹ã‚¿ãƒ³ãƒ—",
      "rpt.noData": "åˆ†æžãƒ‡ãƒ¼ã‚¿ãŒã‚ã‚Šã¾ã›ã‚“ã€‚ã¾ãšãƒ­ãƒ¼ãƒ³ãƒåˆ†æžã‚’å®Ÿè¡Œã—ã¦ãã ã•ã„ã€‚",
      "rpt.generating": "ãƒ¬ãƒãƒ¼ãƒˆç”Ÿæˆä¸­...",
      "rpt.failed": "ãƒ¬ãƒãƒ¼ãƒˆã®ç”Ÿæˆã«å¤±æ•—ã—ã¾ã—ãŸã€‚ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚",
      "rpt.retry": "å†è©¦è¡Œ",
      "rpt.download": "ãƒ¬ãƒãƒ¼ãƒˆã‚’ãƒ€ã‚¦ãƒ³ãƒ­ãƒ¼ãƒ‰",
      "rpt.print": "å°åˆ· / PDFã¨ã—ã¦ä¿å­˜",
      "rpt.close": "é–‰ã˜ã‚‹",
      "rpt.company": "ä¼šç¤¾",
      "rpt.product": "è£½å“",
      "rpt.origin": "åŽŸç”£å›½",
      "rpt.target": "ã‚¿ãƒ¼ã‚²ãƒƒãƒˆå¸‚å ´",
      "rpt.industry": "æ¥­ç•Œ",
      "rpt.priority": "å„ªå…ˆåº¦",
      "rpt.status": "ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹",
      "rpt.authority": "ç®¡è½„å½“å±€",
      "rpt.dueDate": "æœŸé™",
      "rpt.description": "èª¬æ˜Ž",
      "rpt.totalCost": "æŽ¨å®šç·ã‚³ã‚¹ãƒˆ",
      "rpt.totalTime": "æŽ¨å®šç·æ™‚é–“",
      "rpt.riskLevel": "ãƒªã‚¹ã‚¯ãƒ¬ãƒ™ãƒ«",
      "rpt.gaps": "æœªè§£æ±ºã®ã‚®ãƒ£ãƒƒãƒ—",
      "rpt.critical": "ç·Šæ€¥",
      "rpt.important": "é‡è¦",
      "rpt.standard": "æ¨™æº–",
      "rpt.pending": "ä¿ç•™ä¸­",
      "rpt.inProgress": "é€²è¡Œä¸­",
      "rpt.done": "å®Œäº†",
      "rpt.notApplicable": "è©²å½“ãªã—",
      "rpt.action": "ã‚¢ã‚¯ã‚·ãƒ§ãƒ³",
      "rpt.estimatedDays": "æŽ¨å®šæ—¥æ•°",
      "rpt.estimatedEur": "æŽ¨å®šã‚³ã‚¹ãƒˆ (EUR)",
      "rpt.owner": "æ‹…å½“è€…",
      "rpt.category": "ã‚«ãƒ†ã‚´ãƒª",
      "rpt.source": "ã‚½ãƒ¼ã‚¹",
      "rpt.code": "å‚ç…§ã‚³ãƒ¼ãƒ‰",
      "rpt.date": "æ—¥ä»˜",
      "rpt.kind": "ç¨®é¡ž",
      "rpt.summary": "æ¦‚è¦",
      "rpt.proceed": "ãƒ­ãƒ¼ãƒ³ãƒã‚’ç¶šè¡Œ",
      "rpt.conditional": "æ¡ä»¶ä»˜ããƒ­ãƒ¼ãƒ³ãƒ",
      "rpt.delay": "ãƒ­ãƒ¼ãƒ³ãƒã‚’å»¶æœŸ",
      "rpt.prerequisites": "å‰ææ¡ä»¶",
      "rpt.verdict": "åˆ¤å®š",
      "rpt.timeline": "å®Œå…¨ãªæº–å‚™ã¾ã§ã®ã‚¹ã‚±ã‚¸ãƒ¥ãƒ¼ãƒ«",
      "rpt.disclaimer": "ã“ã®ãƒ¬ãƒãƒ¼ãƒˆã«ã¯ã€è¦åˆ¶ã‚¤ãƒ³ãƒ†ãƒªã‚¸ã‚§ãƒ³ã‚¹ãƒ‡ãƒ¼ã‚¿ã«åŸºã¥ãAIç”Ÿæˆã®åˆ†æžãŒå«ã¾ã‚Œã¦ã„ã¾ã™ã€‚è¦åˆ¶æƒ…å ±ã¯ã€ãƒ“ã‚¸ãƒã‚¹åˆ¤æ–­ã‚’è¡Œã†å‰ã«å…¬å¼ã‚½ãƒ¼ã‚¹ã§ç¢ºèªã™ã‚‹å¿…è¦ãŒã‚ã‚Šã¾ã™ã€‚ReguLensã¯ã€è¦åˆ¶ãƒ‡ãƒ¼ã‚¿ã®å®Œå…¨æ€§ã¾ãŸã¯æ­£ç¢ºæ€§ã‚’ä¿è¨¼ã™ã‚‹ã‚‚ã®ã§ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚",
      "rpt.page": "ãƒšãƒ¼ã‚¸",
      "rpt.of": "/",
      "disclaimer.dashboard": "ReguLensã¯è¦åˆ¶ã‚¤ãƒ³ãƒ†ãƒªã‚¸ã‚§ãƒ³ã‚¹ã¨æ„æ€æ±ºå®šã‚µãƒãƒ¼ãƒˆã‚’æä¾›ã—ã¾ã™ã€‚æœ€çµ‚çš„ãªæ³•çš„/ã‚³ãƒ³ãƒ—ãƒ©ã‚¤ã‚¢ãƒ³ã‚¹ã®åˆ¤æ–­ã¯ã€æœ‰è³‡æ ¼ã®å°‚é–€å®¶ã¾ãŸã¯æ¨©å¨ã‚ã‚‹è¦åˆ¶ã‚½ãƒ¼ã‚¹ã§ç¢ºèªã™ã‚‹å¿…è¦ãŒã‚ã‚Šã¾ã™ã€‚",
      "ai.agents": "ã‚¨ãƒ¼ã‚¸ã‚§ãƒ³ãƒˆ",
      "ai.completed": "å®Œäº†",
      "ai.failed": "å¤±æ•—",
      "ai.totalTime": "åˆè¨ˆæ™‚é–“",
      "ai.pending": "ä¿ç•™ä¸­",
      "ai.running": "å®Ÿè¡Œä¸­",
      "ai.completedStatus": "å®Œäº†",
      "ai.failedStatus": "å¤±æ•—",
      "ai.input": "å…¥åŠ›",
      "ai.output": "å‡ºåŠ›",
      "ai.sources": "ã‚½ãƒ¼ã‚¹",
      "ai.retry": "å†è©¦è¡Œ",
      "ai.emptyTitle": "ã‚¨ãƒ¼ã‚¸ã‚§ãƒ³ãƒˆã®ã‚¢ã‚¯ãƒ†ã‚£ãƒ“ãƒ†ã‚£ãªã—",
      "ai.emptyDesc": "<strong>ãƒ­ãƒ¼ãƒ³ãƒã§ãã¾ã™ã‹ï¼Ÿ</strong>ãƒšãƒ¼ã‚¸ã‹ã‚‰ãƒ­ãƒ¼ãƒ³ãƒåˆ†æžã‚’å®Ÿè¡Œã—ã¦ã€ãƒžãƒ«ãƒã‚¨ãƒ¼ã‚¸ã‚§ãƒ³ãƒˆã‚¤ãƒ³ãƒ†ãƒªã‚¸ã‚§ãƒ³ã‚¹ãƒ‘ã‚¤ãƒ—ãƒ©ã‚¤ãƒ³ã‚’æœ‰åŠ¹ã«ã—ã¦ãã ã•ã„ã€‚",
      "ai.startAnalysis": "åˆ†æžã‚’é–‹å§‹",
    },
    zh: {
      "nav.dashboard": "ä»ªè¡¨æ¿",
      "settings.title": "è®¾ç½®",
      "settings.general": "å¸¸è§„",
      "settings.language": "è¯­è¨€",
      "settings.density": "æ˜¾ç¤ºå¯†åº¦",
      "settings.theme": "ä¸»é¢˜",
      "settings.theme.light": "æµ…è‰²",
      "settings.theme.dark": "æ·±è‰²",
      "settings.account": "è´¦æˆ·",
      "settings.signedInAs": "å·²ç™»å½•ä¸º",
      "settings.notSignedIn": "æœªç™»å½•",
      "settings.signIn": "ç™»å½•",
      "settings.signOut": "é€€å‡ºç™»å½•",
      "settings.aiEngine": "AIå¼•æ“Ž",
      "settings.checking": "æ£€æŸ¥ä¸­â€¦",
      "settings.aiConnected": "å·²è¿žæŽ¥ Â· {model}",
      "settings.aiDisconnected": "å·²é…ç½®ä½†æ— æ³•è¿žæŽ¥",
      "settings.aiNotConfigured": "AIå¼•æ“Žæœªé…ç½®",
      "settings.aiConnError": "æ— æ³•è¿žæŽ¥åˆ°AIå¼•æ“Ž",
      "settings.aiRetryHint": "è¯·æ£€æŸ¥é…ç½®å¹¶é‡è¯•",
      "settings.retry": "é‡è¯•",
      "settings.clearMemory": "æ¸…é™¤è®°å¿†",
      "settings.memoryAlreadyEmpty": "æ²¡æœ‰å¯æ¸…é™¤çš„å†…å®¹ï¼Œæ²¡æœ‰ä¿å­˜çš„å¯¹è¯ã€‚",
      "settings.memoryCleared": "å¯¹è¯è®°å¿†å·²æ¸…é™¤ã€‚",
      "settings.memoryClearError": "æ— æ³•æ¸…é™¤è®°å¿†ï¼Œè¯·é‡è¯•ã€‚",
      "profile.title": "ä¸ªäººèµ„æ–™",
      "profile.guest": "è®¿å®¢",
      "confirm.title": "æ¸…é™¤å¯¹è¯è®°å¿†ï¼Ÿ",
      "confirm.text": "è¿™å°†æ°¸ä¹…åˆ é™¤æ­¤è®¾å¤‡å’Œè´¦æˆ·ä¸Šçš„æ‰€æœ‰å¯¹è¯ï¼Œæ­¤æ“ä½œä¸å¯æ’¤é”€ã€‚",
      "confirm.cancel": "å–æ¶ˆ",
      "confirm.clear": "æ¸…é™¤è®°å¿†",
      "auth.close": "å…³é—­",
      "auth.welcomeBack": "æ¬¢è¿Žå›žæ¥",
      "auth.loginSub": "ç™»å½•ä»¥ç»§ç»­",
      "auth.createAccount": "åˆ›å»ºè´¦æˆ·",
      "auth.createAccountSub": "è®¾ç½®æ‚¨çš„ReguLensè´¦æˆ·",
      "auth.login": "ç™»å½•",
      "auth.signup": "åˆ›å»ºè´¦æˆ·",
      "auth.name": "å§“å",
      "auth.email": "ç”µå­é‚®ä»¶",
      "auth.password": "å¯†ç ",
      "auth.forgotPassword": "å¿˜è®°å¯†ç ï¼Ÿ",
      "auth.noAccount": "æ²¡æœ‰è´¦æˆ·ï¼Ÿ",
      "auth.haveAccount": "å·²æœ‰è´¦æˆ·ï¼Ÿ",
      "auth.or": "æˆ–",
      "auth.continueGuest": "ä»¥è®¿å®¢èº«ä»½ç»§ç»­",
      "auth.signingIn": "ç™»å½•ä¸­â€¦",
      "auth.signingUp": "åˆ›å»ºè´¦æˆ·ä¸­â€¦",
      "auth.creatingAccount": "åˆ›å»ºè´¦æˆ·ä¸­â€¦",
      "auth.requiredError": "è¯·å¡«å†™æ‰€æœ‰å­—æ®µã€‚",
      "auth.sendReset": "å‘é€é‡ç½®é“¾æŽ¥",
      "auth.backToSignIn": "è¿”å›žç™»å½•",
      "auth.resetSent": "å¯†ç é‡ç½®é‚®ä»¶å·²å‘é€ã€‚",
      "auth.signedIn": "å·²ç™»å½•ä¸º {email}",
      "auth.signedOut": "å·²é€€å‡ºç™»å½•",
      "auth.guestSignedIn": "ä»¥è®¿å®¢èº«ä»½ç»§ç»­",
      "auth.welcome": "æ¬¢è¿Žï¼Œ{name}",
      "auth.error.invalidEmail": "è¯·è¾“å…¥æœ‰æ•ˆçš„ç”µå­é‚®ä»¶åœ°å€ã€‚",
      "auth.error.weakPassword": "å¯†ç è‡³å°‘éœ€è¦6ä¸ªå­—ç¬¦ã€‚",
      "auth.error.userNotFound": "æœªæ‰¾åˆ°æ­¤é‚®ç®±çš„è´¦æˆ·ã€‚",
      "auth.error.invalidCredential": "é‚®ç®±æˆ–å¯†ç ä¸æ­£ç¡®ã€‚",
      "auth.error.emailInUse": "æ­¤é‚®ç®±çš„è´¦æˆ·å·²å­˜åœ¨ã€‚",
      "auth.error.network": "ç½‘ç»œé”™è¯¯ï¼Œè¯·æ£€æŸ¥è¿žæŽ¥ã€‚",
      "auth.error.popupClosed": "ç™»å½•çª—å£å·²å…³é—­ã€‚",
      "auth.error.popupBlocked": "å¼¹çª—è¢«é˜»æ­¢ï¼Œè¯·å…è®¸å¼¹çª—ä»¥ç™»å½•ã€‚",
      "auth.error.operationNotAllowed": "æ­¤ç™»å½•æ–¹å¼æœªå¯ç”¨ã€‚",
      "auth.error.guestNotEnabled": "è®¿å®¢ç™»å½•æœªå¯ç”¨ã€‚",
      "auth.error.tooManyRequests": "å°è¯•æ¬¡æ•°è¿‡å¤šï¼Œè¯·ç¨åŽé‡è¯•ã€‚",
      "auth.error.userDisabled": "æ­¤è´¦æˆ·å·²è¢«ç¦ç”¨ã€‚",
      "auth.error.configError": "è®¤è¯é…ç½®ä¸æ­£ç¡®ã€‚",
      "auth.error.generic": "å‡ºäº†ç‚¹é—®é¢˜ï¼Œè¯·é‡è¯•ã€‚",
      "auth.error.notConfigured": "ReguLenså°šæœªé…ç½®è®¤è¯ã€‚",
      "notif.title": "é€šçŸ¥",
      "notif.markAll": "å…¨éƒ¨æ ‡ä¸ºå·²è¯»",
      "notif.empty": "å…¨éƒ¨å·²å¤„ç†",
      "doc.download": "ä¸‹è½½",
      "doc.close": "å…³é—­",
      "doc.previewNone": "æ­¤æ–‡ä»¶ç±»åž‹æ— å¯ç”¨é¢„è§ˆã€‚",
      "doc.uploaded": "å·²å°†\"{name}\"ä¸Šä¼ è‡³æ–‡æ¡£åº“",
      "doc.uploadedCount": "åº“ä¸­æœ‰{n}ä¸ªæ–‡æ¡£",
      "req.priority": "ä¼˜å…ˆçº§",
      "req.status": "çŠ¶æ€",
      "req.reopen": "é‡æ–°æ‰“å¼€",
      "req.inProgress": "æ ‡è®°ä¸ºè¿›è¡Œä¸­",
      "req.complete": "æ ‡è®°ä¸ºå·²å®Œæˆ",
      "req.done": "å·²å®Œæˆ",
      "req.pending": "å¾…å¤„ç†",
      "req.progress": "è¿›è¡Œä¸­",
      "req.critical": "ç´§æ€¥",
      "req.important": "é‡è¦",
      "req.standard": "æ ‡å‡†",
      "req.count": "æ˜¾ç¤º{n}é¡¹",
      "sim.results": "æ¨¡æ‹Ÿç»“æžœ",
      "sim.running": "æ­£åœ¨è¿è¡Œæ¨¡æ‹Ÿâ€¦",
      "sim.done": "å®Œæˆ",
      "sim.reqs": "æ–°å¢žè¦æ±‚",
      "sim.cost": "é¢„è®¡æˆæœ¬å½±å“",
      "sim.days": "æ—¶é—´è¡¨å½±å“",
      "call.title": "é¢„çº¦ç”µè¯",
      "call.sub": "è¯·å‘ŠçŸ¥æˆ‘ä»¬å¦‚ä½•è”ç³»æ‚¨ï¼Œæˆ‘ä»¬çš„åˆè§„ä¸“å®¶å°†ç¡®è®¤æ—¶é—´ã€‚",
      "call.email": "æ‚¨çš„é‚®ç®±",
      "call.time": "é¦–é€‰æ—¶é—´",
      "call.invalid": "è¯·è¾“å…¥æœ‰æ•ˆçš„é‚®ç®±",
      "call.sent": "è¯·æ±‚å·²å‘é€ï¼æˆ‘ä»¬çš„ä¸“å®¶å°†å°½å¿«ä¸Žæ‚¨è”ç³»ã€‚",
      "rpt.title": "å¸‚åœºå‡†å¤‡åº¦ä¸Žæ³•è§„åˆè§„æŠ¥å‘Š",
      "rpt.generated": "ç”±ReguLensç”Ÿæˆ",
      "rpt.aiGenerated": "AIç”Ÿæˆåˆ†æž",
      "rpt.regulatorySource": "ç›‘ç®¡æ¥æº",
      "rpt.userInput": "ç”¨æˆ·æä¾›çš„ä¿¡æ¯",
      "rpt.executiveSummary": "æ‰§è¡Œæ‘˜è¦",
      "rpt.companyProfile": "å…¬å¸æ¦‚å†µ",
      "rpt.productProfile": "äº§å“æ¦‚å†µ",
      "rpt.sourceMarket": "æ¥æºå¸‚åœº",
      "rpt.targetMarket": "ç›®æ ‡å¸‚åœº",
      "rpt.applicableRegulations": "é€‚ç”¨æ³•è§„",
      "rpt.complianceRequirements": "åˆè§„è¦æ±‚",
      "rpt.completedReqs": "å·²å®Œæˆçš„è¦æ±‚",
      "rpt.pendingReqs": "å¾…å¤„ç†çš„è¦æ±‚",
      "rpt.complianceGaps": "åˆè§„å·®è·",
      "rpt.riskAssessment": "é£Žé™©è¯„ä¼°",
      "rpt.businessImpact": "å•†ä¸šå½±å“",
      "rpt.estimatedCost": "é¢„è®¡æˆæœ¬",
      "rpt.estimatedTimeline": "é¢„è®¡æ—¶é—´è¡¨",
      "rpt.actionPlan": "å»ºè®®è¡ŒåŠ¨è®¡åˆ’",
      "rpt.readinessScore": "å¸‚åœºå‡†å¤‡åº¦è¯„åˆ†",
      "rpt.launchRecommendation": "å‘å¸ƒå»ºè®®",
      "rpt.regulatorySources": "ç›‘ç®¡æ¥æº",
      "rpt.timestamp": "åˆ†æžæ—¶é—´æˆ³",
      "rpt.noData": "æ²¡æœ‰å¯ç”¨çš„åˆ†æžæ•°æ®ï¼Œè¯·å…ˆè¿è¡Œå‘å¸ƒåˆ†æžã€‚",
      "rpt.generating": "æ­£åœ¨ç”ŸæˆæŠ¥å‘Š...",
      "rpt.failed": "æŠ¥å‘Šç”Ÿæˆå¤±è´¥ï¼Œè¯·é‡è¯•ã€‚",
      "rpt.retry": "é‡è¯•",
      "rpt.download": "ä¸‹è½½æŠ¥å‘Š",
      "rpt.print": "æ‰“å° / å¦å­˜ä¸ºPDF",
      "rpt.close": "å…³é—­",
      "rpt.company": "å…¬å¸",
      "rpt.product": "äº§å“",
      "rpt.origin": "åŽŸäº§å›½",
      "rpt.target": "ç›®æ ‡å¸‚åœº",
      "rpt.industry": "è¡Œä¸š",
      "rpt.priority": "ä¼˜å…ˆçº§",
      "rpt.status": "çŠ¶æ€",
      "rpt.authority": "ä¸»ç®¡æœºæž„",
      "rpt.dueDate": "æˆªæ­¢æ—¥æœŸ",
      "rpt.description": "æè¿°",
      "rpt.totalCost": "é¢„è®¡æ€»æˆæœ¬",
      "rpt.totalTime": "é¢„è®¡æ€»æ—¶é—´",
      "rpt.riskLevel": "é£Žé™©ç­‰çº§",
      "rpt.gaps": "æœªè§£å†³çš„å·®è·",
      "rpt.critical": "ç´§æ€¥",
      "rpt.important": "é‡è¦",
      "rpt.standard": "æ ‡å‡†",
      "rpt.pending": "å¾…å¤„ç†",
      "rpt.inProgress": "è¿›è¡Œä¸­",
      "rpt.done": "å·²å®Œæˆ",
      "rpt.notApplicable": "ä¸é€‚ç”¨",
      "rpt.action": "è¡ŒåŠ¨",
      "rpt.estimatedDays": "é¢„è®¡å¤©æ•°",
      "rpt.estimatedEur": "é¢„è®¡æˆæœ¬ï¼ˆEURï¼‰",
      "rpt.owner": "è´£ä»»æ–¹",
      "rpt.category": "ç±»åˆ«",
      "rpt.source": "æ¥æº",
      "rpt.code": "å‚è€ƒä»£ç ",
      "rpt.date": "æ—¥æœŸ",
      "rpt.kind": "ç±»åž‹",
      "rpt.summary": "æ‘˜è¦",
      "rpt.proceed": "ç»§ç»­å‘å¸ƒ",
      "rpt.conditional": "æœ‰æ¡ä»¶å‘å¸ƒ",
      "rpt.delay": "å»¶è¿Ÿå‘å¸ƒ",
      "rpt.prerequisites": "å…ˆå†³æ¡ä»¶",
      "rpt.verdict": "ç»“è®º",
      "rpt.timeline": "è¾¾åˆ°å®Œå…¨å‡†å¤‡çš„æ—¶é—´è¡¨",
      "rpt.disclaimer": "æœ¬æŠ¥å‘ŠåŒ…å«åŸºäºŽç›‘ç®¡æƒ…æŠ¥æ•°æ®çš„AIç”Ÿæˆåˆ†æžã€‚åœ¨åšå‡ºå•†ä¸šå†³ç­–ä¹‹å‰ï¼Œåº”é€šè¿‡å®˜æ–¹æ¥æºæ ¸å®žç›‘ç®¡ä¿¡æ¯ã€‚ReguLensä¸ä¿è¯ç›‘ç®¡æ•°æ®çš„å®Œæ•´æ€§æˆ–å‡†ç¡®æ€§ã€‚",
      "rpt.page": "é¡µ",
      "rpt.of": "/",
      "disclaimer.dashboard": "ReguLensæä¾›ç›‘ç®¡æƒ…æŠ¥å’Œå†³ç­–æ”¯æŒï¼›æœ€ç»ˆçš„æ³•å¾‹/åˆè§„å†³å®šåº”ç”±åˆæ ¼çš„ä¸“ä¸šäººå‘˜æˆ–æƒå¨ç›‘ç®¡æ¥æºè¿›è¡Œæ ¸å®žã€‚",
      "ai.agents": "æ™ºèƒ½ä½“",
      "ai.completed": "å·²å®Œæˆ",
      "ai.failed": "å¤±è´¥",
      "ai.totalTime": "æ€»æ—¶é—´",
      "ai.pending": "å¾…å¤„ç†",
      "ai.running": "è¿è¡Œä¸­",
      "ai.completedStatus": "å·²å®Œæˆ",
      "ai.failedStatus": "å¤±è´¥",
      "ai.input": "è¾“å…¥",
      "ai.output": "è¾“å‡º",
      "ai.sources": "æ¥æº",
      "ai.retry": "é‡è¯•",
      "ai.emptyTitle": "æ— æ™ºèƒ½ä½“æ´»åŠ¨",
      "ai.emptyDesc": "ä»Ž<strong>æˆ‘å¯ä»¥å‘å¸ƒå—ï¼Ÿ</strong>é¡µé¢è¿è¡Œå‘å¸ƒåˆ†æžä»¥æ¿€æ´»å¤šæ™ºèƒ½ä½“æƒ…æŠ¥ç®¡çº¿ã€‚",
      "ai.startAnalysis": "å¼€å§‹åˆ†æž",
    },
    ko: {
      "nav.dashboard": "ëŒ€ì‹œë³´ë“œ",
      "settings.title": "ì„¤ì •",
      "settings.general": "ì¼ë°˜",
      "settings.language": "ì–¸ì–´",
      "settings.density": "í‘œì‹œ ë°€ë„",
      "settings.theme": "í…Œë§ˆ",
      "settings.theme.light": "ë¼ì´íŠ¸",
      "settings.theme.dark": "ë‹¤í¬",
      "settings.account": "ê³„ì •",
      "settings.signedInAs": "ë¡œê·¸ì¸:",
      "settings.notSignedIn": "ë¡œê·¸ì¸ ì•ˆ ë¨",
      "settings.signIn": "ë¡œê·¸ì¸",
      "settings.signOut": "ë¡œê·¸ì•„ì›ƒ",
      "settings.aiEngine": "AI ì—”ì§„",
      "settings.checking": "í™•ì¸ ì¤‘â€¦",
      "settings.aiConnected": "ì—°ê²°ë¨ Â· {model}",
      "settings.aiDisconnected": "êµ¬ì„±ë˜ì—ˆì§€ë§Œ ì—°ê²° ë¶ˆê°€",
      "settings.aiNotConfigured": "AI ì—”ì§„ì´ êµ¬ì„±ë˜ì§€ ì•ŠìŒ",
      "settings.aiConnError": "AI ì—”ì§„ì— ì—°ê²°í•  ìˆ˜ ì—†ìŒ",
      "settings.aiRetryHint": "êµ¬ì„±ì„ í™•ì¸í•˜ê³  ë‹¤ì‹œ ì‹œë„í•˜ì„¸ìš”",
      "settings.retry": "ìž¬ì‹œë„",
      "settings.clearMemory": "ë©”ëª¨ë¦¬ ì§€ìš°ê¸°",
      "settings.memoryAlreadyEmpty": "ì§€ìš¸ ê²ƒì´ ì—†ìŠµë‹ˆë‹¤. ì €ìž¥ëœ ëŒ€í™”ê°€ ì—†ìŠµë‹ˆë‹¤.",
      "settings.memoryCleared": "ëŒ€í™” ë©”ëª¨ë¦¬ê°€ ì§€ì›Œì¡ŒìŠµë‹ˆë‹¤.",
      "settings.memoryClearError": "ë©”ëª¨ë¦¬ë¥¼ ì§€ìš¸ ìˆ˜ ì—†ìŠµë‹ˆë‹¤. ë‹¤ì‹œ ì‹œë„í•´ ì£¼ì„¸ìš”.",
      "profile.title": "í”„ë¡œí•„",
      "profile.guest": "ê²ŒìŠ¤íŠ¸",
      "confirm.title": "ëŒ€í™” ë©”ëª¨ë¦¬ë¥¼ ì§€ìš°ì‹œê² ìŠµë‹ˆê¹Œ?",
      "confirm.text": "ì´ ê¸°ê¸°ì™€ ê³„ì •ì˜ ëª¨ë“  ëŒ€í™”ê°€ ì˜êµ¬ì ìœ¼ë¡œ ì‚­ì œë˜ë©°, ì´ ìž‘ì—…ì€ ë˜ëŒë¦´ ìˆ˜ ì—†ìŠµë‹ˆë‹¤.",
      "confirm.cancel": "ì·¨ì†Œ",
      "confirm.clear": "ë©”ëª¨ë¦¬ ì§€ìš°ê¸°",
      "auth.close": "ë‹«ê¸°",
      "auth.welcomeBack": "ë‹¤ì‹œ ì˜¤ì‹  ê²ƒì„ í™˜ì˜í•©ë‹ˆë‹¤",
      "auth.loginSub": "ê³„ì†í•˜ë ¤ë©´ ë¡œê·¸ì¸í•˜ì„¸ìš”",
      "auth.createAccount": "ê³„ì • ë§Œë“¤ê¸°",
      "auth.createAccountSub": "ReguLens ê³„ì • ì„¤ì •",
      "auth.login": "ë¡œê·¸ì¸",
      "auth.signup": "ê³„ì • ë§Œë“¤ê¸°",
      "auth.name": "ì´ë¦„",
      "auth.email": "ì´ë©”ì¼",
      "auth.password": "ë¹„ë°€ë²ˆí˜¸",
      "auth.forgotPassword": "ë¹„ë°€ë²ˆí˜¸ë¥¼ ìžŠìœ¼ì…¨ë‚˜ìš”?",
      "auth.noAccount": "ê³„ì •ì´ ì—†ìœ¼ì‹ ê°€ìš”?",
      "auth.haveAccount": "ì´ë¯¸ ê³„ì •ì´ ìžˆìœ¼ì‹ ê°€ìš”?",
      "auth.or": "ë˜ëŠ”",
      "auth.continueGuest": "ê²ŒìŠ¤íŠ¸ë¡œ ê³„ì†",
      "auth.signingIn": "ë¡œê·¸ì¸ ì¤‘â€¦",
      "auth.signingUp": "ê³„ì • ìƒì„± ì¤‘â€¦",
      "auth.creatingAccount": "ê³„ì • ìƒì„± ì¤‘â€¦",
      "auth.requiredError": "ëª¨ë“  í•­ëª©ì„ ìž…ë ¥í•´ ì£¼ì„¸ìš”.",
      "auth.sendReset": "ìž¬ì„¤ì • ë§í¬ ë³´ë‚´ê¸°",
      "auth.backToSignIn": "ë¡œê·¸ì¸ìœ¼ë¡œ ëŒì•„ê°€ê¸°",
      "auth.resetSent": "ë¹„ë°€ë²ˆí˜¸ ìž¬ì„¤ì • ì´ë©”ì¼ì´ ì „ì†¡ë˜ì—ˆìŠµë‹ˆë‹¤.",
      "auth.signedIn": "{email}(ìœ¼)ë¡œ ë¡œê·¸ì¸ë¨",
      "auth.signedOut": "ë¡œê·¸ì•„ì›ƒë¨",
      "auth.guestSignedIn": "ê²ŒìŠ¤íŠ¸ë¡œ ê³„ì†",
      "auth.welcome": "í™˜ì˜í•©ë‹ˆë‹¤, {name}",
      "auth.error.invalidEmail": "ìœ íš¨í•œ ì´ë©”ì¼ ì£¼ì†Œë¥¼ ìž…ë ¥í•˜ì„¸ìš”.",
      "auth.error.weakPassword": "ë¹„ë°€ë²ˆí˜¸ëŠ” ìµœì†Œ 6ìž ì´ìƒì´ì–´ì•¼ í•©ë‹ˆë‹¤.",
      "auth.error.userNotFound": "ì´ ì´ë©”ì¼ë¡œ ë“±ë¡ëœ ê³„ì •ì„ ì°¾ì„ ìˆ˜ ì—†ìŠµë‹ˆë‹¤.",
      "auth.error.invalidCredential": "ì´ë©”ì¼ ë˜ëŠ” ë¹„ë°€ë²ˆí˜¸ê°€ ì˜¬ë°”ë¥´ì§€ ì•ŠìŠµë‹ˆë‹¤.",
      "auth.error.emailInUse": "ì´ ì´ë©”ì¼ì˜ ê³„ì •ì´ ì´ë¯¸ ì¡´ìž¬í•©ë‹ˆë‹¤.",
      "auth.error.network": "ë„¤íŠ¸ì›Œí¬ ì˜¤ë¥˜ìž…ë‹ˆë‹¤. ì—°ê²°ì„ í™•ì¸í•˜ì„¸ìš”.",
      "auth.error.popupClosed": "ë¡œê·¸ì¸ ì°½ì´ ë‹«í˜”ìŠµë‹ˆë‹¤.",
      "auth.error.popupBlocked": "íŒì—…ì´ ì°¨ë‹¨ë˜ì—ˆìŠµë‹ˆë‹¤. ë¡œê·¸ì¸í•˜ë ¤ë©´ íŒì—…ì„ í—ˆìš©í•˜ì„¸ìš”.",
      "auth.error.operationNotAllowed": "ì´ ë¡œê·¸ì¸ ë°©ë²•ì´ í™œì„±í™”ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤.",
      "auth.error.guestNotEnabled": "ê²ŒìŠ¤íŠ¸ ë¡œê·¸ì¸ì´ í™œì„±í™”ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤.",
      "auth.error.tooManyRequests": "ì‹œë„ íšŸìˆ˜ê°€ ë„ˆë¬´ ë§ŽìŠµë‹ˆë‹¤. ë‚˜ì¤‘ì— ë‹¤ì‹œ ì‹œë„í•´ ì£¼ì„¸ìš”.",
      "auth.error.userDisabled": "ì´ ê³„ì •ì´ ë¹„í™œì„±í™”ë˜ì—ˆìŠµë‹ˆë‹¤.",
      "auth.error.configError": "ì¸ì¦ì´ ì˜¬ë°”ë¥´ê²Œ êµ¬ì„±ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤.",
      "auth.error.generic": "ë¬¸ì œê°€ ë°œìƒí–ˆìŠµë‹ˆë‹¤. ë‹¤ì‹œ ì‹œë„í•´ ì£¼ì„¸ìš”.",
      "auth.error.notConfigured": "ReguLensê°€ ì•„ì§ ì¸ì¦ìš©ìœ¼ë¡œ êµ¬ì„±ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤.",
      "notif.title": "ì•Œë¦¼",
      "notif.markAll": "ëª¨ë‘ ì½ìŒìœ¼ë¡œ í‘œì‹œ",
      "notif.empty": "ëª¨ë‘ í™•ì¸ ì™„ë£Œ",
      "doc.download": "ë‹¤ìš´ë¡œë“œ",
      "doc.close": "ë‹«ê¸°",
      "doc.previewNone": "ì´ íŒŒì¼ ìœ í˜•ì˜ ë¯¸ë¦¬ë³´ê¸°ë¥¼ ì‚¬ìš©í•  ìˆ˜ ì—†ìŠµë‹ˆë‹¤.",
      "doc.uploaded": "\"{name}\"ì„(ë¥¼) ë¬¸ì„œ ë¼ì´ë¸ŒëŸ¬ë¦¬ì— ì—…ë¡œë“œí–ˆìŠµë‹ˆë‹¤",
      "doc.uploadedCount": "ë¼ì´ë¸ŒëŸ¬ë¦¬ì— {n}ê°œì˜ ë¬¸ì„œ",
      "req.priority": "ìš°ì„ ìˆœìœ„",
      "req.status": "ìƒíƒœ",
      "req.reopen": "ë‹¤ì‹œ ì—´ê¸°",
      "req.inProgress": "ì§„í–‰ ì¤‘ìœ¼ë¡œ í‘œì‹œ",
      "req.complete": "ì™„ë£Œë¡œ í‘œì‹œ",
      "req.done": "ì™„ë£Œ",
      "req.pending": "ëŒ€ê¸° ì¤‘",
      "req.progress": "ì§„í–‰ ì¤‘",
      "req.critical": "ê¸´ê¸‰",
      "req.important": "ì¤‘ìš”",
      "req.standard": "í‘œì¤€",
      "req.count": "{n}ê°œ í‘œì‹œ",
      "sim.results": "ì‹œë®¬ë ˆì´ì…˜ ê²°ê³¼",
      "sim.running": "ì‹œë®¬ë ˆì´ì…˜ ì‹¤í–‰ ì¤‘â€¦",
      "sim.done": "ì™„ë£Œ",
      "sim.reqs": "ì¶”ê°€ëœ ìš”êµ¬ì‚¬í•­",
      "sim.cost": "ì˜ˆìƒ ë¹„ìš© ì˜í–¥",
      "sim.days": "ì¼ì • ì˜í–¥",
      "call.title": "ì „í™” ì˜ˆì•½",
      "call.sub": "ì—°ë½ ë°©ë²•ì„ ì•Œë ¤ì£¼ì‹œë©´ ì „ë¬¸ê°€ê°€ ì¼ì •ì„ í™•ì¸í•©ë‹ˆë‹¤.",
      "call.email": "ì´ë©”ì¼",
      "call.time": "í¬ë§ ì‹œê°„",
      "call.invalid": "ìœ íš¨í•œ ì´ë©”ì¼ì„ ìž…ë ¥í•˜ì„¸ìš”",
      "call.sent": "ìš”ì²­ì´ ì „ì†¡ë˜ì—ˆìŠµë‹ˆë‹¤! ì „ë¬¸ê°€ê°€ ê³§ ì—°ë½ë“œë¦½ë‹ˆë‹¤.",
      "rpt.title": "ì‹œìž¥ ì¤€ë¹„ë„ ë° ê·œì œ ì¤€ìˆ˜ ë³´ê³ ì„œ",
      "rpt.generated": "ReguLensì—ì„œ ìƒì„±",
      "rpt.aiGenerated": "AI ìƒì„± ë¶„ì„",
      "rpt.regulatorySource": "ê·œì œ ì†ŒìŠ¤",
      "rpt.userInput": "ì‚¬ìš©ìž ì œê³µ ì •ë³´",
      "rpt.executiveSummary": "ìš”ì•½",
      "rpt.companyProfile": "íšŒì‚¬ í”„ë¡œí•„",
      "rpt.productProfile": "ì œí’ˆ í”„ë¡œí•„",
      "rpt.sourceMarket": "ì›ì‚°ì§€ ì‹œìž¥",
      "rpt.targetMarket": "ëŒ€ìƒ ì‹œìž¥",
      "rpt.applicableRegulations": "í•´ë‹¹ ê·œì œ",
      "rpt.complianceRequirements": "ì¤€ìˆ˜ ìš”êµ¬ì‚¬í•­",
      "rpt.completedReqs": "ì™„ë£Œëœ ìš”êµ¬ì‚¬í•­",
      "rpt.pendingReqs": "ëŒ€ê¸° ì¤‘ì¸ ìš”êµ¬ì‚¬í•­",
      "rpt.complianceGaps": "ì¤€ìˆ˜ ê²©ì°¨",
      "rpt.riskAssessment": "ìœ„í—˜ í‰ê°€",
      "rpt.businessImpact": "ë¹„ì¦ˆë‹ˆìŠ¤ ì˜í–¥",
      "rpt.estimatedCost": "ì˜ˆìƒ ë¹„ìš©",
      "rpt.estimatedTimeline": "ì˜ˆìƒ ì¼ì •",
      "rpt.actionPlan": "ê¶Œìž¥è¡ŒåŠ¨è®¡åˆ’",
      "rpt.readinessScore": "ì‹œìž¥ ì¤€ë¹„ë„ ì ìˆ˜",
      "rpt.launchRecommendation": "ì¶œì‹œ ê¶Œìž¥ì‚¬í•­",
      "rpt.regulatorySources": "ê·œì œ ì†ŒìŠ¤",
      "rpt.timestamp": "ë¶„ì„ íƒ€ìž„ìŠ¤íƒ¬í”„",
      "rpt.noData": "ë¶„ì„ ë°ì´í„°ê°€ ì—†ìŠµë‹ˆë‹¤. ë¨¼ì € ì¶œì‹œ ë¶„ì„ì„ ì‹¤í–‰í•˜ì„¸ìš”.",
      "rpt.generating": "ë³´ê³ ì„œ ìƒì„± ì¤‘...",
      "rpt.failed": "ë³´ê³ ì„œ ìƒì„±ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤. ë‹¤ì‹œ ì‹œë„í•´ ì£¼ì„¸ìš”.",
      "rpt.retry": "ìž¬ì‹œë„",
      "rpt.download": "ë³´ê³ ì„œ ë‹¤ìš´ë¡œë“œ",
      "rpt.print": "ì¸ì‡„ / PDFë¡œ ì €ìž¥",
      "rpt.close": "ë‹«ê¸°",
      "rpt.company": "íšŒì‚¬",
      "rpt.product": "ì œí’ˆ",
      "rpt.origin": "ì›ì‚°êµ­",
      "rpt.target": "ëŒ€ìƒ ì‹œìž¥",
      "rpt.industry": "ì‚°ì—…",
      "rpt.priority": "ìš°ì„ ìˆœìœ„",
      "rpt.status": "ìƒíƒœ",
      "rpt.authority": "ê´€í• ê¸°ê´€",
      "rpt.dueDate": "ë§ˆê°ì¼",
      "rpt.description": "ì„¤ëª…",
      "rpt.totalCost": "ì´ ì˜ˆìƒ ë¹„ìš©",
      "rpt.totalTime": "ì´ ì˜ˆìƒ ì‹œê°„",
      "rpt.riskLevel": "ìœ„í—˜ ìˆ˜ì¤€",
      "rpt.gaps": "ë¯¸í•´ê²° ê²©ì°¨",
      "rpt.critical": "ê¸´ê¸‰",
      "rpt.important": "ì¤‘ìš”",
      "rpt.standard": "í‘œì¤€",
      "rpt.pending": "ëŒ€ê¸° ì¤‘",
      "rpt.inProgress": "ì§„í–‰ ì¤‘",
      "rpt.done": "ì™„ë£Œ",
      "rpt.notApplicable": "í•´ë‹¹ ì—†ìŒ",
      "rpt.action": "ì¡°ì¹˜",
      "rpt.estimatedDays": "ì˜ˆìƒ ì¼ìˆ˜",
      "rpt.estimatedEur": "ì˜ˆìƒ ë¹„ìš© (EUR)",
      "rpt.owner": "ë‹´ë‹¹ìž",
      "rpt.category": "ì¹´í…Œê³ ë¦¬",
      "rpt.source": "ì†ŒìŠ¤",
      "rpt.code": "ì°¸ì¡° ì½”ë“œ",
      "rpt.date": "ë‚ ì§œ",
      "rpt.kind": "ìœ í˜•",
      "rpt.summary": "ìš”ì•½",
      "rpt.proceed": "ì¶œì‹œ ì§„í–‰",
      "rpt.conditional": "ì¡°ê±´ë¶€ ì¶œì‹œ",
      "rpt.delay": "ì¶œì‹œ ì—°ê¸°",
      "rpt.prerequisites": "ì „ì œ ì¡°ê±´",
      "rpt.verdict": "ê²°ë¡ ",
      "rpt.timeline": "ì™„ì „í•œ ì¤€ë¹„ê¹Œì§€ì˜ ì¼ì •",
      "rpt.disclaimer": "ì´ ë³´ê³ ì„œì—ëŠ” ê·œì œ ì¸í…”ë¦¬ì§€ì–¸ìŠ¤ ë°ì´í„°ë¥¼ ê¸°ë°˜ìœ¼ë¡œ í•œ AI ìƒì„± ë¶„ì„ì´ í¬í•¨ë˜ì–´ ìžˆìŠµë‹ˆë‹¤. ë¹„ì¦ˆë‹ˆìŠ¤ ê²°ì •ì„ ë‚´ë¦¬ê¸° ì „ì— ê³µì‹ ì†ŒìŠ¤ì—ì„œ ê·œì œ ì •ë³´ë¥¼ í™•ì¸í•´ì•¼ í•©ë‹ˆë‹¤. ReguLensëŠ” ê·œì œ ë°ì´í„°ì˜ ì™„ì „ì„±ì´ë‚˜ ì •í™•ì„±ì„ ë³´ìž¥í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤.",
      "rpt.page": "íŽ˜ì´ì§€",
      "rpt.of": "/",
      "disclaimer.dashboard": "ReguLensëŠ” ê·œì œ ì¸í…”ë¦¬ì§€ì–¸ìŠ¤ì™€ ì˜ì‚¬ê²°ì • ì§€ì›ì„ ì œê³µí•©ë‹ˆë‹¤. ìµœì¢… ë²•ì /ì»´í”Œë¼ì´ì–¸ìŠ¤ ê²°ì •ì€ ìžê²©ì„ ê°–ì¶˜ ì „ë¬¸ê°€ë‚˜ ê¶Œìœ„ ìžˆëŠ” ê·œì œ ì†ŒìŠ¤ë¡œ í™•ì¸í•´ì•¼ í•©ë‹ˆë‹¤.",
      "ai.agents": "ì—ì´ì „íŠ¸",
      "ai.completed": "ì™„ë£Œ",
      "ai.failed": "ì‹¤íŒ¨",
      "ai.totalTime": "ì´ ì‹œê°„",
      "ai.pending": "ëŒ€ê¸° ì¤‘",
      "ai.running": "ì‹¤í–‰ ì¤‘",
      "ai.completedStatus": "ì™„ë£Œ",
      "ai.failedStatus": "ì‹¤íŒ¨",
      "ai.input": "ìž…ë ¥",
      "ai.output": "ì¶œë ¥",
      "ai.sources": "ì†ŒìŠ¤",
      "ai.retry": "ìž¬ì‹œë„",
      "ai.emptyTitle": "ì—ì´ì „íŠ¸ í™œë™ ì—†ìŒ",
      "ai.emptyDesc": "<strong>ì¶œì‹œí•  ìˆ˜ ìžˆë‚˜ìš”?</strong> íŽ˜ì´ì§€ì—ì„œ ì¶œì‹œ ë¶„ì„ì„ ì‹¤í–‰í•˜ì—¬ ë©€í‹°ì—ì´ì „íŠ¸ ì¸í…”ë¦¬ì§€ì–¸ìŠ¤ íŒŒì´í”„ë¼ì¸ì„ í™œì„±í™”í•˜ì„¸ìš”.",
      "ai.startAnalysis": "ë¶„ì„ ì‹œìž‘",
    },
    mr: {
      "nav.dashboard": "à¤¡à¥…à¤¶à¤¬à¥‹à¤°à¥à¤¡",
      "settings.title": "à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤œ",
      "settings.general": "à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯",
      "settings.language": "à¤­à¤¾à¤·à¤¾",
      "settings.density": "à¤˜à¤¨à¤¤à¤¾",
      "settings.theme": "à¤¥à¥€à¤®",
      "settings.theme.light": "à¤²à¤¾à¤‡à¤Ÿ",
      "settings.theme.dark": "à¤¡à¤¾à¤°à¥à¤•",
      "settings.account": "à¤–à¤¾à¤¤à¥‡",
      "settings.signedInAs": "à¤¯à¤¾à¤®à¤§à¥à¤¯à¥‡ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨",
      "settings.notSignedIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤¨à¤¾à¤¹à¥€",
      "settings.signIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨",
      "settings.signOut": "à¤¸à¤¾à¤‡à¤¨ à¤†à¤‰à¤Ÿ",
      "settings.aiEngine": "AI à¤‡à¤‚à¤œà¤¿à¤¨",
      "settings.checking": "à¤¤à¤ªà¤¾à¤¸à¤£à¥€â€¦",
      "settings.aiConnected": "à¤œà¥‹à¤¡à¤²à¥‡à¤²à¥‡ Â· {model}",
      "settings.aiDisconnected": "à¤•à¥‰à¤¨à¥à¤«à¤¿à¤—à¤° à¤•à¥‡à¤²à¥‡à¤²à¥‡ à¤ªà¤£ à¤ªà¥‹à¤¹à¥‹à¤šà¤¤à¤¾ à¤¯à¥‡à¤¤ à¤¨à¤¾à¤¹à¥€",
      "settings.aiNotConfigured": "AI à¤‡à¤‚à¤œà¤¿à¤¨ à¤•à¥‰à¤¨à¥à¤«à¤¿à¤—à¤° à¤•à¥‡à¤²à¥‡à¤²à¥€ à¤¨à¤¾à¤¹à¥€",
      "settings.aiConnError": "AI à¤‡à¤‚à¤œà¤¿à¤¨à¤¶à¥€ à¤•à¤¨à¥‡à¤•à¥à¤Ÿ à¤•à¤°à¤¤à¤¾ à¤†à¤²à¥‡ à¤¨à¤¾à¤¹à¥€",
      "settings.aiRetryHint": "à¤¤à¥à¤®à¤šà¥€ à¤•à¥‰à¤¨à¥à¤«à¤¿à¤—à¤°à¥‡à¤¶à¤¨ à¤¤à¤ªà¤¾à¤¸à¤¾ à¤†à¤£à¤¿ à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾",
      "settings.retry": "à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾",
      "settings.clearMemory": "à¤®à¥‡à¤®à¤°à¥€ à¤¸à¤¾à¤« à¤•à¤°à¤¾",
      "settings.memoryAlreadyEmpty": "à¤¸à¤¾à¤« à¤•à¤°à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤°à¤–à¥‡ à¤•à¤¾à¤¹à¥€ à¤¨à¤¾à¤¹à¥€ â€” à¤œà¤¤à¤¨ à¤•à¥‡à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¸à¤‚à¤µà¤¾à¤¦ à¤¨à¤¾à¤¹à¥€à¤¤.",
      "settings.memoryCleared": "à¤¸à¤‚à¤µà¤¾à¤¦ à¤®à¥‡à¤®à¤°à¥€ à¤¸à¤¾à¤« à¤•à¥‡à¤²à¥€.",
      "settings.memoryClearError": "à¤®à¥‡à¤®à¤°à¥€ à¤¸à¤¾à¤« à¤•à¤°à¤¤à¤¾ à¤†à¤²à¥€ à¤¨à¤¾à¤¹à¥€. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾.",
      "profile.title": "à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²",
      "profile.guest": "à¤ªà¤¾à¤¹à¥à¤£à¤¾",
      "confirm.title": "à¤¸à¤‚à¤µà¤¾à¤¦ à¤®à¥‡à¤®à¤°à¥€ à¤¸à¤¾à¤« à¤•à¤°à¤¾à¤¯à¤šà¥€?",
      "confirm.text": "à¤¹à¥‡ à¤¯à¤¾ à¤‰à¤ªà¤•à¤°à¤£à¤¾à¤µà¤°à¥‚à¤¨ à¤†à¤£à¤¿ à¤–à¤¾à¤¤à¥à¤¯à¤¾à¤¤à¥€à¤² à¤¸à¤°à¥à¤µ à¤¸à¤‚à¤µà¤¾à¤¦ à¤•à¤¾à¤¯à¤®à¤šà¥‡ à¤¹à¤Ÿà¤µà¥‡à¤². à¤¹à¥€ à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤ªà¤°à¤¤ à¤•à¤°à¤¤à¤¾ à¤¯à¥‡à¤£à¤¾à¤° à¤¨à¤¾à¤¹à¥€.",
      "confirm.cancel": "à¤°à¤¦à¥à¤¦ à¤•à¤°à¤¾",
      "confirm.clear": "à¤®à¥‡à¤®à¤°à¥€ à¤¸à¤¾à¤« à¤•à¤°à¤¾",
      "auth.close": "à¤¬à¤‚à¤¦ à¤•à¤°à¤¾",
      "auth.welcomeBack": "à¤ªà¤°à¤¤ à¤†à¤ªà¤²à¥‡ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤†à¤¹à¥‡",
      "auth.loginSub": "à¤¸à¥à¤°à¥‚ à¤ à¥‡à¤µà¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤•à¤°à¤¾",
      "auth.createAccount": "à¤–à¤¾à¤¤à¥‡ à¤¤à¤¯à¤¾à¤° à¤•à¤°à¤¾",
      "auth.createAccountSub": "à¤¤à¥à¤®à¤šà¥‡ ReguLens à¤–à¤¾à¤¤à¥‡ à¤¸à¥‡à¤Ÿ à¤•à¤°à¤¾",
      "auth.login": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨",
      "auth.signup": "à¤–à¤¾à¤¤à¥‡ à¤¤à¤¯à¤¾à¤° à¤•à¤°à¤¾",
      "auth.name": "à¤¨à¤¾à¤µ",
      "auth.email": "à¤ˆà¤®à¥‡à¤²",
      "auth.password": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡",
      "auth.forgotPassword": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡ à¤µà¤¿à¤¸à¤°à¤²à¤¾à¤¤?",
      "auth.noAccount": "à¤–à¤¾à¤¤à¥‡ à¤¨à¤¾à¤¹à¥€?",
      "auth.haveAccount": "à¤†à¤§à¥€à¤š à¤–à¤¾à¤¤à¥‡ à¤†à¤¹à¥‡?",
      "auth.or": "à¤•à¤¿à¤‚à¤µà¤¾",
      "auth.continueGuest": "à¤ªà¤¾à¤¹à¥à¤£à¤¾ à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤¸à¥à¤°à¥‚ à¤ à¥‡à¤µà¤¾",
      "auth.signingIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤¹à¥‹à¤¤ à¤†à¤¹à¥‡â€¦",
      "auth.signingUp": "à¤–à¤¾à¤¤à¥‡ à¤¤à¤¯à¤¾à¤° à¤¹à¥‹à¤¤ à¤†à¤¹à¥‡â€¦",
      "auth.creatingAccount": "à¤–à¤¾à¤¤à¥‡ à¤¤à¤¯à¤¾à¤° à¤¹à¥‹à¤¤ à¤†à¤¹à¥‡â€¦",
      "auth.requiredError": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¸à¤°à¥à¤µ à¤«à¥€à¤²à¥à¤¡ à¤­à¤°à¤¾.",
      "auth.sendReset": "à¤°à¥€à¤¸à¥‡à¤Ÿ à¤²à¤¿à¤‚à¤• à¤ªà¤¾à¤ à¤µà¤¾",
      "auth.backToSignIn": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨à¤µà¤° à¤ªà¤°à¤¤",
      "auth.resetSent": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡ à¤°à¥€à¤¸à¥‡à¤Ÿ à¤ˆà¤®à¥‡à¤² à¤ªà¤¾à¤ à¤µà¤²à¤¾.",
      "auth.signedIn": "{email} à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨",
      "auth.signedOut": "à¤¸à¤¾à¤‡à¤¨ à¤†à¤‰à¤Ÿ",
      "auth.guestSignedIn": "à¤ªà¤¾à¤¹à¥à¤£à¤¾ à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤¸à¥à¤°à¥‚ à¤ à¥‡à¤µà¤¤ à¤†à¤¹à¥‡",
      "auth.welcome": "à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤†à¤¹à¥‡, {name}",
      "auth.error.invalidEmail": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤µà¥ˆà¤§ à¤ˆà¤®à¥‡à¤² à¤ªà¤¤à¥à¤¤à¤¾ à¤ªà¥à¤°à¤µà¤¿à¤·à¥à¤Ÿ à¤•à¤°à¤¾.",
      "auth.error.weakPassword": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡ à¤•à¤¿à¤®à¤¾à¤¨ 6 à¤…à¤•à¥à¤·à¤°à¤¾à¤‚à¤šà¤¾ à¤…à¤¸à¤£à¥‡ à¤†à¤µà¤¶à¥à¤¯à¤• à¤†à¤¹à¥‡.",
      "auth.error.userNotFound": "à¤¯à¤¾ à¤ˆà¤®à¥‡à¤²à¤¸à¤¹ à¤–à¤¾à¤¤à¥‡ à¤¸à¤¾à¤ªà¤¡à¤²à¥‡ à¤¨à¤¾à¤¹à¥€.",
      "auth.error.invalidCredential": "à¤ˆà¤®à¥‡à¤² à¤•à¤¿à¤‚à¤µà¤¾ à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡ à¤šà¥à¤•à¥€à¤šà¤¾ à¤†à¤¹à¥‡.",
      "auth.error.emailInUse": "à¤¯à¤¾ à¤ˆà¤®à¥‡à¤²à¤¸à¤¹ à¤–à¤¾à¤¤à¥‡ à¤†à¤§à¥€à¤ªà¤¾à¤¸à¥‚à¤¨ à¤…à¤¸à¥à¤¤à¤¿à¤¤à¥à¤µà¤¾à¤¤ à¤†à¤¹à¥‡.",
      "auth.error.network": "à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤• à¤¤à¥à¤°à¥à¤Ÿà¥€. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¤à¥à¤®à¤šà¥‡ à¤•à¤¨à¥‡à¤•à¥à¤¶à¤¨ à¤¤à¤ªà¤¾à¤¸à¤¾.",
      "auth.error.popupClosed": "à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤µà¤¿à¤‚à¤¡à¥‹ à¤¬à¤‚à¤¦ à¤•à¥‡à¤²à¥€.",
      "auth.error.popupBlocked": "à¤ªà¥‰à¤ªà¤…à¤ª à¤…à¤µà¤°à¥‹à¤§à¤¿à¤¤. à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤•à¤°à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤ªà¥‰à¤ªà¤…à¤ªà¤²à¤¾ à¤…à¤¨à¥à¤®à¤¤à¥€ à¤¦à¥à¤¯à¤¾.",
      "auth.error.operationNotAllowed": "à¤¹à¤¾ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤ªà¥à¤°à¤•à¤¾à¤° à¤¸à¤•à¥à¤·à¤® à¤¨à¤¾à¤¹à¥€.",
      "auth.error.guestNotEnabled": "à¤ªà¤¾à¤¹à¥à¤£à¤¾ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤¸à¤•à¥à¤·à¤® à¤¨à¤¾à¤¹à¥€.",
      "auth.error.tooManyRequests": "à¤–à¥‚à¤ª à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¨à¤‚à¤¤à¤° à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾.",
      "auth.error.userDisabled": "à¤¹à¥‡ à¤–à¤¾à¤¤à¥‡ à¤…à¤•à¥à¤·à¤® à¤•à¥‡à¤²à¥‡ à¤†à¤¹à¥‡.",
      "auth.error.configError": "à¤ªà¥à¤°à¤®à¤¾à¤£à¥€à¤•à¤°à¤£ à¤¯à¥‹à¤—à¥à¤¯à¤°à¤¿à¤¤à¥à¤¯à¤¾ à¤•à¥‰à¤¨à¥à¤«à¤¿à¤—à¤° à¤•à¥‡à¤²à¥‡à¤²à¥‡ à¤¨à¤¾à¤¹à¥€.",
      "auth.error.generic": "à¤•à¤¾à¤¹à¥€à¤¤à¤°à¥€ à¤šà¥‚à¤• à¤à¤¾à¤²à¥€. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾.",
      "auth.error.notConfigured": "ReguLens à¤…à¤¦à¥à¤¯à¤¾à¤ª à¤ªà¥à¤°à¤®à¤¾à¤£à¥€à¤•à¤°à¤£à¤¾à¤¸à¤¾à¤ à¥€ à¤•à¥‰à¤¨à¥à¤«à¤¿à¤—à¤° à¤•à¥‡à¤²à¥‡à¤²à¥‡ à¤¨à¤¾à¤¹à¥€.",
      "notif.title": "à¤¸à¥‚à¤šà¤¨à¤¾",
      "notif.markAll": "à¤¸à¤°à¥à¤µ à¤µà¤¾à¤šà¤²à¥‡à¤²à¥‡ à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤šà¤¿à¤¨à¥à¤¹à¤¾à¤‚à¤•à¤¿à¤¤ à¤•à¤°à¤¾",
      "notif.empty": "à¤¸à¤°à¥à¤µ à¤ªà¥‚à¤°à¥à¤£ à¤à¤¾à¤²à¥‡",
      "doc.download": "à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡",
      "doc.close": "à¤¬à¤‚à¤¦ à¤•à¤°à¤¾",
      "doc.previewNone": "à¤¯à¤¾ à¤«à¤¾à¤‡à¤² à¤ªà¥à¤°à¤•à¤¾à¤°à¤¾à¤¸à¤¾à¤ à¥€ à¤ªà¥‚à¤°à¥à¤µà¤¾à¤µà¤²à¥‹à¤•à¤¨ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¾à¤¹à¥€.",
      "doc.uploaded": "\"{name}\" à¤¡à¥‰à¤•à¥à¤¯à¥à¤®à¥‡à¤‚à¤Ÿ à¤²à¤¾à¤¯à¤¬à¥à¤°à¤°à¥€à¤®à¤§à¥à¤¯à¥‡ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¥‡à¤²à¥‡",
      "doc.uploadedCount": "à¤²à¤¾à¤¯à¤¬à¥à¤°à¤°à¥€à¤®à¤§à¥à¤¯à¥‡ {n} à¤¦à¤¸à¥à¤¤à¤à¤µà¤œ",
      "req.priority": "à¤ªà¥à¤°à¤¾à¤§à¤¾à¤¨à¥à¤¯",
      "req.status": "à¤¸à¥à¤¥à¤¿à¤¤à¥€",
      "req.reopen": "à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤‰à¤˜à¤¡à¤¾",
      "req.inProgress": "à¤ªà¥à¤°à¤—à¤¤à¥€à¤®à¤§à¥à¤¯à¥‡ à¤šà¤¿à¤¨à¥à¤¹à¤¾à¤‚à¤•à¤¿à¤¤ à¤•à¤°à¤¾",
      "req.complete": "à¤ªà¥‚à¤°à¥à¤£ à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤šà¤¿à¤¨à¥à¤¹à¤¾à¤‚à¤•à¤¿à¤¤ à¤•à¤°à¤¾",
      "req.done": "à¤ªà¥‚à¤°à¥à¤£",
      "req.pending": "à¤ªà¥à¤°à¤²à¤‚à¤¬à¤¿à¤¤",
      "req.progress": "à¤ªà¥à¤°à¤—à¤¤à¥€à¤®à¤§à¥à¤¯à¥‡",
      "req.critical": "à¤¤à¤¾à¤¤à¤¡à¥€à¤šà¥‡",
      "req.important": "à¤®à¤¹à¤¤à¥à¤¤à¥à¤µà¤¾à¤šà¥‡",
      "req.standard": "à¤®à¤¾à¤¨à¤•",
      "req.count": "{n} à¤¦à¤°à¥à¤¶à¤µà¤²à¥‡",
      "sim.results": "à¤¸à¤¿à¤®à¥à¤¯à¥à¤²à¥‡à¤¶à¤¨ à¤ªà¤°à¤¿à¤£à¤¾à¤®",
      "sim.running": "à¤¸à¤¿à¤®à¥à¤¯à¥à¤²à¥‡à¤¶à¤¨ à¤šà¤¾à¤²à¥‚â€¦",
      "sim.done": "à¤ªà¥‚à¤°à¥à¤£",
      "sim.reqs": "à¤œà¥‹à¤¡à¤²à¥‡à¤²à¥€ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾",
      "sim.cost": "à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤–à¤°à¥à¤š à¤ªà¤°à¤¿à¤£à¤¾à¤®",
      "sim.days": "à¤µà¥‡à¤³à¤¾à¤ªà¤¤à¥à¤°à¤• à¤ªà¤°à¤¿à¤£à¤¾à¤®",
      "call.title": "à¤•à¥‰à¤² à¤¬à¥à¤• à¤•à¤°à¤¾",
      "call.sub": "à¤†à¤®à¥à¤¹à¥€ à¤¤à¥à¤®à¥à¤¹à¤¾à¤²à¤¾ à¤•à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‚ à¤¤à¥‡ à¤¸à¤¾à¤‚à¤—à¤¾ à¤†à¤£à¤¿ à¤†à¤®à¤šà¤¾ à¤…à¤¨à¥à¤°à¥‚à¤ªà¤¤à¤¾ à¤¤à¤œà¥à¤œà¥à¤ž à¤µà¥‡à¤³ à¤ªà¤•à¥à¤•à¥€ à¤•à¤°à¥‡à¤².",
      "call.email": "à¤¤à¥à¤®à¤šà¤¾ à¤ˆà¤®à¥‡à¤²",
      "call.time": "à¤ªà¤¸à¤‚à¤¤à¥€à¤šà¤¾ à¤µà¥‡à¤³",
      "call.invalid": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤µà¥ˆà¤§ à¤ˆà¤®à¥‡à¤² à¤ªà¥à¤°à¤µà¤¿à¤·à¥à¤Ÿ à¤•à¤°à¤¾",
      "call.sent": "à¤µà¤¿à¤¨à¤‚à¤¤à¥€ à¤ªà¤¾à¤ à¤µà¤²à¥€! à¤†à¤®à¤šà¤¾ à¤¤à¤œà¥à¤œà¥à¤ž à¤²à¤µà¤•à¤°à¤š à¤¤à¥à¤®à¤šà¥à¤¯à¤¾à¤¶à¥€ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤¸à¤¾à¤§à¥‡à¤².",
      "rpt.title": "à¤¬à¤¾à¤œà¤¾à¤° à¤¤à¤¯à¤¾à¤°à¥€ à¤†à¤£à¤¿ à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤…à¤¨à¥à¤°à¥‚à¤ªà¤¤à¤¾ à¤…à¤¹à¤µà¤¾à¤²",
      "rpt.generated": "ReguLens à¤¨à¥‡ à¤¤à¤¯à¤¾à¤° à¤•à¥‡à¤²à¤¾",
      "rpt.aiGenerated": "AI-à¤¨à¤¿à¤°à¥à¤®à¤¿à¤¤ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
      "rpt.regulatorySource": "à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¸à¥à¤°à¥‹à¤¤",
      "rpt.userInput": "à¤µà¤¾à¤ªà¤°à¤•à¤°à¥à¤¤à¥à¤¯à¤¾à¤¨à¥‡ à¤¦à¤¿à¤²à¥‡à¤²à¥€ à¤®à¤¾à¤¹à¤¿à¤¤à¥€",
      "rpt.executiveSummary": "à¤•à¤¾à¤°à¥à¤¯à¤•à¤¾à¤°à¥€ à¤¸à¤¾à¤°à¤¾à¤‚à¤¶",
      "rpt.companyProfile": "à¤•à¤‚à¤ªà¤¨à¥€ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²",
      "rpt.productProfile": "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²",
      "rpt.sourceMarket": "à¤¸à¥à¤°à¥‹à¤¤ à¤¬à¤¾à¤œà¤¾à¤°",
      "rpt.targetMarket": "à¤²à¤•à¥à¤·à¥à¤¯ à¤¬à¤¾à¤œà¤¾à¤°",
      "rpt.applicableRegulations": "à¤²à¤¾à¤—à¥‚ à¤¨à¤¿à¤¯à¤®à¤¨",
      "rpt.complianceRequirements": "à¤…à¤¨à¥à¤°à¥‚à¤ªà¤¤à¤¾ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾",
      "rpt.completedReqs": "à¤ªà¥‚à¤°à¥à¤£ à¤à¤¾à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾",
      "rpt.pendingReqs": "à¤ªà¥à¤°à¤²à¤‚à¤¬à¤¿à¤¤ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾",
      "rpt.complianceGaps": "à¤…à¤¨à¥à¤°à¥‚à¤ªà¤¤à¤¾ à¤¤à¤°à¥€",
      "rpt.riskAssessment": "à¤§à¥‹à¤•à¤¾ à¤®à¥‚à¤²à¥à¤¯à¤¾à¤‚à¤•à¤¨",
      "rpt.businessImpact": "à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤ªà¤°à¤¿à¤£à¤¾à¤®",
      "rpt.estimatedCost": "à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤–à¤°à¥à¤š",
      "rpt.estimatedTimeline": "à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤µà¥‡à¤³à¤¾à¤ªà¤¤à¥à¤°à¤•",
      "rpt.actionPlan": "à¤¶à¤¿à¤«à¤¾à¤°à¤¸ à¤•à¥‡à¤²à¥‡à¤²à¥€ à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤¯à¥‹à¤œà¤¨à¤¾",
      "rpt.readinessScore": "à¤¬à¤¾à¤œà¤¾à¤° à¤¤à¤¯à¤¾à¤°à¥€ à¤¸à¥à¤•à¥‹à¤…à¤°",
      "rpt.launchRecommendation": "à¤¸à¥à¤°à¥‚à¤µà¤¾à¤¤ à¤¶à¤¿à¤«à¤¾à¤°à¤¸",
      "rpt.regulatorySources": "à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¸à¥à¤°à¥‹à¤¤",
      "rpt.timestamp": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤µà¥‡à¤³à¤¾à¤šà¤¿à¤¨à¥à¤¹",
      "rpt.noData": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¡à¥‡à¤Ÿà¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¾à¤¹à¥€. à¤ªà¥à¤°à¤¥à¤® à¤¸à¥à¤°à¥‚à¤µà¤¾à¤¤ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤šà¤¾à¤²à¤µà¤¾.",
      "rpt.generating": "à¤…à¤¹à¤µà¤¾à¤² à¤¤à¤¯à¤¾à¤° à¤¹à¥‹à¤¤ à¤†à¤¹à¥‡...",
      "rpt.failed": "à¤…à¤¹à¤µà¤¾à¤² à¤¤à¤¯à¤¾à¤° à¤•à¤°à¤£à¥à¤¯à¤¾à¤¤ à¤…à¤ªà¤¯à¤¶. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾.",
      "rpt.retry": "à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾",
      "rpt.download": "à¤…à¤¹à¤µà¤¾à¤² à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ à¤•à¤°à¤¾",
      "rpt.print": "à¤ªà¥à¤°à¤¿à¤‚à¤Ÿ / PDF à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤œà¤¤à¤¨ à¤•à¤°à¤¾",
      "rpt.close": "à¤¬à¤‚à¤¦ à¤•à¤°à¤¾",
      "rpt.company": "à¤•à¤‚à¤ªà¤¨à¥€",
      "rpt.product": "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨",
      "rpt.origin": "à¤®à¥‚à¤³ à¤¦à¥‡à¤¶",
      "rpt.target": "à¤²à¤•à¥à¤·à¥à¤¯ à¤¬à¤¾à¤œà¤¾à¤°",
      "rpt.industry": "à¤‰à¤¦à¥à¤¯à¥‹à¤—",
      "rpt.priority": "à¤ªà¥à¤°à¤¾à¤§à¤¾à¤¨à¥à¤¯",
      "rpt.status": "à¤¸à¥à¤¥à¤¿à¤¤à¥€",
      "rpt.authority": "à¤…à¤§à¤¿à¤•à¤¾à¤°",
      "rpt.dueDate": "à¤¦à¥‡à¤¯ à¤¤à¤¾à¤°à¥€à¤–",
      "rpt.description": "à¤µà¤°à¥à¤£à¤¨",
      "rpt.totalTotal": "à¤à¤•à¥‚à¤£ à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤–à¤°à¥à¤š",
      "rpt.totalTime": "à¤à¤•à¥‚à¤£ à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤µà¥‡à¤³",
      "rpt.riskLevel": "à¤§à¥‹à¤•à¤¾ à¤¸à¥à¤¤à¤°",
      "rpt.gaps": "à¤‰à¤˜à¤¡à¥à¤¯à¤¾ à¤¤à¤°à¥€",
      "rpt.critical": "à¤¤à¤¾à¤¤à¤¡à¥€à¤šà¥‡",
      "rpt.important": "à¤®à¤¹à¤¤à¥à¤¤à¥à¤µà¤¾à¤šà¥‡",
      "rpt.standard": "à¤®à¤¾à¤¨à¤•",
      "rpt.pending": "à¤ªà¥à¤°à¤²à¤‚à¤¬à¤¿à¤¤",
      "rpt.inProgress": "à¤ªà¥à¤°à¤—à¤¤à¥€à¤®à¤§à¥à¤¯à¥‡",
      "rpt.done": "à¤ªà¥‚à¤°à¥à¤£",
      "rpt.notApplicable": "à¤²à¤¾à¤—à¥‚ à¤¨à¤¾à¤¹à¥€",
      "rpt.action": "à¤•à¥à¤°à¤¿à¤¯à¤¾",
      "rpt.estimatedDays": "à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤¦à¤¿à¤µà¤¸",
      "rpt.estimatedEur": "à¤…à¤‚à¤¦à¤¾à¤œà¥‡ à¤–à¤°à¥à¤š (EUR)",
      "rpt.owner": "à¤œà¤¬à¤¾à¤¬à¤¦à¤¾à¤° à¤ªà¤•à¥à¤·",
      "rpt.category": "à¤µà¤°à¥à¤—",
      "rpt.source": "à¤¸à¥à¤°à¥‹à¤¤",
      "rpt.code": "à¤¸à¤‚à¤¦à¤°à¥à¤­ à¤•à¥‹à¤¡",
      "rpt.date": "à¤¤à¤¾à¤°à¥€à¤–",
      "rpt.kind": "à¤ªà¥à¤°à¤•à¤¾à¤°",
      "rpt.summary": "à¤¸à¤¾à¤°à¤¾à¤‚à¤¶",
      "rpt.proceed": "à¤¸à¥à¤°à¥‚à¤µà¤¾à¤¤ à¤¸à¥à¤°à¥‚ à¤ à¥‡à¤µà¤¾",
      "rpt.conditional": "à¤¶à¤°à¥à¤¤à¤…à¤§à¥€à¤¨ à¤¸à¥à¤°à¥‚à¤µà¤¾à¤¤",
      "rpt.delay": "à¤¸à¥à¤°à¥‚à¤µà¤¾à¤¤ à¤µà¤¿à¤²à¤‚à¤¬à¤¿à¤¤ à¤•à¤°à¤¾",
      "rpt.prerequisites": "à¤ªà¥‚à¤°à¥à¤µà¤…à¤Ÿà¥€",
      "rpt.verdict": "à¤¨à¤¿à¤°à¥à¤£à¤¯",
      "rpt.timeline": "à¤ªà¥‚à¤°à¥à¤£ à¤¤à¤¯à¤¾à¤°à¥€à¤ªà¤°à¥à¤¯à¤‚à¤¤à¤šà¤¾ à¤µà¥‡à¤³à¤¾à¤ªà¤¤à¥à¤°à¤•",
      "rpt.disclaimer": "à¤¯à¤¾ à¤…à¤¹à¤µà¤¾à¤²à¤¾à¤®à¤§à¥à¤¯à¥‡ à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾ à¤¡à¥‡à¤Ÿà¤¾à¤µà¤° à¤†à¤§à¤¾à¤°à¤¿à¤¤ AI-à¤¨à¤¿à¤°à¥à¤®à¤¿à¤¤ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤†à¤¹à¥‡. à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤˜à¥‡à¤£à¥à¤¯à¤¾à¤ªà¥‚à¤°à¥à¤µà¥€ à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤®à¤¾à¤¹à¤¿à¤¤à¥€ à¤…à¤§à¤¿à¤•à¥ƒà¤¤ à¤¸à¥à¤°à¥‹à¤¤à¤¾à¤‚à¤¸à¤¹ à¤¤à¤ªà¤¾à¤¸à¤²à¥€ à¤ªà¤¾à¤¹à¤¿à¤œà¥‡. ReguLens à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¡à¥‡à¤Ÿà¤¾à¤šà¥€ à¤ªà¥‚à¤°à¥à¤£à¤¤à¤¾ à¤•à¤¿à¤‚à¤µà¤¾ à¤…à¤šà¥‚à¤•à¤¤à¤¾ à¤¹à¤®à¥€ à¤¦à¥‡à¤¤ à¤¨à¤¾à¤¹à¥€.",
      "rpt.page": "à¤ªà¥ƒà¤·à¥à¤ ",
      "rpt.of": "à¤ªà¥ˆà¤•à¥€",
      "disclaimer.dashboard": "ReguLens à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾ à¤†à¤£à¤¿ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤¸à¤®à¤°à¥à¤¥à¤¨ à¤ªà¥à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¤à¥‹; à¤…à¤‚à¤¤à¤¿à¤® à¤•à¤¾à¤¯à¤¦à¥‡à¤¶à¥€à¤°/à¤…à¤¨à¥à¤°à¥‚à¤ªà¤¤à¤¾ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤ªà¤¾à¤¤à¥à¤° à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤•à¤¿à¤‚à¤µà¤¾ à¤…à¤§à¤¿à¤•à¥ƒà¤¤ à¤¨à¤¿à¤¯à¤¾à¤®à¤• à¤¸à¥à¤°à¥‹à¤¤à¤¾à¤‚à¤¸à¤¹ à¤¤à¤ªà¤¾à¤¸à¤²à¥‡ à¤ªà¤¾à¤¹à¤¿à¤œà¥‡à¤¤.",
      "ai.agents": "à¤à¤œà¤‚à¤Ÿà¥à¤¸",
      "ai.completed": "à¤ªà¥‚à¤°à¥à¤£",
      "ai.failed": "à¤…à¤ªà¤¯à¤¶à¥€",
      "ai.totalTotal": "à¤à¤•à¥‚à¤£ à¤µà¥‡à¤³",
      "ai.pending": "à¤ªà¥à¤°à¤²à¤‚à¤¬à¤¿à¤¤",
      "ai.running": "à¤šà¤¾à¤²à¥‚",
      "ai.completedStatus": "à¤ªà¥‚à¤°à¥à¤£",
      "ai.failedStatus": "à¤…à¤ªà¤¯à¤¶à¥€",
      "ai.input": "à¤‡à¤¨à¤ªà¥à¤Ÿ",
      "ai.output": "à¤†à¤‰à¤Ÿà¤ªà¥à¤Ÿ",
      "ai.sources": "à¤¸à¥à¤°à¥‹à¤¤",
      "ai.retry": "à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾",
      "ai.emptyTitle": "à¤•à¥‹à¤ˆ à¤à¤œà¥‡à¤‚à¤Ÿ à¤—à¤¤à¤¿à¤µà¤¿à¤§à¤¿ à¤¨à¤¾à¤¹à¥€",
      "ai.emptyDesc": "à¤®à¤²à¥à¤Ÿà¥€-à¤à¤œà¥‡à¤‚à¤Ÿ à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾ à¤ªà¤¾à¤‡à¤ªà¤²à¤¾à¤‡à¤¨ à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤•à¤°à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ <strong>à¤•à¤¾ à¤®à¥€ à¤¸à¥à¤°à¥‚ à¤•à¤°à¥‚ à¤¶à¤•à¤¤à¥‹?</strong> à¤ªà¥ƒà¤·à¥à¤ à¤¾à¤µà¤°à¥‚à¤¨ à¤¸à¥à¤°à¥‚à¤µà¤¾à¤¤ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤šà¤¾à¤²à¤µà¤¾.",
      "ai.startAnalysis": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¸à¥à¤°à¥‚ à¤•à¤°à¤¾",
    },
  };

  /* Merge external translation bundles (public/i18n/*.js â†’ window.AURORA_I18N) */
  if (window.AURORA_I18N) {
    Object.keys(window.AURORA_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = window.AURORA_I18N[code];
    });
  }

  /* Merge Government Intelligence bundle (public/i18n/gov-bundle.js â†’ window.GOV_I18N) */
  if (window.GOV_I18N) {
    Object.keys(window.GOV_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = {};
      Object.assign(I18N[code], window.GOV_I18N[code]);
    });
  }

  /* Merge Innovation Procurement bundle (public/i18n/sih-bundle.js â†’ window.SIH_I18N) */
  if (window.SIH_I18N) {
    Object.keys(window.SIH_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = {};
      Object.assign(I18N[code], window.SIH_I18N[code]);
    });
  }

  /* Merge Landing page bundle (public/i18n/landing-bundle.js â†’ window.LANDING_I18N) */
  if (window.LANDING_I18N) {
    Object.keys(window.LANDING_I18N).forEach((code) => {
      if (!I18N[code]) I18N[code] = {};
      Object.assign(I18N[code], window.LANDING_I18N[code]);
    });
  }

  /* Merge Core bundle (public/i18n/core-bundle.js â†’ window.CORE_I18N) â€” global language master fix */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ locale-aware formatting â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
    } catch { return "â‚¬" + fmtNum(n); }
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
    try { renderAgentIntelligence(); } catch (e) { console.warn("[charts] agent intelligence error:", e); }
    try { populateAnalysisForm(); } catch (e) { console.warn("[charts] populate form error:", e); }
    try { renderModuleBar(); } catch (e) { console.warn("[charts] module bar error:", e); }
    try { refreshRegionLabels(); } catch (e) { console.warn("[charts] region labels error:", e); }
    setTimeout(() => {
      try {
        if (document.getElementById("chartComplianceStatus")) renderDashboardCharts();
        if (document.getElementById("chartGapSeverity")) renderGapCharts();
        if (document.getElementById("actionMetrics")) renderActionCharts();
        if (document.getElementById("planPhaseTimeline")) renderPlanTimeline();
        if (document.getElementById("watchTimeline")) renderWatchTimeline();
        if (document.getElementById("chartRiskMatrix")) renderRiskMatrix();
        if (document.getElementById("chartCountryCompare")) renderCountryCompare();
      } catch (e) { console.warn("[charts] render error:", e); }
      try { if (currentView === "risk-matrix") renderRiskMatrixView(); } catch (e) { console.warn("[charts] risk-matrix view error:", e); }
      try {
        if (currentView === "feasibility") {
          populateFeasibilityForm();
          const cached = loadCachedFeasibility();
          if (cached) renderFeasibilityResult(cached);
        }
      } catch (e) { console.warn("[charts] feasibility render error:", e); }
      try { if (currentView === "setup-guide") renderSetupGuide(); } catch (e) { console.warn("[charts] setup-guide error:", e); }
      try { if (currentView === "business-health") renderBusinessHealth(); } catch (e) { console.warn("[charts] business-health error:", e); }
      try { if (currentView === "doc-checklist") renderDocChecklist(); } catch (e) { console.warn("[charts] doc-checklist error:", e); }
      try { if (currentView === "co-founder") renderCoFounder(); } catch (e) { console.warn("[charts] co-founder error:", e); }
      try { if (currentView === "investor-hub") renderInvestorHub(); } catch (e) { console.warn("[charts] investor-hub error:", e); }
    }, 0);
    if (window.ReguLensGov) window.ReguLensGov.refresh();
  }

  settings = loadSettings();
  renderLangMenu();

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ api helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const GOV_VIEWS = [
    "gov-analyzer",
    "gov-stakeholders",
    "gov-outcomes",
    "gov-scenario",
    "gov-copilot",
    "gov-consultations",
    "sih-procurement",
    "sih-startup",
    "sih-eligibility",
    "sih-matching",
    "sih-evaluation",
  ];
  const VIEWS = [
    "dashboard",
    "history",
    "assistant",

    "registration-portal",
    "feasibility",
    "setup-guide",
    "requirements",
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
    "sih-procurement",
    "sih-startup",
    "sih-eligibility",
    "sih-matching",
    "sih-evaluation",
    "gov-command",
    "gov-workflow",
    "agent-intelligence",
    "risk-matrix",
    "business-health",
    "network",
    "co-founder",
    "investor-hub",
    "settings",
    "profile",
  ];

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ consolidated modules â”€â”€â”€â”€â”€â”€â”€â”€â”€
     One sidebar item per business module; each module owns a set of
     existing leaf views shown as internal tabs. Leaf ids, DOM sections,
     renders and APIs stay untouched. */
  const MODULES = {
    registration: {
      labelKey: "nav.module.registration",
      defaultView: "registration-portal",
      views: ["registration-portal"],
    },
    launch: {
      labelKey: "nav.module.launch",
      defaultView: "feasibility",
      views: ["feasibility", "setup-guide", "cost-estimator"],
    },
    compliance: {
      labelKey: "nav.module.compliance",
      defaultView: "requirements",
      views: ["requirements", "gap-analysis", "action-plan"],
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
    govMarket: {
      labelKey: "nav.module.govMarket",
      defaultView: "sih-procurement",
      views: [
        "sih-procurement",
        "sih-startup",
        "sih-eligibility",
        "sih-matching",
        "sih-evaluation",
        "gov-workflow",
      ],
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
    "registration-portal": "nav.registrationPortal",
    feasibility: "nav.feasibility",
    "setup-guide": "nav.setupGuide",
    "cost-estimator": "nav.costEstimator",
    requirements: "nav.requirements",
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
    "sih-procurement": "gov.nav.myproblems",
    "sih-startup": "gov.nav.findsolutions",
    "sih-eligibility": "gov.nav.solutions",
    "sih-matching": "nav.sihmatching",
    "sih-evaluation": "nav.siheval",
    "gov-workflow": "gov.nav.procurementreadiness",
  };

  const TITLES = {
    dashboard: "Market Readiness Overview",
    history: "History",
    assistant: "Decision Support Assistant",

    "registration-portal": "Organization Registration",
    feasibility: "Business Feasibility Assessment",
    "setup-guide": "Launch Setup Guide",
    "business-health": "Business Health Scorecard",
    "agent-intelligence": "Multi-Agent Analysis",
    requirements: "Compliance Requirements",
    "gap-analysis": "Compliance Gap Analysis",
    "action-plan": "Remediation Plan",
    "cost-estimator": "Cost Estimation",
    "document-library": "Document Library",
    "doc-checklist": "Compliance Evidence Checklist",
    network: "Growth & Partnerships",
    "co-founder": "Team Role Finder",
    "investor-hub": "Investor Readiness Assessment",
    "regulation-watch": "Regulation Watch",
    updates: "Regulatory Updates",
    "impact-analysis": "Regulatory Impact Analysis",
    "policy-simulator": "Regulatory Impact Simulator",
    "industry-impact": "Cross-Industry Burden Analysis",
    "compare-scenarios": "Scenario Comparison",
    "gov-analyzer": "Policy Analysis",
    "gov-stakeholders": "Stakeholder Impact",
    "gov-outcomes": "Outcome Modeling",
    "gov-scenario": "Parameter Simulation",
    "gov-copilot": "Government Decision Assistant",
    "gov-consultations": "Regulatory Consultations",
    "sih-procurement": "Innovation Procurement",
    "sih-startup": "Solution Profiles",
    "sih-eligibility": "Eligibility Assessment",
    "sih-matching": "Solution Matching",
    "sih-evaluation": "Solution Evaluation",
    "gov-command": "Government Procurement Command Center",
    "gov-workflow": "Problem Intelligence",
    "risk-matrix": "Risk Matrix",
    network: "Growth & Partnerships",
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ module shell (sticky header + tab bar) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
    if (view === "sih-procurement") {
      if (window.SIHInnovation) {
        window.SIHInnovation.render("sih-procurement");
      }
      return;
    }
    if (view === "sih-startup") {
      if (window.SIHStartup) {
        window.SIHStartup.render("sih-startup");
      }
      return;
    }
    if (view === "sih-eligibility") {
      if (window.SIHEligibility) {
        window.SIHEligibility.render("sih-eligibility");
      }
      return;
    }
    if (view === "sih-matching") {
      if (window.SIHMatching) {
        window.SIHMatching.render("sih-matching");
      }
      return;
    }
    if (view === "sih-evaluation") {
      if (window.SIHEvaluation) {
        window.SIHEvaluation.render("sih-evaluation");
      }
      return;
    }
    if (view === "gov-command") {
      if (window.GovCommand) {
        window.GovCommand.render();
      }
      return;
    }
    if (view === "gov-workflow") {
      if (window.GovWorkflow) {
        window.GovWorkflow.render();
      }
      return;
    }
    if (GOV_VIEWS.includes(view) || view === "policy-simulator" || view === "industry-impact" || view === "compare-scenarios") {
      if (window.ReguLensGov) window.ReguLensGov.render(view);
      return;
    }
    if (view === "dashboard") { renderStats(); renderDashboardCharts(); }
    else if (view === "registration-portal") { if (window.RegistrationPortal) window.RegistrationPortal.init(); }
    else if (view === "feasibility") renderFeasibility();
    else if (view === "setup-guide") renderSetupGuide();
    else if (view === "requirements") renderRequirements();
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const mqMobile = window.matchMedia("(max-width: 820px)");
  let sidebarOpen = !mqMobile.matches;

  function setSidebar(open) {
    sidebarOpen = open;
    els.body.classList.toggle("sidebar-collapsed", !open);
  }

  function toggleSidebar() {
    setSidebar(!sidebarOpen);
  }

  function closeSidebar() {
    if (mqMobile.matches) setSidebar(false);
  }

  if (els.overlay) {
    els.overlay.addEventListener("click", () => setSidebar(false));
  }

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.dataset.view) navigate(item.dataset.view);
      else if (item.dataset.module) navigateModule(item.dataset.module);
    });
  });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ header menus â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  if (els.userBtn) {
    els.userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu(els.userMenu, els.userBtn);
    });
  }
  if (els.langBtn) {
    els.langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (els.langMenu) toggleMenu(els.langMenu, els.langBtn);
    });
  }
  if (els.bellBtn) {
    els.bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu(els.notifMenu, els.bellBtn);
    });
  }
  document.addEventListener("click", closeMenus);

  if (els.userMenuSignOut) {
    els.userMenuSignOut.addEventListener("click", () => {
      closeMenus();
      doSignOut();
    });
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ dynamic language menu â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        const check = lang.code === settings.lang ? '<span class="lang-check">âœ“</span>' : "";
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
      opt.textContent = lang.flag + " " + lang.nativeName + " â€” " + lang.name;
      if (lang.code === settings.lang) opt.selected = true;
      els.setAppLang.appendChild(opt);
    });
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ dashboard widgets â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ dropdown data constants â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ country â†’ administrative division selection â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
    ];
    pairs.forEach(([countrySel, regionSel, rowEl, labelEl]) => {
      if (!countrySel || !rowEl) return;
      const cc = getCountryCode(countrySel.value);
      if (cc && rowEl.style.display !== "none") {
        showRegionField(rowEl, labelEl, cc);
      }
    });
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ analysis state (multi-agent system) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ agent intelligence panel â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const AGENTS = [
    {
      id: "research",
      stage: "research",
      name: "Regulatory Research Agent",
      purpose: "Identifies applicable regulations and compliance sources for your target market",
      icon: "ðŸ”",
    },
    {
      id: "requirements",
      stage: "requirements",
      name: "Compliance Requirements Agent",
      purpose: "Generates specific compliance requirements from identified regulations",
      icon: "ðŸ“‹",
    },
    {
      id: "gaps",
      stage: "gaps",
      name: "Gap Analysis Agent",
      purpose: "Analyzes gaps between current state and compliance requirements",
      icon: "ðŸ”Ž",
    },
    {
      id: "risk",
      stage: "readiness",
      name: "Risk & Impact Agent",
      purpose: "Assesses launch risk level and calculates market readiness score",
      icon: "âš¡",
    },
    {
      id: "actions",
      stage: "actions",
      name: "Action Plan Agent",
      purpose: "Creates prioritized remediation plan with cost and timeline estimates",
      icon: "ðŸŽ¯",
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
    if (!ms || ms < 0) return "â€”";
    if (ms < 1000) return ms + "ms";
    return (ms / 1000).toFixed(1) + "s";
  }

  function buildAgentInputSummary(agent, ctx) {
    if (!ctx) return "";
    switch (agent.stage) {
      case "research":
        return ctx.company + " â†’ " + ctx.target + " Â· " + ctx.industry;
      case "requirements":
        return (ctx.regCount || 0) + " regulations identified";
      case "gaps":
        return (ctx.reqCount || 0) + " requirements mapped";
      case "readiness":
        return (ctx.gapCount || 0) + " gaps Â· " + (ctx.reqCount || 0) + " requirements";
      case "actions":
        return (ctx.reqCount || 0) + " requirements Â· risk " + (ctx.riskLevel || "â€”");
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
          ? "Readiness score: " + readiness + "%" + (risk ? " Â· Risk: " + risk : "") + "."
          : "Calculated market readiness score.";
      }
      case "actions": {
        const acts = (data || stageData || {}).actions || [];
        const costs = (data || stageData || {}).costItems || [];
        const totalCost = costs.reduce((s, c) => s + (c.amount || 0), 0);
        return "Generated " + acts.length + " prioritized remediation actions" + (totalCost ? " Â· Est. â‚¬" + Math.round(totalCost).toLocaleString("en-US") : "") + ".";
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

    // Agent 1 â€” Regulatory Research: list of regulations found
    if (agentKey === "regulatoryResearch" && Array.isArray(agent.findings) && agent.findings.length > 0) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.findings")) + ' (' + agent.findings.length + ')</div>' +
        '<ul class="agent-detail-list">' +
        agent.findings.slice(0, 10).map((f) =>
          '<li><strong>' + esc(f.regulation || f.name || "") + '</strong> â€” ' +
          esc(f.jurisdiction || "") + ' (' + esc(f.applicability || "") + ')' +
          (f.source ? ' Â· <span class="ai-source-count">' + esc(f.source) + '</span>' : '') +
          '</li>'
        ).join("") +
        (agent.findings.length > 10 ? '<li>+' + (agent.findings.length - 10) + ' moreâ€¦</li>' : "") +
        '</ul>' +
        '</div>';
    }

    // Agent 2 â€” Compliance Requirements: requirement count by priority
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

    // Agent 3 â€” Gap Analysis: gap count by severity
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

    // Agent 4 â€” Risk & Impact: risk matrix summary by severity
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

    // Agent 5 â€” Action Plan: phase breakdown
    if (agentKey === "actionPlan" && Array.isArray(agent.phases) && agent.phases.length > 0) {
      html += '<div class="agent-detail-section">' +
        '<div class="agent-detail-title">' + esc(t("ai.phases")) + '</div>' +
        '<ul class="agent-detail-list">' +
        agent.phases.map((p) =>
          '<li><strong>' + esc(p.name || "") + '</strong> â€” ' + esc(p.actions != null ? p.actions : 0) +
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
      if (timeEl) timeEl.textContent = "â€”";
      return;
    }

    if (empty) empty.classList.add("hidden");

    const completed = Object.values(agentStates).filter((s) => s.status === "completed").length;
    const failed = Object.values(agentStates).filter((s) => s.status === "failed").length;
    if (countEl) countEl.textContent = String(completed);
    if (failEl) failEl.textContent = String(failed);

    const overallTime = getAgentOverallTime();
    if (timeEl) timeEl.textContent = overallTime ? formatMs(overallTime) : "â€”";

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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ domain data model (single source of truth) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* Shared readiness engine (same formula as backend â€” window.RegulensCore) */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ cost & schedule estimates (derived from requirement state) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const COST_ITEMS = [];

  function fmtEUR(n) {
    return "â‚¬" + Math.round(n).toLocaleString("en-US");
  }

  function readinessStatus(readiness) {
    if (readiness >= 90) return "Excellent Readiness â€” Launch recommended";
    if (readiness >= 60) return "Moderate Readiness â€” Proceed with preparation";
    return "Low Readiness â€” Significant work required";
  }

  function readinessLabel(readiness) {
    if (readiness >= 90) return "Excellent";
    if (readiness >= 60) return "Moderate";
    return "Low";
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ regulation knowledge base â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const REGULATIONS = [];

  const MARKET_PROFILES = {};
  const MARKETS = Object.keys(MARKET_PROFILES);
  notifications = buildNotifications();

  function analyzeMarket(marketId) {
    const p = MARKET_PROFILES[marketId];
    return p
      ? { market: p, readiness: 0, cost: 0, days: 0, open: 0, risk: "â€”", empty: false }
      : { market: null, readiness: 0, cost: 0, days: 0, open: 0, risk: "â€”", empty: true };
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
        "<td>" + (r.due || "â€”") + "</td>";
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
    const risk = hasData ? analysisData.riskLevel : "â€”";
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("statTotal", s.total);
    set("statCompleted", s.completed);
    set("statInProgress", s.inProgress);
    set("statPending", s.pending);
    set("statNA", s.nA);
    set("statDays", !hasData ? "â€”" : days + " days");
    set("statCost", !hasData ? "â€”" : fmtEUR(cost));
    set("statRisk", !hasData ? "â€”" : risk);
    set("readinessLabel", !hasData ? "â€”" : readinessLabel(s.readiness));
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
    const flags = { de: "🇩🇪", fr: "🇫🇷", us: "🇺🇸", uk: "🇬🇧", jp: "🇯🇵", cn: "🇨🇳", in: "🇮🇳", br: "🇧🇷", au: "🇦🇺", ca: "🇨🇦", kr: "🇰🇷", sg: "🇸🇦", ae: "🇦🇪", sa: "🇸🇦", mx: "🇲🇽", it: "🇮🇹", es: "🇪🇸", nl: "🇳🇱", se: "🇸🇪", ch: "🇨🇭", eu: "🇪🇺" };
    return flags[id] || "🇮🇳";
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
    els.reqModalMeta.textContent = r.authority + " Â· " + (r.due || t("req.done"));
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ document library â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      card.querySelector(".doc-meta").textContent = (d.desc || "Document") + " Â· " + (d.size || fmtSize(d.bytes) || "â€”");
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
    els.docModalMeta.textContent = (d.desc || "Document") + " Â· " + (d.size || fmtSize(d.bytes) || "â€”");
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ policy simulator moved to public/government.js (gov engine) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ REGULENS Copilot (replaces Book a Call) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const copilotBtn = document.getElementById("copilotBtn");
  if (copilotBtn) {
    copilotBtn.addEventListener("click", () => {
      if (window.ReguLensCopilot) window.ReguLensCopilot.open();
    });
  }
  /* floating copilot button */
  (function initCopilotFab() {
    const fab = document.createElement("button");
    fab.className = "copilot-fab";
    fab.id = "copilotFab";
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2z"/></svg><span>' + t("copilot.helpBtn") + '</span>';
    fab.addEventListener("click", () => { if (window.ReguLensCopilot) window.ReguLensCopilot.open(); });
    document.body.appendChild(fab);
  })();
  /* insight copilot links (delegated click) */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-insight-copilot]");
    if (!btn) return;
    const canvasId = btn.dataset.insightCopilot;
    const graphContext = { canvasId: canvasId, question: "Explain this chart in detail" };
    if (window.ReguLensCopilot) window.ReguLensCopilot.open(graphContext);
  });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ download report (dynamic) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Report Generation System â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
<title>${t("rpt.title")} â€” ${esc(d.company)}</title>
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
  <p>${esc(aiReport?.executiveSummary || "â€”")}</p>

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
    <tbody>${regRows || `<tr><td colspan="4">â€”</td></tr>`}</tbody>
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
    <tbody>${reqRows || `<tr><td colspan="5">â€”</td></tr>`}</tbody>
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
    <tbody>${gapRows || `<tr><td colspan="4">â€”</td></tr>`}</tbody>
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
    <tbody>${(d.regulations || []).map(r => `<tr><td>${esc(r.title)}</td><td>${esc(r.impactDesc)}</td><td>${priorityBadge(r.impact)}</td></tr>`).join("") || `<tr><td colspan="3">â€”</td></tr>`}</tbody>
  </table>

  <!-- 14. Estimated Cost -->
  <h2>${t("rpt.estimatedCost")} <span class="source-tag tag-reg">${t("rpt.regulatorySource")}</span></h2>
  <div class="card" style="text-align:center">
    <div class="label">${t("rpt.totalCost")}</div>
    <div class="value" style="font-size:32px;color:#4f46e5">${fmtEUR(d.estimatedCost)}</div>
  </div>
  <table>
    <thead><tr><th>${t("rpt.applicableRegulations")}</th><th>${t("rpt.estimatedEur")}</th><th>${t("rpt.estimatedDays")}</th><th>${t("rpt.category")}</th></tr></thead>
    <tbody>${costRows || `<tr><td colspan="4">â€”</td></tr>`}</tbody>
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
    <tbody>${actionRows || `<tr><td colspan="6">â€”</td></tr>`}</tbody>
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
    <tbody>${(d.regulations || []).map(r => `<tr><td>${esc(r.title)}</td><td>${esc(r.code)}</td><td>${esc(r.source)}</td></tr>`).join("") || `<tr><td colspan="3">â€”</td></tr>`}</tbody>
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
      toast(t("rpt.download") + " âœ“");
    } catch (err) {
      console.warn("Report rendering failed:", err);
      toast("Report rendering failed");
    }
  }

  els.downloadReportBtn.addEventListener("click", generateReport);

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ can i launch? verdict â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        ? "Start business registration to generate analysis."
        : hasData ? "Business registered and verified" : "Complete your business profile for readiness assessment"
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
              const TARGET_VIEW = { requirements: "Compliance Requirements", gaps: "gap-analysis", risks: "impact-analysis", actions: "action-plan" };
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
          '</span><p class="req-title"></p><p class="req-desc"></p><p class="req-due">Due in ' + (r.dueDays || "â€”") + ' days</p></div>';
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
        li.innerHTML = '<span class="tl-num">' + String(i + 1).padStart(2, "0") + '</span><div class="tl-body"><p class="tl-title"></p><div class="tl-meta"><span class="chip ' + cls + '">' + label + '</span><span class="tl-days">' + (r.dueDays || "â€”") + " days</span></div></div>";
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
      item.innerHTML = '<span class="chip ' + chipCls + '">' + reg.kind + '</span><p class="watch-title"></p><p class="watch-meta"><span class="flag" aria-hidden="true">' + (reg.flag || "ðŸŒ") + '</span> ' + reg.authority + " Â· Published on " + reg.date + "</p>";
      item.querySelector(".watch-title").textContent = reg.title;
      item.addEventListener("click", () => openRegModal(reg));
      list.appendChild(item);
    });
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ gap analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ action plan â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      li.innerHTML = '<span class="tl-num">' + String(i + 1).padStart(2, "0") + '</span><div class="tl-body"><p class="tl-title"></p><div class="tl-meta"><span class="chip ' + cls + '">' + label + '</span><span class="tl-days">' + (r.dueDays || "â€”") + " days</span></div></div>";
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ cost estimator â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function renderCosts() {
    const hasData = !!analysisData;
    const days = hasData ? analysisData.estimatedDays : 0;
    const cost = hasData ? analysisData.estimatedCost : 0;
    const risk = hasData ? analysisData.riskLevel : "â€”";
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("costDays", !hasData ? "â€”" : days + " days");
    set("costTotal", !hasData ? "â€”" : fmtEUR(cost));
    set("costRisk", !hasData ? "â€”" : risk);
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
      tr.innerHTML = "<td>" + item.name + "</td><td>" + fmtEUR(item.amount) + "</td><td>" + (item.days || "â€”") + " days</td>";
      tbody.appendChild(tr);
    });
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ regulation watch â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function openRegModal(reg) {
    els.regModalTitle.textContent = reg.title;
    els.regModalMeta.textContent = reg.flag + " " + reg.authority + " Â· " + reg.kind + " Â· " + reg.date;
    els.regModalSummary.textContent = reg.summary;
    els.regModalSource.textContent = reg.source + " Â· " + reg.code;
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
      item.innerHTML = '<span class="chip ' + chipCls + '">' + reg.kind + '</span><p class="watch-title"></p><p class="watch-meta"><span class="flag" aria-hidden="true">' + (reg.flag || "ðŸŒ") + '</span> ' + reg.authority + " Â· Published on " + reg.date + "</p>";
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ updates â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      item.querySelector(".update-date").textContent = u.date || "â€”";
      item.querySelector(".update-title").textContent = u.title || "Update";
      item.querySelector(".update-desc").textContent = u.description || u.updateDesc || u.summary || "";
      const matchingReg = (getAnalysisRegulations()).find((r) => r.title === u.title);
      if (matchingReg) item.addEventListener("click", () => openRegModal(matchingReg));
      list.appendChild(item);
    });
    if (!updates.length) {
      if (analysisData) {
        list.innerHTML = '<div class="update-item"><span class="update-date">â€”</span><p class="update-title">No recent updates</p><p class="update-desc">No regulatory updates identified in the analysis.</p></div>';
      } else {
        list.innerHTML = '<div class="update-item"><span class="update-date">â€”</span><p class="update-title">No updates</p><p class="update-desc">Nothing has changed recently.</p></div>';
      }
    }
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ impact analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
    set("impactReadiness", !hasData ? "â€”" : readiness + "%");
    set("impactCost", !hasData ? "â€”" : fmtEUR(cost));
    set("impactDays", !hasData ? "â€”" : days + " days");
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ industry impact (gov engine via government.js) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function renderIndustry() {
    if (window.ReguLensGov) window.ReguLensGov.refresh();
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ compare scenarios (gov engine via government.js) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function renderCompare() {
    if (window.ReguLensGov) window.ReguLensGov.refresh();
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ can i launch? analysis form â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function populateAnalysisForm() {
    const prevTarget = els.aiTarget.value;
    const prevIndustry = els.aiIndustry.value;

    function renderDropdowns(data) {
      els.aiTarget.innerHTML = '<option value="" disabled selected>Select target marketâ€¦</option>';
      data.markets.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        els.aiTarget.appendChild(opt);
      });

      els.aiIndustry.innerHTML = '<option value="" disabled selected>Select industryâ€¦</option>';
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ region selection event listeners (Can I Launch?) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ feasibility analyzer â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    /* Determine if this is a government or business feasibility assessment */
    const isGovernment = data.govAssessment || false;
    
    /* Government feasibility scoring */
    if (isGovernment) {
      /* Calculate government feasibility score based on available data */
      const techFit = f.techFit || 0;
      const opsFit = f.opsFit || 0;  
      const infraFit = f.infraFit || 0;
      const teamFit = f.teamFit || 0;
      const compliance = f.compliance || 0;
      
      /* Overall feasibility score (0-100) */
      const overallScore = Math.round((techFit + opsFit + infraFit + teamFit + compliance) / 5);
      
      els.fbVerdictBanner.className = "fb-verdict tone-conditional";
      els.fbVerdictBadge.textContent = overallScore >= 80 ? "FEASIBLE" : overallScore >= 50 ? "CONDITIONAL" : "NOT FEASIBLE";
      els.fbMode.textContent = data.mode === "ai" ? t("feas.modeAi") : t("feas.modeDemo");
      
      /* Government-specific score breakdown */
      els.fbSummary.textContent = f.summary || "";
      
      /* Technology Fit */
      els.fbCompetition.textContent = techFit || "â€”";
      
      /* Operational Feasibility */  
      els.fbCapital.textContent = opsFit || "â€”";
      
      /* Infrastructure Readiness */
      /* Using capital field for ops fit display */
      
      /* Team Capability */
      /* Using timeline field for team fit display */
      
      /* Compliance Constraints */
      els.fbTimeline.textContent = compliance || "â€”";
      
      /* Show government-specific assessment */
      els.fbEmptyState.classList.add("hidden");
      els.fbResultWrap.classList.remove("hidden");
      els.fbGovAssessment.classList.remove("hidden");
      els.fbGovScore.textContent = overallScore;
      els.fbGovScore.setAttribute("title", `Government Feasibility Score: ${overallScore}%`);
      
      /* Show supporting categories */
      if (f.techFit || f.opsFit || f.infraFit || f.teamFit || f.compliance) {
        /* Show government feasibility categories */
        const categories = [];
        if (f.techFit) categories.push(`Technology Fit: ${f.techFit}%`);
        if (f.opsFit) categories.push(`Operational Feasibility: ${f.opsFit}%`);
        if (f.infraFit) categories.push(`Infrastructure: ${f.infraFit}%`);
        if (f.teamFit) categories.push(`Team Capability: ${f.teamFit}%`);
        if (f.compliance) categories.push(`Compliance: ${f.compliance}%`);
        els.fbGovCategories.textContent = categories.join("; ");
      } else {
        els.fbGovCategories.textContent = "â€”";
      }
    } else {
      /* Original business feasibility rendering */
      els.fbVerdictBanner.className = "fb-verdict " + (FEAS_TONES[f.verdict] || "tone-conditional");
      els.fbVerdictBadge.textContent = f.verdict || "â€”";
      els.fbMode.textContent = data.mode === "ai" ? t("feas.modeAi") : t("feas.modeDemo");
      els.fbSummary.textContent = f.summary || "";
      els.fbCompetition.textContent = f.competitionLevel || "â€”";
      els.fbCapital.textContent = f.capitalEstimate || "â€”";
      els.fbTimeline.textContent = f.timeline || "â€”";
    }

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
      chip.textContent = r.title + " Â· " + sevLabel(String(r.severity || "medium").toLowerCase());
      els.fbRisks.appendChild(chip);
    });

    els.fbRecs.innerHTML = "";
    (f.recommendations || []).forEach((rec) => {
      const li = document.createElement("li");
      li.textContent = rec;
      els.fbRecs.appendChild(li);
    });
    els.fbRecs.classList.toggle("hidden", !(f.recommendations || []).length);

    const fbFitScore = document.getElementById("fbFitScore");
    if (fbFitScore) fbFitScore.textContent = Number.isFinite(f.marketFitScore) ? f.marketFitScore + "%" : "—";
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ step-by-step setup guide â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    const guideProgressText = document.getElementById("guideProgressText");
    if (guideProgressText) guideProgressText.textContent = pct + "%";
  }

  els.guideResetBtn.addEventListener("click", () => {
    saveGuideDone(new Set());
    renderSetupGuide();
  });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ business health monitor â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    /* score text */
    const bhScoreText = document.getElementById("bhScoreText");
    if (bhScoreText) bhScoreText.textContent = health.overall + "/100";

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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ document checklist & templates â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      return;
    }
    els.dcEmptyState.classList.add("hidden");
    els.dcWrap.classList.remove("hidden");

    const docsCount = Array.isArray(docs) ? docs.length : 0;
    const target = Math.max(3, reqs.length);
    const coverage = Math.min(100, Math.round((docsCount / target) * 100));
    const dcCoverageText = document.getElementById("dcCoverageText");
    if (dcCoverageText) dcCoverageText.textContent = coverage + "%";
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ co-founder finder â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      "Search brief â€” " + (analysisData.company || ""),
      "Product: " + (analysisData.product || ""),
      "Target market: " + (analysisData.target || "") + " Â· Industry: " + (analysisData.industry || ""),
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ investor readiness â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      return;
    }
    els.ihEmptyState.classList.add("hidden");
    els.ihWrap.classList.remove("hidden");

    const ihScoreText = document.getElementById("ihScoreText");
    if (ihScoreText) ihScoreText.textContent = ir.score + "%";

    const counts = ir.h.counts;
    els.ihStatsRow.innerHTML =
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(analysisData.readiness || 0)) + '%</span><span class="risk-stat-label">' + esc(t("ih.stat.readiness")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">$' + esc(Number(analysisData.estimatedCost || 0).toLocaleString("en-US")) + '</span><span class="risk-stat-label">' + esc(t("ih.stat.cost")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(analysisData.estimatedDays || 0)) + '</span><span class="risk-stat-label">' + esc(t("ih.stat.days")) + "</span></div>" +
      '<div class="risk-stat"><span class="risk-stat-value">' + esc(String(counts.pending || 0)) + '</span><span class="risk-stat-label">' + esc(t("ih.stat.open")) + "</span></div>";

    /* what investors will probe â€” each answered from project state */
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
      analysisData.company + " â€” Investor one-pager draft\n" +
      "".padEnd(40, "=") + "\n" +
      "Product: " + (analysisData.product || "") + "\n" +
      "Market: " + (analysisData.target || "") + " (from " + (analysisData.origin || "-") + ")\n" +
      "Industry: " + (analysisData.industry || "") + "\n" +
      "Compliance readiness: " + (analysisData.readiness || 0) + "% Â· Risk level: " + (analysisData.riskLevel || "-") + "\n" +
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
      brief += "\nNOTE: AI summary unavailable (" + (err.message || "no key") + ") â€” figures above are computed directly from your analysis.\n";
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ analysis workflow (demo-first orchestrator) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
            '<span class="analysis-error-icon">âš </span>' +
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
      if (state === "done") { icon = "âœ“"; cls = "analysis-step-done"; }
      else if (state === "running") { icon = "âŸ³"; cls = "analysis-step-running"; }
      else if (state === "error") { icon = "âœ—"; cls = "analysis-step-error"; }
      else { icon = "â—‹"; cls = "analysis-step-pending"; }
      html += '<div class="analysis-step ' + cls + '"><span class="analysis-step-icon">' + icon + '</span><span class="analysis-step-label">' + stage.label + '</span></div>';
    });
    html += '</div>';
    statusEl.innerHTML = html;
  }
  populateAnalysisForm();

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ theme â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ settings toggles â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ toast â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 2400);
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ clear memory (confirm modal) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ auth â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ history view â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function fmtChatDate(iso) {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return (
        d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
        " Â· " +
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ assistant view â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      chip.textContent = d.name + "  Ã—";
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
    liveText.textContent = "â€¦";
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
        reply.content || "Sorry â€” the assistant is unavailable right now. Please try again in a moment.";
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ health / ai status â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      toast(t("settings.aiConnError") + " â€” " + t("settings.aiRetryHint"));
    } finally {
      aiChecking = false;
      els.aiRetryBtn.disabled = false;
    }
  }

  els.aiRetryBtn.addEventListener("click", refreshAiStatus);
  refreshAiStatus();

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     CHART RENDERING â€” exactly 7 visualizations, all data-driven,
     each with loading / empty / error / success states.
     1 Dashboard: Compliance Status donut
     2 Dashboard: Priority Distribution bar
     3 Dashboard: Compliance Progress (action progress)
     4 Gap Analysis: Severity bar
     5 Impact Analysis: Risk Matrix scatter (probability Ã— impact)
     6 Regulation Watch: Regulatory timeline (HTML)
     7 Compare Scenarios: grouped bar
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

  function renderDashboardCharts() {
    const metricsEl = document.getElementById('dashboardMetrics');
    const summaryEl = document.getElementById('dashboardSummaryCards');
    const d = analysisData;
    if (!d) {
      if (metricsEl) metricsEl.innerHTML = "";
      if (summaryEl) summaryEl.innerHTML = "";
      return;
    }
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

    if (summaryEl && stats.total > 0) {
      const compliancePct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
      summaryEl.innerHTML = `
        <div class="chart-card summary-card">
          <div class="summary-title">${t('dashboard.complianceStatus')}</div>
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="summary-stat-value">${stats.completed || 0}</span>
              <span class="summary-stat-label">${t('req.statusCompleted')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${stats.inProgress || 0}</span>
              <span class="summary-stat-label">${t('req.statusInProgress')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${stats.pending || 0}</span>
              <span class="summary-stat-label">${t('req.statusPending')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${stats.nA || 0}</span>
              <span class="summary-stat-label">${t('req.statusNA')}</span>
            </div>
          </div>
          <div class="summary-progress">
            <div class="summary-bar"><div class="summary-bar-fill" style="width: ${compliancePct}%"></div></div>
            <span class="summary-pct">${compliancePct}% ${t('dashboard.complianceProgress')}</span>
          </div>
        </div>
        <div class="chart-card summary-card">
          <div class="summary-title">${t('dashboard.priorityDistribution')}</div>
          <div class="summary-stats">
            <div class="summary-stat critical">
              <span class="summary-stat-value">${stats.critical || 0}</span>
              <span class="summary-stat-label">${t('req.critical')}</span>
            </div>
            <div class="summary-stat important">
              <span class="summary-stat-value">${stats.important || 0}</span>
              <span class="summary-stat-label">${t('req.important')}</span>
            </div>
            <div class="summary-stat standard">
              <span class="summary-stat-value">${stats.standard || 0}</span>
              <span class="summary-stat-label">${t('req.standard')}</span>
            </div>
          </div>
        </div>
      `;
    } else if (summaryEl) {
      summaryEl.innerHTML = "";
    }
  }

  function renderGapCharts() {
    const gaps = analysisData ? (analysisData.gaps || []) : [];

    // Gap metrics cards
    const gapMetricsEl = document.getElementById('gapMetrics');
    const gapSummaryEl = document.getElementById('gapSummaryCards');
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

    if (gapSummaryEl && gaps.length > 0) {
      gapSummaryEl.innerHTML = `
        <div class="chart-card summary-card">
          <div class="summary-title">${t('gap.severityChart')}</div>
          <div class="summary-stats">
            <div class="summary-stat critical">
              <span class="summary-stat-value">${critical}</span>
              <span class="summary-stat-label">${t('gap.critical')}</span>
            </div>
            <div class="summary-stat important">
              <span class="summary-stat-value">${high}</span>
              <span class="summary-stat-label">${t('gap.high')}</span>
            </div>
            <div class="summary-stat standard">
              <span class="summary-stat-value">${mediumLow}</span>
              <span class="summary-stat-label">${t('gap.mediumLow')}</span>
            </div>
          </div>
          <div class="summary-list">
            ${gaps.slice(0, 5).map(g => `
              <div class="summary-item">
                <span class="sev-badge sev-${String(g.severity || 'medium').toLowerCase()}">${esc(String(g.severity || 'medium'))}</span>
                <span class="summary-item-title">${esc(g.title || g.name || '—')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (gapSummaryEl) {
      gapSummaryEl.innerHTML = "";
    }
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Gap Analysis: Origin vs Target market comparison â”€â”€â”€â”€â”€â”€â”€â”€â”€
     Data comes from GET /api/gov/compare-markets (canonical gov engine,
     POLICY_DB). Deterministic burden profile per policy category â€” no
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
    if (!data || !Array.isArray(data.markets) || !data.markets.length) {
      return;
    }
    const origin = data.markets[0];
    const target = data.sameMarket ? null : (data.markets[1] || null);

    const sub = document.getElementById("compareSub");
    if (sub) {
      sub.textContent = target
        ? `${compareMarketLabel(origin)} â†’ ${compareMarketLabel(target)} Â· ${data.industryName || ""}`
        : `${compareMarketLabel(origin)} Â· ${data.industryName || ""}`;
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
        { v: origin.avgBurden + "/100", l: t("gap.avgBurden") + " â€” " + t("gap.compareOrigin"), tone: "color:var(--primary)" },
        { v: fmtNum(origin.totalRequirements), l: t("gap.applicableReqs") + " â€” " + t("gap.compareOrigin"), tone: "" },
      ];
      if (target) {
        cards.push(
          { v: target.avgBurden + "/100", l: t("gap.avgBurden") + " â€” " + t("gap.compareTarget"), tone: "color:var(--orange)" },
          { v: fmtNum(target.totalRequirements), l: t("gap.applicableReqs") + " â€” " + t("gap.compareTarget"), tone: "" },
          { v: String(catRows.length), l: t("gap.cmp.categories"), tone: "" },
          { v: compareMarketLabel(higherMarket), l: t("gap.cmp.higherBurden"), tone: "" },
          largestGapRow && largestGapRow.category
            ? { v: `${largestGapRow.category} (Î” ${Math.abs(largestGapRow.delta)})`, l: t("gap.cmp.largestGap"), tone: "" }
            : null
        );
      }
      metrics.innerHTML = cards.filter(Boolean).map((c) =>
        `<div class="metric-card"><div class="metric-card-value" style="${c.tone}">${esc(String(c.v))}</div><div class="metric-card-label">${esc(c.l)}</div></div>`
      ).join("");
    }

    const compareSummaryEl = document.getElementById('compareSummaryCards');
    if (compareSummaryEl && catRows.length > 0) {
      compareSummaryEl.innerHTML = `
        <div class="chart-card summary-card">
          <div class="summary-title">${t('gap.compareTitle')}</div>
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="summary-stat-value">${origin.avgBurden}/100</span>
              <span class="summary-stat-label">${t('gap.avgBurden')} â€” ${t('gap.compareOrigin')}</span>
            </div>
            ${target ? `
            <div class="summary-stat">
              <span class="summary-stat-value">${target.avgBurden}/100</span>
              <span class="summary-stat-label">${t('gap.avgBurden')} â€” ${t('gap.compareTarget')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${catRows.length}</span>
              <span class="summary-stat-label">${t('gap.cmp.categories')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${compareMarketLabel(higherMarket)}</span>
              <span class="summary-stat-label">${t('gap.cmp.higherBurden')}</span>
            </div>
            ${largestGapRow && largestGapRow.category ? `
            <div class="summary-stat">
              <span class="summary-stat-value">${largestGapRow.category} (Î” ${Math.abs(largestGapRow.delta)})</span>
              <span class="summary-stat-label">${t('gap.cmp.largestGap')}</span>
            </div>
            ` : ''}
            ` : ''}
          </div>
        </div>
      `;
    } else if (compareSummaryEl) {
      compareSummaryEl.innerHTML = "";
    }

    const tbody = document.getElementById("compareTbody");
    if (tbody) {
      tbody.innerHTML = catRows.map((r) => {
        const prio = compareGapPriority(Math.abs(r.delta));
        const originCell =
          `<td><strong>${esc(String(r.oScore))}</strong>/100<span class="cell-sub">${fmtNum(r.oReqs)} ${esc(t("gap.applicableReqs"))}</span></td>`;
        const targetCell = target
          ? `<td><strong>${esc(String(r.tScore))}</strong>/100<span class="cell-sub">${fmtNum(r.tReqs)} ${esc(t("gap.applicableReqs"))}</span></td>`
          : `<td>â€”</td>`;
        const gapCell = target
          ? `<td class="${r.delta > 0 ? "compare-gap-up" : r.delta < 0 ? "compare-gap-down" : "compare-gap-flat"}">${r.delta > 0 ? "+" : ""}${r.delta}</td>`
          : `<td>â€”</td>`;
        const prioCell = target
          ? `<td><span class="chip ${prio.cls}">${esc(prio.label)}</span></td>`
          : `<td>â€”</td>`;
        const driverCell =
          `<td>${r.tc && r.tc.topRegulation ? esc(r.tc.topRegulation.code + " â€” " + r.tc.topRegulation.title) : "â€”"}</td>`;
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
    try {
    const d = analysisData;
    if (!d || (!d.targetId && !d.target)) {
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
      const tb = document.getElementById("compareTbody");
      if (tb) tb.innerHTML = "";
    }
    } catch (outer) { console.warn("[charts] country compare error:", outer); }
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
        : tl ? `${t("charts.total")} ${fmtNum(tl.totalDays)} ${t("time.days")} (~${fmtNum(tl.totalWeeks)} ${t("time.weeks")}) Â· ${tf("plan.criticalPath", { p: critPath.map(c => c.title).join(" â†’ ") })}` : "";
    }
    if (!analysisData || !tl || !phases.length) {
      list.innerHTML = `<li class="tl-item"><div class="tl-body"><p class="tl-title">${esc(t("charts.empty"))}</p><p class="tl-days">Run an analysis to compute the plan timeline.</p></div></li>`;
      return;
    }
    phases.forEach((p) => {
      const li = document.createElement("li");
      li.className = "tl-item";
      li.innerHTML = '<span class="tl-num">' + esc("P" + p.phase) + '</span><div class="tl-body"><p class="tl-title"></p><div class="tl-meta"><span class="chip chip-gray">' + fmtNum(p.actionCount || 0) + ' ' + esc(t("time.actions")) + '</span><span class="tl-days">' + esc(t("time.day")) + ' ' + p.startDay + 'â€“' + p.endDay + '</span></div></div>';
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
    if (!analysisData) return;
    const risks = analysisData.riskMatrix || analysisData.risks || [];
    
    const impactSummaryEl = document.getElementById('impactSummaryCards');
    if (impactSummaryEl && Array.isArray(risks) && risks.length > 0) {
      const dist = { critical: 0, high: 0, medium: 0, low: 0 };
      risks.forEach((r) => {
        const k = String(r.severity || "medium").toLowerCase();
        if (dist[k] !== undefined) dist[k] += 1;
      });
      const openCount = risks.filter((r) => String(r.status || "Open").toLowerCase() === "open").length;
      
      impactSummaryEl.innerHTML = `
        <div class="chart-card summary-card">
          <div class="summary-title">${t('risk.matrix.title')}</div>
          <div class="summary-stats">
            <div class="summary-stat critical">
              <span class="summary-stat-value">${dist.critical}</span>
              <span class="summary-stat-label">${t('gap.critical')}</span>
            </div>
            <div class="summary-stat important">
              <span class="summary-stat-value">${dist.high}</span>
              <span class="summary-stat-label">${t('gap.high')}</span>
            </div>
            <div class="summary-stat standard">
              <span class="summary-stat-value">${dist.medium}</span>
              <span class="summary-stat-label">${t('gap.medium')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${dist.low}</span>
              <span class="summary-stat-label">${t('sev.low')}</span>
            </div>
          </div>
          <div class="summary-list">
            ${risks.slice(0, 5).map(r => `
              <div class="summary-item">
                <span class="sev-badge sev-${String(r.severity || 'medium').toLowerCase()}">${esc(sevLabel(String(r.severity || 'medium').toLowerCase()))}</span>
                <span class="summary-item-title">${esc(r.title || r.name || '—')} (P: ${r.probability}, I: ${r.impact})</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (impactSummaryEl) {
      impactSummaryEl.innerHTML = "";
    }
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Risk & Business Health module â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  function renderRiskMatrixView() {
    const wrap = document.getElementById("riskDataWrap");
    const empty = document.getElementById("riskEmptyState");
    const summaryEl = document.getElementById("riskSummaryCards");
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

    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="chart-card summary-card">
          <div class="summary-title">${t('risk.matrix.title')}</div>
          <div class="summary-stats">
            <div class="summary-stat critical">
              <span class="summary-stat-value">${dist.critical}</span>
              <span class="summary-stat-label">${t('gap.critical')}</span>
            </div>
            <div class="summary-stat important">
              <span class="summary-stat-value">${dist.high}</span>
              <span class="summary-stat-label">${t('gap.high')}</span>
            </div>
            <div class="summary-stat standard">
              <span class="summary-stat-value">${dist.medium}</span>
              <span class="summary-stat-label">${t('gap.medium')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${dist.low}</span>
              <span class="summary-stat-label">${t('sev.low')}</span>
            </div>
          </div>
        </div>
        <div class="chart-card summary-card">
          <div class="summary-title">${t('risk.dist.title')}</div>
          <div class="summary-stats">
            <div class="summary-stat critical">
              <span class="summary-stat-value">${dist.critical}</span>
              <span class="summary-stat-label">${t('gap.critical')}</span>
            </div>
            <div class="summary-stat important">
              <span class="summary-stat-value">${dist.high}</span>
              <span class="summary-stat-label">${t('gap.high')}</span>
            </div>
            <div class="summary-stat standard">
              <span class="summary-stat-value">${dist.medium}</span>
              <span class="summary-stat-label">${t('gap.medium')}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-value">${dist.low}</span>
              <span class="summary-stat-label">${t('sev.low')}</span>
            </div>
          </div>
        </div>
      `;
    }

    const tbody = document.getElementById("riskTbody");
    if (tbody) {
      tbody.innerHTML = risks
        .map((r) => {
          const sev = String(r.severity || "medium").toLowerCase();
          return (
            "<tr>" +
            `<td>${esc(r.title || r.name || "â€”")}</td>` +
            `<td>${esc(r.category || "â€”")}</td>` +
            `<td><span class="sev-badge ${esc(sev)}">${esc(sevLabel(sev))}</span></td>` +
            `<td>${esc(String(r.probability != null ? r.probability : "â€”"))}</td>` +
            `<td>${esc(String(r.impact != null ? r.impact : "â€”"))}</td>` +
            `<td><span class="status-badge">${esc(r.status || "Open")}</span></td>` +
            "</tr>"
          );
        })
        .join("");
    }
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ public API (consumed by regulens.js experience layer) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ init â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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








