import '@gravity-ui/yagr/index.css';

import {Card, Text, useThemeValue} from '@gravity-ui/uikit';
import YagrChart, {YagrReactRef} from '@gravity-ui/yagr/react';
import type {YagrTheme} from '@gravity-ui/yagr';
import React from 'react';
import type uPlot from 'uplot';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const POINT_INTERVAL = 2 * 1000;
const POINT_COUNT = Math.floor(DAY / POINT_INTERVAL);

const cpuFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 1,
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

function generateInitialData(): {timeline: number[]; data: (number | null)[]} {
    const now = Math.floor(Date.now() / POINT_INTERVAL) * POINT_INTERVAL;
    const timeline = new Array<number>(POINT_COUNT);
    const data = new Array<number | null>(POINT_COUNT);

    for (let index = POINT_COUNT - 1; index >= 0; index -= 1) {
        const timestamp = now - index * POINT_INTERVAL;
        const hourPhase = (timestamp % DAY) / DAY;
        const dailyLoad = 28 + 22 * Math.sin((hourPhase - 0.25) * Math.PI * 2);
        const jitter = Math.sin(timestamp / 17_000) * 5 + Math.sin(timestamp / 2_100) * 3;
        const value = Math.max(1, Math.min(99, dailyLoad + jitter));

        timeline[POINT_COUNT - 1 - index] = timestamp;
        data[POINT_COUNT - 1 - index] = value;
    }

    return {timeline, data};
}

export function CpuUsageChart() {
    const themeValue = useThemeValue();
    const chartRef = React.useRef<YagrReactRef | null>(null);

    const buffers = React.useMemo(() => generateInitialData(), []);
    const config = React.useMemo(
        () => ({
            chart: {
                series: {type: 'area' as const, width: 1},
                appearance: {theme: themeValue as YagrTheme},
                size: {adaptive: true, resizeDebounceMs: 50},
                timeMultiplier: 1 as const,
            },
            timeline: buffers.timeline,
            series: [
                {
                    id: 'cpu',
                    name: 'CPU',
                    type: 'area' as const,
                    color: 'var(--g-color-base-brand)',
                    scale: 'cpu',
                    data: buffers.data,
                },
            ],
            scales: {
                cpu: {min: 0, max: 100},
            },
            axes: {
                x: {
                    values: (self: uPlot, splits: number[]) =>
                        splits.map((value) =>
                            value === null ? '' : timeFormatter.format(new Date(value)),
                        ),
                },
                cpu: {
                    values: (self: uPlot, splits: number[]) =>
                        splits.map((value) => (value === null ? '' : `${cpuFormatter.format(value)}%`)),
                },
            },
            tooltip: {
                show: true,
                tracking: 'sticky' as const,
                value: (value: string | number | null) =>
                    value === null ? '—' : `${cpuFormatter.format(Number(value))}%`,
            },
            legend: {show: true, position: 'bottom' as const},
        }),
        [themeValue, buffers],
    );

    React.useEffect(() => {
        const timer = window.setInterval(() => {
            const chart = chartRef.current?.yagr();
            if (!chart) {
                return;
            }

            const lastTimestamp = buffers.timeline[buffers.timeline.length - 1];
            const timestamp = lastTimestamp + POINT_INTERVAL;
            const hourPhase = (timestamp % DAY) / DAY;
            const dailyLoad = 28 + 22 * Math.sin((hourPhase - 0.25) * Math.PI * 2);
            const jitter = Math.sin(timestamp / 17_000) * 5 + Math.sin(timestamp / 2_100) * 3;
            const value = Math.max(1, Math.min(99, dailyLoad + jitter));

            buffers.data.push(value);
            buffers.data.shift();

            chart.setSeries(
                [timestamp],
                [{id: 'cpu', data: [value]}],
                {incremental: true, splice: true},
            );
        }, POINT_INTERVAL);

        return () => window.clearInterval(timer);
    }, [buffers]);

    return (
        <Card type="container" view="filled" className="monitoring-card">
            <Text as="h2" variant="subheader-1">
                Загрузка CPU
            </Text>
            <Text variant="body-1" color="secondary">
                Данные за последние 24 часа
            </Text>
            <YagrChart id="cpu-usage-chart" ref={chartRef} config={config} className="cpu-chart" />
        </Card>
    );
}
