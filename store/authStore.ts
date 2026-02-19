import { create } from 'zustand';
import { authService, User } from '../services/authService';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    const result = await authService.signIn(email, password);

    if (result.success && result.user) {
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    } else {
      set({
        error: result.error || 'Sign in failed',
        isLoading: false
      });
      return false;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });

    const result = await authService.signUp(email, password, name);

    if (result.success && result.user) {
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    } else {
      set({
        error: result.error || 'Sign up failed',
        isLoading: false
      });
      return false;
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  initialize: () => {
    const user = authService.getCurrentUser();
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
