// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { RealTheme, ThemeType } from '@gravity-ui/uikit';

import { App } from './App';

const themeStorageKey = 'app-theme';
const storedThemeType = localStorage.getItem(themeStorageKey);
const initialTheme: RealTheme = storedThemeType === 'dark' || storedThemeType === 'light' ? storedThemeType : 'system';

function setThemeType(themeType: ThemeType) {
    localStorage.setItem(themeStorageKey, themeType);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={initialTheme}>
        <App onThemeChange={setThemeType} />
    </ThemeProvider>
  </React.StrictMode>,
);
