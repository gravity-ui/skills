import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

export const THEMES = ['light', 'dark', 'system'] as const;
export type AppTheme = (typeof THEMES)[number];

const DEFAULT_THEME: AppTheme = 'light';

function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function readStoredTheme(): AppTheme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(value) ? value : DEFAULT_THEME;
  } catch {
    // localStorage may be unavailable (privacy mode, disabled storage, etc.)
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore write errors: the theme still works for the current session.
  }
}

interface ThemeControl {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeControlContext = React.createContext<ThemeControl | undefined>(undefined);

export function useThemeControl(): ThemeControl {
  const ctx = React.useContext(ThemeControlContext);
  if (!ctx) {
    throw new Error('useThemeControl must be used within PersistentThemeProvider');
  }
  return ctx;
}

/**
 * Root Gravity UI ThemeProvider whose theme is persisted in localStorage.
 * The stored value is read synchronously on first render, so there is no
 * flash of the default theme after reload.
 */
export function PersistentThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Keep other open tabs in sync.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeState(isAppTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const control = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeControlContext.Provider value={control}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeControlContext.Provider>
  );
}
