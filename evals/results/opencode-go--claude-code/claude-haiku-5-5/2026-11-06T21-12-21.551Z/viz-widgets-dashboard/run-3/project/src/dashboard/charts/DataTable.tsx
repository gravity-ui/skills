// The table-view twin of a chart: every value the chart shows, in text.

interface Props {
  caption: string;
  head: string[];
  rows: string[][];
}

export function DataTable({ caption, head, rows }: Props) {
  return (
    <div className="dt-scroll">
      <table className="dt">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={i === 0 ? undefined : 'num'}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} className={i === 0 ? undefined : 'num'}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
