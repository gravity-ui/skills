import { Icon, Switch, Tab, TabList, Text } from '@gravity-ui/uikit';
import { CircleInfo, House, ListCheck, Moon, Sun } from '@gravity-ui/icons';

import { type Route, navigate, routeHref, useRoute } from './router';
import { useAppTheme } from './theme';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { AboutPage } from './pages/AboutPage';

import './App.css';

const NAV_ITEMS: { route: Route; title: string; icon: typeof House }[] = [
  { route: 'home', title: 'Главная', icon: House },
  { route: 'tasks', title: 'Задачи', icon: ListCheck },
  { route: 'about', title: 'О приложении', icon: CircleInfo },
];

const PAGES: Record<Route, () => JSX.Element> = {
  home: HomePage,
  tasks: TasksPage,
  about: AboutPage,
};

function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <div className="app__theme">
      <Icon data={isDark ? Moon : Sun} size={16} />
      <Switch
        checked={isDark}
        onUpdate={toggleTheme}
        title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
        controlProps={{ 'aria-label': 'Тёмная тема' }}
      >
        <span className="app__theme-label">Тёмная тема</span>
      </Switch>
    </div>
  );
}

export function App() {
  const route = useRoute();
  const Page = PAGES[route];

  return (
    <div className="app">
      <header className="app__header">
        <Text variant="subheader-3" className="app__logo">
          Мини-приложение
        </Text>
        <nav className="app__nav" aria-label="Основная навигация">
          <TabList value={route} onUpdate={(value) => navigate(value as Route)} size="l">
            {NAV_ITEMS.map(({ route: r, title, icon }) => (
              <Tab key={r} value={r} href={routeHref(r)} icon={<Icon data={icon} size={16} />}>
                {title}
              </Tab>
            ))}
          </TabList>
        </nav>
        <ThemeToggle />
      </header>
      <main className="app__main">
        <Page />
      </main>
    </div>
  );
}
