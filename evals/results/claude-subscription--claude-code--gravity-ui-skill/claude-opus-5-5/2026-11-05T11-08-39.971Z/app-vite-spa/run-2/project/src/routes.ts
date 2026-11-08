import { useEffect, useState } from 'react';
import { Gear, House, ListUl } from '@gravity-ui/icons';

export type PageId = 'home' | 'tasks' | 'settings';

export const PAGES: { id: PageId; title: string; icon: typeof House; path: string }[] = [
  { id: 'home', title: 'Главная', icon: House, path: '#/' },
  { id: 'tasks', title: 'Задачи', icon: ListUl, path: '#/tasks' },
  { id: 'settings', title: 'Настройки', icon: Gear, path: '#/settings' },
];

function pageFromHash(hash: string): PageId {
  return PAGES.find((p) => p.path === hash && p.id !== 'home')?.id ?? 'home';
}

/** Minimal hash router: the URL is the source of truth, so back/forward and reload work. */
export function useHashPage(): PageId {
  const [page, setPage] = useState<PageId>(() => pageFromHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setPage(pageFromHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return page;
}

export function pathOf(id: PageId): string {
  return PAGES.find((p) => p.id === id)!.path;
}
