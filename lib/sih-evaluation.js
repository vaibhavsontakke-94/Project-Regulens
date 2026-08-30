/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — Evaluation & Shortlist Intelligence orchestration
   (Parts 1-73, excluding Pilot Management/Procurement/Contract/Scale)

   Wires the deterministic engine (lib/sih-domain.js) to the persistence
   layer (lib/sih-store.js), extending the EXISTING evaluation system
   (templates/criteria/evaluations/scores) rather than duplicating it.

   HARD GATES:
   - Weights must equal 100 (never silently normalized for configuration).
   - Evaluators score 0-100 per criterion, independently and evidence-aware.
   - Aggregation is deterministic (MEAN default; MEDIAN/WEIGHTED_MEAN opt-in);
     variance/outliers are flagged, never auto-adjusted.
   - Confidence is a SEPARATE metric from the score (coverage × participation
     × agreement), never equal to the score.
   - The human decision requires decision-safety acknowledgement; blocking
     critical items cannot be silently bypassed.
   - AI is advisory only, with a deterministic fallback; AI never scores.
   ═══════════════════════════════════════════════════════════════════ */
import { AppError } from "./errors.js";
import * as dom from "./sih-domain.js";
import * as sia from "./sih-integration.js";

const SCORABLE = new Set(["NOT_STARTED", "IN_PROGRESS", "REOPENED", "DRAFT"]);
const SUBMITTED_STATES = new Set(["SUBMITTED", "LOCKED"]);

function adminRoles(role) {
  return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER"].includes(role);
}

export function defaultEvaluationConfiguration(challengeId) {
  return dom.prepareEvaluationConfiguration({ challengeId });
}

async function resolveConfig({ store, challengeId }) {
  const stored = await store.getEvaluationConfiguration(challengeId);
  if (stored) return stored;
  return defaultEvaluationConfiguration(challengeId);
}

async function activeCriteria({ store, templateId }) {
  const rows = await store.listActiveEvaluationCriteriaByTemplate(templateId);
  return rows.length ? rows : await store.listEvaluationCriteriaByTemplate(templateId);
}

async function eligibilitySnapshotFor({ store, challengeId, startupId }) {
  const rows = await store.listEligibilitySnapshots(challengeId, startupId);
  return rows[0] || null;
}

async function matchingContextFor({ store, challengeId, startupId }) {
  const results = await store.listMatchingResultsByChallenge(challengeId);
  const r = results.find((x) => x.startupId === startupId) || null;
  return r ? { matchScore: r.matchScore, matchConfidence: r.matchConfidence, eligibilityStatus: r.eligibilityStatus, rank: r.rank } : null;
}

async function shortlistFor({ store, challengeId, startupId }) {
  return store.getShortlist(challengeId, startupId);
}

/* Build the evidence-support map for active criteria (Part 28). Evidence is
   VERIFIED startup evidence/verifications/documents; each evidence-required
   criterion is supported when verified evidence exists. */
async function buildEvidenceSupport({ store, criteria, startupId }) {
  const intel = await store.getStartupIntelligence(startupId);
  const verified = [
    ...(intel.evidence || []).filter((e) => e.verificationStatus === "VERIFIED"),
    ...(intel.verifications || []).filter((v) => v.status === "VERIFIED"),
    ...(intel.documents || []).filter((d) => d.verificationStatus === "VERIFIED"),
  ];
  const hasEvidence = verified.length > 0;
  const evidence = {};
  for (const c of criteria || []) {
    if (c.evidenceRequired) evidence[c.key] = hasEvidence;
  }
  return { evidence, verifiedCount: verified.length, total: (criteria || []).length };
}

async function loadEvaluationsWithScores({ store, challengeId, startupId }) {
  const all = await store.listEvaluations(challengeId);
  const evs = all.filter((e) => !startupId || e.startupId === startupId);
  const withScores = [];
  for (const ev of evs) {
    const scores = await store.listEvaluationScores(ev.id);
    withScores.push({ ...ev, scores });
  }
  return withScores;
}

/* ───── 1. Configure a challenge's evaluation (Parts 2-7) ─────
   Persists or reuses the org-scoped template, upserts each criterion with a
   version bump when a substantive field changes, stores thresholds/method,
   and captures an immutable configuration version. Bewilders signals are
   rejected when active weights do not total 100. */
export async function saveChallengeEvaluation({ store, challengeId, actorUid, raw = {} }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");

  const existingConfig = await store.getEvaluationConfiguration(challengeId);
  const templateId = raw.templateId || (existingConfig && existingConfig.templateId);
  let template = templateId ? await store.getEvaluationTemplate(templateId) : null;

  /* fresh configuration carries a criteria set that must be persisted */
  if (!template) {
    const criteriaIn = Array.isArray(raw.criteria) ? raw.criteria : [];
    if (!criteriaIn.length && !raw.weights) {
      throw new AppError(400, "VALIDATION_FAILED", "criteria (or weights map) are required when no template exists");
    }
    const preparedCriteria = (criteriaIn.length ? criteriaIn : Object.entries(raw.weights || {}).map(([key, weight]) => ({ key, weight }))).map((c) =>
      dom.prepareEvaluationCriterion({ ...c, criterionStatus: c.criterionStatus || "ACTIVE", version: c.version || 1 })
    );
    const check = dom.validateEvaluationWeights(preparedCriteria);
    if (!check.valid) throw new AppError(400, "VALIDATION_FAILED", check.message);
    template = await store.createEvaluationTemplate({
      organizationId: challenge.organizationId,
      name: raw.name || `Evaluation — ${challenge.title || "challenge"}`,
      description: raw.description || "",
      isDefault: false,
      criteria: preparedCriteria,
    });
  } else {
    /* criteria overlay on an existing template: upsert with version bump */
    const overlay = Array.isArray(raw.criteria) ? raw.criteria.map((c) => dom.prepareEvaluationCriterion(c)) : [];
    const existingRows = await store.listEvaluationCriteriaByTemplate(template.id);
    for (const inc of overlay) {
      const prev = existingRows.find((r) => r.key === inc.key);
      if (prev) {
        const changed =
          prev.label !== inc.label || (prev.weight || 0) !== inc.weight ||
          prev.maxScore !== inc.maxScore || prev.minimumScore !== inc.minimumScore ||
          !!prev.mandatory !== inc.mandatory || !!prev.evidenceRequired !== inc.evidenceRequired ||
          prev.minimumScore !== inc.minimumScore;
        if (changed) {
          await store.patchEvaluationCriterion(prev.id, { ...inc, version: (prev.version || 1) + 1 });
        }
      } else {
        await store.createEvaluationCriterion({ ...inc, templateId: template.id });
      }
    }
    template = await store.getEvaluationTemplate(template.id);
  }

  const criteria = await activeCriteria({ store, templateId: template.id });
  const weightCheck = dom.validateEvaluationWeights(criteria);
  if (!weightCheck.valid) throw new AppError(400, "VALIDATION_FAILED", weightCheck.message);

  const preparedConfig = dom.prepareEvaluationConfiguration({ ...raw, challengeId, templateId: template.id });
  const config = await store.upsertEvaluationConfiguration({
    ...preparedConfig,
    templateId: template.id,
    engineVersion: dom.EVALUATION_ENGINE_VERSION,
    createdBy: actorUid,
    changeReason: (raw && raw.changeReason) || "Configuration updated",
  });

  return { configuration: config, template, criteria };
}

/* ───── 2. Read configured criteria + thresholds ───── */
export async function listChallengeEvaluationCriteria({ store, challengeId }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const config = await resolveConfig({ store, challengeId });
  const template = config.templateId ? await store.getEvaluationTemplate(config.templateId) : null;
  const criteria = template ? await activeCriteria({ store, templateId: template.id }) : [];
  return { configuration: config, template, criteria };
}

/* ───── 3. Assign evaluators (Part 19/56/64) ─────
   raw.assignments: [{ startupId, evaluatorUid, criteriaKeys? }] (a single
   object with one startupId + evaluatorUid list is also accepted). */
export async function assignEvaluators({ store, challengeId, actorUid, raw = {} }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const config = await resolveConfig({ store, challengeId });
  if (!config.templateId) {
    throw new AppError(400, "VALIDATION_FAILED", "Configure an evaluation template before assigning evaluators");
  }

  const assignments = Array.isArray(raw.assignments) ? raw.assignments.map((a) => ({ startupId: a.startupId, evaluatorUid: a.evaluatorUid, criteriaKeys: a.criteriaKeys })) : [];
  const singles = raw.evaluatorUids || [];
  for (const uid of (Array.isArray(singles) ? singles : [singles])) {
    if (uid) assignments.push({ startupId: raw.startupId, evaluatorUid: uid, criteriaKeys: raw.criteriaKeys });
  }

  const out = [];
  for (const a of assignments) {
    const prepared = dom.prepareEvaluatorAssignment({ ...a, challengeId, organizationId: challenge.organizationId });
    if (!prepared.startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required for every assignment");

    const existing = await store.getEvaluationByEvaluator(challengeId, prepared.startupId, prepared.evaluatorUid);
    const evaluation =
      existing ||
      (await store.createEvaluation({
        challengeId,
        startupId: prepared.startupId,
        templateId: config.templateId,
        organizationId: challenge.organizationId,
        evaluatorUid: prepared.evaluatorUid,
        status: "NOT_STARTED",
        isDemo: !!challenge.isDemo,
      }));

    const prior = await store.listEvaluatorAssignmentsByEvaluator(challengeId, prepared.evaluatorUid);
    const prevAssignment = prior.find((r) => r.startupId === prepared.startupId);
    const assignment =
      prevAssignment ||
      (await store.createEvaluatorAssignment({
        challengeId,
        startupId: prepared.startupId,
        organizationId: challenge.organizationId,
        evaluationId: evaluation.id,
        evaluatorUid: prepared.evaluatorUid,
        criteriaKeys: prepared.criteriaKeys,
        status: "ASSIGNED",
        assignedBy: actorUid,
      }));

    out.push({ assignment, evaluation });
  }
  return { assignments: out, count: out.length };
}

/* ───── 4. Evaluator workspace ─────
   Gov roles see every evaluation for the challenge; an EVALUATOR sees only
   their own assignments with scored state + comment requirements. */
export async function evaluatorWorkspace({ store, challengeId, actorUid, actorRole }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const criteria = await listChallengeEvaluationCriteria({ store, challengeId }).then((r) => r.criteria);
  const rows = await loadEvaluationsWithScores({ store, challengeId, startupId: null });
  const evaluationsRows = actorRole === "EVALUATOR" ? rows.filter((e) => e.evaluatorUid === actorUid) : rows;
  const evaluations = [];
  for (const ev of evaluationsRows) {
    const startup = await store.getStartup(ev.startupId);
    const summary = dom.computeEvaluationSummary({ criteria, scores: ev.scores, config: (await resolveConfig({ store, challengeId })) });
    const comments = await store.listEvaluationComments(ev.id);
    evaluations.push({
      ...ev,
      startup: startup ? { id: startup.id, brandName: startup.brandName, legalName: startup.legalName, isDemo: startup.isDemo } : null,
      summary,
      comments,
    });
  }
  return { challenge, configuration: await resolveConfig({ store, challengeId }), criteria, evaluations };
}

/* ───── 5. Score one criterion (Parts 15-17) ─────
   Existing scores are upserted; the evaluation moves to IN_PROGRESS. */
export async function scoreCriterion({ store, evaluationId, actorUid, actorRole, raw = {} }) {
  const evaluation = await store.getEvaluation(evaluationId);
  if (!evaluation) throw new AppError(404, "NOT_FOUND", "Evaluation not found");
  if (evaluation.evaluatorUid !== actorUid && !adminRoles(actorRole)) {
    throw new AppError(403, "FORBIDDEN", "Only the assigned evaluator (or an admin) can score this evaluation");
  }
  if (!SCORABLE.has(evaluation.status) && !SUBMITTED_STATES.has(evaluation.status)) {
    throw new AppError(409, "STATE_CONFLICT", `Evaluation status ${evaluation.status} does not allow scoring`);
  }
  if (SUBMITTED_STATES.has(evaluation.status)) {
    throw new AppError(409, "LOCKED", "Evaluation is submitted/locked and cannot be modified");
  }

  const entry = dom.prepareEvaluationScoreEntry({ ...raw, evaluationId });
  const config = await resolveConfig({ store, challengeId: evaluation.challengeId });
  const challengeCriteria = await listChallengeEvaluationCriteria({ store, challengeId: evaluation.challengeId }).then((r) => r.criteria);
  const known = challengeCriteria.find((c) => c.key === entry.criterionKey);
  if (!known) throw new AppError(400, "VALIDATION_FAILED", `Unknown criterion "${entry.criterionKey}" for this challenge`);
  if (entry.score > (known.maxScore ?? 100)) {
    throw new AppError(400, "VALIDATION_FAILED", `Score cannot exceed max_score ${known.maxScore ?? 100}`);
  }

  await store.addEvaluationScores([entry]);

  if (evaluation.status === "NOT_STARTED") {
    await store.patchEvaluationStatus(evaluation.id, "IN_PROGRESS");
  }
  const updated = await store.getEvaluationWithScores(evaluation.id);
  const scores = await store.listEvaluationScores(evaluation.id);
  const summary = dom.computeEvaluationSummary({ criteria: challengeCriteria, scores, config });

  /* record evaluator notes / required-reason comments as they arrive */
  if (raw.comment) {
    const preparedComment = dom.prepareEvaluationCommentEntry({
      evaluationId,
      criterionKey: entry.criterionKey,
      kind: raw.kind || "EVALUATOR_NOTE",
      comment: raw.comment,
      required: !!raw.required,
      reason: raw.reason || "",
      actorUid,
      actorRole,
    });
    await store.createEvaluationComment(preparedComment);
  }

  return { evaluation: updated, summary, score: entry };
}

/* ───── 6. Submit (Part 21/43) ─────
   All active criteria scored + required comments satisfied → SUBMITTED and an
   immutable SUBMISSION snapshot capturing the exact criterion versions,
   eligibility/matching context, scores, comments and summary. */
export async function submitEvaluation({ store, evaluationId, actorUid, actorRole }) {
  const evaluation = await store.getEvaluation(evaluationId);
  if (!evaluation) throw new AppError(404, "NOT_FOUND", "Evaluation not found");
  if (evaluation.evaluatorUid !== actorUid && !adminRoles(actorRole)) {
    throw new AppError(403, "FORBIDDEN", "Only the assigned evaluator (or an admin) can submit this evaluation");
  }
  if (SUBMITTED_STATES.has(evaluation.status)) {
    throw new AppError(409, "STATE_CONFLICT", "Evaluation is already submitted or locked");
  }
  if (!SCORABLE.has(evaluation.status)) {
    throw new AppError(409, "STATE_CONFLICT", `Evaluation status ${evaluation.status} does not allow submission`);
  }

  const { criteria, configuration } = await listChallengeEvaluationCriteria({ store, challengeId: evaluation.challengeId });
  const scores = await store.listEvaluationScores(evaluation.id);
  const comments = await store.listEvaluationComments(evaluation.id);
  const summary = dom.computeEvaluationSummary({ criteria, scores, config: configuration });

  if (!summary.complete) {
    throw new AppError(400, "INCOMPLETE", `All active criteria must be scored before submission (${summary.missingCount} missing).`);
  }
  for (const req of summary.commentsRequired) {
    const satisfied = comments.some((c) => c.criterionKey === req.criterionKey && (c.reason === req.reason || c.kind === "REASON"));
    if (!satisfied) {
      throw new AppError(400, "COMMENT_REQUIRED", `A comment is required for "${req.criterionKey}" (reason: ${req.reason}).`);
    }
  }

  const eligibility = await eligibilitySnapshotFor({ store, challengeId: evaluation.challengeId, startupId: evaluation.startupId });
  const matching = await matchingContextFor({ store, challengeId: evaluation.challengeId, startupId: evaluation.startupId });
  const shortlist = await shortlistFor({ store, challengeId: evaluation.challengeId, startupId: evaluation.startupId });

  const snapshot = await store.createEvaluationSnapshot({
    challengeId: evaluation.challengeId,
    startupId: evaluation.startupId,
    organizationId: evaluation.organizationId,
    evaluationId: evaluation.id,
    snapshotType: "SUBMISSION",
    snapshot: {
      engineVersion: dom.EVALUATION_ENGINE_VERSION,
      configurationVersion: configuration.configVersion || 1,
      aggregationMethod: configuration.aggregationMethod || "MEAN",
      criteria,
      scores,
      comments,
      summary,
      eligibility: eligibility ? { id: eligibility.id, overallStatus: eligibility.overallStatus, verifiedAt: eligibility.createdAt } : null,
      matching,
      shortlisted: !!shortlist,
      evaluatedBy: actorUid,
      submittedAt: new Date().toISOString(),
    },
    createdBy: actorUid,
  });

  await store.patchEvaluationStatus(evaluation.id, "SUBMITTED");
  const activeRows = await store.listEvaluatorAssignmentsByEvaluator(evaluation.challengeId, evaluation.evaluatorUid);
  const assignment = activeRows.find((r) => r.evaluationId === evaluation.id);
  if (assignment) await store.patchEvaluatorAssignment(assignment.id, { status: "SUBMITTED" });

  const updated = await store.getEvaluationWithScores(evaluation.id);
  return { evaluation: { ...updated, status: "SUBMITTED" }, summary, snapshot };
}

/* ───── 7. Lock / reopen workflow control ───── */
export async function lockEvaluation({ store, evaluationId, actorUid }) {
  const evaluation = await store.getEvaluation(evaluationId);
  if (!evaluation) throw new AppError(404, "NOT_FOUND", "Evaluation not found");
  if (evaluation.status === "LOCKED") return { evaluation };
  if (evaluation.status !== "SUBMITTED") {
    throw new AppError(409, "STATE_CONFLICT", "Only submitted evaluations can be locked");
  }
  const updated = await store.patchEvaluationStatus(evaluation.id, "LOCKED");
  return { evaluation: updated };
}

export async function reopenEvaluation({ store, evaluationId, actorUid, raw = {} }) {
  const evaluation = await store.getEvaluation(evaluationId);
  if (!evaluation) throw new AppError(404, "NOT_FOUND", "Evaluation not found");
  if (!SUBMITTED_STATES.has(evaluation.status)) {
    throw new AppError(409, "STATE_CONFLICT", `Evaluation status ${evaluation.status} cannot be reopened`);
  }
  const updated = await store.patchEvaluationStatus(evaluation.id, "REOPENED");
  const reopenRows = await store.listEvaluatorAssignmentsByEvaluator(evaluation.challengeId, evaluation.evaluatorUid);
  const assignment = reopenRows.find((r) => r.evaluationId === evaluation.id);
  if (assignment) await store.patchEvaluatorAssignment(assignment.id, { status: "IN_PROGRESS" });
  return {
    evaluation: updated,
    note: (raw && raw.reason) ? `Reopened during aggregation review: ${raw.reason}` : "Reopened",
  };
}

/* ───── 8. History (Part 36/42/52) ───── */
export async function evaluationHistory({ store, challengeId, startupId }) {
  const [snapshots, decisions, requests, aggregations] = await Promise.all([
    store.listEvaluationSnapshotsByChallenge(challengeId, startupId),
    store.listEvaluationDecisions(challengeId),
    store.listEvaluationRequests(challengeId),
    store.listEvaluationAggregations(challengeId),
  ]);
  const handoffs = await store.listPilotHandoffs(challengeId, startupId);
  return {
    snapshots,
    decisions: decisions.filter((d) => !startupId || d.startupId === startupId),
    requests: requests.filter((d) => !startupId || d.startupId === startupId),
    aggregations: aggregations.filter((d) => !startupId || d.startupId === startupId),
    handoffs,
  };
}

/* ───── 9. Aggregation (Parts 22-30) ─────
   Deterministic per-startup: independent submitted score sets → per-criterion
   stats, weighted overall, evidence coverage, confidence, variance/outlier
   flags, result state and critical items. Also writes an AGGREGATION snapshot
   and persists HIGH_VARIANCE/OUTLIER flags. */
export async function runChallengeAggregation({ store, challengeId, actorUid, startupId = null }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const configuration = await resolveConfig({ store, challengeId });
  const template = configuration.templateId ? await store.getEvaluationTemplate(configuration.templateId) : null;
  if (!template) throw new AppError(400, "VALIDATION_FAILED", "No evaluation template configured for this challenge");
  const criteria = await activeCriteria({ store, templateId: template.id });

  const evaluations = await loadEvaluationsWithScores({ store, challengeId, startupId });
  const startups = [...new Set(evaluations.map((e) => e.startupId))];

  const aggregated = [];
  for (const sid of startups) {
    const evs = evaluations.filter((e) => e.startupId === sid).map((e) => ({ ...e, status: e.status === "LOCKED" ? "SUBMITTED" : e.status }));
    const submitted = evs.filter((e) => e.status === "SUBMITTED");
    const assignedCount = evs.length;

    const { evidence } = await buildEvidenceSupport({ store, criteria, startupId: sid });
    const computed = dom.aggregateEvaluationScores({
      criteria,
      evaluations: submitted,
      method: configuration.aggregationMethod || "MEAN",
      evaluatorWeights: configuration.evaluatorWeightingEnabled ? submitted.map((e, i) => ({ weight: e.weight || (100 / Math.max(1, submitted.length)) })) : null,
      config: configuration,
    });

    const evidenceCoverage = dom.computeEvidenceCoverage({ criteria, evidence });
    const incomplete = assignedCount > computed.participationCount;
    const result = incomplete ? "INCOMPLETE" : computed.result;
    const confidence = dom.evaluationConfidence({
      coverage: evidenceCoverage,
      submitted: computed.participationCount,
      expected: assignedCount,
      highVariance: computed.highVariance,
    });

    const criticalItems = dom.buildCriticalItems({ aggregation: { ...computed, evidenceCoverage, confidence }, flags: [], evidence });
    const snapshot = await store.createEvaluationSnapshot({
      challengeId,
      startupId: sid,
      organizationId: challenge.organizationId,
      snapshotType: "AGGREGATION",
      snapshot: {
        engineVersion: dom.EVALUATION_ENGINE_VERSION,
        configurationVersion: configuration.configVersion || 1,
        method: computed.method,
        participationCount: computed.participationCount,
        assignedCount,
        total: computed.total,
        result,
        criteria: computed.criteria,
        evidenceCoverage,
        confidence,
        computedAt: new Date().toISOString(),
      },
      createdBy: actorUid,
    });

    const aggregation = await store.createEvaluationAggregation({
      challengeId,
      startupId: sid,
      organizationId: challenge.organizationId,
      configurationId: configuration.id || null,
      configurationVersion: configuration.configVersion || 1,
      engineVersion: dom.EVALUATION_ENGINE_VERSION,
      aggregationMethod: computed.method,
      total: computed.total,
      criteria: computed.criteria,
      evidenceCoverage,
      confidence,
      participationCount: computed.participationCount,
      mandatoryFailed: computed.mandatoryFailed,
      result,
      criticalItems,
      snapshotId: snapshot.id,
      createdBy: actorUid,
    });

    for (const row of computed.criteria || []) {
      if (row.variance && row.variance.highVariance) {
        await store.createEvaluationVarianceFlag({ aggregationId: aggregation.id, challengeId, startupId: sid, criterionKey: row.key, kind: "HIGH_VARIANCE", detail: row.variance.reason, createdBy: actorUid });
      }
      for (const o of row.outliers || []) {
        await store.createEvaluationVarianceFlag({ aggregationId: aggregation.id, challengeId, startupId: sid, criterionKey: row.key, kind: "OUTLIER", detail: `Outlier ${o.score} on ${row.label} (bounds ${o.lowerBound}-${o.upperBound})`, createdBy: actorUid });
      }
    }

    const startup = await store.getStartup(sid);
    aggregated.push({
      ...aggregation,
      startup: startup ? { id: startup.id, brandName: startup.brandName, legalName: startup.legalName, isDemo: startup.isDemo } : null,
      flags: await store.listEvaluationVarianceFlags(aggregation.id),
      snapshot,
    });
  }

  aggregated.sort((a, b) => (b.total || 0) - (a.total || 0));
  return { configuration, aggregated, counts: { startupsAggregated: aggregated.length, challenges: 1 } };
}

/* ───── 10. Comparison dashboard (Parts 32-33) ───── */
export async function challengeComparison({ store, challengeId }) {
  const [challenge, aggregations, evaluations, decisions] = await Promise.all([
    store.getChallenge(challengeId),
    store.listEvaluationAggregations(challengeId),
    store.listEvaluations(challengeId),
    store.listEvaluationDecisions(challengeId),
  ]);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");

  const latest = new Map();
  for (const a of aggregations) {
    if (!latest.has(a.startupId)) latest.set(a.startupId, a);
  }
  const rows = await Promise.all(
    [...latest.values()].map(async (a) => {
      const startup = await store.getStartup(a.startupId);
      return {
        ...a,
        startup: startup ? { id: startup.id, brandName: startup.brandName, legalName: startup.legalName, isDemo: startup.isDemo } : null,
        submissionCount: evaluations.filter((e) => e.startupId === a.startupId && e.status === "SUBMITTED").length,
        assignedCount: evaluations.filter((e) => e.startupId === a.startupId).length,
        latestDecision: (decisions.filter((d) => d.startupId === a.startupId))[0] || null,
      };
    })
  );
  rows.sort((a, b) => (b.total || 0) - (a.total || 0));
  return { challenge, rows };
}

/* ───── 11. Final human decision (Part 31/32/37/58) ─────
   Decision safety: eligibility must be valid, aggregation must exist and be
   complete, no blocking critical items. Blocking conditions require
   acknowledge=true. The prior decision (if any) is superseded. */
export async function decideEvaluation({ store, challengeId, actorUid, actorRole, raw = {} }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const decision = dom.prepareEvaluationDecision({ ...raw, challengeId });
  const startup = await store.getStartup(decision.startupId);
  if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");

  const eligibility = await eligibilitySnapshotFor({ store, challengeId, startupId: decision.startupId });
  const aggregation = await store.latestEvaluationAggregation(challengeId, decision.startupId);
  if (!aggregation) {
    throw new AppError(400, "VALIDATION_FAILED", "Run aggregation before recording a final decision.");
  }
  const criticalItems = aggregation.criticalItems || [];
  const safety = dom.decisionSafetyChecks({ eligibility, aggregation, criticalItems });
  if (!safety.ok && !decision.acknowledge) {
    throw new AppError(400, "DECISION_BLOCKED", `Blocking conditions must be acknowledged: ${safety.blocking.join(" ") }`);
  }

  const created = await store.createEvaluationDecision({
    challengeId,
    startupId: decision.startupId,
    organizationId: challenge.organizationId,
    decision: decision.decision,
    reason: decision.reason,
    decisionStage: decision.decisionStage,
    conditions: decision.conditions,
    warnings: safety.warnings,
    evaluationSnapshotId: aggregation.snapshotId || null,
    aggregationId: aggregation.id,
    actorUid,
    actorRole,
    isDemo: !!challenge.isDemo,
  });

  return { decision: created, safety: { blocking: safety.blocking, warnings: safety.warnings, acknowledged: decision.acknowledge } };
}

/* ───── 12. Request information (Part 29/31/52) ───── */
export async function requestInformation({ store, challengeId, actorUid, actorRole, raw = {} }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const entry = dom.prepareEvaluationRequestEntry({ ...raw, challengeId, requestedBy: actorUid });
  if (!entry.startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");
  const request = await store.createEvaluationRequest({ ...entry, organizationId: challenge.organizationId });
  return { request };
}

/* ───── 13. Pilot handoff (Part 51) ───── */
export async function issuePilotHandoff({ store, challengeId, actorUid, actorRole, raw = {} }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const entry = dom.preparePilotHandoff({ ...raw, challengeId, issuedBy: actorUid });
  if (!entry.startupId) throw new AppError(400, "VALIDATION_FAILED", "startup_id is required");

  const decision = entry.decisionId ? await store.getEvaluationDecision(entry.decisionId) : await store.latestEvaluationDecision(challengeId, entry.startupId);
  if (!decision || (decision.decision !== "PROCEED_TO_PILOT" && decision.decision !== "CUSTOM")) {
    throw new AppError(400, "VALIDATION_FAILED", "A PROCEED_TO_PILOT (or CUSTOM) decision is required before issuing a pilot handoff");
  }

  const aggregation = decision.aggregationId ? await store.getEvaluationAggregation(decision.aggregationId) : await store.latestEvaluationAggregation(challengeId, entry.startupId);
  const snapshot = aggregation && aggregation.snapshotId ? await store.getEvaluationSnapshot(aggregation.snapshotId) : null;

  const defaults = {
    selectedCriteria: entry.selectedCriteria.length ? entry.selectedCriteria : (aggregation && (aggregation.criteria || []).map((c) => c.key).slice(0, 8)) || [],
    identifiedGaps: entry.identifiedGaps.length ? entry.identifiedGaps : (aggregation && (aggregation.criticalItems || []).map((c) => c.text).slice(0, 8)) || [],
    riskFlags: entry.riskFlags.length ? entry.riskFlags : (aggregation && (aggregation.criticalItems || []).filter((c) => c.level === "BLOCKING").map((c) => c.text)) || [],
    expectedKpis: entry.expectedKpis.length ? entry.expectedKpis : [],
    requiredEvidence: entry.requiredEvidence.length ? entry.requiredEvidence : (aggregation && (aggregation.criteria || []).filter((c) => c.evidenceRequired && !(aggregation.evidenceCoverageMap && aggregation.evidenceCoverageMap[c.key])).map((c) => c.label)) || [],
    conditions: entry.conditions.length ? entry.conditions : [],
    pilotReadiness: Object.keys(entry.pilotReadiness || {}).length ? entry.pilotReadiness : { score: aggregation ? aggregation.confidence : 0, status: aggregation ? aggregation.result : "NOT_EVALUATED" },
  };

  const handoff = await store.createPilotHandoff({
    decisionId: decision.id,
    challengeId,
    startupId: entry.startupId,
    organizationId: challenge.organizationId,
    evaluationSnapshotId: snapshot ? snapshot.id : null,
    selectedCriteria: defaults.selectedCriteria,
    identifiedGaps: defaults.identifiedGaps,
    riskFlags: defaults.riskFlags,
    pilotReadiness: defaults.pilotReadiness,
    expectedKpis: defaults.expectedKpis,
    requiredEvidence: defaults.requiredEvidence,
    conditions: defaults.conditions,
    status: "DRAFT",
    issuedBy: actorUid,
    isDemo: !!challenge.isDemo,
  });

  return { handoff, decision };
}

/* ───── 14. AI advisory assistant (advisory ONLY; deterministic fallback) ───── */
export async function evaluationAssist({ store, challengeId, startupId, actorUid, lang = "en", ai = null }) {
  const challenge = await store.getChallenge(challengeId);
  if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
  const startup = await store.getStartup(startupId);
  if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");

  const { criteria, configuration } = await listChallengeEvaluationCriteria({ store, challengeId });
  const evaluations = await loadEvaluationsWithScores({ store, challengeId, startupId });
  const aggregation = await store.latestEvaluationAggregation(challengeId, startupId);
  const eligibility = await eligibilitySnapshotFor({ store, challengeId, startupId });
  const { evidence, verifiedCount } = await buildEvidenceSupport({ store, criteria, startupId });
  const intel = await store.getStartupIntelligence(startupId);

  const deterministic = deterministicEvaluationAssist({
    criteria, configuration, evaluations, aggregation, eligibility, evidence, verifiedCount, intel, startup,
  });

  try {
    const grounded = sia.buildSihGrounded({
      startup,
      capabilities: intel.capabilities || [],
      verifications: intel.verifications || [],
      challenge,
      match: await matchingContextFor({ store, challengeId, startupId }),
      eligibility,
      evaluation: {
        total: (aggregation && aggregation.total) || null,
        result: (aggregation && aggregation.result) || "NOT_EVALUATED",
        participationCount: (aggregation && aggregation.participationCount) || 0,
        evidenceCoverage: (aggregation && aggregation.evidenceCoverage) || 0,
        confidence: (aggregation && aggregation.confidence) || 0,
      },
    });
    const assist = await sia.sihCopilot({
      ai,
      gov: null,
      question: "Provide a concise evaluation briefing for this startup with strengths and evidence gaps for an evaluator review.",
      lang,
      context: {},
      sih: { startup, verifications: intel.verifications || [], evidence: intel.evidence || [], match: grounded.match, eligibility },
    });
    return {
      mode: "ai-advisory",
      grounded: true,
      scoredCriteria: deterministic.scoredCriteria,
      strengths: deterministic.strengths,
      gaps: deterministic.gaps,
      suggestedQuestions: deterministic.suggestedQuestions,
      briefing: assist.answer,
      disclaimer: "AI output is advisory. All scores, weights, thresholds and the final decision are determined by human evaluators and the deterministic engine.",
    };
  } catch (err) {
    return { ...deterministic, mode: "deterministic-fallback", grounded: true, reason: String((err && err.message) || "assistant unavailable") };
  }
}

export function deterministicEvaluationAssist({ criteria, configuration, evaluations, aggregation, eligibility, evidence, verifiedCount, intel, startup }) {
  const scored = (evaluations || []).filter((e) => (e.status === "SUBMITTED" || e.status === "LOCKED"));
  const strengths = [];
  const gaps = [];
  const suggestedQuestions = [];
  const scoredCriteria = {};
  for (const c of criteria || []) {
    const vals = scored.map((e) => ((e.scores || []).find((s) => s.criterionKey === c.key) || {}).score).filter((v) => v != null);
    const avg = vals.length ? Math.round((vals.reduce((a, b) => a + Number(b), 0) / vals.length) * 100) / 100 : null;
    scoredCriteria[c.key] = { label: c.label, category: c.category, weight: c.weight, value: avg, criteriaValues: vals.length };
    if (avg != null) {
      if (avg >= 80) strengths.push(`Strong score on "${c.label}" (${avg}/100).`);
      else if (avg < 50) gaps.push(`Weak score on "${c.label}" (${avg}/100).`);
    }
    if (c.mandatory && avg != null && c.minimumScore != null && avg < c.minimumScore) {
      gaps.push(`Below mandatory minimum on "${c.label}" (min ${c.minimumScore}).`);
    }
    if (c.evidenceRequired && !evidence[c.key]) {
      gaps.push(`Required evidence missing/unverified for "${c.label}".`);
      suggestedQuestions.push(`What evidence can the startup provide for "${c.label}"?`);
    }
  }
  const counts = (intel && intel.verifications || []).filter((v) => v.status === "VERIFIED").length;
  if (counts) strengths.push(`Startup has ${counts} verified verification record(s).`);
  const match = (aggregation && aggregation.total);
  return {
    mode: "deterministic",
    overview: {
      participation: scored.length,
      range: aggregation
        ? `${Math.min(...(aggregation.criteria || []).map((c) => (c.stat || 0)))}-${Math.max(...(aggregation.criteria || []).map((c) => (c.stat || 0)))} score range across criteria`
        : "aggregation not run yet",
      evidenceVerified: verifiedCount,
      coverage: (aggregation && aggregation.evidenceCoverage) || computeEvidenceCoveragePct(criteria, evidence),
      score: match != null ? match : null,
      result: (aggregation && aggregation.result) || "NOT_EVALUATED",
      confidence: (aggregation && aggregation.confidence) || 0,
    },
    evidenceFound: (intel && intel.evidence || []).filter((e) => e.verificationStatus === "VERIFIED").slice(0, 8).map((e) => e.category || "Verifiable evidence"),
    strengths,
    gaps: gaps.slice(0, 8),
    suggestedQuestions: suggestedQuestions.slice(0, 6),
    disclaimer: "AI output is advisory. All scores, weights, thresholds and the final decision are determined by human evaluators and the deterministic engine.",
  };
}

function computeEvidenceCoveragePct(criteria, evidence) {
  const active = (criteria || []).filter((c) => (c.criterionStatus || "ACTIVE") === "ACTIVE");
  if (!active.length) return 0;
  return Math.round((active.filter((c) => c.evidenceRequired && evidence[c.key]).length / active.length) * 100);
}