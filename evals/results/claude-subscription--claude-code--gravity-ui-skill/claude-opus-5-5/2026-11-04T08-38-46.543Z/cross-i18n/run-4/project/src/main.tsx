// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// ThemeProvider is rendered by LangProvider so it receives the current interface language.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { LangProvider } from './i18n/LangProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider theme="light">
      <App />
    </LangProvider>
  </React.StrictMode>,
);
