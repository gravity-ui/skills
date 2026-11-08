import {Chart} from '@gravity-ui/charts';

import type {VisualizationEngineProps} from './types';

export function SalesChart({data}: VisualizationEngineProps) {
    const sales = data.sales;

    if (!sales) {
        return null;
    }

    return (
        <Chart
            lang="ru"
            data={{
                xAxis: {type: 'datetime'},
                series: {
                    data: sales.series.map((series) => ({
                        type: 'line' as const,
                        name: series.name,
                        data: series.data,
                    })),
                },
            }}
        />
    );
}
