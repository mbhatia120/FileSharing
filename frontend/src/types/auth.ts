export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
  mfa_enabled: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
} 