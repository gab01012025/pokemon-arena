'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/lib/logger';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
  streak: number;
  ladderPoints: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string; errors?: Array<{ field: string; message: string }> }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      login: async (usernameOrEmail, password) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Buscar dados completos do usuário
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            
            if (sessionData.success && sessionData.data?.user) {
              set({ 
                user: sessionData.data.user, 
                isAuthenticated: true,
                isLoading: false,
              });
            }
          }
          
          const message = data.success
            ? data.data?.message
            : data.error?.message || 'Login failed';
          return { success: data.success, message };
        } catch (error) {
          logger.error('Login error:', error instanceof Error ? error : undefined);
          return { success: false, message: 'Connection error. Please try again.' };
        }
      },
      
      register: async (username, email, password, confirmPassword) => {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Buscar dados completos do usuário
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            
            if (sessionData.success && sessionData.data?.user) {
              set({ 
                user: sessionData.data.user, 
                isAuthenticated: true,
                isLoading: false,
              });
            }
          }
          
          const message = data.success
            ? data.data?.message
            : data.error?.message || 'Registration failed';
          return { 
            success: data.success, 
            message,
            errors: data.errors,
          };
        } catch (error) {
          logger.error('Register error:', error instanceof Error ? error : undefined);
          return { success: false, message: 'Connection error. Please try again.' };
        }
      },
      
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
      
      checkSession: async () => {
        try {
          set({ isLoading: true });
          
          const response = await fetch('/api/auth/session');
          const data = await response.json();
          
          if (data.success && data.data?.user) {
            set({ 
              user: data.data.user, 
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          logger.error('Session check error:', error instanceof Error ? error : undefined);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'pokemon-arena-auth',
      partialize: (state) => ({ 
        // Não persistir dados sensíveis
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
