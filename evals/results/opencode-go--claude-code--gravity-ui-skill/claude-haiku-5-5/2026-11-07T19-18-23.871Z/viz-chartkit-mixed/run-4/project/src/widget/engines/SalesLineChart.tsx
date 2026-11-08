import {useMemo} from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';

import type {EngineProps} from '../types';

/**
 * Engine for `sales` mode: regular linear chart on @gravity-ui/charts.
 * Loaded lazily by the widget, so this module and the charts bundle
 * are fetched only when the mode is shown.
 */
export default function SalesLineChart({series, colors}: EngineProps) {
    const data = useMemo<ChartData>(
        () => ({
            colors: [...colors],
            // Legend for two or more series, none for a single one.
            legend: {enabled: series.length > 1},
            xAxis: {type: 'datetime'},
            series: {
                data: series.map((s) => ({
                    type: 'line' as const,
                    name: s.name,
                    data: s.points.map((p) => ({x: p.t, y: p.v})),
                })),
            },
        }),
        [series, colors],
    );

    return <Chart data={data} />;
}
