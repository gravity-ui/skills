import type {Config, ConfigItem} from '@gravity-ui/dashkit';

import {METRIC_KEYS} from './data';
import {WIDGET_TYPE} from './widgets';

export const NAMESPACE = 'default';

/**
 * Grid: 36 columns (DashKit default), row height 18px + 12px gap.
 */
export const initialConfig: Config = {
    salt: '0.5803713280',
    counter: 11,
    items: [
        {
            id: 'title',
            type: 'title',
            namespace: NAMESPACE,
            data: {text: 'Продажи · обзор', size: 'l', showInTOC: true},
        },
        ...METRIC_KEYS.map<ConfigItem>((metric) => ({
            id: `metric-${metric}`,
            type: WIDGET_TYPE.Metric,
            namespace: NAMESPACE,
            data: {metric},
        })),
        {
            id: 'revenue',
            type: WIDGET_TYPE.LineChart,
            namespace: NAMESPACE,
            data: {title: 'Выручка по месяцам'},
        },
        {
            id: 'traffic',
            type: WIDGET_TYPE.PieChart,
            namespace: NAMESPACE,
            data: {title: 'Источники трафика, %'},
        },
        {
            id: 'channels',
            type: WIDGET_TYPE.BarChart,
            namespace: NAMESPACE,
            data: {title: 'Заказы по каналам'},
        },
        {
            id: 'products',
            type: WIDGET_TYPE.Table,
            namespace: NAMESPACE,
            data: {title: 'Топ товаров'},
        },
    ],
    layout: [
        {i: 'title', x: 0, y: 0, w: 36, h: 2},
        {i: 'metric-revenue', x: 0, y: 2, w: 9, h: 5},
        {i: 'metric-orders', x: 9, y: 2, w: 9, h: 5},
        {i: 'metric-conversion', x: 18, y: 2, w: 9, h: 5},
        {i: 'metric-users', x: 27, y: 2, w: 9, h: 5},
        {i: 'revenue', x: 0, y: 7, w: 24, h: 12},
        {i: 'traffic', x: 24, y: 7, w: 12, h: 12},
        {i: 'channels', x: 0, y: 19, w: 14, h: 12},
        {i: 'products', x: 14, y: 19, w: 22, h: 12},
    ],
    aliases: {},
    connections: [],
};

/** Data for a freshly added widget of the given plugin type. */
export function createWidgetData(type: string, counter: number): ConfigItem['data'] {
    switch (type) {
        case WIDGET_TYPE.Metric:
            return {metric: METRIC_KEYS[counter % METRIC_KEYS.length]};
        case WIDGET_TYPE.LineChart:
            return {title: 'Выручка по месяцам'};
        case WIDGET_TYPE.BarChart:
            return {title: 'Заказы по каналам'};
        case WIDGET_TYPE.PieChart:
            return {title: 'Источники трафика, %'};
        case WIDGET_TYPE.Table:
            return {title: 'Топ товаров'};
        case 'title':
            return {text: 'Новый раздел', size: 'm', showInTOC: true};
        case WIDGET_TYPE.Note:
            return {text: 'Заметка: опишите здесь контекст для коллег.'};
        default:
            return {};
    }
}
