import { createContext, useContext } from 'react';

export type AppEnvironment = 'dev' | 'stg' | 'prod';

export interface EnvironmentContextValue {
  environment: AppEnvironment;
  label: 'Dev' | 'Staging' | 'Prod';
}

export const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function useEnvironment(): EnvironmentContextValue {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    throw new Error('useEnvironment must be used within an <EnvironmentProvider>');
  }
  return ctx;
}
