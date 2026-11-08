import { useEffect, useState } from 'react';

import type { PageId, ThemeMode } from './types';

const PAGE_IDS: PageId[] = ['home', 'tasks', 'settings'];
const THEME_STORAGE_KEY = 'app-theme';

/** Parses `#/tasks`, `#tasks`, or an empty hash into a known page id. */
function parsePage(hash: string): PageId {
  const id = hash.replace(/^#\/?/, '') as PageId;
  return PAGE_IDS.includes(id) ? id : 'home';
}

/** Current page derived from the URL hash, so navigation works with the browser back button. */
export function useRoute(): PageId {
  const [page, setPage] = useState<PageId>(() => parsePage(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setPage(parsePage(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return page;
}

function readInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage can be unavailable (privacy mode); fall through to the OS preference.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Theme mode persisted in localStorage; defaults to the OS color scheme on first visit. */
export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(readInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Persistence is best-effort; the in-memory value still works.
    }
  }, [mode]);

  return [mode, setMode];
}
