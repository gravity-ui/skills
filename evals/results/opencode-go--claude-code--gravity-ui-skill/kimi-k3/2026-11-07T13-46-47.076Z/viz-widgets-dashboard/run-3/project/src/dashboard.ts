import type {ChartData} from '@gravity-ui/charts';
import type {DashKitProps} from '@gravity-ui/dashkit';
import type {IconProps} from '@gravity-ui/uikit';
import {
    ChartColumn,
    ChartDonut,
    ChartLine,
    Heading,
    SquareChartColumn,
    Text as TextIcon,
} from '@gravity-ui/icons';

export type DashboardConfig = DashKitProps['config'];

/* ------------------------------------------------------------------ */
/* Demo datasets (chart configs live in widget data, so they persist   */
/* with the dashboard config). Colors come from the @gravity-ui/charts */
/* default categorical palette — fixed order, theme-aware.             */
/* ------------------------------------------------------------------ */

const MONTHS = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
];

const revenueChart: ChartData = {
    xAxis: {type: 'category', categories: MONTHS},
    series: {
        data: [
            {
                type: 'line',
                name: 'Выручка, млн ₽',
                data: [3.2, 3.8, 4.1, 3.9, 4.4, 4.8, 5.1, 4.9, 5.4, 5.9, 6.2, 6.8].map(
                    (y, x) => ({x, y}),
                ),
            },
            {
                type: 'line',
                name: 'Прибыль, млн ₽',
                data: [0.8, 1.0, 1.2, 1.0, 1.3, 1.5, 1.7, 1.6, 1.8, 2.0, 2.2, 2.5].map(
                    (y, x) => ({x, y}),
                ),
            },
        ],
    },
};

const salesChart: ChartData = {
    xAxis: {
        type: 'category',
        categories: ['Электроника', 'Одежда', 'Продукты', 'Дом и сад', 'Спорт'],
    },
    // One series — the widget title names it, no legend box needed.
    legend: {enabled: false},
    series: {
        data: [
            {
                type: 'bar-x',
                name: 'Продажи, ₽',
                data: [12_400, 8_600, 15_200, 5_400, 7_100].map((y, x) => ({x, y})),
            },
        ],
    },
};

const trafficChart: ChartData = {
    series: {
        data: [
            {
                type: 'pie',
                innerRadius: '50%',
                dataLabels: {enabled: false},
                data: [
                    {name: 'Поиск', value: 42},
                    {name: 'Прямые переходы', value: 26},
                    {name: 'Соцсети', value: 14},
                    {name: 'Реклама', value: 11},
                    {name: 'Рефералы', value: 7},
                ],
            },
        ],
    },
};

const DEFAULT_NOTE_TEXT =
    'Это ваш дашборд. Нажмите «Настроить», чтобы перетаскивать виджеты по сетке, ' +
    'менять их размер, добавлять новые из панели снизу и удалять лишние. ' +
    'Готовая раскладка автоматически сохраняется в браузере.';

/* ------------------------------------------------------------------ */
/* Widget catalog: what can be added from the action panel             */
/* ------------------------------------------------------------------ */

export type WidgetType = 'title' | 'stat' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'note';

export type WidgetCatalogEntry = {
    type: WidgetType;
    title: string;
    icon: IconProps['data'];
    defaultLayout: {w: number; h: number};
    createData: () => Record<string, unknown>;
};

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
    {
        type: 'title',
        title: 'Заголовок',
        icon: Heading,
        defaultLayout: {w: 36, h: 2},
        createData: () => ({size: 'm', text: 'Новый заголовок', showInTOC: false}),
    },
    {
        type: 'stat',
        title: 'Метрика',
        icon: SquareChartColumn,
        defaultLayout: {w: 12, h: 5},
        createData: () => ({
            label: 'Новая метрика',
            value: '1 234',
            delta: '+5,2%',
            trend: 'up',
            sentiment: 'positive',
        }),
    },
    {
        type: 'line-chart',
        title: 'Линейный график',
        icon: ChartLine,
        defaultLayout: {w: 18, h: 11},
        createData: () => ({
            title: 'Динамика по месяцам',
            chart: structuredClone(revenueChart),
        }),
    },
    {
        type: 'bar-chart',
        title: 'Столбчатая диаграмма',
        icon: ChartColumn,
        defaultLayout: {w: 18, h: 11},
        createData: () => ({
            title: 'Сравнение по категориям',
            chart: structuredClone(salesChart),
        }),
    },
    {
        type: 'pie-chart',
        title: 'Круговая диаграмма',
        icon: ChartDonut,
        defaultLayout: {w: 12, h: 11},
        createData: () => ({
            title: 'Структура по каналам',
            chart: structuredClone(trafficChart),
        }),
    },
    {
        type: 'note',
        title: 'Текст',
        icon: TextIcon,
        defaultLayout: {w: 12, h: 6},
        createData: () => ({title: 'Заметка', text: DEFAULT_NOTE_TEXT}),
    },
];

export function createWidgetData(type: string): Record<string, unknown> {
    const entry = WIDGET_CATALOG.find((item) => item.type === type);
    return entry ? entry.createData() : {};
}

/* ------------------------------------------------------------------ */
/* Initial dashboard config (36-column grid)                           */
/* ------------------------------------------------------------------ */

export const initialConfig: DashboardConfig = {
    salt: '0.46703554571365613',
    counter: 8,
    items: [
        {
            id: 'title',
            type: 'title',
            namespace: 'default',
            data: {size: 'm', text: 'Обзор продаж', showInTOC: false},
        },
        {
            id: 'stat-revenue',
            type: 'stat',
            namespace: 'default',
            data: {
                label: 'Выручка',
                value: '4,28 млн ₽',
                delta: '+12,4%',
                trend: 'up',
                sentiment: 'positive',
            },
        },
        {
            id: 'stat-users',
            type: 'stat',
            namespace: 'default',
            data: {
                label: 'Активные пользователи',
                value: '18 492',
                delta: '+8,1%',
                trend: 'up',
                sentiment: 'positive',
            },
        },
        {
            id: 'stat-conversion',
            type: 'stat',
            namespace: 'default',
            data: {
                label: 'Конверсия',
                value: '3,42%',
                delta: '−0,3 п.п.',
                trend: 'down',
                sentiment: 'negative',
            },
        },
        {
            id: 'line-chart',
            type: 'line-chart',
            namespace: 'default',
            data: {title: 'Выручка и прибыль по месяцам', chart: revenueChart},
        },
        {
            id: 'bar-chart',
            type: 'bar-chart',
            namespace: 'default',
            data: {title: 'Продажи по категориям', chart: salesChart},
        },
        {
            id: 'pie-chart',
            type: 'pie-chart',
            namespace: 'default',
            data: {title: 'Трафик по каналам', chart: trafficChart},
        },
        {
            id: 'note',
            type: 'note',
            namespace: 'default',
            data: {title: 'Как это работает', text: DEFAULT_NOTE_TEXT},
        },
    ],
    layout: [
        {i: 'title', x: 0, y: 0, w: 36, h: 2},
        {i: 'stat-revenue', x: 0, y: 2, w: 12, h: 5},
        {i: 'stat-users', x: 12, y: 2, w: 12, h: 5},
        {i: 'stat-conversion', x: 24, y: 2, w: 12, h: 5},
        {i: 'line-chart', x: 0, y: 7, w: 18, h: 11},
        {i: 'bar-chart', x: 18, y: 7, w: 18, h: 11},
        {i: 'pie-chart', x: 0, y: 18, w: 12, h: 11},
        {i: 'note', x: 12, y: 18, w: 24, h: 11},
    ],
    aliases: {},
    connections: [],
};

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const CONFIG_STORAGE_KEY = 'viz-widgets-dashboard:config:v1';

export function loadStoredConfig(): DashboardConfig | null {
    try {
        const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as DashboardConfig;
        if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.layout)) {
            return parsed;
        }
    } catch {
        // corrupted storage — fall back to the default config
    }
    return null;
}

export function storeConfig(config: DashboardConfig) {
    try {
        window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
        // storage may be unavailable (private mode) — ignore
    }
}

export function resetStoredConfig() {
    try {
        window.localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {
        // ignore
    }
}
