// Gravity UI setup: both CSS imports + a root ThemeProvider (inside AppThemeProvider,
// which restores the persisted theme from localStorage and keeps it in sync).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './App';
import {AppThemeProvider} from './theme/AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppThemeProvider>
            <App />
        </AppThemeProvider>
    </React.StrictMode>,
);
