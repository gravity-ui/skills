import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, configure, type Theme} from '@gravity-ui/uikit';

import {App} from './App';

configure({lang: 'ru'});

function Application() {
  const [theme, setTheme] = React.useState<Theme>('system');
  return (
    <ThemeProvider theme={theme}>
      <App onToggleTheme={() => setTheme((current) => {
        const dark = current === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : current.startsWith('dark');
        return dark ? 'light' : 'dark';
      })} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>,
);
