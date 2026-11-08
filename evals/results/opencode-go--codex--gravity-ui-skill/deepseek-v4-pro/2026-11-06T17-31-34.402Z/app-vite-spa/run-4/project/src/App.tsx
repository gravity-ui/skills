import { useState, useCallback } from 'react';
import {
  ThemeProvider,
  Flex,
  Text,
  TabProvider,
  TabList,
  Tab,
  TabPanel,
  Icon,
} from '@gravity-ui/uikit';
import House from '@gravity-ui/icons/House';
import CircleInfo from '@gravity-ui/icons/CircleInfo';
import Gear from '@gravity-ui/icons/Gear';
import type { RealTheme } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

export function App() {
  const [theme, setTheme] = useState<RealTheme>('light');
  const [activeTab, setActiveTab] = useState('home');

  const toggleTheme = useCallback((checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" style={{ minHeight: '100vh' }}>
        <Flex
          as="header"
          alignItems="center"
          justifyContent="space-between"
          style={{
            padding: '8px 24px',
            borderBottom: '1px solid var(--g-color-line-generic)',
            flexShrink: 0,
          }}
        >
          <Text variant="header-1">Gravity UI Demo</Text>
        </Flex>

        <TabProvider value={activeTab} onUpdate={setActiveTab}>
          <Flex
            style={{
              padding: '0 24px',
              borderBottom: '1px solid var(--g-color-line-generic)',
              flexShrink: 0,
            }}
          >
            <TabList>
              <Tab value="home" icon={<Icon data={House} />}>
                Home
              </Tab>
              <Tab value="about" icon={<Icon data={CircleInfo} />}>
                About
              </Tab>
              <Tab value="settings" icon={<Icon data={Gear} />}>
                Settings
              </Tab>
            </TabList>
          </Flex>

          <main style={{ flex: 1, minHeight: 0 }}>
            <TabPanel value="home">
              <HomePage />
            </TabPanel>
            <TabPanel value="about">
              <AboutPage />
            </TabPanel>
            <TabPanel value="settings">
              <SettingsPage isDark={theme === 'dark'} onToggleTheme={toggleTheme} />
            </TabPanel>
          </main>
        </TabProvider>
      </Flex>
    </ThemeProvider>
  );
}
