import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config';
import { useAuthStore } from '../store/authStore';
import { mockApi } from './mockData';

// Types
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  error: ApiError | null;
  loading: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${config.api.baseUrl}/api/v1`,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    
    if (error.response?.status === 422) {
      // Handle validation errors
      const data = error.response.data as { detail?: Array<{ loc: string[], msg: string, type: string }> };
      if (data.detail) {
        const validationError = new Error('Validation Error');
        (validationError as any).validationErrors = data.detail.reduce((acc, curr) => {
          const field = curr.loc[curr.loc.length - 1];
          if (!acc[field]) {
            acc[field] = [];
          }
          acc[field].push(curr.msg);
          return acc;
        }, {} as Record<string, string[]>);
        throw validationError;
      }
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: async (username: string, password: string) => {
    if (config.api.mockEnabled) {
      return mockApi.auth.login(username, password);
    }

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  register: async (username: string, email: string, password: string) => {
    if (config.api.mockEnabled) {
      return mockApi.auth.register(username, email, password);
    }

    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error && 'validationErrors' in error) {
        throw error;
      }
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },
};

export const passwordsApi = {
  getAll: async () => {
    if (config.api.mockEnabled) {
      return mockApi.passwords.getAll();
    }

    const response = await api.get('/passwords');
    return response.data;
  },

  getById: async (id: string) => {
    if (config.api.mockEnabled) {
      return mockApi.passwords.getById(id);
    }

    const response = await api.get(`/passwords/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    tags?: string[];
  }) => {
    if (config.api.mockEnabled) {
      return mockApi.passwords.create(data);
    }

    const response = await api.post('/passwords', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      title?: string;
      username?: string;
      password?: string;
      url?: string;
      notes?: string;
      tags?: string[];
    }
  ) => {
    if (config.api.mockEnabled) {
      return mockApi.passwords.update(id, data);
    }

    const response = await api.put(`/passwords/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    if (config.api.mockEnabled) {
      return mockApi.passwords.delete(id);
    }

    await api.delete(`/passwords/${id}`);
  },
};

export const userApi = {
  getCurrentUser: async () => {
    if (config.api.mockEnabled) {
      return mockApi.users.getCurrentUser();
    }

    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user profile');
    }
  },

  updateProfile: async (data: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (config.api.mockEnabled) {
      return mockApi.users.updateProfile(data);
    }

    try {
      const response = await api.put('/users/me', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to update profile');
    }
  },

  deleteAccount: async () => {
    if (config.api.mockEnabled) {
      return mockApi.users.deleteAccount();
    }

    try {
      await api.delete('/users/me');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to delete account');
    }
  },
}; 