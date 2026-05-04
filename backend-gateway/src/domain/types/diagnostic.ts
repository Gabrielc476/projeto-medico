import { Observable } from 'rxjs';

export interface AppSymptomResponse {
  symptoms: {
    cui: string;
    clinical_name: string;
    layman_term: string;
  }[];
}

export interface DiagnosticService {
  getAppSymptoms(request: { language?: string }): Observable<AppSymptomResponse>;
  assessSymptoms(request: { symptoms: any[], contextual_factors: any[] }): Observable<any>;
}
