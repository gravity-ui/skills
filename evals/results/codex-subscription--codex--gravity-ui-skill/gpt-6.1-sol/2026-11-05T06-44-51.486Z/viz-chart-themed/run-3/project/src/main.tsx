// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, configure, type Theme } from '@gravity-ui/uikit';

import { App } from './App';

configure({lang: 'ru'});

function Root() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('pulse-theme');
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch { return 'light'; }
  });
  function changeTheme(value: 'light' | 'dark') {
    setTheme(value);
    try { localStorage.setItem('pulse-theme', value); } catch { /* Theme works when storage is unavailable. */ }
  }
  return <ThemeProvider theme={theme}><App onThemeChange={changeTheme}/></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
