import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter, useSegments } from 'expo-router';
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearAuth,
} from './storage';
import { api } from './api';
import type { User, AuthState, LoginCredentials } from '@/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();
  const segments = useSegments();

  // Load stored auth on mount
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const [storedToken, storedUserJson] = await Promise.all([
          getToken(),
          getStoredUser(),
        ]);

        if (storedToken && storedUserJson) {
          const user = JSON.parse(storedUserJson) as User;
          setState({
            user,
            token: storedToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Failed to load stored auth:', error);
        await clearAuth();
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }

    loadStoredAuth();
  }, []);

  // Set up API unauthorized handler
  useEffect(() => {
    api.setOnUnauthorized(() => {
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.replace('/login');
    });
  }, [router]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!state.isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected route
      router.replace('/login');
    } else if (state.isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
      // Redirect to home if authenticated and on login screen
      if (segments[0] === 'login') {
        router.replace('/(auth)');
      }
    }
  }, [state.isAuthenticated, state.isLoading, segments, router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await api.login(credentials);

    await Promise.all([
      setToken(response.token),
      setStoredUser(JSON.stringify(response.user)),
    ]);

    setState({
      user: response.user,
      token: response.token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
