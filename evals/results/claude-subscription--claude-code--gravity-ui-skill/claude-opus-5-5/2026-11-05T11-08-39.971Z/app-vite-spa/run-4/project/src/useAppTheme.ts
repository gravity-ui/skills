import { useCallback, useState } from 'react';

export type AppTheme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'app-theme';

function readStoredTheme(): AppTheme {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch {
    // localStorage may be unavailable (private mode, sandboxed iframe) — fall back to default.
  }
  return 'system';
}

/** Theme preference persisted in localStorage. */
export function useAppTheme() {
  const [theme, setThemeState] = useState<AppTheme>(readStoredTheme);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence errors — the theme still applies for this session.
    }
  }, []);

  return { theme, setTheme };
}
