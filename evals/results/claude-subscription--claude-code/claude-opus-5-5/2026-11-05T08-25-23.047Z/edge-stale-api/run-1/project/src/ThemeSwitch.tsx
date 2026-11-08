import { Switch, useThemeType } from '@gravity-ui/uikit';

import { useSetTheme } from './theme';

export function ThemeSwitch() {
    // Current resolved theme type ('light' | 'dark') from Gravity UI's ThemeProvider
    const themeType = useThemeType();
    const setTheme = useSetTheme();
    const isDark = themeType === 'dark';

    return (
        <Switch
            size="l"
            checked={isDark}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
            content={isDark ? 'Тёмная тема' : 'Светлая тема'}
        />
    );
}
