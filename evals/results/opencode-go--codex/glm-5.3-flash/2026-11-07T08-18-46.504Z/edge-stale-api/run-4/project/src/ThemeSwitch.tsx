import { SegmentedRadioGroup, useThemeValue } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface ThemeSwitchProps {
    onThemeChange: (themeType: ThemeType) => void;
}

export function ThemeSwitch({ onThemeChange }: ThemeSwitchProps) {
    const themeValue = useThemeValue() as ThemeType;

    return (
        <SegmentedRadioGroup
            value={themeValue}
            name="app-theme"
            aria-label="Color theme"
            onUpdate={onThemeChange}
        >
            <SegmentedRadioGroup.Option value="light" content="Light" />
            <SegmentedRadioGroup.Option value="dark" content="Dark" />
        </SegmentedRadioGroup>
    );
}
