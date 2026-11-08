import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

// ThemeProvider из Gravity UI живёт внутри App (src/theme.tsx):
// там он получает текущую тему из состояния и переключается кнопкой.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
