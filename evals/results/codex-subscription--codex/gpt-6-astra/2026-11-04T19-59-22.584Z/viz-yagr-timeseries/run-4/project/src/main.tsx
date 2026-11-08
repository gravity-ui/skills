import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, type Theme} from '@gravity-ui/uikit';

import {App} from './App';

function Root() {
  const [theme, setTheme] = React.useState<Theme>('system');
  return (
    <ThemeProvider theme={theme}>
      <App onThemeChange={setTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
