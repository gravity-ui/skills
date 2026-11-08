import type {DashKitProps} from '@gravity-ui/dashkit';

import {WidgetType} from './widgets';

const ns = 'default';

/** Grid is 36 columns wide (DashKit default). */
export const initialConfig: DashKitProps['config'] = {
    salt: '0.42',
    counter: 8,
    items: [
        {id: 't1', type: WidgetType.Title, namespace: ns, data: {text: 'Обзор продукта', size: 'l', showInTOC: false}},
        {id: 'k1', type: WidgetType.Kpi, namespace: ns, data: {label: 'Активные пользователи', value: '12 480', delta: 8.4}},
        {id: 'k2', type: WidgetType.Kpi, namespace: ns, data: {label: 'Выручка', value: '3,2 млн ₽', delta: 3.1}},
        {id: 'k3', type: WidgetType.Kpi, namespace: ns, data: {label: 'Отток', value: '2,4%', delta: -0.6}},
        {id: 'k4', type: WidgetType.Kpi, namespace: ns, data: {label: 'Среднее время ответа', value: '184 мс', delta: -12}},
        {
            id: 'p1',
            type: WidgetType.Progress,
            namespace: ns,
            data: {
                title: 'Цели квартала',
                items: [
                    {name: 'Запуск мобильного приложения', value: 85},
                    {name: 'Миграция на новую платформу', value: 55},
                    {name: 'Выход на новый рынок', value: 25},
                ],
            },
        },
        {
            id: 'a1',
            type: WidgetType.Activity,
            namespace: ns,
            data: {
                title: 'Последние события',
                items: [
                    {id: '1', time: '10:42', text: 'Релиз 2.14 выкатан в продакшен'},
                    {id: '2', time: '09:15', text: 'Новый тариф «Команда» доступен клиентам'},
                    {id: '3', time: 'вчера', text: 'Закрыто 23 обращения в поддержку'},
                    {id: '4', time: 'вчера', text: 'Обновлён отчёт по удержанию'},
                ],
            },
        },
    ],
    layout: [
        {i: 't1', x: 0, y: 0, w: 36, h: 2},
        {i: 'k1', x: 0, y: 2, w: 9, h: 5},
        {i: 'k2', x: 9, y: 2, w: 9, h: 5},
        {i: 'k3', x: 18, y: 2, w: 9, h: 5},
        {i: 'k4', x: 27, y: 2, w: 9, h: 5},
        {i: 'p1', x: 0, y: 7, w: 18, h: 9},
        {i: 'a1', x: 18, y: 7, w: 18, h: 9},
    ],
    aliases: {},
    connections: [],
};
