import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { useThemePreference } from './useThemePreference';

// ThemeProvider exposes no setter (useTheme/useThemeValue only read), so the app
// owns the theme state and persists it itself; the provider just receives it.
function Root() {
  const { theme, setTheme } = useThemePreference();

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
