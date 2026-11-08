import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/yagr/index.css';

import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {App} from './App';

configure({lang: 'ru'});

function Root() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  return <ThemeProvider theme={theme}><App onThemeChange={setTheme} /></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Root /></React.StrictMode>,
);
