import {useMemo, useRef} from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Text} from '@gravity-ui/uikit';

import {useThemeColors} from './useThemeColors';

// Semantic text tokens: solid colors tuned by uikit for contrast against the
// background of each theme (light / dark / high-contrast).
const SERIES_COLOR_TOKENS = [
    '--g-color-text-info',
    '--g-color-text-positive',
    '--g-color-text-utility',
] as const;

const MONTHS = Array.from({length: 12}, (_, i) => Date.UTC(2026, i, 1));

const SERIES = [
    {name: 'Web', values: [420, 460, 510, 495, 560, 610, 640, 630, 690, 720, 760, 810]},
    {name: 'iOS', values: [210, 230, 250, 275, 290, 320, 335, 360, 370, 395, 410, 440]},
    {name: 'Android', values: [180, 195, 205, 240, 255, 270, 300, 310, 335, 350, 380, 405]},
];

export function ThemedLineChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const colors = useThemeColors(containerRef, SERIES_COLOR_TOKENS);

    const data = useMemo<ChartData | null>(() => {
        if (!colors) {
            return null;
        }
        return {
            colors,
            title: {text: 'Активные пользователи, тыс.'},
            xAxis: {type: 'datetime'},
            yAxis: [{title: {text: 'тыс. пользователей'}}],
            legend: {enabled: true},
            series: {
                data: SERIES.map((s) => ({
                    type: 'line',
                    name: s.name,
                    lineWidth: 2,
                    data: s.values.map((y, i) => ({x: MONTHS[i], y})),
                })),
            },
        };
    }, [colors]);

    return (
        <div ref={containerRef} style={{height: 400}}>
            {data ? <Chart data={data} /> : <Text color="secondary">Загрузка…</Text>}
        </div>
    );
}
