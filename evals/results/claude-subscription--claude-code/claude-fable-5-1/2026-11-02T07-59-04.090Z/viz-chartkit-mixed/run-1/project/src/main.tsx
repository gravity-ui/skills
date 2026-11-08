import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';
import {settings} from '@gravity-ui/chartkit';

import {App} from './App';

settings.set({lang: 'ru'});

function Root() {
    const [theme, setTheme] = React.useState<Theme>('light');
    return (
        <ThemeProvider theme={theme}>
            <App theme={theme} onThemeChange={setTheme} />
        </ThemeProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
);
