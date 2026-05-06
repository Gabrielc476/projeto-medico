import { useMachine } from "@xstate/react";
import { triageMachine } from "../machines/triageMachine";
import { useTriageStore } from "../stores/useTriageStore";
import { triageService } from "../services/triageService";
import { SymptomDto } from "../types";

export function useTriageFlow() {
  const [state, send] = useMachine(triageMachine);
  const store = useTriageStore();

  const handleStart = async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const { sessionId, status } = await triageService.startTriage();
      store.setSessionId(sessionId);
      store.setCurrentStatus(status);
      send({ type: "START" });
    } catch (err: any) {
      store.setError(err.message || "Erro ao iniciar triagem");
    } finally {
      store.setLoading(false);
    }
  };

  const handleUploadExam = async (filePath: string) => {
    if (!store.sessionId) return;
    store.setLoading(true);
    store.setError(null);
    try {
      const { features, examUrl } = await triageService.uploadExam(store.sessionId, filePath);
      store.setUploadedExamPath(examUrl);
      store.setExtractedFeatures(features);
      send({ type: "UPLOAD_SUCCESS" });
    } catch (err: any) {
      store.setError(err.message || "Erro ao enviar exame");
    } finally {
      store.setLoading(false);
    }
  };

  const handleSkipExam = async () => {
    if (!store.sessionId) return;
    store.setLoading(true);
    try {
      const { status } = await triageService.skipExam(store.sessionId);
      store.setCurrentStatus(status);
      send({ type: "SKIP" });
    } catch (err: any) {
      store.setError(err.message || "Erro ao pular exame");
    } finally {
      store.setLoading(false);
    }
  };

  const handleSubmitContext = async (text: string) => {
    if (!store.sessionId) return;
    store.setLoading(true);
    store.setError(null);
    try {
      const { features } = await triageService.extractContext(store.sessionId, text);
      store.setContextText(text);
      store.setExtractedFeatures([...store.extractedFeatures, ...features]);
      send({ type: "SUBMIT_SUCCESS" });
    } catch (err: any) {
      store.setError(err.message || "Erro ao enviar contexto de vida");
    } finally {
      store.setLoading(false);
    }
  };

  const handleSkipContext = async () => {
    if (!store.sessionId) return;
    store.setLoading(true);
    try {
      const { status } = await triageService.skipContext(store.sessionId);
      store.setCurrentStatus(status);
      send({ type: "SKIP" });
    } catch (err: any) {
      store.setError(err.message || "Erro ao pular contexto");
    } finally {
      store.setLoading(false);
    }
  };

  const handleDiagnose = async () => {
    if (!store.sessionId) return;
    store.setLoading(true);
    try {
      const { diagnosis } = await triageService.diagnose(store.sessionId);
      store.setDiagnosisResult(diagnosis);
      send({ type: "DIAGNOSIS_SUCCESS" });
    } catch (err: any) {
      store.setError(err.message || "Erro ao gerar diagnóstico");
      send({ type: "DIAGNOSIS_FAILURE" });
    } finally {
      store.setLoading(false);
    }
  };

  const handleSubmitSymptoms = async () => {
    if (!store.sessionId) return;
    store.setLoading(true);
    store.setError(null);
    try {
      const { status } = await triageService.submitSymptoms(store.sessionId, store.selectedSymptoms);
      store.setCurrentStatus(status);
      send({ type: "SUBMIT_SUCCESS" });
      
      // Engatilha o diagnóstico logo após o envio dos sintomas
      await handleDiagnose();
    } catch (err: any) {
      store.setError(err.message || "Erro ao enviar sintomas");
    } finally {
      store.setLoading(false);
    }
  };

  const handleReset = () => {
    store.resetStore();
    send({ type: "RESET" });
  };

  const handleBack = () => {
    send({ type: "BACK" });
  };

  return {
    state: state.value,
    sessionId: store.sessionId,
    currentStatus: store.currentStatus,
    loading: store.loading,
    error: store.error,
    selectedSymptoms: store.selectedSymptoms,
    extractedFeatures: store.extractedFeatures,
    diagnosisResult: store.diagnosisResult,
    contextText: store.contextText,
    
    // Actions
    startTriage: handleStart,
    uploadExam: handleUploadExam,
    skipExam: handleSkipExam,
    submitContext: handleSubmitContext,
    skipContext: handleSkipContext,
    addSymptom: store.addSymptom,
    removeSymptom: store.removeSymptom,
    submitSymptoms: handleSubmitSymptoms,
    resetTriage: handleReset,
    goBack: handleBack,
  };
}

export type TriageFlowType = ReturnType<typeof useTriageFlow>;
