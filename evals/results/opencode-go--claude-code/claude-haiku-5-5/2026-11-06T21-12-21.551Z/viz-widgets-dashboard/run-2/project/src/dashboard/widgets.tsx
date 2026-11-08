import type { ReactNode } from 'react';
import { Label } from '@gravity-ui/uikit';
import type { LayoutItem, Rect } from './layout';
import { BarChart, DataTable, LineChart, SegmentedBar, Sparkline, fmt, type Column } from './charts';
import {
  avgCheckTrend,
  change,
  channelShares,
  conversionTrend,
  dayLabels,
  ordersTrend,
  recentOrders,
  revenueCurrent,
  revenuePrevious,
  revenueTrend,
  segmentShares,
  totalsCurrent,
  totalsPrevious,
  type OrderStatus,
} from './data';
import { viz } from './theme';

export interface WidgetDef {
  id: string;
  title: string;
  subtitle?: string;
  /** Smallest size the user can resize to, in grid units. */
  minW: number;
  minH: number;
  /** Position and size on first load. */
  layout: Rect;
  body: ReactNode;
  /** Table-view twin. Present on every chart; toggled from the widget header. */
  table?: ReactNode;
}

// ---------- stat tile ----------

function StatTile({ value, delta, trend }: { value: string; delta: number; trend: number[] }) {
  const up = delta >= 0;
  return (
    <div className="viz-stat">
      <div className="viz-stat__value">{value}</div>
      <div className="viz-stat__delta" style={{ color: up ? viz.success : viz.critical }}>
        {/* icon + text: the direction never relies on color alone */}
        <span aria-hidden="true">{up ? '▲' : '▼'}</span>{' '}
        {up ? '+' : '−'}
        {fmt.percent(Math.abs(delta))}
        <span className="viz-stat__vs"> к прошлым 30 дням</span>
      </div>
      <div className="viz-stat__trend">
        <Sparkline values={trend} />
      </div>
    </div>
  );
}

const summaryColumns: Column[] = [{ label: 'День' }, { label: 'Текущий', numeric: true }, { label: 'Прошлый', numeric: true }];

const revenueChart = (
  <LineChart
    labels={dayLabels}
    formatValue={fmt.rubCompact}
    series={[
      { name: 'Текущий период', color: viz.series[0], values: revenueCurrent },
      { name: 'Прошлый период', color: viz.series[1], values: revenuePrevious },
    ]}
  />
);

const revenueTable = (
  <DataTable
    caption="Выручка по дням, текущий и прошлый период"
    columns={summaryColumns}
    rows={dayLabels.map((d, i) => [d, fmt.rub(revenueCurrent[i]), fmt.rub(revenuePrevious[i])])}
  />
);

const channelData = channelShares.map((c) => ({ label: c.name, value: Math.round(totalsCurrent.revenue * c.share) }));

const channelsChart = <BarChart data={channelData} color={viz.series[0]} formatValue={fmt.rubCompact} />;
const channelsTable = (
  <DataTable
    caption="Выручка по каналам"
    columns={[{ label: 'Канал' }, { label: 'Выручка', numeric: true }]}
    rows={channelData.map((d) => [d.label, fmt.rub(d.value)])}
  />
);

const segmentParts = segmentShares.map((s, i) => ({
  name: s.name,
  value: Math.round(totalsCurrent.revenue * s.share),
  color: viz.series[i],
}));

const segmentChart = <SegmentedBar parts={segmentParts} formatValue={fmt.rubCompact} />;
const segmentTable = (
  <DataTable
    caption="Структура выручки по сегментам"
    columns={[{ label: 'Сегмент' }, { label: 'Выручка', numeric: true }, { label: 'Доля', numeric: true }]}
    rows={segmentParts.map((p) => [p.name, fmt.rub(p.value), fmt.percent(p.value / totalsCurrent.revenue)])}
  />
);

const STATUS: Record<OrderStatus, { text: string; theme: 'success' | 'info' | 'warning' | 'normal' }> = {
  delivered: { text: 'Доставлен', theme: 'success' },
  shipping: { text: 'В пути', theme: 'info' },
  paid: { text: 'Оплачен', theme: 'normal' },
  awaiting: { text: 'Ждёт оплаты', theme: 'warning' },
};

const ordersTable = (
  <DataTable
    caption="Последние заказы"
    columns={[{ label: '№' }, { label: 'Клиент' }, { label: 'Канал' }, { label: 'Сумма', numeric: true }, { label: 'Статус' }]}
    rows={recentOrders.map((o) => [
      String(o.id),
      o.client,
      o.channel,
      fmt.rub(o.amount),
      // status = text label + theme, so it reads without color
      <Label key="s" theme={STATUS[o.status].theme} size="s">
        {STATUS[o.status].text}
      </Label>,
    ])}
  />
);

const avgCheck = totalsCurrent.avgCheck;

export const WIDGETS: WidgetDef[] = [
  {
    id: 'revenue',
    title: 'Выручка',
    subtitle: 'за 30 дней',
    minW: 2,
    minH: 2,
    layout: { x: 0, y: 0, w: 3, h: 2 },
    body: (
      <StatTile
        value={fmt.rubCompact(totalsCurrent.revenue)}
        delta={change(totalsCurrent.revenue, totalsPrevious.revenue)}
        trend={revenueTrend}
      />
    ),
  },
  {
    id: 'orders',
    title: 'Заказы',
    subtitle: 'за 30 дней',
    minW: 2,
    minH: 2,
    layout: { x: 3, y: 0, w: 3, h: 2 },
    body: (
      <StatTile
        value={fmt.count(totalsCurrent.orders)}
        delta={change(totalsCurrent.orders, totalsPrevious.orders)}
        trend={ordersTrend}
      />
    ),
  },
  {
    id: 'avg-check',
    title: 'Средний чек',
    subtitle: 'за 30 дней',
    minW: 2,
    minH: 2,
    layout: { x: 6, y: 0, w: 3, h: 2 },
    body: (
      <StatTile
        value={fmt.rub(Math.round(avgCheck))}
        delta={change(avgCheck, totalsPrevious.avgCheck)}
        trend={avgCheckTrend}
      />
    ),
  },
  {
    id: 'conversion',
    title: 'Конверсия',
    subtitle: 'визит → заказ',
    minW: 2,
    minH: 2,
    layout: { x: 9, y: 0, w: 3, h: 2 },
    body: (
      <StatTile
        value={fmt.percent1(totalsCurrent.conversion)}
        delta={change(totalsCurrent.conversion, totalsPrevious.conversion)}
        trend={conversionTrend}
      />
    ),
  },
  {
    id: 'dynamics',
    title: 'Динамика выручки',
    subtitle: 'текущий и прошлый период, по дням',
    minW: 4,
    minH: 3,
    layout: { x: 0, y: 2, w: 8, h: 4 },
    body: revenueChart,
    table: revenueTable,
  },
  {
    id: 'structure',
    title: 'Структура выручки',
    subtitle: 'по сегментам',
    minW: 3,
    minH: 2,
    layout: { x: 8, y: 2, w: 4, h: 4 },
    body: segmentChart,
    table: segmentTable,
  },
  {
    id: 'channels',
    title: 'Каналы',
    subtitle: 'выручка по каналам привлечения',
    minW: 3,
    minH: 3,
    layout: { x: 0, y: 6, w: 6, h: 5 },
    body: channelsChart,
    table: channelsTable,
  },
  {
    id: 'orders-table',
    title: 'Последние заказы',
    minW: 4,
    minH: 3,
    layout: { x: 6, y: 6, w: 6, h: 5 },
    body: ordersTable,
  },
];

/** Layout for first load and for "reset". Items are settled before use. */
export const DEFAULT_LAYOUT: LayoutItem[] = WIDGETS.map((w) => ({ id: w.id, ...w.layout }));
