import { useEffect, useState } from 'react';

export const ROUTES = [
  { path: '/', label: 'Главная' },
  { path: '/tasks', label: 'Задачи' },
  { path: '/about', label: 'О приложении' },
] as const;

function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
}

/** Returns the current path from the URL hash (e.g. "/tasks") and updates on navigation. */
export function useHashRoute(): string {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}
