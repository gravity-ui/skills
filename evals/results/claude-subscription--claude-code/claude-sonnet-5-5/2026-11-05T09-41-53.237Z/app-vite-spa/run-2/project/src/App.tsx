import React from 'react';
import { Button, Switch, Text } from '@gravity-ui/uikit';
import { ROUTES, hrefTo, useRoute } from './router';
import type { RoutePath } from './router';
import { useAppTheme } from './theme';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { About } from './pages/About';
import './app.css';

const PAGES: Record<RoutePath, () => React.JSX.Element> = {
  '/': Home,
  '/features': Features,
  '/about': About,
};

export function App() {
  const route = useRoute();
  const { theme, toggleTheme } = useAppTheme();
  const Page = PAGES[route];

  React.useEffect(() => {
    const title = ROUTES.find((r) => r.path === route)?.title ?? '';
    document.title = `${title} · Gravity UI app`;
  }, [route]);

  return (
    <div className="layout">
      <header className="header">
        <Text variant="header-1" className="logo">
          Gravity App
        </Text>
        <nav className="nav" aria-label="Основная навигация">
          {ROUTES.map((r) => (
            <Button
              key={r.path}
              href={hrefTo(r.path)}
              view={r.path === route ? 'normal' : 'flat'}
              selected={r.path === route}
              extraProps={r.path === route ? { 'aria-current': 'page' } : undefined}
            >
              {r.title}
            </Button>
          ))}
        </nav>
        <Switch checked={theme === 'dark'} onUpdate={toggleTheme} content="Тёмная тема" />
      </header>
      <main className="content">
        <Page />
      </main>
    </div>
  );
}
