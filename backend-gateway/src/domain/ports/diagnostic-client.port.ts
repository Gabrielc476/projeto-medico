import { Observable } from 'rxjs';
import {
  type AppSymptomResponse,
  type ContextExtractionResponse,
  type ExtractedFeature,
  type SymptomAssessmentResponse,
} from '../types/diagnostic';

export abstract class IDiagnosticClient {
  abstract getAppSymptoms(language?: string): Observable<AppSymptomResponse>;
  abstract assessSymptoms(symptoms: ExtractedFeature[], contextualFactors: ExtractedFeature[]): Observable<SymptomAssessmentResponse>;
  abstract extractContext(freeText: string): Observable<ContextExtractionResponse>;
  abstract extractExam(pdfContent: Buffer): Observable<ContextExtractionResponse>;
}

