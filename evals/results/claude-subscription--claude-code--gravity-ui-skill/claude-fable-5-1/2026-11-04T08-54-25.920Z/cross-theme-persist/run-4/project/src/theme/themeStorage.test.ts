import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
    DEFAULT_THEME,
    THEME_STORAGE_KEY,
    isAppTheme,
    readStoredTheme,
    writeStoredTheme,
} from './themeStorage';

function createMemoryStorage(): Storage {
    const data = new Map<string, string>();
    return {
        get length() {
            return data.size;
        },
        clear: () => data.clear(),
        getItem: (key) => data.get(key) ?? null,
        key: (index) => Array.from(data.keys())[index] ?? null,
        removeItem: (key) => void data.delete(key),
        setItem: (key, value) => void data.set(key, String(value)),
    };
}

describe('themeStorage', () => {
    let localStorage: Storage;

    beforeEach(() => {
        localStorage = createMemoryStorage();
        vi.stubGlobal('window', {localStorage});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('round-trips the chosen theme through localStorage', () => {
        writeStoredTheme('dark');
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        expect(readStoredTheme()).toBe('dark');
    });

    it('falls back to the default when nothing is stored', () => {
        expect(readStoredTheme()).toBe(DEFAULT_THEME);
    });

    it('ignores corrupt stored values', () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'neon');
        expect(readStoredTheme()).toBe(DEFAULT_THEME);
    });

    it('survives an unavailable localStorage', () => {
        vi.stubGlobal('window', {
            get localStorage(): Storage {
                throw new Error('SecurityError');
            },
        });
        expect(readStoredTheme()).toBe(DEFAULT_THEME);
        expect(() => writeStoredTheme('light')).not.toThrow();
    });

    it('accepts only known theme names', () => {
        expect(isAppTheme('light')).toBe(true);
        expect(isAppTheme('system')).toBe(true);
        expect(isAppTheme('light-hc')).toBe(false);
        expect(isAppTheme(null)).toBe(false);
    });
});
