import { useElementSize } from '../useElementSize';
import { fmt } from '../format';

interface StatTileProps {
  value: string;
  /** Change vs the previous period, as a ratio (0.08 = +8%). */
  delta: number;
  /** Whether a rise is good for this metric. Decides the delta color. */
  upIsGood: boolean;
  /** Up to 12 values, oldest first. The last one is the current period. */
  spark: number[];
}

export function StatTile({ value, delta, upIsGood, spark }: StatTileProps) {
  const up = delta >= 0;
  const good = up === upIsGood;
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className={good ? 'stat__delta is-good' : 'stat__delta is-bad'}>
        <span aria-hidden="true">{up ? '▲' : '▼'}</span> {fmt.signedPct(delta)}{' '}
        <span className="stat__muted">к предыдущему периоду</span>
      </div>
      <Sparkline values={spark} />
    </div>
  );
}

/** Sparkline: muted line for the trend, accent dot on the current period. */
function Sparkline({ values }: { values: number[] }) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const pad = 4;
  const n = values.length;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const x = (i: number) => pad + (n > 1 ? (i / (n - 1)) * (width - 2 * pad) : 0);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - 2 * pad);

  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = n - 1;

  return (
    <div ref={ref} className="stat__spark" role="img" aria-label="Тренд за период">
      {n > 0 && width > 0 && (
        <svg width={width} height={height} aria-hidden="true">
          <path d={d} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" style={{ stroke: 'var(--text-muted)' }} />
          <circle
            cx={x(last)}
            cy={y(values[last])}
            r={4}
            strokeWidth={2}
            style={{ fill: 'var(--series-1)', stroke: 'var(--surface-1)' }}
          />
        </svg>
      )}
    </div>
  );
}
