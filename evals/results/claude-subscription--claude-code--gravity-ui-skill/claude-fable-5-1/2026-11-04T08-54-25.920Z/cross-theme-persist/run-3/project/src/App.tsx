import {Flex, Text, useThemeValue} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';

export function App() {
    const themeValue = useThemeValue();

    return (
        <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
            <Text variant="header-1">Переключатель темы</Text>
            <ThemeSwitcher />
            <Text variant="body-1" color="secondary">
                Выбор сохраняется в localStorage и восстанавливается после перезагрузки. Текущая тема:{' '}
                <Text variant="code-inline-1">{themeValue}</Text>
            </Text>
        </Flex>
    );
}
