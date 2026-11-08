import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: AppTheme = 'light';

function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark';
}

function readStoredTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isAppTheme(stored)) return stored;
  } catch {
    // localStorage может быть недоступен (приватный режим, запрет cookies) — используем тему по умолчанию.
  }
  return DEFAULT_THEME;
}

function writeStoredTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Игнорируем: тема всё равно применится на текущую сессию.
  }
}

interface AppThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: React.PropsWithChildren) {
  // Ленивая инициализация: тема читается до первого рендера, поэтому нет «мигания» светлой темы.
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const next: AppTheme = prev === 'dark' ? 'light' : 'dark';
      writeStoredTheme(next);
      return next;
    });
  }, []);

  // Синхронизация между вкладками.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isAppTheme(event.newValue)) {
        setThemeState(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = React.useContext(AppThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}
