// Gravity UI styles are wired here. The ThemeProvider lives in App.tsx,
// because the active theme is now dynamic (light/dark switcher with
// localStorage persistence), so its state must own the provider.
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
