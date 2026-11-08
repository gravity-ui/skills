import React from 'react';
import type { DashboardData } from './data';
import type { Item, Limits } from './layout';
import { Channels } from './widgets/Channels';
import { Goal } from './widgets/Goal';
import { Heatmap } from './widgets/Heatmap';
import { Kpi } from './widgets/Kpi';
import { Orders } from './widgets/Orders';
import { RevenueChart } from './widgets/RevenueChart';

export interface WidgetDef {
  id: string;
  title: string;
  limits: Limits;
  render: (data: DashboardData) => React.ReactNode;
}

export const WIDGETS: WidgetDef[] = [
  { id: 'kpi-revenue', title: 'Выручка', limits: { minW: 2, minH: 2, maxH: 4 }, render: (d) => <Kpi data={d} metric="revenue" /> },
  { id: 'kpi-orders', title: 'Заказы', limits: { minW: 2, minH: 2, maxH: 4 }, render: (d) => <Kpi data={d} metric="orders" /> },
  { id: 'kpi-conversion', title: 'Конверсия', limits: { minW: 2, minH: 2, maxH: 4 }, render: (d) => <Kpi data={d} metric="conversion" /> },
  { id: 'kpi-aov', title: 'Средний чек', limits: { minW: 2, minH: 2, maxH: 4 }, render: (d) => <Kpi data={d} metric="aov" /> },
  { id: 'revenue-chart', title: 'Выручка по дням', limits: { minW: 4, minH: 3 }, render: (d) => <RevenueChart data={d} /> },
  { id: 'goal', title: 'Выполнение плана', limits: { minW: 3, minH: 2, maxH: 4 }, render: (d) => <Goal data={d} /> },
  { id: 'channels', title: 'Выручка по каналам', limits: { minW: 3, minH: 3 }, render: (d) => <Channels data={d} /> },
  { id: 'heatmap', title: 'Когда покупают', limits: { minW: 4, minH: 3 }, render: (d) => <Heatmap data={d} /> },
  { id: 'orders', title: 'Последние заказы', limits: { minW: 4, minH: 3 }, render: () => <Orders /> },
];

export const WIDGET_BY_ID = Object.fromEntries(WIDGETS.map((w) => [w.id, w]));
export const LIMITS = Object.fromEntries(WIDGETS.map((w) => [w.id, w.limits])) as Record<string, Limits>;

export const DEFAULT_LAYOUT: Item[] = [
  { id: 'kpi-revenue', x: 0, y: 0, w: 3, h: 2 },
  { id: 'kpi-orders', x: 3, y: 0, w: 3, h: 2 },
  { id: 'kpi-conversion', x: 6, y: 0, w: 3, h: 2 },
  { id: 'kpi-aov', x: 9, y: 0, w: 3, h: 2 },
  { id: 'revenue-chart', x: 0, y: 2, w: 8, h: 5 },
  { id: 'goal', x: 8, y: 2, w: 4, h: 2 },
  { id: 'channels', x: 8, y: 4, w: 4, h: 3 },
  { id: 'heatmap', x: 0, y: 7, w: 5, h: 4 },
  { id: 'orders', x: 5, y: 7, w: 7, h: 4 },
];

/** Размер по умолчанию для виджета, добавляемого заново. */
export const defaultSize = (id: string) => {
  const d = DEFAULT_LAYOUT.find((i) => i.id === id)!;
  return { id, w: d.w, h: d.h };
};
