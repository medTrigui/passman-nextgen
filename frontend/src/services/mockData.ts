import type { PasswordEntry, User, AuthResponse } from '../types';

export const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
};

export const mockPasswords: PasswordEntry[] = [
  {
    id: '1',
    title: 'Gmail Account',
    username: 'testuser@gmail.com',
    password: 'securepass123',
    url: 'https://gmail.com',
    notes: 'Personal email account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['email', 'personal'],
  },
  {
    id: '2',
    title: 'GitHub',
    username: 'testuser',
    password: 'githubpass456',
    url: 'https://github.com',
    notes: 'Development account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['development', 'work'],
  },
];

export const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token',
  user: mockUser,
}; 