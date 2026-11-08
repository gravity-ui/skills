import React from 'react';

import {
  ColumnReorderingProvider,
  type ColumnReorderingProviderProps,
  Table,
  useRowSelectionFixedHandler,
  useTable,
  type ColumnDef,
} from '@gravity-ui/table';
import type {
  ExpandedState,
  RowSelectionState,
} from '@gravity-ui/table/tanstack';
import {Checkbox, Flex, Label, Text} from '@gravity-ui/uikit';

import {
  ORDERS,
  STATUS_META,
  groupOrdersByStatus,
  isOrderGroup,
  type OrderTableItem,
} from '../data/orders';

const amountFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const getSubRows = (item: OrderTableItem) => (isOrderGroup(item) ? item.items : undefined);
const getRowId = (item: OrderTableItem) => item.id;

/*
 * Custom selection column: checkboxes without ranged (Shift+click) selection —
 * ranged selection is undefined behavior for grouped/nested rows.
 * Parent-checkbox state is fixed by `useRowSelectionFixedHandler` below.
 */
const groupedSelectionColumn: ColumnDef<OrderTableItem> = {
  id: '_select',
  header: ({table}) => (
    <Checkbox
      size="l"
      checked={table.getIsAllRowsSelected()}
      disabled={!table.options.enableRowSelection}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({row}) => (
    <Checkbox
      size="l"
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      indeterminate={row.getIsSomeSelected()}
      onChange={row.getToggleSelectedHandler()}
    />
  ),
  size: 41,
  minSize: 41,
  maxSize: 41,
  enableResizing: false,
  enableSorting: false,
  enableColumnReordering: false,
};

const columns: ColumnDef<OrderTableItem>[] = [
  groupedSelectionColumn,
  {
    accessorFn: (item) => (isOrderGroup(item) ? '' : item.number),
    id: 'number',
    header: 'Заказ',
    size: 150,
    withNestingStyles: true,
  },
  {
    accessorFn: (item) => (isOrderGroup(item) ? '' : item.customer),
    id: 'customer',
    header: 'Клиент',
    size: 240,
  },
  {
    accessorFn: (item) => (isOrderGroup(item) ? '' : item.city),
    id: 'city',
    header: 'Город',
    size: 180,
  },
  {
    accessorFn: (item) => (isOrderGroup(item) ? '' : item.createdAt),
    id: 'createdAt',
    header: 'Дата',
    size: 130,
  },
  {
    accessorFn: (item) => (isOrderGroup(item) ? 0 : item.amount),
    id: 'amount',
    header: 'Сумма',
    size: 150,
    cell: (info) => {
      const item = info.row.original;
      if (isOrderGroup(item)) {
        return null;
      }
      return amountFormatter.format(item.amount);
    },
  },
  {
    accessorFn: (item) => STATUS_META[item.status].title,
    id: 'status',
    header: 'Статус',
    size: 170,
    cell: (info) => {
      const item = info.row.original;
      if (isOrderGroup(item)) {
        return null;
      }
      const meta = STATUS_META[item.status];
      return <Label theme={meta.theme}>{meta.title}</Label>;
    },
  },
];

export function OrdersTable() {
  const data = React.useMemo(() => groupOrdersByStatus(ORDERS), []);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

  // Fixes parent-row checkbox state when selection is combined with grouping
  // (https://github.com/TanStack/table/issues/4878)
  const handleRowSelectionChange = useRowSelectionFixedHandler<OrderTableItem>({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable({
    columns,
    data,
    enableExpanding: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getSubRows,
    getRowId,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,
    state: {
      rowSelection,
      expanded,
      columnOrder,
    },
  });

  const handleColumnReorder = React.useCallback<
    NonNullable<ColumnReorderingProviderProps<OrderTableItem>['onReorder']>
  >(({columnOrder: nextOrder}) => {
    setColumnOrder(nextOrder);
  }, []);

  // Nested order rows get ids like `group-new.order-7`; group rows keep bare `group-*` ids.
  const selectedOrdersCount = Object.keys(rowSelection).filter((key) =>
    key.includes('order-'),
  ).length;

  return (
    <Flex direction="column" gap={3} className="orders-table">
      <Text variant="body-2" color="secondary">
        Выбрано заказов: {selectedOrdersCount}. Строки выделяются галочками, колонки
        перетаскиваются за заголовки, группы сворачиваются по клику.
      </Text>
      <div className="orders-table__scroll">
        <ColumnReorderingProvider table={table} onReorder={handleColumnReorder}>
          <Table
            table={table}
            size="s"
            stickyHeader
            getIsGroupHeaderRow={(row) => row.getCanExpand()}
            getGroupTitle={(row) => {
              const item = row.original;
              return isOrderGroup(item) ? STATUS_META[item.status].title : row.id;
            }}
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
