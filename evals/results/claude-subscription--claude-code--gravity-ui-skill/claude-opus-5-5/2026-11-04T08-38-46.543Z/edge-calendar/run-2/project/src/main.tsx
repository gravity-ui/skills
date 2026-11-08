// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { settings } from '@gravity-ui/date-utils';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';

// Date locale data must be loaded before rendering, otherwise dates fall back to English.
settings.loadLocale('ru').then(() => settings.setLocale('ru')).finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme="light" lang="ru">
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );
});
