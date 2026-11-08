import { useEffect, useState } from 'react';

export const PAGES = [
  { id: 'home', title: 'Главная', href: '#/' },
  { id: 'tasks', title: 'Задачи', href: '#/tasks' },
  { id: 'about', title: 'О приложении', href: '#/about' },
] as const;

export type PageId = (typeof PAGES)[number]['id'];

function pageFromHash(): PageId {
  return PAGES.find((p) => p.href === window.location.hash)?.id ?? 'home';
}

/** Текущая страница по hash-адресу (#/, #/tasks, #/about). */
export function useCurrentPage(): PageId {
  const [page, setPage] = useState<PageId>(pageFromHash);

  useEffect(() => {
    const sync = () => setPage(pageFromHash());
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return page;
}
