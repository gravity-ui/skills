import React from 'react';
import { Icon, Table, type TableColumnConfig } from '@gravity-ui/uikit';
import { ArrowDown, ArrowUp, CircleCheckFill } from '@gravity-ui/icons';

import { BarList, LineChart, Meter, SegmentedBar, Sparkline, useSeriesColors } from './charts';
import { type DashboardData, type Kpi, fmt } from './data';

export type WidgetView = 'chart' | 'table';

export interface WidgetDef {
  id: string;
  title: string;
  /** Default placement on the 12-column grid. */
  layout: { x: number; y: number; w: number; h: number; minW: number; minH: number };
  /** Chart widgets can be flipped to a table view (the accessible fallback). */
  hasTableView?: boolean;
  Component: React.ComponentType<{ data: DashboardData; view: WidgetView }>;
}

// ---------- stat tiles ----------

function StatTile({ kpi, data, format, trendFormat }: {
  kpi: Kpi;
  data: DashboardData;
  format: (n: number) => string;
  trendFormat: (n: number) => string;
}) {
  const { colors } = useSeriesColors();
  const change = kpi.previous ? (kpi.value - kpi.previous) / kpi.previous : 0;
  const up = change >= 0;
  const changeText = `${up ? '+' : '−'}${fmt.pct(Math.abs(change))}`;
  return (
    <div className="stat">
      <div className="stat__value">{format(kpi.value)}</div>
      <div className={`stat__delta ${up ? 'stat__delta_good' : 'stat__delta_bad'}`}>
        <Icon data={up ? ArrowUp : ArrowDown} size={14} />
        <span className="stat__delta-value">{changeText}</span>
        <span className="stat__delta-period">к прошлым {data.period} дн.</span>
      </div>
      <Sparkline values={kpi.trend} dates={data.dates} accent={colors[0]} format={trendFormat} />
    </div>
  );
}

// ---------- tables ----------

function DataTable<T extends object>({ data, columns }: { data: T[]; columns: TableColumnConfig<T>[] }) {
  return (
    <div className="widget-table">
      <Table data={data} columns={columns} width="max" />
    </div>
  );
}

// ---------- widgets ----------

function VisitsWidget({ data, view }: { data: DashboardData; view: WidgetView }) {
  const { colors } = useSeriesColors();
  if (view === 'table') {
    const rows = data.dates
      .map((date, i) => ({ date, desktop: data.desktop[i], mobile: data.mobile[i] }))
      .reverse();
    return (
      <DataTable
        data={rows}
        columns={[
          { id: 'date', name: 'Дата', template: (r) => fmt.longDay(r.date) },
          { id: 'desktop', name: 'Компьютеры', align: 'end', template: (r) => fmt.int(r.desktop) },
          { id: 'mobile', name: 'Смартфоны', align: 'end', template: (r) => fmt.int(r.mobile) },
          { id: 'total', name: 'Всего', align: 'end', template: (r) => fmt.int(r.desktop + r.mobile) },
        ]}
      />
    );
  }
  return (
    <LineChart
      label="Визиты по дням: компьютеры и смартфоны"
      dates={data.dates}
      series={[
        { id: 'mobile', name: 'Смартфоны', color: colors[0], values: data.mobile },
        { id: 'desktop', name: 'Компьютеры', color: colors[1], values: data.desktop },
      ]}
      format={{ value: fmt.int, axis: fmt.smart, date: fmt.day, longDate: fmt.longDay }}
    />
  );
}

function ChannelsWidget({ data, view }: { data: DashboardData; view: WidgetView }) {
  const { colors } = useSeriesColors();
  const total = data.channels.reduce((a, b) => a + b.value, 0);
  if (view === 'table') {
    return (
      <DataTable
        data={data.channels}
        columns={[
          { id: 'name', name: 'Канал' },
          { id: 'value', name: 'Выручка', align: 'end', template: (r) => fmt.rub(r.value) },
          { id: 'share', name: 'Доля', align: 'end', template: (r) => fmt.pct(r.value / total) },
        ]}
      />
    );
  }
  return <BarList items={data.channels} color={colors[0]} format={fmt.rubCompact} />;
}

function SourcesWidget({ data, view }: { data: DashboardData; view: WidgetView }) {
  const total = data.sources.reduce((a, b) => a + b.value, 0);
  if (view === 'table') {
    return (
      <DataTable
        data={data.sources}
        columns={[
          { id: 'name', name: 'Источник' },
          { id: 'value', name: 'Визиты', align: 'end', template: (r) => fmt.int(r.value) },
          { id: 'share', name: 'Доля', align: 'end', template: (r) => fmt.pct(r.value / total) },
        ]}
      />
    );
  }
  return (
    <div className="sources">
      <div className="sources__total">
        <span className="sources__total-value">{fmt.int(total)}</span> визитов за {data.period} дн.
      </div>
      <SegmentedBar items={data.sources} format={fmt.int} />
    </div>
  );
}

function PlanWidget({ data }: { data: DashboardData }) {
  // Plan: +12% to the previous period, rounded to 100k ₽.
  const plan = Math.round((data.revenue.previous * 1.12) / 100_000) * 100_000;
  const done = data.revenue.value >= plan;
  const ratio = data.revenue.value / plan;
  return (
    <div className="plan">
      <div className="plan__head">
        <span className="plan__value">{fmt.pct(ratio)}</span>
        <span className="plan__of">
          {fmt.rubCompact(data.revenue.value)} из {fmt.rubCompact(plan)}
        </span>
      </div>
      <Meter value={data.revenue.value} max={plan} label={`Выполнение плана по выручке: ${fmt.pct(ratio)}`} />
      <div className="plan__note">
        {done ? (
          <>
            <Icon data={CircleCheckFill} size={14} className="plan__ok" /> План выполнен
          </>
        ) : (
          <>Осталось {fmt.rubCompact(plan - data.revenue.value)} · план: +12% к прошлому периоду</>
        )}
      </div>
    </div>
  );
}

function PagesWidget({ data }: { data: DashboardData }) {
  return (
    <DataTable
      data={data.pages}
      columns={[
        {
          id: 'page',
          name: 'Страница',
          template: (r) => (
            <div className="page-cell">
              <div>{r.title}</div>
              <div className="page-cell__path">{r.path}</div>
            </div>
          ),
        },
        { id: 'views', name: 'Просмотры', align: 'end', template: (r) => fmt.int(r.views) },
        { id: 'time', name: 'Время', align: 'end', template: (r) => fmt.duration(r.time) },
        { id: 'bounce', name: 'Отказы', align: 'end', template: (r) => fmt.pct(r.bounce) },
      ]}
    />
  );
}

export const WIDGETS: WidgetDef[] = [
  {
    id: 'revenue',
    title: 'Выручка',
    layout: { x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    Component: ({ data }) => (
      <StatTile kpi={data.revenue} data={data} format={fmt.rubCompact} trendFormat={fmt.rub} />
    ),
  },
  {
    id: 'orders',
    title: 'Заказы',
    layout: { x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    Component: ({ data }) => <StatTile kpi={data.orders} data={data} format={fmt.int} trendFormat={fmt.int} />,
  },
  {
    id: 'conversion',
    title: 'Конверсия в заказ',
    layout: { x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    Component: ({ data }) => (
      <StatTile kpi={data.conversion} data={data} format={fmt.pct2} trendFormat={fmt.pct2} />
    ),
  },
  {
    id: 'visits',
    title: 'Визиты по устройствам',
    layout: { x: 0, y: 2, w: 8, h: 5, minW: 4, minH: 3 },
    hasTableView: true,
    Component: VisitsWidget,
  },
  {
    id: 'channels',
    title: 'Выручка по каналам',
    layout: { x: 8, y: 2, w: 4, h: 5, minW: 3, minH: 3 },
    hasTableView: true,
    Component: ChannelsWidget,
  },
  {
    id: 'sources',
    title: 'Источники трафика',
    layout: { x: 0, y: 7, w: 5, h: 3, minW: 3, minH: 3 },
    hasTableView: true,
    Component: SourcesWidget,
  },
  {
    id: 'plan',
    title: 'План по выручке',
    layout: { x: 0, y: 10, w: 5, h: 2, minW: 3, minH: 2 },
    Component: PlanWidget,
  },
  {
    id: 'pages',
    title: 'Популярные страницы',
    layout: { x: 5, y: 7, w: 7, h: 5, minW: 4, minH: 3 },
    Component: PagesWidget,
  },
];
