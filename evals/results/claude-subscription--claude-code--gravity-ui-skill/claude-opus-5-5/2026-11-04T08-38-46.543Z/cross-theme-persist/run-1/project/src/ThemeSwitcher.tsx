import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useThemeSetting } from './theme/PersistedThemeProvider';
import { type ThemeOption, isThemeOption } from './theme/themeStorage';

const LABELS: Record<ThemeOption, string> = {
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Системная',
};

export function ThemeSwitcher() {
    const { theme, setTheme } = useThemeSetting();

    return (
        <SegmentedRadioGroup<ThemeOption>
            name="theme"
            aria-label="Тема оформления"
            value={theme}
            onUpdate={(value) => {
                if (isThemeOption(value)) setTheme(value);
            }}
        >
            {(Object.keys(LABELS) as ThemeOption[]).map((option) => (
                <SegmentedRadioGroup.Option key={option} value={option}>
                    {LABELS[option]}
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
}
