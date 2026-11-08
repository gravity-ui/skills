import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    setTheme: () => {},
});

const storageKey = 'gravity-ui-app-theme';

function readInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(storageKey);
    return storedTheme === 'dark' ? 'dark' : 'light';
}

export function AppThemeProvider({children}: {children: ReactNode}) {
    const [theme, setTheme] = useState<Theme>(readInitialTheme);

    useEffect(() => {
        localStorage.setItem(storageKey, theme);
        document.documentElement.style.colorScheme = theme;
    }, [theme]);

    const value = useMemo(() => ({theme, setTheme}), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    return useContext(ThemeContext);
}
