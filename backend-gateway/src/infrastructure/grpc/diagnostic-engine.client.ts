import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { type Observable } from 'rxjs';

import {
  type DiagnosticService,
  type AppSymptomResponse,
  type ContextExtractionResponse,
  type ExtractedFeature,
  type SymptomAssessmentResponse,
} from '../../domain/types/diagnostic';
import { IDiagnosticClient } from '../../domain/ports/diagnostic-client.port';

@Injectable()
export class DiagnosticGrpcClient implements OnModuleInit, IDiagnosticClient {
  private diagnosticService!: DiagnosticService;

  constructor(@Inject('DIAGNOSTIC_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.diagnosticService = this.client.getService<DiagnosticService>('DiagnosticService');
  }

  getAppSymptoms(language?: string): Observable<AppSymptomResponse> {
    return this.diagnosticService.getAppSymptoms({ language });
  }

  assessSymptoms(symptoms: ExtractedFeature[], contextualFactors: ExtractedFeature[]): Observable<SymptomAssessmentResponse> {
    return this.diagnosticService.assessSymptoms({
      symptoms,
      contextual_factors: contextualFactors,
    });
  }

  extractContext(freeText: string): Observable<ContextExtractionResponse> {
    return this.diagnosticService.extractContext({
      free_text: freeText,
    });
  }

  extractExam(pdfContent: Buffer): Observable<ContextExtractionResponse> {
    return this.diagnosticService.extractExam({
      pdf_content: pdfContent,
    });
  }
}

