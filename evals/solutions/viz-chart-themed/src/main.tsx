// Preconfigured Gravity UI setup (CSS imports + ThemeProvider), extended so the app theme is
// DYNAMIC: it lives in state and is passed into ThemeProvider, letting App toggle light/dark.
// The chart reads the active Gravity theme from this provider and re-themes automatically.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { App } from './App';

function Root() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onThemeChange={setTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
