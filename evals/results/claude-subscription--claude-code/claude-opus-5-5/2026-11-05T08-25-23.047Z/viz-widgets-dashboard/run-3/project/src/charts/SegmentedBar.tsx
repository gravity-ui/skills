import React from 'react';

import { useElementSize } from '../useElementSize';
import { ChartTooltip, TooltipRow } from './ChartTooltip';

interface Part {
  name: string;
  value: number;
  color: string;
  /** Text colour for a label inside the fill (white, or near-black on light fills). */
  ink: string;
}

interface Props {
  parts: Part[];
  formatValue: (n: number) => string;
  label: string;
}

const GAP = 2;

/** Tall segmented bar: one whole split into parts, share printed inside when it fits. */
export function SegmentedBar({ parts, formatValue, label }: Props) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  const visible = parts.filter((p) => p.value > 0);
  const usable = width - GAP * (visible.length - 1);
  const share = (p: Part) => `${Math.round((p.value / total) * 100)} %`;

  let offset = 0;
  const blocks = visible.map((p) => {
    const w = (p.value / total) * usable;
    const block = { p, left: offset, w };
    offset += w + GAP;
    return block;
  });

  return (
    <div className="chart">
      <div ref={ref} className="segmented" role="list" aria-label={label}>
        {width > 0 &&
          blocks.map(({ p, left, w }, i) => {
            const text = share(p);
            const fits = w >= text.length * 7.5 + 16;
            return (
              <div
                key={p.name}
                role="listitem"
                tabIndex={0}
                aria-label={`${p.name}: ${formatValue(p.value)}, ${text}`}
                className={`segmented__part${hover === i ? ' segmented__part_hover' : ''}`}
                style={{ left, width: w, background: p.color, color: p.ink }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                {fits && text}
              </div>
            );
          })}
        {hover !== null && blocks[hover] && (
          <ChartTooltip x={blocks[hover].left + blocks[hover].w / 2} y={36} containerWidth={width}>
            <TooltipRow
              color={blocks[hover].p.color}
              shape="rect"
              value={formatValue(blocks[hover].p.value)}
              label={`${blocks[hover].p.name} · ${share(blocks[hover].p)}`}
            />
          </ChartTooltip>
        )}
      </div>
      <div className="chart-legend chart-legend_below">
        {parts.map((p) => (
          <span key={p.name} className="chart-legend__item">
            <span className="chart-key chart-key_rect" style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}
