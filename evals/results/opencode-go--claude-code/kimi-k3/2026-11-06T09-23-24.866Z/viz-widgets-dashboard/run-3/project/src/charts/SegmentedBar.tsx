import { useMemo, useState } from 'react';
import { useSize } from './useSize';
import type { BarItem } from '../data';

const SERIES_COLORS = [
  'var(--viz-series-1)',
  'var(--viz-series-2)',
  'var(--viz-series-3)',
  'var(--viz-series-4)',
  'var(--viz-series-5)',
];
// Тёмный текст на жёлтом (по luminance), белый на остальных
const DARK_TEXT_ON = new Set([3]);

const BAR_H = 28; // высокая сегментная полоса
const GAP = 2; // surface gap между сегментами

/** Одно целое, разбитое на части: высокая сегментная полоса + легенда имён. */
export function SegmentedBar({ items }: { items: BarItem[] }) {
  const [wrapRef, { width }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const total = useMemo(() => items.reduce((a, b) => a + b.value, 0), [items]);

  if (width < 80) return <div ref={wrapRef} className="viz-chart__plot" />;

  let cursor = 0;
  const segs = items.map((item, i) => {
    const w = (item.value / total) * width;
    const seg = { item, i, x: cursor, w, share: (item.value / total) * 100 };
    cursor += w;
    return seg;
  });

  return (
    <div className="viz-chart" ref={wrapRef} style={{ justifyContent: 'center' }}>
      <div className="viz-chart__plot" style={{ flex: 'none', height: BAR_H, position: 'relative' }}>
        <svg width={width} height={BAR_H} role="img" aria-label="Доли источников трафика">
          {segs.map(({ item, i, x, w, share }) => {
            const label = `${share.toFixed(1).replace('.', ',')}%`;
            const fits = w > 44;
            return (
              <g
                key={item.name}
                onPointerMove={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${item.name}: ${label}`}
                style={{ outline: 'none' }}
              >
                <rect
                  x={x + (i > 0 ? GAP / 2 : 0)}
                  y={0}
                  width={Math.max(0, w - (i > 0 && i < segs.length - 1 ? GAP : GAP / 2))}
                  height={BAR_H}
                  rx={4}
                  fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
                {fits && (
                  <text
                    x={x + (i > 0 ? GAP / 2 : 0) + 8}
                    y={BAR_H / 2 + 4}
                    fontSize={12}
                    fontWeight={600}
                    fill={DARK_TEXT_ON.has(i) ? '#0b0b0b' : '#ffffff'}
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div
            className="viz-chart__tooltip"
            style={{ left: Math.max(70, Math.min(width - 70, segs[hover].x + segs[hover].w / 2)), top: BAR_H + 6 }}
          >
            <div className="viz-chart__tooltip-row">
              <span
                className="viz-chart__tooltip-key"
                style={{ background: SERIES_COLORS[hover % SERIES_COLORS.length] }}
              />
              <span className="viz-chart__tooltip-name">{segs[hover].item.name}</span>
              <span className="viz-chart__tooltip-value">
                {segs[hover].share.toFixed(1).replace('.', ',')}%
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="viz-legend">
        {items.map((item, i) => (
          <span className="viz-legend__item" key={item.name}>
            <span
              className="viz-legend__key-swatch"
              style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
