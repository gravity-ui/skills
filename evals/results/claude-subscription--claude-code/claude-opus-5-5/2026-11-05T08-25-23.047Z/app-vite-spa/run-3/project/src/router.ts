import * as React from 'react';

export const ROUTES = ['home', 'tasks', 'about'] as const;
export type Route = (typeof ROUTES)[number];

const DEFAULT_ROUTE: Route = 'home';

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(path) ? (path as Route) : DEFAULT_ROUTE;
}

export function routeHref(route: Route): string {
  return `#/${route}`;
}

export function navigate(route: Route) {
  window.location.hash = routeHref(route);
}

/** Минимальный hash-роутер: текущая страница берётся из location.hash. */
export function useRoute(): Route {
  const [route, setRoute] = React.useState<Route>(() => parseHash(window.location.hash));

  React.useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
