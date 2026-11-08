import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

interface AppThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | undefined>(undefined);

function readInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage может быть недоступен (приватный режим и т.п.)
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<AppTheme>(readInitialTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // игнорируем: тема просто не сохранится между перезагрузками
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  React.useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const value = React.useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = React.useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme должен использоваться внутри AppThemeProvider');
  }
  return ctx;
}
