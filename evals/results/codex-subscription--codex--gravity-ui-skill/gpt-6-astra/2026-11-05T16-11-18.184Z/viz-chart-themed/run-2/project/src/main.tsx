import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {App} from './App';

configure({lang: 'ru'});

function Root() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('pulse-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Theme remains available if browser storage is disabled. */ }
    return 'system';
  });
  function changeTheme(value: 'light' | 'dark') {
    setTheme(value);
    try { localStorage.setItem('pulse-theme', value); } catch { /* Storage is optional. */ }
  }
  return <ThemeProvider theme={theme}><App onThemeChange={changeTheme}/></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
