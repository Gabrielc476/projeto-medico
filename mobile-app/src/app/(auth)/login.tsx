import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "../../tw";
import { useRouter } from "expo-router";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/useAuthStore";
import { ActivityIndicator, ScrollView, Text as RNText } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      await loginStore(response.access_token, response.user);
      router.replace("/(app)");
    } catch (err: any) {
      console.error("[LoginScreen] Erro de autenticação:", err);
      if (err.response?.status === 401) {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else {
        setError("Não foi possível conectar ao servidor. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#08090a" }} 
      contentContainerStyle={{ padding: 24, justifyContent: "center", minHeight: "100%", paddingBottom: 48 }}
    >
      {/* Logotipo e Boas-Vindas */}
      <View className="mb-8 items-center">
        <View className="h-12 w-12 bg-brand-indigo/10 border border-brand-indigo rounded-2xl items-center justify-center mb-4">
          <Text className="text-accent-violet text-xl font-bold font-sans">🩺</Text>
        </View>
        <Text className="text-text-primary text-2xl font-bold tracking-tight">Entrar na Plataforma</Text>
        <Text className="text-text-tertiary text-xs mt-1.5 text-center font-sans leading-relaxed">
          Suas informações de triagem e histórico clínico protegidos por criptografia de ponta a ponta.
        </Text>
      </View>

      {/* Box de Login */}
      <View className="bg-bg-panel border border-border-subtle p-6 rounded-2xl shadow-xl">
        {error && (
          <View className="bg-red-950/40 border border-red-500/30 p-3 rounded-lg mb-4">
            <Text className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
              Falha ao acessar
            </Text>
            <Text className="text-red-200 text-xs font-sans">{error}</Text>
          </View>
        )}

        {/* Input Email */}
        <View className="mb-4">
          <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wide">
            E-mail cadastrado
          </Text>
          <TextInput
            placeholder="exemplo@email.com"
            placeholderTextColor="#46484c"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full bg-bg-marketing border border-border-subtle p-3 rounded-xl text-text-primary text-sm font-sans focus:border-brand-indigo"
          />
        </View>

        {/* Input Senha */}
        <View className="mb-6">
          <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wide">
            Sua Senha
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#46484c"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            className="w-full bg-bg-marketing border border-border-subtle p-3 rounded-xl text-text-primary text-sm font-sans focus:border-brand-indigo"
          />
        </View>

        {/* Botão Entrar */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl border border-border-subtle items-center justify-center transition-all ${
            loading ? "bg-brand-indigo/50" : "bg-brand-indigo active:bg-brand-indigo/80"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#f7f8f8" />
          ) : (
            <Text className="text-text-primary font-bold text-sm">Entrar e Iniciar Triagem</Text>
          )}
        </Pressable>
      </View>

      {/* Botão para criar conta */}
      <View className="mt-8 items-center flex-row justify-center">
        <Text className="text-text-tertiary text-xs font-sans">Ainda não tem conta? </Text>
        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text className="text-accent-violet text-xs font-bold font-sans">Crie uma conta aqui</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
