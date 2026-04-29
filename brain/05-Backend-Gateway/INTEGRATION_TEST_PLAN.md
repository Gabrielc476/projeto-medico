# Integration Testing Plan (Dockerized)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Run real integration tests between the Backend Gateway and its dependencies (Postgres & Diagnostic Engine) inside the Docker environment.

**Strategy:** 
- Use **Vitest** for integration tests.
- Point to the real Docker hosts (`postgres:5432` and `diagnostic-engine:50051`).
- Execute tests via `docker-compose exec backend-gateway pnpm test:integration`.

---

### Task 1: Integration Test Configuration
**Files:**
- Create: `backend-gateway/vitest.config.integration.ts`
- Modify: `backend-gateway/package.json`

**Step 1:** Create a Vitest config that targets `**/*.integration.spec.ts` and sets the environment to `node`.
**Step 2:** Add `test:integration` script to `package.json`.
**Step 3:** Commit.

### Task 2: Postgres Integration Test
**Files:**
- Create: `backend-gateway/test/integration/prisma.integration.spec.ts`

**Step 1:** Create a test that uses a real `PrismaService` and `PrismaTriageRepository`.
**Step 2:** Perform CRUD operations on the real Postgres database.
**Step 3:** Ensure clean-up after tests (deleting test records).
**Step 4:** Commit.

### Task 3: Python (gRPC) Integration Test
**Files:**
- Create: `backend-gateway/test/integration/grpc.integration.spec.ts`

**Step 1:** Create a test that uses a real `DiagnosticGrpcClient` pointing to `diagnostic-engine:50051`.
**Step 2:** Verify that `getAppSymptoms()` returns a valid response from the Python engine.
**Step 3:** Commit.

### Task 4: Docker Execution & Verification
**Step 1:** Run `docker-compose exec backend-gateway pnpm test:integration`.
**Step 2:** Fix any connectivity/environment issues found during execution.
**Step 3:** Commit.

---
_Plan complete. Ready to begin Task 1._
