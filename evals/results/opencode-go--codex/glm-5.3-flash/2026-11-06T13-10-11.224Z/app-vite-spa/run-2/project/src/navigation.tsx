import { useEffect, useState } from 'react';

export type Route = 'home' | 'about' | 'settings';

export const routes: Record<Route, { title: string; hash: string }> = {
  home: { title: 'Главная', hash: '#/' },
  about: { title: 'О приложении', hash: '#/about' },
  settings: { title: 'Настройки', hash: '#/settings' },
};

function parseRoute(hash: string): Route {
  if (hash === '#/about') {
    return 'about';
  }

  if (hash === '#/settings') {
    return 'settings';
  }

  return 'home';
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}
