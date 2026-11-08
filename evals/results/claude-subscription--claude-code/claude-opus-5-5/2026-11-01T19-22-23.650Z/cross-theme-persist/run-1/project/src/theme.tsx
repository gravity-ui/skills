import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark' | 'system';

export const THEMES: readonly AppTheme[] = ['light', 'dark', 'system'];
export const THEME_STORAGE_KEY = 'app-theme';
export const DEFAULT_THEME: AppTheme = 'light';

function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

// localStorage may be unavailable (privacy mode, disabled storage, SSR) — never let that crash the app.
export function readStoredTheme(): AppTheme {
    try {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isAppTheme(value) ? value : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

function writeStoredTheme(theme: AppTheme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore: the choice just won't survive a reload.
    }
}

interface ThemeControl {
    theme: AppTheme;
    setTheme: (theme: AppTheme) => void;
}

const ThemeControlContext = React.createContext<ThemeControl | undefined>(undefined);

export function useThemeControl(): ThemeControl {
    const ctx = React.useContext(ThemeControlContext);
    if (!ctx) {
        throw new Error('useThemeControl must be used inside <PersistedThemeProvider>');
    }
    return ctx;
}

/**
 * Root Gravity UI ThemeProvider whose theme is persisted in localStorage.
 * The stored value is read synchronously in the state initializer, so the very first
 * render already uses the saved theme (no flash of the default theme after reload).
 */
export function PersistedThemeProvider({ children }: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

    const setTheme = React.useCallback((next: AppTheme) => {
        setThemeState(next);
        writeStoredTheme(next);
    }, []);

    // Keep other open tabs in sync when the theme is changed in one of them.
    React.useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY) {
                setThemeState(isAppTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

    return (
        <ThemeControlContext.Provider value={value}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeControlContext.Provider>
    );
}
