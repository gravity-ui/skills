import * as React from 'react';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import {useThemeValue} from '@gravity-ui/uikit';

import {getActiveUsersSeries} from './data';

/**
 * Line colors picked per theme: same hue family, but each step is chosen for
 * its own surface — OKLCH lightness inside the categorical band and >= 3:1
 * contrast against the theme's `--g-color-base-background`
 * (light #ffffff / dark #221d22). A fixed hex (e.g. the default palette)
 * cannot satisfy both themes at once.
 */
const SERIES_COLOR: Record<'light' | 'dark', string> = {
    light: '#1F68A9',
    dark: '#2E90FA',
};

const seriesData = getActiveUsersSeries();

/**
 * Line chart that visually follows the current Gravity UI theme.
 *
 * Axes, grid, tooltip and labels already track the theme through `--g-*`
 * CSS variables; the series color is derived from the resolved theme value
 * (`useThemeValue`), so it stays readable on both light and dark surfaces.
 */
export function ThemedLineChart() {
    const themeValue = useThemeValue();
    const themeType: 'light' | 'dark' = themeValue.includes('dark') ? 'dark' : 'light';

    const data = React.useMemo<ChartData>(
        () => ({
            // A single series needs no legend — the title above names it.
            legend: {enabled: false},
            xAxis: {type: 'datetime'},
            yAxis: [{title: {text: 'Активные пользователи'}}],
            series: {
                data: [
                    {
                        type: 'line',
                        name: 'Активные пользователи',
                        data: seriesData,
                        color: SERIES_COLOR[themeType],
                        lineWidth: 2,
                    },
                ],
            },
        }),
        [themeType],
    );

    return (
        // Chart fills its parent — the wrapper must have an explicit height.
        <div style={{height: 360}}>
            <Chart data={data} />
        </div>
    );
}
