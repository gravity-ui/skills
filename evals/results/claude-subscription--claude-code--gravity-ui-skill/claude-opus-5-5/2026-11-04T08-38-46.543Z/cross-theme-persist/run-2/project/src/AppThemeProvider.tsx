import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import {
  type AppTheme,
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

export function AppThemeProvider({ children }: React.PropsWithChildren) {
  // Lazy initializer: the stored theme is read synchronously before the first
  // render, so the page does not flash the default theme after a reload.
  const [theme, setThemeState] = React.useState<AppTheme>(() => readStoredTheme());

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Keep other open tabs in sync when the theme is changed in one of them.
  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      setThemeState(isAppTheme(event.newValue) ? event.newValue : readStoredTheme());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const context = React.useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within <AppThemeProvider>');
  }
  return context;
}
