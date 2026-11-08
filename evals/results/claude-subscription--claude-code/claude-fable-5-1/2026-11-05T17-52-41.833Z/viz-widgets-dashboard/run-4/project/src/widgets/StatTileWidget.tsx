import { Icon } from '@gravity-ui/uikit';
import { ArrowDown, ArrowUp } from '@gravity-ui/icons';
import { useMemo, useRef } from 'react';

import { useElementSize } from '../dashboard/useElementSize';
import { avg, getPeriod, sum, type DailyPoint } from './data';
import { formatCurrencyCompact, formatCompact, formatDelta } from './format';
import { usePeriod } from './PeriodContext';
import { Sparkline } from './Sparkline';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetProps } from './types';

interface Metric {
  label: string;
  pick: (p: DailyPoint) => number;
  aggregate: (xs: number[]) => number;
  format: (v: number) => string;
  hero?: boolean;
}

const METRICS = {
  revenue: {
    label: 'Выручка за период',
    pick: (p) => p.revenue,
    aggregate: sum,
    format: formatCurrencyCompact,
    hero: true,
  },
  users: {
    label: 'Активные пользователи в день',
    pick: (p) => p.users,
    aggregate: avg,
    format: formatCompact,
  },
} satisfies Record<string, Metric>;

export type StatMetric = keyof typeof METRICS;

/** Спарклайн показываем, только когда тайл достаточно высокий, иначе он вылезает за край. */
const SPARK_MIN_HEIGHT = 150;

/** Сжимает ряд до 12 точек (сумма/среднее по корзинам) для спарклайна. */
function bucket(values: number[], buckets: number, aggregate: (xs: number[]) => number) {
  const size = values.length / buckets;
  return Array.from({ length: buckets }, (_, i) => aggregate(values.slice(Math.floor(i * size), Math.floor((i + 1) * size) || 1)));
}

export function StatTileWidget({ metric, ...frame }: WidgetProps & { metric: StatMetric }) {
  const days = usePeriod();
  const def: Metric = METRICS[metric];
  const ref = useRef<HTMLDivElement>(null);
  const { height } = useElementSize(ref);

  const { value, delta, spark } = useMemo(() => {
    const { current, previous } = getPeriod(days);
    const cur = def.aggregate(current.map(def.pick));
    const prev = def.aggregate(previous.map(def.pick));
    return {
      value: cur,
      delta: prev > 0 ? cur / prev - 1 : 0,
      spark: bucket(current.map(def.pick), Math.min(12, current.length), def.aggregate),
    };
  }, [days, def]);

  const up = delta >= 0;
  return (
    <WidgetFrame {...frame}>
      <div className="stat-tile" ref={ref}>
        <span className="stat-tile__label">{def.label}</span>
        <span className={`stat-tile__value${def.hero ? ' stat-tile__value_hero' : ''}`}>{def.format(value)}</span>
        <span className="stat-tile__delta">
          <span className={`stat-tile__delta-value ${up ? 'stat-tile__delta-value_good' : 'stat-tile__delta-value_bad'}`}>
            <Icon data={up ? ArrowUp : ArrowDown} size={14} />
            {formatDelta(delta)}
          </span>
          <span>к предыдущим {days} дням</span>
        </span>
        {height >= SPARK_MIN_HEIGHT && <Sparkline values={spark} accent="var(--viz-s1)" />}
      </div>
    </WidgetFrame>
  );
}
