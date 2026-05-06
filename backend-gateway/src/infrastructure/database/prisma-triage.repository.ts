import { Injectable } from '@nestjs/common';
import { ITriageRepository } from '../../domain/ports/triage-repository.port';
import { TriageSession, TriageStatus } from '../../domain/entities/triage-session.entity';
import { PrismaService } from './prisma.service';
import { type TriageSession as PrismaTriageModel } from '@prisma/client';

@Injectable()
export class PrismaTriageRepository implements ITriageRepository {
  constructor(private prisma: PrismaService) {}

  async save(session: TriageSession): Promise<void> {
    const data = session.toJSON();
    
    await this.prisma.triageSession.upsert({
      where: { id: data.id },
      update: {
        status: data.status,
        currentStep: data.currentStep,
        symptoms: data.symptoms,
        contextualFactors: data.contextualFactors,
        examUrl: data.examUrl || null,
        diagnosticResult: data.diagnosticResult ? JSON.parse(JSON.stringify(data.diagnosticResult)) : null,
        updatedAt: data.updatedAt,
      },
      create: {
        id: data.id,
        patientId: data.patientId,
        status: data.status,
        currentStep: data.currentStep,
        symptoms: data.symptoms,
        contextualFactors: data.contextualFactors,
        examUrl: data.examUrl || null,
        diagnosticResult: data.diagnosticResult ? JSON.parse(JSON.stringify(data.diagnosticResult)) : null,
        createdAt: data.createdAt,
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
      orderBy: { createdAt: 'desc' },
    });
    return models.map(m => this.toEntity(m));
  }

  async createSession(patientId: string): Promise<TriageSession> {
    const session = TriageSession.create({
      patientId,
      symptoms: [],
    });
    
    await this.save(session);
    return session;
  }

  async updateSessionSymptoms(sessionId: string, symptoms: string[]): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    session.setSymptoms(symptoms);
    await this.save(session);
  }

  async updateSessionContext(sessionId: string, factors: string[]): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    session.addContextualFactors(factors);
    await this.save(session);
  }

  async updateSessionExamUrl(sessionId: string, examUrl: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    session.setExamUrl(examUrl);
    await this.save(session);
  }

  private toEntity(model: PrismaTriageModel): TriageSession {
    const session = TriageSession.create({
      patientId: model.patientId,
      symptoms: model.symptoms,
    }, model.id);

    // Reflection bypass for strict private props that Prisma has
    (session as any).props.status = model.status as TriageStatus;
    (session as any).props.currentStep = model.currentStep;
    (session as any).props.contextualFactors = model.contextualFactors;
    (session as any).props.examUrl = model.examUrl;
    (session as any).props.diagnosticResult = model.diagnosticResult;
    (session as any).props.createdAt = model.createdAt;
    (session as any).props.updatedAt = model.updatedAt;

    return session;
  }
}
