import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

export type AppTheme = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: AppTheme = 'system';
const THEMES: readonly AppTheme[] = ['system', 'light', 'dark'];

function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Reads the saved theme; falls back to the default if storage is unavailable or the value is invalid. */
function readStoredTheme(): AppTheme {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isAppTheme(stored) ? stored : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

function writeStoredTheme(theme: AppTheme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Storage may be blocked (privacy mode, quota) — the theme still applies for this session.
    }
}

interface AppThemeContextValue {
    theme: AppTheme;
    setTheme: (theme: AppTheme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | null>(null);

/**
 * Root theme provider: wraps Gravity UI's ThemeProvider (the outermost one themes the whole page)
 * and persists the user's choice in localStorage.
 */
export function AppThemeProvider({children}: React.PropsWithChildren) {
    // Lazy initializer reads storage synchronously before the first render — no flash of the wrong theme.
    const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

    const setTheme = React.useCallback((next: AppTheme) => {
        setThemeState(next);
        writeStoredTheme(next);
    }, []);

    // Keep other open tabs in sync when the theme changes in one of them.
    React.useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY) {
                setThemeState(isAppTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const value = React.useMemo(() => ({theme, setTheme}), [theme, setTheme]);

    return (
        <AppThemeContext.Provider value={value}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AppThemeContext.Provider>
    );
}

export function useAppTheme(): AppThemeContextValue {
    const context = React.useContext(AppThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within AppThemeProvider');
    }
    return context;
}
