import { Button, Container, Flex, Icon, Tab, TabList, Text } from '@gravity-ui/uikit';

import { MoonIcon, SunIcon } from './icons';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotesPage } from './pages/NotesPage';
import { hrefFor, routes, useHashPath } from './router';
import type { AppTheme } from './theme';

interface AppProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

function renderPage(path: string) {
  switch (path) {
    case '/':
      return <HomePage />;
    case '/notes':
      return <NotesPage />;
    case '/about':
      return <AboutPage />;
    default:
      return (
        <Flex direction="column" gap={3}>
          <Text as="h1" variant="display-1">
            Страница не найдена
          </Text>
          <Text variant="body-2" color="secondary">
            Адрес <code>{path}</code> не соответствует ни одной странице.
          </Text>
          <Button view="action" href={hrefFor('/')} style={{ alignSelf: 'flex-start' }}>
            На главную
          </Button>
        </Flex>
      );
  }
}

export function App({ theme, onThemeChange }: AppProps) {
  const path = useHashPath();
  const activeRoute = routes.find((route) => route.path === path);
  const isDark = theme === 'dark';

  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>
      <header
        style={{
          borderBottom: '1px solid var(--g-color-line-generic)',
          background: 'var(--g-color-base-background)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Container maxWidth="m">
          <Flex alignItems="center" justifyContent="space-between" gap={4} style={{ height: 56 }}>
            <Flex alignItems="center" gap={6} style={{ minWidth: 0 }}>
              <Text variant="subheader-3" as="span" style={{ whiteSpace: 'nowrap' }}>
                Demo App
              </Text>
              <nav aria-label="Основная навигация">
                <TabList value={activeRoute?.id} size="l">
                  {routes.map((route) => (
                    <Tab key={route.id} value={route.id} href={hrefFor(route.path)}>
                      {route.title}
                    </Tab>
                  ))}
                </TabList>
              </nav>
            </Flex>
            <Button
              view="outlined"
              size="l"
              onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            >
              <Icon data={isDark ? SunIcon : MoonIcon} size={16} />
              {isDark ? 'Светлая' : 'Тёмная'}
            </Button>
          </Flex>
        </Container>
      </header>

      <main style={{ flex: 1 }}>
        <Container maxWidth="m" style={{ paddingTop: 32, paddingBottom: 32 }}>
          {renderPage(path)}
        </Container>
      </main>
    </Flex>
  );
}
