import {useCallback, useState} from 'react';
import type {Theme} from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';
const KNOWN_THEMES: Theme[] = ['light', 'dark', 'light-hc', 'dark-hc', 'system'];

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && KNOWN_THEMES.includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (privacy mode, SSR) — fall through to the default.
  }
  return 'system';
}

/** App-level theme state that drives `ThemeProvider`'s `theme` prop, persisted in localStorage. */
export function useAppTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence failures; the in-memory state still updates.
    }
  }, []);

  return [theme, setTheme];
}
