/* ═══════════════════════════════════════════════════════════════════
   SIH26136 — authentication + authorization
   Extends the existing Firebase ID-token authentication (lib/auth.js).
   No duplicate user system: actor columns store the verified Firebase uid.
   RBAC is applied HERE at the server layer, on top of the existing RLS
   pattern — the browser never supplies actor or organization ids.
   ═══════════════════════════════════════════════════════════════════ */
import { AppError } from "./errors.js";
import * as auth from "./auth.js";

/* ───────── role ranking ─────────
   Government roles and startup roles share one rank scale so policy
   checks can compare "at least" responsibilities. */
export const ROLE_RANKS = {
  VIEWER: 10,
  EVALUATOR: 20,
  PROCUREMENT_OFFICER: 30,
  OFFICER: 40,
  ADMIN: 50,
  STARTUP_MEMBER: 10,
  STARTUP_ADMIN: 50,
};

export const GOVERNMENT_ROLES = ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER", "EVALUATOR", "VIEWER"];
export const STARTUP_ROLES = ["STARTUP_ADMIN", "STARTUP_MEMBER"];

export function roleRank(role) {
  return ROLE_RANKS[role] != null ? ROLE_RANKS[role] : 0;
}

export function roleAtLeast(role, minRole) {
  return roleRank(role) >= roleRank(minRole);
}

export function isGovernmentRole(role) {
  return GOVERNMENT_ROLES.includes(role);
}

export function assertRole(effectiveRole, allowedRoles, message = "You do not have the required role for this action") {
  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    throw new AppError(403, "FORBIDDEN", message);
  }
  return effectiveRole;
}

/* Effective role = the membership role; an organization ADMIN/OFFICER may
   perform any action a lower-rank member of the same org can. */
export function effectiveRoleCan(effectiveRole, minRole) {
  return roleAtLeast(effectiveRole, minRole);
}

/* ───────── HTTP helpers (mirror of server.js tokenFrom) ───────── */
export function bearerToken(req) {
  const h = req.get && req.get("authorization");
  const raw = String(h || "");
  return raw.startsWith("Bearer ") ? raw.slice(7).trim() : null;
}

/* Default user resolver: verify the Firebase ID token. Tests inject a fake
   resolver through createSihRouter({ resolveUser }). */
export async function defaultResolveUser(req) {
  const token = bearerToken(req);
  if (!token) return null;
  return auth.userFromIdToken(token);
}

export async function requireUser(req, resolveUser = defaultResolveUser) {
  const user = await resolveUser(req);
  if (!user || !user.id) {
    throw new AppError(401, "UNAUTHORIZED", "Not signed in");
  }
  return user;
}

/* Resolve an effective membership role for a user within an organization.
   Throws 403 (not 404) so cross-department probing leaks nothing. */
async function effectiveRole(store, userId, organizationId, { required = true } = {}) {
  const membership = await store.getMembership(userId, organizationId);
  if (!membership || membership.status !== "ACTIVE") {
    if (!required) return null;
    throw new AppError(403, "FORBIDDEN", "You do not have access to this organization");
  }
  return membership.role;
}

export { effectiveRole };

/* Resolve which organization a tenanted entity belongs to so nested reads
   (startup documents, challenge matches, pilot KPIs) can be access-checked
   against the owning organization. */
export async function resolveOrganizationForEntity(store, entityType, entityId) {
  let organizationId = null;
  switch (entityType) {
    case "startup":
      organizationId = (await store.getStartup(entityId))?.organizationId;
      break;
    case "challenge":
      organizationId = (await store.getChallenge(entityId))?.organizationId;
      break;
    case "problem":
      organizationId = (await store.getProblem(entityId))?.organizationId;
      break;
    case "pilot_projects":
    case "pilot":
      {
        const row = await store.getPilot(entityId);
        organizationId = row?.organizationId;
        break;
      }
    case "procurement_assessments":
      {
        const row = await store.getProcurementAssessment(entityId);
        organizationId = row?.organizationId;
        break;
      }
    case "scale_plans":
      {
        const row = await store.getScalePlan(entityId);
        organizationId = row?.organizationId;
        break;
      }
    default:
      organizationId = null;
  }
  return organizationId;
}

/* ───────── RBAC decision table (single source of truth for tests) ─────────
   Each entry: mainstream role that is ALLOWED. Enforces multi-tenancy by
   requiring membership in the owning organization first. */
export function actionAllowed(action, role) {
  switch (action) {
    case "ORG_CREATE":
    case "ORG_UPDATE":
    case "ORG_MEMBER_INVITE":
    case "ORG_MEMBER_ROLE_CHANGE":
      return ["ADMIN", "OFFICER"].includes(role);
    case "PROBLEM_CREATE":
    case "PROBLEM_UPDATE":
    case "CHALLENGE_CREATE":
    case "CHALLENGE_UPDATE":
    case "CHALLENGE_PUBLISH":
      return ["ADMIN", "OFFICER"].includes(role);
    case "STARTUP_REGISTER":
    case "STARTUP_UPDATE":
      return ["ADMIN", "OFFICER", "STARTUP_ADMIN"].includes(role);
    case "STARTUP_CAPABILITY":
    case "STARTUP_DOCUMENT_UPLOAD":
    case "STARTUP_DOCUMENT_STATUS":
      return ["ADMIN", "OFFICER", "STARTUP_ADMIN", "STARTUP_MEMBER", "EVALUATOR"].includes(role);
    case "VERIFICATION_RECORD":
      return ["ADMIN", "OFFICER", "STARTUP_ADMIN"].includes(role);
    case "ELIGIBILITY_RULE":
      return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER"].includes(role);
    case "ELIGIBILITY_CHECK":
    case "MATCH_RECORD":
      return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER", "EVALUATOR"].includes(role);
    case "EVALUATION_CREATE":
    case "EVALUATION_SCORE":
    case "EVALUATION_STATUS":
      return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER", "EVALUATOR"].includes(role);
    case "PILOT_CREATE":
    case "PILOT_UPDATE":
    case "PILOT_KPI":
    case "PILOT_RESULT":
      return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER", "EVALUATOR"].includes(role);
    case "PROCUREMENT_ASSESS":
    case "PROCUREMENT_RECOMMEND":
      return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER"].includes(role);
    case "SCALE_PLAN":
      return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER"].includes(role);
    case "AUDIT_READ":
    case "EVIDENCE_LINK":
      return ["ADMIN", "OFFICER", "PROCUREMENT_OFFICER", "EVALUATOR", "VIEWER", "STARTUP_MEMBER", "STARTUP_ADMIN"].includes(role);
    case "ORG_READ":
    case "CHALLENGE_READ":
    case "PROBLEM_READ":
    case "STARTUP_READ":
    case "PILOT_READ":
    case "EVALUATION_READ":
    case "PROCUREMENT_READ":
    case "SCALE_READ":
    case "CAPABILITY_READ":
      return roleRanksAll(role);
    default:
      return false;
  }
}

function roleRanksAll(role) {
  return roleRank(role) > 0;
}

export async function assertAction(store, user, organizationId, action) {
  const role = await effectiveRole(store, user.id, organizationId);
  if (!actionAllowed(action, role)) {
    throw new AppError(403, "FORBIDDEN", "You do not have the required role for this action");
  }
  return role;
}