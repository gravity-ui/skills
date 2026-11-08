import type {ChartSeries} from './types';

export interface DataTableProps {
  series: ChartSeries[];
  formatValue: (v: number) => string;
  formatTime: (t: number) => string;
  /** Dense series are sampled down to this many rows. */
  maxRows?: number;
}

/**
 * The table view — every tooltip value stays reachable without hovering.
 * Series are assumed to share one timeline (engines align their points);
 * dense monitoring data is sampled evenly to `maxRows`.
 */
export function DataTable({series, formatValue, formatTime, maxRows = 120}: DataTableProps) {
  const timeline = series[0]?.points ?? [];
  const step = Math.max(1, Math.ceil(timeline.length / maxRows));
  const rows: number[] = [];
  for (let i = 0; i < timeline.length; i += step) rows.push(i);
  if (timeline.length && rows[rows.length - 1] !== timeline.length - 1) {
    rows.push(timeline.length - 1);
  }

  return (
    <div className="ck-table-wrap">
      <table className="ck-table">
        <thead>
          <tr>
            <th>Время</th>
            {series.map((s) => (
              <th key={s.id}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={timeline[i].t}>
              <td>{formatTime(timeline[i].t)}</td>
              {series.map((s) => (
                <td key={s.id}>{formatValue(s.points[i]?.v ?? NaN)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
