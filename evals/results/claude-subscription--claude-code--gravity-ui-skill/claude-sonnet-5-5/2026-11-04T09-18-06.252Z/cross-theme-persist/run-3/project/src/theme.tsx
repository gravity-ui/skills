import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: AppTheme = 'light';
const THEMES: readonly AppTheme[] = ['light', 'dark', 'system'];

function isAppTheme(value: unknown): value is AppTheme {
  return THEMES.includes(value as AppTheme);
}

function readStoredTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    // localStorage may be unavailable (private mode, blocked storage)
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore: the theme still works for the current session
  }
}

interface ThemeSwitcherContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeSwitcherContext = React.createContext<ThemeSwitcherContextValue | null>(null);

export function useThemeSwitcher(): ThemeSwitcherContextValue {
  const value = React.useContext(ThemeSwitcherContext);
  if (!value) {
    throw new Error('useThemeSwitcher must be used within AppThemeProvider');
  }
  return value;
}

/** Wraps uikit ThemeProvider: restores the saved theme on load and persists changes. */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
  // Lazy initializer: the saved theme is applied on the very first render (no flash).
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Keep several open tabs in sync.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setThemeState(isAppTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const contextValue = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeSwitcherContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeSwitcherContext.Provider>
  );
}
