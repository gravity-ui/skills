import React from 'react';
import { CHANNELS, sum, type DashboardData } from '../data';
import { pct, rubCompact } from '../format';

export function Channels({ data }: { data: DashboardData }) {
  const totals = CHANNELS.map((name, i) => ({ name, value: sum(data.current, (d) => d.byChannel[i]) }));
  const all = totals.reduce((a, b) => a + b.value, 0);
  const ranked = [...totals].sort((a, b) => b.value - a.value);
  const max = ranked[0].value;
  return (
    <ol className="bars">
      {ranked.map((c) => (
        <li key={c.name} className="bars__row" tabIndex={0} aria-label={`${c.name}: ${rubCompact(c.value)}, ${pct(c.value / all, 0)}`}>
          <span className="bars__name">{c.name}</span>
          <span className="bars__track">
            <span className="bars__fill" style={{ width: `${(c.value / max) * 100}%` }} />
          </span>
          <span className="bars__value">
            {rubCompact(c.value)} <span className="bars__share">{pct(c.value / all, 0)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
