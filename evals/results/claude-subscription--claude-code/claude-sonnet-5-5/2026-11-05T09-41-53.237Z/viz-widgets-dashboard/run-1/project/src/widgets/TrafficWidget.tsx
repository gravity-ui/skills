import { useState } from 'react';
import { fmtDate, fmtDateLong, fmtInt, traffic } from './data';
import { useElementSize } from './useElementSize';

function niceCeil(v: number, steps: number) {
  const raw = v / steps;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * pow * steps;
}

const Y_TICKS = 4;

export function TrafficWidget() {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const n = traffic.length;
  const yMax = niceCeil(Math.max(...traffic.flatMap((d) => [d.current, d.previous])), Y_TICKS);

  // Leave room on the right for direct labels when the widget is wide enough.
  const direct = width >= 440;
  const m = { top: 8, right: direct ? 76 : 12, bottom: 24, left: 44 };
  const pw = Math.max(width - m.left - m.right, 0);
  const ph = Math.max(height - m.top - m.bottom, 0);
  const x = (i: number) => m.left + (pw * i) / (n - 1);
  const y = (v: number) => m.top + ph * (1 - v / yMax);
  const path = (key: 'current' | 'previous') =>
    traffic.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join('');

  const xTickCount = Math.max(2, Math.floor(pw / 90));
  const xTicks = Array.from({ length: xTickCount }, (_, k) =>
    Math.round((k * (n - 1)) / (xTickCount - 1)),
  );

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - box.left) / box.width;
    setHover(Math.min(Math.max(Math.round(t * (n - 1)), 0), n - 1));
  };

  // Keep the two direct labels from colliding when the lines end close together.
  const last = traffic[n - 1];
  let labelCur = y(last.current);
  let labelPrev = y(last.previous);
  if (Math.abs(labelCur - labelPrev) < 14) {
    const mid = (labelCur + labelPrev) / 2;
    const sign = labelCur <= labelPrev ? -1 : 1;
    labelCur = mid + sign * 7;
    labelPrev = mid - sign * 7;
  }

  const point = hover === null ? null : traffic[hover];
  const tipOnLeft = hover !== null && x(hover) > width - 190;

  return (
    <div className="chart">
      <ul className="legend">
        <li>
          <span className="legend__swatch legend__swatch_line" style={{ background: 'var(--viz-series-1)' }} />
          Текущий период
        </li>
        <li>
          <span className="legend__swatch legend__swatch_dashed" />
          Предыдущий период
        </li>
      </ul>

      <div ref={ref} className="chart__plot">
        {width > 0 && height > 0 && (
          <svg width={width} height={height} role="img" aria-label="Посетители по дням за 30 дней, сравнение с предыдущим периодом">
            {Array.from({ length: Y_TICKS + 1 }, (_, k) => {
              const v = (yMax / Y_TICKS) * k;
              return (
                <g key={k}>
                  <line
                    x1={m.left}
                    x2={width - m.right}
                    y1={y(v)}
                    y2={y(v)}
                    stroke={k === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)'}
                    strokeWidth={1}
                  />
                  <text x={m.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="chart__tick">
                    {fmtInt.format(v)}
                  </text>
                </g>
              );
            })}
            {xTicks.map((i, k) => (
              <text
                key={i}
                x={x(i)}
                y={height - 6}
                textAnchor={k === 0 ? 'start' : k === xTicks.length - 1 ? 'end' : 'middle'}
                className="chart__tick"
              >
                {fmtDate.format(traffic[i].date)}
              </text>
            ))}

            <path
              d={path('previous')}
              fill="none"
              stroke="var(--viz-muted)"
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeLinejoin="round"
            />
            <path
              d={path('current')}
              fill="none"
              stroke="var(--viz-series-1)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {direct && (
              <>
                <text x={x(n - 1) + 8} y={labelCur} dy="0.32em" className="chart__direct">
                  Текущий
                </text>
                <text x={x(n - 1) + 8} y={labelPrev} dy="0.32em" className="chart__direct">
                  Прошлый
                </text>
              </>
            )}

            {point && hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={m.top} y2={m.top + ph} stroke="var(--viz-axis)" strokeWidth={1} />
                <circle cx={x(hover)} cy={y(point.previous)} r={4} fill="var(--viz-muted)" stroke="var(--viz-surface)" strokeWidth={2} />
                <circle cx={x(hover)} cy={y(point.current)} r={4} fill="var(--viz-series-1)" stroke="var(--viz-surface)" strokeWidth={2} />
              </g>
            )}

            {/* Hit target spans the whole plot, much larger than any mark. */}
            <rect
              x={m.left}
              y={m.top}
              width={pw}
              height={ph}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}

        {point && hover !== null && (
          <div
            className="tooltip"
            style={{
              top: m.top + 4,
              left: tipOnLeft ? undefined : x(hover) + 12,
              right: tipOnLeft ? width - x(hover) + 12 : undefined,
            }}
          >
            <div className="tooltip__title">{fmtDateLong.format(point.date)}</div>
            <div className="tooltip__row">
              <span className="legend__swatch legend__swatch_line" style={{ background: 'var(--viz-series-1)' }} />
              <span className="tooltip__name">Текущий</span>
              <b>{fmtInt.format(point.current)}</b>
            </div>
            <div className="tooltip__row">
              <span className="legend__swatch legend__swatch_dashed" />
              <span className="tooltip__name">Предыдущий</span>
              <b>{fmtInt.format(point.previous)}</b>
            </div>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>Посетители по дням</caption>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Текущий период</th>
            <th>Предыдущий период</th>
          </tr>
        </thead>
        <tbody>
          {traffic.map((d) => (
            <tr key={d.date.toISOString()}>
              <td>{fmtDateLong.format(d.date)}</td>
              <td>{d.current}</td>
              <td>{d.previous}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
