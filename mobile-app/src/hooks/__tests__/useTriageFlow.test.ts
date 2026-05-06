import { act, renderHook } from "@testing-library/react-native";
import { useTriageFlow } from "../useTriageFlow";
import { triageService } from "../../services/triageService";

// Mock total do TriageService
jest.mock("../../services/triageService", () => ({
  triageService: {
    startTriage: jest.fn(),
    skipExam: jest.fn(),
    skipContext: jest.fn(),
    extractContext: jest.fn(),
    submitSymptoms: jest.fn(),
    diagnose: jest.fn(),
    getStatus: jest.fn(),
    uploadExam: jest.fn(),
  },
}));

describe("useTriageFlow Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Limpar Zustand resetando a store a cada bateria de testes
    const { result } = renderHook(() => useTriageFlow());
    act(() => {
      result.current.resetTriage();
    });
  });

  it("deve inicializar em estado 'idle' por padrão", () => {
    const { result } = renderHook(() => useTriageFlow());
    expect(result.current.state).toBe("idle");
    expect(result.current.sessionId).toBeNull();
    expect(result.current.selectedSymptoms).toEqual([]);
  });

  it("deve transitar para 'uploadingExam' após disparar startTriage com sucesso", async () => {
    const mockSession = { sessionId: "session-abc-123", status: "STARTED" };
    (triageService.startTriage as jest.Mock).mockResolvedValueOnce(mockSession);

    const { result } = renderHook(() => useTriageFlow());

    await act(async () => {
      await result.current.startTriage();
    });

    expect(triageService.startTriage).toHaveBeenCalledTimes(1);
    expect(result.current.sessionId).toBe("session-abc-123");
    expect(result.current.state).toBe("uploadingExam");
  });

  it("deve manipular a adição e remoção de sintomas mapeados", () => {
    const { result } = renderHook(() => useTriageFlow());
    const symptom = { cui: "C0018681", name: "DOR DE CABEÇA" };

    act(() => {
      result.current.addSymptom(symptom);
    });

    expect(result.current.selectedSymptoms).toHaveLength(1);
    expect(result.current.selectedSymptoms[0].cui).toBe("C0018681");

    // Impedir duplicados
    act(() => {
      result.current.addSymptom(symptom);
    });
    expect(result.current.selectedSymptoms).toHaveLength(1);

    act(() => {
      result.current.removeSymptom("C0018681");
    });

    expect(result.current.selectedSymptoms).toHaveLength(0);
  });
});
