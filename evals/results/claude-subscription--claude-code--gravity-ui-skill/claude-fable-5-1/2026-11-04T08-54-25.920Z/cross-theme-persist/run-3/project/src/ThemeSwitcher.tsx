import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {useAppTheme} from './theme/AppThemeProvider';

const OPTIONS: {value: Theme; content: string}[] = [
    {value: 'light', content: 'Светлая'},
    {value: 'dark', content: 'Тёмная'},
    {value: 'system', content: 'Системная'},
];

export function ThemeSwitcher() {
    const {theme, setTheme} = useAppTheme();

    return (
        <SegmentedRadioGroup<Theme>
            aria-label="Тема оформления"
            size="m"
            value={theme}
            onUpdate={setTheme}
            options={OPTIONS}
        />
    );
}
