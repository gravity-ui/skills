import React, { createContext, useContext, useState, useCallback } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

interface ThemeSwitcherContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeSwitcherContext = createContext<ThemeSwitcherContextType>({
    theme: 'light',
    setTheme: () => {},
});

export function useThemeSwitcher() {
    return useContext(ThemeSwitcherContext);
}

export function ThemeSwitcherProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    const handleSetTheme = useCallback((next: Theme) => {
        setTheme(next);
    }, []);

    return (
        <ThemeSwitcherContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeSwitcherContext.Provider>
    );
}
