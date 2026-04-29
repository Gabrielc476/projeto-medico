export enum TriageStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface TriageSessionProps {
  patientId: string;
  status: TriageStatus;
  currentStep: number;
  symptoms: string[]; // List of symptom CUIs or IDs
  createdAt: Date;
  updatedAt: Date;
}

export class TriageSession {
  private constructor(private props: TriageSessionProps, private _id?: string) {}

  public static create(props: Omit<TriageSessionProps, 'createdAt' | 'updatedAt' | 'status' | 'currentStep'>, id?: string): TriageSession {
    return new TriageSession({
      ...props,
      status: TriageStatus.PENDING,
      currentStep: 1,
      symptoms: props.symptoms || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }

  get id(): string | undefined {
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

  public nextStep(symptoms: string[]): void {
    this.props.symptoms = [...this.props.symptoms, ...symptoms];
    this.props.currentStep += 1;
    this.props.status = TriageStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  public complete(): void {
    this.props.status = TriageStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this._id,
      ...this.props,
    };
  }
}
