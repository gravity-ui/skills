import * as React from 'react';

export type Route = 'home' | 'about' | 'settings';

export interface RouteDef {
  id: Route;
  path: string;
  title: string;
}

export const ROUTES: RouteDef[] = [
  { id: 'home', path: '/', title: 'Главная' },
  { id: 'about', path: '/about', title: 'О проекте' },
  { id: 'settings', path: '/settings', title: 'Настройки' },
];

export function hrefFor(route: Route): string {
  const def = ROUTES.find((r) => r.id === route);
  return `#${def ? def.path : '/'}`;
}

function parseHash(hash: string): Route | null {
  const path = hash.replace(/^#/, '') || '/';
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
  const def = ROUTES.find((r) => r.path === normalized);
  return def ? def.id : null;
}

/** Текущий маршрут из location.hash. `null` — неизвестный путь (404). */
export function useHashRoute(): Route | null {
  const [route, setRoute] = React.useState<Route | null>(() => parseHash(window.location.hash));

  React.useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

export function navigate(route: Route) {
  window.location.hash = hrefFor(route);
}
