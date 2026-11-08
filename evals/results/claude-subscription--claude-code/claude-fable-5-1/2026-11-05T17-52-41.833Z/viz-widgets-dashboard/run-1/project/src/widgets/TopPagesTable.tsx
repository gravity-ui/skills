import { Table, type TableColumnConfig } from '@gravity-ui/uikit';

import { formatDuration, formatNumber, formatPercent, topPages } from './data';

type Row = (typeof topPages)[number];

const columns: TableColumnConfig<Row>[] = [
  { id: 'path', name: 'Страница', primary: true },
  { id: 'views', name: 'Просмотры', align: 'end', template: (r) => formatNumber(r.views) },
  { id: 'avgTime', name: 'Время', align: 'end', template: (r) => formatDuration(r.avgTime) },
  { id: 'bounce', name: 'Отказы', align: 'end', template: (r) => formatPercent(r.bounce) },
];

export function TopPagesTable() {
  return (
    <div className="viz__table">
      <Table data={topPages} columns={columns} width="max" aria-label="Популярные страницы" />
    </div>
  );
}
