import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

interface ThemeControls {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeControlsContext = React.createContext<ThemeControls | null>(null);

function getInitialTheme(): AppTheme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({children}: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<AppTheme>(getInitialTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = React.useMemo(
    () => ({theme, setTheme, toggleTheme}),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeControlsContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeControlsContext.Provider>
  );
}

export function useAppTheme(): ThemeControls {
  const ctx = React.useContext(ThemeControlsContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}
