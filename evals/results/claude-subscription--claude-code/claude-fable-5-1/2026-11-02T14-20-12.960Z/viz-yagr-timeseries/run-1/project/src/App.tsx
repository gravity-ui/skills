import * as React from 'react';
import {Card, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {CpuLoadChart} from './cpu/CpuLoadChart';
import {CpuLoadSummary} from './cpu/CpuLoadSummary';
import {createMockCpuLoadSource} from './cpu/cpuLoadSource';

import './App.css';

export interface AppProps {
    theme?: Theme;
    onThemeChange?: (theme: Theme) => void;
}

const THEME_OPTIONS: Array<{value: Theme; content: string}> = [
    {value: 'light', content: 'Светлая'},
    {value: 'dark', content: 'Тёмная'},
    {value: 'system', content: 'Системная'},
];

export function App({theme, onThemeChange}: AppProps) {
    // Один источник на всё время жизни страницы; таймер останавливается при размонтировании.
    const source = React.useMemo(() => createMockCpuLoadSource(), []);
    React.useEffect(() => () => source.dispose(), [source]);

    return (
        <div className="monitoring-page">
            <header className="monitoring-page__header">
                <Text as="h1" variant="header-1">
                    Мониторинг
                </Text>
                {theme && onThemeChange ? (
                    <SegmentedRadioGroup<Theme>
                        size="m"
                        value={theme}
                        options={THEME_OPTIONS}
                        onUpdate={onThemeChange}
                        aria-label="Тема оформления"
                    />
                ) : null}
            </header>

            <Card view="outlined" className="monitoring-page__card">
                <div className="monitoring-page__card-header">
                    <div>
                        <Text as="h2" variant="subheader-3">
                            Загрузка CPU
                        </Text>
                        <Text as="p" variant="body-1" color="secondary">
                            Последние 24 часа, обновляется в реальном времени
                        </Text>
                    </div>
                    <CpuLoadSummary source={source} />
                </div>
                <CpuLoadChart source={source} className="monitoring-page__chart" />
            </Card>
        </div>
    );
}
