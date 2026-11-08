import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Icon } from '@gravity-ui/uikit';
import { ChartLine, Grip, LayoutList, Xmark } from '@gravity-ui/icons';

import type { GridItem, DragHandleProps } from './grid';
import type { DashboardData, RangeKey } from './data';
import {
  DataTable,
  HBars,
  LineChart,
  Meter,
  SegmentedBar,
  Sparkline,
  StackedColumns,
} from './charts';
import type { KpiData } from './data';
import { compact, full, money, pct } from './format';

export type WidgetId = 'kpi' | 'traffic' | 'signups' | 'channels' | 'sources' | 'capacity';

export const WIDGET_META: Record<
  WidgetId,
  { title: string; minW: number; minH: number; def: Omit<GridItem, 'id'> }
> = {
  kpi: { title: 'Key metrics', minW: 4, minH: 2, def: { x: 0, y: 0, w: 12, h: 2 } },
  traffic: { title: 'Traffic', minW: 4, minH: 3, def: { x: 0, y: 2, w: 6, h: 4 } },
  signups: { title: 'Signups by plan', minW: 4, minH: 3, def: { x: 6, y: 2, w: 6, h: 4 } },
  channels: { title: 'Revenue by channel', minW: 4, minH: 3, def: { x: 0, y: 6, w: 6, h: 4 } },
  sources: { title: 'Traffic sources', minW: 4, minH: 3, def: { x: 6, y: 6, w: 6, h: 3 } },
  capacity: { title: 'Usage & limits', minW: 3, minH: 2, def: { x: 6, y: 9, w: 6, h: 2 } },
};

const S1 = 'var(--series-1)';
const S2 = 'var(--series-2)';
const S3 = 'var(--series-3)';
const S4 = 'var(--series-4)';
const S5 = 'var(--series-5)';
const S6 = 'var(--series-6)';

/* ---------- card chrome ---------- */

export function WidgetCard({
  title,
  dragHandleProps,
  onRemove,
  actions,
  children,
}: {
  title: string;
  dragHandleProps: DragHandleProps;
  onRemove: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="widget" aria-label={title}>
      <header className="widget__header" onPointerDown={dragHandleProps.onPointerDown}>
        <span className="widget__grip" aria-hidden>
          <Icon data={Grip} size={14} />
        </span>
        <h2 className="widget__title">{title}</h2>
        <div className="widget__actions" onPointerDown={(e) => e.stopPropagation()}>
          {actions}
          <Button
            view="flat-secondary"
            size="s"
            title="Hide widget"
            aria-label={`Hide ${title} widget`}
            onClick={onRemove}
          >
            <Icon data={Xmark} size={14} />
          </Button>
        </div>
      </header>
      <div className="widget__body">{children}</div>
    </section>
  );
}

/** Every chart ships with a table-view twin; the toggle lives in the header. */
function ChartWidget({
  title,
  dragHandleProps,
  onRemove,
  chart,
  table,
}: {
  title: string;
  dragHandleProps: DragHandleProps;
  onRemove: () => void;
  chart: ReactNode;
  table: ReactNode;
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  return (
    <WidgetCard
      title={title}
      dragHandleProps={dragHandleProps}
      onRemove={onRemove}
      actions={
        <Button
          view="flat-secondary"
          size="s"
          title={view === 'chart' ? 'Show as table' : 'Show as chart'}
          aria-label={view === 'chart' ? `Show ${title} as table` : `Show ${title} as chart`}
          onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
        >
          <Icon data={view === 'chart' ? LayoutList : ChartLine} size={14} />
        </Button>
      }
    >
      {view === 'chart' ? chart : table}
    </WidgetCard>
  );
}

/* ---------- stat tile ---------- */

function StatTile({ label, kpi, periodLabel }: { label: string; kpi: KpiData; periodLabel: string }) {
  const up = kpi.delta >= 0;
  const good = up === kpi.upIsGood;
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value">{kpi.format(kpi.value)}</span>
      <span className="stat__delta">
        <span
          className={
            good ? 'stat__delta-value stat__delta-value--good' : 'stat__delta-value stat__delta-value--bad'
          }
        >
          {up ? '▲' : '▼'} {up ? '+' : '−'}
          {(Math.abs(kpi.delta) * 100).toFixed(1)}%
        </span>
        <span className="stat__delta-note">vs prev. {periodLabel}</span>
      </span>
      <div className="stat__spark">
        <Sparkline values={kpi.spark} />
      </div>
    </div>
  );
}

/* ---------- widget bodies ---------- */

export function WidgetContent({
  id,
  data,
  dragHandleProps,
  onRemove,
}: {
  id: WidgetId;
  data: DashboardData;
  range: RangeKey;
  dragHandleProps: DragHandleProps;
  onRemove: () => void;
}) {
  const meta = WIDGET_META[id];

  switch (id) {
    case 'kpi':
      return (
        <WidgetCard title={meta.title} dragHandleProps={dragHandleProps} onRemove={onRemove}>
          <div className="kpi">
            {data.kpis.map((k) => (
              <StatTile key={k.id} label={k.label} kpi={k.kpi} periodLabel={data.rangeLabel} />
            ))}
          </div>
        </WidgetCard>
      );

    case 'traffic': {
      const series = data.traffic.series.map((s, i) => ({ ...s, color: i === 0 ? S1 : S2 }));
      return (
        <ChartWidget
          title={meta.title}
          dragHandleProps={dragHandleProps}
          onRemove={onRemove}
          chart={<LineChart labels={data.traffic.labels} series={series} format={compact} />}
          table={
            <DataTable
              columns={[
                { title: data.days <= 31 ? 'Day' : 'Week of' },
                { title: 'Page views', numeric: true },
                { title: 'Unique visitors', numeric: true },
              ]}
              rows={data.traffic.labels.map((lb, i) => [
                lb,
                full(data.traffic.series[0].values[i]),
                full(data.traffic.series[1].values[i]),
              ])}
            />
          }
        />
      );
    }

    case 'signups': {
      const colors = [S1, S2, S3];
      const series = data.signups.series.map((s, i) => ({ ...s, color: colors[i] }));
      const totals = data.signups.labels.map((_, i) =>
        data.signups.series.reduce((acc, s) => acc + s.values[i], 0),
      );
      return (
        <ChartWidget
          title={meta.title}
          dragHandleProps={dragHandleProps}
          onRemove={onRemove}
          chart={<StackedColumns labels={data.signups.labels} series={series} format={full} />}
          table={
            <DataTable
              columns={[
                { title: 'Period' },
                ...data.signups.series.map((s) => ({ title: s.name, numeric: true })),
                { title: 'Total', numeric: true },
              ]}
              rows={data.signups.ranges.map((lb, i) => [
                lb,
                ...data.signups.series.map((s) => full(s.values[i])),
                full(totals[i]),
              ])}
            />
          }
        />
      );
    }

    case 'channels': {
      const total = data.channels.reduce((s, c) => s + c.value, 0);
      return (
        <ChartWidget
          title={meta.title}
          dragHandleProps={dragHandleProps}
          onRemove={onRemove}
          chart={<HBars data={data.channels} format={money} valueName="Revenue" />}
          table={
            <DataTable
              columns={[
                { title: 'Channel' },
                { title: 'Revenue', numeric: true },
                { title: 'Share', numeric: true },
              ]}
              rows={data.channels.map((c) => [c.name, money(c.value), pct(c.value / Math.max(1, total), 1)])}
            />
          }
        />
      );
    }

    case 'sources': {
      const colors = [S1, S2, S3, S4, S5, S6];
      const total = Math.max(1, data.sources.reduce((s, d) => s + d.value, 0));
      const parts = data.sources.map((s, i) => ({
        ...s,
        color: colors[i],
        darkLabel: colors[i] === S4,
        share: s.value / total,
      }));
      return (
        <ChartWidget
          title={meta.title}
          dragHandleProps={dragHandleProps}
          onRemove={onRemove}
          chart={<SegmentedBar data={parts} format={compact} />}
          table={
            <DataTable
              columns={[
                { title: 'Source' },
                { title: 'Sessions', numeric: true },
                { title: 'Share', numeric: true },
              ]}
              rows={parts.map((p) => [p.name, full(p.value), pct(p.share, 1)])}
            />
          }
        />
      );
    }

    case 'capacity': {
      const pctUsed = Math.round((data.capacity.used / data.capacity.total) * 100);
      return (
        <WidgetCard title={meta.title} dragHandleProps={dragHandleProps} onRemove={onRemove}>
          <div style={{ margin: 'auto 0' }}>
            <Meter
              label="Storage"
              value={pctUsed}
              caption={`${data.capacity.used} GB of ${data.capacity.total} GB used`}
            />
            <Meter label="Bandwidth" value={38} caption="1.9 TB of 5 TB monthly quota" />
          </div>
        </WidgetCard>
      );
    }
  }
}
