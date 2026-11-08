import type {ChartKitWidget} from '@gravity-ui/chartkit';

import type {MonitoringModeData, SalesModeData} from './types';

/** Engine-specific configs accepted by `<ChartKit type="..." data={...} />`. */
export type GravityChartsData = ChartKitWidget['gravity-charts']['data'];
export type YagrWidgetData = ChartKitWidget['yagr']['data'];

/**
 * Palette for the canvas-based monitoring engine (yagr needs concrete colors —
 * CSS variables do not resolve in canvas). Values mirror the default
 * @gravity-ui/charts palette so both modes read as one system.
 */
const MONITORING_PALETTE = [
    '#4DA2F1',
    '#FF3D64',
    '#8AD554',
    '#FFC636',
    '#FFB9DD',
    '#84D1EE',
];

/** sales mode → @gravity-ui/charts config (rendered through ChartKit `gravity-charts` plugin). */
export function toGravityChartsData(data: SalesModeData, title?: string): GravityChartsData {
    return {
        title: title ? {text: title} : undefined,
        legend: {enabled: true},
        series: {
            data: data.series.map((serie) => ({
                type: 'line',
                name: serie.name,
                data: serie.points.map((point) => ({x: point.t, y: point.value})),
            })),
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: [
            {
                title: data.yAxisTitle ? {text: data.yAxisTitle} : undefined,
            },
        ],
    };
}

/** monitoring mode → yagr config (rendered through ChartKit `yagr` plugin). */
export function toYagrWidgetData(data: MonitoringModeData): YagrWidgetData {
    return {
        data: {
            timeline: data.timeline,
            graphs: data.series.map((serie, index) => ({
                id: serie.id,
                name: serie.name,
                type: 'line' as const,
                color: serie.color ?? MONITORING_PALETTE[index % MONITORING_PALETTE.length],
                data: serie.values,
            })),
        },
        libraryConfig: {
            chart: {
                // drag-select to zoom into a dense range
                select: {zoom: true},
            },
            scales: {
                x: {time: true},
            },
        },
    };
}
