import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {App} from './App';

function Root() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('pulse-theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });
  const changeTheme = (value: 'light' | 'dark') => {
    setTheme(value);
    try { localStorage.setItem('pulse-theme', value); } catch { /* Keep the selected theme for this session. */ }
  };
  return <ThemeProvider theme={theme}><App theme={theme} setTheme={changeTheme}/></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
