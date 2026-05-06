import React from "react";
import { View, Text, Pressable } from "../../tw";
import { TriageFlowType } from "../../hooks/useTriageFlow";

interface TriageExamUploadProps {
  flow: TriageFlowType;
}

export function TriageExamUpload({ flow }: TriageExamUploadProps) {
  // Handler simulando seleção de arquivo para desenvolvimento rápido
  const simulateFileUpload = () => {
    // Simulamos um arquivo local de exame clínico
    const mockFilePath = "/data/user/0/mobile-app/cache/exam_sample.pdf";
    flow.uploadExam(mockFilePath);
  };

  return (
    <View className="bg-bg-panel border border-border-subtle p-6 rounded-2xl shadow-lg my-4">
      <Text className="text-text-primary text-base font-bold mb-1">Passo 1: Upload de Exames</Text>
      <Text className="text-text-tertiary text-xs mb-5 font-sans leading-relaxed">
        Seus dados são processados localmente. Aceitamos arquivos em formato PDF de até 5MB.
      </Text>

      {/* Área de Seleção de Arquivo */}
      <Pressable
        onPress={simulateFileUpload}
        disabled={flow.loading}
        className="border-2 border-dashed border-border-standard rounded-xl py-8 px-4 items-center mb-6 bg-bg-marketing/30 active:bg-brand-indigo/10 transition-all"
      >
        <Text className="text-3xl mb-2">📄</Text>
        <Text className="text-text-secondary text-sm font-semibold text-center">
          {flow.loading ? "Processando Exame..." : "Selecionar Exame (PDF)"}
        </Text>
        <Text className="text-text-tertiary text-xs text-center font-sans mt-1">
          Toque para simular a seleção de exames laboratoriais
        </Text>
      </Pressable>

      {/* Ações de Navegação */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={flow.goBack}
          className="flex-1 bg-bg-secondary-surface py-3.5 rounded-xl border border-border-subtle"
        >
          <Text className="text-text-secondary font-bold text-center text-xs">VOLTAR</Text>
        </Pressable>
        <Pressable
          onPress={flow.skipExam}
          className="flex-1 bg-brand-indigo py-3.5 rounded-xl border border-accent-hover/20"
        >
          <Text className="text-text-primary font-bold text-center text-xs">PULAR ETAPA</Text>
        </Pressable>
      </View>
    </View>
  );
}
