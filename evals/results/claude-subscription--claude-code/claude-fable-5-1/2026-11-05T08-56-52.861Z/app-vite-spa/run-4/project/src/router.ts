import { useCallback, useEffect, useState } from 'react';

export const ROUTE_PATHS = ['/', '/about', '/settings'] as const;

export type RoutePath = (typeof ROUTE_PATHS)[number];

function isRoutePath(value: string): value is RoutePath {
  return (ROUTE_PATHS as readonly string[]).includes(value);
}

/**
 * Превращает `window.location.hash` в путь маршрута.
 * Пустой хэш — главная страница, неизвестный путь — `null` (страница не найдена).
 */
export function parseHash(hash: string): RoutePath | null {
  let path = hash.startsWith('#') ? hash.slice(1) : hash;
  if (path === '') {
    return '/';
  }
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return isRoutePath(path) ? path : null;
}

export function hrefFor(path: RoutePath): string {
  return `#${path}`;
}

/** Хэш-роутер: без зависимостей, работает на любом статическом хостинге. */
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((path: RoutePath) => {
    window.location.hash = path;
  }, []);

  return { path: parseHash(hash), navigate };
}
