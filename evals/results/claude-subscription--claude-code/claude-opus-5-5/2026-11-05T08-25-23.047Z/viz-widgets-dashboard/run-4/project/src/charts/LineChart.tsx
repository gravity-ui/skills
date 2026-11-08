import React, { useState } from 'react';

import { useElementSize } from '../useElementSize';
import { ChartTooltip, Legend, niceTicks, textWidth } from './common';

export interface LineSeries {
  id: string;
  name: string;
  color: string;
  values: number[];
}

interface LineChartProps {
  series: LineSeries[];
  labels: Date[];
  formatX: (d: Date) => string;
  formatY: (v: number) => string;
  formatValue: (v: number) => string;
  ariaLabel: string;
}

export function LineChart({ series, labels, formatX, formatY, formatValue, ariaLabel }: LineChartProps) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;

  const max = Math.max(...series.flatMap((s) => s.values));
  const ticks = niceTicks(max, Math.max(2, Math.floor(height / 56)));
  const top = ticks[ticks.length - 1];

  const m = { top: 10, bottom: 26, left: Math.max(...ticks.map((t) => textWidth(formatY(t), 11))) + 10, right: 14 };
  const plotH = Math.max(0, height - m.top - m.bottom);
  const y = (v: number) => m.top + plotH - (v / top) * plotH;

  // Подписи на концах линий — только если есть место и они не наезжают друг на друга.
  const ends = series.map((s) => y(s.values[n - 1]));
  const labelW = Math.max(...series.map((s) => textWidth(s.name))) + 14;
  const endsApart = ends.every((a, i) => ends.every((b, j) => i === j || Math.abs(a - b) >= 16));
  const directLabels = width >= 460 && series.length <= 4 && endsApart;
  if (directLabels) m.right = labelW;

  const plotW = Math.max(0, width - m.left - m.right);
  const step = n > 1 ? plotW / (n - 1) : 0;
  const x = (i: number) => m.left + i * step;

  const maxXTicks = Math.max(2, Math.floor(plotW / 72));
  const stride = Math.ceil(n / maxXTicks);
  const xTicks = labels.map((_, i) => i).filter((i) => (n - 1 - i) % stride === 0);

  const indexAt = (clientX: number, el: Element) => {
    const px = clientX - el.getBoundingClientRect().left;
    return Math.min(n - 1, Math.max(0, Math.round((px - m.left) / (step || 1))));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = hover ?? n - 1;
    if (e.key === 'ArrowLeft') setHover(Math.max(0, cur - 1));
    else if (e.key === 'ArrowRight') setHover(Math.min(n - 1, cur + 1));
    else if (e.key === 'Home') setHover(0);
    else if (e.key === 'End') setHover(n - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="viz-chart">
      <Legend items={series} shape="line" />
      <div className="viz-chart__plot" ref={ref}>
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${ariaLabel}. Стрелки влево и вправо показывают значения по дням.`}
            tabIndex={0}
            className="viz-focusable"
            onKeyDown={onKeyDown}
            onFocus={() => setHover((h) => h ?? n - 1)}
            onBlur={() => setHover(null)}
            onPointerMove={(e) => setHover(indexAt(e.clientX, e.currentTarget))}
            onPointerLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={m.left}
                  x2={width - m.right}
                  y1={y(t)}
                  y2={y(t)}
                  className={t === 0 ? 'viz-axis' : 'viz-grid'}
                />
                <text x={m.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="viz-tick">
                  {formatY(t)}
                </text>
              </g>
            ))}
            {xTicks.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={height - 8}
                textAnchor={i === 0 && n > 1 ? 'start' : i === n - 1 ? 'end' : 'middle'}
                className="viz-tick"
              >
                {formatX(labels[i])}
              </text>
            ))}

            {series.map((s) => (
              <polyline
                key={s.id}
                points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {directLabels &&
              series.map((s, k) => (
                <text key={s.id} x={x(n - 1) + 10} y={ends[k]} dy="0.32em" className="viz-direct-label">
                  {s.name}
                </text>
              ))}

            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={m.top} y2={m.top + plotH} className="viz-crosshair" />
                {series.map((s) => (
                  <circle
                    key={s.id}
                    cx={x(hover)}
                    cy={y(s.values[hover])}
                    r={4.5}
                    fill={s.color}
                    stroke="var(--viz-surface)"
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}
          </svg>
        )}
        {hover !== null && (
          <ChartTooltip
            x={x(hover)}
            y={m.top}
            containerWidth={width}
            title={formatX(labels[hover])}
            rows={series.map((s) => ({
              key: s.id,
              color: s.color,
              value: formatValue(s.values[hover]),
              label: s.name,
            }))}
          />
        )}
      </div>
    </div>
  );
}
