import { TriageSession } from '../entities/triage-session.entity';

export abstract class ITriageRepository {
  abstract save(session: TriageSession): Promise<void>;
  abstract findById(id: string): Promise<TriageSession | null>;
  abstract findByPatientId(patientId: string): Promise<TriageSession[]>;
  abstract createSession(patientId: string): Promise<TriageSession>;
  abstract updateSessionSymptoms(sessionId: string, symptoms: string[]): Promise<void>;
}

