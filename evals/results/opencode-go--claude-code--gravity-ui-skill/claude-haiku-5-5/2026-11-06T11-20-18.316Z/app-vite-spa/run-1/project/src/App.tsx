import * as React from 'react';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import { CircleInfo, House, ListCheck, Moon, Sun } from '@gravity-ui/icons';
import { Box, Text, ThemeProvider } from '@gravity-ui/uikit';

import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';

type ThemeName = 'light' | 'dark';

const THEME_STORAGE_KEY = 'gravity-demo-theme';

const ROUTES = [
  { path: '/', title: 'Главная', icon: House, Page: HomePage },
  { path: '/tasks', title: 'Задачи', icon: ListCheck, Page: TasksPage },
  { path: '/about', title: 'О приложении', icon: CircleInfo, Page: AboutPage },
] as const;

function getInitialTheme(): ThemeName {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Hash-based routing: works without a router library and keeps the browser back button working.
function readHashPath(): string {
  return window.location.hash.slice(1) || '/';
}

function useHashPath(): string {
  const [path, setPath] = React.useState(readHashPath);

  React.useEffect(() => {
    const onChange = () => setPath(readHashPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export function App() {
  const [theme, setTheme] = React.useState<ThemeName>(getInitialTheme);
  const [compact, setCompact] = React.useState(false);
  const path = useHashPath();

  React.useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const Page = ROUTES.find((route) => route.path === path)?.Page;

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{ text: 'Gravity demo', href: '#/' }}
        menuItems={ROUTES.map((route) => ({
          id: route.path,
          title: route.title,
          icon: route.icon,
          href: `#${route.path}`,
          current: route.path === path,
        }))}
        compact={compact}
        onChangeCompact={setCompact}
        renderFooter={({ compact: isCompact }) => (
          <FooterItem
            id="theme"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            icon={isDark ? Sun : Moon}
            compact={isCompact}
            onItemClick={() => setTheme(isDark ? 'light' : 'dark')}
          />
        )}
        renderContent={() =>
          Page ? (
            <Page />
          ) : (
            <Box spacing={{ p: 6 }}>
              <Text variant="header-2">Страница не найдена</Text>
            </Box>
          )
        }
      />
    </ThemeProvider>
  );
}
