import { describe, expect, it } from 'vitest';
import {
  ENVIRONMENT_HOSTNAMES,
  buildEnvironmentUrl,
  getEnvironmentLabel,
  isDevEnvironment,
  resolveEnvironmentFromHostname,
} from '../environment-resolver';

describe('resolveEnvironmentFromHostname', () => {
  it('resolves local hostnames', () => {
    expect(resolveEnvironmentFromHostname('localhost')).toBe('local');
    expect(resolveEnvironmentFromHostname('127.0.0.1')).toBe('local');
    expect(resolveEnvironmentFromHostname('[::1]')).toBe('local');
  });

  it('resolves dev hostnames', () => {
    expect(resolveEnvironmentFromHostname('orcaui.dev.umccr.org')).toBe('dev');
    expect(resolveEnvironmentFromHostname('portal.dev.umccr.org')).toBe('dev');
  });

  it('resolves stg hostnames', () => {
    expect(resolveEnvironmentFromHostname('orcaui.stg.umccr.org')).toBe('stg');
    expect(resolveEnvironmentFromHostname('portal.stg.umccr.org')).toBe('stg');
  });

  it('resolves prod hostnames', () => {
    expect(resolveEnvironmentFromHostname('orcaui.umccr.org')).toBe('prod');
    expect(resolveEnvironmentFromHostname('orcaui.prod.umccr.org')).toBe('prod');
    expect(resolveEnvironmentFromHostname('portal.umccr.org')).toBe('prod');
    expect(resolveEnvironmentFromHostname('portal.prod.umccr.org')).toBe('prod');
  });

  it('defaults to dev for unknown hostnames', () => {
    expect(resolveEnvironmentFromHostname('example.com')).toBe('dev');
  });
});

describe('ENVIRONMENT_HOSTNAMES', () => {
  it('maps each environment to its canonical portal hostname', () => {
    expect(ENVIRONMENT_HOSTNAMES).toEqual({
      dev: 'portal.dev.umccr.org',
      stg: 'portal.stg.umccr.org',
      prod: 'portal.umccr.org',
    });
  });
});

describe('buildEnvironmentUrl', () => {
  it('swaps only the hostname, preserving path (incl. /v2/), query and hash', () => {
    const current = 'https://portal.dev.umccr.org/v2/files?bucket=test-data&page=2';
    expect(buildEnvironmentUrl('stg', current)).toBe(
      'https://portal.stg.umccr.org/v2/files?bucket=test-data&page=2'
    );
    expect(buildEnvironmentUrl('prod', current)).toBe(
      'https://portal.umccr.org/v2/files?bucket=test-data&page=2'
    );
  });

  it('preserves the hash fragment', () => {
    expect(buildEnvironmentUrl('dev', 'https://portal.stg.umccr.org/v2/runs#overview')).toBe(
      'https://portal.dev.umccr.org/v2/runs#overview'
    );
  });

  it('upgrades the local dev server to https on the default port', () => {
    expect(buildEnvironmentUrl('stg', 'http://localhost:3000/v2/files?bucket=test-data')).toBe(
      'https://portal.stg.umccr.org/v2/files?bucket=test-data'
    );
  });

  it('falls back to the environment app root without a current page', () => {
    expect(buildEnvironmentUrl('dev')).toBe(
      `https://portal.dev.umccr.org${import.meta.env.BASE_URL}`
    );
  });
});

describe('isDevEnvironment', () => {
  it('treats local as dev so dev-only features stay available on localhost', () => {
    expect(isDevEnvironment('local')).toBe(true);
    expect(isDevEnvironment('dev')).toBe(true);
    expect(isDevEnvironment('stg')).toBe(false);
    expect(isDevEnvironment('prod')).toBe(false);
  });
});

describe('getEnvironmentLabel', () => {
  it('returns the friendly label for each environment', () => {
    expect(getEnvironmentLabel('local')).toBe('Local');
    expect(getEnvironmentLabel('dev')).toBe('Dev');
    expect(getEnvironmentLabel('stg')).toBe('Staging');
    expect(getEnvironmentLabel('prod')).toBe('Prod');
  });
});
