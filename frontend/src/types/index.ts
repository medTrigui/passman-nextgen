export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PasswordCreate {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  tags?: string[];
}

export interface PasswordUpdate {
  title?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  tags?: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
}

// Auth types
export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister extends UserLogin {
  email: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
} 