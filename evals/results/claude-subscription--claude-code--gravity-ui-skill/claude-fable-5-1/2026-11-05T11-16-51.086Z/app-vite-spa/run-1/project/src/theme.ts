import * as React from 'react';
import type { ThemeType } from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

function readStoredTheme(): ThemeType {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private mode, SSR) — fall through to the default
  }
  return 'light';
}

/** Light/dark theme state persisted in localStorage. */
export function useAppTheme() {
  const [theme, setTheme] = React.useState<ThemeType>(readStoredTheme);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
