import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

export interface ThemeSwitcherProps {
    value: ThemeType;
    onUpdate: (theme: ThemeType) => void;
}

const OPTIONS: {value: ThemeType; content: string}[] = [
    {value: 'light', content: 'Светлая'},
    {value: 'dark', content: 'Тёмная'},
];

export function ThemeSwitcher({value, onUpdate}: ThemeSwitcherProps) {
    return (
        <SegmentedRadioGroup<ThemeType>
            name="theme"
            aria-label="Тема оформления"
            size="m"
            value={value}
            onUpdate={onUpdate}
            options={OPTIONS}
        />
    );
}
