import { useCallback, useState } from 'react';
import {
  Container,
  Flex,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabProvider,
  Text,
  ThemeProvider,
} from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [theme, setTheme] = useState<RealTheme>('light');
  const [tab, setTab] = useState('home');

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="l" gutters={4}>
        <Flex direction="column" gap={4}>
          {/* Header */}
          <Flex
            as="header"
            gap={4}
            alignItems="center"
            justifyContent="space-between"
            style={{ paddingTop: 'var(--g-spacing-4)' }}
          >
            <Text variant="header-1">Gravity UI App</Text>
            <Flex gap={3} alignItems="center">
              <Text color="secondary">{theme === 'light' ? '☀️ Light' : '🌙 Dark'}</Text>
              <Switch
                checked={theme === 'dark'}
                onUpdate={toggleTheme}
                title="Toggle theme"
              />
            </Flex>
          </Flex>

          {/* Tabs navigation */}
          <TabProvider value={tab} onUpdate={setTab}>
            <TabList size="l">
              <Tab value="home">Home</Tab>
              <Tab value="about">About</Tab>
              <Tab value="settings">Settings</Tab>
            </TabList>
            <div style={{ minHeight: 400 }}>
              <TabPanel value="home">
                <HomePage />
              </TabPanel>
              <TabPanel value="about">
                <AboutPage />
              </TabPanel>
              <TabPanel value="settings">
                <SettingsPage theme={theme} onToggleTheme={toggleTheme} />
              </TabPanel>
            </div>
          </TabProvider>
        </Flex>
      </Container>
    </ThemeProvider>
  );
}
