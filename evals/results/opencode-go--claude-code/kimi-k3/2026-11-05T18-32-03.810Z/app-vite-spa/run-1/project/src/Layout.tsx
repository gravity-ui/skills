import React from 'react';
import { Button, Text } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';
import type { RealTheme } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';

export type Route = 'home' | 'about' | 'settings';

const NAV_ITEMS: Array<{ route: Route; path: string; label: string }> = [
  { route: 'home', path: '#/', label: 'Главная' },
  { route: 'about', path: '#/about', label: 'О проекте' },
  { route: 'settings', path: '#/settings', label: 'Настройки' },
];

function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '');
  const match = NAV_ITEMS.find((item) => item.path.replace(/^#/, '') === path);
  return match ? match.route : 'home';
}

interface LayoutProps {
  theme: RealTheme;
  onToggleTheme: () => void;
}

export function Layout({ theme, onToggleTheme }: LayoutProps) {
  const [route, setRoute] = React.useState<Route>(() => parseRoute(window.location.hash));

  React.useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--g-color-base-background)',
        color: 'var(--g-color-text-primary)',
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '12px 24px',
          borderBottom: '1px solid var(--g-color-line-generic)',
          position: 'sticky',
          top: 0,
          background: 'var(--g-color-base-background)',
          zIndex: 1,
        }}
      >
        <Text variant="subheader-2">Моё приложение</Text>

        <nav style={{ display: 'flex', gap: 8 }} aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.route}
              view={route === item.route ? 'normal' : 'flat'}
              selected={route === item.route}
              href={item.path}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <Button
          view="outlined"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
        >
          <Button.Icon>{theme === 'light' ? <Moon /> : <Sun />}</Button.Icon>
          {theme === 'light' ? 'Тёмная' : 'Светлая'}
        </Button>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>
        {route === 'home' && <HomePage />}
        {route === 'about' && <AboutPage />}
        {route === 'settings' && <SettingsPage theme={theme} onToggleTheme={onToggleTheme} />}
      </main>
    </div>
  );
}
