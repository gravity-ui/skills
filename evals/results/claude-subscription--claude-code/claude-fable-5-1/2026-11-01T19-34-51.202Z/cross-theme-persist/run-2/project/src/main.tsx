// Gravity UI CSS is wired here. The root ThemeProvider lives in App.tsx so it can
// receive the persisted theme (a nested ThemeProvider would be scoped and would not
// update the <body> theme class).
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
