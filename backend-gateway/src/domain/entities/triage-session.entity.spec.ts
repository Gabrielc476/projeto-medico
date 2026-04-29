import { describe, it, expect } from 'vitest';
import { TriageSession, TriageStatus } from './triage-session.entity';

describe('TriageSession', () => {
  it('should create a new triage session with pending status', () => {
    const session = TriageSession.create({
      patientId: 'patient-1',
      symptoms: [],
    });

    expect(session.patientId).toBe('patient-1');
    expect(session.status).toBe(TriageStatus.PENDING);
    expect(session.currentStep).toBe(1);
  });

  it('should transition to IN_PROGRESS when adding symptoms', () => {
    const session = TriageSession.create({
      patientId: 'patient-1',
      symptoms: [],
    });

    session.nextStep(['symptom-1']);

    expect(session.status).toBe(TriageStatus.IN_PROGRESS);
    expect(session.currentStep).toBe(2);
    expect(session.toJSON().symptoms).toContain('symptom-1');
  });

  it('should transition to COMPLETED when finished', () => {
    const session = TriageSession.create({
      patientId: 'patient-1',
      symptoms: [],
    });

    session.complete();

    expect(session.status).toBe(TriageStatus.COMPLETED);
  });
});
