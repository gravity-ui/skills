import { Button, Switch, ThemeProvider } from '@gravity-ui/uikit';

import { About } from './pages/About';
import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { ROUTES, href, useRoute, type RoutePath } from './router';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

const PAGES: Record<RoutePath, () => JSX.Element> = {
  '/': Home,
  '/tasks': Tasks,
  '/about': About,
};

const systemTheme = (): Theme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', systemTheme);
  const route = useRoute();
  const Page = PAGES[route];

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <span className="app__brand">Мини-приложение</span>
          <nav className="app__nav" aria-label="Основная навигация">
            {ROUTES.map((r) => (
              <Button
                key={r.path}
                href={href(r.path)}
                view={r.path === route ? 'normal' : 'flat'}
                selected={r.path === route}
                extraProps={r.path === route ? { 'aria-current': 'page' } : undefined}
              >
                {r.title}
              </Button>
            ))}
          </nav>
          <div className="app__theme">
            <Switch
              size="m"
              checked={theme === 'dark'}
              onUpdate={(on) => setTheme(on ? 'dark' : 'light')}
              content="Тёмная тема"
            />
          </div>
        </header>
        <main className="app__main">
          <Page />
        </main>
      </div>
    </ThemeProvider>
  );
}
