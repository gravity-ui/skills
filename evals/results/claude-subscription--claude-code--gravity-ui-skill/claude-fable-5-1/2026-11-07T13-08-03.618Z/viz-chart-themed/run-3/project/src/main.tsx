// Preconfigured Gravity UI setup is wired here (both CSS imports + ThemeProvider).
// The theme is kept in state so the app (and the chart inside it) can switch
// between light / dark / system at runtime.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, type Theme } from '@gravity-ui/uikit';

import { App } from './App';

function Root() {
  const [theme, setTheme] = React.useState<Theme>('system');

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
