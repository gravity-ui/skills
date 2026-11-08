import type {DashKitProps} from '@gravity-ui/dashkit';

import type {
    ListWidgetData,
    MetricWidgetData,
    ProgressWidgetData,
    TableWidgetData,
    WidgetTypeValue,
} from './types';
import {WidgetType} from './types';

const NAMESPACE = 'default';

export const initialConfig: DashKitProps['config'] = {
    salt: '0.3718204968503551',
    counter: 9,
    items: [
        {
            id: 'title-1',
            type: WidgetType.Title,
            namespace: NAMESPACE,
            data: {size: 'm', text: 'Состояние платформы', showInTOC: false},
        },
        {
            id: 'metric-1',
            type: WidgetType.Metric,
            namespace: NAMESPACE,
            data: {
                title: 'Запросов в минуту',
                value: '12 480',
                delta: 4.2,
                caption: 'к прошлой неделе',
            } satisfies MetricWidgetData,
        },
        {
            id: 'metric-2',
            type: WidgetType.Metric,
            namespace: NAMESPACE,
            data: {
                title: 'Доступность',
                value: '99,93',
                unit: '%',
                delta: -0.02,
                caption: 'SLA 99,9%',
            } satisfies MetricWidgetData,
        },
        {
            id: 'metric-3',
            type: WidgetType.Metric,
            namespace: NAMESPACE,
            data: {
                title: 'Активных инцидентов',
                value: '2',
                caption: '1 критический',
            } satisfies MetricWidgetData,
        },
        {
            id: 'metric-4',
            type: WidgetType.Metric,
            namespace: NAMESPACE,
            data: {
                title: 'Среднее время ответа',
                value: '184',
                unit: 'мс',
                delta: -6.5,
                caption: 'p50 за сутки',
            } satisfies MetricWidgetData,
        },
        {
            id: 'table-1',
            type: WidgetType.Table,
            namespace: NAMESPACE,
            data: {
                title: 'Сервисы',
                rows: [
                    {service: 'api-gateway', status: 'ok', latency: 212, errors: 3},
                    {service: 'auth', status: 'ok', latency: 96, errors: 0},
                    {service: 'billing', status: 'degraded', latency: 840, errors: 41},
                    {service: 'search', status: 'ok', latency: 318, errors: 7},
                    {service: 'notifications', status: 'down', latency: 0, errors: 120},
                ],
            } satisfies TableWidgetData,
        },
        {
            id: 'progress-1',
            type: WidgetType.Progress,
            namespace: NAMESPACE,
            data: {
                title: 'Ресурсы кластера',
                items: [
                    {label: 'CPU', value: 62, theme: 'info'},
                    {label: 'Память', value: 78, theme: 'warning'},
                    {label: 'Диск', value: 41, theme: 'success'},
                    {label: 'Сеть', value: 23, theme: 'default'},
                ],
            } satisfies ProgressWidgetData,
        },
        {
            id: 'list-1',
            type: WidgetType.List,
            namespace: NAMESPACE,
            data: {
                title: 'Последние события',
                items: [
                    {time: '10:42', text: 'notifications: pod перезапущен 3 раза', theme: 'danger'},
                    {time: '10:15', text: 'billing: рост latency выше порога', theme: 'warning'},
                    {time: '09:58', text: 'Релиз api-gateway 2.14.0 выкатан', theme: 'success'},
                    {time: '09:20', text: 'Плановое обслуживание БД завершено', theme: 'info'},
                    {time: '08:47', text: 'auth: ротация ключей выполнена', theme: 'normal'},
                ],
            } satisfies ListWidgetData,
        },
        {
            id: 'text-1',
            type: WidgetType.Text,
            namespace: NAMESPACE,
            data: {
                text: 'Включите режим редактирования, чтобы перетаскивать и изменять размер виджетов, добавлять новые из панели внизу и удалять лишние.',
            },
        },
    ],
    layout: [
        {i: 'title-1', x: 0, y: 0, w: 36, h: 2},
        {i: 'metric-1', x: 0, y: 2, w: 9, h: 6},
        {i: 'metric-2', x: 9, y: 2, w: 9, h: 6},
        {i: 'metric-3', x: 18, y: 2, w: 9, h: 6},
        {i: 'metric-4', x: 27, y: 2, w: 9, h: 6},
        {i: 'table-1', x: 0, y: 8, w: 18, h: 13},
        {i: 'progress-1', x: 18, y: 8, w: 9, h: 13},
        {i: 'list-1', x: 27, y: 8, w: 9, h: 13},
        {i: 'text-1', x: 0, y: 21, w: 36, h: 3},
    ],
    aliases: {},
    connections: [],
};

/** Данные, с которыми создаётся новый виджет из панели добавления. */
export function createDefaultData(type: string): Record<string, unknown> {
    switch (type as WidgetTypeValue) {
        case WidgetType.Title:
            return {size: 'm', text: 'Новый заголовок', showInTOC: false};
        case WidgetType.Text:
            return {text: 'Новый текстовый блок'};
        case WidgetType.Metric:
            return {title: 'Новая метрика', value: '0', caption: 'нет данных'} satisfies MetricWidgetData;
        case WidgetType.Progress:
            return {
                title: 'Новый прогресс',
                items: [
                    {label: 'Показатель A', value: 50},
                    {label: 'Показатель B', value: 25},
                ],
            } satisfies ProgressWidgetData;
        case WidgetType.Table:
            return {
                title: 'Новая таблица',
                rows: [{service: 'example', status: 'ok', latency: 100, errors: 0}],
            } satisfies TableWidgetData;
        case WidgetType.List:
            return {
                title: 'Новый список',
                items: [{time: '00:00', text: 'Событие', theme: 'normal'}],
            } satisfies ListWidgetData;
        default:
            return {};
    }
}
