import { CircleInfo, House, ListCheck, Moon, Sun } from '@gravity-ui/icons';
import { Icon, Switch, Tab, TabList, Text, ThemeProvider } from '@gravity-ui/uikit';
import type { ComponentType } from 'react';

import './App.css';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TasksPage } from './pages/TasksPage';
import { useHashRoute } from './useHashRoute';
import { useStoredTheme } from './useStoredTheme';

const ROUTES = [
  { path: '/', title: 'Главная', icon: House, Page: HomePage },
  { path: '/tasks', title: 'Задачи', icon: ListCheck, Page: TasksPage },
  { path: '/about', title: 'О приложении', icon: CircleInfo, Page: AboutPage },
] satisfies { path: string; title: string; icon: unknown; Page: ComponentType }[];

export function App() {
  const path = useHashRoute();
  const [theme, setTheme] = useStoredTheme();

  const route = ROUTES.find((r) => r.path === path);
  const Page = route?.Page ?? NotFoundPage;
  const isDark = theme === 'dark';

  return (
    // Вложенный ThemeProvider переопределяет тему из main.tsx для всего приложения
    // (включая порталы — тултипы, попапы и т.п.).
    <ThemeProvider theme={theme} rootClassName={`app app_theme_${theme}`}>
      <header className="app__header">
        <div className="app__header-inner">
          <Text variant="subheader-3">Мини-приложение</Text>

          <nav className="app__nav" aria-label="Основная навигация">
            <TabList value={route?.path ?? ''} size="l" contentOverflow="scroll">
              {ROUTES.map((r) => (
                <Tab key={r.path} value={r.path} href={`#${r.path}`} icon={<Icon data={r.icon} />}>
                  {r.title}
                </Tab>
              ))}
            </TabList>
          </nav>

          <Switch
            size="m"
            checked={isDark}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
            title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            <Icon data={isDark ? Moon : Sun} size={16} />
            &nbsp;Тёмная тема
          </Switch>
        </div>
      </header>

      <main className="app__main">
        <Page />
      </main>
    </ThemeProvider>
  );
}
