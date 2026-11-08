import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import { ThemeStateContext, useStoredTheme } from './themeState';

export function ThemeStateProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useStoredTheme();

  return (
    <ThemeStateContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeStateContext.Provider>
  );
}
