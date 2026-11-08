import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {type AppTheme, useAppTheme} from './theme/AppThemeProvider';

const LABELS: Record<AppTheme, string> = {
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Системная',
};

export function ThemeSwitcher() {
    const {theme, setTheme} = useAppTheme();

    return (
        <SegmentedRadioGroup<AppTheme>
            aria-label="Тема интерфейса"
            value={theme}
            onUpdate={setTheme}
            size="m"
        >
            <SegmentedRadioGroup.Option value="light">{LABELS.light}</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">{LABELS.dark}</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="system">{LABELS.system}</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
    );
}
