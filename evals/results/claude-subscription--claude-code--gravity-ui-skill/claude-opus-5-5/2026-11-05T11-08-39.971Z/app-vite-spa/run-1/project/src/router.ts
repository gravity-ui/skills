import { useEffect, useState } from 'react';

export type PageId = 'home' | 'projects' | 'settings';

export const PAGE_IDS: PageId[] = ['home', 'projects', 'settings'];

function readPage(): PageId {
  const id = window.location.hash.replace(/^#\/?/, '');
  return (PAGE_IDS as string[]).includes(id) ? (id as PageId) : 'home';
}

/** Minimal hash router: `#/home`, `#/projects`, `#/settings`. Back/forward work. */
export function usePage(): [PageId, (page: PageId) => void] {
  const [page, setPage] = useState<PageId>(readPage);

  useEffect(() => {
    const onHashChange = () => setPage(readPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: PageId) => {
    window.location.hash = `/${next}`;
  };

  return [page, navigate];
}
