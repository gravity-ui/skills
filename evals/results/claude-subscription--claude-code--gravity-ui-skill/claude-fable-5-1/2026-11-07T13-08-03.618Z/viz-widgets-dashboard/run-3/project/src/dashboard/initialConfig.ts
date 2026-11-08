import type {DashKitProps} from '@gravity-ui/dashkit';

import {WIDGET_TYPES} from './dashkitSetup';
import type {MetricWidgetData} from './widgets/MetricWidget';
import type {NoteWidgetData} from './widgets/NoteWidget';
import type {ProgressWidgetData} from './widgets/ProgressWidget';
import type {TableWidgetData} from './widgets/TableWidget';

export type DashboardConfig = DashKitProps['config'];

const NAMESPACE = 'default';

const revenue: MetricWidgetData = {
  title: 'Выручка за месяц',
  value: 4_820_000,
  unit: '₽',
  delta: 12.4,
  caption: 'к прошлому месяцу',
};

const orders: MetricWidgetData = {
  title: 'Заказы',
  value: 1_284,
  delta: 3.1,
  caption: 'к прошлому месяцу',
};

const users: MetricWidgetData = {
  title: 'Активные пользователи',
  value: 38_902,
  delta: -1.8,
  caption: 'к прошлой неделе',
};

const errors: MetricWidgetData = {
  title: 'Ошибки API',
  value: 17,
  unit: 'за час',
  delta: -42,
  caption: 'к прошлому часу',
};

const recentOrders: TableWidgetData = {title: 'Последние заказы'};

const resources: ProgressWidgetData = {
  title: 'Нагрузка на серверы',
  items: [
    {name: 'api-01', value: 42},
    {name: 'api-02', value: 67},
    {name: 'db-primary', value: 91},
    {name: 'db-replica', value: 74},
    {name: 'cache', value: 23},
  ],
};

const note: NoteWidgetData = {
  title: 'Заметка',
  text:
    'Включите режим редактирования, чтобы перетаскивать и растягивать виджеты.\n' +
    'Новые виджеты можно добавить с панели внизу, а удалить — через меню на виджете.',
};

export const INITIAL_CONFIG: DashboardConfig = {
  salt: '0.5921383477',
  counter: 8,
  items: [
    {
      id: 'heading',
      type: WIDGET_TYPES.title,
      namespace: NAMESPACE,
      data: {size: 'l', text: 'Сводка по продажам', showInTOC: false},
    },
    {id: 'm-revenue', type: WIDGET_TYPES.metric, namespace: NAMESPACE, data: {...revenue}},
    {id: 'm-orders', type: WIDGET_TYPES.metric, namespace: NAMESPACE, data: {...orders}},
    {id: 'm-users', type: WIDGET_TYPES.metric, namespace: NAMESPACE, data: {...users}},
    {id: 'm-errors', type: WIDGET_TYPES.metric, namespace: NAMESPACE, data: {...errors}},
    {id: 't-orders', type: WIDGET_TYPES.table, namespace: NAMESPACE, data: {...recentOrders}},
    {id: 'p-load', type: WIDGET_TYPES.progress, namespace: NAMESPACE, data: {...resources}},
    {id: 'n-help', type: WIDGET_TYPES.note, namespace: NAMESPACE, data: {...note}},
  ],
  layout: [
    {i: 'heading', x: 0, y: 0, w: 36, h: 2},
    {i: 'm-revenue', x: 0, y: 2, w: 9, h: 6},
    {i: 'm-orders', x: 9, y: 2, w: 9, h: 6},
    {i: 'm-users', x: 18, y: 2, w: 9, h: 6},
    {i: 'm-errors', x: 27, y: 2, w: 9, h: 6},
    {i: 't-orders', x: 0, y: 8, w: 21, h: 14},
    {i: 'p-load', x: 21, y: 8, w: 15, h: 14},
    {i: 'n-help', x: 0, y: 22, w: 36, h: 5},
  ],
  aliases: {},
  connections: [],
};
