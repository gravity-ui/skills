import type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {VisualizationWidgetData} from '../types';

/**
 * Маппит единые данные виджета на конфиг `@gravity-ui/yagr` (плагин ChartKit `yagr`):
 * плотный временной ряд на canvas без маркеров, с курсором-линией и общим тултипом.
 */
export function toYagrData(input: VisualizationWidgetData): YagrWidgetData {
    const graphs: RawSerieData[] = input.series.map((serie) => ({
        id: serie.id,
        name: serie.name,
        color: serie.color,
        type: 'line',
        width: 1.5,
        spanGaps: false,
        data: serie.values,
        precision: 2,
        formatter: input.unit
            ? (value) => (value === null ? '—' : `${value} ${input.unit}`)
            : undefined,
    }));

    return {
        data: {
            graphs,
            timeline: input.timestamps,
            timeZone: input.timeZone,
        },
        libraryConfig: {
            chart: {
                series: {type: 'line'},
                select: {zoom: true},
            },
            scales: {
                y: {min: 0, range: 'nice'},
            },
            axes: {
                y: {
                    precision: 'auto',
                    label: input.valueLabel,
                },
            },
            cursor: {
                x: {visible: true, style: '1px solid var(--g-color-line-generic-active)'},
                markersSize: 6,
                snapToValues: 'closest',
            },
            tooltip: {
                show: true,
                tracking: 'sticky',
                sum: false,
            },
            legend: {show: true, position: 'bottom'},
        },
    };
}
