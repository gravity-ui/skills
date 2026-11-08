import * as React from 'react';
import {
  ColumnReorderingProvider,
  Table,
  TreeExpandableCell,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Checkbox, Flex, Label, Text} from '@gravity-ui/uikit';

import {
  ORDERS,
  Order,
  OrderTableRow,
  STATUS_META,
  STATUS_ORDER,
  StatusGroup,
} from '../data/orders';

const GROUP_ID_PREFIX = 'status:';

const isGroup = (row: OrderTableRow): row is StatusGroup => 'items' in row;

const getRowId = (row: OrderTableRow): string =>
  isGroup(row) ? `${GROUP_ID_PREFIX}${row.status}` : row.id;

const getSubRows = (row: OrderTableRow): OrderTableRow[] | undefined =>
  isGroup(row) ? row.items : undefined;

// Группировка по статусу: строки-группы с заказами внутри (вложенные строки TanStack).
const GROUPED_DATA: OrderTableRow[] = STATUS_ORDER.map((status) => ({
  id: `${GROUP_ID_PREFIX}${status}`,
  status,
  items: ORDERS.filter((order) => order.status === status),
})).filter((group) => group.items.length > 0);

const amountFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const getGroupTitle = (row: Row<OrderTableRow>): React.ReactNode => {
  const group = row.original;
  if (!isGroup(group)) {
    return null;
  }
  return (
    <TreeExpandableCell row={row}>
      {`${STATUS_META[group.status].title} · ${group.items.length}`}
    </TreeExpandableCell>
  );
};

const columns: ColumnDef<OrderTableRow>[] = [
  {
    id: '_select',
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableResizing: false,
    enableSorting: false,
    enableColumnReordering: false,
  },
  {
    id: 'id',
    header: 'Заказ',
    accessorFn: (row) => (isGroup(row) ? '' : row.id),
    cell: ({row}) => (isGroup(row.original) ? null : row.original.id),
    size: 120,
  },
  {
    id: 'customer',
    header: 'Клиент',
    accessorFn: (row) => (isGroup(row) ? '' : row.customer),
    cell: ({row}) => (isGroup(row.original) ? null : row.original.customer),
    size: 220,
  },
  {
    id: 'amount',
    header: 'Сумма',
    accessorFn: (row) => (isGroup(row) ? 0 : row.amount),
    cell: ({row}) =>
      isGroup(row.original) ? null : amountFormatter.format(row.original.amount),
    size: 140,
  },
  {
    id: 'createdAt',
    header: 'Дата',
    accessorFn: (row) => (isGroup(row) ? '' : row.createdAt),
    cell: ({row}) => (isGroup(row.original) ? null : row.original.createdAt),
    size: 130,
  },
  {
    id: 'status',
    header: 'Статус',
    accessorFn: (row) => (isGroup(row) ? '' : row.status),
    cell: ({row}) => {
      const order: Order | StatusGroup = row.original;
      if (isGroup(order)) {
        return null;
      }
      const meta = STATUS_META[order.status];
      return <Label theme={meta.theme}>{meta.title}</Label>;
    },
    size: 160,
  },
];

export function OrdersTable() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);

  // Для вложенных строк родительский чекбокс считается корректно только через эту обёртку.
  const handleRowSelectionChange = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: GROUPED_DATA,
    getSubRows,
    getRowId,
  });

  const table = useTable<OrderTableRow>({
    columns,
    data: GROUPED_DATA,
    getRowId,
    getSubRows,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableExpanding: true,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    state: {rowSelection, expanded},
  });

  const selectedOrdersCount = Object.entries(rowSelection).filter(
    ([id, selected]) => selected && !id.startsWith(GROUP_ID_PREFIX),
  ).length;

  return (
    <Flex direction="column" gap={3}>
      <Text variant="body-1">
        Выбрано заказов: {selectedOrdersCount} из {ORDERS.length}
      </Text>
      <div style={{overflow: 'auto', maxHeight: 'calc(100vh - 220px)'}}>
        <ColumnReorderingProvider table={table}>
          <Table
            table={table}
            size="m"
            stickyHeader
            getIsGroupHeaderRow={(row) => isGroup(row.original)}
            getGroupTitle={getGroupTitle}
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
