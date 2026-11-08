import * as React from 'react';

/** The themes this switcher toggles between (uikit `Theme` also supports 'system', 'light-hc', 'dark-hc'). */
export type SwitchableTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function readStoredTheme(): SwitchableTheme {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        // localStorage unavailable (private mode, SSR) — fall back to light
        return 'light';
    }
}

/**
 * Holds the current theme, persists it to localStorage and returns a toggle.
 * The value is meant to be passed to `<ThemeProvider theme={…}>`.
 */
export function useThemeSetting(): [SwitchableTheme, () => void] {
    const [theme, setTheme] = React.useState<SwitchableTheme>(readStoredTheme);

    React.useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // localStorage unavailable — the theme just won't persist
        }
    }, [theme]);

    const toggleTheme = React.useCallback(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    return [theme, toggleTheme];
}
