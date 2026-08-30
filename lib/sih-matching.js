/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — Intelligent Startup Matching orchestration (Parts 41-58)
   Wires the existing deterministic engine (lib/sih-domain.js) to the
   persistence layer (lib/sih-store.js).

   HARD GATE: eligibility decides WHO is ranked; matching decides the
   ranking. Ineligible / unknown-eligibility startups are never scored
   into the ranked pool (Parts 1, 3). Scores are 0-1, confidence is a
   SEPARATE metric, every result is an immutable snapshot, and No AI is
   used anywhere in this layer.
   ═══════════════════════════════════════════════════════════════════ */
import { AppError } from "./errors.js";
import * as dom from "./sih-domain.js";

/* Ranked tiers in display-priority order (eligible first, warnings next,
   conditional last). REVIEW_POOL and EXCLUDED never enter the ranking. */
const RANKED_TIERS = new Map([
  ["RANKED", 0],
  ["RANKED_WITH_WARNING", 1],
  ["RANKED_CONDITIONAL", 2],
]);

/* The engine's default weights (Problem 25, Capability 20, Technology 15,
   Use-Case 10, Deployment 10, Pilot 10, Geography 5, Evidence 5; the rest
   declared at weight 0). Mirrors the default inside sih-domain.js. */
export function defaultMatchingConfiguration(challengeId) {
  const weights = {
    PROBLEM_FIT: 25, CAPABILITY_FIT: 20, TECHNOLOGY_FIT: 15,
    USE_CASE_FIT: 10, DEPLOYMENT_EXPERIENCE: 10, PILOT_READINESS: 10,
    GEOGRAPHIC_FIT: 5, EVIDENCE_STRENGTH: 5,
  };
  return dom.prepareMatchingConfiguration({
    challengeId,
    configVersion: 1,
    dimensions: dom.MATCH_DIMENSIONS.map((key) => ({ key, weight: weights[key] || 0 })),
  });
}

/* Validate + persist an explicit configuration (versioned). Throws 400 on
   incomplete/duplicate/unknown weights — never silently normalizes. */
export async function saveMatchingConfiguration({ store, challengeId, raw, createdBy }) {
  const dimensions = Array.isArray(raw.dimensions)
    ? raw.dimensions
    : Object.entries(raw.weights || {}).map(([key, weight]) => ({ key, weight }));
  const prepared = dom.prepareMatchingConfiguration({ ...raw, challengeId, dimensions });
  const check = dom.validateMatchingWeights(prepared.activeDimensions);
  if (!check.valid) {
    throw new AppError(400, "VALIDATION_FAILED", check.message);
  }
  return store.upsertMatchingConfiguration({
    challengeId,
    dimensions: prepared.dimensions,
    activeDimensions: prepared.activeDimensions,
    totalWeight: prepared.totalWeight,
    complete: true,
    normalized: false,
    createdBy,
    changeReason: (raw && raw.changeReason) || "Configuration updated",
  });
}

/* Trusted configuration for a run: explicit stored config > default. */
async function resolveRunConfiguration({ store, challengeId }) {
  const stored = await store.getMatchingConfiguration(challengeId);
  if (stored && stored.complete) return stored;
  if (stored) {
    const check = dom.validateMatchingWeights(stored.activeDimensions || stored.dimensions || []);
    if (check.valid) return { ...stored, complete: true };
  }
  return defaultMatchingConfiguration(challengeId);
}

/* Latest eligibility snapshot per startup for a challenge → HARD GATE pool. */
export async function buildMatchingPool({ store, challengeId }) {
  const snapshots = await store.listEligibilitySnapshots(challengeId, null);
  const latest = new Map();
  for (const s of snapshots) {
    if (!latest.has(s.startupId)) latest.set(s.startupId, s);
  }
  const entries = [];
  for (const [startupId, snapshot] of latest) {
    const pool = dom.MATCHING_POOL_TYPES[snapshot.overallStatus] || "EXCLUDED";
    entries.push({ startupId, snapshot, pool, eligibilityStatus: snapshot.overallStatus });
  }
  const rankable = entries.filter((e) => RANKED_TIERS.has(e.pool));
  const fullyEligible = entries.filter((e) => e.pool === "RANKED").length;
  const conditional = entries.filter((e) => e.pool === "RANKED_CONDITIONAL").length;
  const review = entries.filter((e) => e.pool === "REVIEW_POOL");
  const excludedCount = entries.length - rankable.length - review.length;
  const snapshotCount = new Set(entries.map((e) => e.startupId)).size;
  return {
    entries,
    rankable,
    review,
    counts: {
      candidateCount: snapshotCount,
      eligibleCount: fullyEligible,
      rankableCount: rankable.length,
      conditionalCount: conditional,
      reviewCount: review.length,
      excludedCount,
    },
  };
}

/* Per-startup matching with per-startup error isolation (Part 55). */
async function matchOne({ store, challenge, entry, configuration, nowTs }) {
  const startup = await store.getStartup(entry.startupId);
  if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");
  const intel = await store.getStartupIntelligence(entry.startupId);
  const rep = dom.buildStartupRepresentation({ ...intel, startup });

  const res = dom.runMatchingEngine({
    challenge,
    startup,
    startupRepresentation: rep,
    eligibility: { overallStatus: entry.eligibilityStatus, id: entry.snapshot.id },
    configuration,
    nowTs,
  });

  const shortlist = await store.getShortlist(entry.snapshot.challengeId, entry.startupId);

  return {
    startup,
    res,
    startupProfileVersion: (intel.profile && intel.profile.updatedAt) || "",
    shortlist,
  };
}

/* Full pipeline: gate → rank → persist snapshot (Parts 3, 21-24, 41-42). */
export async function runChallengeMatching({
  store,
  challengeId,
  requestedBy,
  triggerReason = "MANUAL_RUN",
  configuration = null,
  nowTs = null,
}) {
  const ts = nowTs || new Date().toISOString();
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");

  /* Explicit configuration callers pass the ALREADY-PERSISTED, versioned
     config (see router POST run / PATCH configuration). Re-saving here would
     bump the config version on every re-run, so we trust that call path.
     Otherwise fall back to the stored default (no mutation on read). */
  let cfg = configuration || (await resolveRunConfiguration({ store, challengeId }));

  const pool = await buildMatchingPool({ store, challengeId });
  const run = await store.createMatchingRun({
    challengeId,
    status: "RUNNING",
    engineVersion: dom.MATCHING_ENGINE_VERSION,
    configVersion: cfg.configVersion || 1,
    candidateCount: pool.counts.candidateCount,
    eligibleCount: pool.counts.eligibleCount,
    retrievedCount: 0,
    rerankedCount: 0,
    embeddingModel: "deterministic-token-v1",
    startedAt: ts,
    triggerReason,
    createdBy: requestedBy,
    isDemo: !!challenge.isDemo,
  });

  const errors = [];
  const computed = [];
  for (const entry of pool.rankable) {
    try {
      const m = await matchOne({ store, challenge, entry, configuration: cfg, nowTs: ts });
      computed.push({ ...m, entry, eligibilitySnapshotId: entry.snapshot.id, eligibilityStatus: entry.eligibilityStatus, pool: entry.pool });
    } catch (err) {
      errors.push(`${entry.startupId}: ${err.message}`);
    }
  }

  /* tier ordering first, then match score desc, then confidence desc */
  computed.sort((a, b) => {
    const t = (RANKED_TIERS.get(a.pool) ?? 9) - (RANKED_TIERS.get(b.pool) ?? 9);
    if (t !== 0) return t;
    const s = (b.res.matchScore || 0) - (a.res.matchScore || 0);
    if (s !== 0) return s;
    return (b.res.matchConfidence || 0) - (a.res.matchConfidence || 0);
  });

  const results = [];
  for (let i = 0; i < computed.length; i++) {
    const item = computed[i];
    const rank = i + 1;
    const result = await store.createMatchingResult({
      runId: run.id,
      challengeId,
      startupId: item.startup.id,
      rank,
      eligibilitySnapshotId: item.eligibilitySnapshotId,
      eligibilityStatus: item.eligibilityStatus,
      eligibilityPool: item.pool,
      matchScore: item.res.matchScore,
      matchConfidence: item.res.matchConfidence,
      dimensionResults: item.res.dimensionResults,
      strengths: item.res.strengths,
      gaps: item.res.gaps,
      riskFlags: item.res.riskFlags,
      evidence: evidenceSummary(item.res.startupRepresentation),
      explanation: item.res.explanation,
      startupProfileVersion: item.startupProfileVersion,
      stale: false,
      createdBy: requestedBy,
    });
    await store.createMatchingDimensionResults(
      (item.res.dimensionResults || []).map((d) => ({
        matchingResultId: result.id,
        key: d.key,
        score: d.score,
        weight: d.weight,
        state: d.state,
        note: d.note || "",
        rowsJson: d.rows || null,
      }))
    );
    results.push({ ...result, startup: item.startup, shortlisted: !!item.shortlist });
  }

  const durationMs = Math.max(1, Date.now() - new Date(ts).getTime());
  const status = !computed.length && pool.rankable.length ? "FAILED" : errors.length ? "PARTIAL" : "COMPLETED";
  const finished = await store.patchMatchingRun(run.id, {
    status,
    retrievedCount: computed.length,
    rerankedCount: computed.length,
    completedAt: nowTs || new Date().toISOString(),
    durationMs,
    errorSummary: errors.slice(0, 5).join(" | "),
  });

  return { ...finished, results, pool: pool.counts, errors };
}

/* Lightweight evidence summary for a result card (states, never scores). */
function evidenceSummary(su) {
  const ver = (su.verifications || []).filter((v) => v.status === "VERIFIED").length;
  const ev = (su.evidence || []).filter((e) => e.verificationStatus === "VERIFIED").length;
  const docs = (su.documents || []).length;
  const certs = (su.certifications || []).length;
  return { verifiedVerifications: ver, verifiedEvidence: ev, documents: docs, certifications: certs };
}

/* Latest completed run for a challenge, with results + startup labels. */
export async function latestChallengeMatching({ store, challengeId }) {
  const runs = await store.listMatchingRuns(challengeId);
  const run = runs[0] || null;
  if (!run) return { run: null, results: [] };
  const rows = await store.listMatchingResultsByRun(run.id);
  const results = await Promise.all(rows.map(async (r) => {
    const startup = await store.getStartup(r.startupId);
    const actions = await store.listHumanMatchingActions(r.challengeId);
    return {
      ...r,
      startup: startup ? { id: startup.id, brandName: startup.brandName, legalName: startup.legalName, sector: startup.sector, isDemo: startup.isDemo } : null,
      actions: actions.filter((a) => a.startupId === r.startupId).slice(0, 5),
    };
  }));
  const shortlists = await store.listShortlists(challengeId);
  return { run, results, shortlists };
}

/* Single result detail: dimension rows + shortlist + human actions. */
export async function matchingResultDetail({ store, resultId }) {
  const result = await store.getMatchingResult(resultId);
  if (!result) return null;
  const [dimensions, run, startup, shortlist, actions] = await Promise.all([
    store.listMatchingDimensionResults(resultId),
    store.getMatchingRun(result.runId),
    store.getStartup(result.startupId),
    store.getShortlist(result.challengeId, result.startupId),
    store.listHumanMatchingActions(result.challengeId),
  ]);
  return {
    ...result,
    dimensions,
    run,
    startup: startup ? { id: startup.id, brandName: startup.brandName, legalName: startup.legalName, sector: startup.sector, state: startup.state, isDemo: startup.isDemo } : null,
    shortlisted: !!shortlist,
    shortlist,
    actions: actions.filter((a) => a.startupId === result.startupId).slice(0, 20),
  };
}

/* Stale detection helper for reads (Part 44). */
export async function isLatestMatchingCurrent({ store, challenge }) {
  const runs = await store.listMatchingRuns(challenge.id);
  const run = runs[0];
  if (!run) return { current: true, stale: false };
  const config = await store.getMatchingConfiguration(challenge.id);
  const stale = dom.isMatchStale(run, null, (config && config.configVersion) || null, false);
  const results = await store.listMatchingResultsByRun(run.id);
  if (!stale) {
    for (const r of results) {
      if (r.stale) return { current: false, stale: true, run };
    }
  }
  return { current: !stale, stale, run };
}