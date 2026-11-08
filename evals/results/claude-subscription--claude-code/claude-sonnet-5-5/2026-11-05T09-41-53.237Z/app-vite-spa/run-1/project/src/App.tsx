import { Button, Switch, ThemeProvider } from '@gravity-ui/uikit';

import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { ROUTES, useRoute } from './router';
import { useTheme } from './useTheme';

const PAGES = { home: HomePage, tasks: TasksPage, about: AboutPage };

export function App() {
  const route = useRoute();
  const { theme, toggle } = useTheme();
  const Page = PAGES[route];

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <nav className="app__nav" aria-label="Основная навигация">
            {ROUTES.map((r) => (
              <Button
                key={r.id}
                view={r.id === route ? 'normal' : 'flat'}
                selected={r.id === route}
                href={`#${r.path}`}
                aria-current={r.id === route ? 'page' : undefined}
              >
                {r.title}
              </Button>
            ))}
          </nav>
          <Switch checked={theme === 'dark'} onUpdate={toggle} content="Тёмная тема" />
        </header>
        <main className="app__main">
          <Page />
        </main>
      </div>
    </ThemeProvider>
  );
}
