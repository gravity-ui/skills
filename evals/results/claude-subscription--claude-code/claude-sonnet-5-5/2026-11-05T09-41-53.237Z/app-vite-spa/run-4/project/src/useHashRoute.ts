import { useEffect, useState } from 'react';

export type RoutePath = '/' | '/features' | '/about';

export const ROUTES: { path: RoutePath; title: string }[] = [
  { path: '/', title: 'Главная' },
  { path: '/features', title: 'Возможности' },
  { path: '/about', title: 'О проекте' },
];

function readPath(): RoutePath {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  return (ROUTES.find((r) => r.path === raw)?.path ?? '/') as RoutePath;
}

/** Minimal hash router: works on any static host, no extra dependencies. */
export function useHashRoute(): RoutePath {
  const [path, setPath] = useState<RoutePath>(readPath);

  useEffect(() => {
    const onChange = () => setPath(readPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}
