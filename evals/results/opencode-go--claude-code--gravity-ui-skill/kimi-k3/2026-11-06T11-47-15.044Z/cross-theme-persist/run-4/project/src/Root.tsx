import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

import {loadTheme, saveTheme, type StoredTheme} from './theme-storage';

interface ThemeSwitcherContextValue {
  theme: StoredTheme;
  setTheme: (theme: StoredTheme) => void;
}

const ThemeSwitcherContext = React.createContext<ThemeSwitcherContextValue | null>(null);

export function useThemeSwitcher(): ThemeSwitcherContextValue {
  const context = React.useContext(ThemeSwitcherContext);
  if (!context) {
    throw new Error('useThemeSwitcher must be used within <Root>');
  }
  return context;
}

export function Root({children}: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<StoredTheme>(loadTheme);

  const setTheme = React.useCallback((next: StoredTheme) => {
    setThemeState(next);
    saveTheme(next);
  }, []);

  const contextValue = React.useMemo(() => ({theme, setTheme}), [theme, setTheme]);

  return (
    <ThemeSwitcherContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeSwitcherContext.Provider>
  );
}
