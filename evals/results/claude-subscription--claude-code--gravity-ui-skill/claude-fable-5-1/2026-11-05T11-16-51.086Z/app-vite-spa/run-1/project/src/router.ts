import * as React from 'react';

export type RouteId = 'home' | 'profile' | 'settings';

export const DEFAULT_ROUTE: RouteId = 'home';

const ROUTE_IDS: RouteId[] = ['home', 'profile', 'settings'];

export function routeHref(id: RouteId): string {
  return `#/${id}`;
}

function parseHash(hash: string): RouteId {
  const id = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return (ROUTE_IDS as string[]).includes(id) ? (id as RouteId) : DEFAULT_ROUTE;
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function getSnapshot(): RouteId {
  return parseHash(window.location.hash);
}

/** Tiny hash-based router: `#/home`, `#/profile`, `#/settings`. */
export function useRoute(): RouteId {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_ROUTE);
}

export function navigate(id: RouteId) {
  window.location.hash = routeHref(id);
}
