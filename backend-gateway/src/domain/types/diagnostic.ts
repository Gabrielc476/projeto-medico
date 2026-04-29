import { Observable } from 'rxjs';

export interface AppSymptomResponse {
  symptoms: {
    cui: string;
    clinicalName: string;
    laymanTerm: string;
  }[];
}

export interface DiagnosticService {
  getAppSymptoms(request: {}): Observable<AppSymptomResponse>;
  // Add other methods as needed from diagnostic.proto
}
