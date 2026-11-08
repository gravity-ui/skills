import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {DEFAULT_THEME, THEME_STORAGE_KEY, readStoredTheme, writeStoredTheme} from './storage';

function createMemoryStorage(): Storage {
    const data = new Map<string, string>();
    return {
        get length() {
            return data.size;
        },
        clear: () => data.clear(),
        getItem: (key) => data.get(key) ?? null,
        key: (index) => [...data.keys()][index] ?? null,
        removeItem: (key) => void data.delete(key),
        setItem: (key, value) => void data.set(key, String(value)),
    };
}

describe('theme storage', () => {
    beforeEach(() => {
        vi.stubGlobal('window', {localStorage: createMemoryStorage()});
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('falls back to the default theme when nothing is stored', () => {
        expect(readStoredTheme()).toBe(DEFAULT_THEME);
    });

    it('restores a previously written theme', () => {
        writeStoredTheme('dark');
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        expect(readStoredTheme()).toBe('dark');
    });

    it('ignores unknown stored values', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'neon');
        expect(readStoredTheme()).toBe(DEFAULT_THEME);
    });

    it('survives a blocked storage', () => {
        vi.stubGlobal('window', {
            localStorage: {
                getItem: () => {
                    throw new Error('blocked');
                },
                setItem: () => {
                    throw new Error('blocked');
                },
            },
        });
        expect(() => writeStoredTheme('light')).not.toThrow();
        expect(readStoredTheme()).toBe(DEFAULT_THEME);
    });
});
