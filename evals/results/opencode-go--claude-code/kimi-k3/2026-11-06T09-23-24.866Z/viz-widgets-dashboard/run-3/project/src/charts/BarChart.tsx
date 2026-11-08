import { useMemo, useState } from 'react';
import { useSize } from './useSize';
import { formatNumber, type BarItem } from '../data';

const LABEL_W = 96;
const VALUE_W = 52;
const PAD = { top: 4, bottom: 4, right: 8 };
const BAR_H = 20; // тонкие полосы (<= 24px)

/** Ранжированные горизонтальные полосы, один оттенок (sequential blue step 450). */
export function BarChart({ items }: { items: BarItem[] }) {
  const [plotRef, { width, height }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);
  const max = Math.max(...sorted.map((i) => i.value), 1);

  const innerW = Math.max(0, width - LABEL_W - VALUE_W - PAD.right);
  const rowH = sorted.length ? (height - PAD.top - PAD.bottom) / sorted.length : 0;
  const barW = (v: number) => Math.max(2, (v / max) * innerW);

  if (width < 120 || height < 60)
    return (
      <div className="viz-chart">
        <div ref={plotRef} className="viz-chart__plot" />
      </div>
    );

  return (
    <div className="viz-chart">
      <div className="viz-chart__plot" ref={plotRef}>
        <svg width={width} height={height} role="img" aria-label="Продажи по категориям">
          {sorted.map((item, i) => {
            const cy = PAD.top + rowH * i + rowH / 2;
            const w = barW(item.value);
            const labelFits = w > 60;
            return (
              <g
                key={item.name}
                onPointerMove={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                style={{ outline: 'none' }}
              >
                {/* hit-зона шире самой полосы */}
                <rect
                  x={0}
                  y={PAD.top + rowH * i}
                  width={width}
                  height={rowH}
                  fill="transparent"
                />
                <text
                  x={LABEL_W - 8}
                  y={cy + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill="var(--viz-text-secondary)"
                >
                  {item.name}
                </text>
                {/* полоса: квадрат у базовой линии, скруглённый конец данных */}
                <path
                  d={barPath(LABEL_W, cy - BAR_H / 2, w, BAR_H)}
                  fill="var(--viz-series-1)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
                {/* значение у конца полосы; внутрь — только если помещается */}
                {labelFits ? (
                  <text
                    x={LABEL_W + w - 6}
                    y={cy + 4}
                    textAnchor="end"
                    fontSize={11}
                    fontWeight={600}
                    fill="#ffffff"
                  >
                    {formatNumber(item.value)}
                  </text>
                ) : (
                  <text
                    x={LABEL_W + w + 6}
                    y={cy + 4}
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--viz-text)"
                  >
                    {formatNumber(item.value)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div
            className="viz-chart__tooltip"
            style={{ left: Math.min(width - 80, LABEL_W + barW(sorted[hover].value) + 20), top: PAD.top + rowH * hover }}
          >
            <div className="viz-chart__tooltip-row">
              <span className="viz-chart__tooltip-name">{sorted[hover].name}</span>
              <span className="viz-chart__tooltip-value">{formatNumber(sorted[hover].value)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function barPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, h / 2, w);
  return [
    `M${x},${y}`,
    `H${x + w - r}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `V${y + h - r}`,
    `Q${x + w},${y + h} ${x + w - r},${y + h}`,
    `H${x}`,
    'Z',
  ].join('');
}
