import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@gravity-ui/uikit';

const THEME_KEY = 'g-theme';

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'light-hc' || stored === 'dark-hc' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export function useStoredTheme(): [Theme, (next: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  return [theme, setTheme];
}
