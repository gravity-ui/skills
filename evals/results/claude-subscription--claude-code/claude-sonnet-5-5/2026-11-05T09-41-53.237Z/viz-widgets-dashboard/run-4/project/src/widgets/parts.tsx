import React from 'react';

export interface TableData {
  columns: { key: string; title: string; align?: 'end' }[];
  rows: Record<string, string>[];
}

/** Табличное представление любого графика: каждое значение доступно без наведения. */
export function DataTable({ data, label }: { data: TableData; label: string }) {
  return (
    <div className="scroll" tabIndex={0} role="region" aria-label={label}>
      <table className="table">
        <thead>
          <tr>
            {data.columns.map((c) => (
              <th key={c.key} scope="col" className={c.align === 'end' ? 'is-end' : undefined}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={i}>
              {data.columns.map((c) => (
                <td key={c.key} className={c.align === 'end' ? 'is-end' : undefined}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
