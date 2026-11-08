import type {Theme} from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

const SUPPORTED_THEMES: Theme[] = ['system', 'light', 'dark'];

export function getStoredTheme(): Theme {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored && SUPPORTED_THEMES.includes(stored as Theme)) {
            return stored as Theme;
        }
    } catch {
        // localStorage unavailable (private mode, disabled storage) — fall through to default
    }
    return 'system';
}

export function storeTheme(theme: Theme): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // localStorage unavailable — theme still applies for the session
    }
}
