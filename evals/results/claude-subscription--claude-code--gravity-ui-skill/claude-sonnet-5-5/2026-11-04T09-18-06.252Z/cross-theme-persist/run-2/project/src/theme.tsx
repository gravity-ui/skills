import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type ThemeChoice = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: ThemeChoice = 'light';

function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readStoredTheme(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeChoice(stored)) return stored;
  } catch {
    // localStorage may be unavailable (privacy mode, SSR) — use the default
  }
  return DEFAULT_THEME;
}

function writeStoredTheme(theme: ThemeChoice) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore write failures (quota, privacy mode)
  }
}

interface ThemeChoiceContextValue {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
}

const ThemeChoiceContext = React.createContext<ThemeChoiceContextValue | null>(null);

export function useThemeChoice(): ThemeChoiceContextValue {
  const ctx = React.useContext(ThemeChoiceContext);
  if (!ctx) throw new Error('useThemeChoice must be used inside <AppThemeProvider>');
  return ctx;
}

/** Wraps Gravity UI ThemeProvider; the chosen theme is persisted in localStorage. */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
  // Lazy init reads the stored value synchronously on first render → no flash of the wrong theme.
  const [theme, setThemeState] = React.useState<ThemeChoice>(readStoredTheme);

  const setTheme = React.useCallback((next: ThemeChoice) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Keep several open tabs in sync.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isThemeChoice(event.newValue)) {
        setThemeState(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeChoiceContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeChoiceContext.Provider>
  );
}
