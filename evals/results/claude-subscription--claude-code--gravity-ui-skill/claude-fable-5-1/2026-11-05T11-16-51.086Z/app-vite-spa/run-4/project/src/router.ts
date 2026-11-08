import { useCallback, useEffect, useState } from 'react';

export type PageId = 'home' | 'tasks' | 'settings';

export const ROUTES: Record<PageId, string> = {
  home: '/',
  tasks: '/tasks',
  settings: '/settings',
};

export function hrefFor(page: PageId): string {
  return `#${ROUTES[page]}`;
}

function parseHash(): PageId {
  const path = window.location.hash.replace(/^#/, '') || '/';
  const match = (Object.keys(ROUTES) as PageId[]).find((id) => ROUTES[id] === path);
  return match ?? 'home';
}

export function useHashRoute() {
  const [page, setPage] = useState<PageId>(parseHash);

  useEffect(() => {
    const onHashChange = () => setPage(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: PageId) => {
    window.location.hash = ROUTES[next];
  }, []);

  return { page, navigate };
}
