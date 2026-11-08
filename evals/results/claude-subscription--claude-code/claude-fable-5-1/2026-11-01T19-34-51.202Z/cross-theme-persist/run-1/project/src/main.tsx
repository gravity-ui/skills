// Preconfigured Gravity UI setup: both CSS imports are wired here.
// ThemeProvider lives inside App, because the theme is user-controlled
// (persisted in localStorage) and must be applied to document.body —
// a nested ThemeProvider would only theme its own subtree.
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
