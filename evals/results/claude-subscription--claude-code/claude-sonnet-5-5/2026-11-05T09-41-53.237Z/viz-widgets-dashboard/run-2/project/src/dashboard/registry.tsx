import type { ReactNode } from 'react';
import { avg, sum, type Dataset } from './data';
import { fmtInt, fmtMs, fmtPct, fmtRub } from './format';
import type { Item, Layout } from './layout';
import { ChannelsChart } from './widgets/ChannelsChart';
import { PagesTable } from './widgets/PagesTable';
import { PlanMeter } from './widgets/PlanMeter';
import { StatTile } from './widgets/StatTile';
import { TrafficBar } from './widgets/TrafficBar';
import { TrendChart } from './widgets/TrendChart';

export interface WidgetDef {
  id: string;
  title: string;
  /** Default and minimum size in grid cells. */
  w: number;
  h: number;
  minW: number;
  minH: number;
  render: (data: Dataset) => ReactNode;
}

const kpi = (id: string, title: string, render: WidgetDef['render']): WidgetDef => ({ id, title, w: 3, h: 2, minW: 2, minH: 2, render });

export const WIDGETS: WidgetDef[] = [
  kpi('revenue', 'Выручка', (d) => <StatTile label="Выручка" series={d.revenue} value={sum} format={fmtRub} />),
  kpi('users', 'Активные пользователи', (d) => <StatTile label="Активные пользователи" series={d.users} value={avg} format={fmtInt} />),
  kpi('conversion', 'Конверсия', (d) => <StatTile label="Конверсия" series={d.conversion} value={avg} format={(n) => fmtPct(n, 2)} />),
  kpi('latency', 'Время ответа (p95)', (d) => <StatTile label="Время ответа (p95)" series={d.latency} value={avg} format={fmtMs} upIsGood={false} />),
  { id: 'trend', title: 'Выручка по дням', w: 8, h: 5, minW: 4, minH: 3, render: (d) => <TrendChart data={d} /> },
  { id: 'plan', title: 'План по выручке', w: 4, h: 2, minW: 2, minH: 2, render: (d) => <PlanMeter data={d} /> },
  { id: 'traffic', title: 'Источники трафика', w: 4, h: 3, minW: 3, minH: 2, render: (d) => <TrafficBar data={d} /> },
  { id: 'channels', title: 'Заказы по каналам', w: 5, h: 5, minW: 3, minH: 3, render: (d) => <ChannelsChart data={d} /> },
  { id: 'pages', title: 'Популярные страницы', w: 7, h: 5, minW: 4, minH: 3, render: (d) => <PagesTable data={d} /> },
];

export const widgetById = (id: string) => WIDGETS.find((w) => w.id === id);

/** Default positions on the 12-column grid. */
const DEFAULT_POS: Record<string, [number, number]> = {
  revenue: [0, 0],
  users: [3, 0],
  conversion: [6, 0],
  latency: [9, 0],
  trend: [0, 2],
  plan: [8, 2],
  traffic: [8, 4],
  channels: [0, 7],
  pages: [5, 7],
};

export const toItem = (def: WidgetDef, x = 0, y = 0): Item => ({ id: def.id, x, y, w: def.w, h: def.h, minW: def.minW, minH: def.minH });

export const DEFAULT_LAYOUT: Layout = WIDGETS.map((def) => toItem(def, ...(DEFAULT_POS[def.id] ?? [0, 0])));
