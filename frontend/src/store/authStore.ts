import { create } from 'zustand';
import { config } from '../config';
import { authApi } from '../services/api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(config.auth.tokenKey),
  isAuthenticated: !!localStorage.getItem(config.auth.tokenKey),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login(username, password);
      localStorage.setItem(config.auth.tokenKey, response.access_token);
      set({
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.register(username, email, password);
      // After registration, log in automatically
      await useAuthStore.getState().login(username, password);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(config.auth.tokenKey);
    set({
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
})); 