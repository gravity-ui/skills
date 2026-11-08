import { useEffect, useState } from 'react';

export const routes = {
  home: '/',
  about: '/about',
  settings: '/settings',
} as const;

export type Route = (typeof routes)[keyof typeof routes];

const knownRoutes = new Set<string>(Object.values(routes));

/** Превращает hash вида `#/about` в маршрут; неизвестные пути ведут на главную. */
export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  return knownRoutes.has(path) ? (path as Route) : routes.home;
}

/** Ссылка для навигации по приложению. */
export function hrefFor(route: Route): string {
  return `#${route}`;
}

/** Текущий маршрут на основе `location.hash`; обновляется при переходах и кнопках «назад/вперёд». */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
