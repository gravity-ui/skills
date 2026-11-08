import React from 'react';

import './charts.css';

/** Категориальные слоты в фиксированном порядке (проверены валидатором палитры). */
export const SERIES = ['var(--viz-series-1)', 'var(--viz-series-2)', 'var(--viz-series-3)', 'var(--viz-series-4)', 'var(--viz-series-5)'];

/** Цвет подписи внутри заливки: белый, кроме жёлтого слота. */
export const INK_ON_SERIES = ['#ffffff', '#ffffff', '#ffffff', '#0b0b0b', '#ffffff'];

export function niceTicks(max: number, count: number): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.ceil(max / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return ticks;
}

/** Грубая оценка ширины текста 12px системного шрифта — для раскладки подписей. */
export const textWidth = (s: string, px = 12) => s.length * px * 0.58;

/** Прямоугольник со скруглённым «данным» концом справа и прямым у базовой линии. */
export function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  const rr = Math.max(0, Math.min(r, h / 2, w));
  return `M${x},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h - rr}Q${x + w},${y + h} ${x + w - rr},${y + h}H${x}Z`;
}

export interface TooltipRow {
  key: string;
  color: string;
  value: string;
  label: string;
  /** Ключ серии: линия для линий, квадрат для заливок. */
  keyShape?: 'line' | 'rect';
}

export function ChartTooltip({
  x,
  y,
  containerWidth,
  title,
  rows,
}: {
  x: number;
  y: number;
  containerWidth: number;
  title?: string;
  rows: TooltipRow[];
}) {
  const flip = x > containerWidth / 2;
  return (
    <div
      className="viz-tooltip"
      role="presentation"
      style={{
        left: x,
        top: y,
        transform: flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
      }}
    >
      {title && <div className="viz-tooltip__title">{title}</div>}
      {rows.map((r) => (
        <div key={r.key} className="viz-tooltip__row">
          <span
            className={`viz-tooltip__key viz-tooltip__key_${r.keyShape ?? 'line'}`}
            style={{ background: r.color }}
          />
          <span className="viz-tooltip__value">{r.value}</span>
          <span className="viz-tooltip__label">{r.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items, shape }: { items: { name: string; color: string }[]; shape: 'line' | 'rect' }) {
  return (
    <ul className="viz-legend">
      {items.map((it) => (
        <li key={it.name} className="viz-legend__item">
          <span className={`viz-legend__key viz-legend__key_${shape}`} style={{ background: it.color }} />
          {it.name}
        </li>
      ))}
    </ul>
  );
}
