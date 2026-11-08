// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { ThemeProviderProps } from '@gravity-ui/uikit';

import { App } from './App';

type AppTheme = 'light' | 'dark';

function Root() {
  const [theme, setTheme] = React.useState<AppTheme>('light');
  const providerTheme: ThemeProviderProps['theme'] = theme;

  return (
    <ThemeProvider theme={providerTheme}>
      <App theme={theme} onThemeChange={setTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
