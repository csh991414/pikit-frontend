import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types';

// sessionStorage만 사용하는 커스텀 Storage 어댑터 (창을 닫으면 자동 로그아웃)
const customStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(name, value);
    localStorage.removeItem(name); // 기존 localStorage 데이터 정리
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (data: AuthResponse) => {
        set({
          user: {
            userId: data.userId,
            username: data.username,
            nickname: data.nickname,
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isAdmin: data.isAdmin ?? false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      updateTokens: (accessToken: string, refreshToken: string) => set({
        accessToken,
        refreshToken,
      }),

      setAccessToken: (accessToken: string) => set({ accessToken }),
    }),
    {
      name: 'pickit-auth',
      storage: createJSONStorage(() => customStorage),
    }
  )
);
