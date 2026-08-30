/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — Problem Policy Intelligence (additive, deterministic)
   ───────────────────────────────────────────────────────────────────
   Reuses the REAL policy records already shipped in the REGULENS
   Government Intelligence engine (lib/gov-policy-db.cjs) and its
   deterministic analyser (lib/gov-engine.cjs). 

   GROUNDING CONTRACT
   - This module NEVER fabricates policies, laws, schemes or obligations.
     Every entry is copied verbatim from the connected POLICY_DB.
   - "Schemes" are left as an honest empty list because the connected
     REGULENS policy database has no verified scheme registry — we surface
     that gap instead of inventing scheme names.
   - Impact scores are modelled estimates (baseRisk × weights, with an
     explicit trace); they are decision-support numbers, not facts.
   - When nothing matches, we return an honest empty state (never an
     invented "summary policy").
   ═══════════════════════════════════════════════════════════════════ */
import * as gov from "./gov-engine.cjs";

/* SIH sector / free-text hints → REGULENS industry registry ids. */
const INDUSTRY_HINTS = [
  ["health", "healthcare"], ["healthtech", "healthtech"], ["medical", "healthcare"],
  ["hospital", "healthcare"], ["clinic", "healthcare"], ["financ", "fintech"],
  ["fintech", "fintech"], ["bank", "banking-financial"], ["payment", "fintech"],
  ["insurance", "insurance"], ["education", "edtech"], ["learning", "edtech"],
  ["school", "edtech"], ["ecommerce", "ecommerce"], ["retail", "retail"],
  ["ai", "ai-ml"], ["machine learning", "ai-ml"], ["artificial intelligence", "ai-ml"],
  ["software", "saas"], ["cloud", "saas"], ["manufactur", "manufacturing"],
  ["factory", "manufacturing"], ["logistics", "logistics"], ["supply chain", "logistics"],
  ["transport", "logistics"], ["energy", "energy"], ["power", "energy"],
  ["electric", "energy"], ["automotive", "automotive"], ["telecom", "telecommunications"],
  ["pharma", "pharmaceuticals"], ["drug", "pharmaceuticals"], ["travel", "travel-tourism"],
  ["tourism", "travel-tourism"], ["food", "food-beverage"], ["gas", "energy"],
  ["water", "energy"], ["smart city", "telecommunications"], ["digital public", "ai-ml"],
];

const STOPWORDS = new Set([
  "the", "and", "for", "are", "with", "that", "this", "from", "have", "will", "was",
  "not", "but", "all", "any", "can", "has", "had", "into", "been", "more", "less",
  "such", "than", "then", "their", "them", "there", "these", "those", "when",
  "which", "while", "would", "should", "could", "your", "our", "its", "his", "her",
  "who", "how", "why", "what", "about", "also", "because", "between", "during",
  "each", "few", "many", "most", "other", "some", "only", "own", "same", "very",
]);

/* Map SIH sector text to REGULENS industry ids (best-effort, deterministic). */
export function detectIndustry(problem) {
  const text = [
    problem.sector, problem.department, problem.problemStatement, problem.requiredTechnology,
    Array.isArray(problem.technologyPreferences) ? problem.technologyPreferences.join(" ") : "",
  ].filter((x) => x).join(" ").toLowerCase();
  for (const [hint, id] of INDUSTRY_HINTS) {
    if (text.includes(hint)) return id;
  }
  return null;
}

export function detectCountry(problem) {
  const text = [
    problem.geography, problem.location, problem.department, problem.problemStatement,
  ].filter((x) => x).join(" ").toLowerCase();
  const inSignals = ["india", "maharashtra", "karnataka", "delhi", "tamil nadu", "gujarat", "west bengal", "telangana", "rajasthan", "uttar pradesh", "madhya pradesh", "kerala", "punjab", "haryana", "odisha", "assam", "bihar", "chhattisgarh", "jharkhand", "goa", "himachal", "uttarakhand"];
  if (inSignals.some((s) => text.includes(s))) return "in";
  /* SIH is a Government of India programme — India is the safe default,
     matching the existing demo datasets. */
  return "in";
}

function tokensOf(text) {
  const words = String(text || "").toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

function tokenScore(policy, bag) {
  const hay = `${policy.title} ${policy.policyType} ${policy.summary} ${(policy.obligations || []).join(" ")}`.toLowerCase();
  let score = 0;
  for (const tok of bag) {
    const re = new RegExp(`(^|[^a-z])${tok}([^a-z]|$)`, "i");
    if (re.test(hay)) {
      score += hay.includes(policy.title.toLowerCase()) && policy.title.toLowerCase().includes(tok) ? 6 : 3;
    }
  }
  for (const ob of policy.obligations || []) {
    for (const tok of bag) {
      if (ob && ob.toLowerCase().includes(tok)) { score += 1; break; }
    }
  }
  return score;
}

function industryScore(policy, industryId, mappedIndustryId) {
  if (!industryId) return 0.5;
  const inds = policy.industries || [];
  if (inds.includes("all")) return 1.5;
  if (inds.includes(industryId)) return 3;
  if (mappedIndustryId && mappedIndustryId !== industryId && inds.includes(mappedIndustryId)) return 1.5;
  return 0.25;
}

/* Extract "technology restriction" style clauses straight from the real
   obligation text — heuristics only; never invented wording. */
function detectRestrictions(policy, techBag) {
  const clauses = [];
  const scan = [...(policy.obligations || []), policy.summary];
  const techRelevant = techBag.length > 0;
  for (const text of scan) {
    if (!text) continue;
    const lower = String(text).toLowerCase();
    const hit = /restrict|prohibit|prohibited|ban|limited to|must not|cannot be|only to countries|require.*consent|retain for|retention|authoris|licen[cs]e|register|notified by the central|in india|local infrastructure|verifiable parental|consent/.test(lower);
    if (!hit) continue;
    if (techRelevant && !techBag.some((t) => lower.includes(t))) {
      // only surface tech restrictions when the clause is tech-related
      if (!/(data|digital|system|online|payment|transfer|log|network|software|service|infrastructure|electron|automated)/.test(lower)) continue;
    }
    clauses.push(String(text).trim().slice(0, 240));
    if (clauses.length >= 3) break;
  }
  return clauses;
}

const RESTRICTION_SIGNAL = /restrict|prohibited|must not|cannot be|ban|limited to|only to countries|requiring.*consent|verifiable parental|retain for/;

/* ───────────────────────────────────────────────────────────────────
   Main entry: deterministic, grounded policy intelligence for a problem.
   ─────────────────────────────────────────────────────────────────── */
export function problemPolicyIntelligence(problem) {
  const p = problem || {};
  const countryId = detectCountry(p);
  const industryId = detectIndustry(p);
  const country = gov.GOV_COUNTRIES[countryId] || { id: countryId, name: String(countryId || "").toUpperCase() };

  const bag = [
    ...tokensOf(p.requiredTechnology),
    ...tokensOf(p.expectedOutcome),
    ...tokensOf(Array.isArray(p.technologyPreferences) ? p.technologyPreferences.join(" ") : ""),
    ...tokensOf(p.problemStatement),
    ...tokensOf(p.sector),
    ...tokensOf(p.department),
  ];

  const candidates = gov.policiesForCountry(countryId) || [];
  const scored = candidates
    .map((pol) => {
      const q = tokenScore(pol, bag) + industryScore(pol, industryId, industryId);
      return { pol, q };
    })
    .filter((x) => x.q > 0)
    .sort((a, b) => b.q - a.q)
    .slice(0, 8);

  const industry = industryId ? (gov.INDUSTRIES || []).find((i) => i.id === industryId) || { id: industryId, name: industryId } : null;

  const policies = scored.map(({ pol, q }) => {
    const matchedVia = [];
    const inds = pol.industries || [];
    if (industryId) {
      if (inds.includes("all")) matchedVia.push("industry:horizontal (all sectors)");
      else if (inds.includes(industryId)) matchedVia.push(`industry:${industryId}`);
    }
    const hay = `${pol.title} ${pol.policyType} ${pol.summary} ${(pol.obligations || []).join(" ")}`.toLowerCase();
    let kw = 0;
    for (const tok of bag) {
      if (new RegExp(`(^|[^a-z])${tok}([^a-z]|$)`, "i").test(hay)) kw++;
    }
    if (kw) matchedVia.push(`keywords:${Math.min(kw, 3)}`);

    const analysis = gov.analyzePolicy(pol, {
      targetId: countryId, originId: countryId, industryId: industryId || undefined,
    });

    return {
      id: pol.id,
      title: pol.title,
      code: pol.code || "",
      authority: pol.authority || "",
      policyType: pol.policyType || "",
      status: pol.status || "",
      summary: pol.summary || "",
      relevance: Math.min(100, Math.round(20 + Math.min(q, 80))),
      matchedVia,
      impact: {
        score: analysis.overall,
        level: analysis.impactLevel,
        trace: analysis.trace,
      },
      obligationsCount: analysis.obligationsCount,
      obligations: (pol.obligations || []).slice(0, 20),
      source: pol.source || { name: "", url: "", verified: false },
      techRestrictions: RESTRICTION_SIGNAL.test(
        `${(pol.obligations || []).join(" ")} ${pol.summary}`
      ),
    };
  });

  /* Real technology-restriction snippets (from verified records only). */
  const technologyRestrictions = [];
  for (const pol of candidates) {
    if (technologyRestrictions.length >= 8) break;
    const clauses = detectRestrictions(pol, bag);
    for (const clause of clauses.slice(0, 2)) {
      technologyRestrictions.push({ policyId: pol.id, title: pol.title, note: clause });
    }
  }

  /* Compliance requirements = the verified obligations of matched policies. */
  const compliance = policies.map((pol) => ({
    policyId: pol.id,
    title: pol.title,
    type: pol.policyType,
    source: pol.source,
    items: pol.obligations.slice(0, 12),
  }));

  const warnings = [];
  if (candidates.length === 0) {
    warnings.push("No real policy records could be matched for this country in the connected REGULENS policy database.");
  } else if (policies.length === 0) {
    warnings.push("The connected policy database has records for this country but none matched this problem's description — no fabrications were inserted.");
  }
  if (industryId === null) {
    warnings.push("Could not map a REGULENS industry id from the problem sector — relevance matching is broad (keyword-only).");
  }

  return {
    mode: "deterministic",
    country,
    industry,
    matchedCount: policies.length,
    policies,
    compliance,
    technologyRestrictions,
    schemes: [],
    schemesNote: "No verified government scheme records are available in the connected REGULENS policy database; nothing was fabricated to fill this section.",
    warnings,
    checkedAt: new Date().toISOString(),
  };
}

/* Warning-level compliance flags for the problem quality check. */
export function problemPolicyFlags(problem) {
  const pi = problemPolicyIntelligence(problem);
  const flags = [];
  for (const pol of pi.policies || []) {
    if (pol.impact && Number(pol.impact.score) >= 55) {
      flags.push({
        policyId: pol.id,
        title: pol.title,
        severity: "warning",
        note: `Potential compliance attention — ${pol.title} (modelled impact ${pol.impact.level}). Review before publishing.`,
      });
    }
  }
  return flags;
}