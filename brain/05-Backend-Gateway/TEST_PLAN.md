# Backend Gateway Testing Strategy & Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish a robust testing suite for the NestJS Gateway using Vitest, covering unit, integration, and E2E scenarios.

**Architecture:** 
- **Unit Tests:** Isolated testing of Domain Entities and Value Objects (No NestJS overhead).
- **Application Tests:** Use Case testing with mocked Ports (IDiagnosticClient, ISymptomCache).
- **Integration/E2E Tests:** Testing Controllers and gRPC communication using `supertest` and Vitest.

**Tech Stack:** Vitest, @nestjs/testing, supertest, ts-mockito (or simple Vitest mocks).

---

### Task 1: Vitest Configuration
**Files:**
- Create: `backend-gateway/vitest.config.ts`
- Create: `backend-gateway/vitest.config.e2e.ts`

**Step 1:** Configure Vitest to handle NestJS decorators and TypeScript paths.
**Step 2:** Setup code coverage thresholds (target 80%+).
**Step 3:** Commit.

### Task 2: Domain Unit Tests
**Files:**
- Create: `backend-gateway/src/domain/entities/triage-session.entity.spec.ts`
- Create: `backend-gateway/src/domain/value-objects/raw-symptom.vo.spec.ts`

**Step 1:** Test `TriageSession` state machine (PENDING -> IN_PROGRESS -> COMPLETED).
**Step 2:** Test validation logic in Value Objects.
**Step 3:** Run `pnpm test`.
**Step 4:** Commit.

### Task 3: Application Use Case Tests (Mocked)
**Files:**
- Create: `backend-gateway/src/application/use-cases/sync-symptom-dictionary.use-case.spec.ts`

**Step 1:** Create mock implementations for `IDiagnosticClient` and `ISymptomCache`.
**Step 2:** Verify `SyncSymptomDictionaryUseCase` orchestrates the sync correctly and handles gRPC failures.
**Step 3:** Commit.

### Task 4: Infrastructure Integration Tests
**Files:**
- Create: `backend-gateway/src/infrastructure/cache/in-memory-symptom.cache.spec.ts`

**Step 1:** Test `InMemorySymptomCache` with `cache-manager` to ensure TTL and data retrieval work.
**Step 2:** Commit.

### Task 5: Presentation E2E Tests
**Files:**
- Create: `backend-gateway/test/symptoms.e2e-spec.ts`

**Step 1:** Use `supertest` to hit `/symptoms` and `/symptoms/sync` endpoints.
**Step 2:** Mock the entire `DiagnosticGrpcClient` to avoid real network calls during E2E.
**Step 3:** Verify HTTP status codes and response structures.
**Step 4:** Commit.

---
_Plan complete. Ready to begin Task 1._
