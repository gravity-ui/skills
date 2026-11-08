import { SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { type AppTheme, useThemeControl } from './theme';

const THEME_LABELS: Record<AppTheme, string> = {
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Системная',
};

export function ThemeSwitcher() {
    const { theme, setTheme } = useThemeControl();

    return (
        <SegmentedRadioGroup<AppTheme>
            name="theme"
            size="l"
            value={theme}
            onUpdate={setTheme}
            aria-label="Тема оформления"
        >
            {(Object.keys(THEME_LABELS) as AppTheme[]).map((key) => (
                <SegmentedRadioGroup.Option key={key} value={key}>
                    {THEME_LABELS[key]}
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
}

export function App() {
    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="header-1">Тема оформления</Text>
            <ThemeSwitcher />
            <Text color="secondary">Выбор сохраняется и восстанавливается после перезагрузки страницы.</Text>
        </div>
    );
}
