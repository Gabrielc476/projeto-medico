import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "../../tw";
import { TriageFlowType } from "../../hooks/useTriageFlow";

interface TriageContextExtractionProps {
  flow: TriageFlowType;
}

export function TriageContextExtraction({ flow }: TriageContextExtractionProps) {
  const [contextText, setContextText] = useState(flow.contextText || "");

  return (
    <View className="bg-bg-panel border border-border-subtle p-6 rounded-2xl shadow-lg my-4">
      <Text className="text-text-primary text-base font-bold mb-1">
        Passo 2: Relato de Sintomas
      </Text>
      <Text className="text-text-tertiary text-xs mb-5 font-sans leading-relaxed">
        Fale livremente sobre o que você está sentindo. Nosso extrator de IA identificará fatores
        contextuais e biomarcadores ocultos no texto.
      </Text>

      {/* Área de Texto Livre */}
      <TextInput
        multiline
        numberOfLines={5}
        value={contextText}
        onChangeText={setContextText}
        placeholder="Exemplo: Sinto dores intensas no peito que se irradiam para o braço esquerdo há cerca de duas horas..."
        placeholderTextColor="#62666d"
        className="bg-bg-marketing border border-border-subtle rounded-xl p-4 text-text-secondary text-sm font-sans mb-6 h-28 text-left align-top"
      />

      {/* Ações de Navegação */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={flow.goBack}
          className="flex-1 bg-bg-secondary-surface py-3.5 rounded-xl border border-border-subtle"
        >
          <Text className="text-text-secondary font-bold text-center text-xs">VOLTAR</Text>
        </Pressable>
        <Pressable
          onPress={flow.skipContext}
          disabled={flow.loading}
          className="flex-1 bg-bg-secondary-surface py-3.5 rounded-xl border border-border-subtle"
        >
          <Text className="text-text-secondary font-bold text-center text-xs">PULAR</Text>
        </Pressable>
        <Pressable
          onPress={() => flow.submitContext(contextText)}
          disabled={flow.loading || !contextText.trim()}
          className={`flex-1 py-3.5 rounded-xl border ${
            contextText.trim()
              ? "bg-brand-indigo border-accent-hover/20"
              : "bg-brand-indigo/40 border-transparent opacity-50"
          }`}
        >
          <Text className="text-text-primary font-bold text-center text-xs">
            {flow.loading ? "Enviando..." : "ENVIAR"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
