import React from 'react';
import { Button, Icon, Text, ThemeProvider } from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';
import { House, ListCheck, CircleInfo, Moon, Sun } from '@gravity-ui/icons';

import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { AboutPage } from './pages/AboutPage';

type PageId = 'home' | 'tasks' | 'about';

const PAGES: Array<{ id: PageId; title: string; icon: typeof House }> = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'tasks', title: 'Задачи', icon: ListCheck },
  { id: 'about', title: 'О приложении', icon: CircleInfo },
];

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): RealTheme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [page, setPage] = React.useState<PageId>('home');
  const [theme, setTheme] = React.useState<RealTheme>(getInitialTheme);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        className="app-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--g-color-base-background)',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderBottom: '1px solid var(--g-color-line-generic)',
            background: 'var(--g-color-base-float)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Text variant="subheader-2" style={{ marginRight: 24 }}>
            Мини-приложение
          </Text>

          <nav style={{ display: 'flex', gap: 8, flex: 1 }}>
            {PAGES.map(({ id, title, icon }) => (
              <Button
                key={id}
                view={page === id ? 'action' : 'flat'}
                selected={page === id}
                onClick={() => setPage(id)}
              >
                <Icon data={icon} size={16} />
                {title}
              </Button>
            ))}
          </nav>

          <Button view="outlined" onClick={toggleTheme} title="Переключить тему">
            <Icon data={theme === 'light' ? Moon : Sun} size={16} />
            {theme === 'light' ? 'Тёмная' : 'Светлая'}
          </Button>
        </header>

        <main style={{ flex: 1, padding: 24, maxWidth: 960, width: '100%', margin: '0 auto' }}>
          {page === 'home' && <HomePage onNavigate={setPage} />}
          {page === 'tasks' && <TasksPage />}
          {page === 'about' && <AboutPage />}
        </main>

        <footer
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--g-color-line-generic)',
            textAlign: 'center',
          }}
        >
          <Text color="secondary" variant="body-1">
            Демо: навигация между страницами и переключение светлой/тёмной темы
          </Text>
        </footer>
      </div>
    </ThemeProvider>
  );
}
