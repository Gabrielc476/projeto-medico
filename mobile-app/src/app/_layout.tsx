import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/useAuthStore";
import { View, ActivityIndicator } from "react-native";
import "../global.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isInitialized, initializeAuth } = useAuthStore();

  // Inicializa o estado de autenticação lendo do SecureStore seguro ao abrir o app
  useEffect(() => {
    initializeAuth();
  }, []);

  // Guarda de rota reativo do Expo Router
  useEffect(() => {
    if (!isInitialized) return;

    // Detectar se o usuário está navegando nas rotas de login/registro
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Se não autenticado e fora do grupo (auth), redireciona de imediato para a tela de login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Se autenticado e tenta acessar login/registro, redireciona para a triagem protegida
      router.replace("/(app)");
    }
  }, [isAuthenticated, isInitialized, segments]);

  // Exibir tela de carregamento premium enquanto restaura as credenciais
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: "#08090a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7170ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#08090a",
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
