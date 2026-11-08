import { useRef, useState } from 'react';

import { useElementSize } from '../dashboard/useElementSize';
import { ChartTooltip, tooltipPosition } from './chartParts';

interface Props {
  items: { name: string; value: number }[];
  color: string;
  format: (v: number) => string;
}

const BAR_MAX = 24;
const RADIUS = 4;

/** Горизонтальный бар: квадратный у базовой линии, скруглённый на конце данных. */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, h / 2, w);
  if (w <= 0) return '';
  return [
    `M${x} ${y}`,
    `h${w - r}`,
    `a${r} ${r} 0 0 1 ${r} ${r}`,
    `v${h - 2 * r}`,
    `a${r} ${r} 0 0 1 ${-r} ${r}`,
    `h${-(w - r)}`,
    'z',
  ].join(' ');
}

export function BarChart({ items, color, format }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(ref);
  const [hover, setHover] = useState<number | null>(null);

  const n = items.length;
  const longest = items.reduce((m, it) => Math.max(m, it.name.length), 0);
  const left = Math.min(150, Math.max(56, longest * 6.6 + 12));
  const M = { top: 6, right: 64, bottom: 6, left };
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;

  if (innerW <= 20 || innerH <= 10 || n === 0) return <div ref={ref} className="viz-chart" />;

  const max = Math.max(1, ...items.map((i) => i.value));
  const band = innerH / n;
  const barH = Math.max(4, Math.min(BAR_MAX, band * 0.62));
  const x0 = M.left;
  const xAt = (v: number) => x0 + (v / max) * innerW;
  const yCenter = (i: number) => M.top + band * i + band / 2;

  return (
    <div ref={ref} className="viz-chart">
      <svg width={width} height={height} aria-hidden="true">
        <line x1={x0} x2={x0} y1={M.top} y2={M.top + innerH} stroke="var(--viz-axis)" strokeWidth={1} />
        {items.map((it, i) => {
          const y = yCenter(i) - barH / 2;
          const w = Math.max(0, xAt(it.value) - x0);
          const active = hover === i;
          return (
            <g key={it.name}>
              <text className="viz-label" x={x0 - 8} y={yCenter(i)} textAnchor="end" dominantBaseline="middle">
                {it.name}
              </text>
              <path d={barPath(x0, y, w, barH)} fill={color} fillOpacity={active ? 0.78 : 1} />
              <text className="viz-value" x={xAt(it.value) + 8} y={yCenter(i)} dominantBaseline="middle">
                {format(it.value)}
              </text>
              <rect
                x={0}
                y={M.top + band * i}
                width={width}
                height={band}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${it.name}: ${format(it.value)}`}
                style={{ outline: 'none' }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <ChartTooltip
          rows={[{ name: items[hover].name, value: format(items[hover].value), color, kind: 'rect' }]}
          style={tooltipPosition(xAt(items[hover].value), yCenter(hover) - 10, width, 170)}
        />
      )}
    </div>
  );
}
