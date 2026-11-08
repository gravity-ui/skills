import React from 'react';
import { Gear, House, Layers3Diagonal, Moon, Sun } from '@gravity-ui/icons';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import type { MenuItem } from '@gravity-ui/navigation';
import { ThemeProvider } from '@gravity-ui/uikit';

import { ComponentsPage } from './pages/ComponentsPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { useAppTheme } from './useAppTheme';
import { useHashRoute } from './useHashRoute';
import type { RouteId } from './useHashRoute';

const NAV: Array<{ id: RouteId; title: string; icon: MenuItem['icon'] }> = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'components', title: 'Компоненты', icon: Layers3Diagonal },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

export function App() {
  const [theme, setTheme] = useAppTheme();
  const [route, navigate] = useHashRoute();
  const [compact, setCompact] = React.useState(false);

  const menuItems: MenuItem[] = NAV.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    current: route === item.id,
    onItemClick: () => navigate(item.id),
  }));

  const isDark = theme === 'dark';

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{ text: 'Gravity App', icon: Layers3Diagonal, onClick: () => navigate('home') }}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        renderFooter={({ compact: footerCompact }) => (
          <FooterItem
            id="theme-toggle"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            tooltipText={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            icon={isDark ? Sun : Moon}
            compact={footerCompact}
            onItemClick={() => setTheme(isDark ? 'light' : 'dark')}
          />
        )}
        renderContent={() => (
          <>
            {route === 'home' && <HomePage onNavigate={navigate} />}
            {route === 'components' && <ComponentsPage />}
            {route === 'settings' && <SettingsPage theme={theme} onThemeChange={setTheme} />}
          </>
        )}
      />
    </ThemeProvider>
  );
}
