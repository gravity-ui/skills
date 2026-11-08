import React, { useRef } from 'react';
import { sum, type DashboardData, type Day } from '../data';
import { int, pct, rub } from '../format';
import { ArrowIcon } from '../icons';
import { useElementSize } from '../useElementSize';

export type KpiMetric = 'revenue' | 'orders' | 'conversion' | 'aov';

interface Def {
  total: (days: Day[]) => number;
  daily: (d: Day) => number;
  format: (v: number) => string;
}

const DEFS: Record<KpiMetric, Def> = {
  revenue: { total: (d) => sum(d, (x) => x.revenue), daily: (d) => d.revenue, format: rub },
  orders: { total: (d) => sum(d, (x) => x.orders), daily: (d) => d.orders, format: int },
  conversion: {
    total: (d) => sum(d, (x) => x.orders) / sum(d, (x) => x.visitors),
    daily: (d) => d.orders / d.visitors,
    format: (v) => pct(v, 2),
  },
  aov: {
    total: (d) => sum(d, (x) => x.revenue) / sum(d, (x) => x.orders),
    daily: (d) => d.revenue / d.orders,
    format: rub,
  },
};

const POINTS = 12;

/** Свести ряд к 12 точкам: среднее по корзинам. */
function bucket(values: number[], n = POINTS): number[] {
  return Array.from({ length: n }, (_, i) => {
    const from = Math.floor((i * values.length) / n);
    const to = Math.max(from + 1, Math.floor(((i + 1) * values.length) / n));
    const part = values.slice(from, to);
    return part.reduce((a, b) => a + b, 0) / part.length;
  });
}

function Sparkline({ current, previous }: { current: number[]; previous: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(ref);
  const pad = 6;
  const all = [...current, ...previous];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const x = (i: number) => pad + (i / (POINTS - 1)) * Math.max(width - pad * 2, 1);
  const y = (v: number) => height - pad - ((v - lo) / (hi - lo || 1)) * Math.max(height - pad * 2, 1);
  const path = (vs: number[]) => vs.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <div ref={ref} className="kpi__spark" aria-hidden>
      {width > 0 && height > 8 && (
        <svg width={width} height={height}>
          <path d={path(previous)} className="spark spark_prev" />
          <path d={path(current)} className="spark spark_cur" />
          <circle cx={x(POINTS - 1)} cy={y(current[POINTS - 1])} r="4" className="spark__dot" />
        </svg>
      )}
    </div>
  );
}

export function Kpi({ data, metric }: { data: DashboardData; metric: KpiMetric }) {
  const def = DEFS[metric];
  const cur = def.total(data.current);
  const prev = def.total(data.previous);
  const delta = (cur - prev) / prev;
  const up = delta >= 0;
  const sign = up ? '+' : '−';
  return (
    <div className="kpi">
      <div className="kpi__value">{def.format(cur)}</div>
      <div className="kpi__delta-row">
        <span className={'kpi__delta ' + (up ? 'kpi__delta_good' : 'kpi__delta_bad')}>
          <ArrowIcon up={up} />
          {sign}
          {pct(Math.abs(delta))}
        </span>
        <span className="kpi__vs">к предыдущим {data.range}&nbsp;дн.</span>
      </div>
      <Sparkline current={bucket(data.current.map(def.daily))} previous={bucket(data.previous.map(def.daily))} />
    </div>
  );
}
