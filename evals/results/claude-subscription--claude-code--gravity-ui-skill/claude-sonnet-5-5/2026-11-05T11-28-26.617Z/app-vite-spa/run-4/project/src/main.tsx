// Gravity UI setup: both CSS imports + theme provider (see theme.tsx).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';

import {App} from './App';
import {ThemeModeProvider} from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeModeProvider>
  </React.StrictMode>,
);
