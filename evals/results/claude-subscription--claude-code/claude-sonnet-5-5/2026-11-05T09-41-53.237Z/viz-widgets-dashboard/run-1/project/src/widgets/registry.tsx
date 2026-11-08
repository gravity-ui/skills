import type { ReactNode } from 'react';
import type { GridItem } from '../grid/layout';
import { ChannelsWidget, OrdersTableWidget } from './ListWidgets';
import { ConversionWidget, GoalWidget, OrdersCountWidget, RevenueWidget } from './StatWidgets';
import { TrafficWidget } from './TrafficWidget';

export interface WidgetDef {
  id: string;
  title: string;
  /** Default placement on the 12-column grid. */
  grid: Pick<GridItem, 'x' | 'y' | 'w' | 'h' | 'minW' | 'minH'>;
  render: () => ReactNode;
}

// Order here is the order in the "Add widget" menu.
export const WIDGETS: WidgetDef[] = [
  { id: 'revenue', title: 'Выручка', grid: { x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 }, render: () => <RevenueWidget /> },
  { id: 'orders', title: 'Заказы', grid: { x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 }, render: () => <OrdersCountWidget /> },
  { id: 'conversion', title: 'Конверсия', grid: { x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 }, render: () => <ConversionWidget /> },
  { id: 'goal', title: 'План квартала', grid: { x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 }, render: () => <GoalWidget /> },
  { id: 'traffic', title: 'Посетители', grid: { x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 }, render: () => <TrafficWidget /> },
  { id: 'channels', title: 'Выручка по каналам', grid: { x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 }, render: () => <ChannelsWidget /> },
  { id: 'orders-table', title: 'Последние заказы', grid: { x: 0, y: 6, w: 12, h: 4, minW: 4, minH: 3 }, render: () => <OrdersTableWidget /> },
];

export const WIDGET_BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));

export const DEFAULT_LAYOUT: GridItem[] = WIDGETS.map((w) => ({ id: w.id, ...w.grid }));
export const COLS = 12;
