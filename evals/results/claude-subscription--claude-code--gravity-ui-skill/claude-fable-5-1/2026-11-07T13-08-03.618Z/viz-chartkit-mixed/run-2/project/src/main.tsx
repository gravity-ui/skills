import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';
import {registerVisualizationPlugins} from './widgets/VisualizationWidget';

// Регистрируем плагины ChartKit один раз на входе: сами движки графиков подгружаются лениво.
registerVisualizationPlugins();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme="light">
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
