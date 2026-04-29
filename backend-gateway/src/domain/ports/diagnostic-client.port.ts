import { Observable } from 'rxjs';
import { type AppSymptomResponse } from '../types/diagnostic';

export abstract class IDiagnosticClient {
  abstract getAppSymptoms(): Observable<AppSymptomResponse>;
}
