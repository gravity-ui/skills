import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import { useStoredTheme } from './useStoredTheme';
import type { AppTheme } from './useStoredTheme';

interface AppThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

/**
 * Outermost (non-scoped) Gravity UI ThemeProvider driven by the theme
 * persisted in localStorage. Exposes the current theme and a setter
 * through `useAppTheme()`.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useStoredTheme();
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside <AppThemeProvider>');
  }
  return context;
}
