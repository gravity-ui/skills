import {Chart, type ChartData} from '@gravity-ui/charts';
import {useMemo} from 'react';

import type {EngineProps} from '../types';

/**
 * "sales" mode: a plain linear line chart on a time axis, rendered by @gravity-ui/charts.
 * Loaded lazily by the widget, so this module and its chart engine stay out of the main bundle.
 */
export default function SalesLineEngine({series, colors, height, unit, formatValue, ariaLabel}: EngineProps) {
    const data = useMemo<ChartData>(() => {
        const valueFormat = {
            type: 'custom' as const,
            formatter: ({value}: {value: unknown}) => formatValue(Number(value)),
        };

        return {
            colors,
            legend: {enabled: false},
            xAxis: {type: 'datetime'},
            yAxis: [{labels: {numberFormat: {postfix: unit ? ` ${unit}` : ''}}}],
            series: {
                data: series.map((s, i) => ({
                    type: 'line' as const,
                    name: s.name,
                    color: colors[i],
                    lineWidth: 2,
                    dataLabels: {enabled: false},
                    tooltip: {valueFormat},
                    data: s.points.map((p) => ({x: p.x, y: p.y})),
                })),
            },
        };
    }, [series, colors, unit, formatValue]);

    return (
        <div role="group" aria-label={ariaLabel} style={{height, width: '100%'}}>
            <Chart data={data} lang="ru" />
        </div>
    );
}
