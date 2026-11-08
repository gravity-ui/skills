import React from 'react';
import {ColumnReorderingProvider, Table, selectionColumn, useRowSelectionFixedHandler, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState, SortingState} from '@gravity-ui/table/tanstack';
import {Button, Flex, Label, Switch, Text} from '@gravity-ui/uikit';

import {
  STATUS_TITLE,
  generateOrders,
  groupOrdersByStatus,
  isOrderGroup,
  type Order,
  type OrderStatus,
  type OrdersRow,
} from './orders';

import './OrdersTable.css';

const STATUS_THEME: Record<OrderStatus, React.ComponentProps<typeof Label>['theme']> = {
  new: 'info',
  processing: 'warning',
  shipped: 'utility',
  delivered: 'success',
  cancelled: 'danger',
};

const moneyFormat = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'short', timeStyle: 'short'});

const ORDERS = generateOrders(60);
const GROUPED_ORDERS = groupOrdersByStatus(ORDERS);

const columns: ColumnDef<OrdersRow>[] = [
  {...(selectionColumn as ColumnDef<OrdersRow>), enableColumnReordering: false},
  {
    id: 'number',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.number),
    header: 'Номер',
    size: 110,
    withNestingStyles: true,
    showTreeDepthIndicators: false,
  },
  {
    id: 'customer',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.customer),
    header: 'Клиент',
    size: 220,
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: 'Статус',
    size: 150,
    cell: ({getValue}) => {
      const status = getValue<OrderStatus>();
      return <Label theme={STATUS_THEME[status]} size="xs">{STATUS_TITLE[status]}</Label>;
    },
  },
  {
    id: 'amount',
    accessorFn: (row) => (isOrderGroup(row) ? 0 : row.amount),
    header: 'Сумма',
    size: 140,
    cell: ({getValue}) => <Text variant="body-1" className="orders-table__number">{moneyFormat.format(getValue<number>())}</Text>,
  },
  {
    id: 'itemsCount',
    accessorFn: (row) => (isOrderGroup(row) ? 0 : row.itemsCount),
    header: 'Товаров',
    size: 100,
    cell: ({getValue}) => <span className="orders-table__number">{getValue<number>()}</span>,
  },
  {
    id: 'city',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.city),
    header: 'Город',
    size: 170,
  },
  {
    id: 'createdAt',
    accessorFn: (row) => (isOrderGroup(row) ? '' : row.createdAt),
    header: 'Создан',
    size: 160,
    cell: ({getValue}) => {
      const value = getValue<string>();
      return value ? dateFormat.format(new Date(value)) : null;
    },
  },
];

const getRowId = (row: OrdersRow) => row.id;
const getSubRows = (row: OrdersRow) => (isOrderGroup(row) ? row.items : undefined);
const getIsGroupHeaderRow = (row: Row<OrdersRow>) => isOrderGroup(row.original);
const getGroupTitle = (row: Row<OrdersRow>) => STATUS_TITLE[row.original.status];

export function OrdersTable() {
  const [grouped, setGrouped] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const data: OrdersRow[] = grouped ? GROUPED_ORDERS : ORDERS;

  // Keeps parent/child checkbox state consistent when rows are nested (TanStack issue #4878).
  const handleRowSelectionChange = useRowSelectionFixedHandler<OrdersRow>({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable<OrdersRow>({
    columns,
    data,
    getRowId,
    getSubRows,
    enableExpanding: true,
    enableSorting: true,
    enableRowSelection: (row) => !isOrderGroup(row.original),
    enableMultiRowSelection: true,
    onExpandedChange: setExpanded,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    state: {rowSelection, expanded, sorting},
  });

  const selectedOrders = table.getSelectedRowModel().flatRows.filter((row) => !isOrderGroup(row.original));
  const selectedAmount = selectedOrders.reduce((sum, row) => sum + (row.original as Order).amount, 0);

  return (
    <Flex direction="column" gap={3} className="orders-table">
      <Flex alignItems="center" gap={4} wrap className="orders-table__toolbar">
        <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        <Text variant="body-1" color="secondary" className="orders-table__hint">
          Перетащите заголовок колонки, чтобы поменять колонки местами. Shift+клик выделяет диапазон строк.
        </Text>
        {selectedOrders.length > 0 && (
          <Flex alignItems="center" gap={2} className="orders-table__selection">
            <Text variant="body-1">
              Выбрано: {selectedOrders.length}, на сумму {moneyFormat.format(selectedAmount)}
            </Text>
            <Button view="flat" size="s" onClick={() => setRowSelection({})}>
              Снять выделение
            </Button>
          </Flex>
        )}
      </Flex>

      <div className="orders-table__scroll">
        <ColumnReorderingProvider table={table} dragOverlayRowCount={8}>
          <Table
            table={table}
            stickyHeader
            size="m"
            className="orders-table__table"
            getIsGroupHeaderRow={grouped ? getIsGroupHeaderRow : undefined}
            getGroupTitle={getGroupTitle}
            emptyContent="Заказов пока нет"
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
