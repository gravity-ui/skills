import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {ChartColumn, Gear, House, Moon, Rocket, Sun} from '@gravity-ui/icons';

import {hrefFor, useHashRoute} from './router';
import type {Route} from './router';
import {useAppTheme} from './theme';
import {HomePage} from './pages/HomePage';
import {ProjectsPage} from './pages/ProjectsPage';
import {SettingsPage} from './pages/SettingsPage';

const NAV_ITEMS: ReadonlyArray<{id: Route; title: string; icon: AsideHeaderItem['icon']}> = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'projects', title: 'Проекты', icon: ChartColumn},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

export function App() {
  const [route, navigate] = useHashRoute();
  const [theme, setTheme, toggleTheme] = useAppTheme();
  const [compact, setCompact] = React.useState(false);

  const menuItems = React.useMemo<AsideHeaderItem[]>(
    () =>
      NAV_ITEMS.map((item) => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        href: hrefFor(item.id),
        current: item.id === route,
        onItemClick: (_item, _collapsed, event) => {
          event.preventDefault();
          navigate(item.id);
        },
      })),
    [route, navigate],
  );

  const renderPage = () => {
    switch (route) {
      case 'projects':
        return <ProjectsPage />;
      case 'settings':
        return <SettingsPage theme={theme} onThemeChange={setTheme} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  const isDark = theme === 'dark';

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{
          text: 'Gravity Demo',
          icon: Rocket,
          href: hrefFor('home'),
          onClick: (event) => {
            event.preventDefault();
            navigate('home');
          },
        }}
        headerDecoration
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        renderFooter={({compact: isCompact}) => (
          <FooterItem
            id="theme-toggle"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            tooltipText={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            icon={isDark ? Sun : Moon}
            compact={isCompact}
            onItemClick={toggleTheme}
          />
        )}
        renderContent={renderPage}
      />
    </ThemeProvider>
  );
}
