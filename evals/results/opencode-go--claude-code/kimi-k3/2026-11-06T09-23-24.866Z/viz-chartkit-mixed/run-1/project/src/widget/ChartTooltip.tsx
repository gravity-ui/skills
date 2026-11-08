/**
 * Shared hover tooltip: value leads (strong), series name follows,
 * series keyed by a short color stroke — never a filled box.
 * All text goes through React text nodes (never innerHTML).
 */

export interface TooltipEntry {
  color: string;
  name: string;
  value: string;
}

export interface ChartTooltipProps {
  /** Snapped pointer position inside the chart wrapper, px. */
  x: number;
  y: number;
  containerWidth: number;
  /** X-axis label for the snapped position (a date/time). */
  title: string;
  entries: TooltipEntry[];
}

const FLIP_ZONE = 240;

export function ChartTooltip({x, y, title, entries, containerWidth}: ChartTooltipProps) {
  const flip = x > containerWidth - FLIP_ZONE;
  const style: React.CSSProperties = flip
    ? {right: containerWidth - x + 12, top: Math.max(8, y - 16)}
    : {left: x + 12, top: Math.max(8, y - 16)};
  return (
    <div className="ck-tooltip" style={style} role="status">
      <div className="ck-tooltip__title">{title}</div>
      {entries.map((e) => (
        <div className="ck-tooltip__row" key={e.name}>
          <span className="ck-tooltip__key" style={{background: e.color}} />
          <span className="ck-tooltip__name">{e.name}</span>
          <strong className="ck-tooltip__value">{e.value}</strong>
        </div>
      ))}
    </div>
  );
}
