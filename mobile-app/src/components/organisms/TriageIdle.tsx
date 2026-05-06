import React from "react";
import { View, Text, Pressable } from "../../tw";
import { TriageFlowType } from "../../hooks/useTriageFlow";

interface TriageIdleProps {
  flow: TriageFlowType;
}

export function TriageIdle({ flow }: TriageIdleProps) {
  return (
    <View className="bg-bg-panel border border-border-subtle p-6 rounded-2xl items-center shadow-lg my-4">
      <View className="w-16 h-16 bg-brand-indigo/10 border border-brand-indigo/20 rounded-full items-center justify-center mb-5">
        <Text className="text-accent-violet text-3xl font-bold">🩺</Text>
      </View>
      <Text className="text-text-primary text-lg font-bold text-center">
        Pronto para Iniciar sua Triagem?
      </Text>
      <Text className="text-text-secondary text-sm text-center font-sans mt-2 mb-6 leading-relaxed">
        Mapeie sintomas de forma anatômica 3D, faça o upload de exames e receba predições de
        diagnósticos clínicos de alta fidelidade.
      </Text>
      <Pressable
        onPress={flow.startTriage}
        className="w-full bg-brand-indigo active:bg-accent-violet py-3.5 rounded-xl border border-accent-hover/20"
      >
        <Text className="text-text-primary font-bold text-center text-sm tracking-wide">
          {flow.loading ? "Iniciando..." : "INICIAR NOVA TRIAGEM"}
        </Text>
      </Pressable>
    </View>
  );
}
