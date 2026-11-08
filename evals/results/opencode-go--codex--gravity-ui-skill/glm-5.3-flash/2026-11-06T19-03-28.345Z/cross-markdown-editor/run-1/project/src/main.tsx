import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import { configure, ThemeProvider } from '@gravity-ui/uikit';
import { configure as configureEditor } from '@gravity-ui/markdown-editor';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

configure({ lang: 'ru' });
configureEditor({ lang: 'ru' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
