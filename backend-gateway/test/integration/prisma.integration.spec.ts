import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { PrismaTriageRepository } from '../../src/infrastructure/database/prisma-triage.repository';
import { TriageSession } from '../../src/domain/entities/triage-session.entity';

describe('PrismaTriageRepository (Integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaTriageRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaTriageRepository(prisma);
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.triageSession.deleteMany({
      where: { patientId: 'test-patient-integration' }
    });
    await prisma.patient.deleteMany({
      where: { id: 'test-patient-integration' }
    });
    await prisma.$disconnect();
  });

  it('should save and retrieve a triage session from the real database', async () => {
    // 1. Create a patient first (foreign key requirement)
    await prisma.patient.create({
      data: {
        id: 'test-patient-integration',
        name: 'Test Integration Patient',
      }
    });

    const session = TriageSession.create({
      patientId: 'test-patient-integration',
      symptoms: ['C001', 'C002'],
    }, 'test-session-integration');

    // 2. Save
    await repository.save(session);

    // 3. Find
    const found = await repository.findById('test-session-integration');

    expect(found).not.toBeNull();
    expect(found?.patientId).toBe('test-patient-integration');
    expect(found?.toJSON().symptoms).toEqual(['C001', 'C002']);
  });
});
