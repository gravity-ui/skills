import {useMemo} from 'react';
import {formatDateTime} from './format';
import {alignSeries} from './math';
import type {Series} from './types';

// Табличный двойник графика: единственный путь к значениям для тех, кто не видит цвет
// и не может навести курсор. Показываем последние строки, чтобы плотный ряд не вешал DOM.
const MAX_ROWS = 200;

interface DataTableProps {
  series: readonly Series[];
  formatValue: (value: number) => string;
}

export function DataTable({series, formatValue}: DataTableProps) {
  const {times, columns} = useMemo(() => alignSeries(series), [series]);

  const rows: number[] = [];
  for (let k = times.length - 1; k >= 0 && rows.length < MAX_ROWS; k--) rows.push(k);

  return (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <caption>
          {times.length === 0
            ? 'Нет данных'
            : `Последние ${rows.length} из ${times.length} точек, от новых к старым`}
        </caption>
        <thead>
          <tr>
            <th scope="col">Время</th>
            {series.map((s) => (
              <th scope="col" key={s.id}>
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((k) => (
            <tr key={times[k]}>
              <th scope="row">{formatDateTime(times[k])}</th>
              {columns.map((column, i) => (
                <td key={series[i].id}>{column[k] === null ? '—' : formatValue(column[k])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
