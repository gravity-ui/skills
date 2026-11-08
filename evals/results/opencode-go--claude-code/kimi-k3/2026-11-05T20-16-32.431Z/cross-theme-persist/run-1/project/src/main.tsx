// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';
import {getInitialTheme, persistTheme, type Theme} from './theme';

function Root() {
  // Lazy initializer restores the saved theme before the first render,
  // so there is no flash of the wrong theme after a page reload.
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    persistTheme(theme);
  }, [theme]);

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
