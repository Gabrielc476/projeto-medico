export interface AppSymptom {
  cui: string;
  clinicalName: string;
  laymanTerm: string;
}

export abstract class ISymptomCache {
  abstract get(cui: string): Promise<AppSymptom | undefined>;
  abstract set(cui: string, symptom: AppSymptom): Promise<void>;
  abstract getAll(): Promise<AppSymptom[]>;
  abstract clear(): Promise<void>;
}
