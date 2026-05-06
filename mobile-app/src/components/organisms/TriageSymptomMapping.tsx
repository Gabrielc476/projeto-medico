import React from "react";
import { View, Text, Pressable } from "../../tw";
import { TriageFlowType } from "../../hooks/useTriageFlow";
import { Body3DMap } from "./Body3DMap";

interface TriageSymptomMappingProps {
  flow: TriageFlowType;
}

export function TriageSymptomMapping({ flow }: TriageSymptomMappingProps) {
  return (
    <View className="flex-1">
      <Text className="text-text-primary text-base font-bold mb-1">
        Passo 3: Mapeamento Anatômico 3D
      </Text>
      <Text className="text-text-tertiary text-xs mb-3 font-sans leading-relaxed">
        Selecione as partes do corpo no avatar 3D e marque seus sintomas para refinar a precisão.
      </Text>

      {/* O Organismo 3D */}
      <Body3DMap
        selectedSymptoms={flow.selectedSymptoms}
        onAddSymptom={flow.addSymptom}
        onRemoveSymptom={flow.removeSymptom}
      />

      {/* Sintomas Selecionados */}
      {flow.selectedSymptoms.length > 0 && (
        <View className="bg-bg-panel border border-border-subtle p-4 rounded-xl mb-6">
          <Text className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">
            Sintomas Mapeados ({flow.selectedSymptoms.length})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {flow.selectedSymptoms.map((s) => (
              <View
                key={s.cui}
                className="bg-brand-indigo/10 border border-brand-indigo/30 px-3 py-1.5 rounded-lg flex-row items-center gap-2"
              >
                <Text className="text-accent-violet text-xs font-medium">{s.name}</Text>
                <Pressable onPress={() => flow.removeSymptom(s.cui)}>
                  <Text className="text-text-tertiary text-xs font-bold px-1">✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ações de Navegação */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={flow.goBack}
          className="flex-1 bg-bg-secondary-surface py-3.5 rounded-xl border border-border-subtle"
        >
          <Text className="text-text-secondary font-bold text-center text-xs">VOLTAR</Text>
        </Pressable>
        <Pressable
          onPress={flow.submitSymptoms}
          disabled={flow.loading || flow.selectedSymptoms.length === 0}
          className={`flex-1 py-3.5 rounded-xl border ${
            flow.selectedSymptoms.length > 0
              ? "bg-brand-indigo border-accent-hover/20"
              : "bg-brand-indigo/40 border-transparent opacity-50"
          }`}
        >
          <Text className="text-text-primary font-bold text-center text-xs">
            {flow.loading ? "Gerando Diagnóstico..." : "ANALISAR SINTOMAS"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
