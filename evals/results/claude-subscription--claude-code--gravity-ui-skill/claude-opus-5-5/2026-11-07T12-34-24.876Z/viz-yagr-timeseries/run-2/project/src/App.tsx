import React from 'react';
import {Button, Card, Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';
import type {CpuLoadChartHandle, CpuZoomRange} from './monitoring/CpuLoadChart';
import {createSimulatedCpuSource} from './monitoring/cpuSource';

import './App.css';

const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const THEME_OPTIONS = [
    {value: 'light', content: 'Светлая'},
    {value: 'dark', content: 'Тёмная'},
    {value: 'system', content: 'Системная'},
];

interface AppProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export function App({theme, onThemeChange}: AppProps) {
    // Один источник на всё время жизни страницы.
    const [source] = React.useState(() => createSimulatedCpuSource());
    const chartRef = React.useRef<CpuLoadChartHandle>(null);
    const [latest, setLatest] = React.useState<{value: number | null; ts: number} | null>(null);
    const [zoom, setZoom] = React.useState<CpuZoomRange | null>(null);

    const handleLatestValue = React.useCallback((value: number | null, ts: number) => {
        setLatest({value, ts});
    }, []);

    return (
        <Flex direction="column" gap={5} className="monitoring-page">
            <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
                <Text variant="header-1">Мониторинг</Text>
                <SegmentedRadioGroup
                    aria-label="Тема оформления"
                    value={theme}
                    onUpdate={(value) => onThemeChange(value as Theme)}
                    options={THEME_OPTIONS}
                />
            </Flex>

            <Card view="outlined" spacing={{p: 4}} className="monitoring-page__card">
                <Flex direction="column" gap={3} className="monitoring-page__card-content">
                    <Flex alignItems="flex-start" justifyContent="space-between" gap={4} wrap>
                        <Flex direction="column" gap={1} className="monitoring-page__title">
                            <Text variant="subheader-3">Загрузка CPU</Text>
                            <Text variant="body-1" color="secondary">
                                {zoom
                                    ? `${timeFormat.format(zoom.from)} — ${timeFormat.format(zoom.to)}`
                                    : 'Последние 24 часа · обновляется в реальном времени'}
                            </Text>
                        </Flex>
                        <Flex alignItems="center" gap={4} className="monitoring-page__summary">
                            {zoom && (
                                <Button view="outlined" onClick={() => chartRef.current?.resetZoom()}>
                                    Сбросить масштаб
                                </Button>
                            )}
                            <Flex direction="column" alignItems="flex-end">
                                <Text variant="subheader-3">
                                    {latest?.value == null ? '—' : `${latest.value.toFixed(1)}%`}
                                </Text>
                                <Text variant="caption-2" color="secondary">
                                    {latest ? `сейчас, ${timeFormat.format(latest.ts)}` : 'нет данных'}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>

                    <div className="monitoring-page__chart">
                        <CpuLoadChart
                            ref={chartRef}
                            source={source}
                            onLatestValue={handleLatestValue}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <Text variant="caption-2" color="secondary">
                        Выделите участок мышью, чтобы приблизить; двойной клик — вернуть сутки.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    );
}
