import { useEffect } from 'react';
import { Moon, Sun } from '@gravity-ui/icons';
import { Button, Icon, Tab, TabList, Text, ThemeProvider } from '@gravity-ui/uikit';

import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TasksPage } from './pages/TasksPage';
import { href, useHashPath } from './router';
import { useAppTheme } from './theme';
import './App.css';

const routes = [
  { path: '/', title: 'Главная' },
  { path: '/tasks', title: 'Задачи' },
  { path: '/about', title: 'О приложении' },
] as const;

export function App() {
  const { theme, toggleTheme } = useAppTheme();
  const path = useHashPath();
  const route = routes.find((r) => r.path === path);

  useEffect(() => {
    document.title = `${route?.title ?? 'Не найдено'} · Демо`;
  }, [route]);

  const isDark = theme === 'dark';
  const toggleLabel = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';

  let page;
  switch (route?.path) {
    case '/':
      page = <HomePage />;
      break;
    case '/tasks':
      page = <TasksPage />;
      break;
    case '/about':
      page = <AboutPage theme={theme} />;
      break;
    default:
      page = <NotFoundPage />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app-header">
          <div className="app-header__inner">
            <Text variant="subheader-3" className="app-logo">
              Демо
            </Text>
            <nav className="app-nav" aria-label="Основная навигация">
              <TabList value={route?.path ?? ''} size="l">
                {routes.map((r) => (
                  <Tab key={r.path} value={r.path} href={href(r.path)}>
                    {r.title}
                  </Tab>
                ))}
              </TabList>
            </nav>
            <Button view="outlined" size="l" onClick={toggleTheme} aria-label={toggleLabel} title={toggleLabel}>
              <Icon data={isDark ? Sun : Moon} />
            </Button>
          </div>
        </header>
        <main className="app-main">{page}</main>
      </div>
    </ThemeProvider>
  );
}
