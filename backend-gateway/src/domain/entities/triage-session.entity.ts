import { randomUUID } from 'crypto';
import { createActor } from 'xstate';
import { triageMachine } from '../machines/triage.machine';
import { TriageStatus } from '@prisma/client';
export { TriageStatus };

export interface TriageSessionProps {
  patientId: string;
  status: TriageStatus;
  currentStep: number;
  symptoms: string[]; // List of symptom CUIs or IDs
  contextualFactors: string[]; // List of extracted context/risk factors
  examUrl?: string | null;
  diagnosticResult?: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TriageSession {
  private constructor(private props: TriageSessionProps, private _id: string) {}

  public static create(props: Omit<TriageSessionProps, 'createdAt' | 'updatedAt' | 'status' | 'currentStep' | 'contextualFactors' | 'examUrl' | 'diagnosticResult'>, id?: string): TriageSession {
    return new TriageSession({
      ...props,
      status: TriageStatus.EXAM_COLLECTION,
      currentStep: 1,
      symptoms: props.symptoms || [],
      contextualFactors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id ?? randomUUID());
  }

  get id(): string {
    return this._id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get status(): TriageStatus {
    return this.props.status;
  }

  get currentStep(): number {
    return this.props.currentStep;
  }

  get symptoms(): string[] {
    return this.props.symptoms;
  }

  get contextualFactors(): string[] {
    return this.props.contextualFactors;
  }

  get examUrl(): string | null | undefined {
    return this.props.examUrl;
  }

  get diagnosticResult(): any | null | undefined {
    return this.props.diagnosticResult;
  }

  public transition(eventName: 'UPLOAD_EXAM' | 'SKIP_EXAM' | 'EXTRACT_CONTEXT' | 'SKIP_CONTEXT' | 'SUBMIT_SYMPTOMS' | 'DIAGNOSE' | 'CANCEL'): void {
    const actor = createActor(triageMachine, { 
      state: triageMachine.resolveState({ value: this.props.status }) 
    });
    actor.start();
    
    const snapshot = actor.getSnapshot();
    if (!snapshot.can({ type: eventName })) {
      throw new Error(`Invalid transition: Cannot send ${eventName} in state ${this.props.status}`);
    }
    
    actor.send({ type: eventName });
    const nextSnapshot = actor.getSnapshot();
    
    this.props.status = nextSnapshot.value as TriageStatus;
    this.props.updatedAt = new Date();
  }

  public addContextualFactors(factors: string[]): void {
    this.props.contextualFactors = Array.from(new Set([...this.props.contextualFactors, ...factors]));
    this.props.updatedAt = new Date();
  }

  public setSymptoms(symptoms: string[]): void {
    this.props.symptoms = Array.from(new Set([...this.props.symptoms, ...symptoms]));
    this.props.updatedAt = new Date();
  }

  public setExamUrl(url: string): void {
    this.props.examUrl = url;
    this.props.updatedAt = new Date();
  }

  public setDiagnosticResult(result: any): void {
    this.props.diagnosticResult = result;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this._id,
      ...this.props,
    };
  }
}
