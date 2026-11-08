// Только типы: модуль не тянет код движков в основной бандл.
import type {ChartKitWidget} from '@gravity-ui/chartkit';
import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {createValueFormatter} from './format';
import type {ChartWidgetData, ChartWidgetKind} from './types';

/** Аргументы для `<ChartKit />` — общий вход для обоих движков. */
export type ChartKitConfig = {
    [K in 'gravity-charts' | 'yagr']: {type: K; data: ChartKitWidget[K]['data']};
}['gravity-charts' | 'yagr'];

export type ThemeKind = 'light' | 'dark';

// Категориальная палитра: фиксированный порядок слотов, отдельные шаги для тёмной темы.
const SERIES_COLORS: Record<ThemeKind, string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

const getColor = (index: number, theme: ThemeKind) => {
    const colors = SERIES_COLORS[theme];
    // Больше 8 рядов цветом не различить — такие данные стоит сворачивать в «Прочее».
    return colors[Math.min(index, colors.length - 1)];
};

// Сокращения для подписей оси: 1,2 млн, 350 тыс. Объект общий — charts кеширует шкалу по ссылке.
const RU_COMPACT_UNITS = {
    scale: [
        {factor: 1, postfix: ''},
        {factor: 1e3, postfix: 'тыс.'},
        {factor: 1e6, postfix: 'млн'},
        {factor: 1e9, postfix: 'млрд'},
    ],
};

function toGravityCharts(data: ChartWidgetData, theme: ThemeKind): ChartData {
    const {valueFormat = {}} = data;
    const format = createValueFormatter(valueFormat);

    return {
        series: {
            data: data.series.map((series, index) => ({
                type: 'line',
                id: series.id,
                name: series.name,
                color: getColor(index, theme),
                lineWidth: 2,
                // На коротких рядах маркеры помогают считывать точки, на длинных — шумят.
                marker: {enabled: data.timeline.length <= 60, radius: 4},
                data: data.timeline.map((x, i) => ({x, y: series.values[i]})),
            })),
        },
        xAxis: {type: 'datetime'},
        yAxis: [
            {
                min: data.yMin,
                max: data.yMax,
                // На оси — компактно (1,2 млн ₽), полные значения — в тултипе.
                labels: {
                    numberFormat: {
                        precision: 'auto',
                        units: valueFormat.compact ? RU_COMPACT_UNITS : undefined,
                        postfix: valueFormat.unit ? ` ${valueFormat.unit}` : undefined,
                        lang: 'ru',
                    },
                },
            },
        ],
        legend: {enabled: data.series.length > 1},
        tooltip: {
            valueFormat: {type: 'custom', formatter: ({value}) => format(Number(value))},
        },
    };
}

function toYagr(data: ChartWidgetData, theme: ThemeKind): YagrWidgetData {
    const format = createValueFormatter(data.valueFormat);
    const axisFormat = createValueFormatter({...data.valueFormat, precision: 0});

    return {
        data: {
            timeline: data.timeline,
            graphs: data.series.map((series, index) => ({
                id: series.id,
                name: series.name,
                color: getColor(index, theme),
                data: series.values,
            })),
        },
        libraryConfig: {
            chart: {
                series: {type: 'line', width: 1.5},
                // Выделение мышью по оси X — зум, двойной клик — сброс.
                select: {zoom: true},
            },
            scales: {y: {min: data.yMin, max: data.yMax}},
            axes: {
                y: {values: (_u, ticks) => ticks.map((tick) => axisFormat(tick))},
            },
            tooltip: {show: true, tracking: 'sticky', value: (value) => format(value as number)},
            legend: {show: data.series.length > 1, position: 'bottom'},
        },
    };
}

export function toChartKitConfig(
    kind: ChartWidgetKind,
    data: ChartWidgetData,
    theme: ThemeKind,
): ChartKitConfig {
    switch (kind) {
        case 'line':
            return {type: 'gravity-charts', data: toGravityCharts(data, theme)};
        case 'dense':
            return {type: 'yagr', data: toYagr(data, theme)};
    }
}
