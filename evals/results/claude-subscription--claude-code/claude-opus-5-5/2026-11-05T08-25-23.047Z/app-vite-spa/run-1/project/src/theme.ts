import * as React from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): AppTheme {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
    } catch {
        // localStorage may be unavailable (private mode, sandboxed iframe) — fall through.
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Light/dark theme state: starts from the saved choice or the OS preference, persists changes. */
export function useAppTheme() {
    const [theme, setTheme] = React.useState<AppTheme>(getInitialTheme);

    React.useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Ignore — the theme still works for the current session.
        }
    }, [theme]);

    const toggleTheme = React.useCallback(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    return {theme, toggleTheme};
}
