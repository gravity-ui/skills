import * as React from 'react';
import {Flex, Text, ThemeProvider, useThemeType} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): ThemeType {
    if (typeof window === 'undefined') {
        return 'light';
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function Content({onThemeChange}: {onThemeChange: (theme: ThemeType) => void}) {
    // Reads the resolved theme type from the nearest ThemeProvider context.
    const themeType = useThemeType();

    return (
        <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
            <Text variant="header-1">Тема оформления</Text>
            <Text color="secondary">
                Сейчас активна {themeType === 'dark' ? 'тёмная' : 'светлая'} тема.
            </Text>
            <ThemeSwitcher value={themeType} onUpdate={onThemeChange} />
        </Flex>
    );
}

export function App() {
    const [theme, setTheme] = React.useState<ThemeType>(getInitialTheme);

    const handleThemeChange = React.useCallback((next: ThemeType) => {
        setTheme(next);
        window.localStorage.setItem(STORAGE_KEY, next);
    }, []);

    // The outermost ThemeProvider applies `g-root g-root_theme_<theme>` to <body>,
    // so the whole page (background, text, all uikit components) switches theme.
    return (
        <ThemeProvider theme={theme}>
            <Content onThemeChange={handleThemeChange} />
        </ThemeProvider>
    );
}
