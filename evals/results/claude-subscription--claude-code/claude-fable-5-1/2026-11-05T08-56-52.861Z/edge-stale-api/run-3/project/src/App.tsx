import {Button, Card, Container, Flex, Text, useTheme, useThemeValue} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './theme';

export function App() {
    // Актуальный API темы uikit: useTheme — запрошенная тема (включая `system`),
    // useThemeValue — во что она разрешилась (light / dark / light-hc / dark-hc).
    const requestedTheme = useTheme();
    const resolvedTheme = useThemeValue();

    return (
        <Container maxWidth="m">
            <Flex direction="column" gap="spacing-6" paddingBlock="spacing-6">
                <Flex as="header" alignItems="center" justifyContent="space-between" gap="spacing-4" wrap>
                    <Text as="h1" variant="header-1">
                        Gravity UI
                    </Text>
                    <ThemeSwitcher />
                </Flex>

                <Card type="container" view="outlined" size="l">
                    <Flex direction="column" gap="spacing-3">
                        <Text variant="subheader-2">Текущая тема</Text>
                        <Text color="secondary">
                            Выбрано: <Text variant="code-1">{requestedTheme}</Text>, применено:{' '}
                            <Text variant="code-1">{resolvedTheme}</Text>
                        </Text>
                        <Flex gap="spacing-2" wrap>
                            <Button view="action">Action</Button>
                            <Button view="normal">Normal</Button>
                            <Button view="outlined">Outlined</Button>
                            <Button view="flat">Flat</Button>
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </Container>
    );
}
