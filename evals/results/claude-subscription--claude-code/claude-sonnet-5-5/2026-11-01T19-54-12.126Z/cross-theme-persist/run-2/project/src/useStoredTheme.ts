import { useCallback, useEffect, useState } from 'react';

export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: AppTheme = 'light';

function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark';
}

function readStoredTheme(): AppTheme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(value) ? value : DEFAULT_THEME;
  } catch {
    // localStorage may be unavailable (privacy mode, disabled storage).
    return DEFAULT_THEME;
  }
}

/**
 * Theme state persisted in localStorage. The initial value is read synchronously
 * during the first render, so the saved theme is applied without a flash of the default one.
 */
export function useStoredTheme(): [AppTheme, (theme: AppTheme) => void] {
  const [theme, setThemeState] = useState<AppTheme>(readStoredTheme);

  const setTheme = useCallback((next: AppTheme) => setThemeState(next), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore write errors (quota exceeded, storage disabled).
    }
  }, [theme]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isAppTheme(event.newValue)) {
        setThemeState(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [theme, setTheme];
}
