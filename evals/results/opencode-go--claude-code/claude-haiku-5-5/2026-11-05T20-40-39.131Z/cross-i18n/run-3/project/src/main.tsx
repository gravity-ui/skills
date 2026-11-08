// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { I18nProvider, useI18n } from './i18n/I18nProvider';

// ThemeProvider's `lang` localizes Gravity UI's built-in component strings (e.g. pagination).
function LocalizedThemeProvider({ children }: { children: React.ReactNode }) {
  const { language } = useI18n();
  return (
    <ThemeProvider theme="light" lang={language}>
      {children}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <LocalizedThemeProvider>
        <App />
      </LocalizedThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
);
