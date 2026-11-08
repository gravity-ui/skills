import { useState } from 'react';

import { useElementSize } from '../useElementSize';
import { ChartTooltip, INK_ON_SERIES, Legend, SERIES, textWidth } from './common';

interface SegmentedBarProps {
  parts: { name: string; value: number }[];
  formatValue: (v: number) => string;
  ariaLabel: string;
}

const GAP = 2;
const pct = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 0 });

/** Целое, разбитое на части: высокая сегментированная полоса (до 5 частей). */
export function SegmentedBar({ parts, formatValue, ariaLabel }: SegmentedBarProps) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const visible = parts.filter((p) => p.value > 0);
  const free = Math.max(0, width - GAP * (visible.length - 1));

  let offset = 0;
  const blocks = parts.map((p, i) => {
    const w = p.value > 0 ? (p.value / total) * free : 0;
    const block = { ...p, i, x: offset, w, share: p.value / total };
    if (w > 0) offset += w + GAP;
    return block;
  });

  const hovered = hover !== null ? blocks[hover] : null;

  return (
    <div className="viz-segmented">
      <div className="viz-segmented__bar" ref={ref} role="group" aria-label={ariaLabel}>
        {width > 0 &&
          blocks.map(
            (b) =>
              b.w > 0 && (
                <div
                  key={b.name}
                  className="viz-segmented__part viz-focusable"
                  tabIndex={0}
                  role="img"
                  aria-label={`${b.name}: ${formatValue(b.value)}, ${pct.format(b.share)}`}
                  style={{
                    left: b.x,
                    width: b.w,
                    background: SERIES[b.i],
                    color: INK_ON_SERIES[b.i],
                    opacity: hover !== null && hover !== b.i ? 0.55 : 1,
                  }}
                  onPointerEnter={() => setHover(b.i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(b.i)}
                  onBlur={() => setHover(null)}
                >
                  {textWidth(pct.format(b.share)) + 16 <= b.w && pct.format(b.share)}
                </div>
              ),
          )}
        {hovered && (
          <ChartTooltip
            x={hovered.x + hovered.w / 2}
            y={36}
            containerWidth={width}
            title={hovered.name}
            rows={[
              {
                key: 'v',
                color: SERIES[hovered.i],
                keyShape: 'rect',
                value: formatValue(hovered.value),
                label: pct.format(hovered.share),
              },
            ]}
          />
        )}
      </div>
      <Legend items={parts.map((p, i) => ({ name: p.name, color: SERIES[i] }))} shape="rect" />
    </div>
  );
}
