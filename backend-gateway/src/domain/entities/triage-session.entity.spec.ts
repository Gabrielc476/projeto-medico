import { describe, it, expect } from 'vitest';
import { TriageSession, TriageStatus } from './triage-session.entity';

describe('TriageSession', () => {
  it('should create a new triage session with EXAM_COLLECTION status', () => {
    const session = TriageSession.create({
      patientId: 'patient-1',
      symptoms: [],
    });

    expect(session.patientId).toBe('patient-1');
    expect(session.status).toBe(TriageStatus.EXAM_COLLECTION);
    expect(session.currentStep).toBe(1);
    expect(session.symptoms).toEqual([]);
    expect(session.contextualFactors).toEqual([]);
  });

  it('should transition through states successfully', () => {
    const session = TriageSession.create({
      patientId: 'patient-1',
      symptoms: [],
    });

    expect(session.status).toBe(TriageStatus.EXAM_COLLECTION);

    // Transition: EXAM_COLLECTION -> CONTEXT_COLLECTION
    session.transition('UPLOAD_EXAM');
    expect(session.status).toBe(TriageStatus.CONTEXT_COLLECTION);

    // Add some factors and transition: CONTEXT_COLLECTION -> SYMPTOM_MAPPING
    session.addContextualFactors(['asthma', 'smoker']);
    session.transition('EXTRACT_CONTEXT');
    expect(session.status).toBe(TriageStatus.SYMPTOM_MAPPING);
    expect(session.contextualFactors).toContain('asthma');
    expect(session.contextualFactors).toContain('smoker');

    // Add symptoms and transition: SYMPTOM_MAPPING -> READY_FOR_DIAGNOSIS
    session.setSymptoms(['C0039231']);
    session.transition('SUBMIT_SYMPTOMS');
    expect(session.status).toBe(TriageStatus.READY_FOR_DIAGNOSIS);
    expect(session.symptoms).toContain('C0039231');

    // Transition: READY_FOR_DIAGNOSIS -> COMPLETED
    session.transition('DIAGNOSE');
    expect(session.status).toBe(TriageStatus.COMPLETED);
  });

  it('should support alternative path skipping exams/context and cancelling', () => {
    const session = TriageSession.create({
      patientId: 'patient-1',
      symptoms: [],
    });

    // EXAM_COLLECTION -> CONTEXT_COLLECTION (skip exam)
    session.transition('SKIP_EXAM');
    expect(session.status).toBe(TriageStatus.CONTEXT_COLLECTION);

    // CONTEXT_COLLECTION -> SYMPTOM_MAPPING (skip context)
    session.transition('SKIP_CONTEXT');
    expect(session.status).toBe(TriageStatus.SYMPTOM_MAPPING);

    // CANCEL from SYMPTOM_MAPPING
    session.transition('CANCEL');
    expect(session.status).toBe(TriageStatus.CANCELLED);
  });

  it('should throw an error on invalid transitions', () => {
    const session = TriageSession.create({
      patientId: 'patient-1',
      symptoms: [],
    });

    // Cannot run DIAGNOSE in EXAM_COLLECTION state
    expect(() => session.transition('DIAGNOSE')).toThrowError(
      'Invalid transition: Cannot send DIAGNOSE in state EXAM_COLLECTION'
    );
  });
});
