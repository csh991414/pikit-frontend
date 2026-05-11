import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data: AuthResponse) => set({
        user: {
          userId: data.userId,
          username: data.username,
          nickname: data.nickname,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
      }),

      clearAuth: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),

      updateTokens: (accessToken: string, refreshToken: string) => set({
        accessToken,
        refreshToken,
      }),
    }),
    {
      name: 'pickit-auth',
    }
  )
);
