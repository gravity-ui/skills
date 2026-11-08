import { describe, expect, it } from 'vitest';

import { THEME_STORAGE_KEY, readStoredTheme, writeStoredTheme } from './themeStorage';

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    dump: () => Object.fromEntries(map),
  };
}

describe('themeStorage', () => {
  it('falls back to system when nothing is stored', () => {
    expect(readStoredTheme(fakeStorage())).toBe('system');
  });

  it('falls back to system when storage is unavailable', () => {
    expect(readStoredTheme(null)).toBe('system');
  });

  it('ignores garbage values', () => {
    expect(readStoredTheme(fakeStorage({ [THEME_STORAGE_KEY]: 'neon' }))).toBe('system');
  });

  it('round-trips the chosen theme', () => {
    const storage = fakeStorage();
    writeStoredTheme('dark', storage);
    expect(storage.dump()).toEqual({ [THEME_STORAGE_KEY]: 'dark' });
    expect(readStoredTheme(storage)).toBe('dark');
  });

  it('swallows write errors', () => {
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => writeStoredTheme('light', broken)).not.toThrow();
  });
});
