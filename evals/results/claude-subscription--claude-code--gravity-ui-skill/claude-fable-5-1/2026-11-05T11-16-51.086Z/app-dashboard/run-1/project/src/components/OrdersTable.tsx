import React from 'react';
import { ColumnReorderingProvider, Table, selectionColumn, useRowSelectionFixedHandler, useTable } from '@gravity-ui/table';
import type { ColumnDef } from '@gravity-ui/table';
import type { ExpandedState, Row, RowSelectionState, SortingState } from '@gravity-ui/table/tanstack';
import { Button, Flex, Icon, Label, Switch, Text, TextInput } from '@gravity-ui/uikit';
import { Magnifier, Xmark } from '@gravity-ui/icons';

import {
  PAYMENT_LABELS,
  STATUS_LABELS,
  groupOrdersByStatus,
  isOrderGroup,
  type Order,
  type OrderStatus,
  type OrdersRow,
} from '../data/orders';

import './OrdersTable.css';

const STATUS_THEME: Record<OrderStatus, 'info' | 'warning' | 'utility' | 'success' | 'danger'> = {
  new: 'info',
  processing: 'warning',
  shipped: 'utility',
  delivered: 'success',
  cancelled: 'danger',
};

const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const getRowId = (row: OrdersRow) => row.id;
const getSubRows = (row: OrdersRow) => (isOrderGroup(row) ? row.items : undefined);

// Cell helper: group header rows are rendered via getGroupTitle, so cells only ever see orders.
const orderCell =
  (render: (order: Order) => React.ReactNode) =>
  ({ row }: { row: Row<OrdersRow> }) =>
    isOrderGroup(row.original) ? null : render(row.original);

const columns: ColumnDef<OrdersRow>[] = [
  { ...(selectionColumn as ColumnDef<OrdersRow>), enableColumnReordering: false },
  {
    id: 'number',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.number),
    header: 'Номер',
    size: 110,
    enableSorting: true,
    cell: orderCell((order) => (
      <Text variant="body-1" color="primary" className="orders-table__mono">
        {order.number}
      </Text>
    )),
  },
  {
    id: 'customer',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.customer),
    header: 'Клиент',
    size: 240,
    enableSorting: true,
    cell: orderCell((order) => (
      <Flex direction="column" className="orders-table__customer">
        <Text variant="body-1" ellipsis>
          {order.customer}
        </Text>
        <Text variant="caption-2" color="secondary" ellipsis>
          {order.email}
        </Text>
      </Flex>
    )),
  },
  {
    id: 'status',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.status),
    header: 'Статус',
    size: 150,
    enableSorting: true,
    cell: orderCell((order) => (
      <Label theme={STATUS_THEME[order.status]} size="xs">
        {STATUS_LABELS[order.status]}
      </Label>
    )),
  },
  {
    id: 'itemsCount',
    accessorFn: (row) => (isOrderGroup(row) ? 0 : row.itemsCount),
    header: 'Позиций',
    size: 100,
    enableSorting: true,
    cell: orderCell((order) => <span className="orders-table__num">{order.itemsCount}</span>),
  },
  {
    id: 'total',
    accessorFn: (row) => (isOrderGroup(row) ? 0 : row.total),
    header: 'Сумма',
    size: 140,
    enableSorting: true,
    cell: orderCell((order) => <span className="orders-table__num">{currency.format(order.total)}</span>),
  },
  {
    id: 'payment',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.payment),
    header: 'Оплата',
    size: 120,
    enableSorting: true,
    cell: orderCell((order) => PAYMENT_LABELS[order.payment]),
  },
  {
    id: 'city',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.city),
    header: 'Город',
    size: 170,
    enableSorting: true,
    cell: orderCell((order) => order.city),
  },
  {
    id: 'createdAt',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.createdAt),
    header: 'Создан',
    size: 140,
    enableSorting: true,
    cell: orderCell((order) => (
      <Text variant="body-1" color="secondary" className="orders-table__mono">
        {dateTime.format(new Date(order.createdAt))}
      </Text>
    )),
  },
];

const getIsGroupHeaderRow = (row: Row<OrdersRow>) => isOrderGroup(row.original);

const getGroupTitle = (row: Row<OrdersRow>) => {
  const group = row.original;
  if (!isOrderGroup(group)) {
    return null;
  }
  const sum = group.items.reduce((acc, order) => acc + order.total, 0);
  return (
    <Flex alignItems="center" gap={2} className="orders-table__group-title">
      <Label theme={STATUS_THEME[group.status]} size="xs">
        {STATUS_LABELS[group.status]}
      </Label>
      <Text variant="subheader-1">{group.items.length} заказов</Text>
      <Text variant="body-1" color="secondary">
        на {currency.format(sum)}
      </Text>
    </Flex>
  );
};

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [query, setQuery] = React.useState('');
  const [grouped, setGrouped] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const filteredOrders = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return orders;
    }
    return orders.filter((order) =>
      [order.number, order.customer, order.email, order.city, STATUS_LABELS[order.status]]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [orders, query]);

  const data = React.useMemo<OrdersRow[]>(
    () => (grouped ? groupOrdersByStatus(filteredOrders) : filteredOrders),
    [filteredOrders, grouped],
  );

  // Keeps parent (group) checkbox state consistent when rows are nested.
  const handleRowSelectionChange = useRowSelectionFixedHandler<OrdersRow>({
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
    enableRowSelection: (row) => !isOrderGroup(row.original),
    enableMultiRowSelection: true,
    enableSorting: true,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnOrderChange: setColumnOrder,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    state: { rowSelection, columnOrder, expanded, sorting },
  });

  const selectedCount = Object.keys(rowSelection).filter((id) => rowSelection[id] && !id.startsWith('group-')).length;

  return (
    <div className="orders-table">
      <Flex alignItems="center" gap={3} wrap className="orders-table__toolbar">
        <TextInput
          size="m"
          placeholder="Поиск по номеру, клиенту, городу"
          value={query}
          onUpdate={setQuery}
          hasClear
          startContent={<Icon data={Magnifier} size={16} className="orders-table__search-icon" />}
          className="orders-table__search"
        />
        <Switch size="m" checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        <div className="orders-table__spacer" />
        {selectedCount > 0 ? (
          <Flex alignItems="center" gap={2}>
            <Text variant="body-1" color="secondary">
              Выбрано: {selectedCount}
            </Text>
            <Button view="flat" size="m" onClick={() => setRowSelection({})}>
              <Icon data={Xmark} size={16} />
              Снять выделение
            </Button>
          </Flex>
        ) : (
          <Text variant="body-1" color="hint">
            Всего заказов: {filteredOrders.length}
          </Text>
        )}
      </Flex>

      <div className="orders-table__scroll">
        <ColumnReorderingProvider table={table} onReorder={({ columnOrder: next }) => setColumnOrder(next)}>
          <Table
            table={table}
            size="m"
            stickyHeader
            className="orders-table__table"
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            getGroupTitle={getGroupTitle}
            emptyContent={
              <Flex direction="column" alignItems="center" gap={1} className="orders-table__empty">
                <Text variant="subheader-2">Ничего не найдено</Text>
                <Text variant="body-1" color="secondary">
                  Измените запрос или сбросьте фильтр.
                </Text>
              </Flex>
            }
          />
        </ColumnReorderingProvider>
      </div>
    </div>
  );
}
