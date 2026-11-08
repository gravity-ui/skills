import * as React from 'react';
import { Flex, SegmentedRadioGroup, Text, ThemeProvider } from '@gravity-ui/uikit';

import {
    type AppTheme,
    THEME_STORAGE_KEY,
    isAppTheme,
    readStoredTheme,
    writeStoredTheme,
    DEFAULT_THEME,
} from './themeStorage';

type ThemeSwitcherProps = {
    value: AppTheme;
    onChange: (theme: AppTheme) => void;
};

function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
    return (
        <SegmentedRadioGroup<AppTheme>
            name="theme"
            value={value}
            onUpdate={onChange}
            aria-label="Тема оформления"
        >
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
    );
}

export function App() {
    // Lazy initializer: read localStorage once, synchronously, before the first render,
    // so the restored theme is applied immediately (no flash of the default theme).
    const [theme, setTheme] = React.useState<AppTheme>(readStoredTheme);

    const handleThemeChange = React.useCallback((next: AppTheme) => {
        setTheme(next);
        writeStoredTheme(next);
    }, []);

    // Keep other open tabs in sync: the `storage` event fires in every tab except
    // the one that wrote the value.
    React.useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key !== THEME_STORAGE_KEY && event.key !== null) {
                return;
            }
            // key === null means localStorage.clear() was called.
            setTheme(isAppTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // This is the root (non-scoped) provider: it puts the theme class on <body>,
    // so portals (popups, tooltips, modals) get the selected theme too.
    return (
        <ThemeProvider theme={theme}>
            <Flex direction="column" gap={3} style={{ padding: 24 }}>
                <Text variant="subheader-2">Тема оформления</Text>
                <ThemeSwitcher value={theme} onChange={handleThemeChange} />
            </Flex>
        </ThemeProvider>
    );
}
