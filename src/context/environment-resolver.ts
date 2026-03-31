import type { AppEnvironment } from './environment-context';

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
