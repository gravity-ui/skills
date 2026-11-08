import { useCallback, useState } from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function readSavedTheme(): AppTheme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function getInitialTheme(): AppTheme {
  const saved = readSavedTheme();
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Current theme. Defaults to the system preference; only an explicit choice
 * is written to localStorage, so a first visit keeps following the OS setting.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(getInitialTheme);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (e.g. private mode); the theme still works for this session.
    }
  }, []);

  return { theme, setTheme };
}
