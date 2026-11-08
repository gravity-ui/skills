// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';

let theme: 'light' | 'dark' = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';

export function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  rerender();
}

function rerender() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );
}

rerender();
