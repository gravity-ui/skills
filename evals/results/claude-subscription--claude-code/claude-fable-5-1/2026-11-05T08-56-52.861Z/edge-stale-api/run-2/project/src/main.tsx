import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

// ThemeProvider из uikit контролируемый (проп `theme`, без сеттера в хуках),
// поэтому он рендерится внутри App через AppThemeProvider — там же живёт
// состояние выбранной темы. См. src/theme/AppThemeProvider.tsx.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
