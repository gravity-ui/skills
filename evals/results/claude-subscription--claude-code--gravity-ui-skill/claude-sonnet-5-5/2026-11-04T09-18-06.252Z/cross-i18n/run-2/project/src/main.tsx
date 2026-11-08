// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { I18nProvider, useI18n } from './i18n';

// ThemeProvider forwards `lang` to uikit components (built-in texts: en / ru).
function Providers({ children }: React.PropsWithChildren) {
  const { lang } = useI18n();
  return (
    <ThemeProvider theme="light" lang={lang}>
      {children}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <Providers>
        <App />
      </Providers>
    </I18nProvider>
  </React.StrictMode>,
);
