import type { ComponentType } from 'react';
import { Button, Switch, ThemeProvider } from '@gravity-ui/uikit';

import './App.css';
import { PAGES, useCurrentPage } from './router';
import type { PageId } from './router';
import { useTheme } from './theme';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';

const PAGE_COMPONENTS: Record<PageId, ComponentType> = {
  home: HomePage,
  tasks: TasksPage,
  about: AboutPage,
};

export function App() {
  const [theme, setTheme] = useTheme();
  const currentPage = useCurrentPage();
  const Page = PAGE_COMPONENTS[currentPage.id];

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <nav className="app__nav" aria-label="Основная навигация">
            {PAGES.map((page) => {
              const isActive = page.id === currentPage.id;
              return (
                <Button
                  key={page.id}
                  href={`#${page.path}`}
                  view="flat"
                  size="l"
                  selected={isActive}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page.title}
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
          <Page />
        </main>
      </div>
    </ThemeProvider>
  );
}
