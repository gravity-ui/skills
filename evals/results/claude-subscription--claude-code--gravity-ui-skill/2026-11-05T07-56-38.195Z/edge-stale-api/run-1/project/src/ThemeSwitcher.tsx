import {Switch, useThemeType} from '@gravity-ui/uikit';

import {useSetTheme} from './AppThemeProvider';

export function ThemeSwitcher() {
    // useThemeType reads the resolved theme ('light' | 'dark') from the uikit ThemeProvider.
    const themeType = useThemeType();
    const setTheme = useSetTheme();

    return (
        <Switch
            size="m"
            checked={themeType === 'dark'}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
            content="Тёмная тема"
        />
    );
}
