import type {Theme} from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

export const DEFAULT_THEME: Theme = 'light';

const KNOWN_THEMES: readonly Theme[] = ['light', 'dark', 'light-hc', 'dark-hc', 'system'];

export function isTheme(value: unknown): value is Theme {
    return typeof value === 'string' && (KNOWN_THEMES as readonly string[]).includes(value);
}

function getStorage(): Storage | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
        // Access to localStorage can throw (e.g. blocked third-party storage).
        return null;
    }
}

/** Returns the persisted theme, or `null` if nothing valid is stored. */
export function readStoredTheme(): Theme | null {
    const storage = getStorage();
    if (!storage) {
        return null;
    }
    try {
        const raw = storage.getItem(THEME_STORAGE_KEY);
        return isTheme(raw) ? raw : null;
    } catch {
        return null;
    }
}

export function writeStoredTheme(theme: Theme): void {
    const storage = getStorage();
    if (!storage) {
        return;
    }
    try {
        storage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Quota exceeded / private mode — persisting is best-effort.
    }
}
