import { useState, useCallback, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Module-level Map cache (js-cache-storage rule)
// Avoids repeated synchronous localStorage reads across the app.
// ---------------------------------------------------------------------------

const storageCache = new Map<string, string | null>();

function getCached(key: string): string | null {
  if (!storageCache.has(key)) {
    try {
      storageCache.set(key, localStorage.getItem(key));
    } catch {
      return null;
    }
  }
  return storageCache.get(key) ?? null;
}

function setCached(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    storageCache.set(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeCached(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
  storageCache.delete(key);
}

// ---------------------------------------------------------------------------
// Auth storage cleanup
// Removes only Amplify/Cognito auth entries (tokens, hosted-UI flags) on logout,
// leaving app-owned `orcabus:*` state (theme, last page, table settings) intact.
// ---------------------------------------------------------------------------

const AUTH_STORAGE_KEY_PREFIXES = ['CognitoIdentityServiceProvider', 'amplify-', 'aws.cognito'];

export function clearAuthStorage(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (AUTH_STORAGE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
        storageCache.delete(key);
      }
    }
  } catch {
    // noop
  }
}

// Invalidate cache when another tab writes to localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key) {
      storageCache.delete(e.key);
    } else {
      storageCache.clear();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      storageCache.clear();
    }
  });
}

// ---------------------------------------------------------------------------
// Versioned key builder (client-localstorage-schema rule)
// ---------------------------------------------------------------------------

function buildKey(key: string, version: string): string {
  return `${key}:${version}`;
}

/**
 * One-time rename migration: if `key` has no stored value but `legacyKey` does,
 * copy the legacy value across (same version) and remove the legacy entry.
 * Returns the adopted raw JSON string, or null when there was nothing to migrate
 * (current value already present, or no legacy value). Exported for unit tests.
 */
export function migrateLegacyStorageKey(
  key: string,
  legacyKey: string,
  version = 'v1'
): string | null {
  const versionedKey = buildKey(key, version);
  if (getCached(versionedKey) !== null) return null; // current value wins

  const legacyVersionedKey = buildKey(legacyKey, version);
  const legacyRaw = getCached(legacyVersionedKey);
  if (legacyRaw === null) return null;

  setCached(versionedKey, legacyRaw);
  removeCached(legacyVersionedKey);
  return legacyRaw;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseLocalStorageOptions<T> {
  /** Version prefix appended to the key (default: "v1"). */
  version?: string;
  /**
   * Optional migration from a previous version.
   * Return the migrated value; the old entry is removed automatically.
   */
  migrate?: (oldValue: unknown, oldVersion: string) => T;
  /** Previous version string to migrate from (required when `migrate` is set). */
  previousVersion?: string;
  /**
   * Legacy base key to adopt a value from (one-time rename migration).
   * If the current key is empty, the legacy key's value (same version) is
   * copied over and the legacy entry removed. Used when a key is renamed,
   * e.g. `theme` → `orcabus:theme`.
   */
  legacyKey?: string;
}

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, SetValue<T>, () => void] {
  const { version = 'v1', migrate, previousVersion, legacyKey } = options;
  const versionedKey = buildKey(key, version);

  // Keep defaultValue in a ref so it never triggers effect re-runs
  const defaultRef = useRef(defaultValue);
  useEffect(() => {
    defaultRef.current = defaultValue;
  }, [defaultValue]);

  // Lazy state initialisation (rerender-lazy-state-init rule)
  const [storedValue, setStoredValue] = useState<T>(() => {
    const raw = getCached(versionedKey);
    if (raw !== null) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return defaultValue;
      }
    }

    // Attempt migration from previous version
    if (migrate && previousVersion) {
      const oldKey = buildKey(key, previousVersion);
      const oldRaw = getCached(oldKey);
      if (oldRaw !== null) {
        try {
          const migrated = migrate(JSON.parse(oldRaw), previousVersion);
          setCached(versionedKey, JSON.stringify(migrated));
          removeCached(oldKey);
          return migrated;
        } catch {
          // Migration failed – fall through to default
        }
      }
    }

    // One-time rename migration: adopt the value stored under a legacy key.
    if (legacyKey) {
      const legacyRaw = migrateLegacyStorageKey(key, legacyKey, version);
      if (legacyRaw !== null) {
        try {
          return JSON.parse(legacyRaw) as T;
        } catch {
          // Legacy value was malformed – fall through to default
        }
      }
    }

    return defaultValue;
  });

  // Stable setter using functional setState (rerender-functional-setstate rule)
  const setValue: SetValue<T> = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        setCached(versionedKey, JSON.stringify(next));
        return next;
      });
    },
    [versionedKey]
  );

  const removeValue = useCallback(() => {
    removeCached(versionedKey);
    setStoredValue(defaultRef.current);
  }, [versionedKey]);

  // Cross-tab synchronisation via the storage event
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key !== versionedKey) return;

      if (e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          setStoredValue(defaultRef.current);
        }
      } else {
        setStoredValue(defaultRef.current);
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [versionedKey]);

  return [storedValue, setValue, removeValue];
}
