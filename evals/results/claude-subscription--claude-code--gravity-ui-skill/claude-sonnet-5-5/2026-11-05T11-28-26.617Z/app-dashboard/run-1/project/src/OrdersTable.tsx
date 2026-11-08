import React from 'react';
import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {
  ColumnDef,
  ColumnOrderState,
  ExpandedState,
  Row,
  RowSelectionState,
} from '@gravity-ui/table/tanstack';
import {Flex, Label, Text} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {
  ORDERS,
  STATUS_LABEL,
  STATUS_TITLE,
  groupByStatus,
  isGroup,
  type OrderRow,
  type OrderStatus,
} from './data';

const STATUS_THEME: Record<OrderStatus, LabelProps['theme']> = {
  new: 'info',
  processing: 'warning',
  shipped: 'utility',
  delivered: 'success',
  cancelled: 'danger',
};

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU');

const columns: ColumnDef<OrderRow>[] = [
  selectionColumn as ColumnDef<OrderRow>,
  {id: 'id', header: 'Заказ', size: 130, accessorFn: (r) => (isGroup(r) ? '' : r.id)},
  {id: 'customer', header: 'Клиент', size: 220, accessorFn: (r) => (isGroup(r) ? '' : r.customer)},
  {id: 'city', header: 'Город', size: 180, accessorFn: (r) => (isGroup(r) ? '' : r.city)},
  {
    id: 'status',
    header: 'Статус',
    size: 160,
    accessorFn: (r) => (isGroup(r) ? '' : r.status),
    cell: ({row}) =>
      isGroup(row.original) ? null : (
        <Label theme={STATUS_THEME[row.original.status]} size="s">
          {STATUS_LABEL[row.original.status]}
        </Label>
      ),
  },
  {
    id: 'amount',
    header: 'Сумма',
    size: 140,
    accessorFn: (r) => (isGroup(r) ? 0 : r.amount),
    cell: ({row}) => (isGroup(row.original) ? null : currency.format(row.original.amount)),
  },
  {
    id: 'createdAt',
    header: 'Создан',
    size: 130,
    accessorFn: (r) => (isGroup(r) ? '' : r.createdAt),
    cell: ({row}) => (isGroup(row.original) ? null : dateFormat.format(new Date(row.original.createdAt))),
  },
];

const getRowId = (row: OrderRow) => row.id;
const getSubRows = (row: OrderRow) => (isGroup(row) ? row.items : undefined);

const getGroupTitle = (row: Row<OrderRow>) => {
  const original = row.original;
  if (!isGroup(original)) return null;
  return (
    <Flex alignItems="center" gap={2}>
      <Text variant="subheader-2">{STATUS_TITLE[original.status]}</Text>
      <Text variant="body-1" color="secondary">
        {original.items.length}
      </Text>
    </Flex>
  );
};

export function OrdersTable() {
  const data = React.useMemo(() => groupByStatus(ORDERS), []);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() =>
    columns.map((c, i) => (i === 0 ? '_select' : (c.id as string))),
  );

  const handleRowSelectionChange = useRowSelectionFixedHandler<OrderRow>({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable({
    columns,
    data,
    getRowId,
    getSubRows,
    enableExpanding: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,
    state: {rowSelection, expanded, columnOrder},
  });

  const selectedCount = Object.keys(rowSelection).filter((id) => !id.startsWith('group:')).length;

  return (
    <Flex direction="column" gap={3} style={{flex: 1, minHeight: 0}}>
      <Flex alignItems="center" justifyContent="space-between" style={{flexShrink: 0}}>
        <Text variant="body-1" color="secondary">
          {selectedCount > 0 ? `Выбрано заказов: ${selectedCount}` : 'Перетаскивайте заголовки, чтобы менять порядок колонок'}
        </Text>
      </Flex>
      <div style={{flex: 1, minHeight: 0, overflow: 'auto'}}>
        <ColumnReorderingProvider table={table}>
          <Table table={table} getGroupTitle={getGroupTitle} stickyHeader />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
