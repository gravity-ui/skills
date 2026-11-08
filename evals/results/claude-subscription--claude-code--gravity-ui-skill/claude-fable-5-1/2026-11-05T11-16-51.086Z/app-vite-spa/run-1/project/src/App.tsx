import * as React from 'react';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import type { AsideHeaderItem } from '@gravity-ui/navigation';
import { Gear, House, Moon, Person, Rocket, Sun } from '@gravity-ui/icons';
import { Box, ThemeProvider } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { routeHref, useRoute } from './router';
import type { RouteId } from './router';
import { useAppTheme } from './theme';

const NAV_ITEMS: Array<{ id: RouteId; title: string; icon: AsideHeaderItem['icon'] }> = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'profile', title: 'Профиль', icon: Person },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

export function App() {
  const { theme, setTheme, toggleTheme } = useAppTheme();
  const route = useRoute();
  const [compact, setCompact] = React.useState(false);

  const menuItems: AsideHeaderItem[] = NAV_ITEMS.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    href: routeHref(item.id),
    current: route === item.id,
  }));

  const isDark = theme === 'dark';

  const renderPage = () => {
    switch (route) {
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage theme={theme} onThemeChange={setTheme} />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{ text: 'Gravity App', icon: Rocket, href: routeHref('home') }}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        renderFooter={({ compact: isCompact }) => (
          <FooterItem
            id="theme-toggle"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            tooltipText={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            icon={isDark ? Sun : Moon}
            compact={isCompact}
            onItemClick={toggleTheme}
          />
        )}
        renderContent={() => (
          <Box as="main" spacing={{ px: 8, py: 6 }} style={{ maxWidth: 1200 }}>
            {renderPage()}
          </Box>
        )}
      />
    </ThemeProvider>
  );
}
