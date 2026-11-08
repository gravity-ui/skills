// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { I18nProvider, useI18n } from './i18n';

// Passes the selected language to Gravity UI so its built-in component texts are localized too.
function ThemedApp() {
  const { lang } = useI18n();
  return (
    <ThemeProvider theme="light" lang={lang}>
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemedApp />
    </I18nProvider>
  </React.StrictMode>,
);
