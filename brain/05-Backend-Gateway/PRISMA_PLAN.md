# Prisma Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement database persistence for Triage Sessions and Patients using Prisma ORM and PostgreSQL.

**Architecture:** 
- **Domain Layer:** Define Repository Interfaces (Ports).
- **Infrastructure Layer:** Implement Repositories using Prisma.
- **Persistence Layer:** Prisma Schema and Migrations.

---

### Task 1: Prisma Initialization
**Files:**
- Create: `backend-gateway/prisma/schema.prisma`
- Create: `backend-gateway/.env`

**Step 1:** Run `npx prisma init`.
**Step 2:** Configure `DATABASE_URL` in `.env` using Docker values:
  - `DATABASE_URL="postgresql://admin:medical123@postgres:5432/medical_ehr?schema=public"`
**Step 3:** Commit.

### Task 2: Database Schema Design
**Files:**
- Modify: `backend-gateway/prisma/schema.prisma`

**Step 1:** Define `Patient` model (id, name, etc).
**Step 2:** Define `TriageSession` model (id, status, patientId, currentStep, symptoms).
**Step 3:** Run `npx prisma migrate dev --name init_medical_tables`.
**Step 4:** Commit.

### Task 3: Repository Port Definition
**Files:**
- Create: `backend-gateway/src/domain/ports/triage-repository.port.ts`

**Step 1:** Define `ITriageRepository` with methods: `save`, `findById`, `findByPatientId`.
**Step 2:** Commit.

### Task 4: Repository Implementation
**Files:**
- Create: `backend-gateway/src/infrastructure/database/prisma-triage.repository.ts`
- Create: `backend-gateway/src/infrastructure/database/database.module.ts`

**Step 1:** Implement `PrismaTriageRepository` using PrismaClient.
**Step 2:** Map between Prisma Models and Domain Entities.
**Step 3:** Commit.

### Task 5: Integration and Injection
**Files:**
- Modify: `backend-gateway/src/infrastructure/infrastructure.module.ts`

**Step 1:** Provide `ITriageRepository` using `PrismaTriageRepository`.
**Step 2:** Commit.

---
_Plan complete. Ready to begin Task 1._
