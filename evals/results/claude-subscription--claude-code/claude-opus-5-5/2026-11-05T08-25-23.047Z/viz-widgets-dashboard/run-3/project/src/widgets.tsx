import React from 'react';
import { Label } from '@gravity-ui/uikit';

import type { LayoutItem } from './grid/layout';
import { type DashboardData, RANGES } from './data';
import { fmt } from './format';
import { BarList } from './charts/BarList';
import { DataTable, type TableView } from './charts/DataTable';
import { LineChart } from './charts/LineChart';
import { Meter } from './charts/Meter';
import { SegmentedBar } from './charts/SegmentedBar';
import { StatTile } from './charts/StatTile';

export interface WidgetDef {
  id: string;
  title: string;
  /** Default placement and size limits, in grid cells (12 columns). */
  layout: Omit<LayoutItem, 'i'>;
  render: (data: DashboardData) => React.ReactNode;
  /** Charts expose the same numbers as a table (toggle in the widget header). */
  table?: (data: DashboardData) => TableView;
}

const SERIES = Array.from({ length: 5 }, (_, i) => `var(--series-${i + 1})`);
/** Label ink inside a categorical fill: white, near-black on the light yellow slot. */
const SERIES_INK = ['#fff', '#fff', '#fff', '#0b0b0b', '#fff'];

const comparison = (d: DashboardData) => RANGES.find((r) => r.value === d.range)!.previous;

function kpiWidget(
  id: string,
  title: string,
  x: number,
  key: keyof DashboardData['kpi'],
  format: (n: number) => string,
): WidgetDef {
  return {
    id,
    title,
    layout: { x, y: 0, w: 3, h: 3, minW: 2, minH: 2, maxH: 4 },
    render: (d) => (
      <StatTile
        {...d.kpi[key]}
        format={format}
        comparison={comparison(d)}
        trendLabel={`${title}: динамика за период, ${d.kpi[key].trend.length} отрезков`}
      />
    ),
  };
}

const ORDER_STATUS = {
  delivered: { text: 'Доставлен', theme: 'success' },
  shipping: { text: 'В пути', theme: 'info' },
  processing: { text: 'Собирается', theme: 'warning' },
  cancelled: { text: 'Отменён', theme: 'danger' },
} as const;

export const WIDGETS: WidgetDef[] = [
  kpiWidget('revenue', 'Выручка', 0, 'revenue', fmt.rub),
  kpiWidget('orders', 'Заказы', 3, 'orders', fmt.compact),
  kpiWidget('conversion', 'Конверсия', 6, 'conversion', fmt.pct),
  kpiWidget('avg-check', 'Средний чек', 9, 'avgCheck', fmt.rub),
  {
    id: 'traffic',
    title: 'Посещаемость',
    layout: { x: 0, y: 3, w: 8, h: 5, minW: 4, minH: 3 },
    render: (d) => (
      <LineChart
        label="Посещаемость по дням: сессии и пользователи"
        dates={d.dates}
        series={[
          { id: 'sessions', name: 'Сессии', color: SERIES[0], values: d.sessions },
          { id: 'users', name: 'Пользователи', color: SERIES[1], values: d.users },
        ]}
      />
    ),
    table: (d) => ({
      columns: [
        { id: 'date', name: 'Дата' },
        { id: 'sessions', name: 'Сессии', align: 'end' },
        { id: 'users', name: 'Пользователи', align: 'end' },
      ],
      rows: d.dates
        .map((date, i) => ({ date: fmt.day(date), sessions: fmt.int(d.sessions[i]), users: fmt.int(d.users[i]) }))
        .reverse(),
    }),
  },
  {
    id: 'categories',
    title: 'Выручка по категориям',
    layout: { x: 8, y: 3, w: 4, h: 5, minW: 3, minH: 3 },
    render: (d) => (
      <BarList
        label="Выручка по категориям"
        items={d.categories}
        color={SERIES[0]}
        formatValue={fmt.rub}
        formatExact={fmt.rubFull}
      />
    ),
    table: (d) => ({
      columns: [
        { id: 'name', name: 'Категория' },
        { id: 'value', name: 'Выручка', align: 'end' },
      ],
      rows: d.categories.map((c) => ({ name: c.name, value: fmt.rubFull(c.value) })),
    }),
  },
  {
    id: 'orders-table',
    title: 'Последние заказы',
    layout: { x: 0, y: 8, w: 8, h: 6, minW: 4, minH: 3 },
    render: (d) => (
      <DataTable
        view={{
          columns: [
            { id: 'id', name: 'Заказ' },
            { id: 'time', name: 'Время' },
            { id: 'customer', name: 'Покупатель' },
            { id: 'amount', name: 'Сумма', align: 'end' },
            { id: 'status', name: 'Статус' },
          ],
          rows: d.orders.map((o) => ({
            id: o.id,
            time: fmt.time(o.date),
            customer: o.customer,
            amount: fmt.rubFull(o.amount),
            status: o.status,
          })),
        }}
        renderCell={{
          status: (v) => {
            const s = ORDER_STATUS[v as keyof typeof ORDER_STATUS];
            return (
              <Label theme={s.theme} size="xs">
                {s.text}
              </Label>
            );
          },
        }}
      />
    ),
  },
  {
    id: 'sources',
    title: 'Источники трафика',
    layout: { x: 8, y: 8, w: 4, h: 3, minW: 3, minH: 3, maxH: 5 },
    render: (d) => (
      <SegmentedBar
        label="Доля сессий по источникам трафика"
        formatValue={(n) => `${fmt.compact(n)} сессий`}
        parts={d.sources.map((s, i) => ({ ...s, color: SERIES[i], ink: SERIES_INK[i] }))}
      />
    ),
    table: (d) => {
      const total = d.sources.reduce((a, b) => a + b.value, 0);
      return {
        columns: [
          { id: 'name', name: 'Источник' },
          { id: 'value', name: 'Сессии', align: 'end' },
          { id: 'share', name: 'Доля', align: 'end' },
        ],
        rows: d.sources.map((s) => ({ name: s.name, value: fmt.int(s.value), share: fmt.pct((s.value / total) * 100) })),
      };
    },
  },
  {
    id: 'plan',
    title: 'Выполнение плана',
    layout: { x: 8, y: 11, w: 4, h: 3, minW: 3, minH: 2, maxH: 4 },
    render: (d) => <Meter {...d.plan} caption="от плана по выручке за период" />,
  },
];

export const WIDGETS_BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));

export const DEFAULT_LAYOUT: LayoutItem[] = WIDGETS.map((w) => ({ i: w.id, ...w.layout }));
