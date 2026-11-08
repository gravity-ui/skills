// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import type { AppTheme } from './App';
import { App } from './App';

const LOCAL_STORAGE_THEME_KEY = 'app-theme';

function Root() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback((checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
