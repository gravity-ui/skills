import React from 'react';
import type {RealTheme} from '@gravity-ui/uikit';

export type AppTheme = Extract<RealTheme, 'light' | 'dark'>;

const STORAGE_KEY = 'app-theme';

function readStoredTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private mode, disabled storage)
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** App-level theme state persisted to localStorage; initial value falls back to the OS preference. */
export function useAppTheme(): [AppTheme, (theme: AppTheme) => void, () => void] {
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return [theme, setTheme, toggleTheme];
}
