// Gravity UI setup: fonts + base styles first, dynamic ThemeProvider below.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

import {App} from './App';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): ThemeType {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function Root() {
    const [theme, setTheme] = React.useState<ThemeType>(getInitialTheme);

    React.useEffect(() => {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

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
