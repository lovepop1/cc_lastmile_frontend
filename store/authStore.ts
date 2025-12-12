import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserRole } from "../types";
import { apiService } from "../services/api";

interface AuthState {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  isLoading: boolean;
  setAuth: (token: string, userId: string, role: UserRole) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,
  isLoading: true,

  setAuth: async (token: string, userId: string, role: UserRole) => {
    await AsyncStorage.setItem("auth_token", token);
    await AsyncStorage.setItem("user_id", userId);
    await AsyncStorage.setItem("user_role", role);
    apiService.setAuthToken(token);
    set({ token, userId, role });
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user_id");
    await AsyncStorage.removeItem("user_role");
    apiService.clearAuthToken();
    set({ token: null, userId: null, role: null });
  },

  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userId = await AsyncStorage.getItem("user_id");
      const role = (await AsyncStorage.getItem("user_role")) as UserRole | null;

      if (token && userId && role) {
        apiService.setAuthToken(token);
        set({ token, userId, role, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
      set({ isLoading: false });
    }
  },
}));
