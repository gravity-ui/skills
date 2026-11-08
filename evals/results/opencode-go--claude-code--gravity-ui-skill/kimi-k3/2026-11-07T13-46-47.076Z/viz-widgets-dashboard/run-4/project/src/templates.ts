import type {ChartData} from '@gravity-ui/charts';
import type {Config, ConfigItem} from '@gravity-ui/dashkit';

export type WidgetTemplateId = 'title' | 'note' | 'metric' | 'chart-line' | 'chart-bar' | 'chart-pie';

export interface WidgetTemplate {
    /** Registered DashKit plugin type. */
    type: string;
    /** Preview size while dragging from the action panel. */
    dragLayout: {w: number; h: number};
    /** Fresh data object for a new widget instance. */
    createData: () => ConfigItem['data'];
}

/* ------------------------------------------------------------------ */
/* Demo data for the chart widgets                                     */
/* ------------------------------------------------------------------ */

const WEEK_MS = 7 * 24 * 3600 * 1000;
// 12 weeks ending at the beginning of November 2026.
const BASE_TS = Date.UTC(2026, 7, 17);

const toWeeklyPoints = (values: number[]) =>
    values.map((y, i) => ({x: BASE_TS + i * WEEK_MS, y}));

const lineChartData = (): ChartData => ({
    series: {
        data: [
            {
                type: 'line',
                name: 'Выручка',
                data: toWeeklyPoints([4.2, 4.8, 4.5, 5.1, 5.6, 5.2, 6.0, 6.4, 6.1, 6.9, 7.4, 8.2]),
            },
            {
                type: 'line',
                name: 'План',
                data: toWeeklyPoints([4.0, 4.4, 4.8, 5.0, 5.2, 5.5, 5.8, 6.0, 6.3, 6.6, 7.0, 7.5]),
            },
        ],
    },
    xAxis: {type: 'datetime'},
});

const barChartData = (): ChartData => ({
    series: {
        data: [
            {
                type: 'bar-x',
                name: 'Продажи',
                data: [
                    {x: 'Онлайн', y: 152},
                    {x: 'Розница', y: 98},
                    {x: 'Партнёры', y: 74},
                    {x: 'Прямые продажи', y: 56},
                ],
            },
        ],
    },
    xAxis: {type: 'category'},
});

const pieChartData = (): ChartData => ({
    series: {
        data: [
            {
                type: 'pie',
                innerRadius: '50%',
                data: [
                    {name: 'Онлайн', value: 152},
                    {name: 'Розница', value: 98},
                    {name: 'Партнёры', value: 74},
                    {name: 'Прямые продажи', value: 56},
                ],
            },
        ],
    },
});

/* ------------------------------------------------------------------ */
/* Widget templates (used by the action panel and the initial config)  */
/* ------------------------------------------------------------------ */

export const WIDGET_TEMPLATES: Record<WidgetTemplateId, WidgetTemplate> = {
    title: {
        type: 'title',
        dragLayout: {w: 36, h: 2},
        createData: () => ({text: 'Новый раздел', size: 'm', showInTOC: false}),
    },
    note: {
        type: 'note',
        dragLayout: {w: 12, h: 8},
        createData: () => ({
            title: 'Заметка',
            text: 'Текстовая заметка для комментариев и выводов по данным дашборда.',
        }),
    },
    metric: {
        type: 'metric',
        dragLayout: {w: 9, h: 6},
        createData: () => ({
            title: 'Новая метрика',
            value: '1 024',
            delta: '+2,4%',
            trend: 'up',
        }),
    },
    'chart-line': {
        type: 'chart',
        dragLayout: {w: 18, h: 14},
        createData: () => ({title: 'Выручка по неделям, млн ₽', chart: lineChartData()}),
    },
    'chart-bar': {
        type: 'chart',
        dragLayout: {w: 18, h: 14},
        createData: () => ({title: 'Продажи по каналам', chart: barChartData()}),
    },
    'chart-pie': {
        type: 'chart',
        dragLayout: {w: 12, h: 14},
        createData: () => ({title: 'Структура продаж', chart: pieChartData()}),
    },
};

/* ------------------------------------------------------------------ */
/* Initial dashboard config                                            */
/* ------------------------------------------------------------------ */

const item = (
    id: string,
    templateId: WidgetTemplateId,
    overrides: Record<string, unknown> = {},
    orderId?: number,
): ConfigItem => ({
    id,
    type: WIDGET_TEMPLATES[templateId].type,
    namespace: 'default',
    orderId,
    data: {...WIDGET_TEMPLATES[templateId].createData(), ...overrides},
});

export function createInitialConfig(): Config {
    return {
        salt: '0.9473812563012663',
        counter: 100,
        items: [
            item('h1', 'title', {text: 'Обзор продаж', size: 'l'}, 0),
            item('m1', 'metric', {
                title: 'Выручка',
                value: '8,2 млн ₽',
                delta: '+12,4%',
                trend: 'up',
            }),
            item('m2', 'metric', {
                title: 'Активные пользователи',
                value: '24 531',
                delta: '+5,1%',
                trend: 'up',
            }),
            item('m3', 'metric', {
                title: 'Конверсия в заказ',
                value: '3,42%',
                delta: '−0,3%',
                trend: 'down',
            }),
            item('m4', 'metric', {
                title: 'Средний чек',
                value: '5 460 ₽',
                delta: '+1,8%',
                trend: 'up',
            }),
            item('c1', 'chart-line'),
            item('c2', 'chart-pie'),
            item('c3', 'chart-bar'),
            item('t1', 'note', {
                title: 'Заметки аналитика',
                text: 'Онлайн-канал продолжает расти быстрее остальных. Розница стабильна, партнёрский канал просел после изменения условий программы. Рекомендуем пересмотреть структуру комиссий до конца квартала.',
            }),
        ],
        layout: [
            {i: 'h1', x: 0, y: 0, w: 36, h: 2},
            {i: 'm1', x: 0, y: 2, w: 9, h: 6},
            {i: 'm2', x: 9, y: 2, w: 9, h: 6},
            {i: 'm3', x: 18, y: 2, w: 9, h: 6},
            {i: 'm4', x: 27, y: 2, w: 9, h: 6},
            {i: 'c1', x: 0, y: 8, w: 24, h: 14},
            {i: 'c2', x: 24, y: 8, w: 12, h: 14},
            {i: 'c3', x: 0, y: 22, w: 24, h: 14},
            {i: 't1', x: 24, y: 22, w: 12, h: 14},
        ],
        aliases: {},
        connections: [],
    };
}
