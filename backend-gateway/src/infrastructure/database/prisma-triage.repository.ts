import { Injectable } from '@nestjs/common';
import { ITriageRepository } from '../../domain/ports/triage-repository.port';
import { TriageSession } from '../../domain/entities/triage-session.entity';
import { PrismaService } from './prisma.service';
import { type TriageSession as PrismaTriageSessionModel } from '@prisma/client';

@Injectable()
export class PrismaTriageRepository implements ITriageRepository {
  constructor(private prisma: PrismaService) {}

  async save(session: TriageSession): Promise<void> {
    const data = session.toJSON();
    
    await this.prisma.triageSession.upsert({
      where: { id: data.id || '' },
      update: {
        status: data.status,
        currentStep: data.currentStep,
        symptoms: data.symptoms,
        updatedAt: data.updatedAt,
      },
      create: {
        id: data.id as string,
        patientId: data.patientId,
        status: data.status,
        currentStep: data.currentStep,
        symptoms: data.symptoms,
      },
    });
  }

  async findById(id: string): Promise<TriageSession | null> {
    const model = await this.prisma.triageSession.findUnique({
      where: { id },
    });

    if (!model) return null;

    return this.toEntity(model);
  }

  async findByPatientId(patientId: string): Promise<TriageSession[]> {
    const models = await this.prisma.triageSession.findMany({
      where: { patientId },
    });

    return models.map((m) => this.toEntity(m));
  }

  private toEntity(model: PrismaTriageSessionModel): TriageSession {
    return TriageSession.create({
      patientId: model.patientId,
      symptoms: model.symptoms,
    }, model.id);
  }
}
