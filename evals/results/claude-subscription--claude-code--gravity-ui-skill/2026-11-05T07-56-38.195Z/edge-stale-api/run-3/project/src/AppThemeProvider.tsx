import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

interface AppThemeContextValue {
    theme: AppTheme;
    setTheme: (theme: AppTheme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | null>(null);

function getInitialTheme(): AppTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Root-level ThemeProvider whose theme is controlled by React state.
 * Being the outermost ThemeProvider, it applies `g-root_theme_*` to <body>.
 */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<AppTheme>(getInitialTheme);

    const setTheme = React.useCallback((next: AppTheme) => {
        setThemeState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // storage may be unavailable (private mode) — theme still switches for the session
        }
    }, []);

    const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

    return (
        <AppThemeContext.Provider value={value}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AppThemeContext.Provider>
    );
}

export function useAppTheme(): AppThemeContextValue {
    const ctx = React.useContext(AppThemeContext);
    if (!ctx) {
        throw new Error('useAppTheme must be used inside <AppThemeProvider>');
    }
    return ctx;
}
