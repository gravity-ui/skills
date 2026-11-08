import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, THEME_STORAGE_KEY, readStoredTheme, writeStoredTheme } from './themeStorage';

function createStorage(initial: Record<string, string> = {}) {
    const data = new Map(Object.entries(initial));
    return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
    };
}

describe('themeStorage', () => {
    it('restores a previously saved theme', () => {
        const storage = createStorage();
        writeStoredTheme('dark', storage);
        expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        expect(readStoredTheme(storage)).toBe('dark');
    });

    it('falls back to default for missing or invalid values', () => {
        expect(readStoredTheme(createStorage())).toBe(DEFAULT_THEME);
        expect(readStoredTheme(createStorage({ [THEME_STORAGE_KEY]: 'purple' }))).toBe(DEFAULT_THEME);
        expect(readStoredTheme(null)).toBe(DEFAULT_THEME);
    });

    it('does not throw when storage is unavailable', () => {
        const broken = {
            getItem: () => {
                throw new Error('SecurityError');
            },
            setItem: () => {
                throw new Error('QuotaExceededError');
            },
        };
        expect(readStoredTheme(broken)).toBe(DEFAULT_THEME);
        expect(() => writeStoredTheme('light', broken)).not.toThrow();
    });
});
