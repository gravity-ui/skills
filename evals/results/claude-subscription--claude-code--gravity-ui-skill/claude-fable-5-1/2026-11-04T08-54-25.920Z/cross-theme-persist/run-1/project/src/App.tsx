import {Card, Flex, Text, useThemeValue} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';
import {useAppTheme} from './theme/AppThemeProvider';

export function App() {
    const {theme} = useAppTheme();
    const resolvedTheme = useThemeValue();

    return (
        <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
            <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
                <Text variant="header-1">Настройки темы</Text>
                <ThemeSwitcher />
            </Flex>

            <Card view="filled" style={{padding: 'var(--g-spacing-4)'}}>
                <Flex direction="column" gap={2}>
                    <Text variant="body-2">
                        Выбранная тема:{' '}
                        <Text variant="body-2" color="brand">
                            {theme}
                        </Text>
                        {theme === 'system' ? ` (применяется: ${resolvedTheme})` : null}
                    </Text>
                    <Text variant="body-1" color="secondary">
                        Выбор сохраняется в localStorage и восстанавливается после перезагрузки
                        страницы.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    );
}
