import React from 'react';

import { useElementSize } from '../useElementSize';
import { ChartTooltip, TooltipRow } from './ChartTooltip';

interface Props {
  items: { name: string; value: number }[];
  formatValue: (n: number) => string;
  /** Formats the full-precision value shown in the tooltip. */
  formatExact?: (n: number) => string;
  color: string;
  label: string;
}

/** Ranked horizontal bars, one series → one colour; value at the bar tip. */
export function BarList({ items, formatValue, formatExact = formatValue, color, label }: Props) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<{ index: number; x: number; y: number } | null>(null);
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((a, b) => a + b.value, 0);
  const rowH = height / Math.max(1, items.length);
  const thickness = Math.max(6, Math.min(24, rowH - 10));
  const labelW = Math.min(Math.round(width * 0.38), 120);

  const show = (index: number, el: HTMLElement) => {
    const box = el.getBoundingClientRect();
    const host = (el.closest('.chart__plot') as HTMLElement).getBoundingClientRect();
    // Anchor the readout just past the bar tip.
    const tip = labelW + (width - labelW - 64) * (items[index].value / max) + 8;
    setHover({ index, x: box.left - host.left + tip, y: box.top - host.top });
  };

  return (
    <div className="chart">
      <div ref={ref} className="chart__plot">
        <ul className="bar-list" aria-label={label} style={{ gridTemplateColumns: `${labelW}px 1fr` }}>
          {items.map((it, i) => (
            <li
              key={it.name}
              className={`bar-list__row${hover?.index === i ? ' bar-list__row_hover' : ''}`}
              tabIndex={0}
              aria-label={`${it.name}: ${formatExact(it.value)}`}
              onPointerEnter={(e) => show(i, e.currentTarget)}
              onPointerLeave={() => setHover(null)}
              onFocus={(e) => show(i, e.currentTarget)}
              onBlur={() => setHover(null)}
            >
              <span className="bar-list__label" title={it.name}>
                {it.name}
              </span>
              <span className="bar-list__track">
                <span
                  className="bar-list__bar"
                  style={{ height: thickness, background: color, width: `calc((100% - 64px) * ${it.value / max})` }}
                />
                <span className="bar-list__value">{formatValue(it.value)}</span>
              </span>
            </li>
          ))}
        </ul>
        {hover && (
          <ChartTooltip x={hover.x} y={hover.y} containerWidth={width}>
            <div className="chart-tooltip__title">{items[hover.index].name}</div>
            <TooltipRow
              color={color}
              shape="rect"
              value={formatExact(items[hover.index].value)}
              label={`${((items[hover.index].value / total) * 100).toFixed(1).replace('.', ',')} % от общей`}
            />
          </ChartTooltip>
        )}
      </div>
    </div>
  );
}
