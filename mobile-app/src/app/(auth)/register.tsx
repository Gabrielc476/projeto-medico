import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "../../tw";
import { useRouter } from "expo-router";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/useAuthStore";
import { ActivityIndicator, ScrollView } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validação em tempo real dos critérios da senha baseada no Dto do backend
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    passwordsMatch;

  const handleRegister = async () => {
    if (!isFormValid) {
      if (!name || !email || !password || !confirmPassword) {
        setError("Preencha todos os campos obrigatórios.");
      } else if (!passwordsMatch) {
        setError("As senhas informadas não coincidem.");
      } else {
        setError("A senha escolhida não atende a todos os critérios exigidos.");
      }
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authService.register({ name, email, password });
      await loginStore(response.access_token, response.user);
      router.replace("/(app)");
    } catch (err: any) {
      console.error("[RegisterScreen] Erro de cadastro:", err);
      if (err.response?.status === 409) {
        setError("Este e-mail já está cadastrado na plataforma.");
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
      {/* Cabeçalho */}
      <View className="mb-8 items-center">
        <View className="h-12 w-12 bg-brand-indigo/10 border border-brand-indigo rounded-2xl items-center justify-center mb-4">
          <Text className="text-accent-violet text-xl font-bold font-sans">🛡️</Text>
        </View>
        <Text className="text-text-primary text-2xl font-bold tracking-tight">Criar Conta</Text>
        <Text className="text-text-tertiary text-xs mt-1.5 text-center font-sans leading-relaxed">
          Registre seu e-mail e tenha controle total e sigilo absoluto sobre os seus relatórios e triagens clínicas.
        </Text>
      </View>

      {/* Caixa de Cadastro */}
      <View className="bg-bg-panel border border-border-subtle p-6 rounded-2xl shadow-xl">
        {error && (
          <View className="bg-red-950/40 border border-red-500/30 p-3 rounded-lg mb-4">
            <Text className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
              Não foi possível cadastrar
            </Text>
            <Text className="text-red-200 text-xs font-sans">{error}</Text>
          </View>
        )}

        {/* Input Nome Completo */}
        <View className="mb-4">
          <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wide">
            Nome Completo
          </Text>
          <TextInput
            placeholder="João da Silva"
            placeholderTextColor="#46484c"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            className="w-full bg-bg-marketing border border-border-subtle p-3 rounded-xl text-text-primary text-sm font-sans focus:border-brand-indigo"
          />
        </View>

        {/* Input E-mail */}
        <View className="mb-4">
          <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wide">
            E-mail para Login
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
        <View className="mb-4">
          <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wide">
            Sua Senha
          </Text>
          <TextInput
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#46484c"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            className="w-full bg-bg-marketing border border-border-subtle p-3 rounded-xl text-text-primary text-sm font-sans focus:border-brand-indigo"
          />
        </View>

        {/* Critérios da Senha - Validador Reativo de Alta Fidelidade */}
        <View className="bg-bg-marketing/60 p-3.5 rounded-xl border border-border-subtle mb-4">
          <Text className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-2">
            Requisitos de Segurança da Senha:
          </Text>
          
          <View className="flex-row items-center mb-1">
            <Text className={`text-xs mr-2 font-sans ${hasMinLength ? "text-green-500" : "text-[#46484c]"}`}>
              {hasMinLength ? "✓" : "○"}
            </Text>
            <Text className={`text-[11px] font-sans ${hasMinLength ? "text-text-secondary" : "text-text-tertiary"}`}>
              Mínimo de 8 caracteres
            </Text>
          </View>

          <View className="flex-row items-center mb-1">
            <Text className={`text-xs mr-2 font-sans ${hasUppercase ? "text-green-500" : "text-[#46484c]"}`}>
              {hasUppercase ? "✓" : "○"}
            </Text>
            <Text className={`text-[11px] font-sans ${hasUppercase ? "text-text-secondary" : "text-text-tertiary"}`}>
              Pelo menos uma letra maiúscula
            </Text>
          </View>

          <View className="flex-row items-center mb-1">
            <Text className={`text-xs mr-2 font-sans ${hasLowercase ? "text-green-500" : "text-[#46484c]"}`}>
              {hasLowercase ? "✓" : "○"}
            </Text>
            <Text className={`text-[11px] font-sans ${hasLowercase ? "text-text-secondary" : "text-text-tertiary"}`}>
              Pelo menos uma letra minúscula
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className={`text-xs mr-2 font-sans ${hasNumber ? "text-green-500" : "text-[#46484c]"}`}>
              {hasNumber ? "✓" : "○"}
            </Text>
            <Text className={`text-[11px] font-sans ${hasNumber ? "text-text-secondary" : "text-text-tertiary"}`}>
              Pelo menos um número
            </Text>
          </View>
        </View>

        {/* Input Confirmação de Senha */}
        <View className="mb-6">
          <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wide">
            Confirmar Senha
          </Text>
          <TextInput
            placeholder="Repita sua senha"
            placeholderTextColor="#46484c"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            className="w-full bg-bg-marketing border border-border-subtle p-3 rounded-xl text-text-primary text-sm font-sans focus:border-brand-indigo"
          />
          {password.length > 0 && confirmPassword.length > 0 && (
            <Text className={`text-[10px] font-medium mt-1.5 ${passwordsMatch ? "text-green-500" : "text-red-400"}`}>
              {passwordsMatch ? "✓ As senhas conferem" : "✗ As senhas diferem"}
            </Text>
          )}
        </View>

        {/* Botão Registrar */}
        <Pressable
          onPress={handleRegister}
          disabled={loading || !isFormValid}
          className={`w-full py-3.5 rounded-xl border border-border-subtle items-center justify-center transition-all ${
            !isFormValid 
              ? "bg-[#18191b] opacity-50" 
              : loading
                ? "bg-brand-indigo/50"
                : "bg-brand-indigo active:bg-brand-indigo/80"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#f7f8f8" />
          ) : (
            <Text className="text-text-primary font-bold text-sm">Criar Conta e Entrar</Text>
          )}
        </Pressable>
      </View>

      {/* Botão para voltar ao login */}
      <View className="mt-8 items-center flex-row justify-center">
        <Text className="text-text-tertiary text-xs font-sans">Já possui conta registrada? </Text>
        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text className="text-accent-violet text-xs font-bold font-sans">Faça login aqui</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
