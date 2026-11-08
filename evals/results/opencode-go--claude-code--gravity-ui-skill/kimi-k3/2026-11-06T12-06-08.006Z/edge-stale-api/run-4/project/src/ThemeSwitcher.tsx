import {Flex, Icon, Switch, Text} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import type {SwitchableTheme} from './theme-setting';

interface ThemeSwitcherProps {
    theme: SwitchableTheme;
    onToggle: () => void;
}

export function ThemeSwitcher({theme, onToggle}: ThemeSwitcherProps) {
    const isDark = theme === 'dark';

    return (
        <Flex alignItems="center" gap={2}>
            <Icon data={Sun} size={18} color={isDark ? 'secondary' : 'primary'} />
            <Switch
                checked={isDark}
                onUpdate={onToggle}
                size="l"
                title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            />
            <Icon data={Moon} size={18} color={isDark ? 'primary' : 'secondary'} />
            <Text variant="body-2">{isDark ? 'Тёмная тема' : 'Светлая тема'}</Text>
        </Flex>
    );
}
