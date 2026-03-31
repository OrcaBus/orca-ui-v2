import { describe, expect, it } from 'vitest';
import { resolveEnvironmentFromHostname } from '../environment-resolver';

describe('resolveEnvironmentFromHostname', () => {
  it('resolves dev hostnames', () => {
    expect(resolveEnvironmentFromHostname('localhost')).toBe('dev');
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
