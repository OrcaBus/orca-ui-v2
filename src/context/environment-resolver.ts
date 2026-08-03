import type {
  AppEnvironment,
  DeployedEnvironment,
  EnvironmentContextValue,
} from './environment-context';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);
const DEV_HOSTNAMES = new Set(['orcaui.dev.umccr.org', 'portal.dev.umccr.org']);
const STG_HOSTNAMES = new Set(['orcaui.stg.umccr.org', 'portal.stg.umccr.org']);
const PROD_HOSTNAMES = new Set([
  'orcaui.umccr.org',
  'orcaui.prod.umccr.org',
  'portal.umccr.org',
  'portal.prod.umccr.org',
]);

export function resolveEnvironmentFromHostname(hostname: string): AppEnvironment {
  if (LOCAL_HOSTNAMES.has(hostname)) return 'local';
  if (STG_HOSTNAMES.has(hostname)) return 'stg';
  if (PROD_HOSTNAMES.has(hostname)) return 'prod';
  if (DEV_HOSTNAMES.has(hostname)) return 'dev';
  return 'dev';
}

/** Deployed environments, ordered as they appear in the env switcher. */
export const DEPLOYED_ENVIRONMENTS = ['dev', 'stg', 'prod'] as const satisfies readonly [
  DeployedEnvironment,
  ...DeployedEnvironment[],
];

/** Canonical `portal` hostname for each deployed environment (used by the env switcher). */
export const ENVIRONMENT_HOSTNAMES: Record<DeployedEnvironment, string> = {
  dev: 'portal.dev.umccr.org',
  stg: 'portal.stg.umccr.org',
  prod: 'portal.umccr.org',
};

/**
 * Build the URL of the current page on another environment's domain.
 * Path (incl. the `/v2/` base), query string and hash are preserved; the
 * hostname is swapped and the scheme is normalised to https on the default
 * port, so this also works from `http://localhost:3000`.
 *
 * Outside a browser (SSR/tests) there is no current page, so the target
 * environment's app root is returned instead.
 */
export function buildEnvironmentUrl(target: DeployedEnvironment, currentHref?: string): string {
  const hostname = ENVIRONMENT_HOSTNAMES[target];
  const href = currentHref ?? (typeof window === 'undefined' ? null : window.location.href);
  if (!href) return `https://${hostname}${import.meta.env.BASE_URL}`;

  const url = new URL(href);
  url.protocol = 'https:';
  url.hostname = hostname;
  url.port = '';
  return url.toString();
}

/** Dev-only features are also available when running against localhost. */
export function isDevEnvironment(environment: AppEnvironment): boolean {
  return environment === 'dev' || environment === 'local';
}

export function getEnvironmentLabel(environment: AppEnvironment): EnvironmentContextValue['label'] {
  if (environment === 'local') return 'Local';
  if (environment === 'prod') return 'Prod';
  if (environment === 'stg') return 'Staging';
  return 'Dev';
}
