import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of `value` that updates after `delayMs`.
 * Useful for delaying API-triggering updates while user is typing.
 */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
