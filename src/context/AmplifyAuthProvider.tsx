import { Suspense, use, useCallback, useEffect, useReducer, useMemo, type ReactNode } from 'react';
import {
  fetchUserAttributes,
  fetchAuthSession,
  signInWithRedirect,
  signOut,
  type FetchUserAttributesOutput,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import { toast } from 'sonner';
import config from '@/app/config';
import { clearAuthStorage } from '@/hooks/useLocalStorage';
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
  if (typeof localStorage === 'undefined') {
    return false;
  }

  return Object.keys(localStorage).some((key) => key.startsWith(COGNITO_STORAGE_PREFIX));
}

// Cognito auto-creates a group like "ap-southeast-2_abcdefg1234_Google" for federated IDP users
const COGNITO_IDP_GROUP_RE = /^[a-z]+-[a-z]+-\d+_[A-Za-z0-9]+_(\w+)$/;

function normalizeGroupName(group: string): string {
  const match = COGNITO_IDP_GROUP_RE.exec(group);
  return match ? `${match[1]} (default)` : group;
}

// ---------- State management ----------

interface AuthState {
  isAuthenticated: boolean;
  user: FetchUserAttributesOutput;
  groups: string[];
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: {},
  groups: [],
  isLoading: false,
};

type AuthAction =
  | { type: 'AUTHENTICATED'; user: FetchUserAttributesOutput; groups: string[] }
  | { type: 'UNAUTHENTICATED' }
  | { type: 'SET_LOADING'; isLoading: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.user,
        groups: action.groups,
        isLoading: false,
      };
    case 'UNAUTHENTICATED':
      return { ...state, isAuthenticated: false, user: {}, groups: [], isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
  }
}

async function resolveCurrentAuthState(): Promise<AuthState> {
  if (!hasCognitoSession()) {
    return initialState;
  }

  try {
    const [user, session] = await Promise.all([fetchUserAttributes(), fetchAuthSession()]);
    const rawGroups =
      (session.tokens?.idToken?.payload['cognito:groups'] as string[] | undefined) ?? [];
    const groups = rawGroups.map(normalizeGroupName);
    return { ...initialState, isAuthenticated: true, user, groups };
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    toast.error('Failed to authenticate user');
    return initialState;
  }
}

let initialAuthStatePromise: Promise<AuthState> | null = null;

function getInitialAuthStatePromise(): Promise<AuthState> {
  initialAuthStatePromise ??= resolveCurrentAuthState();
  return initialAuthStatePromise;
}

function cacheInitialAuthState(state: AuthState) {
  initialAuthStatePromise = Promise.resolve(state);
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
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <ResolvedAuthProvider>{children}</ResolvedAuthProvider>
    </Suspense>
  );
}

function ResolvedAuthProvider({ children }: { children: ReactNode }) {
  const initialAuthState = use(getInitialAuthStatePromise());
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const initializeAuth = useCallback(async () => {
    const nextState = await resolveCurrentAuthState();
    cacheInitialAuthState(nextState);

    if (nextState.isAuthenticated) {
      dispatch({ type: 'AUTHENTICATED', user: nextState.user, groups: nextState.groups });
    } else {
      dispatch({ type: 'UNAUTHENTICATED' });
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
      // Clear only auth tokens; preserve app state (last page, theme, table settings).
      clearAuthStorage();
      cacheInitialAuthState(initialState);
      dispatch({ type: 'UNAUTHENTICATED' });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, signInWithGoogle, logout }),
    [state, signInWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
