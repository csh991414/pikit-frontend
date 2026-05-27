import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types';

// 커스텀 Storage 어댑터: rememberMe 플래그에 따라 localStorage/sessionStorage 동적 전환
const customStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name) ?? sessionStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    const rememberMe = localStorage.getItem('pickit-remember-me') === 'true';
    if (rememberMe) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name); // 반대편은 정리
    } else {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name); // 반대편은 정리
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  setAuth: (data: AuthResponse, rememberMe?: boolean) => void;
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

      setAuth: (data: AuthResponse, rememberMe: boolean = false) => {
        // 로그인 시 rememberMe 플래그를 먼저 저장 (storage 어댑터가 이걸 보고 분기)
        if (typeof window !== 'undefined') {
          localStorage.setItem('pickit-remember-me', String(rememberMe));
        }
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
        // 로그아웃 시 rememberMe 플래그도 제거
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pickit-remember-me');
        }
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
