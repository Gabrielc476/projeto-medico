import { api, getApiUrl } from "./api";
import { TriageSession, SymptomDto, ContextualFactorDto, RankedDisease } from "../types";

export const triageService = {
  async startTriage(notes?: string): Promise<{ sessionId: string; status: string }> {
    const response = await api.post<{ sessionId: string; status: string }>("/triage/start", { notes });
    return response.data;
  },

  async getSymptomsByRegion(region: string): Promise<SymptomDto[]> {
    const response = await api.get<any[]>(`/symptoms`, { params: { region } });
    return response.data.map((item) => ({
      cui: item.cui,
      name: item.laymanTerm || item.clinicalName,
    }));
  },

  async skipExam(sessionId: string): Promise<{ sessionId: string; status: string }> {
    const response = await api.post<{ sessionId: string; status: string }>(`/triage/${sessionId}/skip-exam`, {});
    return response.data;
  },

  async skipContext(sessionId: string): Promise<{ sessionId: string; status: string }> {
    const response = await api.post<{ sessionId: string; status: string }>(`/triage/${sessionId}/skip-context`, {});
    return response.data;
  },

  async extractContext(sessionId: string, text: string): Promise<{ sessionId: string; features: string[] }> {
    const response = await api.post<{ sessionId: string; features: string[] }>(`/triage/${sessionId}/context`, { text });
    return response.data;
  },

  async submitSymptoms(
    sessionId: string,
    symptoms: SymptomDto[],
    contextualFactors: ContextualFactorDto[] = []
  ): Promise<{ sessionId: string; status: string }> {
    const response = await api.post<{ sessionId: string; status: string }>(`/triage/${sessionId}/symptoms`, {
      symptoms,
      contextualFactors,
    });
    return response.data;
  },

  async diagnose(sessionId: string): Promise<{ sessionId: string; diagnosis: RankedDisease[] }> {
    const response = await api.post<{ sessionId: string; diagnosis: RankedDisease[] }>(`/triage/${sessionId}/diagnose`, {});
    return response.data;
  },

  async getStatus(sessionId: string): Promise<TriageSession> {
    const response = await api.get<TriageSession>(`/triage/${sessionId}`);
    return response.data;
  },

  async uploadExam(sessionId: string, filePath: string): Promise<{ sessionId: string; features: string[]; examUrl: string }> {
    try {
      const formData = new FormData();
      
      formData.append("file", {
        uri: filePath,
        name: "exam.pdf",
        type: "application/pdf",
      } as any);

      const response = await fetch(`${getApiUrl()}/triage/${sessionId}/exam`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`Falha no upload do exame: HTTP Status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao subir arquivo de exame:", error);
      throw error;
    }
  },
};
