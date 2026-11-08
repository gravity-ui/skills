import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {App} from './App';

configure({lang: 'ru'});

function Root() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {return localStorage.getItem('pulse-theme') === 'dark' ? 'dark' : 'light';}
    catch {return 'light';}
  });
  function changeTheme(nextTheme: 'light' | 'dark') {
    setTheme(nextTheme);
    try {localStorage.setItem('pulse-theme', nextTheme);} catch {/* Theme remains available when storage is disabled. */}
  }
  return <ThemeProvider theme={theme}><App onThemeChange={changeTheme}/></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
