import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config';
import { useAuthStore } from '../store/authStore';
import { mockApi } from './mockData';

// Types
export interface ApiError {
  message: string;
  status: number;
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
    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: async (username: string, password: string) => {
    if (config.api.mockEnabled) {
      return mockApi.auth.login(username, password);
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData);
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    if (config.api.mockEnabled) {
      return mockApi.auth.register(username, email, password);
    }

    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
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