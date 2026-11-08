import * as React from 'react';

import { useElementSize } from './useElementSize';

export interface BarDatum {
  name: string;
  value: number;
}

export interface BarChartProps {
  data: BarDatum[];
  formatValue: (value: number) => string;
  color?: string;
}

const LABEL_W = 132;
const BAR_MAX = 24;
const GAP = 2;

/** Горизонтальные ранжированные столбцы: один цвет, значение у вершины, тултип на наведении. */
export function BarChart({ data, formatValue, color = 'var(--viz-series-1)' }: BarChartProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);

  const width = size.width;
  const height = size.height;
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const valueW = 64;
  const plotW = Math.max(0, width - LABEL_W - valueW);
  const slot = n > 0 ? height / n : 0;
  const bar = Math.min(BAR_MAX, Math.max(6, slot - GAP * 2 - 6));

  const barPath = (x: number, y: number, w: number, h: number) => {
    const r = Math.min(4, w, h / 2);
    return `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`;
  };

  const hovered = hover !== null ? data[hover] : null;

  return (
    <div className="viz-chart" ref={ref}>
      {width > 0 && height > 0 && (
        <svg className="viz-svg" width={width} height={height} role="img" aria-label="Столбчатая диаграмма">
          <line x1={LABEL_W} x2={LABEL_W} y1={0} y2={height} className="viz-axis" />
          {data.map((d, i) => {
            const y = i * slot + (slot - bar) / 2;
            const w = (d.value / max) * plotW;
            return (
              <g
                key={d.name}
                className="viz-bar-row"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                tabIndex={0}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${d.name}: ${formatValue(d.value)}`}
              >
                <rect x={0} y={i * slot} width={width} height={slot} fill="transparent" />
                <text x={LABEL_W - 10} y={y + bar / 2} dy="0.35em" textAnchor="end" className="viz-cat">
                  {d.name}
                </text>
                <path d={barPath(LABEL_W, y, Math.max(0, w), bar)} fill={color} opacity={hover === null || hover === i ? 1 : 0.55} />
                <text x={LABEL_W + w + 8} y={y + bar / 2} dy="0.35em" className="viz-label">
                  {formatValue(d.value)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {hovered && hover !== null && (
        <div className="viz-tooltip" style={{ left: LABEL_W + (hovered.value / max) * plotW, top: hover * slot }} role="status">
          <div className="viz-tooltip__row">
            <span className="viz-key" style={{ background: color }} aria-hidden="true" />
            <span className="viz-tooltip__value">{formatValue(hovered.value)}</span>
            <span className="viz-tooltip__name">{hovered.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
