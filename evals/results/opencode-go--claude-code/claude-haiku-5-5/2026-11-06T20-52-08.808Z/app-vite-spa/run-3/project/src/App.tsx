import type { ComponentType } from 'react';
import { Button, Switch, ThemeProvider } from '@gravity-ui/uikit';

import { type Route, useRoute, useTheme } from './hooks';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { AboutPage } from './pages/AboutPage';

import './App.css';

const NAV_ITEMS: { route: Route; label: string }[] = [
  { route: 'home', label: 'Главная' },
  { route: 'tasks', label: 'Задачи' },
  { route: 'about', label: 'О проекте' },
];

const PAGES: Record<Route, ComponentType> = {
  home: HomePage,
  tasks: TasksPage,
  about: AboutPage,
};

export function App() {
  const [theme, setTheme] = useTheme();
  const route = useRoute();
  const Page = PAGES[route];

  return (
    // Без родительского ThemeProvider он обновляет класс темы у <body>,
    // поэтому фон всей страницы меняется вместе с переключателем.
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <nav className="app__nav" aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => {
              const isActive = item.route === route;
              return (
                <Button
                  key={item.route}
                  href={`#/${item.route}`}
                  view={isActive ? 'action' : 'flat'}
                  size="l"
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <Switch
            size="l"
            checked={theme === 'dark'}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
            content="Тёмная тема"
          />
        </header>

        <main className="app__main">
          <Page />
        </main>
      </div>
    </ThemeProvider>
  );
}
