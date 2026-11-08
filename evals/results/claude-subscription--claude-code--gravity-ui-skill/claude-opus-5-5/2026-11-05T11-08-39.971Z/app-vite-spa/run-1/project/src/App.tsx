import { useEffect, useState } from 'react';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import type { AsideHeaderItem } from '@gravity-ui/navigation';
import { Gear, House, LayoutCellsLarge, Moon, Rocket, Sun } from '@gravity-ui/icons';
import { ThemeProvider } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { type PageId, usePage } from './router';
import { type AppTheme, getInitialTheme, saveTheme } from './theme';

const PAGES: Record<PageId, { title: string; icon: AsideHeaderItem['icon'] }> = {
  home: { title: 'Главная', icon: House },
  projects: { title: 'Проекты', icon: LayoutCellsLarge },
  settings: { title: 'Настройки', icon: Gear },
};

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
  const [compact, setCompact] = useState(false);
  const [page, navigate] = usePage();

  useEffect(() => saveTheme(theme), [theme]);

  useEffect(() => {
    document.title = `${PAGES[page].title} · Демо-приложение`;
  }, [page]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const menuItems: AsideHeaderItem[] = (Object.keys(PAGES) as PageId[]).map((id) => ({
    id,
    title: PAGES[id].title,
    icon: PAGES[id].icon,
    current: page === id,
    onItemClick: () => navigate(id),
  }));

  const renderPage = () => {
    switch (page) {
      case 'projects':
        return <ProjectsPage />;
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
          text: 'Демо-приложение',
          icon: Rocket,
          onClick: () => navigate('home'),
        }}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        expandTitle="Развернуть"
        collapseTitle="Свернуть"
        renderFooter={({ compact: isCompact }) => (
          <FooterItem
            id="theme-toggle"
            compact={isCompact}
            icon={theme === 'light' ? Moon : Sun}
            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            onItemClick={toggleTheme}
          />
        )}
        renderContent={() => <main>{renderPage()}</main>}
      />
    </ThemeProvider>
  );
}
