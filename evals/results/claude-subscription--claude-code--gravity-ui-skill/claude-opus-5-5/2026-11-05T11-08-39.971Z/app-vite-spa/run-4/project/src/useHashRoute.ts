import { useCallback, useEffect, useState } from 'react';

export type PageId = 'home' | 'tasks' | 'settings';

const PAGES: PageId[] = ['home', 'tasks', 'settings'];

function readPage(): PageId {
  const id = window.location.hash.replace(/^#\/?/, '');
  return (PAGES as string[]).includes(id) ? (id as PageId) : 'home';
}

/**
 * Minimal hash router: the page lives in `location.hash` (`#/tasks`),
 * so browser back/forward and page reload keep working.
 */
export function useHashRoute() {
  const [page, setPage] = useState<PageId>(readPage);

  useEffect(() => {
    const onHashChange = () => setPage(readPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: PageId) => {
    window.location.hash = `/${next}`;
  }, []);

  return { page, navigate };
}
