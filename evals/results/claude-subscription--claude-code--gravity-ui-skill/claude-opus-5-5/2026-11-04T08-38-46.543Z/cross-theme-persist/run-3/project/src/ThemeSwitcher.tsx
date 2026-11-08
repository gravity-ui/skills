import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {type AppTheme, useAppTheme} from './theme';

export function ThemeSwitcher() {
    const {theme, setTheme} = useAppTheme();

    return (
        <SegmentedRadioGroup<AppTheme> aria-label="Тема оформления" value={theme} onUpdate={setTheme}>
            <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
    );
}
