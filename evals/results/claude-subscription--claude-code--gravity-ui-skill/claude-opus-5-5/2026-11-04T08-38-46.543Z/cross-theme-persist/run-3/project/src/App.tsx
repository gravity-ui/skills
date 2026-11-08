import {Flex, Text} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';

export function App() {
    return (
        <Flex direction="column" gap={4} style={{padding: 24}}>
            <Text variant="header-1">Тема оформления</Text>
            <Text variant="body-1" color="secondary">
                Выбор сохраняется в localStorage и восстанавливается после перезагрузки страницы.
            </Text>
            <ThemeSwitcher />
        </Flex>
    );
}
