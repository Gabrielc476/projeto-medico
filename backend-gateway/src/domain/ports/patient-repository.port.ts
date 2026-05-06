import { Patient } from "../entities/patient.entity";

export abstract class IPatientRepository {
	abstract findByEmail(email: string): Promise<Patient | null>;
	abstract findById(id: string): Promise<Patient | null>;
	abstract save(patient: Patient): Promise<Patient>;
}
