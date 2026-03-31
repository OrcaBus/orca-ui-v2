import { useState, useCallback, useEffect, useReducer, useMemo, type ReactNode } from 'react';
import {
  fetchUserAttributes,
  signInWithRedirect,
  signOut,
  type FetchUserAttributesOutput,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import { toast } from 'sonner';
import config from '@/app/config';
import { AuthContext } from './auth-context';

// ---------- Amplify initialisation (runs once at module load) ----------

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.cognito.USER_POOL_ID,
      userPoolClientId: config.cognito.APP_CLIENT_ID,
      loginWith: { oauth: config.cognito.OAUTH },
    },
  },
});

// ---------- Session helpers ----------

const COGNITO_STORAGE_PREFIX = 'CognitoIdentityServiceProvider';

function hasCognitoSession(): boolean {
  return Object.keys(localStorage).some((key) => key.startsWith(COGNITO_STORAGE_PREFIX));
}

// ---------- State management ----------

interface AuthState {
  isAuthenticated: boolean;
  user: FetchUserAttributesOutput;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: {},
  isLoading: false,
};

type AuthAction =
  | { type: 'AUTHENTICATED'; user: FetchUserAttributesOutput }
  | { type: 'UNAUTHENTICATED' }
  | { type: 'SET_LOADING'; isLoading: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTHENTICATED':
      return { ...state, isAuthenticated: true, user: action.user };
    case 'UNAUTHENTICATED':
      return { ...state, isAuthenticated: false, user: {} };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
  }
}

// ---------- Loading screen ----------

function AuthLoadingScreen() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800 dark:border-neutral-700 dark:border-t-neutral-200' />
        <p className='text-sm text-neutral-500 dark:text-neutral-400'>Authenticating…</p>
      </div>
    </div>
  );
}

// ---------- Provider ----------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitializing, setIsInitializing] = useState(true);

  const initializeAuth = useCallback(async () => {
    if (!hasCognitoSession()) {
      setIsInitializing(false);
      return;
    }

    try {
      const user = await fetchUserAttributes();
      dispatch({ type: 'AUTHENTICATED', user });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      toast.error('Failed to authenticate user');
      dispatch({ type: 'UNAUTHENTICATED' });
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          void initializeAuth();
          break;
        case 'signInWithRedirect_failure':
          console.error('OAuth redirect failed:', payload.data);
          dispatch({ type: 'UNAUTHENTICATED' });
          break;
        case 'signedOut':
          dispatch({ type: 'UNAUTHENTICATED' });
          break;
      }
    });

    void initializeAuth();

    return unsubscribe;
  }, [initializeAuth]);

  const signInWithGoogle = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      console.error('Google sign-in error:', message);
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    } finally {
      localStorage.clear();
      dispatch({ type: 'UNAUTHENTICATED' });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, signInWithGoogle, logout }),
    [state, signInWithGoogle, logout]
  );

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
