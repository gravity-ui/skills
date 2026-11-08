// Mock datasets used by the widgets. In a real app these would come from an API.

export type MetricKey = 'revenue' | 'orders' | 'conversion' | 'users';

export interface MetricDataset {
    label: string;
    value: string;
    /** Relative change vs. previous period, in percent. */
    delta: number;
    hint: string;
}

export const METRICS: Record<MetricKey, MetricDataset> = {
    revenue: {label: 'Выручка', value: '12,4 млн ₽', delta: 8.2, hint: 'за 30 дней'},
    orders: {label: 'Заказы', value: '3 482', delta: 4.6, hint: 'за 30 дней'},
    conversion: {label: 'Конверсия', value: '3,1 %', delta: -0.4, hint: 'визит → заказ'},
    users: {label: 'Активные пользователи', value: '48 920', delta: 12.9, hint: 'MAU'},
};

export const METRIC_KEYS = Object.keys(METRICS) as MetricKey[];

export const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const REVENUE_BY_MONTH = {
    current: [7.1, 7.6, 8.4, 8.1, 9.0, 9.6, 9.9, 10.4, 11.2, 11.8, 12.1, 12.4],
    previous: [5.9, 6.2, 6.8, 7.0, 7.3, 7.9, 8.1, 8.4, 8.9, 9.3, 9.8, 10.2],
};

export const ORDERS_BY_CHANNEL = [
    {channel: 'Сайт', orders: 1540},
    {channel: 'Приложение', orders: 1120},
    {channel: 'Маркетплейсы', orders: 610},
    {channel: 'Офлайн', orders: 212},
];

export const TRAFFIC_SOURCES = [
    {name: 'Поиск', value: 42},
    {name: 'Прямые заходы', value: 23},
    {name: 'Соцсети', value: 18},
    {name: 'Рассылки', value: 11},
    {name: 'Реклама', value: 6},
];

export interface ProductRow {
    name: string;
    category: string;
    sold: number;
    revenue: number;
    stock: 'ok' | 'low' | 'out';
}

export const TOP_PRODUCTS: ProductRow[] = [
    {name: 'Наушники Aero', category: 'Аудио', sold: 412, revenue: 2_884_000, stock: 'ok'},
    {name: 'Смарт-часы Pulse', category: 'Гаджеты', sold: 298, revenue: 3_576_000, stock: 'low'},
    {name: 'Колонка Orbit', category: 'Аудио', sold: 251, revenue: 1_255_000, stock: 'ok'},
    {name: 'Power bank 20K', category: 'Аксессуары', sold: 230, revenue: 552_000, stock: 'out'},
    {name: 'Клавиатура Flow', category: 'Периферия', sold: 187, revenue: 1_122_000, stock: 'ok'},
    {name: 'Мышь Glide', category: 'Периферия', sold: 164, revenue: 410_000, stock: 'low'},
];
