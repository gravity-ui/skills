import React, { useEffect, useState } from 'react';
import { Button, Card, Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
import { useTheme } from './theme';
import './App.css';

const pages = {
  home: { title: 'Главная', component: HomePage },
  features: { title: 'Возможности', component: FeaturesPage },
  about: { title: 'О проекте', component: AboutPage },
} as const;

type PageKey = keyof typeof pages;

function isPageKey(value: string): value is PageKey {
  return value in pages;
}

export function App() {
  const [page, setPage] = useState<PageKey>('home');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get('page');
    if (current && isPageKey(current)) {
      setPage(current);
    }
  }, []);

  const navigate = (nextPage: PageKey) => {
    setPage(nextPage);
    window.history.replaceState(null, '', `?page=${nextPage}`);
  };

  return (
    <Flex direction="column" minHeight="100vh" width="100%">
      <header className="app-header">
        <Flex alignItems="center" justifyContent="space-between" gap="3">
          <Text variant="header-1" as="h3">Мини-приложение</Text>
          <Flex alignItems="center" gap="3">
            <nav className="app-nav">
              {Object.entries(pages).map(([key, { title }]) => (
                <Button
                  key={key}
                  view={page === key ? 'action' : 'flat'}
                  onClick={() => navigate(key as PageKey)}
                >
                  {title}
                </Button>
              ))}
            </nav>
            <SegmentedRadioGroup value={theme} size="m" onChange={toggleTheme}>
              <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
              <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            </SegmentedRadioGroup>
          </Flex>
        </Flex>
      </header>
      <main className="app-main">
        <Card view="outlined">{React.createElement(pages[page].component)}</Card>
      </main>
      <footer className="app-footer">
        <Text color="secondary">Страница: {pages[page].title}</Text>
      </footer>
    </Flex>
  );
}
