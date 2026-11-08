import { Flex, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
    const resolvedTheme = useThemeValue();

    return (
        <Flex direction="column" gap={4} style={{ padding: 'var(--g-spacing-6)' }}>
            <Text variant="header-1">Тема оформления</Text>
            <ThemeSwitcher />
            <Text variant="body-1" color="secondary">
                Активная тема: {resolvedTheme}. Выбор сохраняется и восстанавливается после
                перезагрузки страницы.
            </Text>
        </Flex>
    );
}
