// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// The root ThemeProvider is wrapped by PersistentThemeProvider so the theme
// can be switched at runtime and persisted in localStorage.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { PersistentThemeProvider } from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistentThemeProvider>
      <App />
    </PersistentThemeProvider>
  </React.StrictMode>,
);
