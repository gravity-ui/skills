import { useCallback, useMemo, useState } from 'react';
import { LayoutCells, Moon, Sun } from '@gravity-ui/icons';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import { ThemeProvider, useThemeValue } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';
import { PAGES, useHashPage } from './routes';
import { loadTheme, saveTheme, ThemeSetting, ThemeSettingContext, useThemeSetting } from './theme';

export function App() {
  const [theme, setThemeState] = useState<ThemeSetting>(loadTheme);

  const setTheme = useCallback((next: ThemeSetting) => {
    setThemeState(next);
    saveTheme(next);
  }, []);

  const ctx = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    // Outermost ThemeProvider: applies the theme class to <body>, so the whole page follows it.
    <ThemeProvider theme={theme}>
      <ThemeSettingContext.Provider value={ctx}>
        <Shell />
      </ThemeSettingContext.Provider>
    </ThemeProvider>
  );
}

function Shell() {
  const page = useHashPage();
  const [compact, setCompact] = useState(() => window.innerWidth < 768);
  const { setTheme } = useThemeSetting();
  const isDark = useThemeValue() === 'dark';

  const menuItems = PAGES.map((p) => ({
    id: p.id,
    title: p.title,
    icon: p.icon,
    href: p.path,
    current: p.id === page,
  }));

  return (
    <AsideHeader
      logo={{ text: 'Мини-приложение', icon: LayoutCells, href: '#/' }}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderFooter={({ compact: isCompact }) => (
        <FooterItem
          id="theme-toggle"
          compact={isCompact}
          icon={isDark ? Sun : Moon}
          title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          onItemClick={() => setTheme(isDark ? 'light' : 'dark')}
        />
      )}
      renderContent={() => (
        <main style={{ height: '100%', overflowY: 'auto' }}>
          {page === 'home' && <HomePage />}
          {page === 'tasks' && <TasksPage />}
          {page === 'settings' && <SettingsPage />}
        </main>
      )}
    />
  );
}
