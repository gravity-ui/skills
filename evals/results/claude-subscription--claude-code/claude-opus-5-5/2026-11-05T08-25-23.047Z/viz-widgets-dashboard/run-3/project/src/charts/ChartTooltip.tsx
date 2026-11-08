import React from 'react';

interface Props {
  /** Anchor point relative to the positioned chart wrapper. */
  x: number;
  y: number;
  containerWidth: number;
  children: React.ReactNode;
}

/** Floating readout inside a `position: relative` chart wrapper; flips left near the right edge. */
export function ChartTooltip({ x, y, containerWidth, children }: Props) {
  const flip = x > containerWidth / 2;
  return (
    <div
      className="chart-tooltip"
      role="status"
      style={{
        top: Math.max(0, y),
        ...(flip ? { right: containerWidth - x + 12 } : { left: x + 12 }),
      }}
    >
      {children}
    </div>
  );
}

export function TooltipRow({ color, value, label, shape = 'line' }: { color?: string; value: string; label: string; shape?: 'line' | 'rect' }) {
  return (
    <div className="chart-tooltip__row">
      {color && <span className={`chart-key chart-key_${shape}`} style={{ background: color }} />}
      <span className="chart-tooltip__value">{value}</span>
      <span className="chart-tooltip__label">{label}</span>
    </div>
  );
}
