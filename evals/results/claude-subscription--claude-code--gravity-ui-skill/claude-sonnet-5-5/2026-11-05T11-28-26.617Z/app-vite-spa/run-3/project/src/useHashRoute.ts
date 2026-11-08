import React from 'react';

export type RouteId = 'home' | 'components' | 'settings';

export const ROUTES: RouteId[] = ['home', 'components', 'settings'];

function parseHash(): RouteId {
  const id = window.location.hash.replace(/^#\/?/, '');
  return (ROUTES as string[]).includes(id) ? (id as RouteId) : 'home';
}

export function useHashRoute(): [RouteId, (id: RouteId) => void] {
  const [route, setRoute] = React.useState<RouteId>(parseHash);

  React.useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = React.useCallback((id: RouteId) => {
    window.location.hash = `/${id}`;
  }, []);

  return [route, navigate];
}
