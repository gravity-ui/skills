import {useState} from 'react';
import {Card, Flex, Icon, SegmentedRadioGroup, Text, ThemeProvider, useTheme} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';
import {Display, Moon, Sun} from '@gravity-ui/icons';

import {LineChart} from './LineChart';

import './App.css';

type ThemeChoice = 'light' | 'dark' | 'system';

const THEME_OPTIONS: Array<{value: ThemeChoice; label: string; icon: typeof Sun}> = [
    {value: 'light', label: 'Светлая', icon: Sun},
    {value: 'dark', label: 'Тёмная', icon: Moon},
    {value: 'system', label: 'Системная', icon: Display},
];

function toThemeChoice(theme: Theme): ThemeChoice {
    if (theme === 'system') return 'system';
    return theme.startsWith('dark') ? 'dark' : 'light';
}

export function App() {
    // Start from the theme the app shell (main.tsx) already provides.
    const appTheme = useTheme();
    const [theme, setTheme] = useState<ThemeChoice>(() => toThemeChoice(appTheme));

    return (
        // A ThemeProvider nested inside the shell provider is automatically scoped: it
        // re-themes only this subtree and every portal (chart tooltip) opened from it.
        <ThemeProvider theme={theme} rootClassName="app-root">
            <Flex direction="column" gap={6} className="app">
                <Flex
                    as="header"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={4}
                    wrap
                >
                    <Text variant="header-1" style={{flex: 1, minWidth: 0}}>
                        Аналитика
                    </Text>
                    <SegmentedRadioGroup<ThemeChoice>
                        value={theme}
                        onUpdate={setTheme}
                        size="m"
                        aria-label="Тема приложения"
                        style={{flexShrink: 0}}
                    >
                        {THEME_OPTIONS.map(({value, label, icon}) => (
                            <SegmentedRadioGroup.Option key={value} value={value}>
                                <Flex as="span" alignItems="center" gap={1}>
                                    <Icon data={icon} size={16} />
                                    {label}
                                </Flex>
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                </Flex>

                <Card type="container" view="outlined" className="app__chart-card">
                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-2">Динамика аудитории</Text>
                        <Text variant="body-1" color="secondary">
                            Ежемесячные активные пользователи по платформам. Цвета осей, сетки,
                            легенды, подсказки и серий следуют текущей теме.
                        </Text>
                    </Flex>
                    <LineChart />
                </Card>
            </Flex>
        </ThemeProvider>
    );
}
