import { randomUUID } from 'crypto';

export interface PatientProps {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Patient {
  private constructor(private props: PatientProps, private _id: string) {}

  public static create(
    props: Omit<PatientProps, 'createdAt' | 'updatedAt'> & Partial<Pick<PatientProps, 'createdAt' | 'updatedAt'>>,
    id?: string,
  ): Patient {
    return new Patient(
      {
        ...props,
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || new Date(),
      },
      id ?? randomUUID(),
    );
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }
  
  get createdAt(): Date {
    return this.props.createdAt;
  }
  
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public toJSON() {
    return {
      id: this._id,
      ...this.props,
    };
  }
}
