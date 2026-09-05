import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildTestApp, startServer, http } from "./test/sih-helper.js";
import { createSihStore } from "./lib/sih-store.js";
import * as dom from "./lib/sih-domain.js";

let serverCtx;

beforeEach(async () => {
  const app = buildTestApp();
  serverCtx = await startServer(app);
  serverCtx.client = http(serverCtx.base);
});

afterEach(async () => {
  if (serverCtx) await serverCtx.close();
});

async function seedBase(client) {
  const orgA = await client("POST", "/organizations", {
    userId: "admin-a",
    body: { orgType: "GOVERNMENT", name: "Maharashtra Health Innovation Cell", state: "Maharashtra", ministry: "Health" },
  });
  const orgB = await client("POST", "/organizations", {
    userId: "admin-b",
    body: { orgType: "GOVERNMENT", name: "Karnataka Water Board" },
  });
  assert.equal(orgA.status, 201, "org A created");
  assert.equal(orgB.status, 201, "org B created");
  return {
    orgA: orgA.body.id,
    orgB: orgB.body.id,
    orgAUUID: orgA.body.id,
  };
}

async function seedProblem(client, orgId) {
  const r = await client("POST", "/problems", {
    userId: "admin-a",
    body: {
      organizationId: orgId,
      title: "Reduce patient waiting time in rural healthcare",
      problemStatement: "Rural facilities have long queues and delays.",
      sector: "health",
      estimatedBudget: 1000000,
    },
  });
  assert.equal(r.status, 201, "problem created");
  return r.body;
}

async function seedChallenge(client, orgId, problemId) {
  const r = await client("POST", "/challenges", {
    userId: "admin-a",
    body: {
      organizationId: orgId,
      problemId,
      challengeCode: "SIH26136-CH-001",
      title: "AI-assisted patient flow optimization",
      description: "Optimize patient flow in rural healthcare.",
      budgetMin: 500000,
      budgetMax: 2000000,
      challengeStatus: "APPLICATIONS_OPEN",
    },
  });
  assert.equal(r.status, 201, "challenge created");
  return r.body;
}

async function seedStartup(client, orgId) {
  const r = await client("POST", "/startups", {
    userId: "admin-a",
    body: {
      organizationId: orgId,
      legalName: "Demo HealthAI Technologies Pvt Ltd",
      brandName: "HealthAI",
      dpiitStatus: "REGISTERED",
      gstStatus: "REGISTERED",
      sector: "health",
      isDemo: true,
    },
  });
  assert.equal(r.status, 201, "startup created");
  return r.body;
}

test("1. government problem creation", async () => {
  const { client } = serverCtx;
  const { orgAUUID } = await seedBase(client);
  const problem = await seedProblem(client, orgAUUID);
  assert.ok(problem.body.id);
});

test("2. challenge creation", async () => {
  const { client } = serverCtx;
  const { orgAUUID } = await seedBase(client);
  const problem = await seedProblem(client, orgAUUID);
  const challenge = await seedChallenge(client, orgAUUID, problem.body.id);
  assert.ok(challenge.body.id);
});

test("3. startup registration", async () => {
  const { client } = serverCtx;
  const { orgAUUID } = await seedBase(client);
  const startup = await seedStartup(client, orgAUUID);
  assert.ok(startup.body.id);
});

console.log("All basic tests loaded");