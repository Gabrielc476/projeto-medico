import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface UserMetadata {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: UserMetadata | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  login: (token: string, user: UserMetadata) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const SECURE_TOKEN_KEY = "auth_access_token";
const SECURE_USER_KEY = "auth_user_metadata";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (token, user) => {
    try {
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
      await SecureStore.setItemAsync(SECURE_USER_KEY, JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    } catch (err) {
      console.error("[useAuthStore] Erro ao salvar sessão de login:", err);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    } catch (err) {
      console.error("[useAuthStore] Erro ao limpar sessão de logout:", err);
    }
  },

  initializeAuth: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      const storedUserJson = await SecureStore.getItemAsync(SECURE_USER_KEY);

      if (storedToken && storedUserJson) {
        set({
          token: storedToken,
          user: JSON.parse(storedUserJson),
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } catch (err) {
      console.error("[useAuthStore] Erro ao restaurar credenciais de sessão:", err);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));
