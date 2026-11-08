// Gravity UI CSS is loaded here. ThemeProvider lives in App.tsx so that the
// theme switcher can control it (a nested provider would be "scoped" and would
// not update <body>, so the outer one must not exist).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
