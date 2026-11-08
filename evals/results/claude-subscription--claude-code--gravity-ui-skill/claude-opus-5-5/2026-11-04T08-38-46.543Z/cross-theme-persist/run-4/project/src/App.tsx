import { Flex, Text, sp, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
    // Resolved theme (for "system" — the actual light/dark picked from OS settings).
    const themeValue = useThemeValue();

    return (
        <Flex direction="column" alignItems="flex-start" gap={4} className={sp({ p: 6 })}>
            <Text variant="header-1">Тема оформления</Text>
            <ThemeSwitcher />
            <Text variant="body-1" color="secondary">
                Сейчас применена тема: {themeValue}. Выбор сохраняется и восстанавливается после
                перезагрузки страницы.
            </Text>
        </Flex>
    );
}
