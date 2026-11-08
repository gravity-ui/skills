import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';
import {setupChartKit} from './viz-widget';

// Register chart engines once, before any ChartKit renders. Engines are lazy-loaded on first use.
setupChartKit('ru');

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme="light">
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
