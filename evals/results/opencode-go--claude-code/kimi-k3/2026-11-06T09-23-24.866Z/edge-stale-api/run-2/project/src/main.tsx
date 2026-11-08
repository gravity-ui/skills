// Preconfigured Gravity UI setup (CSS imports + ThemeProvider).
// The provider is CONTROLLED: uikit v7 hooks are read-only, so the theme
// state lives here (in `useAppTheme`) and is passed down as the `theme` prop.
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';
import {useAppTheme} from './useAppTheme';

function Root() {
    const {theme, setTheme} = useAppTheme();

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
