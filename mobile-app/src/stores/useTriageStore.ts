import { create } from "zustand";
import { SymptomDto, ContextualFactorDto, RankedDisease } from "../types";

interface TriageState {
  sessionId: string | null;
  currentStatus: string | null;
  uploadedExamPath: string | null;
  extractedFeatures: string[];
  contextText: string;
  selectedSymptoms: SymptomDto[];
  contextualFactors: ContextualFactorDto[];
  diagnosisResult: RankedDisease[] | null;
  loading: boolean;
  error: string | null;

  // Actions
  setSessionId: (id: string | null) => void;
  setCurrentStatus: (status: string | null) => void;
  setUploadedExamPath: (path: string | null) => void;
  setExtractedFeatures: (features: string[]) => void;
  setContextText: (text: string) => void;
  setSelectedSymptoms: (symptoms: SymptomDto[]) => void;
  addSymptom: (symptom: SymptomDto) => void;
  removeSymptom: (cui: string) => void;
  setContextualFactors: (factors: ContextualFactorDto[]) => void;
  setDiagnosisResult: (diagnosis: RankedDisease[] | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

const initialValues = {
  sessionId: null,
  currentStatus: null,
  uploadedExamPath: null,
  extractedFeatures: [],
  contextText: "",
  selectedSymptoms: [],
  contextualFactors: [],
  diagnosisResult: null,
  loading: false,
  error: null,
};

export const useTriageStore = create<TriageState>((set) => ({
  ...initialValues,

  setSessionId: (id) => set({ sessionId: id }),
  setCurrentStatus: (status) => set({ currentStatus: status }),
  setUploadedExamPath: (path) => set({ uploadedExamPath: path }),
  setExtractedFeatures: (features) => set({ extractedFeatures: features }),
  setContextText: (text) => set({ contextText: text }),
  setSelectedSymptoms: (symptoms) => set({ selectedSymptoms: symptoms }),
  addSymptom: (symptom) =>
    set((state) => {
      if (state.selectedSymptoms.some((s) => s.cui === symptom.cui)) {
        return {};
      }
      return { selectedSymptoms: [...state.selectedSymptoms, symptom] };
    }),
  removeSymptom: (cui) =>
    set((state) => ({
      selectedSymptoms: state.selectedSymptoms.filter((s) => s.cui !== cui),
    })),
  setContextualFactors: (factors) => set({ contextualFactors: factors }),
  setDiagnosisResult: (diagnosis) => set({ diagnosisResult: diagnosis }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetStore: () => set({ ...initialValues }),
}));
