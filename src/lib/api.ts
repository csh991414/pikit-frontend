import { useAuthStore } from '@/stores/authStore';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  PromptListItem,
  PromptDetail,
  ToggleResponse,
  CopyResponse,
  PromptSort,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const { accessToken, clearAuth } = useAuthStore.getState();

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // 401 Unauthorized handling
  if (response.status === 401 && !skipAuth && endpoint !== '/api/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await refreshAccessToken();
      isRefreshing = false;

      if (refreshed) {
        // Retry once with new token
        const newAccessToken = useAuthStore.getState().accessToken;
        if (newAccessToken) {
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        }
      } else {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
    } else {
      // If already refreshing, wait a bit or throw? 
      // Simplest: throw and let user retry or handled by UI
      throw new Error('인증 갱신 중입니다. 잠시 후 다시 시도해주세요.');
    }
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.message || '요청에 실패했습니다.');
  }

  return result.data as T;
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken, updateTokens, clearAuth } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (result.success && result.data) {
      updateTokens(result.data.accessToken, result.data.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('Refresh token failed:', error);
  }

  clearAuth();
  return false;
}

export const authApi = {
  signup: (data: SignupRequest) => apiClient<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  }),
  login: (data: LoginRequest) => apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  }),
  logout: () => apiClient<null>('/api/auth/logout', { method: 'POST' }),
  getMe: () => apiClient<User>('/api/auth/me'),
};

export const promptApi = {
  list: (params?: { page?: number; size?: number; sort?: PromptSort }) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    if (params?.sort) query.append('sort', params.sort);
    const qs = query.toString();
    return apiClient<PromptListItem[]>(`/api/prompts${qs ? `?${qs}` : ''}`, {
      skipAuth: false,
    });
  },

  detail: (id: number) => apiClient<PromptDetail>(`/api/prompts/${id}`),

  toggleLike: (id: number) =>
    apiClient<ToggleResponse>(`/api/prompts/${id}/like`, {
      method: 'POST',
    }),

  toggleBookmark: (id: number) =>
    apiClient<ToggleResponse>(`/api/prompts/${id}/bookmark`, {
      method: 'POST',
    }),

  incrementCopy: (id: number) =>
    apiClient<CopyResponse>(`/api/prompts/${id}/copy`, {
      method: 'POST',
      skipAuth: true,
    }),
};
