import type { AppEnvironment, EnvironmentContextValue } from './environment-context';

const DEV_HOSTNAMES = new Set(['localhost', 'orcaui.dev.umccr.org', 'portal.dev.umccr.org']);
const STG_HOSTNAMES = new Set(['orcaui.stg.umccr.org', 'portal.stg.umccr.org']);
const PROD_HOSTNAMES = new Set([
  'orcaui.umccr.org',
  'orcaui.prod.umccr.org',
  'portal.umccr.org',
  'portal.prod.umccr.org',
]);

export function resolveEnvironmentFromHostname(hostname: string): AppEnvironment {
  if (STG_HOSTNAMES.has(hostname)) return 'stg';
  if (PROD_HOSTNAMES.has(hostname)) return 'prod';
  if (DEV_HOSTNAMES.has(hostname)) return 'dev';
  return 'dev';
}

/** Canonical `portal` hostname for each environment (used by the env switcher). */
export const ENVIRONMENT_HOSTNAMES: Record<AppEnvironment, string> = {
  dev: 'portal.dev.umccr.org',
  stg: 'portal.stg.umccr.org',
  prod: 'portal.umccr.org',
};

/**
 * Build the URL of the current page on another environment's domain.
 * Only the hostname changes — protocol, port, path (incl. the `/v2/` base),
 * query string and hash are preserved.
 */
export function buildEnvironmentUrl(
  target: AppEnvironment,
  currentHref: string = window.location.href
): string {
  const url = new URL(currentHref);
  url.hostname = ENVIRONMENT_HOSTNAMES[target];
  return url.toString();
}

export function getEnvironmentLabel(environment: AppEnvironment): EnvironmentContextValue['label'] {
  if (environment === 'prod') return 'Prod';
  if (environment === 'stg') return 'Staging';
  return 'Dev';
}
