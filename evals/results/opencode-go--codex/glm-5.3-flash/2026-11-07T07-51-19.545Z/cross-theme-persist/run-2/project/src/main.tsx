// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { readStoredTheme } from './theme';
import { ThemeProvider } from '@gravity-ui/uikit';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={readStoredTheme()}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
