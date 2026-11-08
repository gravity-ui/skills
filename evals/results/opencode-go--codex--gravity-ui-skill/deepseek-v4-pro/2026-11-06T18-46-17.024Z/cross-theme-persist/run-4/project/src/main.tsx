import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, useThemeType } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { App } from './App';
import { useStoredTheme } from './useStoredTheme';

function Root() {
  const [theme, setTheme] = useStoredTheme();

  return (
    <ThemeProvider theme={theme}>
      <ThemeAwareApp setTheme={setTheme} />
    </ThemeProvider>
  );
}

function ThemeAwareApp({ setTheme }: { setTheme: (next: Theme) => void }) {
  const themeType = useThemeType();

  const toggleTheme = () => {
    if (themeType === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return <App currentTheme={themeType} toggleTheme={toggleTheme} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
