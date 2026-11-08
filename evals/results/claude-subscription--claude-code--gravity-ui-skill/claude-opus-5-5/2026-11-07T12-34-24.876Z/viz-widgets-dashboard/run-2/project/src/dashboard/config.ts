import type {Config, ConfigItem} from '@gravity-ui/dashkit';

import type {EventsData, GoalsData, MetricData, NoteData, TitleData, WidgetTypeValue} from './types';
import {WidgetType} from './types';

const STORAGE_KEY = 'gravity-dashboard-config';
const NAMESPACE = 'default';

const item = (id: string, type: WidgetTypeValue, data: object): ConfigItem => ({
    id,
    type,
    namespace: NAMESPACE,
    data: data as ConfigItem['data'],
});

export const initialConfig: Config = {
    salt: '0.5829153410276',
    counter: 9,
    items: [
        item('t1', WidgetType.Title, {
            text: 'Обзор продукта',
            size: 'l',
            showInTOC: false,
        } satisfies TitleData),
        item('m1', WidgetType.Metric, {
            title: 'Выручка',
            value: '4,2 млн ₽',
            delta: 12.4,
        } satisfies MetricData),
        item('m2', WidgetType.Metric, {
            title: 'Активные пользователи',
            value: '18 430',
            delta: 5.1,
        } satisfies MetricData),
        item('m3', WidgetType.Metric, {
            title: 'Конверсия в оплату',
            value: '3,8%',
            delta: -0.6,
        } satisfies MetricData),
        item('m4', WidgetType.Metric, {
            title: 'Отток',
            value: '2,1%',
            delta: -0.3,
            inverted: true,
        } satisfies MetricData),
        item('g1', WidgetType.Goals, {
            title: 'Цели квартала',
            goals: [
                {name: 'Запуск мобильного приложения', progress: 100},
                {name: 'Новый тарифный план', progress: 72},
                {name: 'Интеграция с CRM', progress: 45},
                {name: 'Онбординг 2.0', progress: 18},
            ],
        } satisfies GoalsData),
        item('e1', WidgetType.Events, {
            title: 'Последние события',
            events: [
                {text: 'Релиз 3.14 выкачен в прод', time: '12:40', status: 'success'},
                {text: 'Рост ошибок 5xx в API платежей', time: '11:05', status: 'danger'},
                {text: 'Диск на db-02 заполнен на 85%', time: '09:30', status: 'warning'},
                {text: 'Плановые работы в субботу', time: '08:15', status: 'info'},
            ],
        } satisfies EventsData),
        item('n1', WidgetType.Note, {
            title: 'Заметка',
            text: 'Включите «Редактировать», чтобы перетаскивать виджеты за любое место, менять их размер за правый нижний угол и добавлять новые с панели внизу экрана.',
        } satisfies NoteData),
    ],
    layout: [
        {i: 't1', x: 0, y: 0, w: 36, h: 2},
        {i: 'm1', x: 0, y: 2, w: 9, h: 6},
        {i: 'm2', x: 9, y: 2, w: 9, h: 6},
        {i: 'm3', x: 18, y: 2, w: 9, h: 6},
        {i: 'm4', x: 27, y: 2, w: 9, h: 6},
        {i: 'g1', x: 0, y: 8, w: 18, h: 11},
        {i: 'e1', x: 18, y: 8, w: 18, h: 11},
        {i: 'n1', x: 0, y: 19, w: 36, h: 5},
    ],
    aliases: {},
    connections: [],
};

/** Data for a widget freshly added from the action panel. */
export function createWidgetData(type: string): ConfigItem['data'] {
    switch (type) {
        case WidgetType.Title:
            return {text: 'Новый раздел', size: 'm', showInTOC: false} satisfies TitleData;
        case WidgetType.Metric:
            return {title: 'Новая метрика', value: '0', delta: 0} satisfies MetricData;
        case WidgetType.Goals:
            return {
                title: 'Цели',
                goals: [
                    {name: 'Первая цель', progress: 30},
                    {name: 'Вторая цель', progress: 60},
                ],
            } satisfies GoalsData;
        case WidgetType.Events:
            return {
                title: 'События',
                events: [{text: 'Виджет добавлен на дашборд', time: 'сейчас', status: 'info'}],
            } satisfies EventsData;
        default:
            return {title: 'Заметка', text: ''} satisfies NoteData;
    }
}

const KNOWN_TYPES = new Set<string>(Object.values(WidgetType));

function isConfig(value: unknown): value is Config {
    if (!value || typeof value !== 'object') return false;
    const c = value as Partial<Config>;
    return (
        typeof c.salt === 'string' &&
        typeof c.counter === 'number' &&
        Array.isArray(c.items) &&
        Array.isArray(c.layout) &&
        c.items.every((i) => i && KNOWN_TYPES.has(i.type))
    );
}

export function loadConfig(): Config {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        return isConfig(parsed) ? parsed : initialConfig;
    } catch {
        return initialConfig;
    }
}

export function saveConfig(config: Config) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // Storage may be full or disabled — the dashboard keeps working in memory.
    }
}
