import { Observable } from 'rxjs';
import { type AppSymptomResponse } from '../types/diagnostic';

export abstract class IDiagnosticClient {
  abstract getAppSymptoms(language?: string): Observable<AppSymptomResponse>;
  abstract assessSymptoms(symptoms: any[], contextualFactors: any[]): Observable<any>;
}
