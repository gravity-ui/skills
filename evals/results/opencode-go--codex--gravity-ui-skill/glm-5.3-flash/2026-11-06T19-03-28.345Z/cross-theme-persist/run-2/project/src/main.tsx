import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';

type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

function readStoredTheme(): AppTheme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function ThemedApp() {
  const [theme, setTheme] = React.useState<AppTheme>(readStoredTheme);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Saving the preference is best-effort.
    }
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <App
        darkThemeEnabled={theme === 'dark'}
        onDarkThemeEnabledChange={(enabled) => setTheme(enabled ? 'dark' : 'light')}
      />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>,
);
