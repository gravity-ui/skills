// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import { useState } from 'react';

import { App } from './App';

function Root() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return <ThemeProvider theme={theme}>
    <App onThemeToggle={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} />
  </ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Root /></React.StrictMode>,
);
