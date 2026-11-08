import type { ComponentType } from 'react';

import { ActivityFeed } from './Activity';
import { RevenueBarChart } from './BarChart';
import { kpis } from './data';
import { TrafficLineChart } from './LineChart';
import { ResourceMeters } from './Meters';
import { TrafficShareBar } from './ShareBar';
import { StatTile } from './StatTile';
import { TopPagesTable } from './TopPagesTable';
import type { Layout } from '../grid/layout';

export interface WidgetDef {
  id: string;
  title: string;
  description: string;
  /** Размер по умолчанию и ограничения — в ячейках сетки на 12 колонок. */
  w: number;
  h: number;
  minW: number;
  minH: number;
  maxH?: number;
  Component: ComponentType;
}

const tiles: WidgetDef[] = kpis.map((kpi) => ({
  id: `kpi-${kpi.id}`,
  title: kpi.label,
  description: 'Показатель со спарклайном',
  w: 3,
  h: 2,
  minW: 2,
  minH: 2,
  maxH: 3,
  Component: () => <StatTile kpi={kpi} />,
}));

export const WIDGETS: WidgetDef[] = [
  ...tiles,
  {
    id: 'traffic',
    title: 'Трафик за 30 дней',
    description: 'Линейный график, веб и мобильные',
    w: 8,
    h: 6,
    minW: 4,
    minH: 4,
    Component: TrafficLineChart,
  },
  {
    id: 'share',
    title: 'Источники трафика',
    description: 'Доли источников',
    w: 4,
    h: 2,
    minW: 3,
    minH: 2,
    maxH: 3,
    Component: TrafficShareBar,
  },
  {
    id: 'meters',
    title: 'Ресурсы кластера',
    description: 'CPU, память, диск, сеть',
    w: 4,
    h: 4,
    minW: 2,
    minH: 4,
    Component: ResourceMeters,
  },
  {
    id: 'revenue-channels',
    title: 'Выручка по каналам',
    description: 'Столбчатый график',
    w: 4,
    h: 5,
    minW: 3,
    minH: 4,
    Component: RevenueBarChart,
  },
  {
    id: 'top-pages',
    title: 'Популярные страницы',
    description: 'Таблица',
    w: 5,
    h: 5,
    minW: 4,
    minH: 3,
    Component: TopPagesTable,
  },
  {
    id: 'activity',
    title: 'События',
    description: 'Лента последних событий',
    w: 3,
    h: 5,
    minW: 2,
    minH: 3,
    Component: ActivityFeed,
  },
];

export const WIDGETS_BY_ID: Record<string, WidgetDef> = Object.fromEntries(WIDGETS.map((w) => [w.id, w]));

const sizeOf = (id: string) => {
  const d = WIDGETS_BY_ID[id];
  return { id, w: d.w, h: d.h, minW: d.minW, minH: d.minH, maxH: d.maxH };
};

/** Раскладка по умолчанию для 12 колонок. */
export const DEFAULT_LAYOUT: Layout = [
  { ...sizeOf('kpi-revenue'), x: 0, y: 0 },
  { ...sizeOf('kpi-users'), x: 3, y: 0 },
  { ...sizeOf('kpi-conversion'), x: 6, y: 0 },
  { ...sizeOf('kpi-errors'), x: 9, y: 0 },
  { ...sizeOf('traffic'), x: 0, y: 2 },
  { ...sizeOf('share'), x: 8, y: 2 },
  { ...sizeOf('meters'), x: 8, y: 4 },
  { ...sizeOf('revenue-channels'), x: 0, y: 8 },
  { ...sizeOf('top-pages'), x: 4, y: 8 },
  { ...sizeOf('activity'), x: 9, y: 8 },
];
