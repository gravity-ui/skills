import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage may be unavailable
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

type ThemeSwitchContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const ThemeSwitchContext = React.createContext<ThemeSwitchContextValue | null>(null);

// uikit v7: the theme is controlled only via the `theme` prop of ThemeProvider
// (useTheme/useThemeValue are read-only), so the state lives above the provider.
export function AppThemeProvider({children}: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<AppTheme>(getInitialTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(() => ({theme, setTheme}), [theme, setTheme]);

  return (
    <ThemeSwitchContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeSwitchContext.Provider>
  );
}

export function useThemeSwitch(): ThemeSwitchContextValue {
  const ctx = React.useContext(ThemeSwitchContext);
  if (!ctx) {
    throw new Error('useThemeSwitch must be used within AppThemeProvider');
  }
  return ctx;
}
