import {Box, Button, Card, Flex, Text} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';
import type {SwitchableTheme} from './theme-setting';

interface AppProps {
    theme: SwitchableTheme;
    onToggleTheme: () => void;
}

export function App({theme, onToggleTheme}: AppProps) {
    return (
        <Box spacing={{px: 5, py: 6}} style={{maxWidth: 720, margin: '0 auto'}}>
            <Flex direction="column" gap={5}>
                <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
                    <Text variant="header-1">Переключатель темы</Text>
                    <ThemeSwitcher theme={theme} onToggle={onToggleTheme} />
                </Flex>

                <Card view="filled" theme="normal" size="l">
                    <Flex direction="column" gap={3}>
                        <Text variant="subheader-2">Демонстрация тем оформления</Text>
                        <Text variant="body-2" color="secondary">
                            Компоненты ниже построены на семантических токенах (--g-color-*), поэтому
                            они автоматически перекрашиваются при смене темы. Выбор сохраняется в
                            localStorage.
                        </Text>
                        <Flex gap={3} wrap>
                            <Button view="action" size="l">
                                Action
                            </Button>
                            <Button view="outlined" size="l">
                                Outlined
                            </Button>
                            <Button view="flat" size="l">
                                Flat
                            </Button>
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </Box>
    );
}
