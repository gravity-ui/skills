import React, {useEffect, useMemo, useRef, useState} from 'react';

import type {EngineProps, ResolvedSeries} from '../../widget/types';
import {nearestIndex, niceTicks} from '../../widget/format';
import {TooltipCard} from '../../widget/TooltipCard';

const MARGIN = {top: 12, right: 76, bottom: 28, left: 56};
const X_TICK_TARGET = 8;
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * SVG-движок «обычного» линейного графика: десятки точек на серию,
 * линия 2px + лёгкая заливка, подпись значения у конца линии,
 * кроссхейр со снапом к ближайшей точке по X.
 */
export default function SalesEngine({
  series,
  height,
  palette,
  yTickFormat,
  xTickFormat,
  tooltipValueFormat,
  tooltipXFormat,
}: EngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geom = useMemo(() => {
    const innerW = Math.max(40, width - MARGIN.left - MARGIN.right);
    const innerH = Math.max(40, height - MARGIN.top - MARGIN.bottom);

    // Временная сетка — из первой серии (ряды выровнены по контракту API).
    const times = series[0]?.points.map((p) => p.t) ?? [];
    const t0 = times[0] ?? 0;
    const t1 = times[times.length - 1] ?? 1;

    let maxV = 0;
    for (const s of series) for (const p of s.points) if (p.v > maxV) maxV = p.v;
    const yTicks = niceTicks(0, maxV, 5);
    const yMax = yTicks[yTicks.length - 1] || 1;

    const x = (t: number) => MARGIN.left + (innerW * (t - t0)) / Math.max(1, t1 - t0);
    const y = (v: number) => MARGIN.top + innerH - (innerH * v) / yMax;

    // ~8 подписей по X, равномерно по времени; крайние прижаты к краям.
    const xTicks: {t: number; anchor: 'start' | 'middle' | 'end'}[] = [];
    if (times.length > 1) {
      const step = Math.max(1, Math.ceil((times.length - 1) / X_TICK_TARGET));
      const idxSet = new Set<number>();
      for (let i = 0; i < times.length; i += step) idxSet.add(i);
      idxSet.add(times.length - 1);
      const idxs = [...idxSet].sort((a, b) => a - b);
      idxs.forEach((i, k) => {
        xTicks.push({
          t: times[i],
          anchor: k === 0 ? 'start' : k === idxs.length - 1 ? 'end' : 'middle',
        });
      });
    }

    return {innerW, innerH, times, t0, t1, x, y, yTicks, xTicks};
  }, [series, width, height]);

  if (series.length === 0 || geom.times.length < 2) {
    return <div ref={containerRef} style={{height}} />;
  }

  const {x, y, yTicks, xTicks, times} = geom;
  const plotRight = width - MARGIN.right;
  const baselineY = y(0);

  const linePath = (s: ResolvedSeries) =>
    s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(2)},${y(p.v).toFixed(2)}`).join('');

  const areaPath = (s: ResolvedSeries) =>
    `${linePath(s)}L${x(s.points[s.points.length - 1].t).toFixed(2)},${baselineY.toFixed(2)}` +
    `L${x(s.points[0].t).toFixed(2)},${baselineY.toFixed(2)}Z`;

  const updateHoverFromPointer = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    const t = geom.t0 + ((px - MARGIN.left) / geom.innerW) * (geom.t1 - geom.t0);
    const idx = nearestIndex(series[0].points, t);
    setHover(idx >= 0 ? idx : null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Escape') return;
    e.preventDefault();
    if (e.key === 'Escape') {
      setHover(null);
      return;
    }
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    setHover((h) => {
      const next = (h ?? (delta > 0 ? -1 : times.length)) + delta;
      return Math.min(times.length - 1, Math.max(0, next));
    });
  };

  const hoverT = hover !== null ? times[hover] : null;
  const hoverX = hoverT !== null ? x(hoverT) : 0;

  return (
    <div
      ref={containerRef}
      className="viz-plot__hitbox"
      tabIndex={0}
      role="img"
      aria-label={`Линейный график: ${series.map((s) => s.name).join(', ')}`}
      onPointerMove={(e) => updateHoverFromPointer(e.clientX)}
      onPointerLeave={() => setHover(null)}
      onKeyDown={onKeyDown}
    >
      <svg ref={svgRef} width={width} height={height} style={{display: 'block'}}>
        {/* Сетка: волосяные линии, рецессивные; подписи — приглушённые чернила. */}
        {yTicks.map((tv) => (
          <g key={tv}>
            <line
              x1={MARGIN.left}
              x2={plotRight}
              y1={y(tv)}
              y2={y(tv)}
              stroke={palette.gridline}
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 8}
              y={y(tv)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily={FONT}
              fill={palette.textMuted}
              style={{fontVariantNumeric: 'tabular-nums'}}
            >
              {yTickFormat(tv)}
            </text>
          </g>
        ))}

        <line
          x1={MARGIN.left}
          x2={plotRight}
          y1={baselineY}
          y2={baselineY}
          stroke={palette.baseline}
          strokeWidth={1}
        />

        {xTicks.map(({t, anchor}) => (
          <text
            key={t}
            x={x(t)}
            y={height - MARGIN.bottom + 16}
            textAnchor={anchor}
            fontSize={11}
            fontFamily={FONT}
            fill={palette.textMuted}
          >
            {xTickFormat(t)}
          </text>
        ))}

        {series.map((s) => (
          <path key={`area-${s.id}`} d={areaPath(s)} fill={s.color} opacity={0.1} />
        ))}
        {series.map((s) => (
          <path
            key={s.id}
            d={linePath(s)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Кроссхейр: волосяная вертикаль + точки значений на снапнутом X. */}
        {hoverT !== null && (
          <g>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={MARGIN.top}
              y2={baselineY}
              stroke={palette.baseline}
              strokeWidth={1}
            />
            {series.map((s) => {
              const idx = nearestIndex(s.points, hoverT);
              if (idx < 0) return null;
              const p = s.points[idx];
              return (
                <circle
                  key={s.id}
                  cx={x(p.t)}
                  cy={y(p.v)}
                  r={4}
                  fill={s.color}
                  stroke={palette.surface}
                  strokeWidth={2}
                />
              );
            })}
          </g>
        )}

        {/* Концевые точки (≥8px, кольцо цвета поверхности) + подписи значений у конца линии. */}
        {series.map((s) => {
          const last = s.points[s.points.length - 1];
          return (
            <g key={`end-${s.id}`}>
              <circle
                cx={x(last.t)}
                cy={y(last.v)}
                r={4}
                fill={s.color}
                stroke={palette.surface}
                strokeWidth={2}
              />
              <text
                x={x(last.t) + 10}
                y={y(last.v)}
                dominantBaseline="middle"
                fontSize={12}
                fontWeight={600}
                fontFamily={FONT}
                fill={palette.textPrimary}
                style={{fontVariantNumeric: 'tabular-nums'}}
              >
                {tooltipValueFormat(last.v)}
              </text>
            </g>
          );
        })}
      </svg>

      {hoverT !== null && (
        <TooltipCard
          left={hoverX}
          top={MARGIN.top}
          side={hoverX > width * 0.6 ? 'left' : 'right'}
          title={tooltipXFormat(hoverT)}
          rows={series.map((s) => {
            const idx = nearestIndex(s.points, hoverT);
            return {
              id: s.id,
              color: s.color,
              name: s.name,
              value: idx >= 0 ? tooltipValueFormat(s.points[idx].v) : '—',
            };
          })}
        />
      )}
    </div>
  );
}
