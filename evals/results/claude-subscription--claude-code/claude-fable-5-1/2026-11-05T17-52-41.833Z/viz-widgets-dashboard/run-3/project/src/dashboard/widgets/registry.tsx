import type * as React from 'react';

import type {DashboardData} from '../data';
import {formatCompact, formatMoney, formatPercent} from '../format';
import type {GridSize} from '../types';
import {BarChart} from './BarChart';
import {Heatmap} from './Heatmap';
import {LineChart} from './LineChart';
import {OrdersTable} from './OrdersTable';
import {SegmentedBar} from './SegmentedBar';
import {StatTile} from './StatTile';
import type {WidgetView} from './WidgetFrame';

export type WidgetKind =
  | 'stat-users'
  | 'stat-revenue'
  | 'stat-conversion'
  | 'stat-errors'
  | 'sessions'
  | 'sources'
  | 'pages'
  | 'activity'
  | 'orders';

export interface WidgetDefinition {
  title: string;
  description: string;
  size: GridSize;
  minSize: GridSize;
  supportsTable: boolean;
  render: (ctx: {data: DashboardData; view: WidgetView}) => React.ReactNode;
}

const STAT: Pick<WidgetDefinition, 'size' | 'minSize' | 'supportsTable'> = {
  size: {w: 3, h: 3},
  minSize: {w: 2, h: 2},
  supportsTable: false,
};

export const WIDGETS: Record<WidgetKind, WidgetDefinition> = {
  'stat-users': {
    ...STAT,
    title: 'Сессии',
    description: 'Число сессий за период',
    render: ({data}) => <StatTile label="Всего сессий" stat={data.stats.users} format={formatCompact} />,
  },
  'stat-revenue': {
    ...STAT,
    title: 'Выручка',
    description: 'Выручка за период',
    render: ({data}) => <StatTile label="Выручка за период" stat={data.stats.revenue} format={formatMoney} />,
  },
  'stat-conversion': {
    ...STAT,
    title: 'Конверсия',
    description: 'Средняя конверсия в заказ',
    render: ({data}) => <StatTile label="Средняя конверсия" stat={data.stats.conversion} format={formatPercent} />,
  },
  'stat-errors': {
    ...STAT,
    title: 'Ошибки',
    description: 'Ошибки сервера за период',
    render: ({data}) => <StatTile label="Ошибок сервера" stat={data.stats.errors} format={formatCompact} upIsGood={false} />,
  },
  sessions: {
    title: 'Сессии по платформам',
    description: 'Линейный график по дням',
    size: {w: 8, h: 6},
    minSize: {w: 4, h: 4},
    supportsTable: true,
    render: ({data, view}) => <LineChart title="Сессии по платформам" dates={data.dates} series={data.sessions} view={view} />,
  },
  sources: {
    title: 'Источники трафика',
    description: 'Доли каналов привлечения',
    size: {w: 4, h: 3},
    minSize: {w: 3, h: 3},
    supportsTable: true,
    render: ({data, view}) => <SegmentedBar title="Источники трафика" parts={data.sources} view={view} />,
  },
  pages: {
    title: 'Популярные страницы',
    description: 'Топ страниц по просмотрам',
    size: {w: 4, h: 6},
    minSize: {w: 3, h: 4},
    supportsTable: true,
    render: ({data, view}) => <BarChart title="Популярные страницы" items={data.pages} unit="Просмотры" view={view} />,
  },
  activity: {
    title: 'Активность по часам',
    description: 'Тепловая карта: день недели × час',
    size: {w: 8, h: 6},
    minSize: {w: 5, h: 4},
    supportsTable: true,
    render: ({data, view}) => <Heatmap title="Активность по часам" activity={data.activity} view={view} />,
  },
  orders: {
    title: 'Последние заказы',
    description: 'Таблица последних заказов',
    size: {w: 4, h: 6},
    minSize: {w: 3, h: 3},
    supportsTable: false,
    render: ({data}) => <OrdersTable orders={data.orders} />,
  },
};

export const WIDGET_KINDS = Object.keys(WIDGETS) as WidgetKind[];

export function isWidgetKind(value: unknown): value is WidgetKind {
  return typeof value === 'string' && value in WIDGETS;
}
