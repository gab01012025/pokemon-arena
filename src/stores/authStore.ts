'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
            
            if (sessionData.success) {
              set({ 
                user: sessionData.user, 
                isAuthenticated: true,
                isLoading: false,
              });
            }
          }
          
          return { success: data.success, message: data.message };
        } catch (error) {
          console.error('Login error:', error);
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
            
            if (sessionData.success) {
              set({ 
                user: sessionData.user, 
                isAuthenticated: true,
                isLoading: false,
              });
            }
          }
          
          return { 
            success: data.success, 
            message: data.message,
            errors: data.errors,
          };
        } catch (error) {
          console.error('Register error:', error);
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
          
          if (data.success && data.user) {
            set({ 
              user: data.user, 
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
          console.error('Session check error:', error);
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
