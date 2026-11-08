import type { ReactNode } from 'react';

export interface TooltipRow {
  name: string;
  value: string;
  color?: string;
  keyShape?: 'line' | 'rect';
}

interface Props {
  x: number;
  y: number;
  width: number; // ширина контейнера, чтобы не вылезать вправо
  title?: ReactNode;
  rows: TooltipRow[];
}

const TIP_WIDTH = 160;

/** Тултип графика: значение — главное, имя серии — второстепенное. */
export function ChartTooltip({ x, y, width, title, rows }: Props) {
  const flip = x + TIP_WIDTH + 24 > width;
  const style = flip ? { right: Math.max(0, width - x + 12), top: y } : { left: x + 12, top: y };
  return (
    <div className="viz-tooltip" style={style} role="status">
      {title != null && <div className="viz-tooltip__title">{title}</div>}
      {rows.map((r) => (
        <div key={r.name} className="viz-tooltip__row">
          {r.color && (
            <span
              className={`viz-tooltip__key${r.keyShape === 'rect' ? ' viz-tooltip__key_rect' : ''}`}
              style={{ background: r.color }}
            />
          )}
          <span className="viz-tooltip__value">{r.value}</span>
          <span className="viz-tooltip__name">{r.name}</span>
        </div>
      ))}
    </div>
  );
}
