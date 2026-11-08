// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// ThemeProvider is controlled by ThemeStateProvider so the theme can be switched at runtime.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { ThemeStateProvider } from './theme/ThemeStateProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeStateProvider>
      <App />
    </ThemeStateProvider>
  </React.StrictMode>,
);
