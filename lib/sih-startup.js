/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — Startup Intelligence Profile (additive domain + services)
   Pure functions (no I/O) plus an AI-extraction wrapper that mirrors the
   existing lib/groq complete() usage. Deliberately decoupled from the
   future matching engine: everything exposes structured query-shaped
   output (matchingReady) rather than a score.

   Field-level provenance (Part 3) is always distinct from verification
   (Part 14). AI inference never becomes verification automatically.
   ═══════════════════════════════════════════════════════════════════ */
import { AppError } from "./errors.js";
import { safeString } from "./security.js";

/* ───────── Part 3 provenance ───────── */
export const PROFILE_PROVENANCE = [
  "USER_PROVIDED", "DOCUMENT_EXTRACTED", "SOURCE_VERIFIED",
  "AI_INFERRED", "AI_SUGGESTED", "REQUIRES_REVIEW", "NOT_PROVIDED",
];

/* ───────── Part 14 field-level verification statuses ───────── */
export const FIELD_VERIFICATION_STATUSES = [
  "VERIFIED", "SELF_DECLARED", "REVIEW_REQUIRED", "NOT_PROVIDED",
];

/* ───────── Part 12 profile states ───────── */
export const PROFILE_STATUSES = [
  "DRAFT", "SUBMITTED", "UNDER_REVIEW", "PARTIALLY_VERIFIED",
  "VERIFIED", "REQUIRES_UPDATE", "SUSPENDED", "ARCHIVED",
];

/* ───────── Part 6 document expiry ───────── */
export const DOCUMENT_EXPIRY_STATUSES = ["VALID", "EXPIRING_SOON", "EXPIRED", "UNKNOWN"];

/* ───────── Part 17 risk flag types ───────── */
export const FLAG_TYPES = [
  "MISSING_REQUIRED_DOCUMENT", "EXPIRED_CERTIFICATE", "CONTRADICTORY_COMPANY_NAME",
  "MISSING_DEPLOYMENT_EVIDENCE", "UNVERIFIED_CAPABILITY", "INCOMPLETE_SECURITY",
  "CONFLICTING_REGISTRATION_DATA", "CONTRADICTION", "AI_SUGGESTION_PENDING",
];

/* ───────── Part 10 AI suggestion kinds ───────── */
export const AI_SUGGESTION_KINDS = [
  "TECHNOLOGY", "CAPABILITY", "SECTOR", "USE_CASE", "DEPLOYMENT_DOMAIN",
];
export const SUGGESTION_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "EDITED"];

/* ───────── Profile verification section labels ───────── */
export const PROFILE_VERIFICATION_SECTIONS = [
  "IDENTITY", "DPIIT", "MSME", "TECHNOLOGY", "CAPABILITIES", "CERTIFICATION",
  "GOVERNMENT_EXPERIENCE", "DEPLOYMENT", "SECURITY", "LEGAL",
];

/* ───────── Part 8: extensible capability taxonomy ─────────
   Nested, labelled, extensible. Leaf entries are (label, [children]).
   The store's vocabulary (capabilities table) remains the canonical
   flat store; this tree is the *presentation/expansion* taxonomy and can
   grow by appending entries without touching schema. */
export const CAPABILITY_TAXONOMY = {
  Healthcare: [
    "Patient Flow Optimization", "Hospital Analytics", "Clinical NLP",
    "Medical Imaging", "Health IoT", "Telemedicine",
  ],
  AI: [
    "NLP", "Computer Vision", "Predictive Analytics", "Recommendation Systems",
    "Generative AI", "Speech Recognition", "Anomaly Detection",
  ],
  Infrastructure: [
    "Cloud", "Edge", "IoT", "API Integration", "Data Pipelines",
    "Geographic Information Systems (GIS)",
  ],
  Cybersecurity: [
    "Threat Detection", "Encryption", "Access Control", "Security Monitoring",
    "Compliance Automation",
  ],
  Agriculture: [
    "Crop Monitoring", "Supply Chain Traceability", "Soil Analytics", "Weather Intelligence",
  ],
  Transport: [
    "Traffic Monitoring", "Fleet Management", "Video Analytics", "Route Optimization",
  ],
  Education: [
    "Learning Analytics", "Assessment Automation", "Accessibility Tools", "Language Learning",
  ],
  "Public Services": [
    "Grievance Management", "Citizen Services", "Document Digitisation",
    "Process Automation", "Data Sharing Platforms",
  ],
};

/* Flatten the taxonomy for quick membership checks / suggestions. */
export function flattenCapabilityTaxonomy() {
  const out = [];
  for (const [category, leaves] of Object.entries(CAPABILITY_TAXONOMY)) {
    for (const leaf of leaves) out.push({ category, label: leaf });
  }
  return out;
}

/* ───────── Part 6 expiry (never invent a date) ───────── */
export function expiryStatus(issueDate, expiryDate, today = new Date()) {
  if (expiryDate == null || expiryDate === "") return "UNKNOWN";
  const exp = new Date(expiryDate);
  if (Number.isNaN(exp.getTime())) return "UNKNOWN";
  const todayMs = new Date(today.toDateString()).getTime();
  const expMs = new Date(exp.toDateString()).getTime();
  const daysLeft = (expMs - todayMs) / 86400000;
  if (daysLeft < 0) return "EXPIRED";
  if (daysLeft <= 60) return "EXPIRING_SOON";
  return "VALID";
}

/* ───────── Part 1: empty profile shape ───────── */
export function emptyProfile() {
  return {
    identity: {},
    startupStatus: {},
    business: {},
    technology: {},
    useCases: {},
    deployment: {},
    team: {},
    geography: {},
    scalability: {},
    pilot: {},
    security: {},
  };
}

const SECTION_FIELDS = {
  identity: ["name", "legalEntityName", "companyType", "incorporationDate", "registeredLocation", "website", "businessEmail"],
  startupStatus: ["dpiitStatus"],
  business: ["industry", "sector", "businessModel", "products"],
  technology: ["coreCapabilities", "technologies"],
  useCases: ["primary", "problemDomains", "government"],
  deployment: ["count", "previousDeployments", "hasGovernmentDeployment"],
  team: ["founders", "techTeamSize"],
  geography: ["headquarters", "operatingRegions", "canDeployAcrossIndia"],
  scalability: ["currentCustomers", "currentScale", "expectedScale"],
  pilot: ["ready", "pilotTeamAvailable", "estimatedDurationDays"],
  security: ["privacyCompliance", "dataProtectionMeasures"],
};

export const PROFILE_SECTION_LABELS = {
  identity: "Identity", startupStatus: "Startup Status", business: "Business",
  technology: "Technology", useCases: "Use Cases", deployment: "Deployment",
  team: "Team", geography: "Geography", scalability: "Scalability",
  pilot: "Pilot Readiness", security: "Security / Compliance",
};

function hasValue(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return String(v).trim() !== "";
}

/* ───────── Part 2: profile completeness (NOT eligibility) ───────── */
export function computeCompleteness(profile) {
  profile = profile || {};
  const sections = [];
  let weightSum = 0;
  let completeWeight = 0;
  Object.keys(SECTION_FIELDS).forEach((section, idx) => {
    const fields = SECTION_FIELDS[section];
    const sectionData = profile[section] || {};
    // required = important fields; secondary = nice-to-have
    let done = 0;
    for (const f of fields) {
      if (hasValue(sectionData[f])) {
        done++;
        completeWeight += 1;
      }
      weightSum += 1;
    }
    sections.push({
      key: section,
      label: PROFILE_SECTION_LABELS[section] || section,
      complete: done / fields.length,
      requiredFields: fields.length,
      completedFields: done,
    });
  });
  const score = weightSum === 0 ? 0 : Math.round((completeWeight / weightSum) * 100);
  return { score, sections, complete: score >= 100 };
}

/* ───────── Part 14: field-level verification breakdown ─────────
   Attributes carry provenance; verifications carry authority. A field is
   only VERIFIED when an authoritative verification record exists — a
   USER_PROVIDED/ DOCUMENT_EXTRACTED value alone is never VERIFIED. */
export function computeVerificationBreakdown(profile, verifications = [], attributes = {}) {
  const breakdown = {};
  for (const section of PROFILE_VERIFICATION_SECTIONS) {
    const key = section.toLowerCase();
    const ver = (verifications || []).find(
      (v) => String((v.section || "")).toUpperCase() === section
    );
    let status;
    const attrs = attributes || {};
    if (ver && ver.status === "VERIFIED") status = "VERIFIED";
    else if (ver) status = ver.status === "NOT_PROVIDED" ? "NOT_PROVIDED" : "REVIEW_REQUIRED";
    else if (hasValue(attrs[key] && (attrs[key].provenance || attrs[key].verification))) status = "SELF_DECLARED";
    else status = "NOT_PROVIDED";
    breakdown[section] = {
      status,
      label: section.replace(/_/g, " "),
      source: ver ? ver.source : (attrs[key] ? attrs[key].provenance : "NOT_PROVIDED"),
      confidence: ver && ver.confidence != null ? ver.confidence : null,
      note: ver ? ver.note : null,
    };
  }
  return breakdown;
}

/* ───────── Part 12 / 14: derive overall profile state ─────────
   Never auto-assign VERIFIED. Only when every tracked section resolves to
   VERIFIED (or NOT_PROVIDED for optional-not-required) do we allow VERIFIED,
   and even then only if an explicit profileStatus escalation occurred. */
export function deriveProfileStatus(breakdown, currentStatus = "DRAFT") {
  if (["SUSPENDED", "ARCHIVED", "REQUIRES_UPDATE"].includes(currentStatus)) return currentStatus;
  const entries = Object.values(breakdown || {});
  if (!entries.length) return "DRAFT";
  const anyNotProvided = entries.some((e) => e.status === "NOT_PROVIDED");
  const anyReviewRequired = entries.some((e) => e.status === "REVIEW_REQUIRED" || e.status === "SELF_DECLARED");
  const anyVerified = entries.some((e) => e.status === "VERIFIED");
  if (anyReviewRequired) return anyVerified ? "PARTIALLY_VERIFIED" : "UNDER_REVIEW";
  if (anyNotProvided) return "DRAFT";
  return "VERIFIED";
}

/* ───────── Part 18: contradiction detection (non-accusatory) ─────────
   Returns flags with severity WARN; never labels fraud automatically. */
export function detectContradictions(profile, extractedDocs = [], knownRegistrations = {}) {
  const flags = [];
  const identity = profile.identity || {};
  const normalized = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = normalized(identity.legalEntityName || identity.name);

  if (name) {
    for (const doc of extractedDocs || []) {
      const docName = normalized(doc.extractedCompanyName);
      if (docName && docName !== name) {
        const diff = Math.max(name.length, docName.length);
        let dist = 0;
        const shorter = Math.min(name.length, docName.length);
        for (let i = 0; i < shorter; i++) if (name[i] !== docName[i]) dist++;
        dist += Math.abs(name.length - docName.length);
        const ratio = diff ? dist / diff : 0;
        if (ratio <= 0.35 || docName.includes(name) || name.includes(docName)) {
          flags.push({
            type: "CONTRADICTORY_COMPANY_NAME",
            severity: "WARN",
            message: "Potential identity mismatch: profile name does not exactly match a provided document. Requires verification.",
            ref: doc.label || "document",
          });
        }
      }
    }
  }

  const claimed = Number(identity.deploymentCountClaim || profile.deployment ? profile.deployment.count : 0);
  const docDeployments = Number(knownRegistrations.deploymentCount || 0);
  if (claimed > 0 && docDeployments > 0 && claimed !== docDeployments) {
    flags.push({
      type: "CONTRADICTION",
      severity: "WARN",
      message: `Potential inconsistency: profile states ${claimed} deployment(s) but documents reference ${docDeployments}. Requires verification.`,
      ref: "deployment.count",
    });
  }
  return flags;
}

/* ───────── Part 17: risk flags (non-rejecting) ───────── */
export function assessRiskFlags(profile, opts = {}) {
  const flags = [];
  const { certifications = [], documents = [], verifications = [], attributes = {} } = opts;

  if (!hasValue(attributes["identity.businessEmail"] && attributes["identity.businessEmail"].provenance) &&
      !hasValue((profile.identity || {}).businessEmail)) {
    flags.push({ type: "MISSING_REQUIRED_DOCUMENT", severity: "INFO", message: "No identity evidence uploaded yet." });
  }
  const govDeploy = profile.deployment && hasValue(profile.deployment.previousDeployments) && profile.deployment.hasGovernmentDeployment;
  if (!govDeploy) {
    flags.push({ type: "MISSING_DEPLOYMENT_EVIDENCE", severity: "INFO", message: "No government deployment evidence provided." });
  }
  const tech = profile.technology || {};
  if (!hasValue(tech.coreCapabilities) && !hasValue(tech.technologies)) {
    flags.push({ type: "UNVERIFIED_CAPABILITY", severity: "WARN", message: "No structured capabilities declared." });
  }
  const security = profile.security || {};
  if (!hasValue(security.privacyCompliance) && !hasValue(security.dataProtectionMeasures)) {
    flags.push({ type: "INCOMPLETE_SECURITY", severity: "WARN", message: "Security / compliance information incomplete." });
  }
  for (const cert of certifications || []) {
    if (cert.expiryStatus === "EXPIRED") {
      flags.push({ type: "EXPIRED_CERTIFICATE", severity: "WARN", message: `Expired certificate: ${cert.name || "unknown"}.` });
    }
  }
  return flags;
}

/* ───────── Part 29/30: profile health (dimensions kept separate) ───────── */
export function computeProfileHealth(profile, opts = {}) {
  const completeness = computeCompleteness(profile);
  const { verifications = [], flags = [], certifications = [] } = opts;
  const sections = PROFILE_VERIFICATION_SECTIONS.length;
  let covered = 0;
  for (const v of verifications || []) {
    if (v.status && v.status !== "NOT_PROVIDED") covered++;
  }
  const evidenceCoverage = Math.round((covered / Math.max(1, sections)) * 100);
  const verified = (verifications || []).filter((v) => v.status === "VERIFIED").length;
  const verificationScore = Math.round((verified / Math.max(1, sections)) * 100);
  const critical = (flags || []).filter((f) => f.severity === "CRITICAL").length;
  return {
    completeness: completeness.score,
    evidenceCoverage,
    verification: verificationScore,
    criticalIssues: critical,
  };
}

/* ───────── Part 39: matching-ready representation ─────────
   Structured input for the FUTURE matching engine. NOT a score. */
export function matchingReady(profile, opts = {}) {
  const p = profile || {};
  const identity = p.identity || {};
  const business = p.business || {};
  const tech = p.technology || {};
  const useCases = p.useCases || {};
  const deployment = p.deployment || {};
  const geography = p.geography || {};
  const securities = p.security || {};
  return {
    startup: { name: identity.name, legalEntityName: identity.legalEntityName },
    sectors: arr(business.sector, business.industry),
    capabilities: (opts.capabilities || []).map((c) => ({ key: c.capabilityKey || c.key, label: c.label || c.key })),
    technologies: arr(tech.technologies, tech.coreCapabilities),
    use_cases: arr(useCases.primary, useCases.problemDomains, useCases.government),
    deployment_domains: arr(deployment.previousDeployments && deployment.previousDeployments.map((d) => d.domain)),
    geographies: arr(geography.operatingRegions, geography.deploymentRegions),
    pilot_readiness: {
      ready: deploymentAvailable(p.pilot ? p.pilot.ready : null),
      teamAvailable: p.pilot ? p.pilot.pilotTeamAvailable : null,
      estimatedDurationDays: p.pilot ? p.pilot.estimatedDurationDays : null,
    },
    security: {
      privacyCompliance: securities.privacyCompliance,
      dataProtectionMeasures: securities.dataProtectionMeasures,
    },
    verification: (opts.verification || {}),
    evidence: (opts.evidence || []).map((e) => ({ section: e.section, field: e.field, status: e.status })),
  };
}
function arr(...cols) {
  const out = [];
  for (const c of cols) {
    if (Array.isArray(c)) out.push(...c.map((x) => (x && typeof x === "object" ? x.name || x.label : x)));
    else if (typeof c === "string" && c.trim()) out.push(c.trim());
  }
  return [...new Set(out.filter(Boolean))];
}
function deploymentAvailable(v) {
  if (v == null) return null;
  if (typeof v === "boolean") return v;
  return /true|yes|ready/i.test(String(v));
}

/* ───────── lean object sanitize helpers (router/store use these) ───────── */
function asStr(v, max) { return safeString(v, max); }
function asBool(v) { return v === true || v === "true" || v === 1 || v === "1"; }
function asNum(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function asDate(v) {
  if (v == null || v === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function objectOf(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }

export function prepareProfile(raw) {
  raw = objectOf(raw);
  const startupId = raw.startupId;
  // startup_id validated by caller (store/router) — keep here for completeness
  const sections = ["identity", "startupStatus", "business", "technology", "useCases",
    "deployment", "team", "geography", "scalability", "pilot", "security"];
  const profile = {};
  for (const s of sections) {
    const incoming = raw[s] || {};
    profile[s] = objectOf(incoming);
  }
  // allow direct top-level identity convenience fields too
  for (const k of ["name", "legalEntityName", "companyType"]) {
    if (raw[k] != null && profile.identity[k] == null) profile.identity[k] = raw[k];
  }
  const attributes = objectOf(raw.attributes);
  return {
    startupId: startupId || null,
    profileJson: profile,
    attributes,
    profileStatus: raw.profileStatus == null || raw.profileStatus === "" ? "DRAFT" : String(raw.profileStatus),
    isDemo: asBool(raw.isDemo),
  };
}

export function prepareCertification(raw) {
  raw = objectOf(raw);
  const startupId = raw.startupId;
  return {
    startupId: startupId || null,
    name: asStr(raw.name, 200),
    issuer: asStr(raw.issuer, 200),
    issuedDate: asDate(raw.issuedDate),
    expiryDate: asDate(raw.expiryDate),
    evidenceDocumentId: raw.evidenceDocumentId || null,
    source: PROFILE_PROVENANCE.includes(raw.source) ? raw.source : "USER_PROVIDED",
  };
}

export function prepareEvidence(raw) {
  raw = objectOf(raw);
  return {
    startupId: raw.startupId || null,
    section: asStr(raw.section, 60),
    field: asStr(raw.field, 80),
    claim: asStr(raw.claim, 2000),
    provenance: PROFILE_PROVENANCE.includes(raw.provenance) ? raw.provenance : "USER_PROVIDED",
    verificationStatus: FIELD_VERIFICATION_STATUSES.includes(raw.verificationStatus)
      ? raw.verificationStatus : "REVIEW_REQUIRED",
    documentId: raw.documentId || raw.evidenceDocumentId || null,
    pageRef: asStr(raw.pageRef, 50),
    confidence: raw.confidence != null ? Math.min(100, Math.max(0, Number(raw.confidence))) : null,
  };
}

export function prepareProfileVerification(raw) {
  raw = objectOf(raw);
  const status = raw.status || "REVIEW_REQUIRED";
  return {
    startupId: raw.startupId || null,
    section: asStr(raw.section, 60).toUpperCase(),
    field: asStr(raw.field, 80),
    status: FIELD_VERIFICATION_STATUSES.includes(status) ? status : "REVIEW_REQUIRED",
    source: PROFILE_PROVENANCE.includes(raw.source) ? raw.source : "USER_PROVIDED",
    confidence: raw.confidence != null ? Math.min(100, Math.max(0, Number(raw.confidence))) : null,
    note: asStr(raw.note, 2000),
    evidenceId: raw.evidenceId || null,
  };
}

export function prepareFlag(raw) {
  raw = objectOf(raw);
  return {
    startupId: raw.startupId || null,
    type: FLAG_TYPES.includes(raw.type) ? raw.type : "CONTRADICTION",
    severity: ["INFO", "WARN", "CRITICAL"].includes(raw.severity) ? raw.severity : "INFO",
    message: asStr(raw.message, 1000),
    ref: asStr(raw.ref, 200),
    status: raw.status == null ? "OPEN" : (raw.status === "RESOLVED" ? "RESOLVED" : "OPEN"),
  };
}

export function prepareAiSuggestion(raw) {
  raw = objectOf(raw);
  return {
    startupId: raw.startupId || null,
    kind: AI_SUGGESTION_KINDS.includes(raw.kind) ? raw.kind : "CAPABILITY",
    label: asStr(raw.label, 200),
    data: objectOf(raw.data),
    status: SUGGESTION_STATUSES.includes(raw.status) ? raw.status : "PENDING",
    model: asStr(raw.model, 200),
    promptVersion: asStr(raw.promptVersion, 100),
    mode: raw.mode === "AI" ? "AI" : "DETERMINISTIC",
  };
}

/* ───────── Part 26: build the AI extraction prompt (grounded) ───────── */
export function buildExtractionPrompt(profile, lang) {
  const p = profile || {};
  const facts = {
    name: p.identity && p.identity.name,
    description: p.business && p.business.description,
    products: (p.business && p.business.products) || [],
    coreCapabilities: (p.technology && p.technology.coreCapabilities) || [],
    technologies: (p.technology && p.technology.technologies) || [],
    useCases: (p.useCases && p.useCases.primary) || [],
    sectors: [p.business && p.business.sector, p.business && p.business.industry].filter(Boolean),
    deploymentDomains: (p.deployment && p.deployment.previousDeployments || []).map((d) => d && d.domain).filter(Boolean),
  };
  const langHint = lang && lang !== "en" ? `Respond in ${lang} for display strings.` : "";
  return [
    {
      role: "system",
      content: `${langHint} You extract structured, machine-readable attributes from a startup profile. Return ONLY JSON with this exact shape: {"technologies":[],"capabilities":[],"sectors":[],"use_cases":[],"deployment_domains":[]}. Each is an array of short label strings. Never invent facts not present. You are an attribute extractor, not a verifier.`,
    },
    {
      role: "user",
      content: `Startup profile facts:\n${JSON.stringify(facts, null, 2)}\n\nReturn the structured extraction JSON only.`,
    },
  ];
}

/* ───────── Part 10: AI capability extraction with deterministic fallback ─────────
   Always returns suggestions that require human confirmation (PENDING).
   Never writes to the canonical profile. Never marks inferred data VERIFIED. */
export async function extractProfileSuggestions({ ai, profile, lang = "en", endpoint = "/api/sih/startup/profile/analyze" }) {
  const fallback = () => {
    const p = profile || {};
    const tech = p.technology || {};
    const suggestions = [];
    const push = (kind, label) => {
      if (label) suggestions.push({ kind, label, data: { suggested: true }, status: "PENDING" });
    };
    for (const t of arr(tech.technologies, tech.coreCapabilities)) push("TECHNOLOGY", t);
    const sectors = arr(p.business && p.business.sector);
    for (const s of sectors) push("SECTOR", s);
    if (p.useCases && Array.isArray(p.useCases.primary)) for (const u of p.useCases.primary) push("USE_CASE", u);
    return { suggestions, mode: "DETERMINISTIC", model: "", modelVersion: "", promptVersion: "startup-extract-v1" };
  };

  const configured = ai && typeof ai.isConfigured === "function" ? ai.isConfigured() : false;
  if (!configured) return fallback();
  if (typeof ai.complete !== "function") return fallback();

  try {
    const messages = buildExtractionPrompt(profile, lang);
    const out = await ai.complete({ messages, endpoint });
    const text = typeof out === "string" ? out : (out && (out.content || out.text)) || "";
    const json = extractJson(text);
    if (!json) return fallback();
    const kindMap = {
      technologies: "TECHNOLOGY", capabilities: "CAPABILITY", sectors: "SECTOR",
      use_cases: "USE_CASE", deployment_domains: "DEPLOYMENT_DOMAIN",
    };
    const suggestions = [];
    for (const key of Object.keys(kindMap)) {
      const list = Array.isArray(json[key]) ? json[key] : [];
      for (const item of list) {
        const label = typeof item === "string" ? item : (item && item.label) || (item && item.name);
        if (label && typeof label === "string" && label.trim()) {
          suggestions.push({ kind: kindMap[key], label: label.trim(), data: { suggested: true }, status: "PENDING" });
        }
      }
    }
    if (!suggestions.length) return fallback();
    const model = (ai.model && ai.model()) || "";
    return { suggestions, mode: "AI", model, modelVersion: "", promptVersion: "startup-extract-v1" };
  } catch (err) {
    return fallback();
  }
}

function extractJson(text) {
  if (!text) return null;
  let s = String(text).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(s.slice(start, end + 1)); } catch (_) {}
  }
  return null;
}
