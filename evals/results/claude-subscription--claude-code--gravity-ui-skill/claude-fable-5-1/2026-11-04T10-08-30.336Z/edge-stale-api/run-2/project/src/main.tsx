import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './App';

// `ThemeProvider` lives in App.tsx: in uikit v7 the theme is driven by its `theme` prop,
// so the provider must sit next to the state that switches it (the outermost provider
// is the one that writes the theme class to <body>).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
