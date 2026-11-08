import React from 'react';
import { Table, type TableColumnConfig } from '@gravity-ui/uikit';

type Row = Record<string, string>;

export interface TableView {
  columns: { id: string; name: string; align?: 'start' | 'end' }[];
  rows: Row[];
}

interface Props {
  view: TableView;
  renderCell?: Record<string, (value: string, row: Row) => React.ReactNode>;
}

/** Plain table; also the table view every chart offers, so no value is reachable only by hover. */
export function DataTable({ view, renderCell = {} }: Props) {
  const columns: TableColumnConfig<Row>[] = view.columns.map((c) => ({
    id: c.id,
    name: c.name,
    align: c.align ?? 'start',
    template: renderCell[c.id] ? (row) => renderCell[c.id](row[c.id], row) : undefined,
  }));
  return (
    <div className="data-table">
      <Table columns={columns} data={view.rows} width="max" />
    </div>
  );
}
