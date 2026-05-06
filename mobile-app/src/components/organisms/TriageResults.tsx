import React from "react";
import { View, Text, Pressable } from "../../tw";
import { TriageFlowType } from "../../hooks/useTriageFlow";

interface TriageResultsProps {
  flow: TriageFlowType;
}

export function TriageResults({ flow }: TriageResultsProps) {
  return (
    <View className="bg-bg-panel border border-border-subtle p-6 rounded-2xl shadow-lg my-4">
      <View className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full items-center justify-center mb-4">
        <Text className="text-emerald-400 text-2xl font-bold">✓</Text>
      </View>
      <Text className="text-text-primary text-lg font-bold mb-1">Predição CDSS Finalizada</Text>
      <Text className="text-text-tertiary text-xs mb-5 font-sans leading-relaxed">
        Estas são as hipóteses geradas pelo Sistema de Apoio à Decisão Clínica:
      </Text>

      {/* Diagnósticos Clínicos Listados */}
      <View className="mb-6 gap-3">
        {flow.diagnosisResult && flow.diagnosisResult.length > 0 ? (
          flow.diagnosisResult.map((diag, index) => (
            <View
              key={diag.diseaseId}
              className="bg-bg-marketing border border-border-subtle p-4 rounded-xl flex-row justify-between items-center"
            >
              <View className="flex-1 pr-4">
                <Text className="text-text-secondary text-sm font-semibold">
                  {index + 1}. {diag.name}
                </Text>
                <Text className="text-text-tertiary text-xs font-sans mt-1 leading-normal">
                  {diag.explanation}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-accent-violet text-sm font-bold">
                  {Math.round(diag.probability * 100)}%
                </Text>
                <Text className="text-text-quaternary text-[10px] font-sans mt-0.5 uppercase">
                  PROBABILIDADE
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-bg-marketing border border-border-subtle p-4 rounded-xl">
            <Text className="text-text-secondary text-sm font-sans text-center">
              Incrível! Nenhum achado patológico de alto risco foi predito para esta combinação.
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={flow.resetTriage}
        className="w-full bg-brand-indigo py-3.5 rounded-xl border border-accent-hover/20"
      >
        <Text className="text-text-primary font-bold text-center text-sm tracking-wide">
          REALIZAR NOVA TRIAGEM
        </Text>
      </Pressable>
    </View>
  );
}
