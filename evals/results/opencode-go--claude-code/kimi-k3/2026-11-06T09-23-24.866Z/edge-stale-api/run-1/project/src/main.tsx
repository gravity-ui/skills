import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider, type RealTheme} from '@gravity-ui/uikit';

import {App} from './App';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): RealTheme {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function Root() {
    // Gravity UI v7: ThemeProvider is controlled — it no longer exposes a
    // setTheme through useTheme(). The app owns the theme state and passes it
    // down via the `theme` prop.
    const [theme, setTheme] = React.useState<RealTheme>(getInitialTheme);

    const toggleTheme = React.useCallback(() => {
        setTheme((prev) => {
            const next: RealTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem(THEME_STORAGE_KEY, next);
            return next;
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <App onToggleTheme={toggleTheme} />
        </ThemeProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
);
