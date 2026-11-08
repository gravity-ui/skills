import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import type { AppTheme } from './themeStorage';
import { useStoredTheme } from './useStoredTheme';

interface ThemeSwitchContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeSwitchContext = React.createContext<ThemeSwitchContextValue | null>(null);

/** Корневой провайдер: хранит выбранную тему, персистит её и отдаёт в Gravity UI ThemeProvider. */
export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useStoredTheme();
  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeSwitchContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeSwitchContext.Provider>
  );
}

export function useThemeSwitch(): ThemeSwitchContextValue {
  const ctx = React.useContext(ThemeSwitchContext);
  if (!ctx) {
    throw new Error('useThemeSwitch must be used inside <ThemeRoot>');
  }
  return ctx;
}
