import { describe, expect, it } from 'vitest';

import { THEME_STORAGE_KEY, readStoredTheme, writeStoredTheme } from './themeStorage';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
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

describe('themeStorage', () => {
  it('returns fallback when nothing is stored', () => {
    expect(readStoredTheme('light', createMemoryStorage())).toBe('light');
    expect(readStoredTheme('dark', createMemoryStorage())).toBe('dark');
  });

  it('restores a previously written theme', () => {
    const storage = createMemoryStorage();
    writeStoredTheme('dark', storage);
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(readStoredTheme('light', storage)).toBe('dark');
  });

  it('ignores unknown values in storage', () => {
    const storage = createMemoryStorage({ [THEME_STORAGE_KEY]: 'neon' });
    expect(readStoredTheme('light', storage)).toBe('light');
  });

  it('survives a storage that throws', () => {
    const broken = {
      ...createMemoryStorage(),
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    } as Storage;
    expect(() => writeStoredTheme('dark', broken)).not.toThrow();
    expect(readStoredTheme('light', broken)).toBe('light');
  });

  it('works without any storage (SSR / disabled)', () => {
    expect(readStoredTheme('system', null)).toBe('system');
    expect(() => writeStoredTheme('dark', null)).not.toThrow();
  });
});
