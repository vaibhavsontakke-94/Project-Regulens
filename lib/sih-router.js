/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — additive API layer
   Mounted by server.js at /api/sih. Follows existing server.js
   conventions (sanitization, AppError → global error middleware,
   camelCase JSON payloads). No AI is used anywhere in this layer.
   ═══════════════════════════════════════════════════════════════════ */
import express from "express";
import { AppError } from "./errors.js";
import { newRequestId } from "./log.js";
import { defaultSihStore } from "./sih-store.js";
import * as dom from "./sih-domain.js";
import * as au from "./sih-auth.js";
import * as proc from "./sih-procurement.js";
import * as startup from "./sih-startup.js";
import * as gov from "./gov-engine.cjs";
import * as ai from "./groq.js";
import { sihCopilot } from "./sih-integration.js";

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
    res.json({ problems: await activeStore.listProblems(organizationId) });
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
    const patch = { ...dom.prepareProblem({ ...problem, ...req.body }), createdBy: problem.createdBy };
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

  router.get("/challenges/:id/matches", async (req, res) => {
    const id = paramUuid(req, "id");
    const ur = await user(req);
    const challenge = await activeStore.getChallenge(id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    await memberOf(req, challenge.organizationId, ur);
    res.json({ matches: await activeStore.listMatches(id) });
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
    res.json(profile);
  });

  router.post("/startups/:id/profile", async (req, res) => {
    const id = paramUuid(req, "id");
    const u = await user(req);
    const startupRow = await loadStartupOr404(id);
    await requireStartupOrgAction(req, startupRow, "STARTUP_PROFILE_EDIT", u);
    const prepared = startup.prepareProfile({ ...req.body, startupId: id });
    if (!prepared.startupId) prepared.startupId = id;
    const existing = await activeStore.getStartupProfile(id);
    let profile;
    if (existing) {
      profile = await activeStore.patchStartupProfile(id, {
        profileJson: prepared.profileJson,
        attributes: prepared.attributes,
        updatedBy: u.id,
      });
      await audit(req, { action: "PROFILE_UPDATED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { updated: true }, isDemo: startupRow.isDemo });
    } else {
      const row = Object.assign({}, prepared, { startupId: id, updatedBy: u.id });
      profile = await activeStore.createStartupProfile(row);
      await audit(req, { action: "PROFILE_CREATED", entityType: "STARTUP_PROFILE", entityId: id, organizationId: startupRow.organizationId, newValue: { created: true }, isDemo: startupRow.isDemo });
    }
    const state = await recomputeProfileState(req, startupRow, u);
    res.status(existing ? 200 : 201).json({ profile, ...state });
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
    const data = dom.prepareEligibilityRule(req.body);
    const orgId = await challengeOrg(data.challengeId);
    await orgAction(req, orgId, "ELIGIBILITY_RULE", u);
    data.createdBy = u.id;
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
    res.json({ rules: await activeStore.listEligibilityRules(challengeId) });
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

  /* ACTIVE eligibility rules for a challenge (what actually drives evaluation). */
  router.get("/eligibility/rules", async (req, res) => {
    const ur = await user(req);
    const challengeId = bodyUuid(req.query, "challengeId", { required: true });
    const orgId = await challengeOrg(challengeId);
    await memberOf(req, orgId, ur);
    const all = await activeStore.listEligibilityRules(challengeId);
    const active = (req.query.active === "true") ? all.filter((r) => r.lifecycleStatus === "ACTIVE") : all;
    res.json({ rules: active });
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
    res.status(201).json(created);
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
    const created = await activeStore.createEvidenceLink(data);
    await audit(req, { action: "EVIDENCE_LINK_ADDED", entityType: data.entityType, entityId: data.entityId, organizationId: orgId, newValue: { id: created.id, referenceId: created.referenceId } });
    res.status(201).json(created);
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

  return router;
}