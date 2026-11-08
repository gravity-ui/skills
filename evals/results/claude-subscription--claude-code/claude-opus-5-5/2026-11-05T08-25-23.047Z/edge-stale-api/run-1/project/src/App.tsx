import { Flex, Text } from '@gravity-ui/uikit';

import { ThemeSwitch } from './ThemeSwitch';

export function App() {
    return (
        <Flex direction="column" gap={4} style={{ padding: 24 }}>
            <Text variant="header-1">Настройки оформления</Text>
            <ThemeSwitch />
        </Flex>
    );
}
