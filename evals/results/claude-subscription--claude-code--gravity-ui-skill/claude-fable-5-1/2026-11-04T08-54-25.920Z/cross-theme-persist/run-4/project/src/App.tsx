import {Button, Card, Flex, Text, useThemeValue} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';

export function App() {
    const resolvedTheme = useThemeValue();

    return (
        <Flex direction="column" gap="5" style={{padding: 'var(--g-spacing-6)', minHeight: '100vh'}}>
            <Flex alignItems="center" justifyContent="space-between" gap="4" wrap>
                <Text as="h1" variant="header-2">
                    Настройки темы
                </Text>
                <ThemeSwitcher />
            </Flex>

            <Card type="container" view="filled" size="l">
                <Flex direction="column" gap="3">
                    <Text variant="subheader-2">Текущая тема: {resolvedTheme}</Text>
                    <Text variant="body-1" color="secondary">
                        Выбор сохраняется в localStorage и восстанавливается после перезагрузки
                        страницы. Режим «Системная» следует настройке операционной системы.
                    </Text>
                    <Flex gap="2" wrap>
                        <Button view="action">Основное действие</Button>
                        <Button view="normal">Обычное действие</Button>
                        <Button view="outlined">Контур</Button>
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}
