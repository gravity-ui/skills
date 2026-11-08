import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';
export const THEMES = ['light', 'dark', 'system'] as const;
export type AppTheme = (typeof THEMES)[number] & Theme;

const DEFAULT_APP_THEME: AppTheme = 'system';

function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

function readStoredTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_APP_THEME;
  } catch {
    // localStorage may be unavailable (privacy mode, blocked cookies)
    return DEFAULT_APP_THEME;
  }
}

function writeStoredTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore: the theme still applies for the current session
  }
}

type ThemeSetting = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const ThemeSettingContext = React.createContext<ThemeSetting | undefined>(undefined);

/** Wraps Gravity UI `ThemeProvider` and keeps the chosen theme in localStorage. */
export function PersistedThemeProvider({children}: React.PropsWithChildren) {
  // Lazy init: the stored theme is applied on the very first render (no flash of the wrong theme).
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Keep several tabs in sync.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeState(isAppTheme(event.newValue) ? event.newValue : DEFAULT_APP_THEME);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = React.useMemo(() => ({theme, setTheme}), [theme, setTheme]);

  return (
    <ThemeSettingContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeSettingContext.Provider>
  );
}

export function useThemeSetting(): ThemeSetting {
  const ctx = React.useContext(ThemeSettingContext);
  if (!ctx) {
    throw new Error('useThemeSetting must be used within PersistedThemeProvider');
  }
  return ctx;
}
