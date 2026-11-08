import { useSyncExternalStore } from 'react';

export type PageId = 'home' | 'tasks' | 'about';

export interface PageInfo {
  id: PageId;
  path: string;
  title: string;
}

export const PAGES: PageInfo[] = [
  { id: 'home', path: '/', title: 'Главная' },
  { id: 'tasks', path: '/tasks', title: 'Задачи' },
  { id: 'about', path: '/about', title: 'О приложении' },
];

const DEFAULT_PAGE = PAGES[0];

function currentPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** Returns the page matching the current URL hash (e.g. `#/tasks`). Unknown hashes fall back to the home page. */
export function useCurrentPage(): PageInfo {
  const path = useSyncExternalStore(subscribe, currentPath);
  return PAGES.find((page) => page.path === path) ?? DEFAULT_PAGE;
}
