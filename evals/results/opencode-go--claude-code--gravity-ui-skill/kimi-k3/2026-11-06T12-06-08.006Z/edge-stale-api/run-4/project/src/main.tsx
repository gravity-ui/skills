// Gravity UI setup: both CSS imports + ThemeProvider (theme is now driven by the switcher).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { useThemeSetting } from './theme-setting';

// Theme state must live above ThemeProvider, so it is held here and passed down.
function Root() {
  const [theme, toggleTheme] = useThemeSetting();

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
