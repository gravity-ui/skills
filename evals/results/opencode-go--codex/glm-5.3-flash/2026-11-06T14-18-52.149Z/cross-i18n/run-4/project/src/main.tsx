import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { AppLanguageProvider, useAppLanguage } from './i18n';
import { App } from './App';

function AppRoot() {
  const { language } = useAppLanguage();

  return (
    <ThemeProvider theme="light" lang={language} fallbackLang="en">
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppLanguageProvider>
      <AppRoot />
    </AppLanguageProvider>
  </React.StrictMode>,
);
