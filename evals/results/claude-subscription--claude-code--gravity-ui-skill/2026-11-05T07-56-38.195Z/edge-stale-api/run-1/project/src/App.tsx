import {Button, Card, Flex, Text, useThemeType} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';

export function App() {
    const themeType = useThemeType();

    return (
        <Flex direction="column" gap={4} style={{padding: 24, maxWidth: 640}}>
            <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
                <Text variant="header-1">Настройки</Text>
                <ThemeSwitcher />
            </Flex>

            <Card view="outlined" style={{padding: 16}}>
                <Flex direction="column" gap={3} alignItems="flex-start">
                    <Text variant="body-1">
                        Текущая тема: <b>{themeType === 'dark' ? 'тёмная' : 'светлая'}</b>
                    </Text>
                    <Text variant="body-1" color="secondary">
                        Цвета берутся из семантических токенов Gravity UI и переключаются
                        автоматически.
                    </Text>
                    <Flex gap={2} wrap>
                        <Button view="action">Основное действие</Button>
                        <Button view="outlined">Второстепенное</Button>
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}
