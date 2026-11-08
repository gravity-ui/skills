import { useCallback, useEffect, useState } from 'react';
import type { RealTheme } from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

export type AppTheme = Extract<RealTheme, 'light' | 'dark'>;

const DEFAULT_THEME: AppTheme = 'light';

function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark';
}

export function readStoredTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    // localStorage may be unavailable (SSR, privacy mode, disabled storage).
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(theme: AppTheme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore write failures: the theme still applies for the current session.
  }
}

/**
 * Theme state that is restored from localStorage on mount
 * and persisted there on every change.
 */
export function useStoredTheme(): [AppTheme, (theme: AppTheme) => void] {
  // Lazy initializer: the saved theme is read synchronously before the first
  // render, so the page does not flash the default theme on reload.
  const [theme, setThemeState] = useState<AppTheme>(readStoredTheme);

  useEffect(() => {
    writeStoredTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
  }, []);

  return [theme, setTheme];
}
