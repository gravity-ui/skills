import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { ThemeProviderProps } from '@gravity-ui/uikit';

import {
  type AppTheme,
  DEFAULT_APP_THEME,
  THEME_STORAGE_KEY,
  isAppTheme,
  readStoredTheme,
  writeStoredTheme,
} from './themeStorage';

interface AppThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | null>(null);

export interface AppThemeProviderProps extends Omit<ThemeProviderProps, 'theme'> {
  /** Тема по умолчанию, если в localStorage ничего не сохранено. */
  defaultTheme?: AppTheme;
}

/**
 * Обёртка над `ThemeProvider` из Gravity UI, которая хранит выбранную тему
 * в состоянии, пишет её в localStorage и восстанавливает при загрузке.
 */
export function AppThemeProvider({
  defaultTheme = DEFAULT_APP_THEME,
  children,
  ...rest
}: AppThemeProviderProps) {
  // Ленивый инициализатор: читаем localStorage один раз при первом рендере,
  // чтобы страница сразу открылась в сохранённой теме без «мигания».
  const [theme, setThemeState] = React.useState<AppTheme>(() => readStoredTheme(defaultTheme));

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Синхронизация между вкладками: событие `storage` приходит только в другие вкладки.
  React.useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (event.newValue === null) {
        setThemeState(defaultTheme);
      } else if (isAppTheme(event.newValue)) {
        setThemeState(event.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [defaultTheme]);

  const contextValue = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <AppThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme} {...rest}>
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

/** Текущая выбранная тема и функция её смены. */
export function useAppTheme(): AppThemeContextValue {
  const ctx = React.useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within <AppThemeProvider>');
  }
  return ctx;
}
