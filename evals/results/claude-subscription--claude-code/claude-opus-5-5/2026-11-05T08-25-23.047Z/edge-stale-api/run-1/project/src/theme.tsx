import * as React from 'react';
import { ThemeProvider, type ThemeType } from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

type ThemeControls = {
    setTheme: (theme: ThemeType) => void;
};

const ThemeControlsContext = React.createContext<ThemeControls | null>(null);

function getInitialTheme(): ThemeType {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
    } catch {
        // localStorage may be unavailable (privacy mode, sandboxed iframe)
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Root-level Gravity UI ThemeProvider whose theme can be changed at runtime.
 * Must be the top-most ThemeProvider: nested providers become scoped
 * and would not update the theme class on <body>.
 */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<ThemeType>(getInitialTheme);

    const controls = React.useMemo<ThemeControls>(
        () => ({
            setTheme: (next) => {
                setThemeState(next);
                try {
                    window.localStorage.setItem(STORAGE_KEY, next);
                } catch {
                    // ignore persistence errors
                }
            },
        }),
        [],
    );

    return (
        <ThemeControlsContext.Provider value={controls}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeControlsContext.Provider>
    );
}

export function useSetTheme() {
    const ctx = React.useContext(ThemeControlsContext);
    if (!ctx) {
        throw new Error('useSetTheme must be used inside <AppThemeProvider>');
    }
    return ctx.setTheme;
}
