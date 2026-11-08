import { useEffect, useMemo, useState } from 'react';
import { Button, Tab, TabList, Text, ThemeProvider } from '@gravity-ui/uikit';
import { FeaturesPage } from './pages/FeaturesPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import type { PageId } from './types';

const pages = [
  { id: 'home', title: 'Главная' },
  { id: 'features', title: 'Возможности' },
  { id: 'settings', title: 'Настройки' },
] as const;

function getPageIdFromHash(): PageId {
  const pageId = window.location.hash.replace('#/', '');
  return pages.some((page) => page.id === pageId) ? (pageId as PageId) : 'home';
}

function getInitialTheme(): 'light' | 'dark' {
  const storedTheme = localStorage.getItem('app-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [pageId, setPageId] = useState<PageId>(getPageIdFromHash);
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    const handleHashChange = () => {
      setPageId(getPageIdFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const page = useMemo(() => {
    switch (pageId) {
      case 'features':
        return <FeaturesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  }, [pageId]);

  const handlePageChange = (nextPageId: string) => {
    window.location.hash = `#/${nextPageId}`;
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app-header">
          <div className="app-header-inner">
            <Text variant="subheader-2" as="span">
              Мини-приложение
            </Text>
            <div className="app-nav app-nav-scroll">
              <TabList value={pageId} onUpdate={handlePageChange}>
                {pages.map((page) => (
                  <Tab key={page.id} value={page.id}>
                    {page.title}
                  </Tab>
                ))}
              </TabList>
            </div>
            <Button view="outlined" onClick={toggleTheme}>
              {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </Button>
          </div>
        </header>
        <main className="app-content">
          <div className="app-container">{page}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
