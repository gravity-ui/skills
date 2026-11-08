// Preconfigured Gravity UI setup is wired here (both CSS imports + theme provider).
// AppThemeProvider wraps uikit ThemeProvider and persists the chosen theme in localStorage (see theme.tsx).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppThemeProvider } from './theme';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider defaultTheme="light">
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
