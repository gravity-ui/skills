import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage недоступен — используем системную тему
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeControl {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeControlContext = React.createContext<ThemeControl | undefined>(undefined);

export function ThemeRoot({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<AppTheme>(getInitialTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // игнорируем: тема просто не сохранится
    }
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeControlContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeControlContext.Provider>
  );
}

export function useThemeControl(): ThemeControl {
  const ctx = React.useContext(ThemeControlContext);
  if (!ctx) {
    throw new Error('useThemeControl must be used inside <ThemeRoot>');
  }
  return ctx;
}
