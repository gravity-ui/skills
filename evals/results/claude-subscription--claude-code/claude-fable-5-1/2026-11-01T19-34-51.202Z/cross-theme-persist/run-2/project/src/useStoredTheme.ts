import { useCallback, useEffect, useState } from 'react';

import {
  type AppTheme,
  DEFAULT_APP_THEME,
  THEME_STORAGE_KEY,
  isAppTheme,
  readStoredTheme,
  writeStoredTheme,
} from './themeStorage';

/**
 * Theme state backed by localStorage.
 * The initial value is read synchronously so the first render already uses the saved theme.
 * Changes made in another tab are picked up through the `storage` event.
 */
export function useStoredTheme(): [AppTheme, (theme: AppTheme) => void] {
  const [theme, setThemeState] = useState<AppTheme>(() => readStoredTheme() ?? DEFAULT_APP_THEME);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      setThemeState(isAppTheme(event.newValue) ? event.newValue : DEFAULT_APP_THEME);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [theme, setTheme];
}
