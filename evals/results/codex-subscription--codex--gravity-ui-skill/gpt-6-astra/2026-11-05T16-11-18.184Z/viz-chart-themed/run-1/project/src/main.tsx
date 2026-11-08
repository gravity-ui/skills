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
  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {localStorage.setItem('pulse-theme', next);} catch { /* The theme still works when storage is unavailable. */ }
  }
  return <ThemeProvider theme={theme}><App onToggleTheme={toggleTheme}/></ThemeProvider>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
