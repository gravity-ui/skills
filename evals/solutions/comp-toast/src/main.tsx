// Preconfigured Gravity UI setup (CSS imports + ThemeProvider) extended with the Toaster wiring:
// a Toaster store instance passed to <ToasterProvider>, and <ToasterComponent/> mounted once —
// in @gravity-ui/uikit v7 toasts only render through this component.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';

import { App } from './App';

const toaster = new Toaster();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="light">
      <ToasterProvider toaster={toaster}>
        <App />
        <ToasterComponent />
      </ToasterProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
