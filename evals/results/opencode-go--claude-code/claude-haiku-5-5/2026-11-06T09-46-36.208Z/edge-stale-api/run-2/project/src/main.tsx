// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, type ThemeType } from '@gravity-ui/uikit';

import { App } from './App';

// The theme lives here: ThemeProvider must stay at the root and is driven by its `theme` prop.
function Root() {
  const [theme, setTheme] = React.useState<ThemeType>('light');

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
