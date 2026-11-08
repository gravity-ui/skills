import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import {
    THEME_STORAGE_KEY,
    type ThemeOption,
    isThemeOption,
    readStoredTheme,
    writeStoredTheme,
} from './themeStorage';

interface ThemeSettingContextValue {
    theme: ThemeOption;
    setTheme: (theme: ThemeOption) => void;
}

const ThemeSettingContext = React.createContext<ThemeSettingContextValue | null>(null);

/**
 * Outermost Gravity UI ThemeProvider whose theme is persisted in localStorage.
 * The saved value is read synchronously in the state initializer, so the very first
 * render already uses the restored theme (no light→dark flash after reload).
 */
export function PersistedThemeProvider({ children }: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<ThemeOption>(readStoredTheme);

    const setTheme = React.useCallback((next: ThemeOption) => {
        setThemeState(next);
        writeStoredTheme(next);
    }, []);

    // Keep other open tabs in sync when the theme is changed in one of them.
    React.useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== THEME_STORAGE_KEY) return;
            if (isThemeOption(event.newValue)) setThemeState(event.newValue);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

    return (
        <ThemeSettingContext.Provider value={value}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeSettingContext.Provider>
    );
}

export function useThemeSetting(): ThemeSettingContextValue {
    const context = React.useContext(ThemeSettingContext);
    if (!context) {
        throw new Error('useThemeSetting must be used inside <PersistedThemeProvider>');
    }
    return context;
}
