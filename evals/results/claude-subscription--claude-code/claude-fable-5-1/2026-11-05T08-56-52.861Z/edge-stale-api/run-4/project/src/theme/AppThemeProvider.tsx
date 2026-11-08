import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

export interface AppThemeContextValue {
  /** Выбранная пользователем тема: 'light' | 'dark' | 'system' (и т. п.). */
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | undefined>(undefined);

function readStoredTheme(): Theme | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  } catch {
    return null;
  }
}

export interface AppThemeProviderProps {
  /** Тема по умолчанию, если в localStorage ничего нет. */
  defaultTheme?: Theme;
  children?: React.ReactNode;
}

/**
 * Хранит выбранную тему, сохраняет её в localStorage и передаёт
 * в `ThemeProvider` из @gravity-ui/uikit, который выставляет класс
 * `g-root_theme_*` на `<body>`.
 */
export function AppThemeProvider({ defaultTheme = 'system', children }: AppThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => readStoredTheme() ?? defaultTheme);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage недоступен (private mode и т. п.) — просто не персистим.
    }
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = React.useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within <AppThemeProvider>');
  }
  return ctx;
}
