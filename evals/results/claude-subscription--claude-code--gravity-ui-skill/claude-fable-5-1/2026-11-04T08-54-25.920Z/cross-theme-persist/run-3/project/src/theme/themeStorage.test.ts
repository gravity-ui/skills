import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {DEFAULT_THEME, THEME_STORAGE_KEY, readStoredTheme, writeStoredTheme} from './themeStorage';

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
    beforeEach(() => {
        vi.stubGlobal('localStorage', createMemoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns null when nothing is stored', () => {
        expect(readStoredTheme()).toBeNull();
    });

    it('round-trips a theme', () => {
        writeStoredTheme('dark');
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        expect(readStoredTheme()).toBe('dark');
    });

    it('ignores unknown stored values', () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'neon');
        expect(readStoredTheme()).toBeNull();
    });

    it('does not throw when storage is unavailable', () => {
        vi.stubGlobal('localStorage', undefined);
        expect(() => writeStoredTheme('dark')).not.toThrow();
        expect(readStoredTheme()).toBeNull();
        expect(DEFAULT_THEME).toBe('light');
    });
});
