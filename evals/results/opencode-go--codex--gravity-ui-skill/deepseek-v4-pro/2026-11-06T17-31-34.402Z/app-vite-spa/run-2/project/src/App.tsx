import {useState} from 'react';
import {
  Flex,
  Box,
  Text,
  Switch,
  Icon,
  TabProvider,
  TabList,
  Tab,
  TabPanel,
  type Theme,
} from '@gravity-ui/uikit';
import {House, CircleInfo, Gear, Sun, Moon} from '@gravity-ui/icons';

import {HomePage} from './pages/HomePage';
import {AboutPage} from './pages/AboutPage';
import {SettingsPage} from './pages/SettingsPage';

interface AppProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function App({theme, onThemeChange}: AppProps) {
  const [tab, setTab] = useState('home');
  const isDark = theme === 'dark';

  return (
    <Box style={{minHeight: '100vh', background: 'var(--g-color-base-background)'}}>
      {/* Header */}
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{
          padding: '0 var(--g-spacing-4)',
          height: 56,
          borderBottom: '1px solid var(--g-color-line-generic)',
          background: 'var(--g-color-base-background)',
        }}
      >
        <Text variant="header-1">My App</Text>
        <Flex alignItems="center" gap={3}>
          <Icon data={Sun} size={16} color={isDark ? 'hint' : 'brand'} />
          <Switch
            checked={isDark}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
          />
          <Icon data={Moon} size={16} color={isDark ? 'brand' : 'hint'} />
        </Flex>
      </Flex>

      {/* Tabs + Pages */}
      <Box style={{padding: 'var(--g-spacing-4) var(--g-spacing-4) 0'}}>
        <TabProvider value={tab} onUpdate={setTab}>
          <TabList>
            <Tab value="home" icon={<Icon data={House} size={16} />}>
              Home
            </Tab>
            <Tab value="about" icon={<Icon data={CircleInfo} size={16} />}>
              About
            </Tab>
            <Tab value="settings" icon={<Icon data={Gear} size={16} />}>
              Settings
            </Tab>
          </TabList>
          <Box style={{paddingTop: 'var(--g-spacing-4)'}}>
            <TabPanel value="home">
              <HomePage />
            </TabPanel>
            <TabPanel value="about">
              <AboutPage />
            </TabPanel>
            <TabPanel value="settings">
              <SettingsPage theme={theme} />
            </TabPanel>
          </Box>
        </TabProvider>
      </Box>
    </Box>
  );
}
