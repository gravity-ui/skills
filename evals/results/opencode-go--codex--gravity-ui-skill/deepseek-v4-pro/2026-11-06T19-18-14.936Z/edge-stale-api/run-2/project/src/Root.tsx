import React, { useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { App } from './App';
import { ThemeContext } from './ThemeContext';

export function Root() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
