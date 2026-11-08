import {Table} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

export interface DataTableProps<Row extends Record<string, unknown>> {
  columns: TableColumnConfig<Row>[];
  rows: Row[];
  label: string;
}

/** Scrollable table twin of a chart (the accessibility fallback for every chart widget). */
export function DataTable<Row extends Record<string, unknown>>({columns, rows, label}: DataTableProps<Row>) {
  return (
    <div className="viz-table" role="region" aria-label={label} tabIndex={0}>
      <Table data={rows} columns={columns} width="max" />
    </div>
  );
}
