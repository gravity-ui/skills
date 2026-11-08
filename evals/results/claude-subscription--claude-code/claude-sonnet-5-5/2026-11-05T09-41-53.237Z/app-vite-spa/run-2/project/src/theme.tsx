import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

interface ThemeApi {
  theme: AppTheme;
  toggleTheme: () => void;
}

const ThemeApiContext = React.createContext<ThemeApi | null>(null);

function getInitialTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage может быть недоступен — просто идём дальше
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<AppTheme>(getInitialTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const api = React.useMemo<ThemeApi>(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );

  return (
    <ThemeApiContext.Provider value={api}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeApiContext.Provider>
  );
}

export function useAppTheme(): ThemeApi {
  const ctx = React.useContext(ThemeApiContext);
  if (!ctx) throw new Error('useAppTheme must be used inside <AppThemeProvider>');
  return ctx;
}
