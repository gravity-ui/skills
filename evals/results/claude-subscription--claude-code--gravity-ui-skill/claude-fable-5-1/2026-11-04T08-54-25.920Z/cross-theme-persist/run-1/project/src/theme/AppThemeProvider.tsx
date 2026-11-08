import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

export type {AppTheme} from './storage';

import {
    THEME_STORAGE_KEY,
    type AppTheme,
    isAppTheme,
    readStoredTheme,
    writeStoredTheme,
} from './storage';

interface AppThemeContextValue {
    theme: AppTheme;
    setTheme: (theme: AppTheme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | null>(null);

/**
 * Root theme provider: restores the theme from localStorage on first render
 * (so the page mounts with the right theme), persists every change and keeps
 * other open tabs in sync via the `storage` event.
 */
export function AppThemeProvider({children}: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

    const setTheme = React.useCallback((next: AppTheme) => {
        setThemeState(next);
        writeStoredTheme(next);
    }, []);

    React.useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY && isAppTheme(event.newValue)) {
                setThemeState(event.newValue);
            }
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
        throw new Error('useAppTheme must be used within <AppThemeProvider>');
    }
    return context;
}
