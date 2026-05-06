export interface StartTriageDto {
  notes?: string;
}

export interface SymptomDto {
  cui: string;
  name: string;
}

export interface ContextualFactorDto {
  type: string;
  value: string;
}

export interface DiagnoseTriageDto {
  symptoms: SymptomDto[];
  contextualFactors: ContextualFactorDto[];
}

export interface TriageSession {
  id: string;
  patientId: string;
  status: string;
  examUrl?: string;
  contextualFactors?: string[];
  diagnosticResult?: RankedDisease[];
}

export interface RankedDisease {
  diseaseId: string;
  name: string;
  probability: number;
  score: number;
  explanation: string;
}

export interface RegisterPatientDto {
  name: string;
  email: string;
  password?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

