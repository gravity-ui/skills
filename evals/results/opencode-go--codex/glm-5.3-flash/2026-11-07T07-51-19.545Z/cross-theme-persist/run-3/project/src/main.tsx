// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, type Theme } from '@gravity-ui/uikit';

import { App } from './App';

const THEME_STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function ThemeState() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onThemeChange={handleThemeChange} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeState />
  </React.StrictMode>,
);
