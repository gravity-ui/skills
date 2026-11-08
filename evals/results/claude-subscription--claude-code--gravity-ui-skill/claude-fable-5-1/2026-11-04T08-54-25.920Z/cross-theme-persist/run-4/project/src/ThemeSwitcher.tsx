import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {useAppTheme} from './theme/AppThemeProvider';
import type {AppTheme} from './theme/themeStorage';

export function ThemeSwitcher() {
    const [theme, setTheme] = useAppTheme();

    return (
        <SegmentedRadioGroup<AppTheme>
            size="m"
            value={theme}
            onUpdate={setTheme}
            aria-label="Тема интерфейса"
            qa="theme-switcher"
        >
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
    );
}
