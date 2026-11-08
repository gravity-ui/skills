import React from 'react';

export const ROUTES = ['home', 'projects', 'settings'] as const;
export type Route = (typeof ROUTES)[number];

const DEFAULT_ROUTE: Route = 'home';

function isRoute(value: string): value is Route {
  return (ROUTES as readonly string[]).includes(value);
}

export function parseHash(hash: string): Route {
  const value = hash.replace(/^#\/?/, '');
  return isRoute(value) ? value : DEFAULT_ROUTE;
}

export function hrefFor(route: Route): string {
  return `#/${route}`;
}

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function getSnapshot(): Route {
  return parseHash(window.location.hash);
}

/** Tiny hash-based router: works with browser back/forward and bookmarkable URLs. */
export function useHashRoute(): [Route, (route: Route) => void] {
  const route = React.useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_ROUTE);
  const navigate = React.useCallback((next: Route) => {
    if (next !== getSnapshot()) {
      window.location.hash = hrefFor(next);
    }
  }, []);
  return [route, navigate];
}
