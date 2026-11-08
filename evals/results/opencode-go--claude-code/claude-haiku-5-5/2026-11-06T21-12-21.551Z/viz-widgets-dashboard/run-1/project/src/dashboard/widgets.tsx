import type { ReactNode } from 'react';
import { DataTable, LineChart, BarRanking, SegmentedBar, Sparkline, type Part } from './charts';
import { fmt } from './format';
import { bucketSums, totals, type DailyPoint, type DashboardData } from './data';
import type { Layout, Rect } from './grid';

export type ViewMode = 'chart' | 'table';

export interface RenderContext {
  data: DashboardData;
  view: ViewMode;
}

export interface WidgetDef {
  id: string;
  title: string;
  minW: number;
  minH: number;
  defaults: Rect;
  /** Charts offer a table twin via the header toggle. */
  hasTable: boolean;
  render: (ctx: RenderContext) => ReactNode;
}

// ---------------------------------------------------------------------------
// Stat tiles
// ---------------------------------------------------------------------------

interface KpiModel {
  value: string;
  delta: number; // sign decides direction; all three KPIs are "up is good"
  deltaText: string;
  spark: number[];
  sparkLabel: string;
}

function StatTile({ model }: { model: KpiModel }) {
  const up = model.delta >= 0;
  return (
    <div className="kpi">
      <div className="kpi-main">
        <div className="kpi-value">{model.value}</div>
        <div className={`kpi-delta ${up ? 'is-up' : 'is-down'}`}>
          <span aria-hidden="true">{up ? '▲' : '▼'}</span> {model.deltaText}
        </div>
      </div>
      <Sparkline values={model.spark} label={model.sparkLabel} />
    </div>
  );
}

const VS_PREVIOUS = 'к предыдущему периоду';

function revenueModel(data: DashboardData): KpiModel {
  const cur = totals(data.current).revenue;
  const prev = totals(data.previous).revenue;
  const delta = cur / prev - 1;
  return {
    value: fmt.rub(cur),
    delta,
    deltaText: `${fmt.signedPercent(delta)} ${VS_PREVIOUS}`,
    spark: bucketSums(data.current, 12, (p) => p.revenue),
    sparkLabel: 'Выручка по неделям периода',
  };
}

function ordersModel(data: DashboardData): KpiModel {
  const cur = totals(data.current).orders;
  const prev = totals(data.previous).orders;
  const delta = cur / prev - 1;
  return {
    value: fmt.compact(cur),
    delta,
    deltaText: `${fmt.signedPercent(delta)} ${VS_PREVIOUS}`,
    spark: bucketSums(data.current, 12, (p) => p.orders),
    sparkLabel: 'Заказы по неделям периода',
  };
}

function conversionModel(data: DashboardData): KpiModel {
  const c = totals(data.current);
  const p = totals(data.previous);
  const rate = c.orders / c.visits;
  const prevRate = p.orders / p.visits;
  const points = (rate - prevRate) * 100;
  const spark = bucketSums(data.current, 12, (d: DailyPoint) => d.orders);
  const visits = bucketSums(data.current, 12, (d: DailyPoint) => d.visits);
  return {
    value: fmt.percentPrecise(rate),
    delta: points,
    deltaText: `${fmt.signedPoints(points)} ${VS_PREVIOUS}`,
    spark: spark.map((o, i) => (visits[i] > 0 ? o / visits[i] : 0)),
    sparkLabel: 'Конверсия по неделям периода',
  };
}

// ---------------------------------------------------------------------------
// Plan meter: a ratio against a limit. Track is a lighter step of the fill hue.
// ---------------------------------------------------------------------------

function PlanMeter({ actual, target }: { actual: number; target: number }) {
  const ratio = actual / target;
  const fill = Math.min(1, ratio);
  const remaining = Math.max(0, target - actual);
  return (
    <div className="meter">
      <div className="meter-head">
        <span className="meter-value">{fmt.percent(ratio)}</span>
        <span className="meter-sub">
          {fmt.rub(actual)} из {fmt.rub(target)}
        </span>
      </div>
      <div
        className="meter-track"
        role="progressbar"
        aria-label="Выполнение плана продаж"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill * 100)}
      >
        <div className="meter-fill" style={{ width: `${fill * 100}%` }} />
      </div>
      <div className="meter-foot">
        {remaining > 0 ? `Осталось ${fmt.rub(remaining)} до цели` : 'План выполнен'}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Widget definitions. Order here is the default reading order.
// ---------------------------------------------------------------------------

const DEVICE_COLORS: Pick<Part, 'color' | 'ink'>[] = [
  { color: 'var(--s1)', ink: '#ffffff' }, // blue
  { color: 'var(--s2)', ink: '#ffffff' }, // orange
  { color: 'var(--s3)', ink: '#ffffff' }, // aqua
  { color: 'var(--s4)', ink: '#0b0b0b' }, // yellow: near-black label per palette rule
];

export const WIDGETS: WidgetDef[] = [
  {
    id: 'kpi-revenue',
    title: 'Выручка',
    minW: 3,
    minH: 2,
    defaults: { x: 0, y: 0, w: 4, h: 2 },
    hasTable: false,
    render: ({ data }) => <StatTile model={revenueModel(data)} />,
  },
  {
    id: 'kpi-orders',
    title: 'Заказы',
    minW: 3,
    minH: 2,
    defaults: { x: 4, y: 0, w: 4, h: 2 },
    hasTable: false,
    render: ({ data }) => <StatTile model={ordersModel(data)} />,
  },
  {
    id: 'kpi-conversion',
    title: 'Конверсия',
    minW: 3,
    minH: 2,
    defaults: { x: 8, y: 0, w: 4, h: 2 },
    hasTable: false,
    render: ({ data }) => <StatTile model={conversionModel(data)} />,
  },
  {
    id: 'traffic',
    title: 'Визиты по дням',
    minW: 4,
    minH: 3,
    defaults: { x: 0, y: 2, w: 8, h: 5 },
    hasTable: true,
    render: ({ data, view }) =>
      view === 'table' ? (
        <DataTable
          caption="Визиты по дням: текущий и предыдущий период"
          columns={[
            { title: 'Дата' },
            { title: 'Текущий период', numeric: true },
            { title: 'Предыдущий период', numeric: true },
          ]}
          rows={data.current.map((p, i) => [
            fmt.dayMonth(p.date),
            fmt.count(p.visits),
            fmt.count(data.previous[i].visits),
          ])}
        />
      ) : (
        <LineChart
          label="Визиты по дням: текущий и предыдущий период"
          dates={data.current.map((p) => p.date)}
          series={[
            {
              name: 'Текущий период',
              values: data.current.map((p) => p.visits),
              color: 'var(--s1)',
              emphasis: true,
            },
            {
              name: 'Предыдущий период',
              values: data.previous.map((p) => p.visits),
              color: 'var(--context)',
              emphasis: false,
            },
          ]}
        />
      ),
  },
  {
    id: 'devices',
    title: 'Устройства',
    minW: 3,
    minH: 3,
    defaults: { x: 8, y: 2, w: 4, h: 5 },
    hasTable: true,
    render: ({ data, view }) => {
      const total = data.devices.reduce((s, d) => s + d.value, 0);
      if (view === 'table') {
        return (
          <DataTable
            caption="Визиты по устройствам"
            columns={[{ title: 'Устройство' }, { title: 'Визиты', numeric: true }, { title: 'Доля', numeric: true }]}
            rows={data.devices.map((d) => [d.name, fmt.count(d.value), fmt.percent(d.value / total)])}
          />
        );
      }
      const parts: Part[] = data.devices.map((d, i) => ({ ...d, ...DEVICE_COLORS[i] }));
      return <SegmentedBar label="Визиты по устройствам" parts={parts} />;
    },
  },
  {
    id: 'plan',
    title: 'План продаж',
    minW: 3,
    minH: 2,
    defaults: { x: 0, y: 7, w: 4, h: 3 },
    hasTable: false,
    render: ({ data }) => <PlanMeter actual={data.plan.actual} target={data.plan.target} />,
  },
  {
    id: 'channels',
    title: 'Каналы привлечения',
    minW: 4,
    minH: 3,
    defaults: { x: 4, y: 7, w: 8, h: 4 },
    hasTable: true,
    render: ({ data, view }) =>
      view === 'table' ? (
        <DataTable
          caption="Визиты по каналам привлечения"
          columns={[{ title: 'Канал' }, { title: 'Визиты', numeric: true }]}
          rows={data.channels.map((c) => [c.name, fmt.count(c.value)])}
        />
      ) : (
        <BarRanking label="Визиты по каналам привлечения" items={data.channels} />
      ),
  },
  {
    id: 'products',
    title: 'Товары',
    minW: 6,
    minH: 3,
    defaults: { x: 0, y: 11, w: 12, h: 5 },
    hasTable: false,
    render: ({ data }) => (
      <DataTable
        caption="Продажи по товарам за период"
        columns={[
          { title: 'Товар' },
          { title: 'Заказы', numeric: true },
          { title: 'Выручка', numeric: true },
          { title: 'Средний чек', numeric: true },
        ]}
        rows={data.products.map((p) => [
          p.name,
          fmt.count(p.orders),
          fmt.rubFull(p.revenue),
          fmt.rubFull(p.orders > 0 ? p.revenue / p.orders : 0),
        ])}
      />
    ),
  },
];

export const WIDGET_BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));

export const DEFAULT_LAYOUT: Layout = WIDGETS.map((w) => ({ id: w.id, ...w.defaults }));
