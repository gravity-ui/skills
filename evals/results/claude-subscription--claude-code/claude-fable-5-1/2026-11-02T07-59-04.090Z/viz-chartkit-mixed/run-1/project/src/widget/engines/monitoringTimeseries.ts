import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {VizEngine} from '../types';
import {ensureDateLocale} from './locale';

/**
 * Плотный временной ряд (мониторинг) на движке Yagr поверх uPlot:
 * canvas-рендер тысяч точек, зум выделением, закрепляемый тултип.
 * Модуль движка подгружается только при первом показе этого режима.
 */
export const monitoringTimeseriesEngine: VizEngine<'yagr'> = {
    type: 'yagr',
    label: 'Yagr (uPlot)',
    load: async () => {
        const [{YagrPlugin}] = await Promise.all([import('@gravity-ui/chartkit/yagr'), ensureDateLocale()]);
        return YagrPlugin;
    },
    buildData: (dataset, ctx): YagrWidgetData => {
        const precision = dataset.precision ?? 1;
        const numberFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: precision});
        const formatValue = (value: string | number | null) => {
            if (value === null || value === undefined || value === '') {
                return '—';
            }
            const num = Number(value);
            const text = Number.isFinite(num) ? numberFormat.format(num) : String(value);
            return dataset.unit ? `${text} ${dataset.unit}` : text;
        };

        return {
            data: {
                timeline: dataset.timeline,
                timeZone: dataset.timeZone,
                graphs: dataset.series.map((serie, index) => ({
                    id: serie.id,
                    name: serie.name,
                    color: ctx.colors[index],
                    data: serie.values,
                    type: 'line',
                    width: 1.5,
                    spanGaps: false,
                })),
            },
            libraryConfig: {
                chart: {
                    series: {type: 'line', width: 1.5, interpolation: 'linear'},
                    select: {zoom: true},
                },
                legend: {show: dataset.series.length > 1, position: 'bottom'},
                tooltip: {
                    show: true,
                    sum: false,
                    strategy: 'pin',
                    tracking: 'sticky',
                    precision,
                    value: formatValue,
                },
                cursor: {
                    x: {visible: true},
                    y: {visible: false},
                    markersSize: 6,
                },
                axes: {
                    // Точные подписи делений: «1 500», а не округлённое «2K».
                    y: {label: dataset.unit, values: (_u, splits) => splits.map((v) => numberFormat.format(v))},
                    x: {splitsCount: 8},
                },
                scales: {y: {min: 0, range: 'nice'}},
            },
        };
    },
};
