import React, { useState } from 'react';
import { Tip } from './Tip';

interface Props {
  previous: number[];
  current: number[];
  width: number;
  height: number;
  format: (v: number) => string;
  label: string;
}

/** Мини-график: прошлый период — приглушённый, текущий — акцентный. */
export function Sparkline({ previous, current, width, height, format, label }: Props) {
  const [hover, setHover] = useState<{ i: number; cx: number; cy: number } | null>(null);
  const all = [...previous, ...current];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = 6;
  const x = (i: number) => pad + (i / (all.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (hi === lo ? 0.5 : 1 - (v - lo) / (hi - lo)) * (height - pad * 2);
  const path = (from: number, to: number) =>
    all
      .slice(from, to)
      .map((v, k) => `${k ? 'L' : 'M'}${x(from + k).toFixed(1)} ${y(v).toFixed(1)}`)
      .join('');
  const split = previous.length;
  const last = all.length - 1;

  return (
    <>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={label}
        onPointerMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const i = Math.round(((e.clientX - box.left - pad) / (width - pad * 2)) * last);
          setHover({ i: Math.min(last, Math.max(0, i)), cx: e.clientX, cy: e.clientY });
        }}
        onPointerLeave={() => setHover(null)}
      >
        {/* Прошлый период заканчивается там, где начинается текущий — линия непрерывна. */}
        <path d={path(0, split + 1)} className="spark-prev" />
        <path d={path(split, all.length)} className="spark-now" />
        {hover ? (
          <>
            <circle cx={x(hover.i)} cy={y(all[hover.i])} r={6} className="dot-ring" />
            <circle cx={x(hover.i)} cy={y(all[hover.i])} r={4} className={hover.i >= split ? 'spark-dot' : 'spark-dot-prev'} />
          </>
        ) : (
          <>
            <circle cx={x(last)} cy={y(all[last])} r={6} className="dot-ring" />
            <circle cx={x(last)} cy={y(all[last])} r={4} className="spark-dot" />
          </>
        )}
        <rect width={width} height={height} fill="transparent" />
      </svg>
      {hover && (
        <Tip x={hover.cx} y={hover.cy}>
          <div className="tip__title">{hover.i >= split ? 'Текущий период' : 'Предыдущий период'}</div>
          <div className="tip__row">
            <span className="tip__value">{format(all[hover.i])}</span>
          </div>
        </Tip>
      )}
    </>
  );
}
