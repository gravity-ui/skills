import {beforeEach, describe, expect, it} from 'vitest';

import {getInitialTheme, saveTheme} from './theme-storage';

// Minimal window.localStorage stub (node environment has no DOM).
const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  (globalThis as Record<string, unknown>).window = {
    localStorage: {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
    },
  };
});

describe('theme persistence', () => {
  it('defaults to light when nothing is stored', () => {
    expect(getInitialTheme()).toBe('light');
  });

  it('restores a previously saved theme', () => {
    saveTheme('dark');
    expect(getInitialTheme()).toBe('dark');

    saveTheme('light');
    expect(getInitialTheme()).toBe('light');
  });

  it('falls back to the default for invalid stored values', () => {
    store.set('app-theme', 'banana');
    expect(getInitialTheme()).toBe('light');
  });

  it('falls back to the default when localStorage throws', () => {
    (globalThis as Record<string, unknown>).window = {
      localStorage: {
        getItem: () => {
          throw new Error('denied');
        },
        setItem: () => {
          throw new Error('denied');
        },
      },
    };
    expect(getInitialTheme()).toBe('light');
    expect(() => saveTheme('dark')).not.toThrow();
  });
});
