import { ArrowDown, ArrowUp } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';

import { formatValue, type Kpi } from './data';

function Sparkline({ points }: { points: number[] }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => [i * step, h - 4 - ((v - min) / span) * (h - 8)] as const);
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const last = coords[coords.length - 1];
  return (
    <svg className="stat-tile__spark" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} className="viz__line" style={{ stroke: 'var(--viz-text-muted)', opacity: 0.6 }} />
      <circle cx={last[0]} cy={last[1]} r={4} className="viz__marker" style={{ fill: 'var(--viz-series-1)' }} />
    </svg>
  );
}

export function StatTile({ kpi }: { kpi: Kpi }) {
  const up = kpi.delta >= 0;
  const good = up === kpi.upIsGood;
  const deltaText = `${up ? '+' : '−'}${Math.abs(kpi.delta).toFixed(1).replace('.', ',')} %`;
  return (
    <div className="stat-tile">
      <div className="stat-tile__row">
        <div>
          <div className={`stat-tile__value${kpi.hero ? ' stat-tile__value_hero' : ''}`}>
            {formatValue(kpi.value, kpi.format)}
          </div>
          <div
            className={`stat-tile__delta ${good ? 'stat-tile__delta_up' : 'stat-tile__delta_down'}`}
            aria-label={`${deltaText} к прошлым 30 дням`}
          >
            <Icon data={up ? ArrowUp : ArrowDown} size={12} />
            {deltaText}
            <span className="stat-tile__delta-period">vs прошлые 30 дней</span>
          </div>
        </div>
        <Sparkline points={kpi.trend} />
      </div>
    </div>
  );
}
