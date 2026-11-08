import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

/**
 * Начиная с @gravity-ui/uikit v6 (и без изменений в v7/v8) `ThemeProvider`
 * полностью контролируемый: тема передаётся пропом `theme`, а хук `useTheme()`
 * возвращает только текущее значение — сеттера в библиотеке больше нет.
 * Поэтому состояние темы живёт здесь, в приложении, а `ThemeProvider` лишь
 * получает его как проп.
 */

const STORAGE_KEY = 'app-theme';

export interface AppThemeContextValue {
  /** Выбранная пользователем тема. */
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | undefined>(undefined);

function isThemeType(value: unknown): value is ThemeType {
  return value === 'light' || value === 'dark';
}

function readInitialTheme(): ThemeType {
  if (typeof window === 'undefined') {
    return 'light';
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isThemeType(stored)) {
      return stored;
    }
  } catch {
    // localStorage может быть недоступен (приватный режим, запрет cookies) — игнорируем.
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export interface AppThemeProviderProps {
  children?: React.ReactNode;
  /** Тема по умолчанию, если в хранилище ничего нет. По умолчанию — системная. */
  defaultTheme?: ThemeType;
}

export function AppThemeProvider({ children, defaultTheme }: AppThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeType>(() => defaultTheme ?? readInitialTheme());

  const setTheme = React.useCallback((next: ThemeType) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // см. комментарий в readInitialTheme
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeType = prev === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // см. комментарий в readInitialTheme
      }
      return next;
    });
  }, []);

  const value = React.useMemo<AppThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = React.useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme должен вызываться внутри <AppThemeProvider>');
  }
  return ctx;
}
