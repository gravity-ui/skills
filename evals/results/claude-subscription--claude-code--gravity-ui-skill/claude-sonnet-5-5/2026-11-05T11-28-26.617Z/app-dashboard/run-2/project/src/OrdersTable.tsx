import React from 'react';

import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Label, Text} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {STATUS_TITLE, groupByStatus, isGroup} from './data';
import type {Order, OrderRow, OrderStatus} from './data';

const STATUS_THEME: Record<OrderStatus, LabelProps['theme']> = {
  new: 'info',
  processing: 'warning',
  shipped: 'utility',
  delivered: 'success',
  cancelled: 'danger',
};

const currency = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'medium'});

const columns: ColumnDef<OrderRow>[] = [
  {
    ...(selectionColumn as ColumnDef<OrderRow>),
    // The checkbox column stays pinned to the left edge.
    enableColumnReordering: false,
  },
  {
    id: 'number',
    header: 'Заказ',
    size: 120,
    cell: ({row}) => (isGroup(row.original) ? null : <Text variant="body-2">{row.original.number}</Text>),
  },
  {
    id: 'customer',
    header: 'Клиент',
    size: 220,
    cell: ({row}) => (isGroup(row.original) ? null : row.original.customer),
  },
  {
    id: 'status',
    header: 'Статус',
    size: 160,
    cell: ({row}) =>
      isGroup(row.original) ? null : (
        <Label theme={STATUS_THEME[row.original.status]}>{STATUS_TITLE[row.original.status]}</Label>
      ),
  },
  {
    id: 'items',
    header: 'Позиций',
    size: 110,
    cell: ({row}) => (isGroup(row.original) ? null : row.original.items),
  },
  {
    id: 'amount',
    header: 'Сумма',
    size: 160,
    cell: ({row}) => (isGroup(row.original) ? null : currency.format(row.original.amount)),
  },
  {
    id: 'createdAt',
    header: 'Создан',
    size: 160,
    cell: ({row}) =>
      isGroup(row.original) ? null : dateFormat.format(new Date(row.original.createdAt)),
  },
];

const getRowId = (row: OrderRow) => row.id;
const getSubRows = (row: OrderRow) => (isGroup(row) ? row.rows : undefined);
const getIsGroupHeaderRow = (row: Row<OrderRow>) => isGroup(row.original);
const getGroupTitle = (row: Row<OrderRow>) =>
  isGroup(row.original) ? STATUS_TITLE[row.original.status] : row.id;

export interface OrdersTableProps {
  orders: Order[];
  grouped: boolean;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

export function OrdersTable({orders, grouped, rowSelection, onRowSelectionChange}: OrdersTableProps) {
  // `true` expands every group; individual groups can still be toggled from the header.
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);

  const data = React.useMemo<OrderRow[]>(
    () => (grouped ? groupByStatus(orders) : orders),
    [grouped, orders],
  );

  const handleRowSelectionChange = useRowSelectionFixedHandler<OrderRow>({
    rowSelection,
    setRowSelection: onRowSelectionChange,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable<OrderRow>({
    columns,
    data,
    getRowId,
    getSubRows,
    enableExpanding: grouped,
    enableRowSelection: (row) => !isGroup(row.original),
    enableMultiRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    state: {rowSelection, expanded},
  });

  return (
    <ColumnReorderingProvider table={table}>
      <Table
        table={table}
        stickyHeader
        getIsGroupHeaderRow={getIsGroupHeaderRow}
        getGroupTitle={getGroupTitle}
        emptyContent="Заказов нет"
      />
    </ColumnReorderingProvider>
  );
}
