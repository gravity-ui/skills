import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './App';

// ThemeProvider живёт внутри App: страница сама управляет темой (светлая / тёмная / системная),
// а класс темы ставится на body, чтобы её наследовали и элементы, рендерящиеся в body (тултип графика).
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
