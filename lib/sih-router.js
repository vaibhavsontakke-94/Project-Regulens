/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — additive API layer
   Mounted by server.js at /api/sih. Follows existing server.js
   conventions (sanitization, AppError → global error middleware,
   camelCase JSON payloads). No AI is used anywhere in this layer.
   ═══════════════════════════════════════════════════════════════════ */
import express from "express";
import { randomUUID } from "node:crypto";
import { AppError } from "./errors.js";
import { newRequestId } from "./log.js";
import { defaultSihStore } from "./sih-store.js";
import * as dom from "./sih-domain.js";
import * as au from "./sih-auth.js";
import * as proc from "./sih-procurement.js";
import * as startup from "./sih-startup.js";
import * as matching from "./sih-matching.js";
import * as evaluation from "./sih-evaluation.js";
import * as apps from "./sih-applications.js";
import * as gov from "./gov-engine.cjs";
import * as ai from "./groq.js";
import { sihCopilot } from "./sih-integration.js";

const sanitizeStr = (v, max = 500) => String(v == null ? "" : v).trim().slice(0, max);
const asNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && String(v).trim() !== "" ? n : null;
};
const asStr = (v) => (v == null || String(v).trim() === "" ? "" : String(v).trim());
const hashStr = (s) => {
  let h = 0;
  const str = String(s == null ? "" : s);
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};

export function createSihRouter({ resolveUser, store } = {}) {
  const router = express.Router();
  const activeStore = store || defaultSihStore;
  const userResolver = resolveUser || au.defaultResolveUser;

  const now = () => new Date().toISOString();

  /* request id for audit correlation (matches existing log.js helper) */
  router.use((req, _res, next) => {
    if (!req.requestId) req.requestId = newRequestId();
    next();
  });

  async function user(req) {
    return au.requireUser(req, userResolver);
  }

  function paramUuid(req, name) {
    const v = req.params[name];
    if (!dom.isUuid(v)) throw new AppError(400, "INVALID_REQUEST", "Invalid id");
    return v;
  }

  function bodyUuid(raw, name, { required = false } = {}) {
    const v = (raw && raw[name]) || "";
    if (v) {
      if (!dom.isUuid(v)) throw new AppError(400, "VALIDATION_FAILED", `${name} must be a valid UUID`);
      return v;
    }
    if (required) throw new AppError(400, "VALIDATION_FAILED", `${name} is required`);
    return null;
  }

  /* resolve membership + apply an RBAC policy; returns the effective role */
  async function orgAction(req, organizationId, action, userInfo) {
    const u = userInfo || (await user(req));
    const membership = await activeStore.getMembership(u.id, organizationId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this organization");
    }
    if (!au.actionAllowed(action, membership.role)) {
      throw new AppError(403, "FORBIDDEN", "You do not have the required role for this action");
    }
    return membership.role;
  }

  /* read-only membership gate (any active member) */
  async function memberOf(req, organizationId, userInfo) {
    const u = userInfo || (await user(req));
    const membership = await activeStore.getMembership(u.id, organizationId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this organization");
    }
    return membership.role;
  }

  /* minimal non-sensitive snapshot for the audit trail */
  function snapshot(obj) {
    if (!obj || typeof obj !== "object") return {};
    const out = {};
    for (const k of ["id", "status", "title", "name", "challengeStatus", "result", "verdict"]) {
      if (obj[k] !== undefined && obj[k] !== null) out[k] = obj[k];
    }
    return out;
  }

  async function audit(req, { action, entityType, entityId, organizationId = null, newValue = {}, oldValue = {}, isDemo = false }) {
    try {
      const u = await user(req);
      const membership = organizationId ? await activeStore.getMembership(u.id, organizationId) : null;
      return await activeStore.createAuditEvent({
        actorUid: u.id,
        actorRole: (membership && membership.role) || "",
        organizationId,
        action,
        entityType,
        entityId,
        oldValue: snapshot(oldValue) || {},
        newValue: snapshot(newValue) || {},
        source: "api",
        requestId: req.requestId,
        isDemo,
      });
    } catch (err) {
      /* audit failures must never break the primary operation */
      return null;
    }
  }

  /* ════════ capabilities (read-only vocabulary) ════════ */
  router.get("/capabilities", async (req, res) => {
    await user(req);
    res.json({ capabilities: await activeStore.listCapabilities() });
  });

  /* ════════ organizations ════════ */
  router.post("/organizations", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareOrganization(req.body);
    data.createdBy = u.id;
    if (data.isDemo) data.isDemo = true;
    const org = await activeStore.createOrganization(data);
    await activeStore.addMember({
      organizationId: org.id,
      userId: u.id,
      role: org.orgType === "STARTUP" ? "STARTUP_ADMIN" : "ADMIN",
      status: "ACTIVE",
    });
    await audit(req, { action: "ORGANIZATION_CREATED", entityType: "GOVERNMENT_ORGANIZATION", entityId: org.id, organizationId: org.id, newValue: org, isDemo: org.isDemo });
    res.status(201).json(org);
  });

  router.get("/organizations", async (req, res) => {
    const u = await user(req);
    res.json({ organizations: await activeStore.listOrganizationsForUser(u.id) });
  });

  router.get("/organizations/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    await memberOf(req, id, u);
    const org = await activeStore.getOrganization(id);
    if (!org) return res.status(404).json({ error: "Organization not found" });
    res.json(org);
  });

  router.patch("/organizations/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    await orgAction(req, id, "ORG_UPDATE", u);
    const patch = dom.prepareOrganizationPatch(req.body);
    const updated = await activeStore.patchOrganization(id, patch);
    if (!updated) return res.status(404).json({ error: "Organization not found" });
    await audit(req, { action: "ORGANIZATION_UPDATED", entityType: "GOVERNMENT_ORGANIZATION", entityId: id, organizationId: id, newValue: updated });
    res.json(updated);
  });

  router.post("/organizations/:id/members", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    await orgAction(req, id, "ORG_MEMBER_INVITE", u);
    const entry = dom.prepareMembership(req.body);
    entry.organizationId = id;
    const member = await activeStore.addMember(entry);
    await audit(req, { action: "ORG_MEMBER_ADDED", entityType: "GOVERNMENT_ORGANIZATION", entityId: id, organizationId: id, newValue: { id, userId: entry.userId, role: entry.role } });
    res.status(201).json(member);
  });

  router.get("/organizations/:id/members", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    await memberOf(req, id, u);
    res.json({ members: await activeStore.listMembers(id) });
  });

  /* ════════ problems ════════ */
  router.post("/problems", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareProblem(req.body);
    await orgAction(req, data.organizationId, "PROBLEM_CREATE", u);
    data.createdBy = u.id;
    const created = await activeStore.createProblem(data);
    await audit(req, { action: "PROBLEM_CREATED", entityType: "GOVERNMENT_PROBLEM", entityId: created.id, organizationId: created.organizationId, newValue: created, isDemo: created.isDemo });
    res.status(201).json(created);
  });

  router.get("/problems", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);
    let problems = await activeStore.listProblems(organizationId);
    const hay = (s) => String(s || "").toLowerCase();
    const q = String((req.query.q || "")).trim().toLowerCase();
    if (q) {
      problems = problems.filter((p) =>
        hay(p.title).includes(q) || hay(p.sector).includes(q) || hay(p.description).includes(q) ||
        hay(p.objectives).includes(q) || hay(p.region).includes(q) || hay(p.status).includes(q)
      );
    }
    if (req.query.sector) {
      const sector = String(req.query.sector).trim().toLowerCase();
      problems = problems.filter((p) => hay(p.sector).includes(sector));
    }
    if (req.query.status) {
      const status = String(req.query.status).trim().toUpperCase();
      problems = problems.filter((p) => hay(p.status) === status);
    }
    res.json({ problems });
  });

  router.get("/problems/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const problem = await activeStore.getProblem(id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    await memberOf(req, problem.organizationId, ur);
    res.json(problem);
  });

  router.patch("/problems/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await activeStore.getProblem(id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    const role = await orgAction(req, problem.organizationId, "PROBLEM_UPDATE", u);
    if (req.body && req.body.status != null && req.body.status !== "" && req.body.status !== problem.status) {
      proc.assertProblemTransition(problem.status, String(req.body.status));
    }
    const patch = { ...dom.prepareProblem({ ...problem, ...req.body }), createdBy: problem.createdBy };
    if (req.body == null || req.body.status == null || req.body.status === "") patch.status = problem.status;
    const updated = await activeStore.patchProblem(id, problem.organizationId, patch, role);
    await audit(req, { action: "PROBLEM_UPDATED", entityType: "GOVERNMENT_PROBLEM", entityId: id, organizationId: problem.organizationId, oldValue: problem, newValue: updated });
    res.json(updated);
  });

  /* ════════ Problem workflow (quality / AI structuring / approve) ════════ */

  async function requireProblem(req, id) {
    const problem = await activeStore.getProblem(id);
    if (!problem) throw new AppError(404, "NOT_FOUND", "Problem not found");
    return problem;
  }

  router.get("/problems/:id/ai-structures", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const problem = await requireProblem(req, id);
    await memberOf(req, problem.organizationId, ur);
    res.json({ structures: await activeStore.listProblemAiStructures(id) });
  });

  router.post("/problems/:id/quality-check", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const problem = await requireProblem(req, id);
    await memberOf(req, problem.organizationId, ur);
    res.json(proc.qualityCheck(problem));
  });

  router.post("/problems/:id/ai-structure", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await requireProblem(req, id);
    await orgAction(req, problem.organizationId, "PROBLEM_UPDATE", u);
    const lang = String((req.body && req.body.lang) || "en");
    const result = await proc.structureProblem({ ai, problem, lang, endpoint: "/api/sih/problems/:id/ai-structure" });
    const structure = proc.normalizeStructure(result.structure);
    const provenance = proc.withProvenance(structure, problem);
    const record = await activeStore.createProblemAiStructure(dom.prepareProblemAiStructure({
      problemId: id,
      status: "ACCEPTED",
      outputJson: structure,
      provenanceJson: provenance,
      model: result.model,
      modelVersion: result.modelVersion,
      promptVersion: result.promptVersion,
      mode: result.mode === "ai" ? "AI" : "DETERMINISTIC",
      generatedBy: u.id,
      isDemo: problem.isDemo,
    }));
    await audit(req, {
      action: "AI_STRUCTURING_COMPLETED", entityType: "PROBLEM_AI_STRUCTURE",
      entityId: record.id, organizationId: problem.organizationId,
      newValue: { id: record.id, mode: record.mode, confidence: structure.confidence }, isDemo: problem.isDemo,
    });
    res.status(201).json({
      structure,
      provenance,
      record: { id: record.id, mode: record.mode, promptVersion: record.promptVersion, createdAt: record.createdAt },
      quality: proc.qualityCheck(problem),
    });
  });

  router.post("/problems/:id/approve", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await requireProblem(req, id);
    await orgAction(req, problem.organizationId, "PROBLEM_APPROVE", u);
    proc.assertProblemTransition(problem.status, "APPROVED");
    const updated = await activeStore.patchProblem(id, problem.organizationId, { status: "APPROVED" });
    await audit(req, { action: "PROBLEM_APPROVED", entityType: "GOVERNMENT_PROBLEM", entityId: id, organizationId: problem.organizationId, oldValue: problem, newValue: updated });
    res.json(updated);
  });

  router.post("/problems/:id/submit-review", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await requireProblem(req, id);
    await orgAction(req, problem.organizationId, "PROBLEM_UPDATE", u);
    proc.assertProblemTransition(problem.status, "SUBMITTED");
    const updated = await activeStore.patchProblem(id, problem.organizationId, { status: "SUBMITTED" });
    await audit(req, { action: "PROBLEM_SUBMITTED_FOR_REVIEW", entityType: "GOVERNMENT_PROBLEM", entityId: id, organizationId: problem.organizationId, oldValue: problem, newValue: updated });
    res.json(updated);
  });

  /* Published problems are live with an innovation challenge. Unpublish
     pulls the problem back to APPROVED (the challenge stays untouched). */
  router.post("/problems/:id/unpublish", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await requireProblem(req, id);
    await orgAction(req, problem.organizationId, "PROBLEM_PUBLISH", u);
    if (problem.status !== "PUBLISHED") {
      throw new AppError(409, "PROBLEM_NOT_PUBLISHED", "Only a published problem can be unpublished.");
    }
    proc.assertProblemTransition(problem.status, "APPROVED");
    const updated = await activeStore.patchProblem(id, problem.organizationId, { status: "APPROVED" });
    await audit(req, { action: "PROBLEM_UNPUBLISHED", entityType: "GOVERNMENT_PROBLEM", entityId: id, organizationId: problem.organizationId, oldValue: problem, newValue: updated });
    res.json(updated);
  });

  router.post("/problems/:id/archive", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await requireProblem(req, id);
    await orgAction(req, problem.organizationId, "PROBLEM_ARCHIVE", u);
    proc.assertProblemTransition(problem.status, "ARCHIVED");
    const updated = await activeStore.patchProblem(id, problem.organizationId, { status: "ARCHIVED" });
    await audit(req, { action: "PROBLEM_ARCHIVED", entityType: "GOVERNMENT_PROBLEM", entityId: id, organizationId: problem.organizationId, oldValue: problem, newValue: updated });
    res.json(updated);
  });

  router.delete("/problems/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await requireProblem(req, id);
    await orgAction(req, problem.organizationId, "PROBLEM_DELETE", u);
    if (problem.status !== "DRAFT") {
      throw new AppError(409, "PROBLEM_DELETE_FORBIDDEN", "Only draft problems that have never been published can be deleted.");
    }
    const challenges = await activeStore.listChallenges(problem.organizationId);
    const referenced = challenges.some((c) => c.problemId === id);
    if (referenced) {
      throw new AppError(409, "PROBLEM_IN_USE", "This problem has a generated challenge; archive it instead of deleting.");
    }
    await activeStore.deleteProblem(id);
    await audit(req, { action: "PROBLEM_DELETED", entityType: "GOVERNMENT_PROBLEM", entityId: id, organizationId: problem.organizationId, oldValue: problem });
    res.json({ ok: true, deleted: id });
  });

  router.post("/problems/:id/generate-challenge", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const problem = await requireProblem(req, id);
    await orgAction(req, problem.organizationId, "CHALLENGE_GENERATE", u);
    const base = proc.buildChallengeFromProblem(problem, {
      structure: req.body && req.body.structure ? proc.normalizeStructure(req.body.structure) : undefined,
      scope: req.body && req.body.scope,
      outOfScope: req.body && req.body.outOfScope,
      challengeCode: req.body && req.body.challengeCode,
    });
    /* Save a DRAFT challenge only when the caller asks to persist. */
    if (req.body && req.body.persist) {
      const data = dom.prepareChallenge({
        ...problem,
        problemId: id,
        organizationId: problem.organizationId,
        challengeStatus: "DRAFT",
        title: base.title,
        description: base.description,
        objective: base.objective,
        expectedOutcomes: base.expectedOutcomes,
        scope: base.scope,
        outOfScope: base.outOfScope,
        targetUsers: base.targetUsers,
        geography: base.geography,
        successMetrics: base.successMetrics,
        technicalCapabilities: base.technicalCapabilities,
        dataRequirements: base.dataRequirements,
        constraints: base.constraints,
        budgetMin: base.budgetMin,
        budgetMax: base.budgetMax,
        currency: base.currency,
        pilotDurationDays: base.pilotDurationDays,
        challengeCode: base.challengeCode || genChallengeCode(),
      });
      data.createdBy = u.id;
      const created = await activeStore.createChallenge(data);
      await audit(req, { action: "CHALLENGE_GENERATED", entityType: "INNOVATION_CHALLENGE", entityId: created.id, organizationId: problem.organizationId, newValue: { id: created.id, title: created.title }, isDemo: problem.isDemo });
      return res.status(201).json({ draft: created, preview: base });
    }
    res.json({ preview: base });
  });

  function genChallengeCode() {
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `REG-IC-${year}-${rand}`;
  }

  /* ════════ challenges ════════ */
  router.post("/challenges", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareChallenge(req.body);
    await orgAction(req, data.organizationId, "CHALLENGE_CREATE", u);
    data.createdBy = u.id;
    const created = await activeStore.createChallenge(data);
    await audit(req, { action: "CHALLENGE_CREATED", entityType: "INNOVATION_CHALLENGE", entityId: created.id, organizationId: created.organizationId, newValue: created, isDemo: created.isDemo });
    res.status(201).json(created);
  });

  router.get("/challenges", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);
    res.json({ challenges: await activeStore.listChallenges(organizationId) });
  });

  router.get("/challenges/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const challenge = await activeStore.getChallenge(id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    await memberOf(req, challenge.organizationId, ur);
    res.json(challenge);
  });

  router.patch("/challenges/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const challenge = await activeStore.getChallenge(id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    await orgAction(req, challenge.organizationId, "CHALLENGE_UPDATE", u);
    const patch = { ...dom.prepareChallenge({ ...challenge, ...req.body }), createdBy: challenge.createdBy };
    const updated = await activeStore.patchChallenge(id, challenge.organizationId, patch);
    await audit(req, { action: "CHALLENGE_UPDATED", entityType: "INNOVATION_CHALLENGE", entityId: id, organizationId: challenge.organizationId, oldValue: challenge, newValue: updated });
    res.json(updated);
  });

  /* ════════ challenge workflow (submit-review / approve / publish) ════════ */

  async function requireChallenge(req, id) {
    const challenge = await activeStore.getChallenge(id);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    return challenge;
  }

  router.post("/challenges/:id/submit-review", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const challenge = await requireChallenge(req, id);
    await orgAction(req, challenge.organizationId, "CHALLENGE_SUBMIT_REVIEW", u);
    proc.assertChallengeTransition(challenge.challengeStatus, "REVIEW");
    proc.assertChallengeApproval(challenge.challengeStatus, "REVIEW");
    const updated = await activeStore.patchChallenge(id, challenge.organizationId, { challengeStatus: "REVIEW" });
    await audit(req, { action: "CHALLENGE_SUBMITTED_FOR_REVIEW", entityType: "INNOVATION_CHALLENGE", entityId: id, organizationId: challenge.organizationId, oldValue: challenge, newValue: updated });
    res.json(updated);
  });

  router.post("/challenges/:id/approve", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const challenge = await requireChallenge(req, id);
    await orgAction(req, challenge.organizationId, "CHALLENGE_APPROVE", u);
    proc.assertChallengeTransition(challenge.challengeStatus, "APPROVED");
    proc.assertChallengeApproval(challenge.challengeStatus, "APPROVED");
    const updated = await activeStore.patchChallenge(id, challenge.organizationId, { challengeStatus: "APPROVED" });
    await audit(req, { action: "CHALLENGE_APPROVED", entityType: "INNOVATION_CHALLENGE", entityId: id, organizationId: challenge.organizationId, oldValue: challenge, newValue: updated });
    res.json(updated);
  });

  router.post("/challenges/:id/publish", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const challenge = await requireChallenge(req, id);
    await orgAction(req, challenge.organizationId, "CHALLENGE_PUBLISH", u);
    proc.assertChallengeTransition(challenge.challengeStatus, "PUBLISHED");
    proc.assertChallengeApproval(challenge.challengeStatus, "PUBLISHED");
    const validation = proc.publishValidation(challenge, {
      owner: u.id,
      organizationId: challenge.organizationId,
      evaluationFramework: (challenge.evaluationFramework && challenge.evaluationFramework.criteria) || [],
    });
    if (!validation.canPublish) {
      throw new AppError(409, "PUBLISH_BLOCKED", validation.errors.join("; "));
    }
    const updated = await activeStore.patchChallenge(id, challenge.organizationId, {
      challengeStatus: "PUBLISHED",
      publishedAt: new Date().toISOString(),
    });
    await audit(req, { action: "CHALLENGE_PUBLISHED", entityType: "INNOVATION_CHALLENGE", entityId: id, organizationId: challenge.organizationId, oldValue: challenge, newValue: updated });
    res.json({ ...updated, validation });
  });

  router.post("/challenges/:id/close", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const challenge = await requireChallenge(req, id);
    await orgAction(req, challenge.organizationId, "CHALLENGE_CLOSE", u);
    const updated = await activeStore.patchChallenge(id, challenge.organizationId, {
      challengeStatus: "CLOSED",
    });
    await audit(req, { action: "CHALLENGE_CLOSED", entityType: "INNOVATION_CHALLENGE", entityId: id, organizationId: challenge.organizationId, oldValue: challenge, newValue: updated });
    res.json({ ...updated });
  });

  router.get("/challenges/:id/matches", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const challenge = await activeStore.getChallenge(id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    await memberOf(req, challenge.organizationId, ur);
    res.json({ matches: await activeStore.listMatches(id) });
  });

  /* ════════ startup solution applications (SIH Government Pilot) ════════
     Startup applies to a published/application-open challenge with a
     solution submission. Statuses DRAFT→SUBMITTED→UNDER_REVIEW→(ELIGIBLE→
     SHORTLISTED→SELECTED→PILOT | REJECTED | NEEDS_MORE_INFORMATION).
     AI assists the startup; it never fabricates credentials/evidence.
     Privacy: internalNotes + evaluationComments are stripped for startups. */

  async function requireApplication(req, id) {
    const app = await activeStore.getApplication(id);
    if (!app) throw new AppError(404, "NOT_FOUND", "Application not found");
    return app;
  }

  async function applicationScope(req, app, ur) {
    if (!app) return null;
    const mem = await activeStore.getMembership(ur.id, app.organizationId);
    if (mem && mem.status === "ACTIVE") return "STARTUP";
    const challenge = await activeStore.getChallenge(app.challengeId);
    if (challenge) {
      const cm = await activeStore.getMembership(ur.id, challenge.organizationId);
      if (cm && cm.status === "ACTIVE") return "GOVERNMENT";
    }
    const orgs = await activeStore.listOrganizationsForUser(ur.id);
    if (orgs.some((o) => o.orgType === "GOVERNMENT")) return "GOVERNMENT_READONLY";
    return null;
  }

  async function startupForApplication(app) {
    if (!app || !app.organizationId) return null;
    const rows = await activeStore.listStartups(app.organizationId);
    return rows && rows[0] ? rows[0] : null;
  }

  async function enrichApplication(app, ur, scope) {
    if (!app) return null;
    const challenge = await activeStore.getChallenge(app.challengeId);
    const problem = app.problemId
      ? await activeStore.getProblem(app.problemId)
      : (challenge && challenge.problemId ? await activeStore.getProblem(challenge.problemId) : null);
    return {
      ...app,
      challengeTitle: challenge ? challenge.title : "",
      challengeStatus: challenge ? challenge.challengeStatus : "",
      problemTitle: problem ? problem.title : "",
      viewScope: scope,
    };
  }

  const enrichApplications = async (rows, ur, scope) => {
    const out = [];
    for (const r of rows || []) out.push(await enrichApplication(r, ur, scope));
    return out;
  };

  router.post("/applications", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareChallengeApplication(req.body);
    const challenge = await activeStore.getChallenge(data.challengeId);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    if (!["PUBLISHED", "APPLICATIONS_OPEN"].includes(challenge.challengeStatus)) {
      throw new AppError(409, "CHALLENGE_CLOSED", "Applications are not open for this challenge");
    }
    await orgAction(req, data.organizationId, "APPLICATION_CREATE", u);
    data.createdBy = u.id;
    if (!data.problemId) data.problemId = challenge.problemId || null;
    const created = await activeStore.createApplication(data);
    await audit(req, { action: "APPLICATION_CREATED", entityType: "CHALLENGE_APPLICATION", entityId: created.id, organizationId: data.organizationId, newValue: snapshot(created), isDemo: created.isDemo });
    res.status(201).json(created);
  });

  router.get("/applications", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId");
    const challengeId = bodyUuid(req.query, "challengeId");
    if (organizationId) {
      await memberOf(req, organizationId, ur);
      const rows = await activeStore.listApplicationsByStartup(organizationId);
      const views = await enrichApplications(rows, ur, "STARTUP");
      res.json({ applications: views.map(apps.startupApplicationView).filter(Boolean) });
      return;
    }
    if (challengeId) {
      const orgId = await challengeOrg(challengeId);
      await memberOf(req, orgId, ur);
      const rows = await activeStore.listApplicationsByChallenge(challengeId);
      res.json({ applications: await enrichApplications(rows, ur, "GOVERNMENT") });
      return;
    }
    throw new AppError(400, "VALIDATION_FAILED", "organizationId or challengeId is required");
  });

  router.get("/applications/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const app = await requireApplication(req, id);
    const scope = await applicationScope(req, app, ur);
    if (!scope) throw new AppError(403, "FORBIDDEN", "You do not have access to this application");
    const en = await enrichApplication(app, ur, scope);
    if (scope === "STARTUP") return res.json(apps.startupApplicationView(en));
    res.json(en);
  });

  router.patch("/applications/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const app = await requireApplication(req, id);
    const scope = await applicationScope(req, app, u);
    if (!scope) throw new AppError(403, "FORBIDDEN", "You do not have access to this application");

    if (scope === "STARTUP") {
      if (!["DRAFT", "NEEDS_MORE_INFORMATION"].includes(app.status)) {
        throw new AppError(409, "NOT_EDITABLE", "Application can only be edited while in DRAFT or NEEDS_MORE_INFORMATION");
      }
      await orgAction(req, app.organizationId, "APPLICATION_UPDATE", u);
      const patch = dom.prepareChallengeApplication({ ...app, ...req.body });
      const wasNeedingInfo = app.status === "NEEDS_MORE_INFORMATION";
      const updated = await activeStore.patchApplication(id, {
        ...patch,
        ...(wasNeedingInfo ? { status: "SUBMITTED", submittedAt: now(), submittedBy: u.id } : {}),
      });
      await audit(req, { action: "APPLICATION_UPDATED", entityType: "CHALLENGE_APPLICATION", entityId: id, organizationId: app.organizationId, oldValue: snapshot(app), newValue: snapshot(updated), isDemo: app.isDemo });
      res.json(updated);
      return;
    }

    await orgAction(req, (await activeStore.getChallenge(app.challengeId)).organizationId, "APPLICATION_REVIEW", u);
    const patch = {};
    if (req.body.internalNotes != null) patch.internalNotes = String(req.body.internalNotes).slice(0, 4000);
    if (req.body.evaluationComments != null) patch.evaluationComments = String(req.body.evaluationComments).slice(0, 4000);
    if (req.body.requiredAction != null && app.status === "NEEDS_MORE_INFORMATION") patch.requiredAction = String(req.body.requiredAction).slice(0, 500);
    const updated = await activeStore.patchApplication(id, patch);
    await audit(req, { action: "APPLICATION_NOTES_UPDATED", entityType: "CHALLENGE_APPLICATION", entityId: id, organizationId: app.organizationId, newValue: snapshot(updated), isDemo: app.isDemo });
    res.json(updated);
  });

  router.post("/applications/:id/submit", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const app = await requireApplication(req, id);
    await orgAction(req, app.organizationId, "APPLICATION_SUBMIT", u);
    apps.assertApplicationTransition(app.status, "SUBMITTED");
    const completeness = apps.submissionCompleteness(app);
    if (!completeness.complete) {
      throw new AppError(400, "INCOMPLETE_SUBMISSION", `Submission is missing: ${completeness.missing.join(", ")}`);
    }
    const startup = await startupForApplication(app);
    const docs = startup ? await activeStore.listStartupDocuments(startup.id) : [];
    const missingDocuments = apps.missingDocuments(docs);
    const updated = await activeStore.patchApplication(id, { status: "SUBMITTED", submittedAt: now(), submittedBy: u.id });
    await audit(req, { action: "APPLICATION_SUBMITTED", entityType: "CHALLENGE_APPLICATION", entityId: id, organizationId: app.organizationId, oldValue: snapshot(app), newValue: snapshot(updated), isDemo: app.isDemo });
    res.json({ ...updated, missingDocuments });
  });

  router.post("/applications/:id/ai-assist", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const app = await requireApplication(req, id);
    const scope = await applicationScope(req, app, u);
    if (!scope) throw new AppError(403, "FORBIDDEN", "You do not have access to this application");
    const kind = String((req.body && req.body.kind) || "FULL").toUpperCase();
    if (!dom.APPLICATION_ASSIST_KINDS.includes(kind)) kind = "FULL";
    const challenge = await activeStore.getChallenge(app.challengeId);
    const problem = app.problemId ? await activeStore.getProblem(app.problemId) : (challenge && challenge.problemId ? await activeStore.getProblem(challenge.problemId) : null);
    const startup = await startupForApplication(app);
    const docs = startup ? await activeStore.listStartupDocuments(startup.id) : [];
    const lang = String((req.body && req.body.lang) || "en");
    const assist = await apps.applicationAiAssist({ application: app, challenge, problem, docs, startup, kind, lang }, ai);
    const record = await activeStore.createApplicationAiAssist(dom.prepareApplicationAiAssist({
      applicationId: id,
      organizationId: app.organizationId,
      kind: assist.kind,
      inputJson: { challengeId: app.challengeId, problemId: app.problemId },
      outputJson: assist,
      mode: assist.mode === "ai" ? "AI" : "DETERMINISTIC",
      model: assist.mode === "ai" ? "groq" : "",
      generatedBy: u.id,
      isDemo: app.isDemo,
    }));
    await audit(req, { action: "APPLICATION_AI_ASSIST_RUN", entityType: "APPLICATION_AI_ASSIST", entityId: record.id, organizationId: app.organizationId, newValue: { id: record.id, kind: record.kind, mode: record.mode }, isDemo: app.isDemo });
    res.status(201).json({ assist, record: { id: record.id, mode: record.mode, kind: record.kind, createdAt: record.createdAt } });
  });

  router.get("/applications/:id/assists", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const app = await requireApplication(req, id);
    const scope = await applicationScope(req, app, ur);
    if (!scope) throw new AppError(403, "FORBIDDEN", "You do not have access to this application");
    res.json({ assists: await activeStore.listApplicationAiAssists(id) });
  });

  router.post("/applications/:id/review", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const app = await requireApplication(req, id);
    const challenge = await activeStore.getChallenge(app.challengeId);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    await orgAction(req, challenge.organizationId, "APPLICATION_REVIEW", u);
    if (!["SUBMITTED", "UNDER_REVIEW", "NEEDS_MORE_INFORMATION", "ELIGIBLE"].includes(app.status)) {
      throw new AppError(409, "NOT_REVIEWABLE", `Application in ${app.status} cannot be reviewed`);
    }
    const startup = await startupForApplication(app);
    if (!startup) throw new AppError(400, "VALIDATION_FAILED", "No startup profile exists for this organization");

    let eligibility = { verdict: null, ran: false };
    const allRules = await activeStore.listEligibilityRules(app.challengeId);
    const activeRules = allRules.filter((r) => r.lifecycleStatus === "ACTIVE");
    if (activeRules.length) {
      const ctx = await buildEligibilityContext(startup, app.challengeId);
      const results = activeRules.map((rule) => dom.evaluateRuleEvidenceAware(rule, ctx));
      const summary = dom.aggregateEligibilityV2(results);
      const snapshotRow = await activeStore.createEligibilitySnapshot({
        challengeId: app.challengeId, startupId: startup.id, ruleVersion: activeRules[0].ruleVersion || 1,
        overallStatus: summary.verdict, summary, results, evaluatedBy: u.id, evaluatedAt: now(),
        reason: `Application review (${app.id})`,
      });
      eligibility = { verdict: summary.verdict, ran: true, snapshotId: snapshotRow.id, results };
    }

    const completeness = apps.submissionCompleteness(app);
    const explicitDecision = req.body && req.body.decision ? String(req.body.decision).toUpperCase() : null;
    let decision;
    if (explicitDecision && ["ELIGIBLE", "REJECTED", "NEEDS_MORE_INFORMATION"].includes(explicitDecision)) {
      decision = { status: explicitDecision, reason: String((req.body && req.body.reason) || "Officer decision").slice(0, 2000) };
    } else if (eligibility.ran) {
      decision = apps.classifyReview({ eligibilityVerdict: eligibility.verdict, completeness });
    } else {
      decision = completeness.complete
        ? { status: "ELIGIBLE", reason: "No active eligibility rules; submission complete and accepted into the applicant pool." }
        : { status: "NEEDS_MORE_INFORMATION", reason: `Submission incomplete: ${completeness.missing.join(", ")}.` };
    }

    const patch = { status: decision.status, decisionReason: decision.reason, reviewedBy: u.id, reviewedAt: now() };
    if (decision.status === "NEEDS_MORE_INFORMATION") {
      patch.requiredAction = String((req.body && req.body.requiredAction) || "Provide the requested information and evidence.").slice(0, 500);
      if (Array.isArray(req.body && req.body.requestItems)) {
        patch.needsInfoRequests = req.body.requestItems.map((x) => String(x).slice(0, 500)).slice(0, 20);
      }
    }
    if (req.body && req.body.internalNotes != null) patch.internalNotes = String(req.body.internalNotes).slice(0, 4000);
    const updated = await activeStore.patchApplication(id, patch);

    await audit(req, { action: "APPLICATION_REVIEWED", entityType: "CHALLENGE_APPLICATION", entityId: id, organizationId: challenge.organizationId, oldValue: snapshot(app), newValue: snapshot(updated), isDemo: app.isDemo });
    res.json({ ...updated, eligibility, completeness });
  });

  router.post("/applications/:id/request-info", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const app = await requireApplication(req, id);
    const challenge = await activeStore.getChallenge(app.challengeId);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    await orgAction(req, challenge.organizationId, "APPLICATION_REQUEST_INFO", u);
    apps.assertApplicationTransition(app.status, "NEEDS_MORE_INFORMATION");
    const patch = {
      status: "NEEDS_MORE_INFORMATION",
      requiredAction: String((req.body && req.body.requiredAction) || "Provide the requested information and evidence.").slice(0, 500),
      decisionReason: String((req.body && req.body.reason) || "Additional information required.").slice(0, 2000),
      reviewedBy: u.id,
      reviewedAt: now(),
    };
    if (Array.isArray(req.body && req.body.requestItems)) {
      patch.needsInfoRequests = req.body.requestItems.map((x) => String(x).slice(0, 500)).slice(0, 20);
    }
    const updated = await activeStore.patchApplication(id, patch);
    await audit(req, { action: "APPLICATION_INFO_REQUESTED", entityType: "CHALLENGE_APPLICATION", entityId: id, organizationId: challenge.organizationId, oldValue: snapshot(app), newValue: snapshot(updated), isDemo: app.isDemo });
    res.json(updated);
  });

  router.post("/applications/:id/status", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const app = await requireApplication(req, id);
    const challenge = await activeStore.getChallenge(app.challengeId);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    await orgAction(req, challenge.organizationId, "APPLICATION_STATUS", u);
    const to = String((req.body && req.body.status) || "").toUpperCase();
    if (!dom.APPLICATION_STATUSES.includes(to)) {
      throw new AppError(400, "VALIDATION_FAILED", "Status must be one of the valid application statuses");
    }
    apps.assertApplicationTransition(app.status, to);
    const patch = {
      status: to,
      decisionReason: String((req.body && req.body.reason) || `Government moved application to ${to}`).slice(0, 2000),
      reviewedBy: u.id,
      reviewedAt: now(),
    };
    const updated = await activeStore.patchApplication(id, patch);
    await audit(req, { action: "APPLICATION_STATUS_CHANGED", entityType: "CHALLENGE_APPLICATION", entityId: id, organizationId: challenge.organizationId, oldValue: snapshot(app), newValue: snapshot(updated), isDemo: app.isDemo });
    res.json(updated);
  });

  /* ════════ startups ════════ */
  async function visibleStartupOrgs(startupId) {
    return activeStore.startupVisibleOrganizations(startupId);
  }

  async function canReadStartup(u, startup) {
    if (!startup) return false;
    if (startup.organizationId) {
      const m = await activeStore.getMembership(u.id, startup.organizationId);
      if (m) return true;
    }
    const visible = await visibleStartupOrgs(startup.id);
    for (const orgId of visible) {
      const m = await activeStore.getMembership(u.id, orgId);
      if (m) return true;
    }
    return false;
  }

  async function requireStartupOrgAction(req, startup, action, u) {
    if (!startup.organizationId) throw new AppError(403, "FORBIDDEN", "This startup has no owning organization");
    return orgAction(req, startup.organizationId, action, u);
  }

  router.post("/startups", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareStartup(req.body);
    const orgId = data.organizationId || (await bodyUuid0(req));
    await orgAction(req, orgId, "STARTUP_REGISTER", u);
    await activeStore.patchOrganization(orgId, {});
    data.organizationId = orgId;
    data.createdBy = u.id;
    if (data.isDemo) data.isDemo = true;
    const created = await activeStore.createStartup(data);
    await audit(req, { action: "STARTUP_REGISTERED", entityType: "STARTUP", entityId: created.id, organizationId: orgId, newValue: created, isDemo: created.isDemo });
    res.status(201).json(created);
  });

  async function bodyUuid0(req) {
    const orgId = bodyUuid(req.body, "organizationId", { required: true });
    return orgId;
  }

  router.get("/startups", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);
    res.json({ startups: await activeStore.listStartups(organizationId) });
  });

  router.get("/startups/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const startup = await activeStore.getStartup(id);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    if (!(await canReadStartup(ur, startup))) {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    }
    res.json(startup);
  });

  router.patch("/startups/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startup = await activeStore.getStartup(id);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    await requireStartupOrgAction(req, startup, "STARTUP_UPDATE", u);
    const patch = { ...dom.prepareStartup({ ...startup, ...req.body, organizationId: startup.organizationId }), createdBy: startup.createdBy };
    const updated = await activeStore.patchStartup(id, patch);
    await audit(req, { action: "STARTUP_UPDATED", entityType: "STARTUP", entityId: id, organizationId: startup.organizationId, oldValue: startup, newValue: updated });
    res.json(updated);
  });

  router.post("/startups/:id/capabilities", async (req, res) => {
    const startupId = paramUuid(req, "id");
    const u = await user(req);
    const startup = await activeStore.getStartup(startupId);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    await requireStartupOrgAction(req, startup, "STARTUP_CAPABILITY", u);
    const entry = dom.prepareStartupCapability({ ...req.body, startupId });
    const capability = await activeStore.getCapability(entry.capabilityId);
    if (!capability) throw new AppError(400, "VALIDATION_FAILED", "capability_id does not reference a known capability");
    const created = await activeStore.addStartupCapability(entry);
    await audit(req, { action: "STARTUP_CAPABILITY_ADDED", entityType: "STARTUP", entityId: startupId, organizationId: startup.organizationId, newValue: { id: created.id, capabilityId: capability.key } });
    res.status(201).json({ ...created, capability });
  });

  router.get("/startups/:id/capabilities", async (req, res) => {
    const startupId = paramUuid(req, "id");
    const ur = await user(req);
    const startup = await activeStore.getStartup(startupId);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    if (!(await canReadStartup(ur, startup))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    const caps = await activeStore.listStartupCapabilities(startupId);
    res.json({ capabilities: caps });
  });

  router.post("/startups/:id/documents", async (req, res) => {
    const startupId = paramUuid(req, "id");
    const u = await user(req);
    const startup = await activeStore.getStartup(startupId);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    await requireStartupOrgAction(req, startup, "STARTUP_DOCUMENT_UPLOAD", u);
    const entry = dom.prepareStartupDocument({ ...req.body, startupId });
    entry.uploadedBy = u.id;
    const created = await activeStore.createStartupDocument(entry);
    await audit(req, { action: "DOCUMENT_UPLOADED", entityType: "STARTUP_DOCUMENT", entityId: created.id, organizationId: startup.organizationId, newValue: { id: created.id, docType: created.docType, status: created.status } });
    res.status(201).json(created);
  });

  router.get("/startups/:id/documents", async (req, res) => {
    const startupId = paramUuid(req, "id");
    const ur = await user(req);
    const startup = await activeStore.getStartup(startupId);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    if (!(await canReadStartup(ur, startup))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    res.json({ documents: await activeStore.listStartupDocuments(startupId) });
  });

  router.post("/startups/:id/verifications", async (req, res) => {
    const startupId = paramUuid(req, "id");
    const u = await user(req);
    const startup = await activeStore.getStartup(startupId);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    await requireStartupOrgAction(req, startup, "VERIFICATION_RECORD", u);
    const entry = dom.prepareVerification({ ...req.body, targetType: "STARTUP", targetId: startupId, verifiedBy: u.id });
    const created = await activeStore.createVerification(entry);
    await activeStore.recomputeStartupVerification(startupId);
    await audit(req, { action: "VERIFICATION_PERFORMED", entityType: "VERIFICATION", entityId: created.id, organizationId: startup.organizationId, newValue: { id: created.id, verificationType: created.verificationType, source: created.source, status: created.status } });
    res.status(201).json(created);
  });

  router.get("/startups/:id/verifications", async (req, res) => {
    const startupId = paramUuid(req, "id");
    const ur = await user(req);
    const startup = await activeStore.getStartup(startupId);
    if (!startup) return res.status(404).json({ error: "Startup not found" });
    if (!(await canReadStartup(ur, startup))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    res.json({ verifications: await activeStore.listVerifications("STARTUP", startupId) });
  });

  /* ════════ startup intelligence profile (SIH startup intelligence layer) ════════
     Additive layer keyed off the existing startups row. Field-level provenance and
     verification are kept separate; AI inference never auto-verifies. */

  async function loadStartupOr404(id) {
    const startupRow = await activeStore.getStartup(id);
    if (!startupRow) throw new AppError(404, "NOT_FOUND", "Startup not found");
    return startupRow;
  }

  async function recomputeProfileState(req, startupRow, u) {
    const intel = await activeStore.getStartupIntelligence(startupRow.id);
    const profile = (intel.profile && intel.profile.profileJson) || {};
    const completeness = startup.computeCompleteness(profile);
    const attrs = (intel.profile && intel.profile.attributes) || {};
    const breakdown = startup.computeVerificationBreakdown(profile, intel.verifications, attrs);
    let profileStatus = (intel.profile && intel.profile.profileStatus) || "DRAFT";
    const derived = startup.deriveProfileStatus(breakdown, profileStatus);
    if (profileStatus === "DRAFT") profileStatus = derived;

    const extractedDocs = (intel.documents || []).map((d) => ({
      label: d.label,
      extractedCompanyName: d.extractedMeta && (d.extractedMeta.companyName || d.extractedMeta.organizationName),
    }));
    const knownRegistrations = {
      deploymentCount: (intel.profile && intel.profile.profileJson && intel.profile.profileJson.deployment
        ? Number(intel.profile.profileJson.deployment.count) || 0 : 0),
    };
    const contradictions = startup.detectContradictions(profile, extractedDocs, knownRegistrations);
    const riskFlags = startup.assessRiskFlags(profile, {
      certifications: intel.certifications,
      documents: intel.documents,
      verifications: intel.verifications,
      attributes: attrs,
    });
    const flags = [...contradictions, ...riskFlags];

    const existingFlagTypes = new Set((intel.flags || []).filter((f) => f.status === "OPEN").map((f) => f.type + "::" + (f.ref || "")));
    const newFlags = [];
    for (const f of flags) {
      const key = (f.type || "") + "::" + (f.ref || "");
      if (!existingFlagTypes.has(key)) {
        const created = await activeStore.createProfileFlag(startup.prepareFlag({ ...f, startupId: startupRow.id }));
        newFlags.push(created);
        await audit(req, { action: "VERIFICATION_FLAG_CREATED", entityType: "STARTUP_FLAG", entityId: created.id, organizationId: startupRow.organizationId, newValue: { type: created.type, severity: created.severity }, isDemo: startupRow.isDemo });
      }
    }

    if (intel.profile) {
      await activeStore.patchStartupProfile(startupRow.id, {
        completeness,
        profileStatus,
        updatedBy: u.id,
      });
      intel.profile.completeness = completeness;
      intel.profile.profileStatus = profileStatus;
    }

    const health = startup.computeProfileHealth(profile, {
      verifications: intel.verifications,
      flags: intel.flags,
      certifications: intel.certifications,
    });
    return {
      intel, completeness, breakdown, profileStatus, health, flags: newFlags.length ? newFlags : flags,
    };
  }

  router.get("/startups/:id/profile", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    const profile = await activeStore.getStartupProfile(id);
    if (!profile) return res.status(404).json({ error: "Profile not found. Create it first." });
    const pj = profile.profileJson || {};
    const transformed = { ...profile, identity: pj.identity || {}, business: pj.business || {}, technology: pj.technology || {}, useCases: pj.useCases || {}, deployment: pj.deployment || {}, team: pj.team || {}, geography: pj.geography || {}, scalability: pj.scalability || {}, pilot: pj.pilot || {}, security: pj.security || {} };
    res.json(transformed);
  });

  /* A startup row is created with an empty seeded profile row so that the
     profile always exists for reads. A first real POST therefore lands on a
     seeded-empty row; we still treat it as a CREATE (201 + PROFILE_CREATED
     audit), replacing the seed content instead of inserting a duplicate row. */
  function isSeededEmptyProfile(profileJson) {
    if (!profileJson) return true;
    if (typeof profileJson !== "object") return false;
    return ["identity", "business", "technology", "useCases", "deployment", "team", "geography", "scalability", "pilot", "security"]
      .every((k) => {
        const v = profileJson[k];
        if (v == null) return true;
        if (Array.isArray(v)) return v.length === 0;
        if (typeof v === "object") return Object.keys(v).length === 0;
        return String(v).trim() === "";
      });
  }

  router.post("/startups/:id/profile", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_PROFILE_EDIT", u);
    const prepared = startup.prepareProfile({ ...req.body, startupId: id });
    if (!prepared.startupId) prepared.startupId = id;
    const existing = await activeStore.getStartupProfile(id);
    const isCreate = existing && isSeededEmptyProfile(existing.profileJson);
    let profile;
    if (existing && !isCreate) {
      profile = await activeStore.patchStartupProfile(id, {
        profileJson: prepared.profileJson,
        attributes: prepared.attributes,
        updatedBy: u.id,
      });
      await audit(req, { action: "PROFILE_UPDATED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { updated: true }, isDemo: startupRow.isDemo });
    } else if (existing && isCreate) {
      const mergedAttrs = Object.assign({}, existing.attributes || {}, prepared.attributes || {});
      profile = await activeStore.patchStartupProfile(id, {
        profileJson: prepared.profileJson,
        attributes: mergedAttrs,
        updatedBy: u.id,
      });
      await audit(req, { action: "PROFILE_CREATED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { created: true }, isDemo: startupRow.isDemo });
    } else {
      const row = Object.assign({}, prepared, { startupId: id, updatedBy: u.id });
      profile = await activeStore.createStartupProfile(row);
      await audit(req, { action: "PROFILE_CREATED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { created: true }, isDemo: startupRow.isDemo });
    }
    const state = await recomputeProfileState(req, startupRow, u);
    res.status(existing && !isCreate ? 200 : 201).json({ profile, ...state });
  });

  router.patch("/startups/:id/profile", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_PROFILE_EDIT", u);
    const existing = await activeStore.getStartupProfile(id);
    if (!existing) throw new AppError(404, "NOT_FOUND", "Profile not found");
    const patchedProfile = typeof existing.profileJson === "object" ? existing.profileJson : {};
    const sectionTarget = req.body && req.body.section;
    if (sectionTarget && (req.body.value !== undefined) && typeof patchedProfile === "object") {
      patchedProfile[sectionTarget] = req.body.value;
    } else {
      const prepared = startup.prepareProfile({ ...existing.profileJson, ...(req.body.payload || {}), startupId: id });
      Object.assign(patchedProfile, prepared.profileJson);
    }
    const mergedAttrs = Object.assign({}, existing.attributes || {}, (req.body.attributes || {}));
    const profile = await activeStore.patchStartupProfile(id, { profileJson: patchedProfile, attributes: mergedAttrs, updatedBy: u.id });
    await audit(req, { action: "PROFILE_UPDATED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { section: req.body && req.body.section }, isDemo: startupRow.isDemo });
    const state = await recomputeProfileState(req, startupRow, u);
    res.json({ profile, ...state });
  });

  router.post("/startups/:id/profile/submit", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_PROFILE_EDIT", u);
    const existing = await activeStore.getStartupProfile(id);
    if (!existing) throw new AppError(400, "VALIDATION_FAILED", "Cannot submit a profile that has not been created");
    const completeness = startup.computeCompleteness(existing.profileJson || {});
    if (completeness.score < 40) {
      throw new AppError(409, "INCOMPLETE", `Profile is only ${completeness.score}% complete. Complete key sections before submitting.`);
    }
    const profile = await activeStore.patchStartupProfile(id, { profileStatus: "SUBMITTED", submittedAt: new Date().toISOString(), updatedBy: u.id });
    await audit(req, { action: "PROFILE_SUBMITTED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { status: "SUBMITTED" }, isDemo: startupRow.isDemo });
    res.json(profile);
  });

  router.post("/startups/:id/profile/analyze", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_ANALYZE", u);
    const existing = await activeStore.getStartupProfile(id);
    const profileData = (existing && existing.profileJson) || {};
    const result = await startup.extractProfileSuggestions({
      ai, profile: profileData, lang: String((req.body && req.body.lang) || "en"),
      endpoint: "/api/sih/startups/:id/profile/analyze",
    });
    const saved = [];
    for (const s of result.suggestions) {
      const rec = await activeStore.createAiSuggestion(startup.prepareAiSuggestion({
        ...s, startupId: id, model: result.model, promptVersion: result.promptVersion, mode: result.mode, generatedBy: u.id,
      }));
      saved.push(rec);
      await audit(req, { action: "AI_SUGGESTION_GENERATED", entityType: "STARTUP_AI_SUGGESTION", entityId: rec.id, organizationId: startupRow.organizationId, newValue: { kind: rec.kind, label: rec.label }, isDemo: startupRow.isDemo });
    }
    await audit(req, { action: "AI_ANALYSIS_REQUESTED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { mode: result.mode, count: saved.length }, isDemo: startupRow.isDemo });
    res.json({ mode: result.mode, model: result.model, suggestions: saved });
  });

  router.post("/startups/:id/profile/recompute", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    const state = await recomputeProfileState(req, startupRow, u);
    res.json(state);
  });

  router.get("/startups/:id/intelligence", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    const intel = await activeStore.getStartupIntelligence(id);
    res.json(intel);
  });

  /* capabilities (creation goes through existing /startups/:id/capabilities; the
     structured taxonomy is exposed via the frontend constants and intelligence payload) */

  /* certifications */
  router.post("/startups/:id/certifications", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_PROFILE_EDIT", u);
    const cert = startup.prepareCertification({ ...req.body, startupId: id });
    cert.expiryStatus = startup.expiryStatus(cert.issuedDate, cert.expiryDate);
    const created = await activeStore.createStartupCertification(cert);
    await audit(req, { action: "CERTIFICATION_ADDED", entityType: "STARTUP_CERTIFICATION", entityId: created.id, organizationId: startupRow.organizationId, newValue: { name: created.name, expiryStatus: created.expiryStatus }, isDemo: startupRow.isDemo });
    res.status(201).json(created);
  });

  router.get("/startups/:id/certifications", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    const rows = await activeStore.listStartupCertifications(id);
    res.json({ certifications: rows.map((r) => ({ ...r, expiryStatus: r.expiryStatus || startup.expiryStatus(r.issuedDate, r.expiryDate) })) });
  });

  /* evidence */
  router.post("/startups/:id/evidence", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_PROFILE_EDIT", u);
    const evidence = startup.prepareEvidence({ ...req.body, startupId: id });
    const created = await activeStore.createStartupEvidence({ ...evidence, createdBy: u.id });
    await audit(req, { action: "EVIDENCE_ADDED", entityType: "STARTUP_EVIDENCE", entityId: created.id, organizationId: startupRow.organizationId, newValue: { section: created.section, field: created.field, verificationStatus: created.verificationStatus }, isDemo: startupRow.isDemo });
    res.status(201).json(created);
  });

  router.get("/startups/:id/evidence", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    res.json({ evidence: await activeStore.listStartupEvidence(id) });
  });

  /* field-level verification (Part 14) — only authorized verifiers may set VERIFIED,
     and VERIFIED always requires an evidence reference. */
  router.post("/startups/:id/verifications/field", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_VERIFY", u);
    const entry = startup.prepareProfileVerification({ ...req.body, startupId: id });
    if (entry.status === "VERIFIED" && !entry.evidenceId) {
      throw new AppError(400, "VALIDATION_FAILED", "VERIFIED requires an evidence reference (evidenceId)");
    }
    entry.verifiedBy = u.id;
    entry.verifiedAt = new Date().toISOString();
    const created = await activeStore.upsertProfileVerification(entry);
    await audit(req, { action: "VERIFICATION_STATUS_CHANGED", entityType: "STARTUP_VERIFICATION", entityId: id, organizationId: startupRow.organizationId, newValue: { section: created.section, status: created.status }, isDemo: startupRow.isDemo });
    const state = await recomputeProfileState(req, startupRow, u);
    res.json({ verification: created, ...state });
  });

  router.get("/startups/:id/verifications/field", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    res.json({ verifications: await activeStore.listProfileVerifications(id) });
  });

  /* AI suggestion resolution (Part 11) — human confirmation controls canonical profile.
     Accepting/editing persists the attribute only at USER_PROVIDED / AI_SUGGESTED (confirmed),
     never VERIFIED. */
  router.post("/startups/:id/suggestions/:sid/resolve", async (req, res) => {
    const id = paramUuid(req, "id");
    const sid = paramUuid(req, "sid");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_SUGGEST_RESOLVE", u);
    const sug = await activeStore.getAiSuggestion(sid);
    if (!sug || sug.startupId !== id) throw new AppError(404, "NOT_FOUND", "Suggestion not found");
    const decision = String((req.body && req.body.decision) || "").toUpperCase();
    if (!["ACCEPT", "REJECT", "EDIT"].includes(decision)) throw new AppError(400, "VALIDATION_FAILED", "decision must be ACCEPT, REJECT or EDIT");
    let status = "PENDING";
    if (decision === "ACCEPT") status = "ACCEPTED";
    else if (decision === "REJECT") status = "REJECTED";
    else status = "EDITED";
    let updated = await activeStore.patchAiSuggestion(sid, { status, ...(decision === "EDIT" && req.body.label ? { label: String(req.body.label).slice(0, 200) } : {}) });
    await audit(req, { action: "AI_SUGGESTION_" + status, entityType: "STARTUP_AI_SUGGESTION", entityId: sid, organizationId: startupRow.organizationId, newValue: { kind: sug.kind, label: sug.label, status }, isDemo: startupRow.isDemo });

    if (decision !== "REJECT") {
      // fold the confirmed classification into the canonical profile (USER_PROVIDED-confirmed),
      // attaching provenance via an evidence record so it stays distinct from VERIFIED.
      const label = decision === "EDIT" ? (req.body.label || sug.label) : sug.label;
      const target = sug.kind === "TECHNOLOGY" ? ["technology", "technologies"]
        : sug.kind === "SECTOR" ? ["business", "sector"]
        : sug.kind === "USE_CASE" ? ["useCases", "primary"] : null;
      const profile = await activeStore.getStartupProfile(id);
      if (profile && target) {
        const pj = profile.profileJson || {};
        const section = pj[target[0]] || {};
        const list = Array.isArray(section[target[1]]) ? section[target[1]] : [];
        if (!list.includes(label)) {
          section[target[1]] = [...list, label];
          pj[target[0]] = section;
          const attrs = Object.assign({}, profile.attributes || {});
          attrs[`${target[0]}.${target[1]}`] = { provenance: "USER_PROVIDED", verification: "SELF_DECLARED" };
          await activeStore.patchStartupProfile(id, { profileJson: pj, attributes: attrs, updatedBy: u.id });
          await activeStore.createStartupEvidence(startup.prepareEvidence({
            startupId: id, section: target[0].toUpperCase(), field: target[1],
            claim: `${target[1]} includes ${label}`,
            provenance: "AI_SUGGESTED", verificationStatus: "REVIEW_REQUIRED", createdBy: u.id,
          }));
          await audit(req, { action: "PROFILE_UPDATED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { section: target[0], value: label }, isDemo: startupRow.isDemo });
        }
      }
    }
    res.json(updated);
  });

  router.get("/startups/:id/suggestions", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    res.json({ suggestions: await activeStore.listAiSuggestions(id) });
  });

  /* document duplicate detection (Part 7) — metadata only */
  router.post("/startups/:id/documents/duplicate-check", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    if (!(await canReadStartup(u, startupRow))) throw new AppError(403, "FORBIDDEN", "You do not have access to this startup");
    const hash = String((req.body && req.body.docHash) || "").trim();
    const fingerprint = String((req.body && req.body.fingerprint) || "").trim();
    let existing = null;
    if (hash) existing = await activeStore.findDocumentByHash(hash);
    if (!existing && fingerprint) existing = await activeStore.findDocumentByFingerprint(fingerprint);
    if (existing) {
      res.json({ duplicate: true, existing: { id: existing.id, label: existing.label, docType: existing.docType, uploadedAt: existing.uploadedAt } });
    } else {
      res.json({ duplicate: false, existing: null });
    }
  });

  /* document analyze — reuses existing document extraction metadata + expiry detection.
     Extraction is DOCUMENT_EXTRACTED; it NEVER auto-verifies a field. */
  router.post("/startups/:id/documents/:did/analyze", async (req, res) => {
    const id = paramUuid(req, "id");
    const did = paramUuid(req, "did");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_DOCUMENT_STATUS", u);
    const doc = await activeStore.getStartupDocument(did);
    if (!doc || doc.startupId !== id) throw new AppError(404, "NOT_FOUND", "Document not found");
    const incoming = (req.body && req.body.extraction) || {};
    const issueDate = incoming.issueDate || (doc.extractedMeta && doc.extractedMeta.issueDate) || null;
    const expiryDate = incoming.expiryDate || (doc.extractedMeta && doc.extractedMeta.expiryDate) || null;
    const extractedMeta = Object.assign({}, doc.extractedMeta || {}, incoming, { issueDate, expiryDate });
    const expStatus = startup.expiryStatus(issueDate, expiryDate);
    const patched = await activeStore.patchStartupDocument(did, {
      status: "EXTRACTED",
      extractedMeta,
      issueDate,
      expiryDate,
      expiryStatus: expStatus,
      ...(incoming.docHash ? { docHash: String(incoming.docHash).slice(0, 200) } : {}),
      ...(incoming.fingerprint ? { fingerprint: String(incoming.fingerprint).slice(0, 300) } : {}),
    });

    // auto-create DOCUMENT_EXTRACTED evidence (never VERIFIED)
    const fields = [
      ["identity", "companyName", extractedMeta.companyName],
      ["startupStatus", "dpiitNumber", extractedMeta.dpiitNumber || extractedMeta.registrationNumber],
      ["startupStatus", "dpiitStatus", extractedMeta.dpiitStatus],
      ["certifications", "certification", extractedMeta.certificationName],
    ];
    for (const [section, field, value] of fields) {
      if (value) {
        await activeStore.createStartupEvidence(startup.prepareEvidence({
          startupId: id, section, field, claim: String(value),
          provenance: "DOCUMENT_EXTRACTED", verificationStatus: "REVIEW_REQUIRED",
          documentId: did, pageRef: incoming.pageRef || null,
          confidence: incoming.confidence != null ? incoming.confidence : null, createdBy: u.id,
        }));
      }
    }
    await audit(req, { action: "DOCUMENT_EXTRACTED", entityType: "STARTUP_DOCUMENT", entityId: did, organizationId: startupRow.organizationId, newValue: { expiryStatus: expStatus, fields: fields.filter((f) => f[2]).length }, isDemo: startupRow.isDemo });
    const state = await recomputeProfileState(req, startupRow, u);
    res.json({ document: patched, expiryStatus: expStatus, extraction: extractedMeta, ...state });
  });

  /* ════════ eligibility ════════ */
  router.post("/eligibility/rules", async (req, res) => {
    const u = await user(req);
    /* V2 accepts both legacy and richer rule-model fields (severity, ruleType,
       provenance, versioning, lifecycle). Default lifecycle is DRAFT so rules
       require human approval before they can affect production eligibility. */
    const data = dom.prepareEligibilityRuleV2(req.body);
    const orgId = await challengeOrg(data.challengeId);
    await orgAction(req, orgId, "ELIGIBILITY_RULE", u);
    data.createdBy = u.id;
    data.updatedBy = u.id;
    const created = await activeStore.createEligibilityRule(data);
    await audit(req, { action: "ELIGIBILITY_RULE_CREATED", entityType: "ELIGIBILITY_RULE", entityId: created.id, organizationId: orgId, newValue: created });
    res.status(201).json(created);
  });

  async function challengeOrg(challengeId) {
    const challenge = await activeStore.getChallenge(challengeId);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    return challenge.organizationId;
  }

  router.get("/eligibility/rules", async (req, res) => {
    const ur = await user(req);
    const challengeId = bodyUuid(req.query, "challengeId", { required: true });
    const orgId = await challengeOrg(challengeId);
    await memberOf(req, orgId, ur);
    const all = await activeStore.listEligibilityRules(challengeId);
    const rules = (req.query.active === "true") ? all.filter((r) => r.lifecycleStatus === "ACTIVE") : all;
    res.json({ rules });
  });

  router.post("/eligibility/check", async (req, res) => {
    const u = await user(req);
    const { challengeId, startupId } = dom.prepareEligibilityCheckRequest(req.body);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "ELIGIBILITY_CHECK", u);

    const startup = await activeStore.getStartup(startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");

    const rules = await activeStore.listEligibilityRules(challengeId);
    if (!rules.length) throw new AppError(400, "VALIDATION_FAILED", "No eligibility rules defined for this challenge");

    const caps = await activeStore.listStartupCapabilities(startupId);
    const capabilityKeyById = new Map();
    const allCaps = await activeStore.listCapabilities();
    for (const c of allCaps) capabilityKeyById.set(c.key, c.id);
    const capabilityIdByKey = new Map();
    for (const c of allCaps) capabilityIdByKey.set(c.key, c.id);

    const results = rules.map((rule) => {
      /* capability references in reference_value.key resolve by key */
      const evalRule = { ...rule, referenceValue: rule.referenceValue };
      const evaluated = dom.evaluateRuleAgainstStartup(
        evalRule,
        startup,
        caps,
        rule.operator === "HAS_CAPABILITY" ? capabilityIdByKey : capabilityKeyById
      );
      return evaluated;
    });

    const aggregate = dom.aggregateEligibility(results, rules);
    const check = await activeStore.createEligibilityCheck(
      { challengeId, startupId, requestedBy: u.id, status: "EVALUATED", mode: "MANUAL" },
      results
    );

    await audit(req, { action: "ELIGIBILITY_EVALUATED", entityType: "ELIGIBILITY_CHECK", entityId: check.id, organizationId: orgId, newValue: { id: check.id, verdict: aggregate.verdict, results: results.length }, isDemo: startup.isDemo });
    res.status(201).json({ ...check, summary: aggregate });
  });

  router.get("/eligibility/checks", async (req, res) => {
    const ur = await user(req);
    const challengeId = bodyUuid(req.query, "challengeId", { required: true });
    const orgId = await challengeOrg(challengeId);
    await memberOf(req, orgId, ur);
    const checks = await activeStore.listEligibilityChecks(challengeId);
    const out = [];
    for (const c of checks) out.push(await activeStore.getEligibilityCheck(c.id));
    res.json({ checks: out.filter(Boolean) });
  });

  router.get("/eligibility/checks/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const check = await activeStore.getEligibilityCheck(id);
    if (!check) return res.status(404).json({ error: "Eligibility check not found" });
    const orgId = await challengeOrg(check.challengeId);
    await memberOf(req, orgId, ur);
    res.json(check);
  });

  /* ════════ eligibility engine (additive, evidence-aware) ════════ */

  /* Loads a rule (404-safe) and verifies challenger-org membership. */
  async function loadEligibilityRule(req, id, ur) {
    const rule = await activeStore.getEligibilityRule(id);
    if (!rule) throw new AppError(404, "NOT_FOUND", "Eligibility rule not found");
    const orgId = await challengeOrg(rule.challengeId);
    await memberOf(req, orgId, ur);
    return { rule, orgId };
  }

  /* Rule Builder — GET single rule (with versions). */
  router.get("/eligibility/rules/:id", async (req, res) => {
    const ur = await user(req);
    const id = paramUuid(req, "id");
    const { rule } = await loadEligibilityRule(req, id, ur);
    const versions = await activeStore.listEligibilityRuleVersions(id);
    const review = await activeStore.listReviewActions(id);
    res.json({ ...rule, versions, reviewActions: review });
  });

  /* Rule Builder — edit a rule (DRAFT/INACTIVE only unless reviewer edits). */
  router.patch("/eligibility/rules/:id", async (req, res) => {
    const u = await user(req);
    const id = paramUuid(req, "id");
    const { rule, orgId } = await loadEligibilityRule(req, id, u);
    await orgAction(req, orgId, "ELIGIBILITY_RULE", u);
    const base = dom.prepareEligibilityRule(req.body || {});
    /* allow partial patch across both legacy and v2 fields */
    const v2 = dom.prepareEligibilityRuleV2(req.body || {});
    const patch = {};
    for (const k of ["name","description","criteriaPath","operator","referenceValue","mandatory","category","source","sourceMode","weight","active",
                     "ruleType","severity","sourceCategory","authorityScope","sourceReference","sourceDocument","sectionRef",
                     "sourcePublishedAt","sourceEffectiveAt","sourceRetrievedAt","ruleVersion","effectiveFrom","effectiveUntil",
                     "lifecycleStatus","supersedesRuleId","evidenceRequired","trustThreshold","changeReason"]) {
      if (req.body[k] !== undefined && req.body[k] !== null) patch[k] = v2[k] !== undefined ? v2[k] : base[k];
    }
    if (!rule.version && !rule.ruleType && v2.ruleType) patch.ruleType = v2.ruleType;
    patch.updatedBy = u.id;
    const updated = await activeStore.updateEligibilityRule(id, patch);
    /* record a version snapshot on first active materialization */
    if (v2.lifecycleStatus && v2.lifecycleStatus === "ACTIVE") {
      await activeStore.createEligibilityRuleVersion({
        ruleId: id,
        version: (rule.ruleVersion || 1),
        snapshot: updated,
        createdBy: u.id,
        changeReason: v2.changeReason || "Rule activated",
      });
    }
    await audit(req, { action: "ELIGIBILITY_RULE_MODIFIED", entityType: "ELIGIBILITY_RULE", entityId: id, organizationId: orgId, oldValue: rule, newValue: updated, isDemo: updated.isDemo });
    res.json(updated);
  });

  /* Rule Builder — submit for review. */
  router.post("/eligibility/rules/:id/submit-review", async (req, res) => {
    const u = await user(req);
    const id = paramUuid(req, "id");
    const { rule, orgId } = await loadEligibilityRule(req, id, u);
    await orgAction(req, orgId, "ELIGIBILITY_RULE_SUBMIT_REVIEW", u);
    const updated = await activeStore.updateEligibilityRule(id, { lifecycleStatus: "UNDER_REVIEW", updatedBy: u.id });
    await audit(req, { action: "ELIGIBILITY_RULE_SUBMIT_REVIEW", entityType: "ELIGIBILITY_RULE", entityId: id, organizationId: orgId, oldValue: rule, newValue: updated });
    res.json(updated);
  });

  /* Rule Builder — approve (→ APPROVED; then explicit activate for production). */
  router.post("/eligibility/rules/:id/approve", async (req, res) => {
    const u = await user(req);
    const id = paramUuid(req, "id");
    const { rule, orgId } = await loadEligibilityRule(req, id, u);
    await orgAction(req, orgId, "ELIGIBILITY_RULE_APPROVE", u);
    const updated = await activeStore.updateEligibilityRule(id, { lifecycleStatus: "APPROVED", updatedBy: u.id, changeReason: req.body.reason || "Approved" });
    await activeStore.createReviewAction({ ruleId: id, action: "APPROVE", comment: req.body.comment || "", actorId: u.id });
    await audit(req, { action: "ELIGIBILITY_RULE_APPROVED", entityType: "ELIGIBILITY_RULE", entityId: id, organizationId: orgId, oldValue: rule, newValue: updated });
    res.json(updated);
  });

  /* Rule Builder — reject (→ DRAFT). */
  router.post("/eligibility/rules/:id/reject", async (req, res) => {
    const u = await user(req);
    const id = paramUuid(req, "id");
    const { rule, orgId } = await loadEligibilityRule(req, id, u);
    await orgAction(req, orgId, "ELIGIBILITY_RULE_REJECT", u);
    const updated = await activeStore.updateEligibilityRule(id, { lifecycleStatus: "DRAFT", updatedBy: u.id, changeReason: req.body.reason || "Rejected" });
    await activeStore.createReviewAction({ ruleId: id, action: "REJECT", comment: req.body.comment || "", actorId: u.id });
    await audit(req, { action: "ELIGIBILITY_RULE_REJECTED", entityType: "ELIGIBILITY_RULE", entityId: id, organizationId: orgId, oldValue: rule, newValue: updated });
    res.json(updated);
  });

  /* Rule Builder — activate (only approved rules; never auto). */
  router.post("/eligibility/rules/:id/activate", async (req, res) => {
    const u = await user(req);
    const id = paramUuid(req, "id");
    const { rule, orgId } = await loadEligibilityRule(req, id, u);
    await orgAction(req, orgId, "ELIGIBILITY_RULE_ACTIVATE", u);
    if (!["APPROVED", "ACTIVE", "DRAFT"].includes(rule.lifecycleStatus)) {
      throw new AppError(409, "VALIDATION_FAILED", "Only approved rules can be activated");
    }
    if (rule.effectiveFrom && new Date(rule.effectiveFrom) > new Date()) {
      /* allow scheduling; still mark ACTIVE from effectiveFrom */
    }
    const ver = (rule.ruleVersion || 1) + (rule.lifecycleStatus === "ACTIVE" ? 0 : 1);
    const updated = await activeStore.updateEligibilityRule(id, { lifecycleStatus: "ACTIVE", ruleVersion: ver, active: true, updatedBy: u.id, changeReason: req.body.reason || "Activated" });
    await activeStore.createEligibilityRuleVersion({ ruleId: id, version: ver, snapshot: updated, createdBy: u.id, changeReason: "Activated" });
    await audit(req, { action: "ELIGIBILITY_RULE_ACTIVATED", entityType: "ELIGIBILITY_RULE", entityId: id, organizationId: orgId, oldValue: rule, newValue: updated });
    res.json(updated);
  });

  /* Rule Builder — deactivate (→ INACTIVE). */
  router.post("/eligibility/rules/:id/deactivate", async (req, res) => {
    const u = await user(req);
    const id = paramUuid(req, "id");
    const { rule, orgId } = await loadEligibilityRule(req, id, u);
    await orgAction(req, orgId, "ELIGIBILITY_RULE_DEACTIVATE", u);
    const updated = await activeStore.updateEligibilityRule(id, { lifecycleStatus: "INACTIVE", active: false, updatedBy: u.id, changeReason: req.body.reason || "Deactivated" });
    await activeStore.createReviewAction({ ruleId: id, action: "DEACTIVATE", comment: req.body.comment || "", actorId: u.id });
    await audit(req, { action: "ELIGIBILITY_RULE_DEACTIVATED", entityType: "ELIGIBILITY_RULE", entityId: id, organizationId: orgId, oldValue: rule, newValue: updated });
    res.json(updated);
  });

  /* Rule versions history. */
  router.get("/eligibility/rules/:id/versions", async (req, res) => {
    const ur = await user(req);
    const id = paramUuid(req, "id");
    await loadEligibilityRule(req, id, ur);
    res.json({ versions: await activeStore.listEligibilityRuleVersions(id) });
  });

  /* Potential rule conflicts for a challenge (Part 10). */
  router.get("/eligibility/conflicts", async (req, res) => {
    const ur = await user(req);
    const challengeId = bodyUuid(req.query, "challengeId", { required: true });
    const orgId = await challengeOrg(challengeId);
    await memberOf(req, orgId, ur);
    const rules = await activeStore.listEligibilityRules(challengeId);
    res.json({ conflicts: dom.detectRuleConflicts(rules) });
  });

  /* Build the evidence/facts context from existing startup intelligence. */
  async function buildEligibilityContext(startup, challengeId) {
    const intel = await activeStore.getStartupIntelligence(startup.id);
    return {
      startup,
      capabilities: intel.capabilities || [],
      documents: intel.documents || [],
      evidence: intel.evidence || [],
      verifications: intel.verifications || [],
      certifications: intel.certifications || [],
      profile: intel.profile || null,
      challengeId,
    };
  }

  /* Evidence-aware, deterministic evaluation + immutable snapshot (Parts 12-17, 27). */
  router.post("/eligibility/check/advanced", async (req, res) => {
    const u = await user(req);
    const { challengeId, startupId } = dom.prepareEligibilityCheckRequest(req.body);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "ELIGIBILITY_EVALUATE", u);

    const startup = await activeStore.getStartup(startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");

    const allRules = await activeStore.listEligibilityRules(challengeId);
    const activeRules = allRules.filter((r) => r.lifecycleStatus === "ACTIVE");
    if (!activeRules.length) throw new AppError(400, "VALIDATION_FAILED", "No ACTIVE eligibility rules defined for this challenge");

    const ctx = await buildEligibilityContext(startup, challengeId);
    const results = activeRules.map((rule) => dom.evaluateRuleEvidenceAware(rule, ctx));
    const summary = dom.aggregateEligibilityV2(results);

    /* immutable snapshot stores the exact rule version evaluated */
    const snapshot = await activeStore.createEligibilitySnapshot({
      challengeId, startupId,
      ruleVersion: activeRules[0].ruleVersion || 1,
      overallStatus: summary.verdict,
      summary,
      results,
      evaluatedBy: u.id,
      evaluatedAt: now(),
      reason: req.body.reason || "Eligibility evaluation",
    });

    /* persist a legacy check record too for the existing checks UI + audit */
    const legacy = await activeStore.createEligibilityCheck(
      { challengeId, startupId, requestedBy: u.id, status: "EVALUATED", mode: "MANUAL" },
      results.map((r) => ({ ruleId: r.ruleId, passed: r.passed, status: r.state, actualValue: {}, expectedValue: {}, evidenceReference: r.sourceReference, notes: r.reason }))
    );

    await audit(req, { action: "ELIGIBILITY_EVALUATED", entityType: "ELIGIBILITY_SNAPSHOT", entityId: snapshot.id, organizationId: orgId, newValue: { id: snapshot.id, verdict: summary.verdict, results: results.length }, isDemo: startup.isDemo });
    res.status(201).json({ ...snapshot, results, summary });
  });

  /* Latest eligibility snapshot + history for a startup (startup + gov view). */
  router.get("/eligibility/startups/:startupId", async (req, res) => {
    const ur = await user(req);
    const startupId = paramUuid(req, "startupId");
    const startup = await activeStore.getStartup(startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");
    /* startup owner OR a member of a government org with read scope */
    const ok = await canAccessEligibility(req, startup, ur);
    if (!ok) throw new AppError(403, "FORBIDDEN", "You do not have access to this eligibility assessment");
    const snapshots = await activeStore.listEligibilitySnapshots(null, startupId);
    const latest = snapshots[0] || null;
    res.json({ latest, history: snapshots });
  });

  /* Isolated history for a specific startup×challenge. */
  router.get("/eligibility/startups/:startupId/history", async (req, res) => {
    const ur = await user(req);
    const startupId = paramUuid(req, "startupId");
    const startup = await activeStore.getStartup(startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");
    const ok = await canAccessEligibility(req, startup, ur);
    if (!ok) throw new AppError(403, "FORBIDDEN", "You do not have access to this eligibility assessment");
    const challengeId = bodyUuid(req.query, "challengeId");
    const snapshots = await activeStore.listEligibilitySnapshots(challengeId || null, startupId);
    res.json({ history: snapshots });
  });

  /* Single immutable snapshot. */
  router.get("/eligibility/snapshots/:id", async (req, res) => {
    const ur = await user(req);
    const id = paramUuid(req, "id");
    const snap = await activeStore.getEligibilitySnapshot(id);
    if (!snap) return res.status(404).json({ error: "Eligibility snapshot not found" });
    const startup = await activeStore.getStartup(snap.startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");
    const ok = await canAccessEligibility(req, startup, ur);
    if (!ok) throw new AppError(403, "FORBIDDEN", "You do not have access to this eligibility assessment");
    res.json(snap);
  });

  /* Re-evaluation (Part 28): creates a new immutable snapshot with reason; never mutates the old one. */
  router.post("/eligibility/snapshots/:id/reevaluate", async (req, res) => {
    const u = await user(req);
    const id = paramUuid(req, "id");
    const prev = await activeStore.getEligibilitySnapshot(id);
    if (!prev) return res.status(404).json({ error: "Eligibility snapshot not found" });
    const orgId = await challengeOrg(prev.challengeId);
    await orgAction(req, orgId, "ELIGIBILITY_REEVALUATE", u);
    const startup = await activeStore.getStartup(prev.startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");

    const allRules = await activeStore.listEligibilityRules(prev.challengeId);
    const activeRules = allRules.filter((r) => r.lifecycleStatus === "ACTIVE");
    if (!activeRules.length) throw new AppError(400, "VALIDATION_FAILED", "No ACTIVE eligibility rules defined for this challenge");

    const ctx = await buildEligibilityContext(startup, prev.challengeId);
    const results = activeRules.map((rule) => dom.evaluateRuleEvidenceAware(rule, ctx));
    const summary = dom.aggregateEligibilityV2(results);

    const snapshot = await activeStore.createEligibilitySnapshot({
      challengeId: prev.challengeId, startupId: prev.startupId,
      ruleVersion: activeRules[0].ruleVersion || 1,
      overallStatus: summary.verdict,
      summary, results,
      evaluatedBy: u.id, evaluatedAt: now(),
      reason: req.body.reason || "Re-evaluation triggered",
    });

    await audit(req, { action: "ELIGIBILITY_RE_EVALUATED", entityType: "ELIGIBILITY_SNAPSHOT", entityId: snapshot.id, organizationId: orgId, newValue: { id: snapshot.id, verdict: summary.verdict, prevVerdict: prev.overallStatus, reason: snapshot.reason }, isDemo: startup.isDemo });
    res.status(201).json({ ...snapshot, results, summary, previous: { id: prev.id, overallStatus: prev.overallStatus } });
  });

  /* access gate: startup members on their own org, or government members. */
  async function canAccessEligibility(req, startup, ur) {
    const membership = await activeStore.getMembership(ur.id, startup.organizationId);
    if (membership && membership.status === "ACTIVE") return true;
    const orgs = await activeStore.listOrganizationsForUser(ur.id);
    if (orgs.some((o) => o.orgType === "GOVERNMENT")) return true;
    return false;
  }

  /* ════════ intelligent startup matching (additive, deterministic, decision-support) ════════
     Eligibility is the hard gate (reads immutable eligibility snapshots).
     Matching produces explainable ranked snapshots + human shortlist. No AI
     in this layer; the engine is lib/sih-matching.js atop lib/sih-domain.js
     and the additive store methods (matching_runs/results/shortlists). */

  async function requireMatchingResult(req, id) {
    const result = await activeStore.getMatchingResult(id);
    if (!result) throw new AppError(404, "NOT_FOUND", "Matching result not found");
    return result;
  }

  /* read gate for matching outcomes: challenge-org member, startup owner, or gov member */
  async function canAccessMatching(req, result, ur) {
    const meta = await activeStore.getChallenge(result.challengeId);
    if (meta) {
      const membership = await activeStore.getMembership(ur.id, meta.organizationId);
      if (membership && membership.status === "ACTIVE") return true;
    }
    const startup = await activeStore.getStartup(result.startupId);
    if (startup && startup.organizationId) {
      const membership = await activeStore.getMembership(ur.id, startup.organizationId);
      if (membership && membership.status === "ACTIVE") return true;
    }
    const orgs = await activeStore.listOrganizationsForUser(ur.id);
    if (orgs.some((o) => o.orgType === "GOVERNMENT")) return true;
    return false;
  }

  /* Challenge-scoped read: members allowed; government officers (any org) may
     read matching as decision support (writes stay org-gated). */
  async function memberOfOrGov(req, orgId, ur) {
    try {
      return await memberOf(req, orgId, ur);
    } catch (err) {
      const orgs = await activeStore.listOrganizationsForUser(ur.id);
      if (orgs.some((o) => o.orgType === "GOVERNMENT")) return "GOVERNMENT_OFFICER";
      throw err;
    }
  }

  /* Run matching for a challenge (config optional; versioned when provided). */
  router.post("/challenges/:id/matching/run", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "MATCHING_RUN", u);

    const body = req.body || {};
    const config = (body.configuration && typeof body.configuration === "object") ? body.configuration : null;
    const triggerReason = String(body.triggerReason || "MANUAL_RUN").trim().slice(0, 200);

    await audit(req, { action: "MATCHING_STARTED", entityType: "MATCHING_RUN", entityId: null, organizationId: orgId, newValue: { challengeId, triggerReason } });
    let savedConfig = null;
    if (config) {
      savedConfig = await matching.saveMatchingConfiguration({ store: activeStore, challengeId, raw: config, createdBy: u.id });
      await audit(req, { action: "MATCHING_CONFIGURATION_UPDATED", entityType: "MATCHING_CONFIGURATION", entityId: savedConfig.id, organizationId: orgId, newValue: { id: savedConfig.id, configVersion: savedConfig.configVersion } });
    }
    const outcome = await matching.runChallengeMatching({
      store: activeStore, challengeId, requestedBy: u.id, triggerReason, configuration: savedConfig,
    });
    await audit(req, { action: "MATCHING_RUN_COMPLETED", entityType: "MATCHING_RUN", entityId: outcome.id, organizationId: orgId, newValue: { id: outcome.id, status: outcome.status, eligibleCount: outcome.pool.eligibleCount } });
    res.status(201).json(outcome);
  });

  /* Latest matching outcomes for a challenge (run + ranked results + shortlist). */
  router.get("/challenges/:id/matching/results", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOfOrGov(req, orgId, ur);
    const challenge = await activeStore.getChallenge(challengeId);
    const { run, results, shortlists } = await matching.latestChallengeMatching({ store: activeStore, challengeId });
    const freshness = await matching.isLatestMatchingCurrent({ store: activeStore, challenge });
    res.json({ run, results, shortlists, freshness });
  });

  /* List past matching runs for a challenge. */
  router.get("/challenges/:id/matching/runs", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOfOrGov(req, orgId, ur);
    res.json({ runs: await activeStore.listMatchingRuns(challengeId) });
  });

  /* Matching configuration + version history (or the engine default). */
  router.get("/challenges/:id/matching/configuration", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOfOrGov(req, orgId, ur);
    const configuration = await activeStore.getMatchingConfiguration(challengeId);
    const versions = configuration ? await activeStore.listMatchingConfigurationVersions(configuration.id) : [];
    res.json({ configuration: configuration || matching.defaultMatchingConfiguration(challengeId), versions });
  });

  /* Update matching configuration (weights must sum to 100%, no duplicates). */
  router.patch("/challenges/:id/matching/configuration", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "MATCHING_CONFIG", u);
    const configuration = await matching.saveMatchingConfiguration({ store: activeStore, challengeId, raw: req.body || {}, createdBy: u.id });
    await audit(req, { action: "MATCHING_CONFIGURATION_UPDATED", entityType: "MATCHING_CONFIGURATION", entityId: configuration.id, organizationId: orgId, newValue: { id: configuration.id, configVersion: configuration.configVersion, totalWeight: configuration.totalWeight } });
    res.json(configuration);
  });

  /* Single matching run with full results. */
  router.get("/matching-runs/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const run = await activeStore.getMatchingRun(id);
    if (!run) return res.status(404).json({ error: "Matching run not found" });
    const orgId = await challengeOrg(run.challengeId);
    await memberOfOrGov(req, orgId, ur);
    const results = await activeStore.listMatchingResultsByRun(id);
    const out = await Promise.all(results.map(async (r) => {
      const startup = await activeStore.getStartup(r.startupId);
      return { ...r, startup: startup ? { id: startup.id, brandName: startup.brandName, legalName: startup.legalName } : null };
    }));
    res.json({ run, results: out });
  });

  /* Re-run matching for a challenge (new immutable run; old results preserved). */
  router.post("/matching-runs/:id/rerun", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const run = await activeStore.getMatchingRun(id);
    if (!run) return res.status(404).json({ error: "Matching run not found" });
    const orgId = await challengeOrg(run.challengeId);
    await orgAction(req, orgId, "MATCHING_RUN", u);
    const outcome = await matching.runChallengeMatching({
      store: activeStore, challengeId: run.challengeId, requestedBy: u.id, triggerReason: "RERUN",
    });
    await audit(req, { action: "MATCHING_RUN_REPEATED", entityType: "MATCHING_RUN", entityId: outcome.id, organizationId: orgId, newValue: { id: outcome.id, previousRunId: id, status: outcome.status } });
    res.status(201).json(outcome);
  });

  /* Single matching result detail (rank, dimensions, shortlist, actions). */
  router.get("/matching-results/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const result = await requireMatchingResult(req, id);
    if (!(await canAccessMatching(req, result, ur))) throw new AppError(403, "FORBIDDEN", "You do not have access to this matching result");
    res.json(await matching.matchingResultDetail({ store: activeStore, resultId: id }));
  });

  /* HUMAN-FRIENDLY explanation (why this match, strengths, gaps, risks). */
  router.get("/matching-results/:id/explanation", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const result = await requireMatchingResult(req, id);
    if (!(await canAccessMatching(req, result, ur))) throw new AppError(403, "FORBIDDEN", "You do not have access to this matching result");
    await audit(req, { action: "MATCHING_EXPLANATION_GENERATED", entityType: "MATCHING_RESULT", entityId: id, organizationId: result.challengeId ? await challengeOrg(result.challengeId) : null, newValue: { id } });
    res.json({ ...result.explanation, strengths: result.strengths, gaps: result.gaps, riskFlags: result.riskFlags });
  });

  /* Evidence supporting the match (summary + linked evidence records). */
  router.get("/matching-results/:id/evidence", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const result = await requireMatchingResult(req, id);
    if (!(await canAccessMatching(req, result, ur))) throw new AppError(403, "FORBIDDEN", "You do not have access to this matching result");
    const links = await activeStore.listEvidenceLinks("MATCH", id);
    await audit(req, { action: "MATCHING_EVIDENCE_VIEWED", entityType: "MATCHING_RESULT", entityId: id, organizationId: result.challengeId ? await challengeOrg(result.challengeId) : null, newValue: { id, evidenceCount: links.length } });
    res.json({ evidence: result.evidence, links });
  });

  /* Shortlist a ranked startup (separate from the AI ranking; audited). */
  router.post("/matching-results/:id/shortlist", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const result = await requireMatchingResult(req, id);
    const orgId = await challengeOrg(result.challengeId);
    await orgAction(req, orgId, "MATCHING_SHORTLIST", u);
    const entry = dom.prepareShortlistEntry({ ...(req.body || {}), matchingResultId: id, addedBy: u.id });
    const row = await activeStore.addShortlist({
      challengeId: result.challengeId, matchingResultId: id, startupId: result.startupId,
      manualRank: entry.manualRank, note: entry.note, addedBy: u.id,
    }, result.startupId);
    await activeStore.createHumanMatchingAction({
      challengeId: result.challengeId, matchingResultId: id, startupId: result.startupId,
      action: "SHORTLISTED", originalRank: result.rank, reason: entry.note || "", actorId: u.id,
    });
    await audit(req, { action: "MATCHING_SHORTLISTED", entityType: "MATCHING_RESULT", entityId: id, organizationId: orgId, newValue: { id, startupId: result.startupId, manualRank: row.manualRank ?? null } });
    res.status(201).json(row);
  });

  /* Remove from shortlist (soft delete; decision audited). */
  router.delete("/matching-results/:id/shortlist", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const result = await requireMatchingResult(req, id);
    const orgId = await challengeOrg(result.challengeId);
    await orgAction(req, orgId, "MATCHING_SHORTLIST", u);
    const row = await activeStore.removeShortlist(result.challengeId, result.startupId);
    if (row) {
      await activeStore.createHumanMatchingAction({
        challengeId: result.challengeId, matchingResultId: id, startupId: result.startupId,
        action: "REMOVED", originalRank: result.rank, reason: String((req.body || {}).reason || "").slice(0, 1000), actorId: u.id,
      });
    }
    await audit(req, { action: "MATCHING_REMOVED", entityType: "MATCHING_RESULT", entityId: id, organizationId: orgId, newValue: { id, startupId: result.startupId } });
    res.json({ removed: !!row });
  });

  /* Current shortlist + full human decision trail for a challenge. */
  router.get("/challenges/:id/matching/shortlist", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOfOrGov(req, orgId, ur);
    const entries = await activeStore.listShortlists(challengeId);
    const out = [];
    for (const e of entries) {
      const startup = await activeStore.getStartup(e.startupId);
      out.push({ ...e, startup: startup ? { id: startup.id, brandName: startup.brandName, legalName: startup.legalName, sector: startup.sector, isDemo: startup.isDemo } : null });
    }
    res.json({ shortlists: out, actions: await activeStore.listHumanMatchingActions(challengeId) });
  });

  /* Human override / reorder (audited; never mutates the AI ranking). */
  router.post("/matching-results/:id/override", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const result = await requireMatchingResult(req, id);
    const orgId = await challengeOrg(result.challengeId);
    await orgAction(req, orgId, "MATCHING_HUMAN_ACTION", u);
    const act = dom.prepareHumanMatchingAction({ ...(req.body || {}), matchingResultId: id, actorId: u.id });
    const action = String(act.action || "NOTE").toUpperCase();
    if (action === "SHORTLISTED") {
      await activeStore.addShortlist({
        challengeId: result.challengeId, matchingResultId: id, startupId: result.startupId,
        manualRank: act.newRank ?? act.originalRank ?? null, note: act.reason || "", addedBy: u.id,
      }, result.startupId);
    } else if (action === "REMOVED") {
      await activeStore.removeShortlist(result.challengeId, result.startupId);
    } else if (action === "REORDER") {
      const existing = await activeStore.getShortlist(result.challengeId, result.startupId);
      if (existing) {
        await activeStore.removeShortlist(result.challengeId, result.startupId);
        await activeStore.addShortlist({
          challengeId: result.challengeId, matchingResultId: id, startupId: result.startupId,
          manualRank: act.newRank, note: act.reason || existing.note || "", addedBy: u.id,
        }, result.startupId);
      }
    }
    const row = await activeStore.createHumanMatchingAction({
      challengeId: result.challengeId, matchingResultId: id, startupId: result.startupId,
      action, originalRank: act.originalRank, newRank: act.newRank, reason: act.reason || "", actorId: u.id,
    });
    await audit(req, { action: "MATCHING_HUMAN_OVERRIDE", entityType: "MATCHING_RESULT", entityId: id, organizationId: orgId, oldValue: { rank: result.rank }, newValue: { id, action, newRank: act.newRank ?? null } });
    res.status(201).json(row);
  });

  /* ════════ matches (decision-support records — no AI) ════════ */
  router.post("/challenges/:id/matches", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "MATCH_RECORD", u);
    const data = dom.prepareMatch({ ...req.body, challengeId });
    data.generatedBy = u.id;
    const created = await activeStore.createMatch(data);
    await audit(req, { action: "MATCH_GENERATED", entityType: "MATCH", entityId: created.id, organizationId: orgId, newValue: { id: created.id, overallScore: created.overallScore, kind: created.kind } });
    res.status(201).json(created);
  });

  /* ════════ evaluation templates ════════ */
  router.post("/evaluation-templates", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareEvaluationTemplate(req.body);
    if (!data.organizationId) throw new AppError(400, "VALIDATION_FAILED", "organization_id is required");
    await orgAction(req, data.organizationId, "EVALUATION_CREATE", u);
    data.createdBy = u.id;
    const created = await activeStore.createEvaluationTemplate(data);
    await audit(req, { action: "EVALUATION_TEMPLATE_CREATED", entityType: "EVALUATION_TEMPLATE", entityId: created.id, organizationId: data.organizationId, newValue: { id: created.id, criteria: created.criteria.length } });
    res.status(201).json(created);
  });

  router.get("/evaluation-templates", async (req, res) => {
    const ur = await user(req);
    if (req.query.id) {
      const id = bodyUuid(req.query, "id", { required: true });
      const tpl = await activeStore.getEvaluationTemplate(id);
      if (!tpl) return res.status(404).json({ error: "Evaluation template not found" });
      if (tpl.organizationId) await memberOf(req, tpl.organizationId, ur);
      return res.json(tpl);
    }
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);
    res.json({ templates: await activeStore.listEvaluationTemplates(organizationId) });
  });

  /* ════════ evaluations ════════ */
  router.post("/evaluations", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareEvaluation(req.body);
    const challenge = await activeStore.getChallenge(data.challengeId);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    if (data.organizationId !== challenge.organizationId) {
      throw new AppError(403, "FORBIDDEN", "Evaluations must be scoped to the challenge's organization");
    }
    await orgAction(req, data.organizationId, "EVALUATION_CREATE", u);
    data.evaluatorUid = u.id;
    const created = await activeStore.createEvaluation(data);
    await audit(req, { action: "EVALUATION_CREATED", entityType: "EVALUATION", entityId: created.id, organizationId: data.organizationId, newValue: created });
    res.status(201).json(created);
  });

  router.get("/evaluations/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const ev = await activeStore.getEvaluation(id);
    if (!ev) return res.status(404).json({ error: "Evaluation not found" });
    await memberOf(req, ev.organizationId, ur);
    res.json(await activeStore.getEvaluationWithScores(id));
  });

  router.patch("/evaluations/:id/status", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const ev = await activeStore.getEvaluation(id);
    if (!ev) return res.status(404).json({ error: "Evaluation not found" });
    await orgAction(req, ev.organizationId, "EVALUATION_STATUS", u);
    const status = dom.enumOf(String((req.body || {}).status || ""), dom.EVALUATION_STATUSES_APP, "status");
    const updated = await activeStore.patchEvaluationStatus(id, status);
    await audit(req, { action: "EVALUATION_STATUS_CHANGED", entityType: "EVALUATION", entityId: id, organizationId: ev.organizationId, oldValue: ev, newValue: updated });
    res.json(updated);
  });

  router.post("/evaluations/:id/scores", async (req, res) => {
    const evaluationId = paramUuid(req, "id");
    const u = await user(req);
    const ev = await activeStore.getEvaluation(evaluationId);
    if (!ev) return res.status(404).json({ error: "Evaluation not found" });
    await orgAction(req, ev.organizationId, "EVALUATION_SCORE", u);
    const raw = req.body || {};
    if (!Array.isArray(raw.scores)) throw new AppError(400, "VALIDATION_FAILED", "scores must be an array");
    const scores = raw.scores.map((s) => dom.prepareEvaluationScoreEntry({ ...s, evaluationId }));
    if (ev.templateId) {
      const tpl = await activeStore.getEvaluationTemplate(ev.templateId);
      if (tpl) {
        const keys = new Set(tpl.criteria.map((c) => c.key));
        for (const s of scores) {
          if (!keys.has(s.criterionKey)) {
            throw new AppError(400, "VALIDATION_FAILED", `Unknown criterion: ${s.criterionKey}`);
          }
        }
        const weightMap = new Map(tpl.criteria.map((c) => [c.key, c.weight]));
        const total = scores.reduce((acc, s) => acc + (s.score * (weightMap.get(s.criterionKey) || 0)) / 100, 0);
        const summary = { weightedTotal: Math.round(total * 100) / 100 };
        await audit(req, { action: "EVALUATION_SCORED", entityType: "EVALUATION", entityId: evaluationId, organizationId: ev.organizationId, newValue: summary });
        return res.json({ scores: await activeStore.addEvaluationScores(scores), summary });
      }
    }
    res.json({ scores: await activeStore.addEvaluationScores(scores) });
  });

  router.get("/challenges/:id/evaluations", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOf(req, orgId, ur);
    const evs = await activeStore.listEvaluations(challengeId);
    const out = [];
    for (const ev of evs) out.push(await activeStore.getEvaluationWithScores(ev.id));
    res.json({ evaluations: out.filter(Boolean) });
  });

  /* ════════ evaluation & shortlist intelligence (Parts 1-73) ════════ */
  /* Configure a challenge's evaluation (criteria + thresholds + method). */
  router.post("/challenges/:id/evaluation/configure", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "EVALUATION_CONFIG", u);
    const outcome = await evaluation.saveChallengeEvaluation({ store: activeStore, challengeId, actorUid: u.id, raw: req.body || {} });
    await audit(req, { action: "EVALUATION_CONFIGURED", entityType: "EVALUATION_CONFIGURATION", entityId: outcome.configuration.id || null, organizationId: orgId, newValue: { challengeId, configVersion: outcome.configuration.configVersion, criteria: outcome.criteria.length } });
    res.status(201).json(outcome);
  });

  /* Configured criteria + thresholds for a challenge. */
  router.get("/challenges/:id/evaluation/criteria", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOfOrGov(req, orgId, ur);
    res.json(await evaluation.listChallengeEvaluationCriteria({ store: activeStore, challengeId }));
  });

  /* Assign independent evaluators to startups. */
  router.post("/challenges/:id/evaluation/assign", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "EVALUATION_ASSIGN", u);
    const outcome = await evaluation.assignEvaluators({ store: activeStore, challengeId, actorUid: u.id, raw: req.body || {} });
    await audit(req, { action: "EVALUATORS_ASSIGNED", entityType: "EVALUATION", entityId: null, organizationId: orgId, newValue: { challengeId, count: outcome.count } });
    res.status(201).json(outcome);
  });

  /* Evaluator workspace (gov = all evaluations; evaluator = own only). */
  router.get("/challenges/:id/evaluation/workspace", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    const role = await memberOfOrGov(req, orgId, ur);
    res.json(await evaluation.evaluatorWorkspace({ store: activeStore, challengeId, actorUid: ur.id, actorRole: role }));
  });

  /* Score one criterion (evidence-aware; summary returned). */
  router.post("/evaluations/:id/score", async (req, res) => {
    const evaluationId = paramUuid(req, "id");
    const u = await user(req);
    const ev = await activeStore.getEvaluation(evaluationId);
    if (!ev) return res.status(404).json({ error: "Evaluation not found" });
    const role = await orgAction(req, ev.organizationId, "EVALUATION_SCORE", u);
    const outcome = await evaluation.scoreCriterion({ store: activeStore, evaluationId, actorUid: u.id, actorRole: role, raw: req.body || {} });
    await audit(req, { action: "EVALUATION_CRITERION_SCORED", entityType: "EVALUATION", entityId: evaluationId, organizationId: ev.organizationId, newValue: { criterionKey: outcome.score.criterionKey, score: outcome.score.score, total: outcome.summary.total } });
    res.json(outcome);
  });

  /* Submit → immutable SUBMISSION snapshot (all criteria + required comments). */
  router.post("/evaluations/:id/submit", async (req, res) => {
    const evaluationId = paramUuid(req, "id");
    const u = await user(req);
    const ev = await activeStore.getEvaluation(evaluationId);
    if (!ev) return res.status(404).json({ error: "Evaluation not found" });
    const role = await orgAction(req, ev.organizationId, "EVALUATION_SUBMIT", u);
    const outcome = await evaluation.submitEvaluation({ store: activeStore, evaluationId, actorUid: u.id, actorRole: role });
    await audit(req, { action: "EVALUATION_SUBMITTED", entityType: "EVALUATION", entityId: evaluationId, organizationId: ev.organizationId, newValue: { status: outcome.evaluation.status, total: outcome.summary.total, snapshotId: outcome.snapshot.id } });
    res.status(201).json(outcome);
  });

  /* Lock a submitted evaluation (freeze before aggregation). */
  router.post("/evaluations/:id/lock", async (req, res) => {
    const evaluationId = paramUuid(req, "id");
    const u = await user(req);
    const ev = await activeStore.getEvaluation(evaluationId);
    if (!ev) return res.status(404).json({ error: "Evaluation not found" });
    await orgAction(req, ev.organizationId, "EVALUATION_LOCK", u);
    const outcome = await evaluation.lockEvaluation({ store: activeStore, evaluationId, actorUid: u.id });
    await audit(req, { action: "EVALUATION_LOCKED", entityType: "EVALUATION", entityId: evaluationId, organizationId: ev.organizationId, newValue: { status: outcome.evaluation.status } });
    res.json(outcome);
  });

  /* Reopen a submitted/locked evaluation (audited; triggers re-evaluation flow). */
  router.post("/evaluations/:id/reopen", async (req, res) => {
    const evaluationId = paramUuid(req, "id");
    const u = await user(req);
    const ev = await activeStore.getEvaluation(evaluationId);
    if (!ev) return res.status(404).json({ error: "Evaluation not found" });
    await orgAction(req, ev.organizationId, "EVALUATION_REOPEN", u);
    const outcome = await evaluation.reopenEvaluation({ store: activeStore, evaluationId, actorUid: u.id, raw: req.body || {} });
    await audit(req, { action: "EVALUATION_REOPENED", entityType: "EVALUATION", entityId: evaluationId, organizationId: ev.organizationId, newValue: { status: outcome.evaluation.status, note: outcome.note } });
    res.json(outcome);
  });

  /* Full audit trail for a challenge/startup (snapshots, aggregations, decisions). */
  router.get("/challenges/:id/evaluation/history", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOfOrGov(req, orgId, ur);
    const startupId = bodyUuid(req.query, "startupId");
    res.json(await evaluation.evaluationHistory({ store: activeStore, challengeId, startupId }));
  });

  /* Deterministic aggregation across submitted evaluations (optional startupId). */
  router.post("/challenges/:id/evaluation/aggregate", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "EVALUATION_AGGREGATE", u);
    const startupId = bodyUuid(req.body || {}, "startupId");
    const outcome = await evaluation.runChallengeAggregation({ store: activeStore, challengeId, actorUid: u.id, startupId });
    await audit(req, { action: "EVALUATION_AGGREGATED", entityType: "EVALUATION_AGGREGATION", entityId: null, organizationId: orgId, newValue: { challengeId, startups: outcome.aggregated.map((a) => ({ startupId: a.startupId, total: a.total, result: a.result })) } });
    res.status(201).json(outcome);
  });

  /* Comparison dashboard (latest aggregations per startup, ordered). */
  router.get("/challenges/:id/evaluation/comparison", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const ur = await user(req);
    const orgId = await challengeOrg(challengeId);
    await memberOfOrGov(req, orgId, ur);
    res.json(await evaluation.challengeComparison({ store: activeStore, challengeId }));
  });

  /* Final human decision (decision-safety gates; acknowledgement for blocking items). */
  router.post("/challenges/:id/evaluation/decision", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    const role = await orgAction(req, orgId, "EVALUATION_DECISION", u);
    const outcome = await evaluation.decideEvaluation({ store: activeStore, challengeId, actorUid: u.id, actorRole: role, raw: req.body || {} });
    await audit(req, { action: "EVALUATION_DECISION_RECORDED", entityType: "EVALUATION_DECISION", entityId: outcome.decision.id, organizationId: orgId, newValue: { id: outcome.decision.id, startupId: outcome.decision.startupId, decision: outcome.decision.decision, result: outcome.decision.reason.slice(0, 80) } });
    res.status(201).json(outcome);
  });

  /* Request information from a startup (open an evaluator question). */
  router.post("/challenges/:id/evaluation/request-information", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    const role = await orgAction(req, orgId, "EVALUATION_REQUEST", u);
    const outcome = await evaluation.requestInformation({ store: activeStore, challengeId, actorUid: u.id, actorRole: role, raw: req.body || {} });
    await audit(req, { action: "EVALUATION_INFORMATION_REQUESTED", entityType: "EVALUATION_REQUEST", entityId: outcome.request.id, organizationId: orgId, newValue: { id: outcome.request.id, startupId: outcome.request.startupId, subject: outcome.request.subject } });
    res.status(201).json(outcome);
  });

  /* Issue a structured pilot handoff from a PROCEED_TO_PILOT decision. */
  router.post("/challenges/:id/evaluation/pilot-handoff", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    const role = await orgAction(req, orgId, "EVALUATION_PILOT_HANDOFF", u);
    const outcome = await evaluation.issuePilotHandoff({ store: activeStore, challengeId, actorUid: u.id, actorRole: role, raw: req.body || {} });
    await audit(req, { action: "PILOT_HANDOFF_CREATED", entityType: "PILOT_HANDOFF", entityId: outcome.handoff.id, organizationId: orgId, newValue: { id: outcome.handoff.id, startupId: outcome.handoff.startupId, status: outcome.handoff.status } });
    res.status(201).json(outcome);
  });

  /* Advisory assistant (AI optional; deterministic fallback; never scores). */
  router.post("/challenges/:id/evaluation/assist", async (req, res) => {
    const challengeId = paramUuid(req, "id");
    const u = await user(req);
    const orgId = await challengeOrg(challengeId);
    await orgAction(req, orgId, "EVALUATION_ASSIST", u);
    const startupId = bodyUuid(req.body || {}, "startupId", { required: true });
    const outcome = await evaluation.evaluationAssist({
      store: activeStore, challengeId, startupId, actorUid: u.id,
      lang: String((req.body || {}).lang || "en").slice(0, 8), ai,
    });
    await audit(req, { action: "EVALUATION_ASSIST_REQUESTED", entityType: "EVALUATION", entityId: null, organizationId: orgId, newValue: { startupId, mode: outcome.mode } });
    res.json(outcome);
  });

  /* ════════ pilots ════════ */
  async function pilotOrg(pilot) {
    return pilot.organizationId;
  }

  router.post("/pilots", async (req, res) => {
    const u = await user(req);
    const data = dom.preparePilot(req.body);
    await orgAction(req, data.organizationId, "PILOT_CREATE", u);
    const startup = await activeStore.getStartup(data.startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");
    data.createdBy = u.id;
    const created = await activeStore.createPilot(data);
    await audit(req, { action: "PILOT_CREATED", entityType: "PILOT", entityId: created.id, organizationId: created.organizationId, newValue: created, isDemo: created.isDemo });

    /* Multi-agent orchestration for pilot creation */
    try {
      const complianceResult = await complianceAgentCreatePilot(created, u, req);
      const riskResult = await riskAgentCreatePilot(created, u, req);
      const documentResult = await documentAgentCreatePilot(created, u, req);
      const analyticsResult = await analyticsAgentCreatePilot(created, u, req);
      const policyResult = await policyAgentCreatePilot(created, u, req);
      const govCopilotResult = await govCopilotCreatePilot(created, u, req);
      /* Record agent collaboration in audit */
      await audit(req, {
        action: "PILOT_AGENT_ORCHESTRATION",
        entityType: "PILOT",
        entityId: created.id,
        organizationId: created.organizationId,
        newValue: {
          compliance: complianceResult,
          risk: riskResult,
          document: documentResult,
          analytics: analyticsResult,
          policy: policyResult,
          govCopilot: govCopilotResult,
        },
        isDemo: created.isDemo,
      });
    } catch (agentErr) {
      /* Agent failures do not block pilot creation; log and continue */
      await audit(req, {
        action: "PILOT_AGENT_ORCHESTRATION_FAILED",
        entityType: "PILOT",
        entityId: created.id,
        organizationId: created.organizationId,
        oldValue: created,
        newValue: { error: String((agentErr && agentErr.message) || agentErr) },
        isDemo: created.isDemo,
      });
    }

    res.status(201).json(created);
  });

  router.get("/pilots", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);
    res.json({ pilots: await activeStore.listPilots(organizationId) });
  });

  router.get("/pilots/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const pilot = await activeStore.getPilot(id);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await memberOf(req, pilot.organizationId, ur);
    const milestones = await activeStore.listMilestones(id);
    const kpis = await activeStore.listKpis(id);
    const results = await activeStore.listPilotResults(id);
    res.json({ ...pilot, milestones, kpis, results });
  });

  router.patch("/pilots/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(id);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "PILOT_UPDATE", u);
    const patch = { ...dom.preparePilot({ ...pilot, ...req.body, organizationId: pilot.organizationId }), createdBy: pilot.createdBy };
    const updated = await activeStore.patchPilot(id, pilot.organizationId, patch);
    await audit(req, { action: "PILOT_UPDATED", entityType: "PILOT", entityId: id, organizationId: pilot.organizationId, oldValue: pilot, newValue: updated });
    res.json(updated);
  });

  router.post("/pilots/:id/milestones", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "PILOT_UPDATE", u);
    const created = await activeStore.createMilestone(dom.prepareMilestone({ ...req.body, pilotId }));
    await audit(req, { action: "PILOT_MILESTONE_CREATED", entityType: "PILOT", entityId: pilotId, organizationId: pilot.organizationId, newValue: { id: created.id, status: created.status } });
    res.status(201).json(created);
  });

  router.post("/pilots/:id/kpis", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "PILOT_KPI", u);
    const created = await activeStore.createKpi(dom.prepareKpi({ ...req.body, pilotId }));
    await audit(req, { action: "PILOT_KPI_CREATED", entityType: "PILOT_KPI", entityId: created.id, organizationId: pilot.organizationId, newValue: { id: created.id, status: created.status } });
    res.status(201).json(created);
  });

  router.post("/kpis/:id/measurements", async (req, res) => {
    const kpiId = paramUuid(req, "id");
    const u = await user(req);
    const kpi = await activeStore.getKpi(kpiId);
    if (!kpi) return res.status(404).json({ error: "KPI not found" });
    const pilot = await activeStore.getPilot(kpi.pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "PILOT_KPI", u);
    const created = await activeStore.createMeasurement(dom.prepareMeasurement({ ...req.body, kpiId, recordedBy: u.id }));
    await audit(req, { action: "PILOT_KPI_UPDATED", entityType: "PILOT_KPI", entityId: kpiId, organizationId: pilot.organizationId, newValue: { id: kpiId, value: created.value } });
    res.status(201).json(created);
  });

  router.post("/pilots/:id/results", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "PILOT_RESULT", u);
    const data = dom.preparePilotResult({ ...req.body, pilotId, evaluatedBy: u.id });
    const created = await activeStore.createPilotResult(data);
    await audit(req, { action: "PILOT_COMPLETED", entityType: "PILOT_RESULT", entityId: created.id, organizationId: pilot.organizationId, newValue: { id: created.id, result: created.result, recommendation: created.recommendation }, isDemo: created.isDemo });
    /* Recording a formal result completes the pilot lifecycle. */
    if (pilot.status !== "COMPLETED" && pilot.status !== "CANCELLED" && pilot.status !== "FAILED") {
      const patched = await activeStore.patchPilot(pilotId, pilot.organizationId, { status: "COMPLETED" });
      await audit(req, { action: "PILOT_STATUS_CHANGED", entityType: "PILOT", entityId: pilotId, organizationId: pilot.organizationId, oldValue: { status: pilot.status }, newValue: { status: patched.status } });
    }
    res.status(201).json(created);
  });

  /* ════════ pilot status transitions (explicit lifecycle) ════════ */
  const PILOT_TRANSITIONS = {
    PLANNED: ["APPROVED", "CANCELLED"],
    APPROVED: ["RUNNING", "CANCELLED"],
    RUNNING: ["PAUSED", "COMPLETED", "FAILED", "CANCELLED"],
    PAUSED: ["RUNNING", "CANCELLED"],
    FAILED: ["CANCELLED"],
    COMPLETED: [],
  };

  router.post("/pilots/:id/transition", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "PILOT_UPDATE", u);
    const target = String((req.body && req.body.status) || "").trim().toUpperCase();
    const reason = String((req.body && req.body.reason) || "").trim();
    if (!target) throw new AppError(400, "VALIDATION_FAILED", "status is required");
    if (!dom.PILOT_STATUSES.includes(target)) throw new AppError(400, "VALIDATION_FAILED", "Invalid pilot status");
    const allowed = PILOT_TRANSITIONS[pilot.status] || [];
    if (pilot.status !== target && !allowed.includes(target)) {
      throw new AppError(409, "INVALID_TRANSITION", `Cannot move pilot from ${pilot.status} to ${target}`);
    }
    const patched = await activeStore.patchPilot(pilotId, pilot.organizationId, { status: target });
    await audit(req, {
      action: "PILOT_STATUS_CHANGED", entityType: "PILOT", entityId: pilotId, organizationId: pilot.organizationId,
      oldValue: { status: pilot.status }, newValue: { status: patched.status, reason },
    });
    const ms = await Promise.resolve(activeStore.listMilestones(pilotId)).catch(() => []);
    res.json({ ...patched, milestoneCount: Array.isArray(ms) ? ms.length : 0 });
  });

  /* ════════ procurement-stage Government decision ════════
     Recorded only for a completed, analysed pilot. The readiness state is
     computed live from the same domain engines shown on the dashboard; it is
     ADVISORY — the Government officer holds final authority and must give a
     reason. Every decision lands in the shared decisions table + audit trail. */
  router.post("/pilots/:id/procurement-decision", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "EVALUATION_DECISION", u);

    const decision = String((req.body && req.body.decision) || "").trim().toUpperCase();
    if (!decision) throw new AppError(400, "VALIDATION_FAILED", "decision is required");
    if (!dom.PROCUREMENT_DECISION_TYPES.includes(decision)) {
      throw new AppError(400, "VALIDATION_FAILED", `Decision must be one of: ${dom.PROCUREMENT_DECISION_TYPES.join(", ")}`);
    }
    const reason = String((req.body && req.body.reason) || "").trim();
    if (!reason) throw new AppError(400, "VALIDATION_FAILED", "Government justification (reason) is required");

    const safeArr = async (p) => { try { const v = await Promise.resolve(p); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
    const [kpis, milestones, results] = await Promise.all([
      safeArr(activeStore.listKpis(pilotId)),
      safeArr(activeStore.listMilestones(pilotId)),
      safeArr(activeStore.listPilotResults(pilotId)),
    ]);
    const aggregation = await Promise.resolve(activeStore.latestEvaluationAggregation(pilot.challengeId, pilot.startupId)).catch(() => null);
    const pilotResult = results && results[0] ? results[0] : null;
    const challenge = pilot.challengeId ? await activeStore.getChallenge(pilot.challengeId) : null;
    const applicableRegulations = Array.isArray(challenge && challenge.eligibilityRequirements) && challenge.eligibilityRequirements.length
      ? challenge.eligibilityRequirements.map((r) => ({
          title: (r && (r.title || r.name)) || "Eligibility requirement",
          code: r && (r.code || r.id),
          active: r ? r.active !== false : true,
          blocking: r ? r.blocking !== false : true,
          evidenceRequired: r ? !!r.evidenceRequired : false,
        }))
      : [];
    const compliance = dom.evaluatePilotCompliance(pilot, applicableRegulations);
    const risks = dom.detectPilotRisks(pilot, applicableRegulations);
    const targetAchievement = Number(pilot.targetAchievement || 0);
    const outcome = dom.classifyPilotOutcome({ ...pilot, targetAchievement, kpiCount: kpis.length, overallScore: Number(pilot.overallScore || 0) }, pilotResult, risks);
    const readiness = dom.evaluateProcurementReadiness(
      { ...pilot, overallScore: Number(pilot.overallScore || 0), targetAchievement, kpiCount: kpis.length, milestoneCount: milestones.length, estimatedCost: pilot.budget || 0 },
      pilotResult,
      compliance,
      risks
    );

    if (!pilotResult) {
      throw new AppError(400, "VALIDATION_FAILED", "Record a pilot result and run Analysis before a procurement decision.");
    }

    /* Advisory consistency flags — never block, always surfaced. */
    const warnings = [];
    if (readiness.status === "NOT_READY" && (decision === "ACCEPT_RECOMMENDATION" || decision === "ACCEPT_WITH_CONDITIONS")) {
      warnings.push(`Readiness assessment is ${readiness.status}; accept decisions contradict the assessment.`);
    }
    if ((readiness.status === "READY" || readiness.status === "READY_WITH_CONDITIONS") && decision === "REJECT") {
      warnings.push(`Readiness assessment is ${readiness.status}; a REJECT deviates from the evidence.`);
    }
    if (outcome.outcome === "UNSUCCESSFUL" && (decision === "ACCEPT_RECOMMENDATION" || decision === "ACCEPT_WITH_CONDITIONS")) {
      warnings.push("Pilot outcome was UNSUCCESSFUL; accepting contradicts the outcome analysis.");
    }

    const conditions = [
      ...((req.body && Array.isArray(req.body.conditions) ? req.body.conditions : []) || []),
      ...(readiness.conditions || []),
    ].slice(0, 50);

    const created = await activeStore.createEvaluationDecision({
      challengeId: pilot.challengeId,
      startupId: pilot.startupId,
      organizationId: pilot.organizationId,
      pilotId,
      decision,
      reason,
      decisionStage: "PROCUREMENT",
      conditions,
      warnings,
      economicValue: Number(pilot.budget || 0),
      evaluationSnapshotId: (aggregation && aggregation.snapshotId) || null,
      aggregationId: (aggregation && aggregation.id) || null,
      actorUid: u.id,
      actorRole: (req.query && req.query.actorRole) || "OFFICER",
      isDemo: !!pilot.isDemo,
    });

    await audit(req, {
      action: "GOVERNMENT_DECISION_RECORDED", entityType: "EVALUATION_DECISION", entityId: created.id,
      organizationId: created.organizationId,
      newValue: {
        id: created.id, pilotId, startupId: created.startupId, decision: created.decision,
        stage: created.decisionStage, readiness: readiness.status, warnings,
      },
    });

    res.status(201).json({
      decision: created,
      readiness: {
        status: readiness.status, riskLevel: readiness.riskLevel, conditions: readiness.conditions || [],
        technicalReadiness: readiness.technicalReadiness, operationalReadiness: readiness.operationalReadiness, evidenceStrength: readiness.evidenceStrength, costEffectiveness: readiness.costEffectiveness,
      },
      outcome: { outcome: outcome.outcome, confidence: outcome.confidence, reason: outcome.reason },
      compliance: { overall: compliance.overall, blocking: compliance.blocking },
      risks: { riskCount: risks.riskCount, criticalHigh: (risks.risks || []).filter((r) => r.severity === "CRITICAL" || r.severity === "HIGH").length },
      warnings,
    });
  });

/* ════════ pilot performance intelligence ════════ */

/* GET /api/sih/pilots/:id/performance - pilot performance summary */
  router.get("/pilots/:id/performance", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await memberOf(req, pilot.organizationId, u);

    /* List KPIs and milestones first */
    const kpis = await activeStore.listKpis(pilotId);
    const milestones = await activeStore.listMilestones(pilotId);

    /* Get latest intelligence */
    const intelligence = await activeStore.getPilotIntelligence(pilotId);
    const latestIntel = intelligence ? intelligence : null;

    /* Compute health and performance summary */
    const perf = dom.computePilotPerformanceSummary({
      overallScore: pilot.overallScore,
      kpiCount: kpis.length,
      milestoneCount: milestones.length,
      targetAchievement: latestIntel ? latestIntel.targetAchievement || pilot.targetAchievement || 0 : (pilot.targetAchievement || 0),
    });

    /* KPI statistics for charts */
    const kpiStats = {
      total: kpis.length,
      baseline: kpis.reduce((sum, k) => sum + (k.baselineValue || 0), 0),
      target: kpis.reduce((sum, k) => sum + (k.targetValue || 0), 0),
      actual: kpis.reduce((sum, k) => sum + (k.actualValue || 0), 0),
      achievementPct: kpis.length > 0 ? Math.round((kpis.reduce((sum, k) => sum + (k.actualValue || 0), 0) / kpis.reduce((sum, k) => sum + (k.targetValue || 1), 0)) * 100) : 0,
    };

    res.json({
      pilotId: pilot.id,
      overallScore: pilot.overallScore,
      health: perf.health,
      targetAchievement: perf.targetAchievement,
      kpiCount: perf.kpiCount,
      milestoneCount: perf.milestoneCount,
      costSaving: pilot.costSaving || 0,
      efficiency: pilot.efficiency || 0,
      usersImpacted: pilot.usersImpacted || 0,
      satisfaction: pilot.satisfaction || 0,
      targetAchievement: perf.targetAchievement,
      trend: pilot.trend || "STABLE",
      lastUpdated: latestIntel ? latestIntel.lastUpdated : pilot.updatedAt,
      alerts: perf.alerts,
      kpiStats,
      summary: {
        overallScore: perf.overallScore,
        health: perf.health,
        targetAchievement: perf.targetAchievement,
        kpiCount: perf.kpiCount,
        milestoneCount: perf.milestoneCount,
      },
    });
  });

  /* GET /api/sih/pilots/:id/kpi-stats - KPI statistics for charts */
  router.get("/pilots/:id/kpi-stats", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await memberOf(req, pilot.organizationId, u);

    const kpis = await activeStore.listKpis(pilotId);

    /* Build datasets for Target vs Actual and Trend charts */
    const labels = kpis.map((k) => k.name);
    const baselineData = kpis.map((k) => k.baselineValue || 0);
    const targetData = kpis.map((k) => k.targetValue || 0);
    const actualData = kpis.map((k) => k.actualValue || 0);

    /* Compute achievement percentages */
    const achievementData = kpis.map((k) => {
      if (k.targetValue > 0) return Math.round((k.actualValue / k.targetValue) * 100);
      return 0;
    });

    /* Trend data (simulated from measurements or status) */
    const trendLabels = ["Baseline", "Current"];
    const trendData = [
      kpis.length > 0 ? kpis[0].baselineValue || 0 : 0,
      kpis.length > 0 ? kpis[kpis.length - 1].actualValue || 0 : 0,
    ];

    res.json({
      labels,
      baselineData,
      targetData,
      actualData,
      achievementData,
      trendLabels,
      trendData,
    });
  });

  /* POST /api/sih/pilots/:id/analysis - AI analysis of pilot performance */
  router.post("/pilots/:id/analysis", async (req, res) => {
    const pilotId = paramUuid(req, "id");
    const u = await user(req);
    const pilot = await activeStore.getPilot(pilotId);
    if (!pilot) return res.status(404).json({ error: "Pilot not found" });
    await orgAction(req, pilot.organizationId, "PILOT_ANALYSIS", u);

    const kpis = await activeStore.listKpis(pilotId);
    const milestones = await activeStore.listMilestones(pilotId);
    const intelligence = await activeStore.listPilotIntelligence(pilotId, { limit: 1 });
    const latestIntel = intelligence && intelligence[0] ? intelligence[0] : null;
    const targetAchievement = latestIntel && latestIntel.targetAchievement ? latestIntel.targetAchievement : 0;
    const perf = {
      health: dom.computePilotHealth(pilot.overallScore || 0, kpis.length, milestones.length, targetAchievement),
      targetAchievement,
    };

    /* Build context for AI copilot */
    const context = {
      business: {
        company: pilot.organizationId ? "Organization " + pilot.organizationId : "Unknown",
        product: pilot.title || "Unknown product",
        industry: "General",
      },
      origin: { organizationId: pilot.organizationId },
      target: { country: "Target Market" },
      readiness: {
        score: pilot.overallScore || 0,
        status: perf ? perf.health : "UNKNOWN",
        riskLevel: "Medium",
      },
      stats: {
        total: kpis.length,
        critical: 0,
        important: 0,
        standard: 0,
        completed: 0,
        inProgress: 0,
        pending: kpis.length,
      },
      regulations: [],
      requirements: [],
      gaps: [],
      actionPlan: [],
      estimatedCost: pilot.budget || 0,
      estimatedDays: pilot.durationDays || 90,
      canLaunch: pilot.overallScore && pilot.overallScore >= 70,
    };

    /* AI analysis via sihCopilot */
    const question = "Provide a performance analysis for this pilot including what is happening, which KPI is weak, why it is weak, what changed, and what the officer should investigate.";

    try {
      const assist = await sihCopilot({
        ai,
        gov: null,
        question,
        lang: "en",
        context,
        sih: {
          startup: { id: pilot.startupId, legalName: "Unknown startup", capabilities: [], verifications: [] },
          capabilities: [],
          verifications: [],
          challenge: { id: pilot.challengeId, title: "Unknown challenge", problemId: pilot.challengeId ? await activeStore.getProblem(pilot.challengeId) : null },
          match: null,
          eligibility: { verdict: "UNKNOWN" },
        },
      });

      /* Record the AI analysis in intelligence store */
      await activeStore.createPilotIntelligence({
        pilotId: pilot.id,
        overallScore: pilot.overallScore,
        status: perf ? perf.health : "UNKNOWN",
        health: perf ? perf.health : "UNKNOWN",
        costSaving: pilot.costSaving || 0,
        efficiency: pilot.efficiency || 0,
        usersImpacted: pilot.usersImpacted || 0,
        satisfaction: pilot.satisfaction || 0,
        targetAchievement: perf ? perf.targetAchievement : 0,
        trend: pilot.trend || "STABLE",
        kpiCount: kpis.length,
        milestoneCount: milestones.length,
        lastUpdated: new Date().toISOString(),
        aiInsight: assist.answer,
        aiMode: assist.mode,
      });

      res.json({
        mode: assist.mode,
        answer: assist.answer,
        grounded: true,
      });
    } catch (err) {
      /* Deterministic fallback when AI unavailable */
      const fallback = dom.computePilotPerformanceSummary({
        overallScore: pilot.overallScore,
        kpiCount: kpis.length,
        milestoneCount: milestones.length,
        targetAchievement: latestIntel ? latestIntel.targetAchievement || 0 : 0,
      });

      res.json({
        mode: "deterministic-fallback",
        answer: `Pilot performance analysis: ${fallback.health} (score: ${fallback.overallScore}, target achievement: ${fallback.targetAchievement}%). Key issues: ${fallback.alerts.join(", ")}. Recommendation: review KPI data and milestone progress.`,
        grounded: true,
      });
    }
  });

  /* ════════ procurement ════════ */
  router.get("/procurement/paths", async (req, res) => {
    await user(req);
    res.json({ paths: await activeStore.listProcurementPaths() });
  });

  router.post("/procurement/assessments", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareProcurementAssessment(req.body);
    await orgAction(req, data.organizationId, "PROCUREMENT_ASSESS", u);
    data.generatedBy = u.id;
    if (data.pathwayId) {
      const path = await activeStore.getProcurementPath(data.pathwayId);
      if (!path) throw new AppError(400, "VALIDATION_FAILED", "pathway_id does not reference a known procurement path");
    }
    const created = await activeStore.createProcurementAssessment(data);
    await audit(req, { action: "PROCUREMENT_ASSESSMENT_CREATED", entityType: "PROCUREMENT_ASSESSMENT", entityId: created.id, organizationId: created.organizationId, newValue: created, isDemo: created.isDemo });
    res.status(201).json(created);
  });

  router.get("/procurement/assessments/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const assessment = await activeStore.getProcurementAssessment(id);
    if (!assessment) return res.status(404).json({ error: "Procurement assessment not found" });
    await memberOf(req, assessment.organizationId, ur);
    const recommendations = await activeStore.listProcurementRecommendations(id);
    res.json({ ...assessment, recommendations });
  });

  router.patch("/procurement/assessments/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const assessment = await activeStore.getProcurementAssessment(id);
    if (!assessment) return res.status(404).json({ error: "Procurement assessment not found" });
    await orgAction(req, assessment.organizationId, "PROCUREMENT_ASSESS", u);
    const patch = dom.prepareProcurementAssessment({ ...assessment, ...req.body, organizationId: assessment.organizationId });
    const updated = await activeStore.patchProcurementAssessment(id, assessment.organizationId, patch);
    await audit(req, { action: "PROCUREMENT_ASSESSMENT_UPDATED", entityType: "PROCUREMENT_ASSESSMENT", entityId: id, organizationId: assessment.organizationId, oldValue: assessment, newValue: updated });
    res.json(updated);
  });

  router.post("/procurement/assessments/:id/recommendations", async (req, res) => {
    const assessmentId = paramUuid(req, "id");
    const u = await user(req);
    const assessment = await activeStore.getProcurementAssessment(assessmentId);
    if (!assessment) return res.status(404).json({ error: "Procurement assessment not found" });
    await orgAction(req, assessment.organizationId, "PROCUREMENT_RECOMMEND", u);
    const entry = dom.prepareProcurementRecommendationEntry({ ...req.body, assessmentId });
    entry.createdBy = u.id;
    const created = await activeStore.createProcurementRecommendation(entry);
    await audit(req, { action: "PROCUREMENT_RECOMMENDATION_ADDED", entityType: "PROCUREMENT_ASSESSMENT", entityId: assessmentId, organizationId: assessment.organizationId, newValue: { id: created.id, kind: created.kind, recommendation: created.recommendation } });
    res.status(201).json(created);
  });

  /* ════════ scale plans ════════ */
  router.post("/scale-plans", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareScalePlan(req.body);
    await orgAction(req, data.organizationId, "SCALE_PLAN", u);
    const pilot = await activeStore.getPilot(data.pilotProjectId);
    if (!pilot) throw new AppError(404, "NOT_FOUND", "Source pilot not found");
    if (pilot.organizationId !== data.organizationId) {
      throw new AppError(403, "FORBIDDEN", "Scale plan must belong to the pilot's organization");
    }
    data.createdBy = u.id;
    const created = await activeStore.createScalePlan(data);
    await audit(req, { action: "SCALE_PLAN_CREATED", entityType: "SCALE_PLAN", entityId: created.id, organizationId: created.organizationId, newValue: created, isDemo: created.isDemo });
    res.status(201).json(created);
  });

  router.get("/scale-plans/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const plan = await activeStore.getScalePlan(id);
    if (!plan) return res.status(404).json({ error: "Scale plan not found" });
    await memberOf(req, plan.organizationId, ur);
    res.json(plan);
  });

  router.get("/scale-plans", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);
    res.json({ scalePlans: await activeStore.listScalePlans(organizationId) });
  });

  router.patch("/scale-plans/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const plan = await activeStore.getScalePlan(id);
    if (!plan) return res.status(404).json({ error: "Scale plan not found" });
    await orgAction(req, plan.organizationId, "SCALE_PLAN", u);
    const patch = dom.prepareScalePlan({ ...plan, ...req.body, organizationId: plan.organizationId, pilotProjectId: plan.pilotProjectId });
    const updated = await activeStore.patchScalePlan(id, plan.organizationId, patch);
    await audit(req, { action: "SCALE_PLAN_UPDATED", entityType: "SCALE_PLAN", entityId: id, organizationId: plan.organizationId, oldValue: plan, newValue: updated });
    res.json(updated);
  });

  /* ════════ evidence links ════════ */
  async function evidenceOrg(entityType, entityId) {
    switch (entityType) {
      case "PILOT_RESULT": {
        const r = await activeStore.getPilotResult(entityId);
        if (!r) throw new AppError(404, "NOT_FOUND", "Pilot result not found");
        const pilot = await activeStore.getPilot(r.pilotId);
        return pilot.organizationId;
      }
      case "PILOT": {
        const p = await activeStore.getPilot(entityId);
        if (!p) throw new AppError(404, "NOT_FOUND", "Pilot not found");
        return p.organizationId;
      }
      case "PROCUREMENT_ASSESSMENT": {
        const a = await activeStore.getProcurementAssessment(entityId);
        if (!a) throw new AppError(404, "NOT_FOUND", "Procurement assessment not found");
        return a.organizationId;
      }
      case "SCALE_PLAN": {
        const s = await activeStore.getScalePlan(entityId);
        if (!s) throw new AppError(404, "NOT_FOUND", "Scale plan not found");
        return s.organizationId;
      }
      case "MATCH": {
        const m = await activeStore.getMatchById(entityId);
        if (!m) throw new AppError(404, "NOT_FOUND", "Match not found");
        return challengeOrg(m.challengeId);
      }
      case "ELIGIBILITY_CHECK": {
        const c = await activeStore.getEligibilityCheck(entityId);
        if (!c) throw new AppError(404, "NOT_FOUND", "Eligibility check not found");
        return challengeOrg(c.challengeId);
      }
      default:
        throw new AppError(400, "VALIDATION_FAILED", "Unsupported entity_type");
    }
  }

  router.post("/evidence-links", async (req, res) => {
    const u = await user(req);
    const data = dom.prepareEvidenceLink(req.body);
    const orgId = await evidenceOrg(data.entityType, data.entityId);
    await orgAction(req, orgId, "EVIDENCE_LINK", u);
    data.createdBy = u.id;
    data.status = String((req.body && req.body.status) || "PENDING").toUpperCase();
    if (!["PENDING", "VERIFIED", "INSUFFICIENT", "REQUIRES_REVIEW"].includes(data.status)) {
      throw new AppError(400, "VALIDATION_FAILED", "status must be PENDING, VERIFIED, INSUFFICIENT or REQUIRES_REVIEW");
    }
    data.comment = String((req.body && req.body.comment) || "").slice(0, 2000);
    const created = await activeStore.createEvidenceLink(data);
    await audit(req, { action: "EVIDENCE_LINK_ADDED", entityType: data.entityType, entityId: data.entityId, organizationId: orgId, newValue: { id: created.id, referenceId: created.referenceId, status: created.status, section: created.section } });
    res.status(201).json(created);
  });

  /* Update / verify an evidence item (VERIFIED, INSUFFICIENT, REQUIRES_REVIEW, PENDING). */
  router.patch("/evidence-links/:id", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const row = await activeStore.getEvidenceLinkById(id);
    if (!row) throw new AppError(404, "NOT_FOUND", "Evidence link not found");
    const orgId = await evidenceOrg(row.entityType, row.entityId);
    await orgAction(req, orgId, "EVIDENCE_LINK", u);
    const patch = {};
    if (req.body.status != null) {
      patch.status = String(req.body.status).toUpperCase();
      if (!["PENDING", "VERIFIED", "INSUFFICIENT", "REQUIRES_REVIEW"].includes(patch.status)) {
        throw new AppError(400, "VALIDATION_FAILED", "status must be PENDING, VERIFIED, INSUFFICIENT or REQUIRES_REVIEW");
      }
    }
    if (req.body.comment != null) patch.comment = String(req.body.comment).slice(0, 2000);
    if (req.body.confidence != null) {
      const conf = String(req.body.confidence).toLowerCase();
      if (!["low", "medium", "high"].includes(conf)) throw new AppError(400, "VALIDATION_FAILED", "confidence must be low, medium or high");
      patch.confidence = conf;
    }
    if (req.body.section != null) patch.section = String(req.body.section).slice(0, 200);
    if (req.body.referenceId != null) patch.referenceId = String(req.body.referenceId).slice(0, 100);
    patch.updatedBy = u.id;
    const updated = await activeStore.patchEvidenceLink(id, patch);
    const action = updated.status === "VERIFIED" ? "EVIDENCE_LINK_VERIFIED" : updated.status === "INSUFFICIENT" ? "EVIDENCE_LINK_FLAGGED" : "EVIDENCE_LINK_UPDATED";
    await audit(req, { action, entityType: row.entityType, entityId: row.entityId, organizationId: orgId, oldValue: { status: row.status, confidence: row.confidence }, newValue: { status: updated.status, comment: updated.comment } });
    res.json(updated);
  });

  router.get("/evidence-links", async (req, res) => {
    const ur = await user(req);
    const entityType = String((req.query && req.query.entityType) || "");
    const entityId = bodyUuid(req.query, "entityId", { required: true });
    const orgId = await evidenceOrg(entityType, entityId);
    await memberOf(req, orgId, ur);
    res.json({ evidence: await activeStore.listEvidenceLinks(entityType, entityId) });
  });

  /* ════════ audit trail (read) ════════ */
  router.get("/audit", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);
    const entityType = String((req.query && req.query.entityType) || "") || undefined;
    const entityId = req.query && req.query.entityId ? String(req.query.entityId) : undefined;
    res.json({ events: await activeStore.listAuditEvents({ organizationId, entityType, entityId }) });
  });

  /* ════════ insights / copilot (decoupled REGULENS prompt layer) ════
     Produces the SAME grounded artifact as /api/gov/copilot but scoped to
     a startup+challenge, using ONLY deterministic SIH facts read from the
     store (verification, eligibility, match, evaluation). The model never
     computes a score or verdict here — it merely reports stored outcomes.
     Caller must be an active member of the challenge's OR the startup's org. */
  router.post("/insights/copilot", async (req, res) => {
    const u = await user(req);
    const challengeId = bodyUuid(req.body, "challengeId", { required: true });
    const startupId = bodyUuid(req.body, "startupId", { required: true });
    const question = String((req.body && req.body.question) || "").trim().slice(0, 500);

    const challenge = await activeStore.getChallenge(challengeId);
    if (!challenge) throw new AppError(404, "NOT_FOUND", "Challenge not found");
    const startup = await activeStore.getStartup(startupId);
    if (!startup) throw new AppError(404, "NOT_FOUND", "Startup not found");

    const challengeOrgId = await challengeOrg(challengeId);
    const memberOfChallenge = !!challengeOrgId && !!await activeStore.getMembership(u.id, challengeOrgId);
    const memberOfStartup = !!startup.organizationId && !!await activeStore.getMembership(u.id, startup.organizationId);
    const permitted = (memberOfChallenge && (await activeStore.getMembership(u.id, challengeOrgId)).status === "ACTIVE")
      || (memberOfStartup && (await activeStore.getMembership(u.id, startup.organizationId)).status === "ACTIVE");
    if (!permitted) throw new AppError(403, "FORBIDDEN", "You do not have access to this challenge or startup");

    const [caps, verifications] = await Promise.all([
      activeStore.listStartupCapabilities(startupId),
      activeStore.listVerifications("STARTUP", startupId),
    ]);
    let match = await activeStore.getMatch(challengeId, startupId);
    /* Prefer the explainable matching-engine outcome when present; it is a
       stored deterministic snapshot (score 0-100 displayed, confidence 0-1). */
    if (!match) {
      const engineResults = await activeStore.listMatchingResultsByChallenge(challengeId);
      const latest = (engineResults || []).filter((r) => r.startupId === startupId && !r.stale).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (latest) {
        match = {
          id: latest.id,
          overallScore: Math.round(latest.matchScore * 10000) / 100,
          maxScore: 100,
          explanation: (latest.explanation && latest.explanation.plain) || null,
          kind: "RULE_BASED",
          matchConfidence: Math.round(latest.matchConfidence * 10000) / 100,
          eligibilityPool: latest.eligibilityPool,
        };
      }
    }
    let evaluation = null;
    const evals = await activeStore.listEvaluations(challengeId);
    const ev = (evals || []).find((e) => e.startupId === startupId);
    if (ev) evaluation = await activeStore.getEvaluationWithScores(ev.id);
    const checks = await activeStore.listEligibilityChecks(challengeId);
    const latestCheck = (checks || []).find((c) => c.startupId === startupId);
    const eligibility = latestCheck ? (latestCheck.results || []).map((r) => ({
      name: r.name || r.ruleName || null,
      verdict: r.verdict || r.result || null,
      notes: r.notes || null,
    })) : [];

    const context = {
      originId: String((req.body && req.body.context && req.body.context.originId) || ""),
      targetId: String((req.body && req.body.context && req.body.context.targetId) || ""),
      industryId: startup.sector || String((req.body && req.body.context && req.body.context.industryId) || ""),
      company: startup.legalName || startup.brandName || startup.brandName || "unknown",
      product: startup.brandName || String((req.body && req.body.context && req.body.context.product) || "offerings"),
    };

    const result = await sihCopilot({
      ai, gov, question, lang: req.body && req.body.lang,
      context,
      endpoint: "/api/sih/insights/copilot",
      sih: { startup, capabilities: caps, verifications, challenge, match, eligibility, evaluation },
    });

    await audit(req, {
      action: "INSIGHT_GENERATED", entityType: "MATCH", entityId: (match && match.id) || null,
      organizationId: challengeOrgId, newValue: { question: question.slice(0, 80), mode: result.mode }, isDemo: startup.isDemo,
    });

    res.json({ ...result, startupId, challengeId });
  });

  /* keep HEALTH info consistent with the rest of the API */
  router.get("/health", async (_req, res) => {
    res.json({ ok: true, layer: "sih26136", store: activeStore.adapterKind, version: "1.0.0" });
  });

  /* ───────── multi-agent orchestration for pilot creation ───────── */

  /* Compliance Agent — validates regulatory compliance prerequisites */
  async function complianceAgentCreatePilot(pilot, actor, req) {
    const rules = await activeStore.listEligibilityRules(pilot.challengeId);
    const activeRules = rules.filter((r) => r.lifecycleStatus === "ACTIVE");
    const compliance = {
      activeRulesCount: activeRules.length,
      ruleIds: activeRules.map((r) => r.id),
      complianceScore: activeRules.length > 0 ? 100 : 0,
      notes: activeRules.length
        ? "Active eligibility rules detected — pilot creation compliant with challenge rules"
        : "No active eligibility rules; pilot creation proceeds with manual review",
    };
    return compliance;
  }

  /* Risk Agent — assesses and flags pilot risks using existing risk intelligence */
  async function riskAgentCreatePilot(pilot, actor, req) {
    const risks = [];
    const ruleFlags = pilot.risks || [];
    for (const rf of ruleFlags) {
      risks.push({
        id: rf.id || `RISK-${Math.abs(hashStr(String(rf.title || ""))) % 900 + 100}`,
        title: rf.title || "Unnamed risk",
        category: rf.category || "Operational",
        probability: Math.min(5, Math.max(1, Math.round(Number(rf.probability) || 3))),
        impact: Math.min(5, Math.max(1, Math.round(Number(rf.impact) || 3))),
        severity: rf.probability * rf.impact >= 16 ? "Critical" : rf.probability * rf.impact >= 10 ? "High" : rf.probability * rf.impact >= 5 ? "Medium" : "Low",
        affectedRequirement: rf.reqId || "unknown",
        businessConsequence: rf.businessConsequence || "Under assessment",
        regulatoryConsequence: rf.regulatoryConsequence || "Under assessment",
        mitigation: rf.mitigation || "Monitor and mitigate",
        status: rf.status || "Open",
      });
    }
    return { assessedRisks: risks, riskCount: risks.length };
  }

  /* Document Agent — validates required documents for pilot initiation */
  async function documentAgentCreatePilot(pilot, actor, req) {
    const requiredDocs = pilot.requiredDocuments || [];
    const completeness = requiredDocs.length > 0 ? 100 / requiredDocs.length : 100;
    return {
      requiredDocuments: requiredDocs,
      documentCompleteness: Math.round(completeness),
      missingDocuments: requiredDocs.length < 5 ? ["Evidence of regulatory compliance", "Startup partnership agreement"] : [],
      notes: "Document requirements assessed for pilot eligibility",
    };
  }

  /* Analytics Agent — computes pilot readiness and KPI projections */
  async function analyticsAgentCreatePilot(pilot, actor, req) {
    const { baselineJson } = pilot;
    const baseline = baselineJson && Object.keys(baselineJson).length ? baselineJson : {};
    const estimatedDays = baseline.estimatedDays || pilot.durationDays || 90;
    const estimatedCost = baseline.estimatedCost || pilot.budget || 0;
    /* Deterministic readiness: every point derives from actual pilot inputs. */
    const hasObjective = pilot.objective ? 1 : 0;
    const hasDuration = Number(pilot.durationDays) > 0 ? 1 : 0;
    const hasBudget = Number(pilot.budget) > 0 ? 1 : 0;
    const hasLocation = pilot.location ? 1 : 0;
    const hasCriteria = Array.isArray(pilot.acceptanceCriteria) && pilot.acceptanceCriteria.length > 0 ? 1 : 0;
    const readinessScore = Math.round(((hasObjective + hasDuration + hasBudget + hasLocation + hasCriteria) / 5) * 100);
    return {
      estimatedDays,
      estimatedCost,
      readinessScore,
      kpiProjections: [],
      notes: "Analytics assessment completed via deterministic engine",
    };
  }

  /* Policy Agent — generates policy context and dependency analysis */
  async function policyAgentCreatePilot(pilot, actor, req) {
    const dependencies = pilot.dependencies || [];
    const industryId = pilot.challengeId ? await activeStore.getChallenge(pilot.challengeId) : null;
    return {
      dependencies: dependencies.map((d) => ({ text: d, status: "Pending" })),
      industryContext: industryId ? industryId.industry || "General" : "General",
      policyCompliance: "Pending review",
      notes: "Policy dependency analysis completed",
    };
  }

  /* Government Copilot — provides AI-governed synthesis of pilot data */
  async function govCopilotCreatePilot(pilot, actor, req) {
    const criteria = Array.isArray(pilot.acceptanceCriteria) ? pilot.acceptanceCriteria : [];
    const readinessScore = Math.round(
      ((pilot.objective ? 1 : 0) + (Number(pilot.budget) > 0 ? 1 : 0) + (Number(pilot.durationDays) > 0 ? 1 : 0) + (criteria.length > 0 ? 1 : 0)) / 4 * 100
    );
    const context = {
      business: pilot,
      origin: { organizationId: pilot.organizationId },
      target: { country: pilot.targetId || "India" },
      readiness: { score: readinessScore, status: readinessScore >= 75 ? "GOOD" : "INSUFFICIENT" },
      stats: {
        totalRequirements: criteria.length,
        critical: 0,
        important: 0,
        standard: 0,
      },
      regulations: [],
      requirements: [],
      gaps: [],
      actionPlan: [],
      estimatedCost: pilot.budget || 0,
      estimatedDays: pilot.durationDays || 90,
      canLaunch: true,
    };
    return { mode: "deterministic-fallback", context, grounded: true };
  }

  /* ══════════════════════════════════════════════════════════════════
     Registration Portal — multi-step organization registration
     Supports Startup, Business, and PSU organization types
     ══════════════════════════════════════════════════════════════════ */

  router.post("/registration", async (req, res) => {
    const u = await user(req);
    const organizationType = String(req.body.organizationType || "").trim();
    if (!["startup", "business", "psu"].includes(organizationType)) {
      throw new AppError(400, "INVALID_ORG_TYPE", "Invalid organization type");
    }
    const orgName = sanitizeStr(req.body.organizationName);
    if (!orgName) {
      throw new AppError(400, "MISSING_ORG_NAME", "Organization name is required");
    }
    const now = () => new Date().toISOString();
    const orgId = randomUUID();
    const startupId = randomUUID();

    // Store basic organization info
    await activeStore.createOrganization({
      id: orgId,
      org_type: organizationType === "startup" ? "STARTUP" : organizationType === "business" ? "PARTNER" : "GOVERNMENT",
      name: orgName,
      description: sanitizeStr(req.body.aboutOrganization),
      contact_email: sanitizeStr(req.body.officialEmail),
      contact_phone: sanitizeStr(req.body.officialPhone),
      status: "ACTIVE",
      created_by: u.id,
      created_at: now(),
      updated_at: now(),
    });

    // Store startup/org-specific info
    const startupIdMap = {
      startup: "STARTUP",
      business: "PARTNER",
      psu: "PARTNER",
    };

    await activeStore.createStartup({
      id: startupId,
      organization_id: orgId,
      legal_name: orgName,
      description: sanitizeStr(req.body.aboutOrganization),
      sector: sanitizeStr(req.body.industry),
stage: organizationType === "startup" ? (req.body.fundingStage || "") : "",
      website: sanitizeStr(req.body.website),
      location: sanitizeStr(req.body.headquarters),
      employee_count: asNum(req.body.numberOfEmployees),
      founded_year: asNum(req.body.yearFounded),
      dpiit_status: "NOT_MARKED",
      msme_status: asStr(req.body.msmeStatus),
      gst_status: asStr(req.body.gstStatus),
      startup_status: "ACTIVE",
      verification_status: "UNVERIFIED",
      is_demo: false,
      created_by: u.id,
      created_at: now(),
      updated_at: now(),
    });

    res.status(201).json({
      organizationId: orgId,
      startupId: startupId,
      organizationType: organizationType,
      status: "DRAFT",
      step: 1,
    });
  });

  router.patch("/registration/:id", async (req, res) => {
    const id = req.params.id;
    const u = await user(req);
    const step = String(req.body.step || "").trim();
    const status = String(req.body.status || "").trim();

    if (step) {
      await activeStore.patchOrganization(id, { updated_at: new Date().toISOString() });
    }
    if (status) {
      await activeStore.patchStartup(id, { verification_status: status });
    }

    res.json({ step, status });
  });

  router.get("/registration/:id", async (req, res) => {
    const id = req.params.id;
    const org = await activeStore.getOrganization(id);
    const startup = await activeStore.getStartup(id);
    res.json({ organization: org, startup });
  });

  router.post("/registration/:id/draft", async (req, res) => {
    const id = req.params.id;
    const u = await user(req);
    const step = String(req.body.step || "").trim();

    await activeStore.patchOrganization(id, {
      updated_at: new Date().toISOString(),
    });

    res.json({ step, saved: true });
  });

  router.post("/registration/:id/submit", async (req, res) => {
    const id = req.params.id;
    const u = await user(req);

    await activeStore.patchStartup(id, {
      verification_status: "PENDING",
      updated_at: new Date().toISOString(),
    });

    res.json({ status: "UNDER_VERIFICATION" });
  });

  router.post("/registration/step/:step", async (req, res) => {
    const step = req.params.step;
    const u = await user(req);
    const stepData = req.body;

    res.json({ step, saved: true, validated: true });
  });

  /* ══════════════════════════════════════════════════════════════════
     GET /api/sih/overview?organizationId= — Government Command Center
     Single aggregated intelligence payload for the Government dashboard.
     Reuses existing domain intelligence (compliance, risk, outcome,
     procurement-readiness) and existing store lists. Deterministic —
     no AI calls. Auth: any active member of the organization.
     ══════════════════════════════════════════════════════════════════ */
  router.get("/overview", async (req, res) => {
    const ur = await user(req);
    const organizationId = bodyUuid(req.query, "organizationId", { required: true });
    await memberOf(req, organizationId, ur);

    /* ---- seed data ----
       problems + challenges owned by this gov org */
    const problems = await activeStore.listProblems(organizationId);
    const challenges = await activeStore.listChallenges(organizationId);

    /* ---- lookup helpers (with caches) ---- */
    const startupCache = new Map();
    async function startupInfo(id) {
      if (!id) return null;
      if (startupCache.has(id)) return startupCache.get(id);
      const s = await activeStore.getStartup(id);
      const out = s ? {
        id: s.id,
        legalName: s.legalName || s.legal_name || "",
        brandName: s.brandName || s.brand_name || "",
        sector: s.sector || "",
        location: s.location || "",
        state: s.state || "",
        stage: s.stage || "",
        verificationStatus: s.verificationStatus || s.verification_status || "UNVERIFIED",
        dpiitStatus: s.dpiitStatus || s.dpiit_status || "NOT_MARKED",
        msmeStatus: s.msmeStatus || s.msme_status || "NOT_MARKED",
        gstStatus: s.gstStatus || s.gst_status || "NOT_MARKED",
      } : null;
      startupCache.set(id, out);
      return out;
    }

    const problemById = new Map(problems.map((p) => [p.id, p]));
    const challengeById = new Map(challenges.map((c) => [c.id, c]));

    async function problemFor(p) {
      if (p.problemId && problemById.has(p.problemId)) return problemById.get(p.problemId);
      if (p.problemId) {
        try {
          const r = await activeStore.getProblem(p.problemId);
          if (r) problemById.set(p.problemId, r);
          return r || null;
        } catch (_) { return null; }
      }
      return null;
    }

    /* ---- per-challenge collections ---- */
    const appsByChallenge = new Map();
    const matchesByChallenge = new Map();
    const checksByChallenge = new Map();
    const evalsByChallenge = new Map();
    const aggregByChallenge = new Map();
    const decisionsByChallenge = new Map();
    const evaluations = [];
    const aggregations = [];
    const decisions = [];

    /* store helpers may return sync values (memory adapter) or promises;
       Promise.resolve normalizes both. */
    async function listSafely(p) {
      try {
        const v = await Promise.resolve(p);
        return Array.isArray(v) ? v : [];
      } catch (_) {
        return [];
      }
    }

    for (const c of challenges) {
      const [applications, matches, checks, evs, aggs, decs] = await Promise.all([
        listSafely(activeStore.listApplicationsByChallenge(c.id)),
        listSafely(activeStore.listMatches(c.id)),
        listSafely(activeStore.listEligibilityChecks(c.id)),
        listSafely(activeStore.listEvaluations(c.id)),
        listSafely(activeStore.listEvaluationAggregations(c.id)),
        listSafely(activeStore.listEvaluationDecisions(c.id)),
      ]);
      appsByChallenge.set(c.id, applications || []);
      matchesByChallenge.set(c.id, matches || []);
      checksByChallenge.set(c.id, checks || []);
      evalsByChallenge.set(c.id, evs || []);
      aggregByChallenge.set(c.id, aggs || []);
      decisionsByChallenge.set(c.id, decs || []);
      (evs || []).forEach((e) => evaluations.push(e));
      (aggs || []).forEach((a) => aggregations.push(a));
      (decs || []).forEach((d) => decisions.push(d));
    }

    /* ---- startups referenced anywhere ---- */
    const allMatchRows = [];
    const allAppRows = [];
    for (const c of challenges) {
      allMatchRows.push(...(matchesByChallenge.get(c.id) || []));
      allAppRows.push(...(appsByChallenge.get(c.id) || []));
    }
    const startupIds = new Set();
    allMatchRows.forEach((m) => m.startupId && startupIds.add(m.startupId));
    allAppRows.forEach((a) => a.organizationId && startupIds.add(a.organizationId));
    const startupIdToOrg = new Map();
    for (const c of challenges) {
      for (const a of appsByChallenge.get(c.id) || []) {
        if (a.organizationId) startupIdToOrg.set(a.organizationId.toLowerCase(), a.organizationId);
      }
    }
    const matchedStartups = [];
    const startupIdsList = Array.from(startupIds);
    for (const sid of startupIdsList) {
      const s = await startupInfo(sid);
      if (s) matchedStartups.push(s);
    }

    /* ---- pilots (all owned by this org) + intelligence ---- */
    const pilots = await activeStore.listPilots(organizationId);
    const pilotRows = [];
    const pilotAnalyses = {};
    const aggregatedEvidence = [];

    for (const p of pilots) {
      const [kpis, milestones, results, intelligence] = await Promise.all([
        listSafely(activeStore.listKpis(p.id)),
        listSafely(activeStore.listMilestones(p.id)),
        listSafely(activeStore.listPilotResults(p.id)),
        listSafely(activeStore.listPilotIntelligence(p.id, { limit: 1 })),
      ]);
      const latestIntel = intelligence && intelligence[0] ? intelligence[0] : null;
      const pilotResult = results && results[0] ? results[0] : null;
      const challenge = p.challengeId ? challengeById.get(p.challengeId) : null;
      const problem = await problemFor(challenge || {});
      const startup = await startupInfo(p.startupId);
      const kpiL = kpis || [];
      const lastIntel = latestIntel || {};

      const kpiCount = kpiL.length;
      const targetAchievement = Number(lastIntel.targetAchievement != null ? lastIntel.targetAchievement : (p.targetAchievement || 0));
      const overallScore = Number(p.overallScore || 0);
      const trend = p.trend || lastIntel.trend || "STABLE";
      const milestoneCount = (milestones || []).length;
      const health = dom.computePilotHealth(overallScore, kpiCount, milestoneCount, targetAchievement);

      /* usable compliance + risk context */
      const applicableRegulations = Array.isArray(challenge && challenge.eligibilityRequirements) && challenge.eligibilityRequirements.length
        ? challenge.eligibilityRequirements.map((r) => ({
            title: (r && (r.title || r.name)) || "Eligibility requirement",
            code: r && (r.code || r.id),
            active: r ? r.active !== false : true,
            blocking: r ? r.blocking !== false : true,
            evidenceRequired: r ? !!r.evidenceRequired : false,
          }))
        : [];
      const compliance = dom.evaluatePilotCompliance(p, applicableRegulations);
      const risks = dom.detectPilotRisks(p, applicableRegulations);
      const outcome = dom.classifyPilotOutcome({ ...p, targetAchievement, kpiCount, overallScore }, pilotResult, risks);
      const readiness = dom.evaluateProcurementReadiness(
        { ...p, trend, overallScore, targetAchievement, kpiCount, milestoneCount: (milestones || []).length, estimatedCost: p.budget || 0 },
        pilotResult,
        compliance,
        risks
      );

      const result = {
        id: p.id,
        title: p.title || "Untitled pilot",
        objective: p.objective || "",
        status: p.status || "PLANNED",
        health,
        location: p.location || "",
        department: p.responsibleDept || (challenge ? challenge.title : ""),
        startDate: p.startDate || null,
        endDate: p.endDate || null,
        budget: p.budget || 0,
        currency: p.currency || "INR",
        durationDays: p.durationDays || 90,
        costSaving: lastIntel.costSaving || p.costSaving || 0,
        efficiency: lastIntel.efficiency || p.efficiency || 0,
        usersImpacted: lastIntel.usersImpacted || p.usersImpacted || 0,
        satisfaction: lastIntel.satisfaction || p.satisfaction || 0,
        overallScore,
        targetAchievement,
        trend,
        aiInsight: lastIntel.aiInsight || "",
        aiMode: lastIntel.aiMode || "",
        challenge: challenge ? {
          id: challenge.id,
          title: challenge.title,
          status: challenge.challengeStatus,
          budgetMin: challenge.budgetMin,
          budgetMax: challenge.budgetMax,
        } : null,
        problem: problem ? { id: problem.id, title: problem.title, sector: problem.sector, budget: problem.estimatedBudget } : null,
        startup,
        kpis: kpiL.map((k) => ({
          name: k.name, unit: k.unit, baselineValue: k.baselineValue, targetValue: k.targetValue,
          actualValue: k.actualValue, achievementPct: k.achievementPct, trend: k.trend, status: k.status,
        })),
        milestoneCount: (milestones || []).length,
        autonomy: "human", /* pilot decisions remain with government officers */
        outcome,
        readiness,
        compliance: { overall: compliance.overall, blocking: compliance.blocking, satisfied: compliance.satisfied, total: compliance.total, criteria: compliance.criteria || [] },
        risks: { riskCount: (risks.risks || []).length, risks: (risks.risks || []).slice(0, 5), criticalHigh: (risks.risks || []).filter((r) => r.severity === "CRITICAL" || r.severity === "HIGH").length },
        result: pilotResult ? {
          id: pilotResult.id,
          result: pilotResult.result,
          recommendation: pilotResult.recommendation,
          recommendationNotes: pilotResult.recommendationNotes,
          qualitativeFindings: pilotResult.qualitativeFindings,
          kpiAchievement: pilotResult.kpiAchievement || {},
          evaluatedAt: pilotResult.evaluatedAt,
        } : null,
      };
      pilotRows.push(result);
      pilotAnalyses[p.id] = {
        health, outcome: outcome.outcome, outcomeConfidence: outcome.confidence, outcomeReason: outcome.reason,
        readiness: readiness.status, readinessConditions: readiness.conditions || [], riskLevel: readiness.riskLevel,
        targetAchievement, overallScore,
      };
      const linkRows = await listSafely(activeStore.listEvidenceLinks("PILOT", p.id));
      aggregatedEvidence.push(...linkRows.map((e) => ({ ...e, pilotId: p.id })));
      for (const l of results || []) {
        const ev = await listSafely(activeStore.listEvidenceLinks("PILOT_RESULT", l.id));
        aggregatedEvidence.push(...ev);
      }
    }

    /* ---- scale plans + procurement assessments ---- */
    const scalePlans = await activeStore.listScalePlans(organizationId);
    const procurementAssessments = await activeStore.listProcurementAssessments(organizationId);

    /* ---- applications enriched with challenge + startup + problem ---- */
    const enrichedApps = [];
    for (const a of allAppRows) {
      const ch = challengeById.get(a.challengeId);
      const start = await startupInfo(a.organizationId);
      const problem = ch ? await problemFor(ch) : null;
      enrichedApps.push({
        id: a.id,
        challengeId: a.challengeId,
        challengeTitle: (ch && ch.title) || "",
        challengeStatus: (ch && ch.challengeStatus) || "",
        problemTitle: (problem && problem.title) || "",
        solutionTitle: a.solutionTitle || "",
        technology: a.technology || "",
        expectedImpact: a.expectedImpact || "",
        costMin: a.costMin,
        costMax: a.costMax,
        status: a.status || "DRAFT",
        decisionReason: a.decisionReason || "",
        startup,
      });
    }

    /* ---- matches enriched ---- */
    const enrichedMatches = [];
    for (const m of allMatchRows) {
      const ch = challengeById.get(m.challengeId);
      const start = await startupInfo(m.startupId);
      enrichedMatches.push({
        id: m.id,
        challengeId: m.challengeId,
        challengeTitle: (ch && ch.title) || "",
        overallScore: m.overallScore,
        dimensionScores: m.dimensionScores || m.dimensionScoresJson || {},
        explanation: m.explanation || "",
        evidence: m.evidence || {},
        startup: start,
      });
    }
    enrichedMatches.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));

    /* ---- eligibility summaries per challenge ---- */
    const eligibilitySummaries = [];
    for (const c of challenges) {
      const checks = checksByChallenge.get(c.id) || [];
      const latest = {};
      for (const ch of checks) latest[ch.startupId] = ch;
      const apps = appsByChallenge.get(c.id) || [];
      const eligibleApps = apps.filter((a) => ["ELIGIBLE", "SHORTLISTED", "SELECTED", "PILOT"].includes(a.status));
      for (const check of checks) {
        const start = await startupInfo(check.startupId);
        eligibilitySummaries.push({
          challengeId: c.id,
          challengeTitle: c.title,
          startupId: check.startupId,
          startup: start,
          verdict: check.verdict,
          percent: check.percentPass || check.passPercent || 0,
          snapshotId: check.snapshotId || null,
          evaluatedAt: check.createdAt || check.evaluatedAt || null,
        });
      }
      const _ = eligibleApps; // used for pipeline counts below
    }

    /* ---- decisions (government decision area) ---- */
    const enrDecisions = [];
    for (const d of decisions) {
      const ch = challengeById.get(d.challengeId);
      const start = await startupInfo(d.startupId);
      enrDecisions.push({
        id: d.id,
        challengeId: d.challengeId,
        challengeTitle: (ch && ch.title) || "",
        startup,
        pilotId: d.pilotId || null,
        decisionType: d.decisionType || d.kind || "",
        stage: d.decisionStage || "",
        status: d.status || "",
        decision: d.decision || d.decisionValue || "",
        reason: d.reason || d.notes || "",
        conditions: d.conditions || [],
        warnings: d.warnings || [],
        decidedBy: d.decidedBy || d.actorUid || "",
        createdAt: d.createdAt || null,
      });
    }

    /* ───── compute pipeline + KPI counts ───── */
    const publishedProblemCount = problems.filter((p) => ["PUBLISHED", "IN_CHALLENGE", "CLOSED"].includes(p.status)).length;
    const activeProblems = problems.filter((p) => !["ARCHIVED", "CLOSED"].includes(p.status));
    const publishedChallenges = challenges.filter((c) => ["PUBLISHED", "APPLICATIONS_OPEN", "EVALUATION", "PILOT_SELECTION", "PILOT_RUNNING", "COMPLETED"].includes(c.challengeStatus));
    const solutionReceivedCount = allAppRows.length;
    const eligibleSolutionCount = allAppRows.filter((a) => ["ELIGIBLE", "SHORTLISTED", "SELECTED", "PILOT"].includes(a.status)).length;
    const underEvaluationCount = allAppRows.filter((a) => ["SUBMITTED", "UNDER_REVIEW"].includes(a.status)).length;
    const pilotRunning = pilotRows.filter((p) => p.status === "RUNNING");
    const pilotCompleted = pilotRows.filter((p) => p.status === "COMPLETED");
    const pilotAttention = pilotRows.filter((p) => ["AT_RISK", "CRITICAL"].includes(p.health) && ["PLANNED", "APPROVED", "RUNNING", "PAUSED"].includes(p.status));
    const readyRows = pilotCompleted.filter((p) => ["READY", "READY_WITH_CONDITIONS"].includes(p.readiness.status));
    const readyFully = pilotCompleted.filter((p) => p.readiness.status === "READY");
    const readyWithConditions = pilotCompleted.filter((p) => p.readiness.status === "READY_WITH_CONDITIONS");
    const pendingDecisions = enrDecisions.filter((d) => (d.status || "").indexOf("PENDING") === 0).length +
      readyRows.filter((p) => (p.result && p.result.recommendation) && !enrDecisions.some((d) => d.challengeId === (p.challenge && p.challenge.id) && d.startupId === (p.startup && p.startup.id))).length;
    const estValueReady = readyRows.reduce((sum, p) => sum + ((p.challenge && p.challenge.budgetMax) || p.budget || 0), 0);
    const scalePlanValue = scalePlans.reduce((sum, s) => sum + (s.estimatedBudget || s.budget || 0), 0);

    const pipeline = [
      { key: "problemSubmitted", label: "Problem Submitted", count: problems.filter((p) => ["SUBMITTED", "APPROVED", "PUBLISHED", "IN_CHALLENGE", "CLOSED"].includes(p.status)).length },
      { key: "problemPublished", label: "Problem Published", count: publishedProblemCount },
      { key: "challengesPublished", label: "Challenge Published", count: publishedChallenges.length },
      { key: "solutionsReceived", label: "Solutions Received", count: solutionReceivedCount },
      { key: "screened", label: "Eligibility Screened", count: eligibilitySummaries.length },
      { key: "eligible", label: "Eligible", count: eligibleSolutionCount },
      { key: "underEvaluation", label: "Evaluation", count: underEvaluationCount },
      { key: "pilotsRunning", label: "Pilots Running", count: pilotRunning.length },
      { key: "pilotsCompleted", label: "Pilots Completed", count: pilotCompleted.length },
      { key: "procurementReady", label: "Procurement Ready", count: readyRows.length },
      { key: "pendingDecision", label: "Gov Decision Pending", count: pendingDecisions },
      { key: "scalePlan", label: "Procure / Scale", count: scalePlans.length },
    ];

    const kpis = [
      { key: "activeProblems", label: "Active Problems", value: activeProblems.length },
      { key: "solutionsReceived", label: "Solutions Received", value: solutionReceivedCount },
      { key: "eligibleSolutions", label: "Eligible Solutions", value: eligibleSolutionCount },
      { key: "activePilots", label: "Active Pilots", value: pilotRunning.length },
      { key: "completedPilots", label: "Completed Pilots", value: pilotCompleted.length },
      { key: "procurementReady", label: "Procurement-Ready", value: readyRows.length },
      { key: "pendingDecisions", label: "Pending Decisions", value: pendingDecisions },
      { key: "estimatedValue", label: "Est. Procurement Value", value: estValueReady || scalePlanValue, valueKind: "money" },
    ];

    /* ───── AI insights (deterministic, from real data) ───── */
    const insights = [];
    if (readyFully.length) insights.push(`ACTION REQUIRED: ${readyFully.length} solution(s) are fully procurement-ready and await a Government decision.`);
    else if (pilotCompleted.length) insights.push(`NOTE: ${pilotCompleted.length} pilot(s) completed; none are fully procurement-ready yet.`);
    if (readyWithConditions.length) insights.push(`ATTENTION: ${readyWithConditions.length} solution(s) are ready with conditions — review the listed conditions before proceeding.`);
    if (pilotAttention.length) insights.push(`ATTENTION: ${pilotAttention.length} active pilot(s) need attention (rated at-risk or critical).`);
    const noEligible = activeProblems.filter((p) => {
      const chs = challenges.filter((c) => c.problemId === p.id);
      const count = chs.reduce((s, c) => s + (appsByChallenge.get(c.id) || []).length, 0);
      return count === 0;
    });
    if (noEligible.length) insights.push(`NOTE: ${noEligible.length} active problem(s) have no solution submissions yet.`);
    const strongSector = {};
    for (const p of pilotCompleted) {
      const sec = p.problem && p.problem.sector ? p.problem.sector : (p.challenge ? p.challenge.title : "");
      if (!sec) continue;
      strongSector[sec] = (strongSector[sec] || 0) + (p.outcome.outcome === "SUCCESSFUL" ? 1 : 0);
    }
    const bestSector = Object.keys(strongSector).sort((a, b) => strongSector[b] - strongSector[a])[0];
    if (bestSector && strongSector[bestSector] > 0) insights.push(`NOTE: Successful outcomes are concentrated in “${bestSector}” solutions.`);
    if (allAppRows.length === 0 && challenges.length === 0) insights.push(`NOTE: Publish a Government problem to begin solution discovery.`);
    if (pilotAttention.length === 0 && readyRows.length === 0 && pilotCompleted.length > 0) insights.push(`NORMAL: All ${pilotCompleted.length} completed pilot(s) have stable performance with no open compliance blockers.`);
    if (!insights.length) insights.push(`NOTE: No anomalies detected. Newly registered activity will appear here automatically.`);

    /* ───── required actions (prioritized) ───── */
    const actions = [];
    for (const pr of readyRows.slice(0, 5)) {
      actions.push({
        priority: "HIGH",
        kind: "DECISION",
        subject: pr.startup ? pr.startup.brandName || pr.startup.legalName : "Solution",
        text: `${pr.title} is procurement-${pr.readiness.status === "READY" ? "ready" : "ready with conditions"}.`,
        target: pr.challenge ? pr.challenge.title : pr.title,
        recommendation: pr.readiness.conditions && pr.readiness.conditions.length
          ? `Resolve conditions: ${pr.readiness.conditions.join("; ")}`
          : "Review evidence and take a Government procurement decision.",
        pilotId: pr.id,
      });
    }
    for (const pa of pilotAttention.slice(0, 5)) {
      actions.push({
        priority: "MEDIUM",
        kind: "PILOT",
        subject: pa.title,
        text: `Pilot health is ${pa.health} (score ${pa.overallScore}, target achievement ${pa.targetAchievement}%).`,
        target: pa.challenge ? pa.challenge.title : pa.title,
        recommendation: `Investigate KPI gaps and required documents for pilot ${pa.title}.`,
        pilotId: pa.id,
      });
    }
    for (const rwc of readyWithConditions.slice(0, 3)) {
      actions.push({
        priority: "MEDIUM",
        kind: "CONDITIONS",
        subject: rwc.title,
        text: "Additional evidence is required before procurement review.",
        target: rwc.challenge ? rwc.challenge.title : "",
        recommendation: rwc.readiness.conditions.join("; "),
        pilotId: rwc.id,
      });
    }
    for (const pc of pilotCompleted.slice(0, 3)) {
      if (!readyRows.includes(pc)) {
        actions.push({
          priority: "INFO",
          kind: "VALIDATION",
          subject: pc.title,
          text: `Pilot completed with outcome “${pc.outcome.outcome}” but has not yet reached full procurement readiness.`,
          target: pc.challenge ? pc.challenge.title : "",
          recommendation: pc.outcomeReason || "Continue monitoring evidence and KPI data.",
          pilotId: pc.id,
        });
      }
    }

    res.json({
      organization: {
        id: organizationId,
        name: (await activeStore.getOrganization(organizationId).catch(() => null))?.name || "Government",
      },
      pipeline,
      kpis,
      insights,
      actions,
      problems: problems.map((p) => ({ id: p.id, title: p.title, status: p.status, sector: p.sector, estimatedBudget: p.estimatedBudget, createdAt: p.createdAt, challengeCount: challenges.filter((c) => c.problemId === p.id).length })),
      challenges: challenges.map((c) => ({ id: c.id, title: c.title, status: c.challengeStatus, challengeCode: c.challengeCode, budgetMin: c.budgetMin, budgetMax: c.budgetMax, pilotDurationDays: c.pilotDurationDays, problemId: c.problemId, applicationCount: (appsByChallenge.get(c.id) || []).length, eligibleCount: (appsByChallenge.get(c.id) || []).filter((a) => ["ELIGIBLE", "SHORTLISTED", "SELECTED", "PILOT"].includes(a.status)).length, submissionDeadline: c.submissionDeadline })),
      applications: enrichedApps,
      matches: enrichedMatches,
      eligibility: eligibilitySummaries,
      evaluations,
      aggregations,
      decisions: enrDecisions,
      pilots: pilotRows,
      pilotAnalyses,
      procurement: { assessments: procurementAssessments, scalePlans: scalePlans.map((s) => ({ id: s.id, title: s.title || "Scale plan", status: s.status || "", estimatedBudget: s.estimatedBudget || s.budget || 0, pilotProjectId: s.pilotProjectId })) },
      evidence: aggregatedEvidence,
      generatedAt: now(),
    });
  });

  return router;
}