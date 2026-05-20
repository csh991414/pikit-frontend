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
  PageResponse,
  PromptAdminItem,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

// Token refresh queueing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
    if (isRefreshing) {
      // Add to queue and wait for token
      try {
        const newToken = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      } catch (err) {
        throw new Error('인증 만료로 요청을 처리할 수 없습니다.');
      }
    } else {
      isRefreshing = true;
      
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const newAccessToken = useAuthStore.getState().accessToken;
          processQueue(null, newAccessToken);
          
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        } else {
          const error = new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          processQueue(error);
          clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw error;
        }
      } catch (err) {
        processQueue(err instanceof Error ? err : new Error('인증 갱신 중 오류 발생'));
        throw err;
      } finally {
        isRefreshing = false;
      }
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
    return apiClient<PageResponse<PromptListItem>>(`/api/prompts${qs ? `?${qs}` : ''}`, {
      skipAuth: false,
    });
  },

  detail: (id: number) => apiClient<PromptDetail>(`/api/prompts/${id}`),

  popular: (params?: { limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiClient<PromptListItem[]>(`/api/prompts/popular${qs ? `?${qs}` : ''}`, {
      skipAuth: false,
    });
  },

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

export const adminApi = {
  getPrompts: (page: number, size: number = 20) =>
    apiClient<PageResponse<PromptAdminItem>>(`/api/admin/prompts?page=${page}&size=${size}`),
  
  createPrompt: (data: any) =>
    apiClient<PromptAdminItem>('/api/admin/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updatePrompt: (id: number, data: any) =>
    apiClient<PromptAdminItem>(`/api/admin/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deletePrompt: (id: number) =>
    apiClient<void>(`/api/admin/prompts/${id}`, {
      method: 'DELETE',
    }),
  
  toggleVisibility: (id: number) =>
    apiClient<PromptAdminItem>(`/api/admin/prompts/${id}/visibility`, {
      method: 'PATCH',
    }),
  
  uploadImage: async (formData: FormData): Promise<{ url: string }> => {
    const { accessToken } = useAuthStore.getState();
    const res = await fetch(`${API_BASE_URL}/api/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const result: ApiResponse<{ url: string }> = await res.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || '업로드 실패');
    }
    return result.data;
  },
};
