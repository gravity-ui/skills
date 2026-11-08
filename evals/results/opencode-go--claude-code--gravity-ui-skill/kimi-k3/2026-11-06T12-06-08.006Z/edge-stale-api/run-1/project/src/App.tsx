import {Button, Card, Flex, Text} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

import {ThemeSwitch} from './ThemeSwitch';

export interface AppProps {
    theme: ThemeType;
    onThemeChange: (theme: ThemeType) => void;
}

export function App({theme, onThemeChange}: AppProps) {
    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{minHeight: '100vh', background: 'var(--g-color-base-background)'}}
        >
            <Card spacing={{p: 8}}>
                <Flex direction="column" alignItems="center" gap={4}>
                    <Text variant="header-1">Тема оформления</Text>
                    <Text variant="body-2" color="secondary">
                        Сейчас активна {theme === 'dark' ? 'тёмная' : 'светлая'} тема. Выбор
                        сохраняется между сессиями.
                    </Text>
                    <ThemeSwitch value={theme} onChange={onThemeChange} />
                    <Button view="action" size="l">
                        Кнопка в текущей теме
                    </Button>
                </Flex>
            </Card>
        </Flex>
    );
}
