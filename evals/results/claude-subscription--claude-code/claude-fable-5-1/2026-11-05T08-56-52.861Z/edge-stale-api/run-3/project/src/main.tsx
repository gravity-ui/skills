import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './App';
import {AppThemeProvider} from './theme/AppThemeProvider';

// AppThemeProvider оборачивает `Provider` из @gravity-ui/uikit v8 и управляет его prop `theme`.
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppThemeProvider defaultTheme="system" lang="ru">
            <App />
        </AppThemeProvider>
    </React.StrictMode>,
);
