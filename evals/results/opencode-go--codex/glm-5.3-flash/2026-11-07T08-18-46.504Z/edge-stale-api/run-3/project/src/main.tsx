import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

import { App } from './App';

function Root({ theme, onThemeChange }: { theme: ThemeType; onThemeChange: (theme: ThemeType) => void }) {
  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onThemeChange={onThemeChange} />
    </ThemeProvider>
  );
}

function RootState() {
  const [theme, setTheme] = useState<ThemeType>('light');

  return <Root theme={theme} onThemeChange={setTheme} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootState />
  </React.StrictMode>,
);
