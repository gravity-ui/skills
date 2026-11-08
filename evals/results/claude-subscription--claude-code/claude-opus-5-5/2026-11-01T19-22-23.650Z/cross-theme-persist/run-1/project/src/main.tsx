// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// The root ThemeProvider is wrapped by PersistedThemeProvider so the theme is stored in localStorage.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { PersistedThemeProvider } from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistedThemeProvider>
      <App />
    </PersistedThemeProvider>
  </React.StrictMode>,
);
