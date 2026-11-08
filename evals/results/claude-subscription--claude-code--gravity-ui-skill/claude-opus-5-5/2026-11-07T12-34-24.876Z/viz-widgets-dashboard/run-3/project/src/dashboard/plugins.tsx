import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import type {Config, Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

import {ActivityWidget, DealsWidget, GoalsWidget, KpiWidget} from './widgets';
import type {KpiWidgetData, TitledWidgetData} from './data';

export const WIDGET_TYPES = {
    title: 'title',
    kpi: 'kpi',
    goals: 'goals',
    deals: 'deals',
    activity: 'activity',
} as const;

export type WidgetType = (typeof WIDGET_TYPES)[keyof typeof WIDGET_TYPES];

const kpiPlugin: Plugin<PluginWidgetProps> = {
    type: WIDGET_TYPES.kpi,
    defaultLayout: {w: 9, h: 6},
    renderer: ({data}) => {
        const {title, value, delta, icon} = data as KpiWidgetData;
        return <KpiWidget title={title} value={value} delta={delta} icon={icon} />;
    },
};

const goalsPlugin: Plugin<PluginWidgetProps> = {
    type: WIDGET_TYPES.goals,
    defaultLayout: {w: 12, h: 13},
    renderer: ({data}) => <GoalsWidget title={(data as TitledWidgetData).title} />,
};

const dealsPlugin: Plugin<PluginWidgetProps> = {
    type: WIDGET_TYPES.deals,
    defaultLayout: {w: 24, h: 13},
    renderer: ({data}) => <DealsWidget title={(data as TitledWidgetData).title} />,
};

const activityPlugin: Plugin<PluginWidgetProps> = {
    type: WIDGET_TYPES.activity,
    defaultLayout: {w: 12, h: 13},
    renderer: ({data}) => <ActivityWidget title={(data as TitledWidgetData).title} />,
};

const GRID_SETTINGS = {
    gridLayout: {margin: [12, 12] as [number, number], rowHeight: 18},
};

let registered = false;

/** DashKit нужно сконфигурировать до первого рендера. Вызов идемпотентен. */
export function setupDashKit() {
    if (registered) return;
    registered = true;
    DashKit.setSettings({...GRID_SETTINGS, isMobile: false});
    DashKit.registerPlugins(
        pluginTitle,
        kpiPlugin,
        goalsPlugin,
        dealsPlugin,
        activityPlugin,
    );
}

/** На узких экранах DashKit переключается в мобильную раскладку (виджеты в колонку). */
export function setDashKitMobile(isMobile: boolean) {
    DashKit.setSettings({...GRID_SETTINGS, isMobile});
}

/** Пресеты данных для новых виджетов, добавляемых из панели. */
export const WIDGET_PRESETS: Record<WidgetType, Record<string, unknown>> = {
    title: {text: 'Новый раздел', size: 'm', showInTOC: true},
    kpi: {title: 'Новый показатель', value: '0', delta: 0, icon: 'conversion'} satisfies KpiWidgetData,
    goals: {title: 'Цели квартала'},
    deals: {title: 'Последние сделки'},
    activity: {title: 'Активность команды'},
};

export const INITIAL_CONFIG: Config = {
    salt: '0.5734191094',
    counter: 9,
    items: [
        {
            id: 'w1',
            type: WIDGET_TYPES.title,
            namespace: 'default',
            data: {text: 'Продажи · ноябрь 2026', size: 'l', showInTOC: true},
        },
        {
            id: 'w2',
            type: WIDGET_TYPES.kpi,
            namespace: 'default',
            data: {title: 'Выручка', value: '8,4 млн ₽', delta: 12.4, icon: 'revenue'} satisfies KpiWidgetData,
        },
        {
            id: 'w3',
            type: WIDGET_TYPES.kpi,
            namespace: 'default',
            data: {title: 'Заказы', value: '1 284', delta: 4.1, icon: 'orders'} satisfies KpiWidgetData,
        },
        {
            id: 'w4',
            type: WIDGET_TYPES.kpi,
            namespace: 'default',
            data: {title: 'Новые клиенты', value: '312', delta: -2.7, icon: 'customers'} satisfies KpiWidgetData,
        },
        {
            id: 'w5',
            type: WIDGET_TYPES.kpi,
            namespace: 'default',
            data: {title: 'Конверсия', value: '3,8 %', delta: 0.6, icon: 'conversion'} satisfies KpiWidgetData,
        },
        {id: 'w6', type: WIDGET_TYPES.deals, namespace: 'default', data: {title: 'Последние сделки'}},
        {id: 'w7', type: WIDGET_TYPES.goals, namespace: 'default', data: {title: 'Цели квартала'}},
        {id: 'w8', type: WIDGET_TYPES.activity, namespace: 'default', data: {title: 'Активность команды'}},
    ],
    layout: [
        {i: 'w1', x: 0, y: 0, w: 36, h: 2},
        {i: 'w2', x: 0, y: 2, w: 9, h: 6},
        {i: 'w3', x: 9, y: 2, w: 9, h: 6},
        {i: 'w4', x: 18, y: 2, w: 9, h: 6},
        {i: 'w5', x: 27, y: 2, w: 9, h: 6},
        {i: 'w6', x: 0, y: 8, w: 24, h: 13},
        {i: 'w7', x: 24, y: 8, w: 12, h: 13},
        {i: 'w8', x: 0, y: 21, w: 36, h: 11},
    ],
    aliases: {},
    connections: [],
};
