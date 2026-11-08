// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, type Theme } from '@gravity-ui/uikit';

import { AppThemeContext } from './ThemeContext';
import { App } from './App';

function Root() {
  const [theme, setTheme] = useState<Theme>('system');

  return (
    <AppThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
