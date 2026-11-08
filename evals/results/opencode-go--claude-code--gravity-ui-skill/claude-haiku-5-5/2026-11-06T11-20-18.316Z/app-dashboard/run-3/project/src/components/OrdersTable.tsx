import * as React from 'react';
import {ColumnReorderingProvider, Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Button, Checkbox, Flex, Label, Text} from '@gravity-ui/uikit';

import {
  STATUS_META,
  groupOrdersByStatus,
  isGroup,
  type Order,
  type OrderStatus,
  type TableItem,
} from '../data/orders';
import {formatDateTime, formatMoney} from '../utils/format';

const columns: ColumnDef<TableItem>[] = [
  {
    id: 'select',
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableResizing: false,
    enableSorting: false,
    enableColumnReordering: false,
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
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  {accessorKey: 'id', header: 'Номер', size: 120},
  {accessorKey: 'customer', header: 'Клиент', size: 200},
  {accessorKey: 'product', header: 'Товар', size: 220},
  {accessorKey: 'city', header: 'Город', size: 150},
  {
    accessorKey: 'amount',
    header: 'Сумма',
    size: 130,
    cell: ({getValue}) => (
      <span style={{fontVariantNumeric: 'tabular-nums'}}>{formatMoney(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    size: 160,
    cell: ({getValue}) => {
      const status = getValue<OrderStatus>();
      return <Label theme={STATUS_META[status].theme}>{STATUS_META[status].title}</Label>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Создан',
    size: 170,
    cell: ({getValue}) => formatDateTime(getValue<Date>()),
  },
];

const getGroupTitle = (row: {original: TableItem}) =>
  isGroup(row.original) ? row.original.title : null;

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({orders}: OrdersTableProps) {
  const data = React.useMemo(() => groupOrdersByStatus(orders), [orders]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

  const table = useTable({
    columns,
    data,
    getRowId: (item) => item.id,
    // Group rows are expandable; their children are the orders.
    enableExpanding: true,
    getSubRows: (item) => (isGroup(item) ? item.items : undefined),
    onExpandedChange: setExpanded,
    // Group rows are not selectable: only orders carry a checkbox.
    enableRowSelection: (row) => !isGroup(row.original),
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    state: {expanded, rowSelection, columnOrder},
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <Flex direction="column" gap={3}>
      <Flex alignItems="center" justifyContent="space-between" gap={2}>
        <Text variant="subheader-2">Заказы</Text>
        <Flex alignItems="center" gap={2}>
          <Text variant="body-1" color="secondary">
            Выбрано: {selectedCount}
          </Text>
          <Button
            view="flat"
            size="s"
            disabled={selectedCount === 0}
            onClick={() => table.resetRowSelection()}
          >
            Снять выделение
          </Button>
        </Flex>
      </Flex>

      <ColumnReorderingProvider
        table={table}
        onReorder={({columnOrder: nextOrder}) => setColumnOrder(nextOrder)}
      >
        <div style={{overflow: 'auto', maxWidth: '100%', maxHeight: 'calc(100vh - 280px)'}}>
          <Table table={table} getGroupTitle={getGroupTitle} stickyHeader />
        </div>
      </ColumnReorderingProvider>
    </Flex>
  );
}
