// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, type Theme } from '@gravity-ui/uikit';

import { App, THEME_STORAGE_KEY } from './App';

function readStoredTheme(): Theme {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);

    return theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function Root() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  return (
    <ThemeProvider theme={theme}>
      <App
        onThemeChange={(nextTheme) => {
          try {
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
          } catch {
            // Ignore storage restrictions and keep the current theme active.
          }
          setTheme(nextTheme);
        }}
      />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
