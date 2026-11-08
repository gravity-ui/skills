import { Switch, useThemeType } from '@gravity-ui/uikit';

import { useAppTheme } from './AppThemeProvider';

export function ThemeToggle() {
    const { setTheme } = useAppTheme();
    // Resolved theme type from uikit's ThemeProvider context
    const themeType = useThemeType();
    const isDark = themeType === 'dark';

    return (
        <Switch
            size="m"
            checked={isDark}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
            content="Тёмная тема"
        />
    );
}
