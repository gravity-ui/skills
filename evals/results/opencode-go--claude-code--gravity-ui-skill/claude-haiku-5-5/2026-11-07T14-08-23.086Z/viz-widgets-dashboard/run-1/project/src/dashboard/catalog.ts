import type {Config} from '@gravity-ui/dashkit';
import {ChartColumn, ChartLine, Hashtag, Heading} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';

import type {BarChartData, KpiData, LineChartData} from './types';

export interface WidgetCatalogEntry {
    /** Plugin type; must match a registered plugin. */
    type: string;
    /** Name shown in the action panel. */
    title: string;
    icon: IconData;
    /** Default size in grid units (the grid is 36 columns wide). */
    layout: {w: number; h: number};
    /** Data used when a widget of this type is created. */
    createData: () => Record<string, unknown>;
}

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
    {
        type: 'title',
        title: 'Заголовок',
        icon: Heading,
        layout: {w: 36, h: 2},
        createData: () => ({text: 'Новый раздел', size: 'm'}),
    },
    {
        type: 'kpi',
        title: 'Показатель',
        icon: Hashtag,
        layout: {w: 9, h: 4},
        createData: (): KpiData => ({label: 'Новый показатель', value: '0', delta: '0%', up: true}),
    },
    {
        type: 'line-chart',
        title: 'Линейный график',
        icon: ChartLine,
        layout: {w: 18, h: 11},
        createData: (): LineChartData => ({
            months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
            fact: [820, 910, 880, 1040, 1120, 1210],
            plan: [900, 900, 950, 1000, 1050, 1100],
        }),
    },
    {
        type: 'bar-chart',
        title: 'Столбчатая диаграмма',
        icon: ChartColumn,
        layout: {w: 18, h: 11},
        createData: (): BarChartData => ({
            regions: ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'],
            revenue: [4.1, 2.3, 1.2, 0.9, 0.8],
        }),
    },
];

export function getCatalogEntry(type: string): WidgetCatalogEntry | undefined {
    return WIDGET_CATALOG.find((entry) => entry.type === type);
}

/** Initial dashboard: a title, four KPI tiles, and two charts. */
export const DEFAULT_CONFIG: Config = {
    salt: 'dashboard-v1',
    counter: 8,
    items: [
        {id: 'w-title', type: 'title', namespace: 'default', data: {text: 'Сводка по продажам', size: 'l'}},
        {
            id: 'w-kpi-revenue',
            type: 'kpi',
            namespace: 'default',
            data: {label: 'Выручка', value: '12,4 млн ₽', delta: '+8,2%', up: true} satisfies KpiData,
        },
        {
            id: 'w-kpi-orders',
            type: 'kpi',
            namespace: 'default',
            data: {label: 'Заказы', value: '3 214', delta: '+3,1%', up: true} satisfies KpiData,
        },
        {
            id: 'w-kpi-check',
            type: 'kpi',
            namespace: 'default',
            data: {label: 'Средний чек', value: '3 856 ₽', delta: '−1,4%', up: false} satisfies KpiData,
        },
        {
            id: 'w-kpi-conversion',
            type: 'kpi',
            namespace: 'default',
            data: {label: 'Конверсия', value: '4,6%', delta: '+0,5 п.п.', up: true} satisfies KpiData,
        },
        {
            id: 'w-revenue-chart',
            type: 'line-chart',
            namespace: 'default',
            data: getCatalogEntry('line-chart')!.createData(),
        },
        {
            id: 'w-regions-chart',
            type: 'bar-chart',
            namespace: 'default',
            data: getCatalogEntry('bar-chart')!.createData(),
        },
    ],
    layout: [
        {i: 'w-title', x: 0, y: 0, w: 36, h: 2},
        {i: 'w-kpi-revenue', x: 0, y: 2, w: 9, h: 4},
        {i: 'w-kpi-orders', x: 9, y: 2, w: 9, h: 4},
        {i: 'w-kpi-check', x: 18, y: 2, w: 9, h: 4},
        {i: 'w-kpi-conversion', x: 27, y: 2, w: 9, h: 4},
        {i: 'w-revenue-chart', x: 0, y: 6, w: 18, h: 11},
        {i: 'w-regions-chart', x: 18, y: 6, w: 18, h: 11},
    ],
    aliases: {},
    connections: [],
};
