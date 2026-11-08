import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {configure, ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';

configure({lang: 'ru'});

function Root() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  return <ThemeProvider theme={theme}><App onToggleTheme={() => setTheme((value) => value === 'light' ? 'dark' : 'light')} /></ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
