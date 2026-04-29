# NestJS Medical Gateway Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready API Gateway with Clean Architecture, gRPC integration with the Python engine, and in-memory caching for layman symptoms.

**Architecture:** Strict Clean Architecture with Domain-Driven Design. The Gateway acts as an orchestrator between the Mobile App and the Bayesian engine.
**Tech Stack:** NestJS, TypeScript, Pnpm, gRPC, Biome, Prisma, Docker.

---

### Task 1: Shared gRPC Contract
**Files:**
- Create: `shared/proto/diagnostic.proto`
- Modify: `diagnostic-engine/scripts/compile_proto.py`
- Modify: `diagnostic-engine/src/api_grpc/diagnostic_service.py`

**Step 1:** Create `shared/proto/` and move `diagnostic-engine/proto/diagnostic.proto`.
**Step 2:** Update Python build scripts to reference the new path.
**Step 3:** Commit.

### Task 2: NestJS Project Bootstrap
**Files:**
- Create: `backend-gateway/` (NestJS structure)
- Create: `backend-gateway/biome.json`
- Modify: `backend-gateway/tsconfig.json`

**Step 1:** Run `npx nest new backend-gateway --package-manager pnpm`.
**Step 2:** Configure Biome and Strict TypeScript settings.
**Step 3:** Verify with `pnpm run lint`.
**Step 4:** Commit.

### Task 3: Dockerization
**Files:**
- Create: `backend-gateway/Dockerfile`
- Modify: `docker-compose.yml`

**Step 1:** Create multi-stage Dockerfile for NestJS.
**Step 2:** Add `backend-gateway` service to the root `docker-compose.yml`.
**Step 3:** Test build: `docker-compose build backend-gateway`.
**Step 4:** Commit.

### Task 4: Domain Layer Implementation
**Files:**
- Create: `backend-gateway/src/domain/entities/triage-session.entity.ts`
- Create: `backend-gateway/src/domain/value-objects/raw-symptom.vo.ts`
- Create: `backend-gateway/src/domain/value-objects/ranked-disease.vo.ts`

**Step 1:** Implement `TriageSession` as Aggregate Root with status state machine.
**Step 2:** Implement `RawSymptom` and `AppSymptom` value objects.
**Step 3:** Commit.

### Task 5: gRPC Infrastructure
**Files:**
- Create: `backend-gateway/src/infrastructure/grpc/diagnostic-engine.client.ts`
- Modify: `backend-gateway/src/app.module.ts`

**Step 1:** Install `@grpc/grpc-js`, `@grpc/proto-loader`.
**Step 2:** Implement the gRPC client module in NestJS.
**Step 3:** Commit.

### Task 6: In-Memory Symptom Cache
**Files:**
- Create: `backend-gateway/src/infrastructure/cache/in-memory-symptom.cache.ts`
- Create: `backend-gateway/src/application/ports/symptom-cache.port.ts`

**Step 1:** Implement `ISymptomCache` using a simple Map with TTL or `cache-manager`.
**Step 2:** Commit.

### Task 7: Symptom Sync Use Case
**Files:**
- Create: `backend-gateway/src/application/use-cases/sync-symptom-dictionary.use-case.ts`

**Step 1:** Implement logic to call `GetAppSymptoms` and populate the cache.
**Step 2:** Commit.

### Task 8: Presentation Layer (Controllers)
**Files:**
- Create: `backend-gateway/src/presentation/http/triage.controller.ts`
- Create: `backend-gateway/src/presentation/http/symptom.controller.ts`

**Step 1:** Implement REST endpoints for starting triage and getting symptoms.
**Step 2:** Verify end-to-end flow with a mock gRPC server if needed.
**Step 3:** Commit.

---
_Plan complete and saved to brain/05-Backend-Gateway/PLAN.md. Ready for subagent-driven execution._
