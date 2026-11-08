import type { CSSProperties, ReactNode } from 'react';

export interface Series {
  name: string;
  color: string;
  values: number[];
}

export function Legend({ items, kind = 'line' }: { items: { name: string; color: string }[]; kind?: 'line' | 'rect' }) {
  return (
    <div className="viz-legend" role="list">
      {items.map((it) => (
        <span className="viz-legend__item" role="listitem" key={it.name}>
          <span className={`viz-legend__key${kind === 'rect' ? ' viz-legend__key_rect' : ''}`} style={{ background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  );
}

export interface TooltipRow {
  name: string;
  value: string;
  color: string;
  kind?: 'line' | 'rect';
}

export function ChartTooltip({ title, rows, style }: { title?: string; rows: TooltipRow[]; style: CSSProperties }) {
  return (
    <div className="viz-tooltip" style={style} role="status">
      {title && <div className="viz-tooltip__title">{title}</div>}
      {rows.map((r) => (
        <div className="viz-tooltip__row" key={r.name}>
          <span className={`viz-tooltip__key${r.kind === 'rect' ? ' viz-tooltip__key_rect' : ''}`} style={{ background: r.color }} />
          <span className="viz-tooltip__value">{r.value}</span>
          <span className="viz-tooltip__name">{r.name}</span>
        </div>
      ))}
    </div>
  );
}

/** Позиция тултипа рядом с точкой x: справа, а у правого края — слева. */
export function tooltipPosition(x: number, y: number, width: number, boxWidth = 180): CSSProperties {
  const left = x + 14 + boxWidth > width ? Math.max(0, x - 14 - boxWidth) : x + 14;
  return { left, top: Math.max(0, y) };
}

/** Табличное представление данных графика — всегда доступно без наведения. */
export function DataTable({
  rowHeader,
  rows,
  columns,
  format,
}: {
  rowHeader: string;
  rows: string[];
  columns: { name: string; values: number[] }[];
  format: (v: number) => string;
}) {
  return (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <thead>
          <tr>
            <th scope="col">{rowHeader}</th>
            {columns.map((c) => (
              <th scope="col" key={c.name}>
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((label, i) => (
            <tr key={label + i}>
              <th scope="row" style={{ fontWeight: 400, color: 'var(--viz-ink)', position: 'static' }}>
                {label}
              </th>
              {columns.map((c) => (
                <td key={c.name}>{format(c.values[i])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartFrame({ children }: { children: ReactNode }) {
  return <div className="viz-chart">{children}</div>;
}
