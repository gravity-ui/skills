// Gravity UI: подключаем шрифты и базовые стили. ThemeProvider находится внутри App,
// потому что тема переключается пользователем (см. App.tsx).
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
