import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, THEME_STORAGE_KEY, readStoredTheme, writeStoredTheme } from './themeStorage';

function createStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
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
  it('returns the default theme when nothing is stored', () => {
    expect(readStoredTheme(createStorage())).toBe(DEFAULT_THEME);
  });

  it('round-trips a saved theme (survives a "reload")', () => {
    const storage = createStorage();
    writeStoredTheme('dark', storage);
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(readStoredTheme(storage)).toBe('dark');
  });

  it('ignores invalid stored values', () => {
    expect(readStoredTheme(createStorage({ [THEME_STORAGE_KEY]: 'neon' }))).toBe(DEFAULT_THEME);
  });

  it('falls back gracefully when storage throws', () => {
    const broken = createStorage();
    broken.getItem = () => {
      throw new Error('blocked');
    };
    broken.setItem = () => {
      throw new Error('quota');
    };
    expect(() => writeStoredTheme('light', broken)).not.toThrow();
    expect(readStoredTheme(broken)).toBe(DEFAULT_THEME);
  });

  it('works without storage at all', () => {
    expect(readStoredTheme(null)).toBe(DEFAULT_THEME);
  });
});
