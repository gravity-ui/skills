import {useState} from 'react';
import {Box, Button, Card, Flex, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {CpuLoadChart} from './components/CpuLoadChart';

type AppTheme = 'light' | 'dark';

const getInitialTheme = (): AppTheme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function App() {
    const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
    const isDark = theme === 'dark';

    return (
        <ThemeProvider theme={theme} lang="ru">
            <Box spacing={{p: 6}}>
                <div style={{maxWidth: 1200, margin: '0 auto'}}>
                    <Flex justifyContent="space-between" alignItems="center">
                        <Text variant="header-1">Мониторинг сервера</Text>
                        <Button
                            view="outlined"
                            onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        >
                            <Icon data={isDark ? Sun : Moon} size={16} />
                            {isDark ? 'Светлая тема' : 'Тёмная тема'}
                        </Button>
                    </Flex>
                    <Box spacing={{mt: 5}}>
                        <Card view="raised" size="l">
                            <Box spacing={{p: 5}}>
                                <Flex direction="column" gap={1}>
                                    <Text variant="subheader-2">Загрузка CPU</Text>
                                    <Text variant="body-2" color="secondary">
                                        Последние 24 часа · 86 400 точек · обновление каждую
                                        секунду
                                    </Text>
                                </Flex>
                                <Box spacing={{mt: 4}}>
                                    <CpuLoadChart theme={theme} />
                                </Box>
                            </Box>
                        </Card>
                    </Box>
                </div>
            </Box>
        </ThemeProvider>
    );
}
