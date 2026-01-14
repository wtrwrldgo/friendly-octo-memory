import { create } from 'zustand';
import StorageService from '../services/storage.service';

interface AuthStore {
  // State
  session: any;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setSession: (session: any) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  loadTokens: () => Promise<void>;
  clearTokens: () => Promise<void>;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  session: null,
  accessToken: null,
  refreshToken: null,

  // Set session
  setSession: (session: any) => {
    set({ session });
  },

  // Set and persist tokens (using StorageService for consistency)
  setTokens: async (accessToken: string, refreshToken: string) => {
    await StorageService.setToken(accessToken);
    await StorageService.setRefreshToken(refreshToken);
    set({ accessToken, refreshToken });
  },

  // Load tokens from storage (using StorageService for consistency)
  loadTokens: async () => {
    const accessToken = await StorageService.getToken();
    const refreshToken = await StorageService.getRefreshToken();
    set({ accessToken, refreshToken });
  },

  // Clear tokens (logout)
  clearTokens: async () => {
    await StorageService.clearAuth();
    set({ accessToken: null, refreshToken: null });
  },

  // Get current access token
  getAccessToken: () => get().accessToken,
}));
