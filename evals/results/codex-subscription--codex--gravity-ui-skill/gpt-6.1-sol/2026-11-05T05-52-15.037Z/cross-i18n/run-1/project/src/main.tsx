// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import {LanguageProvider, useLanguage} from './i18n';

function LocalizedApp() {
  const {language} = useLanguage();

  return (
    <ThemeProvider theme="light" lang={language}>
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <LocalizedApp />
    </LanguageProvider>
  </React.StrictMode>,
);
