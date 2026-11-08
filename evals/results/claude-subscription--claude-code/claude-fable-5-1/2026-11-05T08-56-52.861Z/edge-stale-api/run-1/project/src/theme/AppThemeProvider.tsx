import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { ThemeProviderProps } from '@gravity-ui/uikit';

/** Темы, между которыми переключается приложение. */
export type AppTheme = 'light' | 'dark';

export interface AppThemeContextValue {
  /** Текущая выбранная тема. */
  theme: AppTheme;
  /** Установить конкретную тему. */
  setTheme: (theme: AppTheme) => void;
  /** Переключить light <-> dark. */
  toggleTheme: () => void;
}

export const AppThemeContext = React.createContext<AppThemeContextValue | undefined>(undefined);

export const APP_THEME_STORAGE_KEY = 'app-theme';

function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark';
}

function readStoredTheme(): AppTheme | undefined {
  try {
    const stored = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage недоступен (приватный режим, SSR и т.п.) — просто не сохраняем.
  }
}

export interface AppThemeProviderProps
  extends Omit<ThemeProviderProps, 'theme'>,
    React.PropsWithChildren<{}> {
  /** Тема по умолчанию, если в localStorage ничего не сохранено. */
  defaultTheme?: AppTheme;
}

/**
 * Хранит выбранную тему в состоянии React и прокидывает её в `ThemeProvider`
 * Gravity UI через контролируемый проп `theme` — это актуальный способ
 * переключения темы в @gravity-ui/uikit v7 (и v8): сам `ThemeProvider`
 * состояние не хранит и сеттера не отдаёт.
 */
export function AppThemeProvider({
  defaultTheme = 'light',
  children,
  ...themeProviderProps
}: AppThemeProviderProps) {
  const [theme, setThemeState] = React.useState<AppTheme>(
    () => readStoredTheme() ?? defaultTheme,
  );

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

  const value = React.useMemo<AppThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider {...themeProviderProps} theme={theme}>
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const context = React.useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside <AppThemeProvider>');
  }
  return context;
}
