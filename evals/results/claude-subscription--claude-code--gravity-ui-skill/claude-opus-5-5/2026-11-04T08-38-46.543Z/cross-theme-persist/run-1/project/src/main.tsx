// Gravity UI setup: both CSS imports + the outermost ThemeProvider (inside PersistedThemeProvider).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { PersistedThemeProvider } from './theme/PersistedThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistedThemeProvider>
      <App />
    </PersistedThemeProvider>
  </React.StrictMode>,
);
