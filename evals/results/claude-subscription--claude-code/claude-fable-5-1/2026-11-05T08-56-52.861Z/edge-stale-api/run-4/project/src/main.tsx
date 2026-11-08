// AppThemeProvider оборачивает ThemeProvider из @gravity-ui/uikit и хранит выбранную тему
// (localStorage + переключатель в App).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { AppThemeProvider } from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider defaultTheme="system">
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
