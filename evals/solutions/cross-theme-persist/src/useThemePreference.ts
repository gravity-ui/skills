import { useState } from 'react';
import type { Theme } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'app-theme';
const KNOWN_THEMES: readonly Theme[] = ['system', 'light', 'light-hc', 'dark', 'dark-hc'];
const DEFAULT_THEME: Theme = 'system';

function isTheme(value: string): value is Theme {
  return (KNOWN_THEMES as readonly string[]).includes(value);
}

// Restore the previously chosen theme; fall back to 'system' when nothing valid is stored
// (first visit, cleared storage, or a stale/foreign value under the same key).
function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored !== null && isTheme(stored)) {
      return stored;
    }
  } catch {
    // localStorage can be unavailable (privacy mode / disabled cookies) — use the default.
  }
  return DEFAULT_THEME;
}

export function useThemePreference() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort: the in-memory theme still applies for this session.
    }
  };

  return { theme, setTheme };
}
