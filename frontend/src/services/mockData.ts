import type { AuthResponse, Password, UserProfile } from '../types';
import { config } from '../config';

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

const mockUser: UserProfile = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockPasswords: Password[] = [
  {
    id: '1',
    title: 'Example Password',
    username: 'user@example.com',
    password: 'encrypted_password',
    url: 'https://example.com',
    notes: 'Example notes',
    tags: ['example', 'demo'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Another Password',
    username: 'another@example.com',
    password: 'another_encrypted_password',
    url: 'https://another-example.com',
    notes: 'Another example notes',
    tags: ['example', 'another'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockApi = {
  auth: {
    login: async (username: string, password: string): Promise<AuthResponse> => {
      await mockDelay();
      if (
        username === config.development.testUsername &&
        password === config.development.testPassword
      ) {
        return {
          access_token: 'mock_access_token',
          token_type: 'bearer',
          user: mockUser,
        };
      }
      throw new Error('Invalid credentials');
    },

    register: async (username: string, email: string, password: string): Promise<UserProfile> => {
      await mockDelay();
      return {
        id: 'mock_user_id',
        username,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
  },

  passwords: {
    getAll: async (): Promise<Password[]> => {
      await mockDelay();
      return mockPasswords;
    },

    getById: async (id: string): Promise<Password> => {
      await mockDelay();
      const password = mockPasswords.find((p) => p.id === id);
      if (!password) {
        throw new Error('Password not found');
      }
      return password;
    },

    create: async ({
      title,
      username,
      url,
      notes,
      tags,
    }: {
      title: string;
      username: string;
      password: string;
      url?: string;
      notes?: string;
      tags?: string[];
    }): Promise<Password> => {
      await mockDelay();
      const newId = 'mock_password_' + Math.random().toString(36).substring(7);
      return {
        id: newId,
        title,
        username,
        password: 'encrypted_' + Math.random().toString(36).substring(7),
        url,
        notes,
        tags: tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },

    update: async (
      passwordId: string,
      {
        title,
        username,
        url,
        notes,
        tags,
      }: {
        title?: string;
        username?: string;
        password?: string;
        url?: string;
        notes?: string;
        tags?: string[];
      }
    ): Promise<Password> => {
      await mockDelay();
      const existingPassword = await mockApi.passwords.getById(passwordId);
      return {
        ...existingPassword,
        title: title || existingPassword.title,
        username: username || existingPassword.username,
        url: url || existingPassword.url,
        notes: notes || existingPassword.notes,
        tags: tags || existingPassword.tags,
        updated_at: new Date().toISOString(),
      };
    },

    delete: async (id: string): Promise<void> => {
      await mockDelay();
    },
  },

  users: {
    getCurrentUser: async () => {
      return {
        username: "testuser",
        email: "test@example.com"
      };
    },
    updateProfile: async (data: {
      username?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate validation
      if (data.currentPassword === "wrong") {
        throw new Error("Current password is incorrect");
      }
      
      return {
        username: data.username || "testuser",
        email: data.email || "test@example.com"
      };
    },
    deleteAccount: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}; 