import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import './app.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

// ThemeProvider lives in App, because the theme is switchable at runtime.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
