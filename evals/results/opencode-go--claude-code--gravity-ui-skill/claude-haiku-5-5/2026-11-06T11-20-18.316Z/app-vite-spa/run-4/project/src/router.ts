import { useEffect, useState } from 'react';

export const PAGE_IDS = ['home', 'tasks', 'about'] as const;
export type PageId = (typeof PAGE_IDS)[number];

function pageFromHash(hash: string): PageId {
  const id = hash.replace(/^#\/?/, '');
  return (PAGE_IDS as readonly string[]).includes(id) ? (id as PageId) : 'home';
}

/** Hash-based href, so every menu item is a real link (works with back/forward and new tabs). */
export function pageHref(id: PageId): string {
  return id === 'home' ? '#/' : `#/${id}`;
}

/** Returns the current page id and re-renders on every hash change. */
export function useCurrentPage(): PageId {
  const [page, setPage] = useState<PageId>(() => pageFromHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return page;
}
