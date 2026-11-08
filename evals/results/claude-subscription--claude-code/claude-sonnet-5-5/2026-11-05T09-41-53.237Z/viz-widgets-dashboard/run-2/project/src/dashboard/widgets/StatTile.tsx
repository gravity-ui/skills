import { Icon } from '@gravity-ui/uikit';
import ArrowUp from '@gravity-ui/icons/ArrowUp';
import ArrowDown from '@gravity-ui/icons/ArrowDown';
import { downsample, deltaPct, type Series } from '../data';
import { fmtPct } from '../format';
import { Frame } from './Frame';

/** Last ~quarter of the line wears the accent (current period); the rest is context gray. */
function Sparkline({ values, label }: { values: number[]; label: string }) {
  const pts = downsample(values, 12);
  const W = 100;
  const H = 36;
  const pad = 5;
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const x = (i: number) => pad + (i / (pts.length - 1)) * (W - pad * 2);
  const y = (v: number) => (hi === lo ? H / 2 : H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2));
  const path = (from: number, to: number) =>
    pts
      .slice(from, to + 1)
      .map((v, k) => `${k ? 'L' : 'M'}${x(from + k).toFixed(2)},${y(v).toFixed(2)}`)
      .join('');
  const split = Math.max(1, pts.length - 4);
  const last = pts.length - 1;
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <path d={path(0, split)} className="spark__ctx" vectorEffect="non-scaling-stroke" />
      <path d={path(split, last)} className="spark__cur" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function StatTile({
  label,
  series,
  value,
  format,
  upIsGood = true,
}: {
  label: string;
  series: Series;
  /** Reduces a period's daily values to one number (sum, average…). */
  value: (v: number[]) => number;
  format: (n: number) => string;
  upIsGood?: boolean;
}) {
  const cur = value(series.current);
  const prev = value(series.previous);
  const d = deltaPct(cur, prev);
  const flat = Math.abs(d) < 0.5;
  const good = flat ? null : d > 0 === upIsGood;
  const sign = d > 0 ? '+' : d < 0 ? '−' : '';
  const tone = good === null ? 'flat' : good ? 'good' : 'bad';

  return (
    <Frame title={label} className="stat">
      <div className="stat__value">{format(cur)}</div>
      <div className={`stat__delta stat__delta_${tone}`}>
        {!flat && <Icon data={d > 0 ? ArrowUp : ArrowDown} size={14} />}
        <span className="stat__delta-num">
          {sign}
          {fmtPct(Math.abs(d))}
        </span>
        <span className="stat__delta-ref">к прошлому периоду</span>
      </div>
      <Sparkline values={series.current} label={`${label}: динамика, ${sign}${fmtPct(Math.abs(d))} к прошлому периоду`} />
    </Frame>
  );
}
