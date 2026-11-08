import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type ThemeSetting = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'theme';
const DEFAULT_THEME: ThemeSetting = 'light';

function isThemeSetting(value: unknown): value is ThemeSetting {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readStoredTheme(): ThemeSetting {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeSetting(value) ? value : DEFAULT_THEME;
  } catch {
    // localStorage may be unavailable (private mode, blocked cookies)
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(theme: ThemeSetting) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore: the theme still applies for the current session
  }
}

interface ThemeSettingContextValue {
  theme: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
}

const ThemeSettingContext = React.createContext<ThemeSettingContextValue | null>(null);

/** Holds the selected theme, persists it to localStorage and restores it on load. */
export function PersistentThemeProvider({ children }: React.PropsWithChildren) {
  // Lazy init reads localStorage synchronously, so the first render already uses the saved theme.
  const [theme, setThemeState] = React.useState<ThemeSetting>(readStoredTheme);

  const setTheme = React.useCallback((next: ThemeSetting) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeSettingContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeSettingContext.Provider>
  );
}

export function useThemeSetting(): ThemeSettingContextValue {
  const ctx = React.useContext(ThemeSettingContext);
  if (!ctx) {
    throw new Error('useThemeSetting must be used within PersistentThemeProvider');
  }
  return ctx;
}
