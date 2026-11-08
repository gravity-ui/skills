import {useCallback, useState} from 'react';

import {Button, Card, Flex, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {RealTheme} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';
import {getInitialTheme, persistTheme} from './theme';

export function App() {
    const [theme, setTheme] = useState<RealTheme>(getInitialTheme);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next: RealTheme = prev.startsWith('dark') ? 'light' : 'dark';
            persistTheme(next);
            return next;
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                gap={6}
                style={{minHeight: '100vh', padding: 'var(--g-spacing-6)'}}
            >
                <Card view="raised" style={{padding: 'var(--g-spacing-8)', maxWidth: 480}}>
                    <Flex direction="column" gap={5}>
                        <Text variant="header-1">Переключатель темы</Text>
                        <Text variant="body-2" color="secondary">
                            Нажмите на переключатель, чтобы сменить оформление интерфейса. Выбор
                            сохраняется в localStorage и применяется при следующем визите.
                        </Text>
                        <ThemeSwitcher onToggle={toggleTheme} />
                        <Flex gap={3}>
                            <Button view="action" size="l" onClick={toggleTheme}>
                                Сменить тему
                            </Button>
                            <Button view="outlined" size="l">
                                Обычная кнопка
                            </Button>
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </ThemeProvider>
    );
}
