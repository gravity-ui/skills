import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';

const themeStorageKey = 'theme';

type AppTheme = 'light' | 'dark';

function getStoredTheme(): AppTheme {
  try {
    return window.localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function AppWithTheme() {
  const [theme, setTheme] = React.useState<AppTheme>(getStoredTheme);

  return (
    <ThemeProvider theme={theme}>
      <App
        theme={theme}
        onThemeChange={(isDark) => {
          const nextTheme: AppTheme = isDark ? 'dark' : 'light';

          setTheme(nextTheme);
          try {
            window.localStorage.setItem(themeStorageKey, nextTheme);
          } catch {}
        }}
      />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithTheme />
  </React.StrictMode>,
);
