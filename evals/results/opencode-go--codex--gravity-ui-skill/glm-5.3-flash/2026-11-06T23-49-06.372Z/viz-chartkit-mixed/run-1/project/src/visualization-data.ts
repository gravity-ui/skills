import type {ChartData} from '@gravity-ui/charts';
import type {RawSerieData} from '@gravity-ui/yagr';

import type {
    MonitoringDataset,
    SalesDataset,
    VisualizationMode,
    VisualizationModeData,
} from './visualization-types';

function createTimestamps(pointCount: number, intervalMs: number): number[] {
    const hourAgo = Date.now() - 3_600_000;

    return Array.from({length: pointCount}, (_item, index) => hourAgo + index * intervalMs);
}

function createMonitoringSeries(name: string, base: number, amplitude: number): RawSerieData {
    const pointCount = 600;
    const timestamps = createTimestamps(pointCount, 6_000);

    return {
        id: name,
        name,
        color:
            name === 'CPU'
                ? 'var(--g-color-palette-cyan-500-solid)'
                : 'var(--g-color-palette-magenta-500-solid)',
        type: 'line',
        data: timestamps.flatMap((timestamp, pointIndex): [number, number] => {
            const wave = Math.sin((pointIndex / pointCount) * Math.PI * 8) * amplitude;
            const jitter = ((pointIndex * 37) % 11) / 10 - 0.5;

            return [timestamp, Math.max(0, Math.round((base + wave + jitter) * 100) / 100)];
        }),
    };
}

export function createSalesData(): ChartData {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

    return {
        series: {
            data: [
                {
                    type: 'line',
                    name: 'Заказы',
                    data: months.map((_month, index) => ({x: index, y: 240 + index * 35})),
                },
                {
                    type: 'line',
                    name: 'Возвраты',
                    data: months.map((_month, index) => ({x: index, y: 42 + (index % 3) * 12})),
                },
            ],
        },
        xAxis: {
            categories: months,
        },
    };
}

export function createMonitoringData(): VisualizationModeData<'monitoring'> {
    const timeline = createTimestamps(600, 6_000);

    return {
        data: {
            timeline,
            graphs: [
                createMonitoringSeries('CPU', 54, 14),
                createMonitoringSeries('Память', 72, 8),
            ],
        },
        libraryConfig: {
            axes: {
                x: {values: undefined},
            },
            tooltip: {show: true},
        },
    };
}

export const visualizationData: {
    sales: SalesDataset;
    monitoring: MonitoringDataset;
} = {
    sales: {data: createSalesData()},
    monitoring: createMonitoringData(),
};
