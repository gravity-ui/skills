import React from 'react';

import {SegmentedRadioGroup, Text, ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {getStoredTheme, storeTheme} from './theme-storage';

export function App() {
    const [theme, setTheme] = React.useState<Theme>(getStoredTheme);

    const handleUpdate = (value: Theme) => {
        setTheme(value);
        storeTheme(value);
    };

    return (
        <ThemeProvider theme={theme}>
            <ThemeSwitcher theme={theme} onUpdate={handleUpdate} />
        </ThemeProvider>
    );
}

function ThemeSwitcher({theme, onUpdate}: {theme: Theme; onUpdate: (value: Theme) => void}) {
    const themeValue = useThemeValue();

    return (
        <div
            style={{
                padding: 24,
                minHeight: '100vh',
                background: 'var(--g-color-base-background)',
                color: 'var(--g-color-text-primary)',
            }}
        >
            <Text variant="header-2">Переключатель темы</Text>
            <div style={{marginTop: 16}}>
                <SegmentedRadioGroup<Theme> value={theme} onUpdate={onUpdate}>
                    <SegmentedRadioGroup.Option value="system">
                        Системная
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="light">
                        Светлая
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
            </div>
            <div style={{marginTop: 16}}>
                <Text variant="body-2">
                    Выбрана тема: {theme} (активная: {themeValue}). Выбор сохраняется в localStorage
                    и восстановится после перезагрузки страницы.
                </Text>
            </div>
        </div>
    );
}
