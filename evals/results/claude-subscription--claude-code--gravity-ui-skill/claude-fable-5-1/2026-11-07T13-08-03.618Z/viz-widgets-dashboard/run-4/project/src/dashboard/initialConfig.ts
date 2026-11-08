import type {DashKitProps} from '@gravity-ui/dashkit';

import type {ChartWidgetData} from './widgets/ChartWidget';
import type {MeterWidgetData} from './widgets/MeterWidget';
import type {StatWidgetData} from './widgets/StatWidget';
import type {TableWidgetData} from './widgets/TableWidget';

export type DashboardConfig = DashKitProps['config'];

export const STORAGE_KEY = 'dashkit-demo-config-v1';

const stat = (data: StatWidgetData) => data as unknown as Record<string, unknown>;

export const initialConfig: DashboardConfig = {
    salt: '0.5612345678901234',
    counter: 8,
    aliases: {},
    connections: [],
    items: [
        {
            id: 'title',
            type: 'title',
            namespace: 'default',
            data: {size: 'm', text: 'Обзор платформы', showInTOC: false},
        },
        {
            id: 'stat-users',
            type: 'stat',
            namespace: 'default',
            data: stat({label: 'Активные пользователи', value: 48210, delta: 4.2}),
        },
        {
            id: 'stat-revenue',
            type: 'stat',
            namespace: 'default',
            data: stat({label: 'Выручка', value: 3_420_000, unit: '₽', delta: 1.8}),
        },
        {
            id: 'stat-errors',
            type: 'stat',
            namespace: 'default',
            data: stat({label: 'Ошибки 5xx', value: 127, delta: -12.5, upIsGood: false}),
        },
        {
            id: 'stat-latency',
            type: 'stat',
            namespace: 'default',
            data: stat({label: 'Медианная задержка', value: 184, unit: 'мс', delta: 2.1, upIsGood: false}),
        },
        {
            id: 'chart-signups',
            type: 'chart',
            namespace: 'default',
            data: {
                title: 'Регистрации по дням',
                seriesName: 'Регистрации',
                categories: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                values: [320, 410, 385, 460, 520, 290, 240],
            } satisfies ChartWidgetData,
        },
        {
            id: 'meter-resources',
            type: 'meter',
            namespace: 'default',
            data: {
                title: 'Использование ресурсов',
                items: [
                    {name: 'CPU', value: 62, max: 100, unit: '%'},
                    {name: 'Память', value: 27.4, max: 32, unit: 'ГБ'},
                    {name: 'Диск', value: 1.8, max: 2, unit: 'ТБ'},
                ],
            } satisfies MeterWidgetData,
        },
        {
            id: 'table-services',
            type: 'table',
            namespace: 'default',
            data: {
                title: 'Состояние сервисов',
                rows: [
                    {id: 'api', name: 'API Gateway', requests: 1_204_311, latencyMs: 92, status: 'ok'},
                    {id: 'auth', name: 'Auth', requests: 402_118, latencyMs: 61, status: 'ok'},
                    {id: 'billing', name: 'Billing', requests: 88_902, latencyMs: 340, status: 'warning'},
                    {id: 'search', name: 'Search', requests: 650_774, latencyMs: 128, status: 'ok'},
                    {id: 'export', name: 'Export', requests: 12_044, latencyMs: 1_920, status: 'error'},
                ],
            } satisfies TableWidgetData,
        },
        {
            id: 'note',
            type: 'text',
            namespace: 'default',
            data: {
                text: 'Включите режим редактирования, чтобы перетаскивать виджеты, менять их размер и добавлять новые из панели снизу.',
            },
        },
    ],
    layout: [
        {i: 'title', x: 0, y: 0, w: 36, h: 2},
        {i: 'stat-users', x: 0, y: 2, w: 9, h: 6},
        {i: 'stat-revenue', x: 9, y: 2, w: 9, h: 6},
        {i: 'stat-errors', x: 18, y: 2, w: 9, h: 6},
        {i: 'stat-latency', x: 27, y: 2, w: 9, h: 6},
        {i: 'chart-signups', x: 0, y: 8, w: 22, h: 14},
        {i: 'meter-resources', x: 22, y: 8, w: 14, h: 14},
        {i: 'table-services', x: 0, y: 22, w: 24, h: 13},
        {i: 'note', x: 24, y: 22, w: 12, h: 5},
    ],
};

export function loadConfig(): DashboardConfig {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as DashboardConfig;
            if (Array.isArray(parsed.items) && Array.isArray(parsed.layout)) {
                return parsed;
            }
        }
    } catch {
        // corrupted storage — fall back to defaults
    }
    return initialConfig;
}

export function saveConfig(config: DashboardConfig) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // storage may be unavailable (private mode, quota) — layout just won't persist
    }
}
