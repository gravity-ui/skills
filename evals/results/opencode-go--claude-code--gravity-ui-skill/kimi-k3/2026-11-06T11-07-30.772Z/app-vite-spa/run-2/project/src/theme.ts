import React from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'demo-app-theme';

function readInitialTheme(): AppTheme {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
    } catch {
        // localStorage is unavailable — fall through to the default
    }
    return 'light';
}

export function useAppTheme(): [AppTheme, (theme: AppTheme) => void] {
    const [theme, setTheme] = React.useState<AppTheme>(readInitialTheme);

    const updateTheme = React.useCallback((nextTheme: AppTheme) => {
        setTheme(nextTheme);
        try {
            window.localStorage.setItem(STORAGE_KEY, nextTheme);
        } catch {
            // ignore persistence errors
        }
    }, []);

    return [theme, updateTheme];
}
