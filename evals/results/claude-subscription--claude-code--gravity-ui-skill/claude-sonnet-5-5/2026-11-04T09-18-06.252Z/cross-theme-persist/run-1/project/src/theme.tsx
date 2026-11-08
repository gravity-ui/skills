import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
export type AppTheme = (typeof THEME_OPTIONS)[number];

const DEFAULT_THEME: AppTheme = 'light';

function isAppTheme(value: unknown): value is AppTheme {
  return THEME_OPTIONS.includes(value as AppTheme);
}

// localStorage can throw (private mode, blocked storage, SSR) — never break the app because of it.
function readStoredTheme(): AppTheme {
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
    // ignore: the theme still applies for the current session
  }
}

type ThemeControl = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const ThemeControlContext = React.createContext<ThemeControl | undefined>(undefined);

/**
 * Owns the selected theme, persists it to localStorage and passes it to the uikit ThemeProvider.
 * uikit's `useTheme()` is read-only, so the state has to live above ThemeProvider.
 */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy init: the saved theme is applied on the very first render (no light-theme flash on reload).
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Keep several open tabs in sync.
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
      <ThemeProvider theme={theme satisfies Theme}>{children}</ThemeProvider>
    </ThemeControlContext.Provider>
  );
}

export function useThemeControl(): ThemeControl {
  const context = React.useContext(ThemeControlContext);
  if (!context) {
    throw new Error('useThemeControl must be used inside <AppThemeProvider>');
  }
  return context;
}
