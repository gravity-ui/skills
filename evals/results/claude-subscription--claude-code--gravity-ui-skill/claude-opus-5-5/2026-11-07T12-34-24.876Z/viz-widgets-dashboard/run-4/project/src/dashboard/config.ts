import type {Config, ConfigItem} from '@gravity-ui/dashkit';

import type {GoalsData, MetricData, NoteData, OrdersData, TitleData, WidgetType} from './types';
import {WIDGET_TYPE} from './types';

const NAMESPACE = 'default';
const STORAGE_KEY = 'viz-widgets-dashboard:config:v1';

const ORDERS: OrdersData['orders'] = [
    {id: 'A-1042', customer: 'ООО «Вектор»', amount: 184_500, status: 'paid'},
    {id: 'A-1041', customer: 'ИП Смирнова', amount: 23_900, status: 'pending'},
    {id: 'A-1040', customer: 'Северные линии', amount: 412_000, status: 'paid'},
    {id: 'A-1039', customer: 'Кофейня «Зерно»', amount: 8_750, status: 'cancelled'},
    {id: 'A-1038', customer: 'Альфа-Логистик', amount: 96_300, status: 'paid'},
    {id: 'A-1037', customer: 'Студия «Пиксель»', amount: 51_200, status: 'pending'},
];

/** Данные, с которыми создаётся новый виджет из панели действий. */
export function createWidgetData(type: WidgetType): ConfigItem['data'] {
    switch (type) {
        case WIDGET_TYPE.Title:
            return {text: 'Новый раздел', size: 'm', showInTOC: false} satisfies TitleData;
        case WIDGET_TYPE.Metric:
            return {
                title: 'Новая метрика',
                value: 1284,
                delta: 3.2,
                unit: 'count',
                upIsGood: true,
                period: 'к прошлому месяцу',
            } satisfies MetricData;
        case WIDGET_TYPE.Goals:
            return {
                title: 'Цели',
                goals: [
                    {name: 'Цель 1', value: 40, target: 100},
                    {name: 'Цель 2', value: 75, target: 100},
                ],
            } satisfies GoalsData;
        case WIDGET_TYPE.Orders:
            return {title: 'Последние заказы', orders: ORDERS} satisfies OrdersData;
        case WIDGET_TYPE.Note:
            return {title: 'Заметка', text: ''} satisfies NoteData;
    }
}

function item(id: string, type: WidgetType, data: ConfigItem['data']): ConfigItem {
    return {id, type, data, namespace: NAMESPACE};
}

export function createInitialConfig(): Config {
    return {
        salt: '0.5718364092',
        counter: 9,
        items: [
            item('tH', WIDGET_TYPE.Title, {
                text: 'Продажи · ноябрь',
                size: 'l',
                showInTOC: false,
            } satisfies TitleData),
            item('mR', WIDGET_TYPE.Metric, {
                title: 'Выручка',
                value: 4_215_000,
                delta: 12.4,
                unit: 'currency',
                upIsGood: true,
                period: 'к октябрю',
            } satisfies MetricData),
            item('mO', WIDGET_TYPE.Metric, {
                title: 'Заказы',
                value: 1_284,
                delta: 5.1,
                unit: 'count',
                upIsGood: true,
                period: 'к октябрю',
            } satisfies MetricData),
            item('mC', WIDGET_TYPE.Metric, {
                title: 'Конверсия',
                value: 3.8,
                delta: -0.4,
                unit: 'percent',
                upIsGood: true,
                period: 'к октябрю',
            } satisfies MetricData),
            item('mH', WIDGET_TYPE.Metric, {
                title: 'Отток клиентов',
                value: 2.1,
                delta: -0.6,
                unit: 'percent',
                upIsGood: false,
                period: 'к октябрю',
            } satisfies MetricData),
            item('gL', WIDGET_TYPE.Goals, {
                title: 'Цели месяца',
                goals: [
                    {name: 'Выручка, тыс. ₽', value: 4215, target: 5000},
                    {name: 'Новые клиенты', value: 118, target: 150},
                    {name: 'Повторные покупки', value: 342, target: 300},
                    {name: 'Отзывы', value: 27, target: 80},
                ],
            } satisfies GoalsData),
            item('oR', WIDGET_TYPE.Orders, {
                title: 'Последние заказы',
                orders: ORDERS,
            } satisfies OrdersData),
            item('nT', WIDGET_TYPE.Note, {
                title: 'Как пользоваться',
                text:
                    'Включите «Редактирование», чтобы перетаскивать виджеты за любое место ' +
                    'и менять их размер за правый нижний угол. Новые виджеты добавляются ' +
                    'с панели внизу — кликом или перетаскиванием на сетку. Раскладка ' +
                    'сохраняется в браузере.',
            } satisfies NoteData),
        ],
        layout: [
            {i: 'tH', x: 0, y: 0, w: 36, h: 2},
            {i: 'mR', x: 0, y: 2, w: 9, h: 7},
            {i: 'mO', x: 9, y: 2, w: 9, h: 7},
            {i: 'mC', x: 18, y: 2, w: 9, h: 7},
            {i: 'mH', x: 27, y: 2, w: 9, h: 7},
            {i: 'gL', x: 0, y: 9, w: 12, h: 13},
            {i: 'oR', x: 12, y: 9, w: 24, h: 13},
            {i: 'nT', x: 0, y: 22, w: 12, h: 7},
        ],
        aliases: {},
        connections: [],
    };
}

function isConfig(value: unknown): value is Config {
    if (!value || typeof value !== 'object') return false;
    const v = value as Partial<Config>;
    return (
        typeof v.salt === 'string' &&
        typeof v.counter === 'number' &&
        Array.isArray(v.items) &&
        Array.isArray(v.layout) &&
        Array.isArray(v.connections) &&
        typeof v.aliases === 'object'
    );
}

export function loadConfig(): Config {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (isConfig(parsed)) return parsed;
        }
    } catch {
        // Повреждённые данные или недоступный storage — используем стартовый конфиг.
    }
    return createInitialConfig();
}

export function saveConfig(config: Config) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // Квота или приватный режим — раскладка просто не сохранится.
    }
}
