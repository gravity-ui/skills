import React from 'react';

import { useElementSize } from '../useElementSize';
import { axisFormatter, fmt, niceTicks } from '../format';
import { ChartTooltip, TooltipRow } from './ChartTooltip';

export interface LineSeries {
  id: string;
  name: string;
  color: string;
  values: number[];
}

interface Props {
  dates: Date[];
  series: LineSeries[];
  formatValue?: (n: number) => string;
  label: string;
}

const M = { top: 10, bottom: 24, right: 60 };
const CHAR = 6.6;

export function LineChart({ dates, series, formatValue = fmt.int, label }: Props) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const n = dates.length;

  const max = Math.max(...series.flatMap((s) => s.values));
  const ticks = niceTicks(max * 1.05, height < 160 ? 2 : 4);
  const yMax = ticks[ticks.length - 1];
  const axisFmt = axisFormatter(yMax);
  const left = Math.ceil(Math.max(...ticks.map((t) => axisFmt(t).length)) * CHAR) + 10;

  const innerW = Math.max(0, width - left - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);
  const x = (i: number) => left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => M.top + innerH - (v / yMax) * innerH;

  // X labels anchored to the latest date, spaced so they never collide.
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 64))));
  const xTicks = dates.map((_, i) => i).filter((i) => (n - 1 - i) % every === 0);

  // Direct end labels only when they don't collide; otherwise legend + tooltip carry identity.
  const ends = series.map((s) => ({ s, y: y(s.values[n - 1]) }));
  const endLabelsFit = ends.every((a, i) => ends.every((b, j) => i === j || Math.abs(a.y - b.y) >= 14));

  const pick = (clientX: number, target: Element) => {
    const box = target.getBoundingClientRect();
    const px = clientX - box.left - left;
    setHover(Math.max(0, Math.min(n - 1, Math.round((px / Math.max(1, innerW)) * (n - 1)))));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, Home: -n, End: n }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    setHover((h) => Math.max(0, Math.min(n - 1, (h ?? n - 1) + step)));
  };

  const ready = width > 0 && height > 0 && innerW > 0 && innerH > 0;

  return (
    <div className="chart">
      {series.length > 1 && (
        <div className="chart-legend">
          {series.map((s) => (
            <span key={s.id} className="chart-legend__item">
              <span className="chart-key chart-key_line" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div ref={ref} className="chart__plot">
        {ready && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${label}. Стрелки влево и вправо — значения по дням.`}
            tabIndex={0}
            className="chart__svg"
            onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover((h) => h ?? n - 1)}
            onBlur={() => setHover(null)}
            onKeyDown={onKeyDown}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={left}
                  x2={left + innerW}
                  y1={y(t)}
                  y2={y(t)}
                  className={t === 0 ? 'chart-axis' : 'chart-grid'}
                />
                <text x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="chart-tick">
                  {axisFmt(t)}
                </text>
              </g>
            ))}
            {xTicks.map((i) => (
              <text key={i} x={x(i)} y={height - 6} textAnchor="middle" className="chart-tick">
                {fmt.day(dates[i])}
              </text>
            ))}

            {series.map((s) => (
              <path
                key={s.id}
                d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}
                fill="none"
                style={{ stroke: s.color }}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {hover === null &&
              ends.map(({ s, y: ey }) => (
                <g key={s.id}>
                  <circle cx={x(n - 1)} cy={ey} r={4} style={{ fill: s.color }} className="chart-dot" />
                  {endLabelsFit && (
                    <text x={x(n - 1) + 9} y={ey} dy="0.32em" className="chart-end-label">
                      {formatValue(s.values[n - 1])}
                    </text>
                  )}
                </g>
              ))}

            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + innerH} className="chart-crosshair" />
                {series.map((s) => (
                  <circle key={s.id} cx={x(hover)} cy={y(s.values[hover])} r={4} style={{ fill: s.color }} className="chart-dot" />
                ))}
              </g>
            )}
          </svg>
        )}
        {ready && hover !== null && (
          <ChartTooltip x={x(hover)} y={M.top} containerWidth={width}>
            <div className="chart-tooltip__title">{fmt.longDay(dates[hover])}</div>
            {series.map((s) => (
              <TooltipRow key={s.id} color={s.color} value={formatValue(s.values[hover])} label={s.name} />
            ))}
          </ChartTooltip>
        )}
      </div>
    </div>
  );
}
