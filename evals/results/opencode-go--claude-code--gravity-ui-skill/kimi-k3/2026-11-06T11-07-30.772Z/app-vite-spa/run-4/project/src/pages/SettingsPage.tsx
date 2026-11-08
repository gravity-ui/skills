import {Card, Flex, Icon, Switch, Text} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import type {ThemeName} from '../App';

interface SettingsPageProps {
    theme: ThemeName;
    onToggleTheme: () => void;
}

export function SettingsPage({theme, onToggleTheme}: SettingsPageProps) {
    const isDark = theme === 'dark';

    return (
        <Flex direction="column" gap={6}>
            <Flex direction="column" gap={3}>
                <Text variant="header-2">Настройки</Text>
                <Text variant="body-2" color="secondary">
                    Внешний вид приложения.
                </Text>
            </Flex>
            <Card type="container" view="outlined" size="l" spacing={{p: 2}}>
                <Flex alignItems="center" gap={3}>
                    <Icon data={isDark ? Moon : Sun} size={20} color="brand" style={{flexShrink: 0}} />
                    <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                        <Text variant="subheader-2">Тёмная тема</Text>
                        <Text variant="body-1" color="secondary">
                            Сейчас активна {isDark ? 'тёмная' : 'светлая'} тема. Выбор сохраняется в
                            браузере.
                        </Text>
                    </Flex>
                    <Switch
                        size="l"
                        checked={isDark}
                        onUpdate={onToggleTheme}
                        style={{flexShrink: 0}}
                        aria-label="Переключить тёмную тему"
                    />
                </Flex>
            </Card>
        </Flex>
    );
}
