import { Card, Flex, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeToggle } from './ThemeToggle';

export function App() {
    const themeValue = useThemeValue();

    return (
        <Flex direction="column" gap={4} style={{ padding: 24 }}>
            <Text variant="header-1">Переключатель темы</Text>
            <ThemeToggle />
            <Card view="outlined" style={{ padding: 16, maxWidth: 400 }}>
                <Text variant="body-1" color="secondary">
                    Текущая тема: <Text color="primary">{themeValue}</Text>
                </Text>
            </Card>
        </Flex>
    );
}
