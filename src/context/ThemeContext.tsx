import { useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  ThemeContext,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemePreference,
} from './theme-context';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemePreference>('theme', 'system');

  const resolvedTheme: ResolvedTheme = useMemo(
    () => (theme === 'system' ? getSystemTheme() : theme),
    [theme]
  );

  // Apply the .dark class to <html> whenever the resolved theme changes
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for OS-level theme changes when preference is "system"
  useEffect(() => {
    if (theme !== 'system') return;

    const mql = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleChange = () => applyThemeToDOM(getSystemTheme());

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
