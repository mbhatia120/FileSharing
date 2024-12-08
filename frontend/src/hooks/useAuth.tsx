import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; email: string };
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    try {
      // TODO: Implement actual login logic here
      // For now, just simulate a successful login
      set({ isAuthenticated: true, user: { id: '1', email } });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
})); 