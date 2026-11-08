import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';

const themeStorageKey = 'theme';

function readStoredTheme(): 'light' | 'dark' {
  try {
    return window.localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function storeTheme(theme: 'light' | 'dark') {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // localStorage may be unavailable, the selected theme still works until reload.
  }
}

const initialTheme = readStoredTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={initialTheme}>
      <App onThemeChange={storeTheme} />
    </ThemeProvider>
  </React.StrictMode>,
);
