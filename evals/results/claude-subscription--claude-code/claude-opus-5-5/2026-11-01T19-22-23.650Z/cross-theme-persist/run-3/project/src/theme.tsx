import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'app-theme';
export const DEFAULT_THEME: AppTheme = 'light';

const THEMES: readonly AppTheme[] = ['light', 'dark', 'system'];

function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Reads the saved theme; falls back to the default on missing/invalid value or unavailable storage. */
export function readStoredTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode, quota, disabled) — the theme still works for this session.
  }
}

interface AppThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | null>(null);

/**
 * Root Gravity UI ThemeProvider whose theme is persisted in localStorage.
 * The initial value is read synchronously, so the restored theme is applied before the first paint.
 */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Keep other open tabs in sync when the theme is changed in one of them.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeState(isAppTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const context = React.useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
