import { useRef, useState } from 'react';

import { ChartTooltip } from './ChartTooltip';
import { trafficShare } from './data';
import { useSize } from '../hooks/useSize';

const LABEL_PX_PER_CHAR = 7.5;

/** Высокая сегментная шкала: одно целое, разбитое на доли. */
export function TrafficShareBar() {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useSize(ref);
  const [hover, setHover] = useState<number | null>(null);
  const total = trafficShare.reduce((s, d) => s + d.value, 0);

  return (
    <div className="share-bar">
      <div className="share-bar__track" ref={ref} role="img" aria-label="Доли источников трафика">
        {trafficShare.map((d, i) => {
          const share = d.value / total;
          if (share === 0) return null;
          const px = share * width;
          const label = `${Math.round(share * 100)} %`;
          const fits = px >= label.length * LABEL_PX_PER_CHAR + 16;
          const slot = i + 1;
          return (
            <div
              key={d.name}
              className="share-bar__part"
              style={{
                flex: `0 0 calc(${(share * 100).toFixed(2)}% - 2px)`,
                background: `var(--viz-series-${slot})`,
                color: slot === 4 ? 'var(--viz-label-on-yellow)' : 'var(--viz-label-on-fill)',
              }}
              tabIndex={0}
              aria-label={`${d.name}: ${label}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              {fits && label}
              {hover === i && (
                <ChartTooltip
                  x={0}
                  y={32}
                  width={width}
                  rows={[{ name: d.name, value: label, color: `var(--viz-series-${slot})`, keyShape: 'rect' }]}
                />
              )}
            </div>
          );
        })}
      </div>
      <ul className="viz__legend" aria-label="Легенда">
        {trafficShare.map((d, i) => (
          <li key={d.name} className="viz__legend-item">
            <span className="viz__legend-key" style={{ background: `var(--viz-series-${i + 1})` }} />
            {d.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
