import type { ReactNode } from 'react';
import { LineChart } from './charts/LineChart';
import { RankedBars, type BarDatum } from './charts/RankedBars';
import { SegmentedBar, type Part } from './charts/SegmentedBar';
import { Sparkline } from './charts/Sparkline';
import {
  CHANNELS,
  metricOf,
  regionRevenue,
  sparkline,
  totals,
  trafficSources,
  type DayRow,
  type MetricId,
  type RangeDays,
} from './data';
import { fmtDelta, fmtInt, fmtPct, fmtRub, fmtRubCompact, fmtShare } from './format';

export type View = 'chart' | 'table';

export interface DashboardData {
  range: RangeDays;
  current: DayRow[];
  previous: DayRow[];
}

export interface WidgetDef {
  id: string;
  title: string;
  minW: number;
  minH: number;
  hasTable: boolean;
  defaultPos: { x: number; y: number; w: number; h: number };
  render: (data: DashboardData, view: View) => ReactNode;
}

// ---- KPI tile -------------------------------------------------------------

interface KpiTileProps {
  value: string;
  delta: number;
  spark: number[];
  range: RangeDays;
  hero?: boolean;
}

function KpiTile({ value, delta, spark, range, hero }: KpiTileProps) {
  const dir = delta > 0.0005 ? 'up' : delta < -0.0005 ? 'down' : 'flat';
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–';
  return (
    <div className="kpi">
      <div className={hero ? 'kpi-value kpi-hero' : 'kpi-value'}>{value}</div>
      <div className="kpi-delta-row">
        <span className={`kpi-delta kpi-${dir}`}>
          <span aria-hidden="true">{arrow}</span> {fmtDelta(delta)}
        </span>
        <span className="kpi-vs">к предыдущим {range} дн.</span>
      </div>
      <Sparkline values={spark} />
    </div>
  );
}

function kpiWidget(
  id: string,
  title: string,
  metric: MetricId,
  format: (v: number) => string,
  defaultPos: WidgetDef['defaultPos'],
  hero = false,
): WidgetDef {
  return {
    id,
    title,
    minW: 2,
    minH: 2,
    hasTable: false,
    defaultPos,
    render: ({ range, current, previous }) => {
      const cur = metricOf(metric, totals(current));
      const prev = metricOf(metric, totals(previous));
      const delta = prev > 0 ? cur / prev - 1 : 0;
      return (
        <KpiTile
          value={format(cur)}
          delta={delta}
          spark={sparkline(metric, current)}
          range={range}
          hero={hero}
        />
      );
    },
  };
}

// ---- Widget registry ------------------------------------------------------

export const WIDGETS: WidgetDef[] = [
  kpiWidget('kpi-revenue', 'Выручка', 'revenue', fmtRubCompact, { x: 0, y: 0, w: 3, h: 2 }, true),
  kpiWidget('kpi-orders', 'Заказы', 'orders', fmtInt, { x: 3, y: 0, w: 3, h: 2 }),
  kpiWidget('kpi-conversion', 'Конверсия в заказ', 'conversion', fmtPct, { x: 6, y: 0, w: 3, h: 2 }),
  kpiWidget('kpi-avg', 'Средний чек', 'avgCheck', fmtRub, { x: 9, y: 0, w: 3, h: 2 }),

  {
    id: 'orders-trend',
    title: 'Заказы по каналам',
    minW: 4,
    minH: 3,
    hasTable: true,
    defaultPos: { x: 0, y: 2, w: 8, h: 4 },
    render: ({ current }, view) => (
      <LineChart
        caption="Заказы по каналам за период"
        dates={current.map((r) => r.date)}
        view={view}
        series={CHANNELS.map((name, idx) => ({
          key: name,
          name,
          color: `var(--s${idx + 1})`,
          values: current.map((r) => r.orders[idx]),
        }))}
      />
    ),
  },

  {
    id: 'regions',
    title: 'Выручка по регионам',
    minW: 3,
    minH: 3,
    hasTable: true,
    defaultPos: { x: 8, y: 2, w: 4, h: 4 },
    render: ({ range, current }, view) => {
      const all = regionRevenue(range, totals(current));
      const named = all.filter((r) => r.name !== 'Прочие').sort((a, b) => b.value - a.value);
      const others = all.filter((r) => r.name === 'Прочие');
      const rows: BarDatum[] = [...named, ...others].map((r) => ({
        name: r.name,
        value: r.value,
        share: r.share,
        valueLabel: fmtRubCompact(r.value),
        valueFull: fmtRub(r.value),
      }));
      return <RankedBars caption="Выручка по регионам" rows={rows} view={view} />;
    },
  },

  {
    id: 'traffic',
    title: 'Источники трафика',
    minW: 4,
    minH: 2,
    hasTable: true,
    defaultPos: { x: 0, y: 6, w: 12, h: 2 },
    render: ({ range, current }, view) => {
      const parts: Part[] = trafficSources(range, totals(current)).map((s, idx) => ({
        name: s.name,
        share: s.share,
        valueFull: `${fmtInt(s.value)} · ${fmtShare(s.share)}`,
        color: `var(--s${idx + 1})`,
        // White on every slot except the yellow one, which takes near-black.
        labelColor: idx === 3 ? 'var(--on-yellow)' : 'var(--on-fill)',
      }));
      return <SegmentedBar caption="Источники трафика по сессиям" parts={parts} view={view} />;
    },
  },
];

export const WIDGET_BY_ID = Object.fromEntries(WIDGETS.map((w) => [w.id, w]));
export const WIDGET_IDS = WIDGETS.map((w) => w.id);
export const sizeOfWidget = (id: string) => {
  const w = WIDGET_BY_ID[id];
  return { minW: w?.minW ?? 1, minH: w?.minH ?? 1 };
};
export const DEFAULT_ITEMS = WIDGETS.map((w) => ({ i: w.id, ...w.defaultPos }));
