import {useCallback, useState} from 'react';
import {Box, Button, Flex, Icon, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {CpuLoadChart} from './CpuLoadChart';

type PageTheme = 'light' | 'dark';

export function App() {
    const [theme, setTheme] = useState<PageTheme>('light');

    const toggleTheme = useCallback(() => {
        setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Flex
                direction="column"
                style={{
                    height: '100vh',
                    minHeight: 480,
                    background: 'var(--g-color-base-background)',
                }}
            >
                <Box
                    spacing={{py: 4, px: 5}}
                    style={{
                        flexShrink: 0,
                        borderBottom: '1px solid var(--g-color-line-generic)',
                    }}
                >
                    <Flex alignItems="center" gap={4}>
                        <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                            <Text variant="header-1">Мониторинг</Text>
                            <Text variant="body-2" color="secondary">
                                Загрузка CPU за последние 24 часа · обновление каждую секунду
                            </Text>
                        </Flex>
                        <Button view="outlined" onClick={toggleTheme} style={{flexShrink: 0}}>
                            <Icon data={theme === 'light' ? Moon : Sun} size={16} />
                            {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                        </Button>
                    </Flex>
                </Box>
                <Box spacing={{p: 5}} style={{flex: 1, minHeight: 0}}>
                    <CpuLoadChart theme={theme} />
                </Box>
            </Flex>
        </ThemeProvider>
    );
}
