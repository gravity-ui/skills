// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {settings} from '@gravity-ui/date-utils';

import {App} from './App';

// The calendar's month and weekday names come from the locale data, which must be loaded
// before rendering. The page is in Russian, so the ThemeProvider lang matches the loaded locale.
settings.loadLocale('ru').then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme="light" lang="ru">
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );
});
