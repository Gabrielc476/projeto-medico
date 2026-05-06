import { Injectable } from "@nestjs/common";
import { IPatientRepository } from "../../domain/ports/patient-repository.port";
import { Patient } from "../../domain/entities/patient.entity";
import { PrismaService } from "./prisma.service";
import { type Patient as PrismaPatientModel } from "@prisma/client";

@Injectable()
export class PrismaPatientRepository implements IPatientRepository {
	constructor(private prisma: PrismaService) {}

	async findByEmail(email: string): Promise<Patient | null> {
		const model = await this.prisma.patient.findUnique({
			where: { email },
		});
		if (!model) return null;
		return this.toEntity(model);
	}

	async findById(id: string): Promise<Patient | null> {
		const model = await this.prisma.patient.findUnique({
			where: { id },
		});
		if (!model) return null;
		return this.toEntity(model);
	}

	async save(patient: Patient): Promise<Patient> {
		const data = patient.toJSON();

		const model = await this.prisma.patient.upsert({
			where: { id: data.id },
			update: {
				name: data.name,
				email: data.email,
				password: data.passwordHash,
				updatedAt: data.updatedAt,
			},
			create: {
				id: data.id,
				name: data.name,
				email: data.email,
				password: data.passwordHash,
				createdAt: data.createdAt,
			},
		});

		return this.toEntity(model);
	}

	private toEntity(model: PrismaPatientModel): Patient {
		return Patient.create(
			{
				name: model.name,
				email: model.email,
				passwordHash: model.password,
				createdAt: model.createdAt,
				updatedAt: model.updatedAt,
			},
			model.id,
		);
	}
}
