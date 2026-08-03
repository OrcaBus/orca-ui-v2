import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAuthStorage, migrateLegacyStorageKey } from '../useLocalStorage';

// Minimal localStorage mock: stored items are own enumerable properties (so
// `Object.keys(localStorage)` returns the item keys) while the methods live on
// the prototype (and are therefore excluded from `Object.keys`).
class LocalStorageMock {
  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this, key)
      ? (this as unknown as Record<string, string>)[key]
      : null;
  }
  setItem(key: string, value: string): void {
    (this as unknown as Record<string, string>)[key] = String(value);
  }
  removeItem(key: string): void {
    delete (this as unknown as Record<string, string>)[key];
  }
  clear(): void {
    for (const key of Object.keys(this)) {
      delete (this as unknown as Record<string, string>)[key];
    }
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new LocalStorageMock());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('clearAuthStorage', () => {
  it('removes only Amplify/Cognito auth entries, preserving app state', () => {
    localStorage.setItem('CognitoIdentityServiceProvider.abc123.user.accessToken', 'token');
    localStorage.setItem('CognitoIdentityServiceProvider.abc123.LastAuthUser', 'user@x.org');
    localStorage.setItem('amplify-signin-with-hostedUI', 'true');
    localStorage.setItem('aws.cognito.identity-pool', 'id');
    localStorage.setItem('orcabus:last-visited-page:v1', '"/files?page=2"');
    localStorage.setItem('orcabus:theme:v1', '"dark"');
    localStorage.setItem('orcabus:data-table:lab.libraries:settings:v1', '{}');

    clearAuthStorage();

    // Auth entries are removed.
    expect(
      localStorage.getItem('CognitoIdentityServiceProvider.abc123.user.accessToken')
    ).toBeNull();
    expect(localStorage.getItem('CognitoIdentityServiceProvider.abc123.LastAuthUser')).toBeNull();
    expect(localStorage.getItem('amplify-signin-with-hostedUI')).toBeNull();
    expect(localStorage.getItem('aws.cognito.identity-pool')).toBeNull();

    // App state survives.
    expect(localStorage.getItem('orcabus:last-visited-page:v1')).toBe('"/files?page=2"');
    expect(localStorage.getItem('orcabus:theme:v1')).toBe('"dark"');
    expect(localStorage.getItem('orcabus:data-table:lab.libraries:settings:v1')).toBe('{}');
  });
});

describe('migrateLegacyStorageKey', () => {
  it('adopts the legacy value and removes the legacy key when the current key is empty', () => {
    localStorage.setItem('theme-legacy-a:v1', '"dark"');

    const adopted = migrateLegacyStorageKey('orcabus:theme-a', 'theme-legacy-a');

    expect(adopted).toBe('"dark"');
    expect(localStorage.getItem('orcabus:theme-a:v1')).toBe('"dark"');
    expect(localStorage.getItem('theme-legacy-a:v1')).toBeNull();
  });

  it('leaves everything untouched when the current key already has a value', () => {
    localStorage.setItem('orcabus:theme-b:v1', '"light"');
    localStorage.setItem('theme-legacy-b:v1', '"dark"');

    const adopted = migrateLegacyStorageKey('orcabus:theme-b', 'theme-legacy-b');

    expect(adopted).toBeNull();
    expect(localStorage.getItem('orcabus:theme-b:v1')).toBe('"light"');
    expect(localStorage.getItem('theme-legacy-b:v1')).toBe('"dark"');
  });

  it('returns null when there is no legacy value to migrate', () => {
    expect(migrateLegacyStorageKey('orcabus:theme-c', 'theme-legacy-c')).toBeNull();
  });
});
