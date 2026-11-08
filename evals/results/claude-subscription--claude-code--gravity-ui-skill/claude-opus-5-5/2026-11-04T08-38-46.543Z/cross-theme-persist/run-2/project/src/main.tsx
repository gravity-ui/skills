import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { AppThemeProvider } from './AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wraps uikit's ThemeProvider and persists the chosen theme in localStorage. */}
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
