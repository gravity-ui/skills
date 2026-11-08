import {useMemo} from 'react';
import {Chart} from '@gravity-ui/charts';
import type {ChartData, LineSeries} from '@gravity-ui/charts';
import {useThemeType} from '@gravity-ui/uikit';

import {CHART_PALETTE} from './chartPalette';

import './LineChart.css';

/** Monthly active users (in thousands) per platform, 2025. */
const MONTHS_2025 = Array.from({length: 12}, (_, month) => Date.UTC(2025, month, 1));

const SOURCE: Array<{name: string; values: number[]}> = [
    {name: 'Web', values: [412, 428, 455, 471, 498, 520, 509, 531, 564, 588, 602, 641]},
    {name: 'iOS', values: [238, 251, 262, 280, 297, 310, 324, 339, 352, 371, 389, 403]},
    {name: 'Android', values: [301, 309, 334, 342, 360, 377, 394, 388, 405, 421, 447, 462]},
];

function buildSeries(): LineSeries[] {
    return SOURCE.map(({name, values}) => ({
        type: 'line',
        name,
        lineWidth: 2,
        interpolation: {type: 'monotone'},
        marker: {enabled: false},
        data: values.map((y, index) => ({x: MONTHS_2025[index], y})),
    }));
}

export function LineChart() {
    // `useThemeType` collapses light / light-hc / dark / dark-hc into 'light' | 'dark',
    // so the series palette follows whatever theme the surrounding ThemeProvider resolves to.
    const themeType = useThemeType();

    const data = useMemo<ChartData>(
        () => ({
            colors: CHART_PALETTE[themeType],
            title: {text: 'Активные пользователи по платформам, 2025'},
            legend: {enabled: true, position: 'bottom'},
            tooltip: {
                headerFormat: {type: 'date', format: 'MMMM YYYY'},
                valueFormat: {type: 'number', showRankDelimiter: true, precision: 0},
            },
            xAxis: {
                type: 'datetime',
                labels: {dateFormat: 'MMM'},
                crosshair: {enabled: true, snap: true},
            },
            yAxis: [
                {
                    title: {text: 'Пользователи, тыс.'},
                    labels: {numberFormat: {showRankDelimiter: true, precision: 0}},
                },
            ],
            series: {data: buildSeries()},
        }),
        [themeType],
    );

    return (
        <div className="line-chart">
            <Chart data={data} lang="ru" />
        </div>
    );
}
