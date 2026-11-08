import React, { useEffect, useState } from 'react';
import { AsideHeader } from '@gravity-ui/navigation';
import { Gear, House, ListUl } from '@gravity-ui/icons';
import { Box, Flex, Switch, Text, ThemeProvider } from '@gravity-ui/uikit';
import type { IconData } from '@gravity-ui/uikit';

import { PAGE_IDS, type PageId, useHashPage } from './router';
import { type AppTheme, readStoredTheme, storeTheme } from './theme';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';

const PAGES: Record<PageId, { title: string; icon: IconData; render: (theme: AppTheme) => React.ReactNode }> = {
  home: { title: 'Главная', icon: House, render: () => <HomePage /> },
  tasks: { title: 'Задачи', icon: ListUl, render: () => <TasksPage /> },
  settings: { title: 'Настройки', icon: Gear, render: (theme) => <SettingsPage theme={theme} /> },
};

export function App() {
  const [theme, setTheme] = useState<AppTheme>(readStoredTheme);
  const [compact, setCompact] = useState(false);
  const page = useHashPage();
  const current = PAGES[page];

  useEffect(() => {
    storeTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.title = `${current.title} — Gravity UI demo`;
  }, [current.title]);

  return (
    // ThemeProvider lives here (not in main.tsx) because its theme follows the toggle state.
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{ text: 'Gravity demo', href: '#/home' }}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={PAGE_IDS.map((id) => ({
          id,
          title: PAGES[id].title,
          icon: PAGES[id].icon,
          href: `#/${id}`,
          current: id === page,
        }))}
        renderContent={() => (
          <Box spacing={{ px: 6, py: 5 }}>
            <Flex direction="column" gap={6}>
              <Flex alignItems="center" justifyContent="space-between" gap={4}>
                <Text variant="header-1">{current.title}</Text>
                <Box style={{ flexShrink: 0 }}>
                  <Switch
                    size="l"
                    checked={theme === 'dark'}
                    onUpdate={(dark) => setTheme(dark ? 'dark' : 'light')}
                    content="Тёмная тема"
                  />
                </Box>
              </Flex>
              {current.render(theme)}
            </Flex>
          </Box>
        )}
      />
    </ThemeProvider>
  );
}
