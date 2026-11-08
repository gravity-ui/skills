import { useState } from 'react';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import { Gear, House, ListCheck, Moon, Rocket, Sun } from '@gravity-ui/icons';
import { Box, ThemeProvider } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';
import { hrefFor, useHashRoute, type PageId } from './router';
import { useAppTheme } from './theme';

const MENU: { id: PageId; title: string; icon: typeof House }[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'tasks', title: 'Задачи', icon: ListCheck },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

export function App() {
  const { theme, setTheme, toggleTheme, isDark } = useAppTheme();
  const { page, navigate } = useHashRoute();
  const [compact, setCompact] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'tasks':
        return <TasksPage />;
      case 'settings':
        return <SettingsPage theme={theme} onThemeChange={setTheme} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{
          text: 'Gravity App',
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
        menuItems={MENU.map((item) => ({
          id: item.id,
          title: item.title,
          icon: item.icon,
          href: hrefFor(item.id),
          current: page === item.id,
          onItemClick: (_item, _collapsed, event) => {
            event.preventDefault();
            navigate(item.id);
          },
        }))}
        renderFooter={({ compact: isCompact }) => (
          <FooterItem
            id="theme-toggle"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            icon={isDark ? Sun : Moon}
            compact={isCompact}
            onItemClick={toggleTheme}
          />
        )}
        renderContent={() => (
          <Box as="main" spacing={{ p: 6 }} style={{ maxWidth: 960, margin: '0 auto' }}>
            {renderPage()}
          </Box>
        )}
      />
    </ThemeProvider>
  );
}
