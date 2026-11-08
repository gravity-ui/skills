import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';

import type {SalesSeries} from './types';

export interface SalesChartProps {
    data: SalesSeries[];
    height: number;
}

export function SalesChart({data, height}: SalesChartProps) {
    const chartData: ChartData = {
        series: {
            data: data.map((series) => ({
                type: 'line' as const,
                name: series.name,
                data: series.data.map((p) => ({x: p.x, y: p.y})),
            })),
        },
        xAxis: {
            type: 'linear',
            title: {text: 'День'},
        },
        yAxis: [
            {
                title: {text: 'Продажи, ₽'},
            },
        ],
        title: {
            text: 'Продажи по дням',
        },
        tooltip: {
            valueFormat: {
                type: 'number' as const,
                precision: 0,
            },
        },
    };

    return (
        <div style={{height}}>
            <Chart data={chartData} />
        </div>
    );
}
