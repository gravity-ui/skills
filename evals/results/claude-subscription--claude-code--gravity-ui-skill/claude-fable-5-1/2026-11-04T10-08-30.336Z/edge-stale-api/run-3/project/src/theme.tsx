import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {RealTheme, Theme} from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

interface AppThemeContextValue {
  /** Current ThemeProvider theme (may be 'system'). */
  theme: Theme;
  /** Set an explicit theme ('light' | 'dark' | 'light-hc' | 'dark-hc') or 'system'. */
  setTheme: (theme: Theme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | undefined>(undefined);

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'system';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? (stored as RealTheme) : 'system';
}

/**
 * Owns the theme state and feeds it into uikit's `ThemeProvider`.
 * uikit v7 exposes no setter in its theme context, so the app keeps the state itself.
 * Initial value follows the OS (`system`) until the user picks a theme explicitly.
 */
export function AppThemeProvider({children}: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window !== 'undefined') {
      if (next === 'system') {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    }
  }, []);

  const value = React.useMemo(() => ({theme, setTheme}), [theme, setTheme]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = React.useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used inside <AppThemeProvider>');
  }
  return ctx;
}
