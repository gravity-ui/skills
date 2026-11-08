import React, { useMemo, useRef, useState } from 'react';
import { fmtCompact, fmtDateLong, fmtDateShort, fmtInt, niceTicks } from '../format';
import { Tip, TipRow } from './Tip';

export interface LineSeries {
  id: string;
  name: string;
  color: string;
  values: number[];
}

interface Props {
  dates: Date[];
  series: LineSeries[];
  width: number;
  height: number;
  label: string;
}

const M = { top: 10, bottom: 26, left: 42 };
const LEGEND_H = 26;

export function LineChart({ dates, series, width, height, label }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ i: number; cx: number; cy: number } | null>(null);

  const n = dates.length;
  const plotH = Math.max(0, height - LEGEND_H);
  const max = Math.max(...series.flatMap((s) => s.values));
  const ticks = useMemo(() => niceTicks(max), [max]);
  const top = ticks[ticks.length - 1];
  const compactAxis = top >= 10_000;
  const fmtTick = compactAxis ? fmtCompact : fmtInt;

  // Прямые подписи на правом конце — только если линии не слиплись и хватает места.
  const roomRight = width >= 440 ? 88 : 14;
  const innerW = Math.max(0, width - M.left - roomRight);
  const innerH = Math.max(0, plotH - M.top - M.bottom);
  const x = (i: number) => M.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => M.top + innerH - (v / top) * innerH;

  const endLabels = useMemo(() => {
    if (roomRight < 80) return null;
    const ys = series
      .map((s) => ({ s, y: y(s.values[n - 1]) }))
      .sort((a, b) => a.y - b.y);
    const collide = ys.some((p, k) => k > 0 && p.y - ys[k - 1].y < 16);
    return collide ? null : ys;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, innerH, top, roomRight, n]);

  // Подписи оси X: не чаще, чем раз в ~72px, последняя дата всегда подписана.
  const xTicks = useMemo(() => {
    const count = Math.max(2, Math.floor(innerW / 72));
    const step = Math.max(1, Math.ceil((n - 1) / (count - 1)));
    const out: number[] = [];
    for (let i = n - 1; i >= 0; i -= step) out.unshift(i);
    return out;
  }, [innerW, n]);

  const setFromPointer = (e: React.PointerEvent) => {
    const box = svgRef.current!.getBoundingClientRect();
    const px = e.clientX - box.left;
    const i = Math.min(n - 1, Math.max(0, Math.round(((px - M.left) / innerW) * (n - 1))));
    setHover({ i, cx: e.clientX, cy: e.clientY });
  };

  const onKey = (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (e.key === 'Escape') return setHover(null);
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      return focusAt(e.key === 'Home' ? 0 : n - 1);
    }
    if (!delta) return;
    e.preventDefault();
    focusAt(Math.min(n - 1, Math.max(0, (hover?.i ?? n) + delta)));
  };

  const focusAt = (i: number) => {
    const box = svgRef.current!.getBoundingClientRect();
    setHover({ i, cx: box.left + x(i), cy: box.top + M.top + innerH / 2 });
  };

  if (width < 120 || plotH < 90) return null;

  const hi = hover?.i;

  return (
    <div className="linechart">
      <ul className="legend" style={{ height: LEGEND_H }}>
        {series.map((s) => (
          <li key={s.id} className="legend__item">
            <span className="legend__line" style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
      <svg
        ref={svgRef}
        width={width}
        height={plotH}
        className="linechart__svg"
        role="img"
        tabIndex={0}
        aria-label={`${label}. Стрелки влево и вправо — перебор дат.`}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
        onPointerMove={setFromPointer}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={M.left}
              x2={M.left + innerW}
              y1={y(t)}
              y2={y(t)}
              className={t === 0 ? 'axis-line' : 'grid-line'}
            />
            <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="axis-text">
              {fmtTick(t)}
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text key={i} x={x(i)} y={M.top + innerH + 17} textAnchor="middle" className="axis-text">
            {fmtDateShort(dates[i])}
          </text>
        ))}

        {series.map((s) => (
          <path
            key={s.id}
            d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('')}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {endLabels?.map(({ s, y: ly }) => (
          <text key={s.id} x={x(n - 1) + 12} y={ly} dy="0.32em" className="end-label">
            {s.name}
          </text>
        ))}

        {hi === undefined ? (
          // Концевые точки в покое. Кольцо цвета поверхности (r=6) под точкой (r=4).
          series.map((s) => (
            <g key={s.id}>
              <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r={6} className="dot-ring" />
              <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r={4} fill={s.color} />
            </g>
          ))
        ) : (
          <g pointerEvents="none">
            <line x1={x(hi)} x2={x(hi)} y1={M.top} y2={M.top + innerH} className="crosshair" />
            {series.map((s) => (
              <g key={s.id}>
                <circle cx={x(hi)} cy={y(s.values[hi])} r={6} className="dot-ring" />
                <circle cx={x(hi)} cy={y(s.values[hi])} r={4} fill={s.color} />
              </g>
            ))}
          </g>
        )}
        {/* Прозрачная область ловит указатель на всей ширине графика, а не только на самих линиях */}
        <rect x={M.left} y={M.top} width={innerW} height={innerH} fill="transparent" />
      </svg>

      {hover && (
        <Tip x={hover.cx} y={hover.cy}>
          <div className="tip__title">{fmtDateLong(dates[hover.i])}</div>
          {series.map((s) => (
            <TipRow key={s.id} color={s.color} name={s.name} value={fmtInt(s.values[hover.i])} />
          ))}
        </Tip>
      )}
    </div>
  );
}
