import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

type ThemeSwitcherContextValue = {
    setTheme: (theme: ThemeType) => void;
};

const ThemeSwitcherContext = React.createContext<ThemeSwitcherContextValue | undefined>(
    undefined,
);

function getInitialTheme(): ThemeType {
    if (typeof window === 'undefined') {
        return 'light';
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
    } catch {
        // localStorage may be unavailable (private mode, sandboxed iframe).
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * The root ThemeProvider of the app with a controllable theme.
 * Being the outermost provider, it applies the theme class to `document.body`,
 * so the whole page switches, not just a wrapped section.
 */
export function AppThemeProvider({children}: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<ThemeType>(getInitialTheme);

    const setTheme = React.useCallback((next: ThemeType) => {
        setThemeState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Ignore persistence errors — the theme still switches for this session.
        }
    }, []);

    const contextValue = React.useMemo(() => ({setTheme}), [setTheme]);

    return (
        <ThemeSwitcherContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeSwitcherContext.Provider>
    );
}

export function useSetTheme() {
    const context = React.useContext(ThemeSwitcherContext);
    if (!context) {
        throw new Error('useSetTheme must be used inside <AppThemeProvider>');
    }
    return context.setTheme;
}
