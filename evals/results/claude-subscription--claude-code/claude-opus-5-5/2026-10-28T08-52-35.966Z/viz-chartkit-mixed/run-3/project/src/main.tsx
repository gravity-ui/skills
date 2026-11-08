import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {settings as dateSettings} from '@gravity-ui/date-utils';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';

// Подписи осей и тултипов обоих движков форматируются через date-utils:
// грузим русскую локаль до первого рендера, чтобы даты не мигали английскими.
dateSettings
  .loadLocale('ru')
  .then(() => dateSettings.setLocale('ru'))
  .catch(() => {})
  .finally(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ThemeProvider theme="light">
          <App />
        </ThemeProvider>
      </React.StrictMode>,
    );
  });
