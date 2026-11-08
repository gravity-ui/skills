import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { LangProvider } from './i18n/LangProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* LangProvider renders Gravity UI's ThemeProvider and feeds it the current language */}
    <LangProvider theme="light">
      <App />
    </LangProvider>
  </React.StrictMode>,
);
