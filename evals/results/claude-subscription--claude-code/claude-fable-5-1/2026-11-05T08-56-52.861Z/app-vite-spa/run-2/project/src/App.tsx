import { Book, Gear, House, Moon, Sun } from '@gravity-ui/icons';
import { Button, Icon, Tab, TabList, Text, ThemeProvider, Tooltip } from '@gravity-ui/uikit';

import './styles.css';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { hrefFor, routes, useHashRoute, type Route } from './router';
import { useAppTheme } from './theme';

const navItems: { route: Route; title: string; icon: typeof House }[] = [
  { route: routes.home, title: 'Главная', icon: House },
  { route: routes.about, title: 'О приложении', icon: Book },
  { route: routes.settings, title: 'Настройки', icon: Gear },
];

export function App() {
  const { theme, setTheme, toggleTheme } = useAppTheme();
  const route = useHashRoute();
  const isDark = theme === 'dark';

  let page: JSX.Element;
  switch (route) {
    case routes.about:
      page = <AboutPage />;
      break;
    case routes.settings:
      page = <SettingsPage theme={theme} onThemeChange={setTheme} />;
      break;
    default:
      page = <HomePage />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <Text variant="subheader-3" className="app__brand">
            Demo App
          </Text>

          <nav className="app__nav" aria-label="Основная навигация">
            <TabList value={route} size="l">
              {navItems.map(({ route: itemRoute, title, icon }) => (
                <Tab
                  key={itemRoute}
                  value={itemRoute}
                  href={hrefFor(itemRoute)}
                  icon={<Icon data={icon} size={16} />}
                >
                  {title}
                </Tab>
              ))}
            </TabList>
          </nav>

          <Tooltip content={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}>
            <Button
              view="outlined"
              size="l"
              onClick={toggleTheme}
              aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              aria-pressed={isDark}
            >
              <Icon data={isDark ? Sun : Moon} size={18} />
            </Button>
          </Tooltip>
        </header>

        <main className="app__main">{page}</main>
      </div>
    </ThemeProvider>
  );
}
