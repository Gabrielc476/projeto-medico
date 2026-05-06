import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { PrismaTriageRepository } from "./prisma-triage.repository";
import { PrismaPatientRepository } from "./prisma-patient.repository";
import { ITriageRepository } from "../../domain/ports/triage-repository.port";
import { IPatientRepository } from "../../domain/ports/patient-repository.port";

@Module({
	providers: [
		PrismaService,
		{
			provide: ITriageRepository,
			useClass: PrismaTriageRepository,
		},
		{
			provide: IPatientRepository,
			useClass: PrismaPatientRepository,
		},
	],
	exports: [PrismaService, ITriageRepository, IPatientRepository],
})
export class DatabaseModule {}
