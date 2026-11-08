import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

export type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'app-theme';

const ThemeModeContext = React.createContext<ThemeModeContextValue | null>(null);

function getInitialMode(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeModeProvider({children}: {children: React.ReactNode}) {
  const [mode, setModeState] = React.useState<ThemeMode>(getInitialMode);

  const setMode = React.useCallback((next: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  const toggle = React.useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = React.useMemo(() => ({mode, toggle, setMode}), [mode, toggle, setMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={mode}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = React.useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return ctx;
}
