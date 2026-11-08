import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { THEME_STORAGE_KEY, readStoredTheme } from './useStoredTheme';

function createStorageStub(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
}

describe('readStoredTheme', () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = { localStorage: createStorageStub() };
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it('falls back to light when nothing is stored', () => {
    expect(readStoredTheme()).toBe('light');
  });

  it('restores a previously saved theme', () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: createStorageStub({ [THEME_STORAGE_KEY]: 'dark' }),
    };
    expect(readStoredTheme()).toBe('dark');
  });

  it('ignores unknown stored values', () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: createStorageStub({ [THEME_STORAGE_KEY]: 'sepia' }),
    };
    expect(readStoredTheme()).toBe('light');
  });

  it('falls back to light when localStorage throws', () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
      },
    };
    expect(readStoredTheme()).toBe('light');
  });
});
