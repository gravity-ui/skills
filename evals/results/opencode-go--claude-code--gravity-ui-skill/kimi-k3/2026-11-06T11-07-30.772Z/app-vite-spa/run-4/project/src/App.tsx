import {useEffect, useState} from 'react';

import {
    Box,
    Button,
    Container,
    Flex,
    Icon,
    Tab,
    TabList,
    TabPanel,
    TabProvider,
    Text,
    ThemeProvider,
} from '@gravity-ui/uikit';
import {CircleInfo, Gear, House, Moon, Sun} from '@gravity-ui/icons';

import {AboutPage} from './pages/AboutPage';
import {HomePage} from './pages/HomePage';
import {SettingsPage} from './pages/SettingsPage';

export type Page = 'home' | 'about' | 'settings';
export type ThemeName = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): ThemeName {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
    const [theme, setTheme] = useState<ThemeName>(getInitialTheme);
    const [page, setPage] = useState<Page>('home');

    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeProvider theme={theme}>
            <TabProvider value={page} onUpdate={(value) => setPage(value as Page)}>
                <Flex direction="column" style={{minHeight: '100vh'}}>
                    <Box
                        as="header"
                        spacing={{py: 3}}
                        style={{
                            flexShrink: 0,
                            borderBottom: '1px solid var(--g-color-line-generic)',
                        }}
                    >
                        <Container maxWidth="l">
                            <Flex alignItems="center" justifyContent="space-between" gap={4} wrap="wrap">
                                <Text variant="header-1" style={{flexShrink: 0}}>
                                    Моё приложение
                                </Text>
                                <TabList size="l" style={{flex: 1, minWidth: 0}}>
                                    <Tab value="home" icon={<Icon data={House} size={18} />}>
                                        Главная
                                    </Tab>
                                    <Tab value="about" icon={<Icon data={CircleInfo} size={18} />}>
                                        О проекте
                                    </Tab>
                                    <Tab value="settings" icon={<Icon data={Gear} size={18} />}>
                                        Настройки
                                    </Tab>
                                </TabList>
                                <Button view="outlined" onClick={toggleTheme} style={{flexShrink: 0}}>
                                    <Icon data={theme === 'light' ? Moon : Sun} size={16} />
                                    {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                                </Button>
                            </Flex>
                        </Container>
                    </Box>
                    <Box as="main" spacing={{py: 6}} style={{flex: 1, minHeight: 0}}>
                        <Container maxWidth="l">
                            <TabPanel value="home">
                                <HomePage onNavigate={setPage} />
                            </TabPanel>
                            <TabPanel value="about">
                                <AboutPage />
                            </TabPanel>
                            <TabPanel value="settings">
                                <SettingsPage theme={theme} onToggleTheme={toggleTheme} />
                            </TabPanel>
                        </Container>
                    </Box>
                    <Box
                        as="footer"
                        spacing={{py: 4}}
                        style={{
                            flexShrink: 0,
                            borderTop: '1px solid var(--g-color-line-generic)',
                        }}
                    >
                        <Container maxWidth="l">
                            <Text variant="body-1" color="secondary">
                                Демо-приложение на Gravity UI
                            </Text>
                        </Container>
                    </Box>
                </Flex>
            </TabProvider>
        </ThemeProvider>
    );
}
