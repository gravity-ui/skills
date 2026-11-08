import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_APP_THEME, THEME_STORAGE_KEY, readStoredTheme, writeStoredTheme } from './theme';

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
  let localStorage: Storage;

  beforeEach(() => {
    localStorage = createMemoryStorage();
    vi.stubGlobal('window', { localStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to the default theme when nothing is stored', () => {
    expect(readStoredTheme()).toBe(DEFAULT_APP_THEME);
  });

  it('restores the theme that was written', () => {
    writeStoredTheme('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(readStoredTheme()).toBe('dark');

    writeStoredTheme('system');
    expect(readStoredTheme()).toBe('system');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(readStoredTheme()).toBe(DEFAULT_APP_THEME);
  });

  it('does not throw when localStorage is unavailable', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('SecurityError');
      },
    });
    expect(() => writeStoredTheme('dark')).not.toThrow();
    expect(readStoredTheme()).toBe(DEFAULT_APP_THEME);
  });
});
