import { Switch, Text, ThemeProvider } from '@gravity-ui/uikit';

import { About } from './pages/About';
import { Features } from './pages/Features';
import { Home } from './pages/Home';
import { ROUTES, RoutePath, useHashRoute } from './useHashRoute';
import { useTheme } from './useTheme';

const PAGES: Record<RoutePath, () => JSX.Element> = {
  '/': Home,
  '/features': Features,
  '/about': About,
};

export function App() {
  const { theme, toggle } = useTheme();
  const path = useHashRoute();
  const Page = PAGES[path];

  return (
    <ThemeProvider theme={theme}>
      <div className="layout">
        <header className="header">
          <nav className="nav" aria-label="Основная навигация">
            {ROUTES.map((r) => (
              <a
                key={r.path}
                href={`#${r.path}`}
                className={'nav__link' + (r.path === path ? ' nav__link_active' : '')}
                aria-current={r.path === path ? 'page' : undefined}
              >
                {r.title}
              </a>
            ))}
          </nav>
          <Switch checked={theme === 'dark'} onUpdate={toggle} size="l" content="Тёмная тема" />
        </header>
        <main className="main">
          <Page />
        </main>
        <footer className="footer">
          <Text color="secondary" variant="caption-2">
            Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}
          </Text>
        </footer>
      </div>
    </ThemeProvider>
  );
}
