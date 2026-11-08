import type { ComponentType } from 'react';
import { Button, Container, Flex, Switch, ThemeProvider } from '@gravity-ui/uikit';

import { useThemeMode } from './theme';
import { PAGES, type PageId, useCurrentPage } from './router';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { AboutPage } from './pages/AboutPage';

const PAGE_COMPONENTS: Record<PageId, ComponentType> = {
  home: HomePage,
  tasks: TasksPage,
  about: AboutPage,
};

export function App() {
  const [theme, setTheme] = useThemeMode();
  const page = useCurrentPage();
  const CurrentPage = PAGE_COMPONENTS[page];

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <header>
          <Flex justifyContent="space-between" alignItems="center" wrap gap={4} style={{ padding: '16px 0' }}>
            <nav aria-label="Основная навигация">
              <Flex gap={2} wrap>
                {PAGES.map((p) => {
                  const active = p.id === page;
                  return (
                    <Button
                      key={p.id}
                      href={p.href}
                      view="flat"
                      size="l"
                      selected={active}
                      aria-current={active ? 'page' : undefined}
                    >
                      {p.title}
                    </Button>
                  );
                })}
              </Flex>
            </nav>
            <Switch
              size="l"
              checked={theme === 'dark'}
              onUpdate={(dark) => setTheme(dark ? 'dark' : 'light')}
              content="Тёмная тема"
            />
          </Flex>
        </header>

        <main style={{ paddingBottom: 32 }}>
          <CurrentPage />
        </main>
      </Container>
    </ThemeProvider>
  );
}
