import * as React from 'react';

import { useElementSize } from './useElementSize';

export interface Segment {
  name: string;
  value: number;
  color: string;
  /** Текст внутри блока: белый или почти чёрный (для жёлтого) */
  ink?: 'light' | 'dark';
}

const HEIGHT = 28;
const GAP = 2;
const CHAR_W = 7.2;

/** Высокая сегментная полоса: одно целое, разбитое на части; доля печатается внутри, если помещается. */
export function SegmentedBar({ segments, formatShare }: { segments: Segment[]; formatShare: (share: number) => string }) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const width = size.width;
  const visible = segments.filter((s) => s.value > 0);
  const usable = width - GAP * (visible.length - 1);

  let cursor = 0;
  const blocks = visible.map((seg, i) => {
    const share = seg.value / total;
    const w = share * usable;
    const x = cursor;
    cursor += w + GAP;
    const text = formatShare(share);
    const fits = w >= text.length * CHAR_W + 16;
    return { seg, share, x, w, text, fits, i };
  });

  const hovered = hover !== null ? blocks[hover] : null;

  return (
    <div className="viz-segbar" ref={ref}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={`Распределение: ${visible.map((s) => s.name).join(', ')}`}>
          {blocks.map((b) => (
            <g
              key={b.seg.name}
              tabIndex={0}
              aria-label={`${b.seg.name}: ${b.text}`}
              onPointerEnter={() => setHover(b.i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(b.i)}
              onBlur={() => setHover(null)}
            >
              <rect x={b.x} y={0} width={Math.max(0, b.w)} height={HEIGHT} rx={4} fill={b.seg.color} opacity={hover === null || hover === b.i ? 1 : 0.6} />
              {b.fits && (
                <text x={b.x + 8} y={HEIGHT / 2} dy="0.35em" className={`viz-inside viz-inside_${b.seg.ink ?? 'light'}`}>
                  {b.text}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}
      {hovered && (
        <div className="viz-tooltip" style={{ left: hovered.x + hovered.w / 2, top: HEIGHT + 4 }} role="status">
          <div className="viz-tooltip__row">
            <span className="viz-key" style={{ background: hovered.seg.color }} aria-hidden="true" />
            <span className="viz-tooltip__value">{hovered.text}</span>
            <span className="viz-tooltip__name">{hovered.seg.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
