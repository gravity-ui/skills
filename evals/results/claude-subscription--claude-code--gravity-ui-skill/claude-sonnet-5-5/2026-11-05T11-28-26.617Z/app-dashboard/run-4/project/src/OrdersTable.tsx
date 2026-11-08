import React from 'react';
import {ColumnReorderingProvider, Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Button, Checkbox, Flex, Label, Switch, Text} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {
  STATUS_LABEL,
  STATUS_TITLE,
  createOrders,
  groupByStatus,
  type Order,
  type OrderRow,
  type OrderStatus,
} from './orders';
import './OrdersTable.css';

const STATUS_THEME: Record<OrderStatus, LabelProps['theme']> = {
  new: 'info',
  processing: 'warning',
  shipped: 'utility',
  delivered: 'success',
  cancelled: 'danger',
};

const currency = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'});
const dateFormat = new Intl.DateTimeFormat('ru-RU');

const isGroupRow = (row: Row<OrderRow>) => row.original.kind === 'group';

const selectionColumn: ColumnDef<OrderRow> = {
  id: '_select',
  header: ({table}) => (
    <Checkbox
      size="m"
      aria-label="Выбрать все заказы"
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={(event) => table.toggleAllRowsSelected(event.target.checked)}
    />
  ),
  cell: ({row}) => (
    // Клик по чекбоксу не должен дополнительно переключать строку через onRowClick.
    <span onClick={(event) => event.stopPropagation()}>
      <Checkbox
        size="m"
        aria-label="Выбрать заказ"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={(event) => row.toggleSelected(event.target.checked)}
      />
    </span>
  ),
  size: 44,
  minSize: 44,
  enableResizing: false,
  enableColumnReordering: false,
  meta: {hideInSettings: true},
};

const orderOnly = <T,>(row: OrderRow, getValue: (order: Order) => T): T | undefined =>
  row.kind === 'order' ? getValue(row) : undefined;

const columns: ColumnDef<OrderRow>[] = [
  selectionColumn,
  {
    id: 'number',
    header: 'Заказ',
    size: 120,
    accessorFn: (row) => orderOnly(row, (order) => order.number),
  },
  {
    id: 'customer',
    header: 'Клиент',
    size: 220,
    accessorFn: (row) => orderOnly(row, (order) => order.customer),
  },
  {
    id: 'city',
    header: 'Город',
    size: 180,
    accessorFn: (row) => orderOnly(row, (order) => order.city),
  },
  {
    id: 'status',
    header: 'Статус',
    size: 160,
    accessorFn: (row) => orderOnly(row, (order) => order.status),
    cell: ({row}) =>
      row.original.kind === 'order' ? (
        <Label theme={STATUS_THEME[row.original.status]}>{STATUS_LABEL[row.original.status]}</Label>
      ) : null,
  },
  {
    id: 'items',
    header: 'Товаров',
    size: 110,
    accessorFn: (row) => orderOnly(row, (order) => order.items),
  },
  {
    id: 'amount',
    header: 'Сумма',
    size: 150,
    accessorFn: (row) => orderOnly(row, (order) => order.amount),
    cell: ({row}) => (row.original.kind === 'order' ? currency.format(row.original.amount) : null),
  },
  {
    id: 'createdAt',
    header: 'Дата',
    size: 130,
    accessorFn: (row) => orderOnly(row, (order) => order.createdAt),
    cell: ({row}) =>
      row.original.kind === 'order' ? dateFormat.format(new Date(row.original.createdAt)) : null,
  },
];

const getRowId = (row: OrderRow) => row.id;
const getSubRows = (row: OrderRow) => (row.kind === 'group' ? row.rows : undefined);
const getGroupTitle = (row: Row<OrderRow>) =>
  row.original.kind === 'group' ? STATUS_TITLE[row.original.status] : row.id;

const rowClassName = (row?: Row<OrderRow>) =>
  row?.getIsSelected() ? 'orders-table__row orders-table__row_selected' : 'orders-table__row';

export function OrdersTable() {
  const orders = React.useMemo(() => createOrders(), []);
  const [grouped, setGrouped] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const data = React.useMemo<OrderRow[]>(
    () => (grouped ? groupByStatus(orders) : orders),
    [grouped, orders],
  );

  // Группы по умолчанию развёрнуты: expanded: true — «все строки раскрыты».
  const table = useTable<OrderRow>({
    columns,
    data,
    getRowId,
    getSubRows,
    enableExpanding: true,
    enableRowSelection: (row) => row.original.kind === 'order',
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    initialState: {expanded: true},
    state: {rowSelection},
  });

  const selectedCount = Object.keys(rowSelection).filter((id) => rowSelection[id]).length;

  const handleGroupedChange = (checked: boolean) => {
    setGrouped(checked);
    table.setExpanded(true);
  };

  return (
    <Flex direction="column" className="orders-table">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap={4}
        className="orders-table__toolbar"
      >
        <Flex direction="column" gap={1} style={{minWidth: 0}}>
          <Text variant="header-1" ellipsis>
            Заказы
          </Text>
          <Text variant="body-1" color="secondary">
            {selectedCount > 0
              ? `Выбрано: ${selectedCount} из ${orders.length}`
              : `Всего заказов: ${orders.length}. Перетащите заголовок колонки, чтобы изменить порядок`}
          </Text>
        </Flex>
        <Flex alignItems="center" gap={4} style={{flexShrink: 0}}>
          {selectedCount > 0 && (
            <Button view="flat" onClick={() => setRowSelection({})}>
              Снять выделение
            </Button>
          )}
          <Switch checked={grouped} onUpdate={handleGroupedChange} content="Группировать по статусу" />
        </Flex>
      </Flex>

      <div className="orders-table__scroll">
        <ColumnReorderingProvider table={table}>
          <Table
            table={table}
            stickyHeader
            getIsGroupHeaderRow={isGroupRow}
            getGroupTitle={getGroupTitle}
            rowClassName={rowClassName}
            onRowClick={(row) => {
              if (row.getCanSelect()) {
                row.toggleSelected();
              }
            }}
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
