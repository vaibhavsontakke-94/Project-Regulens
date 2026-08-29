/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — decoupled REGULENS prompt-layer integration (additive)
   ───────────────────────────────────────────────────────────────────
   Decouples the "build the grounded LLM dataset + system prompt" logic
   previously inlined in server.js's /api/gov/copilot so the SAME prompt
   layer can also be driven by SIH26136 procurement/match context.

   DESIGN RULES
   - The SIH block injected into the prompt is made ONLY of deterministic,
     already-computed facts read from the SIH store (verification status,
     eligibility results, match scores, evaluation scores, pilot results).
   - This module NEVER asks the model to compute a score, verdict or
     eligibility decision — those are computed by the deterministic SIH
     layer and only *presented* here. If facts are missing, the prompt
     says so (honest empty state) rather than letting the model guess.
   - All AI calls are grounded: the system prompt forbids inventing
     numbers, authorities, URLs or dates.
   ═══════════════════════════════════════════════════════════════════ */
import { AppError } from "./errors.js";
import { logError, newRef } from "./log.js";

const LANG_LABELS = {
  en: "English", es: "Spanish", fr: "French", hi: "Hindi", de: "German",
  pt: "Portuguese", ru: "Russian", ja: "Japanese", zh: "Chinese",
  ko: "Korean", mr: "Marathi",
};

function langLabelOf(lang) {
  return LANG_LABELS[String(lang || "en").toLowerCase()] || "English";
}

/* ═══════════════ decoupled gov copilot prompt construction ═══════════
   Ported verbatim from server.js /api/gov/copilot so that endpoint keeps
   byte-identical behaviour while the prompt-building lives here. */

export function buildGovernmentDataset(pkg) {
  const ctx = pkg.context;
  return {
    context: {
      company: ctx.company, product: ctx.product,
      origin: ctx.originName, target: ctx.targetName, industry: ctx.industryName,
    },
    dashboard: pkg.dashboard.totals,
    readiness: { score: pkg.dashboard.readiness.score, status: pkg.dashboard.readiness.status },
    verdict: { state: pkg.dashboard.verdict.state, reasons: (pkg.dashboard.verdict.reasons || []).map((r) => r.label) },
    policies: pkg.policies.map((p) => ({
      code: p.code, title: p.title, authority: p.authority, type: p.policyType,
      status: p.status, effectiveDate: p.effectiveDate, impact: p.overall,
      impactLevel: p.impactLevel, relevance: p.relevance,
      obligationsCount: p.obligationsCount,
      sourceVerified: !!(p.source && p.source.verified && p.source.url),
    })),
    topRisks: pkg.dashboard.topRisks.map((r) => ({ title: r.title, severity: r.severity, probability: r.probability, impact: r.impact, mitigation: r.mitigation })),
    stakeholderGroups: pkg.stakeholders.groups.slice(0, 6).map((g) => ({ group: g.group, maxImpact: g.maxImpact, level: g.impactLevel, concern: g.concerns[0] || "" })),
    outcomesShortTerm: pkg.outcomes.shortTerm.slice(0, 4).map((o) => ({ title: o.title, likelihood: o.probability, severity: o.severity })),
    industryTop: [...pkg.industryMatrix].sort((a, b) => b.burdenScore - a.burdenScore).slice(0, 5).map((m) => ({ industry: m.industryName, burden: m.burdenScore, level: m.riskLevel })),
    actionPlan: {
      totalCostUSD: pkg.actionPlan.totalCost, totalDays: pkg.actionPlan.timeline.totalDays,
      actions: pkg.actionPlan.actions.length,
      criticalPath: (pkg.actionPlan.timeline.criticalPath || []).slice(0, 5).map((c) => c.title),
    },
    workloadAssumptions: pkg.actionPlan.assumptions,
    consultations: pkg.consultations.records.map((c) => ({ title: c.title, status: c.status, window: c.window, authority: c.authority })),
    sourceIntegrity: pkg.dashboard.sourceIntegrity,
    disclaimers: pkg.meta.disclaimers,
  };
}

export function buildGovernmentSystemPrompt(targetName, langLabel, extraRules = "") {
  return (
    `You are ReguLens Government Copilot, an executive policy-intelligence assistant for ${targetName}.\n` +
    `Answer STRICTLY from the JSON dataset below — it is derived from ReguLens's verified policy database and deterministic engines.\n` +
    `RULES:\n` +
    `- NEVER invent laws, authorities, URLs, statistics or dates not present in the dataset.\n` +
    `- Modelled estimates (costs, days, probabilities, scores) must be presented as MODELLED ESTIMATES, never as facts.\n` +
    `- Cite instruments with their [CODE] when you use them.\n` +
    `- If the dataset does not contain the answer, say so plainly and suggest what to check next.\n` +
    `- Be concise, executive-grade, structured with short bullets where helpful.\n` +
    `- WRITE THE ENTIRE ANSWER IN ${langLabel}.\n` +
    (extraRules ? extraRules + "\n" : "")
  );
}

export function pickCitations(pkg, answer) {
  return pkg.policies
    .filter((p) => p.code && answer.includes(p.code))
    .map((p) => ({ code: p.code, title: p.title }));
}

/* ═══════════════════ SIH grounded block builder ═════════════════════
   Turns deterministic SIH facts into a compact, JSON-safe, fully
   grounded context object. Any field that is missing/unverified is
   reported as "unknown" so the model never invents it. */

function summarizeCapabilities(list) {
  return (list || []).map((c) => ({
    category: c.category || (c.capability && c.capability.category) || null,
    key: c.key || (c.capability && c.capability.key) || null,
    name: c.name || (c.capability && c.capability.name) || null,
    level: c.level || null,
    source: c.source || "DECLARED",
  }));
}

function summarizeEligibility(checks) {
  return (checks || []).map((c) => ({
    name: c.name || null,
    verdict: c.verdict || c.result || null,
    notes: c.notes || null,
    checkedAt: c.checkedAt || c.createdAt || null,
  }));
}

export function buildSihGrounded({ startup, capabilities, verifications, challenge, match, eligibility, evaluation }) {
  const s = startup || {};
  const verified = (verifications || []).find((v) => v.status === "VERIFIED");
  return {
    startup: {
      legalName: s.legalName || null,
      brandName: s.brandName || null,
      sector: s.sector || null,
      stage: s.stage || null,
      dpiitStatus: s.dpiitStatus || "NOT_MARKED",
      startupStatus: s.startupStatus || null,
      verificationStatus: s.verificationStatus || "UNVERIFIED",
    },
    verification: verified ? {
      type: verified.type || null,
      source: verified.source || null,
      verifiedAt: verified.verifiedAt || null,
      reference: verified.reference || null,
    } : null,
    declaredCapabilities: summarizeCapabilities(capabilities),
    challenge: challenge ? {
      title: challenge.title || null,
      challengeStatus: challenge.challengeStatus || null,
      objective: challenge.objective || null,
      budgetMin: challenge.budgetMin ?? null,
      budgetMax: challenge.budgetMax ?? null,
    } : null,
    match: match ? {
      overallScore: match.overallScore ?? null,
      explanation: match.explanation || null,
      matchKind: match.kind || match.matchKind || null,
    } : null,
    eligibility: summarizeEligibility(eligibility),
    evaluation: evaluation ? {
      status: evaluation.status || null,
      totalScore: evaluation.totalScore ?? null,
      maxScore: evaluation.maxScore ?? null,
      criteria: (evaluation.scores || []).map((sc) => ({
        criterionKey: sc.criterionKey || null,
        score: sc.score ?? null,
        maxScore: sc.maxScore ?? null,
      })),
    } : null,
    _provenance: {
      integrity: (verifications || []).some((v) => v.status === "VERIFIED" && v.source === "OFFICIAL")
        ? "Verified with OFFICIAL source."
        : "Startup verification is NOT confirmed against an OFFICIAL source.",
      disclaimer: "All fields above are stored records (inputs and deterministic outputs). They are decision SUPPORT, not an eligibility or procurement decision.",
    },
  };
}

/* ═══════════════ deterministic SIH-aware fallback ═══════════════════
   Used when AI is off or fails. Answers strictly from the facts block —
   never manufactured. This keeps the artifact usable and grounded even
   with no model configured. */

function capName(c) { return (c && (c.name || c.key)) || "—"; }

export function sihCopilotFallback(question, sih, pkg) {
  const q = String(question || "").toLowerCase();
  const citations = [];
  const cite = (s) => { if (s && !citations.includes(s)) citations.push(s); };
  const has = (...words) => words.some((w) => q.includes(w));
  const S = (sih && sih.startup) || {};
  const V = sih && sih.verification;
  const M = sih && sih.match;
  const E = sih && sih.eligibility;

  let answer = "";
  if (has("verif", "dpiit", "authentic", "official")) {
    const verified = V && V.source === "OFFICIAL";
    answer = verified
      ? `• Startup: ${S.brandName || S.legalName || "record"} (DPIIT status ${S.dpiitStatus}).\n• Verification: ${V.type || "startup"} confirmed via OFFICIAL source on ${V.verifiedAt || "—"} (ref ${V.reference || "—"}).`
      : `Startup: ${S.brandName || S.legalName || "record"}. Verification status is ${S.verificationStatus || "UNVERIFIED"} — NOT confirmed against an OFFICIAL source. Treat any claim as unverified.`;
    if (V) cite(S.brandName || "startup");
  } else if (has("match", "eligible", "eligib", "score", "fit")) {
    const lines = [];
    if (M && M.overallScore != null) {
      lines.push(`Match score ${M.overallScore}${M.maxScore ? "/" + M.maxScore : ""} (kind ${M.matchKind || "RULE_BASED"})`);
      if (M.explanation) lines.push(`Summary: ${M.explanation}`);
    } else if (E && E.length) {
      lines.push("Eligibility checks:");
      E.slice(0, 8).forEach((c) => lines.push(`• ${c.name}: ${c.verdict}`));
    } else {
      lines.push("No match or eligibility record is in the dataset for this challenge/startup.");
    }
    answer = lines.join("\n");
  } else if (has("evaluat", "proposal", "score")) {
    if (E && E.status) {
      answer = `Evaluation status: ${E.status}. Total ${E.totalScore}/${E.maxScore || "—"}.\n` +
        (E.criteria || []).map((c) => `• ${c.criterionKey}: ${c.score}${c.maxScore ? "/" + c.maxScore : ""}`).join("\n");
    } else {
      answer = "No evaluation record is in the dataset for this challenge/startup.";
    }
  } else if (has("capab", "skill", "offering", "technology")) {
    const caps = (sih && sih.declaredCapabilities) || [];
    answer = caps.length
      ? "Declared capabilities (source DECLARED unless noted):\n" + caps.map((c) => `• ${capName(c)} — ${c.level}`).join("\n")
      : "No declared capabilities are in the dataset.";
    caps.forEach((c) => cite(capName(c)));
  } else if (has("procure", "challenge", "pilot", "grant", "budget")) {
    const ch = (sih && sih.challenge) || {};
    answer = [
      ch.title ? `Challenge: ${ch.title}` : null,
      ch.challengeStatus ? `Status: ${ch.challengeStatus}` : null,
      (ch.budgetMin != null || ch.budgetMax != null) ? `Budget: ${ch.budgetMin ?? "—"} – ${ch.budgetMax ?? "—"}` : null,
      `Startup verification: ${S.verificationStatus || "UNVERIFIED"}`,
    ].filter(Boolean).join("\n");
    if (ch.title) cite(ch.title);
  } else {
    answer =
      `${S.brandName || S.legalName || "Startup"} (${S.sector || "unknown sector"}, ${S.stage || "stage not set"}).\n` +
      `• Verification: ${S.verificationStatus || "UNVERIFIED"}${V && V.source === "OFFICIAL" ? " — OFFICIAL" : " — NOT official"}\n` +
      `• Match score: ${M && M.overallScore != null ? M.overallScore : "none recorded"}\n` +
      `• Declared capabilities: ${((sih && sih.declaredCapabilities) || []).length}\n` +
      `Ask about: verification, matching/eligibility, evaluation, capabilities, or the challenge/procurement.`;
  }
  return { answer, citations, mode: "deterministic-fallback", grounded: true };
}

/* ═══════════════════ orchestration (shared by the SIH flow) ═════════
   Builds the same grounded artifact the REGULENS gov copilot produces,
   merged with the SIH facts block. Deps (ai, gov) are injected so tests
   can supply fakes and the real app wires the real modules. */
export async function sihCopilot({ ai, gov, question, lang, context, sih, endpoint = "/api/sih/insights/copilot" }) {
  const q = String(question || "").trim();
  if (!q) throw new AppError(400, "INVALID_REQUEST", "question is required");
  const langLabel = langLabelOf(lang);

  let pkg = null;
  if (gov && typeof gov.buildGovernmentPackage === "function") {
    try {
      pkg = gov.buildGovernmentPackage(context || {});
    } catch (err) {
      logError({ ref: newRef(), type: "SIH_GOV_PKG_FAILED", endpoint, cause: String(err && err.message) });
      pkg = null;
    }
  }

  const defSih = sih ? buildSihGrounded(sih) : null;
  const fallback = () => {
    if (!gov || !pkg) {
      return { answer: sihCopilotFallback(q, defSih, null).answer, citations: [], mode: "deterministic-fallback", grounded: true, lang: langLabel };
    }
    const base = gov.copilotFallback(q, pkg);
    const merged = sihCopilotFallback(q, defSih, pkg);
    return {
      answer: [merged.answer, base.answer].filter(Boolean).join("\n\n"),
      citations: [...new Set([...(merged.citations || []), ...(base.citations || [])])],
      mode: "deterministic-fallback",
      grounded: true,
      lang: langLabel,
    };
  };

  if (!ai || !ai.isConfigured || !ai.isConfigured()) return fallback();

  const dataset = pkg
    ? Object.assign({}, buildGovernmentDataset(pkg), defSih ? { sih: defSih } : {})
    : (defSih ? { sih: defSih } : {});

  const extraRules = defSih
    ? `- An additional "sih" block lists SIH26136 startup/matching records. Use ONLY the fields present in it. Never invent a score, verdict, verification or date. If a field is null or omitted, state it is not recorded. Present recorded scores/verdicts as stored outcomes, not as new decisions.`
    : "";

  let system;
  if (pkg) {
    system = buildGovernmentSystemPrompt(pkg.context.targetName, langLabel, extraRules) + "\nDATASET:\n" + JSON.stringify(dataset);
  } else {
    system = `You are the SIH26136 startup procurement insight assistant. Answer STRICTLY from the JSON dataset below; never invent numbers, authorities or dates.\n${extraRules}\nWRITE THE ENTIRE ANSWER IN ${langLabel}.\n\nDATASET:\n` + JSON.stringify(dataset);
  }

  try {
    const answer = await ai.complete({
      messages: [
        { role: "system", content: system },
        { role: "user", content: q },
      ],
      endpoint,
    });
    const citations = pkg ? pickCitations(pkg, answer) : [];
    if (defSih) {
      const S = defSih.startup || {};
      if (S.brandName && answer.includes(S.brandName)) citations.unshift({ code: "SIH-STARTUP", title: S.brandName });
    }
    return { answer: String(answer).trim(), citations, mode: "ai", grounded: true, lang: langLabel };
  } catch (err) {
    logError({ ref: newRef(), type: "SIH_COPILOT_AI_FAILED", endpoint, cause: String(err && err.message) });
    return fallback();
  }
}
