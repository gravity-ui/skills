import type { ReactNode } from 'react';
import type { MetricKey, PeriodData } from './data';
import { fmt } from './format';
import { StatTile } from './charts/StatTile';
import { ChannelTrend } from './charts/ChannelTrend';
import { RegionBars } from './charts/RegionBars';

export interface WidgetDef {
  id: string;
  title: string;
  /** Smallest size the user can resize to, in cells. */
  minW: number;
  minH: number;
  /** Where the widget starts, in cells. */
  initial: { x: number; y: number; w: number; h: number };
  render: (data: PeriodData) => ReactNode;
}

const ratio = (cur: number, prev: number) => (prev ? cur / prev - 1 : 0);

function statWidget(
  id: string,
  title: string,
  key: MetricKey,
  format: (v: number) => string,
  upIsGood: boolean,
  initial: WidgetDef['initial'],
): WidgetDef {
  return {
    id,
    title,
    minW: 3,
    minH: 3,
    initial,
    render: (d) => (
      <StatTile
        value={format(d.totals[key])}
        delta={ratio(d.totals[key], d.previous[key])}
        upIsGood={upIsGood}
        spark={d.spark[key]}
      />
    ),
  };
}

export const WIDGETS: WidgetDef[] = [
  statWidget('revenue', 'Выручка', 'revenue', fmt.moneyCompact, true, { x: 0, y: 0, w: 4, h: 3 }),
  statWidget('orders', 'Заказы', 'orders', fmt.countCompact, true, { x: 4, y: 0, w: 4, h: 3 }),
  statWidget('avgCheck', 'Средний чек', 'avgCheck', fmt.moneyFull, true, { x: 8, y: 0, w: 4, h: 3 }),
  {
    id: 'channels',
    title: 'Выручка по каналам',
    minW: 4,
    minH: 5,
    initial: { x: 0, y: 3, w: 8, h: 8 },
    render: (d) => <ChannelTrend days={d.days} />,
  },
  {
    id: 'regions',
    title: 'Выручка по регионам',
    minW: 3,
    minH: 4,
    initial: { x: 8, y: 3, w: 4, h: 8 },
    render: (d) => <RegionBars regions={d.regions} total={d.totals.revenue} />,
  },
];
