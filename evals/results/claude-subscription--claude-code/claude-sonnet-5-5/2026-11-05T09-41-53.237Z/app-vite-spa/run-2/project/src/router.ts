import React from 'react';

// Минимальный hash-роутер: не требует серверных настроек и доп. зависимостей.
export type RoutePath = '/' | '/features' | '/about';

export const ROUTES: { path: RoutePath; title: string }[] = [
  { path: '/', title: 'Главная' },
  { path: '/features', title: 'Возможности' },
  { path: '/about', title: 'О проекте' },
];

function readPath(): RoutePath {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  return ROUTES.some((r) => r.path === raw) ? (raw as RoutePath) : '/';
}

export function useRoute(): RoutePath {
  const [path, setPath] = React.useState<RoutePath>(readPath);

  React.useEffect(() => {
    const onChange = () => setPath(readPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export const hrefTo = (path: RoutePath) => `#${path}`;
