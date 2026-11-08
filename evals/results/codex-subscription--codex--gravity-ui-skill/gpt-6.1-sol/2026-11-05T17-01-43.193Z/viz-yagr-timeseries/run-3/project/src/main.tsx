import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';

import {App} from './App';

configure({lang: 'ru'});

function Root() {
  const [theme, setTheme] = React.useState<'system' | 'light' | 'dark'>('system');
  return <ThemeProvider theme={theme}>
    <App onToggleTheme={() => setTheme((current) => {
      const dark = current === 'dark' || (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      return dark ? 'light' : 'dark';
    })} />
  </ThemeProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
