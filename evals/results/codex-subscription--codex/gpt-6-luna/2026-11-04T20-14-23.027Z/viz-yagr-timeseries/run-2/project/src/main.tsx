import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';

function Root() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const change = (event: Event) => setTheme((event as CustomEvent<'light' | 'dark'>).detail);
    window.addEventListener('theme-toggle', change);
    return () => window.removeEventListener('theme-toggle', change);
  }, []);
  return <ThemeProvider theme={theme}><App /></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root /></React.StrictMode>);
