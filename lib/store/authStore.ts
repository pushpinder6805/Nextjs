import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import * as authApi from '@/lib/api/auth';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<User | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({ identifier, password });
          authApi.storeToken(response.jwt);
          set({ 
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed. Please try again.';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false
          });
          throw new Error(errorMessage);
        }
      },
      
      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register({ username, email, password });
          authApi.storeToken(response.jwt);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Registration failed. Please try again.';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false
          });
          throw new Error(errorMessage);
        }
      },
      
      logout: () => {
        authApi.removeToken();
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },
      
      loadUser: async () => {
        if (!authApi.isAuthenticated()) {
          set({ isAuthenticated: false, user: null });
          return null;
        }
        
        set({ isLoading: true });
        
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false
          });
          return user;
        } catch (error) {
          authApi.removeToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.'
          });
          return null;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 