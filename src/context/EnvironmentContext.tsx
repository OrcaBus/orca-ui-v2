import { useEffect, useMemo, type ReactNode } from 'react';
import {
  EnvironmentContext,
  type AppEnvironment,
  type EnvironmentContextValue,
} from './environment-context';
import { resolveEnvironmentFromHostname } from './environment-resolver';

function getEnvironmentLabel(environment: AppEnvironment): EnvironmentContextValue['label'] {
  if (environment === 'prod') return 'Prod';
  if (environment === 'stg') return 'Staging';
  return 'Dev';
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const currentHostname =
    typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : 'localhost';
  const shouldHostnameRedirect =
    currentHostname.includes('orcaui.') || currentHostname.includes('.prod.');

  useEffect(() => {
    if (!shouldHostnameRedirect) return;

    // Redirect legacy domains to the canonical 'portal' domain.
    // This ensures OAuth works correctly by using a consistent callback URL:
    // - orcaui.dev.umccr.org → portal.dev.umccr.org
    // - portal.prod.umccr.org → portal.umccr.org (removes .prod)
    let newHostname = currentHostname;
    newHostname = newHostname.replace('orcaui.', 'portal.');
    newHostname = newHostname.replace('.prod.', '.');

    if (newHostname === currentHostname) return;

    window.location.href = window.location.href.replace(window.location.hostname, newHostname);
  }, [currentHostname, shouldHostnameRedirect]);

  const value = useMemo<EnvironmentContextValue>(() => {
    const environment = resolveEnvironmentFromHostname(currentHostname);
    return {
      environment,
      label: getEnvironmentLabel(environment),
    };
  }, [currentHostname]);

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}
