import type { ReactElement } from 'react';
import { Button, Switch, Text, ThemeProvider } from '@gravity-ui/uikit';

import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { ROUTES, useHashRoute } from './router';
import { useTheme } from './theme';
import './App.css';

const PAGES: Record<string, () => ReactElement> = {
  '/': HomePage,
  '/tasks': TasksPage,
  '/about': AboutPage,
};

export function App() {
  const { theme, setTheme } = useTheme();
  const path = useHashRoute();
  const Page = PAGES[path];

  // Nested inside main.tsx's ThemeProvider, so the theme here follows our own state.
  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <nav className="app__nav" aria-label="Основная навигация">
            {ROUTES.map((route) => {
              const active = route.path === path;
              return (
                <Button
                  key={route.path}
                  href={`#${route.path}`}
                  view={active ? 'outlined-action' : 'flat'}
                  selected={active}
                  size="l"
                  aria-current={active ? 'page' : undefined}
                >
                  {route.label}
                </Button>
              );
            })}
          </nav>
          <Switch
            size="l"
            checked={theme === 'dark'}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
          >
            Тёмная тема
          </Switch>
        </header>

        <main className="app__main">
          {Page ? (
            <Page />
          ) : (
            <Text variant="header-2" as="h1">
              Страница не найдена
            </Text>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
