import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {settings} from '@gravity-ui/date-utils';

import {App} from './App';

settings.loadLocale('ru').then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme="light" lang="ru">
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );
});
