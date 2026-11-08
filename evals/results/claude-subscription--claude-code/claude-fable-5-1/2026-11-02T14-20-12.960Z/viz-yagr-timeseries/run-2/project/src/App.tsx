import * as React from 'react';
import {Flex, SegmentedRadioGroup, Text, ThemeProvider, type Theme} from '@gravity-ui/uikit';

import {CpuLoadWidget} from './cpu/CpuLoadWidget';

import './App.css';

const THEME_OPTIONS: Array<{value: Theme; content: string}> = [
    {value: 'light', content: 'Светлая'},
    {value: 'dark', content: 'Тёмная'},
    {value: 'system', content: 'Системная'},
];

function MonitoringPage({theme, onThemeChange}: {theme: Theme; onThemeChange: (theme: Theme) => void}) {
    return (
        <main className="monitoring-page">
            <Flex as="header" justifyContent="space-between" alignItems="center" gap={4} className="monitoring-page__header">
                <Text as="h1" variant="header-2" className="monitoring-page__title">
                    Мониторинг
                </Text>
                <SegmentedRadioGroup<Theme> size="m" value={theme} onUpdate={onThemeChange} aria-label="Тема оформления">
                    {THEME_OPTIONS.map((option) => (
                        <SegmentedRadioGroup.Option key={option.value} value={option.value}>
                            {option.content}
                        </SegmentedRadioGroup.Option>
                    ))}
                </SegmentedRadioGroup>
            </Flex>

            <CpuLoadWidget />
        </main>
    );
}

export function App() {
    const [theme, setTheme] = React.useState<Theme>('light');

    return (
        <ThemeProvider theme={theme}>
            <MonitoringPage theme={theme} onThemeChange={setTheme} />
        </ThemeProvider>
    );
}
