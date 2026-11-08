import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useAppTheme } from './theme/AppThemeProvider';
import { type AppTheme, isAppTheme } from './theme/themeStorage';

const OPTIONS: { value: AppTheme; content: string }[] = [
    { value: 'light', content: 'Светлая' },
    { value: 'dark', content: 'Тёмная' },
    { value: 'system', content: 'Системная' },
];

export function ThemeSwitcher() {
    const { theme, setTheme } = useAppTheme();

    return (
        <SegmentedRadioGroup<AppTheme>
            name="theme"
            aria-label="Тема оформления"
            value={theme}
            onUpdate={(value) => {
                if (isAppTheme(value)) {
                    setTheme(value);
                }
            }}
            options={OPTIONS}
        />
    );
}
