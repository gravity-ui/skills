// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports).
// ThemeProvider lives in Root, which keeps the theme in state and persists it.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from './Root';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
