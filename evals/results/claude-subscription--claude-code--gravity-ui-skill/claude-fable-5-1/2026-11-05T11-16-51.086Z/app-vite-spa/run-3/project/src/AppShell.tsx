import React from 'react';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import type { AsideHeaderItem } from '@gravity-ui/navigation';
import { LayoutHeader, Moon, Sun } from '@gravity-ui/icons';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from './routes';
import { HomePage } from './pages/HomePage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAppTheme } from './theme/AppThemeContext';

export function AppShell() {
  const [compact, setCompact] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppTheme();

  const menuItems = React.useMemo<AsideHeaderItem[]>(
    () =>
      ROUTES.map((route) => ({
        id: route.id,
        title: route.title,
        icon: route.icon,
        href: route.path,
        current: location.pathname === route.path,
        onItemClick: (_item, _collapsed, event) => {
          // Keep the URL in sync with the SPA router instead of a full page reload.
          event.preventDefault();
          navigate(route.path);
        },
      })),
    [location.pathname, navigate],
  );

  const isDark = theme === 'dark';

  return (
    <AsideHeader
      logo={{
        text: 'Gravity Demo',
        icon: LayoutHeader,
        href: '/',
        onClick: (event) => {
          event.preventDefault();
          navigate('/');
        },
      }}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      headerDecoration
      renderFooter={({ compact: isCompact }) => (
        <FooterItem
          id="theme-toggle"
          title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          tooltipText={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          icon={isDark ? Sun : Moon}
          compact={isCompact}
          enableTooltip
          onItemClick={toggleTheme}
        />
      )}
      renderContent={() => (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    />
  );
}
