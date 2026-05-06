import React from "react";
import { View, Text, Pressable } from "../../tw";
import { useTriageFlow } from "../../hooks/useTriageFlow";
import { useAuthStore } from "../../stores/useAuthStore";
import { ActivityIndicator, ScrollView } from "react-native";

// Importações dos Organismos Atômicos Refatorados
import { TriageIdle } from "../../components/organisms/TriageIdle";
import { TriageExamUpload } from "../../components/organisms/TriageExamUpload";
import { TriageContextExtraction } from "../../components/organisms/TriageContextExtraction";
import { TriageSymptomMapping } from "../../components/organisms/TriageSymptomMapping";
import { TriageResults } from "../../components/organisms/TriageResults";

export default function TriageScreen() {
  const flow = useTriageFlow();
  const { user, logout } = useAuthStore();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#08090a" }} 
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header Central com Boas-Vindas e Botão de Logout */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-text-primary text-2xl font-bold tracking-tight">CDSS Triagem</Text>
          <Text className="text-text-tertiary text-xs mt-1 font-sans" numberOfLines={1}>
            Olá, {user?.name || "Paciente"} • Sistema Inteligente
          </Text>
        </View>
        <Pressable 
          onPress={logout} 
          className="px-3 py-1.5 bg-bg-panel border border-border-subtle rounded-lg active:bg-border-subtle/25"
        >
          <Text className="text-text-secondary text-xs font-semibold">Sair</Text>
        </Pressable>
      </View>

      {/* Caixa de Mensagem de Erro Geral */}
      {flow.error && (
        <View className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl mb-6">
          <Text className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Erro Identificado
          </Text>
          <Text className="text-red-200 text-xs font-sans leading-relaxed">{flow.error}</Text>
        </View>
      )}

      {/* RENDERIZAÇÃO DE ACORDO COM O ESTADO DO WORKFLOW (XSTATE) */}
      
      {flow.state === "idle" && (
        <TriageIdle flow={flow} />
      )}

      {flow.state === "uploadingExam" && (
        <TriageExamUpload flow={flow} />
      )}

      {flow.state === "extractingContext" && (
        <TriageContextExtraction flow={flow} />
      )}

      {flow.state === "mappingSymptoms" && (
        <TriageSymptomMapping flow={flow} />
      )}

      {flow.state === "processingDiagnosis" && (
        <View className="bg-bg-panel border border-border-subtle p-8 rounded-2xl shadow-lg items-center my-4">
          <View className="mb-6">
            <ActivityIndicator size="large" color="#7170ff" />
          </View>
          <Text className="text-text-primary text-base font-bold text-center">
            Processando Diagnóstico Clínico
          </Text>
          <Text className="text-text-secondary text-sm text-center font-sans mt-2 leading-relaxed">
            O motor CDSS está correlacionando seus exames, relatos e os sintomas mapeados no avatar
            3D com mais de 10.000 patologias no grafo médico.
          </Text>
        </View>
      )}

      {flow.state === "completed" && (
        <TriageResults flow={flow} />
      )}
    </ScrollView>
  );
}
