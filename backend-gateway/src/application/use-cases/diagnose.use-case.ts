import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IDiagnosticClient } from '../../domain/ports/diagnostic-client.port';
import { ITriageRepository } from '../../domain/ports/triage-repository.port';
import { KafkaService } from '../../infrastructure/messaging/kafka.service';
import { firstValueFrom, timeout } from 'rxjs';
import { type ExtractedFeature, type SymptomAssessmentResponse } from '../../domain/types/diagnostic';

@Injectable()
export class DiagnoseUseCase {
  private readonly logger = new Logger(DiagnoseUseCase.name);

  constructor(
    private readonly diagnosticClient: IDiagnosticClient,
    private readonly triageRepository: ITriageRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async execute(sessionId: string): Promise<SymptomAssessmentResponse> {
    this.logger.log(`Processing diagnosis for session: ${sessionId}`);

    const session = await this.triageRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Triage session ${sessionId} not found`);
    }

    // Transit to COMPLETED
    session.transition('DIAGNOSE');

    // Load data from session
    const symptoms: ExtractedFeature[] = (session.symptoms || []).map(cui => ({
      cui,
      name: cui,
      is_present: true
    }));

    const contextualFactors: ExtractedFeature[] = (session.contextualFactors || []).map(cui => ({
      cui,
      name: cui,
      is_present: true
    }));

    try {
      // Call the diagnostic engine via gRPC with timeout
      const result = await firstValueFrom(
        this.diagnosticClient.assessSymptoms(symptoms, contextualFactors).pipe(
          timeout(30000), // 30s timeout
        ),
      );

      // Save diagnostic result
      session.setDiagnosticResult(result.ranked_diseases);

      // Save updated session status
      await this.triageRepository.save(session);

      this.logger.log(`Diagnosis completed for session: ${sessionId}`);
      
      // Publish event to Kafka
      await this.kafkaService.emit('triage.completed', {
        sessionId,
        patientId: session.patientId,
        diagnosis: result.ranked_diseases,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to diagnose session ${sessionId}`, error);
      throw error;
    }
  }
}
