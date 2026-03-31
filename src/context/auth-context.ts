import { createContext, useContext } from 'react';
import type { FetchUserAttributesOutput } from 'aws-amplify/auth';

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: FetchUserAttributesOutput;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an <AuthProvider>');
  }
  return ctx;
}
