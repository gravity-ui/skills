import {Moon, Sun} from '@gravity-ui/icons';
import {Flex, Icon, Switch, Text, useThemeValue} from '@gravity-ui/uikit';

interface ThemeSwitcherProps {
    onToggle: () => void;
}

export function ThemeSwitcher({onToggle}: ThemeSwitcherProps) {
    const theme = useThemeValue();
    const isDark = theme.startsWith('dark');

    return (
        <Flex alignItems="center" gap={2}>
            <Icon data={Sun} size={16} />
            <Switch
                size="l"
                checked={isDark}
                onUpdate={onToggle}
                aria-label="Переключить тёмную тему"
            />
            <Icon data={Moon} size={16} />
            <Text variant="body-2" color="secondary">
                {isDark ? 'Тёмная' : 'Светлая'} тема
            </Text>
        </Flex>
    );
}
