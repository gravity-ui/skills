// Gravity UI setup: both CSS imports + ThemeProvider.
// The ThemeProvider lives inside AppThemeProvider, which restores the theme from
// localStorage on startup and persists every change (see src/theme/AppThemeProvider.tsx).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { AppThemeProvider } from './theme/AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
