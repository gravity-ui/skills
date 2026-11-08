import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {DEFAULT_THEME, THEME_STORAGE_KEY, isTheme, readStoredTheme, writeStoredTheme} from './themeStorage';

interface AppThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | undefined>(undefined);

/**
 * Owns the application theme: restores it from localStorage on mount,
 * persists every change, and feeds the value into uikit's `ThemeProvider`.
 * Must be the outermost `ThemeProvider` so the theme class lands on `<body>`.
 */
export function AppThemeProvider({children}: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<Theme>(() => readStoredTheme() ?? DEFAULT_THEME);

    const setTheme = React.useCallback((next: Theme) => {
        setThemeState(next);
        writeStoredTheme(next);
    }, []);

    // Keep multiple open tabs in sync.
    React.useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key !== THEME_STORAGE_KEY) {
                return;
            }
            setThemeState(isTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
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
        throw new Error('useAppTheme must be used inside <AppThemeProvider>');
    }
    return context;
}
