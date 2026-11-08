import { useEffect, useState } from 'react';

/* ───────────────────────────── Theme ───────────────────────────── */

export type ThemeName = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage может быть недоступен — тогда используем системную тему.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Текущая тема и функция её смены; выбор сохраняется между перезагрузками. */
export function useTheme(): [ThemeName, (theme: ThemeName) => void] {
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ничего страшного: тема просто не сохранится.
    }
  }, [theme]);

  return [theme, setTheme];
}

/* ───────────────────────────── Routing ─────────────────────────── */

export const ROUTES = ['home', 'tasks', 'about'] as const;
export type Route = (typeof ROUTES)[number];

function parseRoute(hash: string): Route {
  const name = hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(name) ? (name as Route) : 'home';
}

/** Текущая страница на основе хэша URL (#/, #/tasks, #/about). */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
