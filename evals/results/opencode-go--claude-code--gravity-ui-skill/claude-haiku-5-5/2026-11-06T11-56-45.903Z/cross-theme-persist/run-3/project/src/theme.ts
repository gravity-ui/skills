import { useEffect, useState } from 'react';

export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: ThemeName = 'light';
const THEME_NAMES: readonly ThemeName[] = ['light', 'dark'];

function isThemeName(value: unknown): value is ThemeName {
  return THEME_NAMES.includes(value as ThemeName);
}

// localStorage can throw (privacy mode, disabled storage) — fall back to the default theme.
export function readStoredTheme(): ThemeName {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeName(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(theme: ThemeName): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the theme still works for this session, it just isn't persisted.
  }
}

// Theme state initialised synchronously from storage, so the first render already uses the saved theme.
export function useThemeMode(): [ThemeName, (theme: ThemeName) => void] {
  const [theme, setTheme] = useState<ThemeName>(readStoredTheme);

  useEffect(() => {
    writeStoredTheme(theme);
  }, [theme]);

  return [theme, setTheme];
}
