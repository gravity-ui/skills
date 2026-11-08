import {
  Flex,
  SegmentedRadioGroup,
  TabList,
  Tab,
  Text,
  ThemeProvider,
} from '@gravity-ui/uikit';
import { useState } from 'react';

import { Overview } from './pages/Overview';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import type { PageId, ThemeMode } from './types';
import './styles/app.css';

const navigationItems = [
  { id: 'overview', title: 'Обзор' },
  { id: 'projects', title: 'Проекты' },
  { id: 'settings', title: 'Настройки' },
];

export function App() {
  const [page, setPage] = useState<PageId>('overview');
  const [theme, setTheme] = useState<ThemeMode>('light');

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" className="app" gap="6">
        <header className="app__header">
          <Flex
            className="app__content"
            direction="column"
            gap="4"
            spacing={{ py: 5, px: 4 }}
          >
            <Flex alignItems="center" justifyContent="space-between" gap="4">
              <Text variant="header-2" as="span">
                Рабочая панель
              </Text>
              <SegmentedRadioGroup
                size="m"
                value={theme}
                onUpdate={(value) => setTheme(value)}
              >
                <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
                <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
              </SegmentedRadioGroup>
            </Flex>

            <TabList
              size="m"
              value={page}
              onUpdate={(value) => setPage(value as PageId)}
            >
              {navigationItems.map((item) => (
                <Tab key={item.id} value={item.id}>
                  {item.title}
                </Tab>
              ))}
            </TabList>
          </Flex>
        </header>

        <main className="app__content app__main">
          {page === 'overview' && <Overview />}
          {page === 'projects' && <Projects />}
          {page === 'settings' && (
            <Settings theme={theme} onThemeChange={setTheme} />
          )}
        </main>
      </Flex>
    </ThemeProvider>
  );
}
