import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

export interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeStateContext = React.createContext<ThemeState | undefined>(undefined);

function getInitialTheme(): Theme {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

/**
 * Holds the theme choice in React state (persisted to localStorage) and drives
 * the controlled `ThemeProvider` — the current @gravity-ui/uikit v7 theming API.
 */
export function ThemeStateProvider({children}: React.PropsWithChildren) {
    const [theme, setThemeState] = React.useState<Theme>(getInitialTheme);

    const setTheme = React.useCallback((next: Theme) => {
        setThemeState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
    }, []);

    const value = React.useMemo(() => ({theme, setTheme}), [theme, setTheme]);

    return (
        <ThemeStateContext.Provider value={value}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeStateContext.Provider>
    );
}

export function useThemeState(): ThemeState {
    const context = React.useContext(ThemeStateContext);
    if (!context) {
        throw new Error('useThemeState must be used within ThemeStateProvider');
    }
    return context;
}
