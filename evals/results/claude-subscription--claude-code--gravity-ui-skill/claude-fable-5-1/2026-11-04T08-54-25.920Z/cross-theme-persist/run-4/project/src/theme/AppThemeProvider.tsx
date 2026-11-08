import * as React from 'react';
import {ThemeProvider, useTheme} from '@gravity-ui/uikit';

import {
    THEME_STORAGE_KEY,
    isAppTheme,
    readStoredTheme,
    toAppTheme,
    writeStoredTheme,
    type AppTheme,
} from './themeStorage';

interface ThemeSwitcherContextValue {
    setTheme: (theme: AppTheme) => void;
}

const ThemeSwitcherContext = React.createContext<ThemeSwitcherContextValue>({
    setTheme: () => {},
});

/**
 * Outermost theme provider of the app. Owns the selected theme, restores it from
 * localStorage on startup, persists every change, and keeps other tabs in sync.
 */
export function AppThemeProvider({children}: React.PropsWithChildren) {
    // Lazy initializer: the stored value is read synchronously before first paint,
    // so a reload comes up directly in the saved theme.
    const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

    const setTheme = React.useCallback((next: AppTheme) => {
        setThemeState(next);
        writeStoredTheme(next);
    }, []);

    // Follow changes made in another tab/window.
    React.useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key !== THEME_STORAGE_KEY) {
                return;
            }
            if (event.newValue === null) {
                setThemeState(readStoredTheme());
            } else if (isAppTheme(event.newValue)) {
                setThemeState(event.newValue);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const contextValue = React.useMemo(() => ({setTheme}), [setTheme]);

    return (
        <ThemeSwitcherContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeSwitcherContext.Provider>
    );
}

/** Current selected theme (`light` | `dark` | `system`) and a setter that persists it. */
export function useAppTheme(): [AppTheme, (theme: AppTheme) => void] {
    const theme = useTheme();
    const {setTheme} = React.useContext(ThemeSwitcherContext);
    return [toAppTheme(theme), setTheme];
}
