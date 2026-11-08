import { useEffect, useState } from 'react';

export const PAGE_IDS = ['home', 'tasks', 'settings'] as const;
export type PageId = (typeof PAGE_IDS)[number];

function readPageFromHash(): PageId {
  const id = window.location.hash.replace(/^#\/?/, '');
  return (PAGE_IDS as readonly string[]).includes(id) ? (id as PageId) : 'home';
}

/** Current page, derived from the URL hash (`#/home`, `#/tasks`, `#/settings`). */
export function useHashPage(): PageId {
  const [page, setPage] = useState<PageId>(readPageFromHash);

  useEffect(() => {
    const onHashChange = () => setPage(readPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return page;
}
