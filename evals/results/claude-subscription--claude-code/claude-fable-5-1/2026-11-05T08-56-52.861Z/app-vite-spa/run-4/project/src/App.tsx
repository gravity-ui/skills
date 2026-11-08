import type { ReactNode } from 'react';
import { Button, Icon, Tab, TabList, Text, ThemeProvider } from '@gravity-ui/uikit';
import { CircleInfo, Gear, House, Moon, Sun } from '@gravity-ui/icons';

import { hrefFor, useHashRoute, type RoutePath } from './router';
import { useAppTheme } from './theme';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './App.css';

const NAV: { path: RoutePath; title: string; icon: typeof House }[] = [
  { path: '/', title: 'Главная', icon: House },
  { path: '/about', title: 'О приложении', icon: CircleInfo },
  { path: '/settings', title: 'Настройки', icon: Gear },
];

export function App() {
  const { theme, setTheme, toggleTheme } = useAppTheme();
  const { path, navigate } = useHashRoute();

  let page: ReactNode;
  switch (path) {
    case '/':
      page = <HomePage onNavigate={navigate} />;
      break;
    case '/about':
      page = <AboutPage />;
      break;
    case '/settings':
      page = <SettingsPage theme={theme} onThemeChange={setTheme} />;
      break;
    default:
      page = <NotFoundPage />;
  }

  const isDark = theme === 'dark';

  return (
    // Scoped ThemeProvider рисует собственный .g-root с выбранной темой поверх провайдера из main.tsx,
    // поэтому main.tsx оставлен без изменений.
    <ThemeProvider theme={theme} scoped rootClassName="app-root">
      <header className="app-header">
        <div className="app-header__inner">
          <Text variant="subheader-3" as="span" whiteSpace="nowrap">
            Mini App
          </Text>

          <nav className="app-header__nav" aria-label="Основная навигация">
            <TabList value={path ?? ''} size="l" contentOverflow="scroll">
              {NAV.map((item) => (
                <Tab
                  key={item.path}
                  value={item.path}
                  href={hrefFor(item.path)}
                  icon={<Icon data={item.icon} size={16} />}
                >
                  {item.title}
                </Tab>
              ))}
            </TabList>
          </nav>

          <Button
            view="flat"
            size="l"
            onClick={toggleTheme}
            aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          >
            <Icon data={isDark ? Sun : Moon} size={18} />
          </Button>
        </div>
      </header>

      <main className="app-main">{page}</main>
    </ThemeProvider>
  );
}
