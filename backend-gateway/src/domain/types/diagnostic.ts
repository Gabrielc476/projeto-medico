import { Observable } from 'rxjs';

export interface AppSymptomResponse {
  symptoms: {
    cui: string;
    clinical_name: string;
    layman_term: string;
    body_region?: string;
  }[];
}

export interface ExtractedFeature {
  cui: string;
  name: string;
  is_present: boolean;
}

export interface ContextExtractionResponse {
  features: ExtractedFeature[];
}

export interface RankedDiseaseResult {
  disease_id: string;
  disease_name: string;
  posterior_probability: number;
  likelihood_ratio_positive: number;
  likelihood_ratio_negative: number;
  tf_idf_score: number;
}

export interface SymptomAssessmentResponse {
  ranked_diseases: RankedDiseaseResult[];
}

export interface DiagnosticService {
  getAppSymptoms(request: { language?: string }): Observable<AppSymptomResponse>;
  assessSymptoms(request: { symptoms: ExtractedFeature[], contextual_factors: ExtractedFeature[] }): Observable<SymptomAssessmentResponse>;
  extractContext(request: { free_text: string }): Observable<ContextExtractionResponse>;
  extractExam(request: { pdf_content: Buffer }): Observable<ContextExtractionResponse>;
}

