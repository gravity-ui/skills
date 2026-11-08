import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';

import { Layout } from './Layout';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): RealTheme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = React.useState<RealTheme>(getInitialTheme);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Layout theme={theme} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}
