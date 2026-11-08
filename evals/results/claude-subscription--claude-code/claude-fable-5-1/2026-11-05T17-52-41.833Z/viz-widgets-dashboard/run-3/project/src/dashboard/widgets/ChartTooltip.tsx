import type * as React from 'react';

export interface TooltipRow {
  /** Series / category name (untrusted text, rendered as text only). */
  name: string;
  value: string;
  /** CSS color of the series key; omit for a plain row. */
  color?: string;
  /** 'line' draws a short stroke, 'rect' a swatch. */
  keyShape?: 'line' | 'rect';
}

interface ChartTooltipProps {
  /** Pointer position relative to the chart container. */
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  rows: TooltipRow[];
}

const OFFSET = 12;
const EST_WIDTH = 190;
const ROW_HEIGHT = 20;

/** Positioned readout that flips to stay inside its container. Values lead, names follow. */
export function ChartTooltip({x, y, width, height, title, rows}: ChartTooltipProps) {
  const estHeight = ROW_HEIGHT * (rows.length + (title ? 1 : 0)) + 16;
  const left = x + OFFSET + EST_WIDTH > width ? Math.max(0, x - OFFSET - EST_WIDTH) : x + OFFSET;
  const top = Math.max(0, Math.min(y - estHeight / 2, height - estHeight));
  const style: React.CSSProperties = {transform: `translate(${Math.round(left)}px, ${Math.round(top)}px)`};

  return (
    <div className="viz-tooltip" role="status" style={style}>
      {title ? <div className="viz-tooltip__title">{title}</div> : null}
      {rows.map((row) => (
        <div key={row.name} className="viz-tooltip__row">
          {row.color ? (
            <span className={`viz-tooltip__key viz-tooltip__key_${row.keyShape ?? 'line'}`} style={{background: row.color}} />
          ) : (
            <span className="viz-tooltip__key viz-tooltip__key_empty" />
          )}
          <strong className="viz-tooltip__value">{row.value}</strong>
          <span className="viz-tooltip__name">{row.name}</span>
        </div>
      ))}
    </div>
  );
}
