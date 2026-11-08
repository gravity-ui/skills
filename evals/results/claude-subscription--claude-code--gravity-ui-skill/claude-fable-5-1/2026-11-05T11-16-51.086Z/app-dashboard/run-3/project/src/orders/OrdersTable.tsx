import React from 'react';
import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef, ColumnReorderingProviderProps} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState, SortingState} from '@gravity-ui/table/tanstack';
import {Button, Flex, Label, Switch, Text} from '@gravity-ui/uikit';

import {
  STATUS_TITLES,
  currencyFormatter,
  dateFormatter,
  generateOrders,
  groupOrdersByStatus,
  isOrderGroup,
} from './data';
import type {Order, OrderRow, OrderStatus} from './data';

const STATUS_LABEL_THEME: Record<OrderStatus, 'info' | 'warning' | 'utility' | 'success' | 'danger'> = {
  new: 'info',
  processing: 'warning',
  shipped: 'utility',
  delivered: 'success',
  cancelled: 'danger',
};

const orderValue = <T,>(row: OrderRow, pick: (order: Order) => T): T | undefined =>
  isOrderGroup(row) ? undefined : pick(row);

const columns: ColumnDef<OrderRow>[] = [
  {
    ...(selectionColumn as ColumnDef<OrderRow>),
    enableColumnReordering: false,
  },
  {
    id: 'number',
    accessorFn: (row) => orderValue(row, (order) => order.number),
    header: 'Номер',
    size: 110,
    enableSorting: true,
  },
  {
    id: 'customer',
    accessorFn: (row) => orderValue(row, (order) => order.customer),
    header: 'Клиент',
    size: 220,
    enableSorting: true,
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: 'Статус',
    size: 150,
    enableSorting: true,
    cell: ({row}) =>
      isOrderGroup(row.original) ? null : (
        <Label theme={STATUS_LABEL_THEME[row.original.status]} size="xs">
          {STATUS_TITLES[row.original.status]}
        </Label>
      ),
  },
  {
    id: 'total',
    accessorFn: (row) => orderValue(row, (order) => order.total),
    header: 'Сумма',
    size: 140,
    enableSorting: true,
    cell: ({row}) =>
      isOrderGroup(row.original) ? null : (
        <Text variant="body-1" style={{display: 'block', textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>
          {currencyFormatter.format(row.original.total)}
        </Text>
      ),
  },
  {
    id: 'itemsCount',
    accessorFn: (row) => orderValue(row, (order) => order.itemsCount),
    header: 'Позиций',
    size: 110,
    enableSorting: true,
    cell: ({row}) =>
      isOrderGroup(row.original) ? null : (
        <Text variant="body-1" style={{display: 'block', textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>
          {row.original.itemsCount}
        </Text>
      ),
  },
  {
    id: 'city',
    accessorFn: (row) => orderValue(row, (order) => order.city),
    header: 'Город',
    size: 170,
    enableSorting: true,
  },
  {
    id: 'createdAt',
    accessorFn: (row) => orderValue(row, (order) => order.createdAt),
    header: 'Создан',
    size: 160,
    enableSorting: true,
    cell: ({row}) =>
      isOrderGroup(row.original) ? null : dateFormatter.format(new Date(row.original.createdAt)),
  },
];

const ORDERS: Order[] = generateOrders(120);
const GROUPED_ORDERS = groupOrdersByStatus(ORDERS);

const getRowId = (row: OrderRow) => row.id;
const getSubRows = (row: OrderRow) => (isOrderGroup(row) ? row.items : undefined);
const getIsGroupHeaderRow = (row: Row<OrderRow>) => isOrderGroup(row.original);
const getGroupTitle = (row: Row<OrderRow>) => {
  const group = row.original;
  if (!isOrderGroup(group)) {
    return null;
  }
  return (
    <Flex gap={2} alignItems="center">
      <Text variant="subheader-1">{STATUS_TITLES[group.status]}</Text>
      <Text variant="body-1" color="secondary">
        {group.items.length}
      </Text>
    </Flex>
  );
};

export function OrdersTable() {
  const [groupByStatus, setGroupByStatus] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

  const data = React.useMemo<OrderRow[]>(() => (groupByStatus ? GROUPED_ORDERS : ORDERS), [groupByStatus]);

  // Keeps parent (group) checkboxes consistent with their children when rows are nested.
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
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    enableExpanding: groupByStatus,
    onExpandedChange: setExpanded,
    enableSorting: true,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    state: {
      rowSelection,
      expanded: groupByStatus ? expanded : {},
      sorting,
      columnOrder,
    },
  });

  const handleColumnReorder = React.useCallback<
    NonNullable<ColumnReorderingProviderProps<OrderRow>['onReorder']>
  >(({columnOrder: nextOrder}) => {
    setColumnOrder(nextOrder);
  }, []);

  const selectedOrdersCount = React.useMemo(
    () => Object.entries(rowSelection).filter(([id, selected]) => selected && id.startsWith('order-')).length,
    [rowSelection],
  );

  return (
    <Flex direction="column" gap={3} style={{flex: 1, minHeight: 0}}>
      <Flex alignItems="center" gap={4} wrap="wrap" style={{flexShrink: 0}}>
        <Switch
          size="m"
          checked={groupByStatus}
          onUpdate={setGroupByStatus}
          content="Группировать по статусу"
        />
        <Text variant="body-1" color="secondary">
          Выбрано заказов: {selectedOrdersCount}
        </Text>
        <Button view="flat" size="m" disabled={selectedOrdersCount === 0} onClick={() => setRowSelection({})}>
          Снять выделение
        </Button>
        <Button view="flat" size="m" disabled={columnOrder.length === 0} onClick={() => setColumnOrder([])}>
          Сбросить порядок колонок
        </Button>
      </Flex>
      <div style={{flex: 1, minHeight: 0, overflow: 'auto', maxWidth: '100%'}}>
        <ColumnReorderingProvider table={table} onReorder={handleColumnReorder}>
          <Table
            table={table}
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            getGroupTitle={getGroupTitle}
            emptyContent={
              <Text variant="body-1" color="secondary">
                Заказов пока нет
              </Text>
            }
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
