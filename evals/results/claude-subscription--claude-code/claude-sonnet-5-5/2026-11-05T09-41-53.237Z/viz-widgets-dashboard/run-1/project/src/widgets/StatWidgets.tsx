import { ArrowDownIcon, ArrowUpIcon } from '../icons';
import { fmtCompact, fmtRub, quarterGoal, sparklines } from './data';
import { useElementSize } from './useElementSize';

/* ---------- Sparkline ---------- */

function Sparkline({ values, label }: { values: number[]; label: string }) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    pad + ((width - pad * 2) * i) / (values.length - 1),
    pad + (height - pad * 2) * (1 - (v - min) / span),
  ]);
  const last = pts[pts.length - 1];

  return (
    <div ref={ref} className="spark">
      {width > 0 && height > 8 && (
        <svg width={width} height={height} role="img" aria-label={label}>
          <polyline
            points={pts.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke="var(--viz-series-1)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={last[0]} cy={last[1]} r={4} fill="var(--viz-series-1)" stroke="var(--viz-surface)" strokeWidth={2} />
        </svg>
      )}
    </div>
  );
}

/* ---------- Stat tile ---------- */

interface StatProps {
  value: string;
  /** Signed change, already formatted ("+12,4%"). */
  delta: string;
  /** Whether the change is good news; drives the icon colour, never the text. */
  good: boolean;
  up: boolean;
  spark: number[];
  sparkLabel: string;
}

function StatTile({ value, delta, good, up, spark, sparkLabel }: StatProps) {
  const Arrow = up ? ArrowUpIcon : ArrowDownIcon;
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__delta">
        <span className={`stat__arrow stat__arrow_${good ? 'good' : 'bad'}`}>
          <Arrow width={14} height={14} />
        </span>
        <span>{delta}</span>
        <span className="muted">к прошлому периоду</span>
      </div>
      <Sparkline values={spark} label={sparkLabel} />
    </div>
  );
}

export const RevenueWidget = () => (
  <StatTile
    value={fmtRub.format(1_284_500)}
    delta="+12,4%"
    up
    good
    spark={sparklines.revenue}
    sparkLabel="Выручка за 12 периодов: рост с 41 до 66 тыс."
  />
);

export const OrdersCountWidget = () => (
  <StatTile
    value="3 482"
    delta="+5,1%"
    up
    good
    spark={sparklines.orders}
    sparkLabel="Заказы за 12 периодов: рост с 30 до 46"
  />
);

export const ConversionWidget = () => (
  <StatTile
    value="3,8%"
    delta="−0,4 п.п."
    up={false}
    good={false}
    spark={sparklines.conversion}
    sparkLabel="Конверсия за 12 периодов: снижение с 4,4% до 3,8%"
  />
);

/* ---------- Meter ---------- */

export function GoalWidget() {
  const { value, target } = quarterGoal;
  const pct = Math.round((value / target) * 100);
  return (
    <div className="stat">
      <div className="stat__value">{pct}%</div>
      <div
        className="meter"
        role="meter"
        aria-label="Выполнение плана квартала"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}% плана`}
      >
        <div className="meter__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="stat__delta">
        <span>{fmtCompact.format(value)} ₽</span>
        <span className="muted">из {fmtCompact.format(target)} ₽</span>
      </div>
    </div>
  );
}
