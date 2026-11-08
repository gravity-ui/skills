// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {configure, ThemeProvider} from '@gravity-ui/uikit';

import {App, type AppTheme} from './App';

configure({lang: 'ru'});

function Root() {
  const [theme, setTheme] = useState<AppTheme>('system');
  return <ThemeProvider theme={theme}><App theme={theme} onThemeChange={setTheme} /></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
