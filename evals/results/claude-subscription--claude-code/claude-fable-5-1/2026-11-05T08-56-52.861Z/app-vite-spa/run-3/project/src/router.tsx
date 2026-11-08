import * as React from 'react';

export type RouteId = 'home' | 'notes' | 'about';

export interface Route {
  id: RouteId;
  path: string;
  title: string;
}

export const routes: Route[] = [
  { id: 'home', path: '/', title: 'Главная' },
  { id: 'notes', path: '/notes', title: 'Заметки' },
  { id: 'about', path: '/about', title: 'О приложении' },
];

/** Builds a hash href for a route path, e.g. "#/notes". */
export function hrefFor(path: string): string {
  return `#${path}`;
}

function readPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '' ? '/' : hash;
}

/** Subscribes to the URL hash and returns the current path ("/", "/notes", ...). */
export function useHashPath(): string {
  const [path, setPath] = React.useState<string>(readPath);

  React.useEffect(() => {
    const onHashChange = () => setPath(readPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return path;
}

export function navigate(path: string): void {
  window.location.hash = path;
}
