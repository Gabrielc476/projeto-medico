import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';

import { DiagnosticService } from '../../domain/types/diagnostic';
import { IDiagnosticClient } from '../../domain/ports/diagnostic-client.port';

@Injectable()
export class DiagnosticGrpcClient implements OnModuleInit, IDiagnosticClient {
  private diagnosticService!: DiagnosticService;

  constructor(@Inject('DIAGNOSTIC_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.diagnosticService = this.client.getService<DiagnosticService>('DiagnosticService');
  }

  getAppSymptoms(language?: string) {
    return this.diagnosticService.getAppSymptoms({ language });
  }

  assessSymptoms(symptoms: any[], contextualFactors: any[]) {
    return this.diagnosticService.assessSymptoms({
      symptoms,
      contextual_factors: contextualFactors,
    });
  }
}
