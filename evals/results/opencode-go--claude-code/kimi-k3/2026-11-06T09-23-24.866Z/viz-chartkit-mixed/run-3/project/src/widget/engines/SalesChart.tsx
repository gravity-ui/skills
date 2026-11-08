import * as React from 'react';

import {useElementSize} from '../useElementSize';
import type {EngineProps} from '../types';

/**
 * SVG-движок «обычного» линейного графика (режим продаж).
 * Небольшое число точек: аккуратные маркеры, подпись последнего значения,
 * кроссхеер с тултипом. Загружается лениво — отдельным чанком.
 */

const MARGIN = {top: 16, right: 104, bottom: 28, left: 48};

/** «Красивые» деления оси Y: 1/2/5 × 10^n. */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm > 5 ? 10 : norm > 2 ? 5 : norm > 1 ? 2 : 1) * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return ticks;
}

export default function SalesChart({series, height, formatTime, formatValue, ariaLabel}: EngineProps) {
  const [containerRef, {width}] = useElementSize<HTMLDivElement>();
  const [hovered, setHovered] = React.useState<number | null>(null);

  const s = series[0];
  const points = s?.points ?? [];

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const maxV = Math.max(0, ...points.map((p) => p.v));
  const ticks = niceTicks(maxV);
  const top = ticks[ticks.length - 1] || 1;

  const x = (i: number) =>
    MARGIN.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => MARGIN.top + plotH - (v / top) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.v)}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
      : '';

  // Подписи X: не чаще, чем помещается (≈64px на подпись)
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(plotW / 64))));

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (points.length === 0 || plotW === 0) return;
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left - MARGIN.left;
    const idx = Math.round((px / plotW) * (points.length - 1));
    setHovered(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const hoveredPoint = hovered != null ? points[hovered] : null;
  const last = points[points.length - 1];

  return (
    <div ref={containerRef} className="viz-engine" role="img" aria-label={ariaLabel}>
      {width > 0 && points.length > 0 && (
        <svg width={width} height={height} className="viz-engine__svg">
          {/* сетка и ось Y — рецессивные */}
          {ticks.map((tv) => (
            <g key={tv}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(tv)}
                y2={y(tv)}
                className="viz-gridline"
              />
              <text x={MARGIN.left - 8} y={y(tv)} dy="0.32em" textAnchor="end" className="viz-tick">
                {tv.toLocaleString('ru-RU')}
              </text>
            </g>
          ))}
          {/* базовая линия */}
          <line
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={y(0)}
            y2={y(0)}
            className="viz-baseline"
          />
          {/* подписи X */}
          {points.map(
            (p, i) =>
              i % labelEvery === 0 && (
                <text
                  key={p.t}
                  x={x(i)}
                  y={height - MARGIN.bottom + 16}
                  textAnchor="middle"
                  className="viz-tick"
                >
                  {formatTime(p.t)}
                </text>
              ),
          )}

          {/* заливка под линией — лёгкая, того же оттенка */}
          <path d={areaPath} fill={`var(--series-${s.colorSlot})`} opacity={0.08} />
          {/* сама линия — 2px */}
          <path
            d={linePath}
            fill="none"
            stroke={`var(--series-${s.colorSlot})`}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* маркеры 8px */}
          {points.map((p, i) => (
            <circle
              key={p.t}
              cx={x(i)}
              cy={y(p.v)}
              r={4}
              fill={`var(--series-${s.colorSlot})`}
              stroke="var(--surface-1)"
              strokeWidth={2}
            />
          ))}

          {/* прямая подпись последнего значения (текст — в ink-токене) */}
          {last && (
            <text
              x={x(points.length - 1) + 10}
              y={y(last.v)}
              dy="0.32em"
              className="viz-direct-label"
            >
              {formatValue(last.v)}
            </text>
          )}

          {/* кроссхеер */}
          {hoveredPoint && (
            <g pointerEvents="none">
              <line
                x1={x(hovered!)}
                x2={x(hovered!)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
                className="viz-crosshair"
              />
              <circle
                cx={x(hovered!)}
                cy={y(hoveredPoint.v)}
                r={5.5}
                fill={`var(--series-${s.colorSlot})`}
                stroke="var(--surface-1)"
                strokeWidth={2}
              />
            </g>
          )}

          {/* увеличенная зона наведения поверх всех маркеров */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHovered(null)}
          />
        </svg>
      )}

      {/* HTML-тултип */}
      {hoveredPoint && (
        <div
          className="viz-tooltip"
          style={{
            left: Math.max(70, Math.min(width - 70, x(hovered!))),
            top: y(hoveredPoint.v),
          }}
        >
          <div className="viz-tooltip__title">{formatTime(hoveredPoint.t)}</div>
          <div className="viz-tooltip__row">
            <span
              className="viz-swatch"
              style={{background: `var(--series-${s.colorSlot})`}}
            />
            <span className="viz-tooltip__name">{s.name}</span>
            <span className="viz-tooltip__value">{formatValue(hoveredPoint.v)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
