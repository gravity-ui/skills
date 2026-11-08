import React from 'react';
import { Label, Table, type TableColumnConfig } from '@gravity-ui/uikit';

import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { SegmentedBar } from './charts/SegmentedBar';
import { Sparkline } from './charts/Sparkline';
import { SERIES } from './charts/common';
import type { DashboardData, OrderRow, RangeKey, Stat } from './data';
import {
  formatCompact,
  formatDay,
  formatInt,
  formatMoney,
  formatMoneyFull,
  formatPercent,
  formatTime,
} from './format';

type Row = Record<string, React.ReactNode>;

export interface WidgetTable {
  columns: TableColumnConfig<Row>[];
  rows: Row[];
}

export interface WidgetDef {
  id: string;
  title: string;
  layout: { x: number; y: number; w: number; h: number; minW: number; minH: number };
  render: (data: DashboardData, range: RangeKey) => React.ReactNode;
  /** Табличное представление тех же данных — доступно для каждого графика. */
  table?: (data: DashboardData) => WidgetTable;
  /** Содержимое само прокручивается (таблицы). */
  scrollable?: boolean;
}

const share = (v: number, total: number) => formatPercent((v / total) * 100);
const sumOf = (xs: { value: number }[]) => xs.reduce((s, x) => s + x.value, 0);

function StatTile({ stat, format, range }: { stat: Stat; format: (v: number) => string; range: RangeKey }) {
  const change = stat.previous ? ((stat.value - stat.previous) / stat.previous) * 100 : 0;
  const up = change >= 0;
  return (
    <div className="stat">
      <div className="stat__value">{format(stat.value)}</div>
      <div className={`stat__delta ${up ? 'stat__delta_good' : 'stat__delta_bad'}`}>
        <span aria-hidden>{up ? '▲' : '▼'}</span>
        <span>
          {up ? '+' : '−'}
          {formatPercent(Math.abs(change))}
        </span>
        <span className="stat__period">к предыдущим {range} дням</span>
      </div>
      <div className="stat__spark">
        <Sparkline values={stat.trend} />
      </div>
    </div>
  );
}

function PlanMeter({ current, target }: { current: number; target: number }) {
  const ratio = current / target;
  return (
    <div className="meter">
      <div className="meter__head">
        <span className="meter__value">{formatPercent(ratio * 100)}</span>
        <span className="meter__caption">
          {formatMoney(current)} из {formatMoney(target)}
          {ratio >= 1 ? ' · план выполнен' : ''}
        </span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-label="Выполнение плана выручки"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
      >
        <div className="meter__fill" style={{ width: `${Math.min(1, ratio) * 100}%` }} />
      </div>
    </div>
  );
}

const STATUS: Record<OrderRow['status'], { text: string; theme: 'success' | 'info' | 'danger' }> = {
  paid: { text: 'Оплачен', theme: 'success' },
  shipping: { text: 'В доставке', theme: 'info' },
  cancelled: { text: 'Отменён', theme: 'danger' },
};

function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <Table<Row>
      className="widget-table"
      columns={[
        { id: 'id', name: 'Заказ' },
        { id: 'customer', name: 'Клиент', primary: true },
        { id: 'amount', name: 'Сумма', align: 'end' },
        { id: 'status', name: 'Статус' },
        { id: 'time', name: 'Время', align: 'end' },
      ]}
      data={orders.map((o) => ({
        id: o.id,
        customer: o.customer,
        amount: formatMoneyFull(o.amount),
        status: (
          <Label theme={STATUS[o.status].theme} size="xs">
            {STATUS[o.status].text}
          </Label>
        ),
        time: formatTime(o.time),
      }))}
    />
  );
}

export const WIDGETS: WidgetDef[] = [
  {
    id: 'revenue',
    title: 'Выручка',
    layout: { x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    render: (d, r) => <StatTile stat={d.revenue} format={formatMoney} range={r} />,
  },
  {
    id: 'orders',
    title: 'Заказы',
    layout: { x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    render: (d, r) => <StatTile stat={d.orders} format={formatCompact} range={r} />,
  },
  {
    id: 'conversion',
    title: 'Конверсия',
    layout: { x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    render: (d, r) => <StatTile stat={d.conversion} format={(v) => formatPercent(v)} range={r} />,
  },
  {
    id: 'avg-check',
    title: 'Средний чек',
    layout: { x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    render: (d, r) => <StatTile stat={d.avgCheck} format={formatMoneyFull} range={r} />,
  },
  {
    id: 'traffic',
    title: 'Посещаемость по дням',
    layout: { x: 0, y: 2, w: 8, h: 5, minW: 4, minH: 3 },
    render: (d) => (
      <LineChart
        ariaLabel="Посещаемость по дням: новые и вернувшиеся посетители"
        labels={d.days}
        formatX={formatDay}
        formatY={formatCompact}
        formatValue={formatInt}
        series={[
          { id: 'new', name: 'Новые', color: SERIES[0], values: d.visitsNew },
          { id: 'ret', name: 'Вернувшиеся', color: SERIES[1], values: d.visitsReturning },
        ]}
      />
    ),
    table: (d) => ({
      columns: [
        { id: 'day', name: 'Дата' },
        { id: 'new', name: 'Новые', align: 'end' },
        { id: 'ret', name: 'Вернувшиеся', align: 'end' },
      ],
      rows: d.days.map((day, i) => ({
        day: formatDay(day),
        new: formatInt(d.visitsNew[i]),
        ret: formatInt(d.visitsReturning[i]),
      })),
    }),
  },
  {
    id: 'categories',
    title: 'Выручка по категориям',
    layout: { x: 8, y: 2, w: 4, h: 5, minW: 3, minH: 3 },
    render: (d) => (
      <BarChart
        ariaLabel="Выручка по категориям"
        items={d.categories}
        color={SERIES[0]}
        formatValue={formatMoney}
        formatTooltip={(v, s) => `${formatMoneyFull(v)} · ${formatPercent(s * 100)}`}
      />
    ),
    table: (d) => ({
      columns: [
        { id: 'name', name: 'Категория' },
        { id: 'value', name: 'Выручка', align: 'end' },
        { id: 'share', name: 'Доля', align: 'end' },
      ],
      rows: d.categories.map((c) => ({
        name: c.name,
        value: formatMoneyFull(c.value),
        share: share(c.value, sumOf(d.categories)),
      })),
    }),
  },
  {
    id: 'sources',
    title: 'Источники трафика',
    layout: { x: 0, y: 7, w: 6, h: 3, minW: 3, minH: 2 },
    render: (d) => (
      <SegmentedBar ariaLabel="Источники трафика, доли визитов" parts={d.sources} formatValue={(v) => `${formatInt(v)} визитов`} />
    ),
    table: (d) => ({
      columns: [
        { id: 'name', name: 'Источник' },
        { id: 'value', name: 'Визиты', align: 'end' },
        { id: 'share', name: 'Доля', align: 'end' },
      ],
      rows: d.sources.map((s) => ({
        name: s.name,
        value: formatInt(s.value),
        share: share(s.value, sumOf(d.sources)),
      })),
    }),
  },
  {
    id: 'recent-orders',
    title: 'Последние заказы',
    layout: { x: 6, y: 7, w: 6, h: 5, minW: 4, minH: 3 },
    render: (d) => <OrdersTable orders={d.recentOrders} />,
    scrollable: true,
  },
  {
    id: 'plan',
    title: 'План выручки на период',
    layout: { x: 0, y: 10, w: 6, h: 2, minW: 3, minH: 2 },
    render: (d) => <PlanMeter {...d.plan} />,
  },
];

export const WIDGET_BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));

export function WidgetDataTable({ table }: { table: WidgetTable }) {
  return <Table<Row> className="widget-table" columns={table.columns} data={table.rows} />;
}
