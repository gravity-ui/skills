import {useCallback, useEffect, useState} from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function readStoredTheme(): AppTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

/**
 * Owns the theme state ABOVE <ThemeProvider>.
 *
 * In @gravity-ui/uikit v7 the theme hooks (`useTheme`, `useThemeValue`) are
 * read-only: there is no context setter, so the provider must be controlled
 * from the outside. This hook holds that state and persists it.
 */
export function useAppTheme() {
    const [theme, setTheme] = useState<AppTheme>(readStoredTheme);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // storage unavailable (private mode, etc.) — non-fatal
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return {theme, setTheme, toggleTheme};
}
