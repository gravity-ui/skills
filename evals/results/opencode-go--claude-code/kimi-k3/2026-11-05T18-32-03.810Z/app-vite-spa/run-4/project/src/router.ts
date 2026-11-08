import React from 'react';

export const ROUTES = ['home', 'about', 'settings'] as const;
export type Route = (typeof ROUTES)[number];

export const ROUTE_TITLES: Record<Route, string> = {
  home: 'Главная',
  about: 'О проекте',
  settings: 'Настройки',
};

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(raw) ? (raw as Route) : 'home';
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = React.useState<Route>(parseHash);

  React.useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = React.useCallback((next: Route) => {
    window.location.hash = `/${next}`;
  }, []);

  return [route, navigate];
}
