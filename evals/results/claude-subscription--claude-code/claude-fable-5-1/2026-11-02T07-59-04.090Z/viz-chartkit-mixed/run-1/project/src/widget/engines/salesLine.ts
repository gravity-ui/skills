import type {ChartData} from '@gravity-ui/charts';

import type {VizEngine} from '../types';
import {ensureDateLocale} from './locale';

const RU_NUMBER_UNITS = {
    scale: {base: 1000, postfixes: ['', ' тыс.', ' млн', ' млрд']},
    delimiter: '',
};

/**
 * Обычный линейный график (продажи) на движке `@gravity-ui/charts`.
 * Модуль движка подгружается только при первом показе этого режима.
 */
export const salesLineEngine: VizEngine<'gravity-charts'> = {
    type: 'gravity-charts',
    label: 'Gravity Charts',
    load: async () => {
        const [{GravityChartsPlugin}] = await Promise.all([
            import('@gravity-ui/chartkit/gravity-charts'),
            ensureDateLocale(),
        ]);
        return GravityChartsPlugin;
    },
    buildData: (dataset, ctx): ChartData => {
        const precision = dataset.precision ?? 0;
        const postfix = dataset.unit ? ` ${dataset.unit}` : undefined;

        return {
            colors: ctx.colors,
            legend: {
                enabled: dataset.series.length > 1,
                position: 'bottom',
                align: 'left',
            },
            xAxis: {
                type: 'datetime',
                crosshair: {enabled: true, snap: true},
                grid: {enabled: false},
                labels: {dateTimeLabelFormats: {month: 'MMM YY', year: 'YYYY'}},
            },
            yAxis: [
                {
                    type: 'linear',
                    min: 0,
                    lineVisible: false,
                    title: {text: dataset.unit},
                    labels: {numberFormat: {units: RU_NUMBER_UNITS, precision: 'auto'}},
                },
            ],
            series: {
                data: dataset.series.map((serie, index) => ({
                    type: 'line',
                    name: serie.name,
                    color: ctx.colors[index],
                    lineWidth: 2,
                    nullMode: 'skip',
                    marker: {enabled: false, radius: 4},
                    data: dataset.timeline.map((x, i) => ({x, y: serie.values[i] ?? null})),
                })),
            },
            tooltip: {
                valueFormat: {type: 'number', precision, postfix, showRankDelimiter: true},
                headerFormat: {type: 'date', format: 'MMMM YYYY'},
            },
        };
    },
};
