import { createContext, useContext } from 'react';

export type AppEnvironment = 'local' | 'dev' | 'stg' | 'prod';

/** Environments with a deployed portal domain — i.e. everything except `local`. */
export type DeployedEnvironment = Exclude<AppEnvironment, 'local'>;

export interface EnvironmentContextValue {
  environment: AppEnvironment;
  label: 'Local' | 'Dev' | 'Staging' | 'Prod';
}

export const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function useEnvironment(): EnvironmentContextValue {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    throw new Error('useEnvironment must be used within an <EnvironmentProvider>');
  }
  return ctx;
}
