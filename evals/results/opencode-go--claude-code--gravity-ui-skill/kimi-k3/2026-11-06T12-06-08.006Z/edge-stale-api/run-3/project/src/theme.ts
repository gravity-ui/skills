import type {RealTheme} from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

export function getInitialTheme(): RealTheme {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function persistTheme(theme: RealTheme) {
    window.localStorage.setItem(STORAGE_KEY, theme);
}
