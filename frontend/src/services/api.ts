import axios from 'axios';
import type { AuthResponse, PasswordEntry, User } from '../types';
import { mockAuthResponse, mockPasswords } from './mockData';

const isDevelopment = import.meta.env.MODE === 'development';
const MOCK_DELAY = 500; // Simulate network delay

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    if (isDevelopment) {
      await mockDelay();
      if (username === 'testuser' && password === 'password') {
        localStorage.setItem('token', mockAuthResponse.token);
        return mockAuthResponse;
      }
      throw new Error('Invalid credentials');
    }
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    if (isDevelopment) {
      await mockDelay();
      if (username && email && password) {
        localStorage.setItem('token', mockAuthResponse.token);
        return mockAuthResponse;
      }
      throw new Error('Invalid registration data');
    }
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export const passwordsApi = {
  getAll: async (): Promise<PasswordEntry[]> => {
    if (isDevelopment) {
      await mockDelay();
      return mockPasswords;
    }
    const response = await api.get('/passwords');
    return response.data;
  },

  create: async (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PasswordEntry> => {
    if (isDevelopment) {
      await mockDelay();
      const newPassword: PasswordEntry = {
        ...password,
        id: String(mockPasswords.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPasswords.push(newPassword);
      return newPassword;
    }
    const response = await api.post('/passwords', password);
    return response.data;
  },

  update: async (id: string, password: Partial<PasswordEntry>): Promise<PasswordEntry> => {
    if (isDevelopment) {
      await mockDelay();
      const index = mockPasswords.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Password not found');
      mockPasswords[index] = {
        ...mockPasswords[index],
        ...password,
        updatedAt: new Date().toISOString(),
      };
      return mockPasswords[index];
    }
    const response = await api.put(`/passwords/${id}`, password);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (isDevelopment) {
      await mockDelay();
      const index = mockPasswords.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Password not found');
      mockPasswords.splice(index, 1);
      return;
    }
    await api.delete(`/passwords/${id}`);
  },
};

export const userApi = {
  getProfile: async (): Promise<User> => {
    if (isDevelopment) {
      await mockDelay();
      return mockAuthResponse.user;
    }
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    if (isDevelopment) {
      await mockDelay();
      return { ...mockAuthResponse.user, ...data };
    }
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

export default api; 