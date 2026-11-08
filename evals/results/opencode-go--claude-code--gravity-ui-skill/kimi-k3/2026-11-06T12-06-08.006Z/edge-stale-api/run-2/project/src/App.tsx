import {useState} from 'react';

import {Moon, Sun} from '@gravity-ui/icons';
import type {Theme} from '@gravity-ui/uikit';
import {
    Card,
    Flex,
    Icon,
    SegmentedRadioGroup,
    Text,
    ThemeProvider,
    useThemeValue,
} from '@gravity-ui/uikit';

export function App() {
    const [theme, setTheme] = useState<Theme>('light');

    return (
        <ThemeProvider theme={theme}>
            <Page theme={theme} onThemeChange={setTheme} />
        </ThemeProvider>
    );
}

interface PageProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

function Page({theme, onThemeChange}: PageProps) {
    const themeValue = useThemeValue();

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={6}
            style={{
                minHeight: '100vh',
                background: 'var(--g-color-base-background)',
            }}
        >
            <Text variant="header-1">Переключатель темы</Text>

            <SegmentedRadioGroup<Theme>
                size="l"
                value={theme}
                onUpdate={onThemeChange}
                aria-label="Тема оформления"
                options={[
                    {
                        value: 'light',
                        content: (
                            <Flex alignItems="center" gap={2}>
                                <Icon data={Sun} size={16} />
                                Светлая
                            </Flex>
                        ),
                    },
                    {
                        value: 'dark',
                        content: (
                            <Flex alignItems="center" gap={2}>
                                <Icon data={Moon} size={16} />
                                Тёмная
                            </Flex>
                        ),
                    },
                ]}
            />

            <Card view="raised" spacing={{p: 5}} style={{maxWidth: 480}}>
                <Flex direction="column" gap={2}>
                    <Text variant="subheader-2">Демо-контент</Text>
                    <Text variant="body-2" color="secondary">
                        Сейчас активна {themeValue === 'dark' ? 'тёмная' : 'светлая'} тема. Все
                        цвета построены на семантических токенах `--g-*`, поэтому фон, текст и
                        контролы переключаются автоматически.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    );
}
