import * as React from 'react';

export type RouteId = 'home' | 'projects' | 'settings';

export const ROUTES: Record<RouteId, { path: string; title: string }> = {
  home: { path: '#/', title: 'Главная' },
  projects: { path: '#/projects', title: 'Проекты' },
  settings: { path: '#/settings', title: 'Настройки' },
};

function parseHash(hash: string): RouteId {
  const found = (Object.keys(ROUTES) as RouteId[]).find((id) => ROUTES[id].path === hash);
  return found ?? 'home';
}

/** Minimal hash router: `#/`, `#/projects`, `#/settings`. */
export function useHashRoute() {
  const [route, setRoute] = React.useState<RouteId>(() => parseHash(window.location.hash));

  React.useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  React.useEffect(() => {
    document.title = `${ROUTES[route].title} · Gravity Demo`;
  }, [route]);

  const navigate = React.useCallback((id: RouteId) => {
    window.location.hash = ROUTES[id].path;
  }, []);

  return { route, navigate };
}
