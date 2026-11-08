import React from 'react';
import { Switch, Flex, Text } from '@gravity-ui/uikit';
import { useThemeSwitcher } from './ThemeSwitcher';

export function App() {
    const { theme, setTheme } = useThemeSwitcher();
    const isDark = theme === 'dark';

    const handleUpdate = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    return (
        <div style={{ padding: 24 }}>
            <Flex alignItems="center" gap={2}>
                <Switch checked={isDark} onUpdate={handleUpdate} size="l" />
                <Text variant="body-2">
                    {isDark ? 'Тёмная тема' : 'Светлая тема'}
                </Text>
            </Flex>
        </div>
    );
}
