import React from 'react';
import {Button, Label, Switch, Text} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';
import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';

import {
  GROUP_ID_PREFIX,
  STATUS_LABEL,
  createOrders,
  groupByStatus,
  isGroup,
} from './orders';
import type {Order, OrderRow, OrderStatus} from './orders';
import './OrdersTable.css';

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
const dateFormat = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'medium'});

const orderOf = (row: OrderRow): Order | undefined => (isGroup(row) ? undefined : row);

const columns: ColumnDef<OrderRow>[] = [
  // Колонка с чекбоксами остаётся на месте — её нельзя перетаскивать.
  {...(selectionColumn as ColumnDef<OrderRow>), enableColumnReordering: false},
  {
    id: 'id',
    header: 'Заказ',
    size: 120,
    accessorFn: (row) => orderOf(row)?.id,
    cell: (info) => <Text variant="body-2">{info.getValue<string>()}</Text>,
  },
  {
    id: 'customer',
    header: 'Клиент',
    size: 220,
    accessorFn: (row) => orderOf(row)?.customer,
  },
  {
    id: 'status',
    header: 'Статус',
    size: 160,
    accessorFn: (row) => orderOf(row)?.status,
    cell: (info) => {
      const status = info.getValue<OrderStatus>();
      return (
        <Label theme={STATUS_THEME[status]} size="s">
          {STATUS_LABEL[status]}
        </Label>
      );
    },
  },
  {
    id: 'itemsCount',
    header: 'Позиций',
    size: 110,
    accessorFn: (row) => orderOf(row)?.itemsCount,
  },
  {
    id: 'total',
    header: 'Сумма',
    size: 150,
    accessorFn: (row) => orderOf(row)?.total,
    cell: (info) => currency.format(info.getValue<number>()),
  },
  {
    id: 'createdAt',
    header: 'Создан',
    size: 150,
    accessorFn: (row) => orderOf(row)?.createdAt,
    cell: (info) => dateFormat.format(new Date(info.getValue<string>())),
  },
];

const getRowId = (row: OrderRow) => row.id;
const getSubRows = (row: OrderRow) => (isGroup(row) ? row.items : undefined);
const getIsGroupHeaderRow = (row: Row<OrderRow>) => isGroup(row.original);
const getGroupTitle = (row: Row<OrderRow>) => {
  const original = row.original;
  return isGroup(original) ? (
    <Label theme={STATUS_THEME[original.status]} size="s">
      {STATUS_LABEL[original.status]}
    </Label>
  ) : (
    row.id
  );
};

export function OrdersTable() {
  const orders = React.useMemo(() => createOrders(), []);
  const [grouped, setGrouped] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  // `true` — все группы развёрнуты; при ручном сворачивании tanstack сам переключится на объект.
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);

  const data = React.useMemo<OrderRow[]>(
    () => (grouped ? groupByStatus(orders) : orders),
    [grouped, orders],
  );

  // Без этого хука чекбокс группы и «выбрать все» показывают неверное состояние (tanstack#4878).
  const handleRowSelectionChange = useRowSelectionFixedHandler<OrderRow>({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable<OrderRow>({
    columns,
    data,
    getRowId,
    getSubRows,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableExpanding: true,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    state: {rowSelection, expanded},
  });

  const selectedCount = Object.keys(rowSelection).filter(
    (id) => rowSelection[id] && !id.startsWith(GROUP_ID_PREFIX),
  ).length;

  return (
    <section className="orders">
      <header className="orders__toolbar">
        <div className="orders__title">
          <Text variant="header-1" as="h1">
            Заказы
          </Text>
          <Text variant="body-1" color="secondary">
            {selectedCount > 0
              ? `Выбрано: ${selectedCount} из ${orders.length}`
              : `Всего: ${orders.length}`}
          </Text>
        </div>
        <div className="orders__actions">
          {selectedCount > 0 && (
            <Button view="flat" onClick={() => setRowSelection({})}>
              Сбросить выбор
            </Button>
          )}
          <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        </div>
      </header>

      <div className="orders__scroll">
        <ColumnReorderingProvider table={table}>
          <Table
            table={table}
            stickyHeader
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            getGroupTitle={getGroupTitle}
            emptyContent="Заказов нет"
          />
        </ColumnReorderingProvider>
      </div>
    </section>
  );
}
