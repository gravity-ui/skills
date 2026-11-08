import * as React from 'react';
import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';
import { Card, Flex, Text } from '@gravity-ui/uikit';

import { useThemeTokenColors } from './useThemeTokenColors';

/**
 * Semantic uikit tokens used as the series palette. Each theme (light / dark / high-contrast)
 * defines its own value for them, tuned for contrast against that theme's background, so the
 * lines automatically match whichever theme the app is in.
 */
const SERIES_COLOR_TOKENS = [
    '--g-color-text-info',
    '--g-color-text-utility',
    '--g-color-text-positive',
] as const;

const MONTHS = Array.from({ length: 12 }, (_, i) => Date.UTC(2025, i, 1));

const SERIES: { name: string; values: number[] }[] = [
    { name: 'Веб', values: [42, 45, 51, 49, 56, 61, 64, 62, 69, 74, 78, 85] },
    { name: 'Мобильное приложение', values: [28, 31, 33, 38, 41, 47, 52, 55, 58, 63, 67, 72] },
    { name: 'API', values: [12, 13, 15, 14, 18, 19, 22, 24, 23, 27, 29, 31] },
];

export function App() {
    // Probe element inside the themed root; tokens are resolved from it.
    const probeRef = React.useRef<HTMLDivElement>(null);
    const colors = useThemeTokenColors(probeRef, SERIES_COLOR_TOKENS);

    const data = React.useMemo<ChartData | undefined>(() => {
        if (!colors) {
            return undefined;
        }
        return {
            colors,
            series: {
                data: SERIES.map(({ name, values }) => ({
                    type: 'line',
                    name,
                    lineWidth: 2,
                    data: values.map((y, i) => ({ x: MONTHS[i], y })),
                })),
            },
            xAxis: {
                type: 'datetime',
                labels: { dateFormat: 'MMM' },
            },
            yAxis: [
                {
                    title: { text: 'Тыс. пользователей' },
                    min: 0,
                },
            ],
            legend: { enabled: true },
        };
    }, [colors]);

    return (
        <div ref={probeRef} style={{ padding: 'var(--g-spacing-6)' }}>
            <Card view="outlined" style={{ maxWidth: 960, padding: 'var(--g-spacing-5)' }}>
                <Flex direction="column" gap={4}>
                    <Flex direction="column" gap={1}>
                        <Text variant="subheader-3">Активные пользователи по каналам</Text>
                        <Text variant="body-1" color="secondary">
                            Помесячно, 2025 год
                        </Text>
                    </Flex>
                    {/* Chart fills its parent, so the wrapper needs an explicit height. */}
                    <div style={{ height: 360, minWidth: 0 }}>
                        {data && <Chart data={data} />}
                    </div>
                </Flex>
            </Card>
        </div>
    );
}
