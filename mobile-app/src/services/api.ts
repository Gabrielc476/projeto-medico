// Importações essenciais do Axios e do Expo
import axios from "axios";
import { Platform } from "react-native";
import ExpoConstants from "expo-constants";
import { useAuthStore } from "../stores/useAuthStore";

// Resolve o IP do host dinamicamente para emuladores e dispositivos físicos locais
const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = ExpoConstants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return `http://${ip}:3000`;
    }
  }

  // Fallback para emulador Android padrão ou iOS/Web
  return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
};

const API_URL = getBackendUrl();
console.log(`[API_SERVICE] Base URL configurada como: "${API_URL}"`);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Injetar token JWT nas requisições ao backend de forma reativa e segura
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiUrl = () => API_URL;
