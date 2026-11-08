import { useState } from 'react';

import { useElementSize } from '../useElementSize';
import { ChartTooltip, barPath, textWidth } from './common';

interface BarChartProps {
  items: { name: string; value: number }[];
  color: string;
  formatValue: (v: number) => string;
  formatTooltip: (v: number, share: number) => string;
  ariaLabel: string;
}

/** Горизонтальные столбцы: одна серия, один цвет, значение у конца столбца. */
export function BarChart({ items, color, formatValue, formatTooltip, ariaLabel }: BarChartProps) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const total = items.reduce((s, it) => s + it.value, 0);
  const max = Math.max(...items.map((it) => it.value), 1);
  const labelW = Math.min(Math.max(...items.map((it) => textWidth(it.name))) + 12, width * 0.42);
  const valueW = Math.max(...items.map((it) => textWidth(formatValue(it.value)))) + 12;
  const plotX = labelW;
  const plotW = Math.max(0, width - labelW - valueW);
  const rowH = items.length ? height / items.length : 0;
  const barH = Math.min(24, Math.max(6, rowH * 0.56));

  return (
    <div className="viz-chart">
      <div className="viz-chart__plot" ref={ref}>
        {width > 0 && height > 0 && (
          <svg width={width} height={height} role="group" aria-label={ariaLabel}>
            {items.map((it, i) => {
              const cy = i * rowH + rowH / 2;
              const w = Math.max(1, (it.value / max) * plotW);
              const dim = hover !== null && hover !== i;
              return (
                <g
                  key={it.name}
                  tabIndex={0}
                  role="img"
                  aria-label={`${it.name}: ${formatTooltip(it.value, it.value / total)}`}
                  className="viz-focusable"
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                >
                  {/* Цель для наведения — вся строка, а не только закрашенные пиксели */}
                  <rect x={0} y={i * rowH} width={width} height={rowH} fill="transparent" />
                  <text x={0} y={cy} dy="0.32em" className="viz-cat-label">
                    {clip(it.name, labelW - 12)}
                  </text>
                  <path
                    d={barPath(plotX, cy - barH / 2, w, barH)}
                    fill={color}
                    opacity={dim ? 0.45 : 1}
                    style={{ transition: 'opacity 120ms' }}
                  />
                  <text x={plotX + w + 6} y={cy} dy="0.32em" className="viz-value-label">
                    {formatValue(it.value)}
                  </text>
                </g>
              );
            })}
            <line x1={plotX} x2={plotX} y1={0} y2={height} className="viz-axis" />
          </svg>
        )}
        {hover !== null && items[hover] && (
          <ChartTooltip
            x={plotX + Math.max(1, (items[hover].value / max) * plotW)}
            y={Math.max(0, hover * rowH + rowH / 2 - 30)}
            containerWidth={width}
            title={items[hover].name}
            rows={[
              {
                key: 'v',
                color,
                keyShape: 'rect',
                value: formatTooltip(items[hover].value, items[hover].value / total),
                label: '',
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

function clip(s: string, maxW: number): string {
  if (textWidth(s) <= maxW) return s;
  let out = s;
  while (out.length > 1 && textWidth(out + '…') > maxW) out = out.slice(0, -1);
  return out + '…';
}
