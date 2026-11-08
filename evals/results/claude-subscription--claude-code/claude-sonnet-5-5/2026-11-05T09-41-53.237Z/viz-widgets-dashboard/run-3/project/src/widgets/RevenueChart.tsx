import React, { useRef, useState } from 'react';
import type { DashboardData } from '../data';
import { compact, longDate, niceTicks, rub, shortDate } from '../format';
import { useElementSize } from '../useElementSize';
import { Tip } from './Tip';

const M = { top: 10, right: 16, bottom: 24, left: 52 };

export function RevenueChart({ data }: { data: DashboardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(ref);
  const [hover, setHover] = useState<number | null>(null);
  const focused = useRef(false);

  const cur = data.current;
  const prev = data.previous;
  const n = cur.length;
  const curV = cur.map((d) => d.revenue);
  const prevV = prev.map((d) => d.revenue);

  const ticks = niceTicks(Math.min(...curV, ...prevV), Math.max(...curV, ...prevV), 4);
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];

  const iw = Math.max(width - M.left - M.right, 1);
  const ih = Math.max(height - M.top - M.bottom, 1);
  const x = (i: number) => M.left + (i / (n - 1)) * iw;
  const y = (v: number) => M.top + ih - ((v - lo) / (hi - lo)) * ih;
  const path = (vs: number[]) => vs.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

  const step = Math.max(1, Math.ceil(72 / (iw / (n - 1))));
  const xTicks = cur.map((_, i) => i).filter((i) => (n - 1 - i) % step === 0);

  const moveTo = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - M.left) / iw) * (n - 1));
    setHover(Math.min(Math.max(i, 0), n - 1));
  };

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'Home' ? -n : e.key === 'End' ? n : 0;
    if (!d) return;
    e.preventDefault();
    setHover((h) => Math.min(Math.max((h ?? n - 1) + d, 0), n - 1));
  };

  const ready = width > 160 && height > 90;
  const flip = hover !== null && x(hover) > width - 190;

  return (
    <div className="chart">
      <div className="legend" aria-label="Легенда">
        <span className="legend__item">
          <svg width="16" height="4" aria-hidden><line x1="0" x2="16" y1="2" y2="2" className="line-cur" /></svg>
          Текущий период
        </span>
        <span className="legend__item">
          <svg width="16" height="4" aria-hidden><line x1="0" x2="16" y1="2" y2="2" className="line-prev" /></svg>
          Предыдущий период
        </span>
      </div>
      <div ref={ref} className="chart__area">
        {ready && (
          <svg
            width={width}
            height={height}
            role="group"
            tabIndex={0}
            aria-label={`Выручка по дням за ${data.range} дней. Стрелки влево и вправо выбирают день.`}
            onKeyDown={onKey}
            onFocus={(e) => {
              // Клавиатурный фокус показывает последний день; клик мышью — нет.
              focused.current = e.currentTarget.matches(':focus-visible');
              if (focused.current) setHover((h) => h ?? n - 1);
            }}
            onBlur={() => {
              focused.current = false;
              setHover(null);
            }}
            className="chart__svg"
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} className={t === lo ? 'axis' : 'grid-line'} />
                <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="tick">
                  {t === 0 ? '0' : compact(t)}
                </text>
              </g>
            ))}
            {xTicks.map((i) => (
              <text key={i} x={x(i)} y={height - 6} textAnchor="middle" className="tick">
                {shortDate(cur[i].date)}
              </text>
            ))}

            <path d={path(prevV)} className="line-prev" fill="none" />
            <path d={path(curV)} className="line-cur" fill="none" />

            {hover === null ? (
              <circle cx={x(n - 1)} cy={y(curV[n - 1])} r="4" className="dot dot_cur" />
            ) : (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + ih} className="crosshair" />
                <circle cx={x(hover)} cy={y(prevV[hover])} r="4" className="dot dot_prev" />
                <circle cx={x(hover)} cy={y(curV[hover])} r="4" className="dot dot_cur" />
              </g>
            )}

            <rect
              x={M.left}
              y={0}
              width={iw}
              height={height - M.bottom + 8}
              fill="transparent"
              onPointerMove={(e) => moveTo(e.clientX, e.currentTarget)}
              onPointerDown={(e) => moveTo(e.clientX, e.currentTarget)}
              onPointerLeave={() => !focused.current && setHover(null)}
            />
          </svg>
        )}
        {ready && hover !== null && (
          <Tip
            x={x(hover)}
            y={M.top + 4}
            placement={flip ? 'left' : 'right'}
            title={longDate(cur[hover].date)}
            rows={[
              { color: 'var(--series-1)', value: rub(curV[hover]), label: 'Текущий период' },
              { color: 'var(--muted)', dashed: true, value: rub(prevV[hover]), label: `Было ${shortDate(prev[hover].date)}` },
            ]}
          />
        )}
      </div>
      <table className="sr-only">
        <caption>Выручка по дням, ₽</caption>
        <thead>
          <tr><th>Дата</th><th>Текущий период</th><th>Предыдущий период</th></tr>
        </thead>
        <tbody>
          {cur.map((d, i) => (
            <tr key={i}><td>{longDate(d.date)}</td><td>{rub(curV[i])}</td><td>{rub(prevV[i])}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

