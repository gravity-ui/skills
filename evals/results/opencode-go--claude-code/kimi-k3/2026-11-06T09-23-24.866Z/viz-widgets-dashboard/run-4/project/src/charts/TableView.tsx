import type {ReactNode} from 'react';

export interface TableColumn {
  key: string;
  title: string;
  numeric?: boolean;
}

interface TableViewProps {
  columns: TableColumn[];
  rows: ReactNode[][];
  ariaLabel: string;
}

/** The WCAG-clean twin every chart ships with. */
export function TableView({columns, rows, ariaLabel}: TableViewProps) {
  return (
    <div className="tv-scroll">
      <table className="tv" aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.numeric ? 'tv-num' : undefined} scope="col">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) =>
                j === 0 ? (
                  <th key={columns[j].key} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={columns[j].key} className={columns[j].numeric ? 'tv-num' : undefined}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
