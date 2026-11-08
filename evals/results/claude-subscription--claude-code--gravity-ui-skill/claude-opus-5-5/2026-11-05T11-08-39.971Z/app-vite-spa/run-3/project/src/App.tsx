import * as React from 'react';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import type { AsideHeaderItem } from '@gravity-ui/navigation';
import { Briefcase, Gear, House, LayoutCells, Moon, Sun } from '@gravity-ui/icons';
import { ThemeProvider } from '@gravity-ui/uikit';

import { ROUTES, useHashRoute } from './routes';
import { useAppTheme } from './theme';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const { theme, setTheme, toggleTheme } = useAppTheme();
  const { route, navigate } = useHashRoute();
  // Collapse the sidebar by default on narrow screens.
  const [compact, setCompact] = React.useState(() => window.innerWidth < 768);

  const menuItems: AsideHeaderItem[] = [
    { id: 'home', title: ROUTES.home.title, icon: House, href: ROUTES.home.path, current: route === 'home' },
    {
      id: 'projects',
      title: ROUTES.projects.title,
      icon: Briefcase,
      href: ROUTES.projects.path,
      current: route === 'projects',
    },
    {
      id: 'settings',
      title: ROUTES.settings.title,
      icon: Gear,
      href: ROUTES.settings.path,
      current: route === 'settings',
    },
  ];

  const isDark = theme === 'dark';

  const renderPage = () => {
    switch (route) {
      case 'projects':
        return <ProjectsPage />;
      case 'settings':
        return (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
            compact={compact}
            onCompactChange={setCompact}
          />
        );
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{ text: 'Gravity Demo', icon: LayoutCells, href: ROUTES.home.path }}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        renderFooter={({ compact: isCompact }) => (
          <FooterItem
            id="theme"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            icon={isDark ? Sun : Moon}
            compact={isCompact}
            onItemClick={toggleTheme}
          />
        )}
        renderContent={() => <main className="app-content">{renderPage()}</main>}
      />
    </ThemeProvider>
  );
}
