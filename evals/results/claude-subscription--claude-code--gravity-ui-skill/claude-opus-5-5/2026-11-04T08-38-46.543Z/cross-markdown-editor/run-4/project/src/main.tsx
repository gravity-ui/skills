// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, configure as configureUikit } from '@gravity-ui/uikit';
import { configure as configureMarkdownEditor } from '@gravity-ui/markdown-editor';

import { App } from './App';

// Interface language for uikit and the markdown editor toolbar.
configureUikit({ lang: 'ru' });
configureMarkdownEditor({ lang: 'ru' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
