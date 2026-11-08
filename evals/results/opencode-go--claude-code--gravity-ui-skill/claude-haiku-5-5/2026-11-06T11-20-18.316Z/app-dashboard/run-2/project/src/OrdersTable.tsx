import React from 'react';
import {
  ColumnReorderingProvider,
  Table,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {
  CellContext,
  ColumnPinningState,
  ExpandedState,
  RowSelectionState,
} from '@gravity-ui/table/tanstack';
import {Checkbox, Flex, Label, Switch, Text} from '@gravity-ui/uikit';

import {
  ORDERS,
  STATUS_META,
  groupOrdersByStatus,
  type Order,
  type OrderRow,
} from './orders';

const SELECT_COLUMN_ID = 'select';

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: 'short', year: 'numeric'});
const CURRENCY_FORMAT = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});

const isOrderRow = (row: OrderRow): row is Order => row.kind === 'order';

const getRowId = (row: OrderRow) => row.id;
const getSubRows = (row: OrderRow) => (row.kind === 'group' ? row.orders : undefined);
const getIsGroupHeaderRow = (row: {original: OrderRow}) => row.original.kind === 'group';
const getGroupTitle = (row: {original: OrderRow}) => {
  const group = row.original;
  return group.kind === 'group'
    ? `${STATUS_META[group.status].title} · ${group.orders.length}`
    : null;
};

/** Ячейка, которая рисует только данные заказа; групповые строки рендерятся отдельно. */
const orderCell =
  (render: (order: Order) => React.ReactNode) =>
  ({row}: CellContext<OrderRow, unknown>) =>
    isOrderRow(row.original) ? render(row.original) : null;

const COLUMNS: ColumnDef<OrderRow>[] = [
  {
    id: SELECT_COLUMN_ID,
    header: ({table}) => (
      <Checkbox
        size="l"
        checked={table.getIsAllRowsSelected()}
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
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableColumnReordering: false,
    enableSorting: false,
  },
  {id: 'number', header: 'Заказ', size: 120, cell: orderCell((o) => o.id)},
  {id: 'customer', header: 'Клиент', size: 200, cell: orderCell((o) => o.customer)},
  {id: 'date', header: 'Дата', size: 140, cell: orderCell((o) => DATE_FORMAT.format(o.date))},
  {id: 'itemsCount', header: 'Позиций', size: 100, cell: orderCell((o) => o.itemsCount)},
  {id: 'total', header: 'Сумма', size: 150, cell: orderCell((o) => CURRENCY_FORMAT.format(o.total))},
  {
    id: 'status',
    header: 'Статус',
    size: 170,
    cell: orderCell((o) => (
      <Label theme={STATUS_META[o.status].theme} size="s">
        {STATUS_META[o.status].title}
      </Label>
    )),
  },
];

const INITIAL_COLUMN_ORDER = COLUMNS.map((column) => String(column.id));
const INITIAL_COLUMN_PINNING: ColumnPinningState = {left: [SELECT_COLUMN_ID]};

export function OrdersTable() {
  const [grouped, setGrouped] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [columnOrder, setColumnOrder] = React.useState<string[]>(INITIAL_COLUMN_ORDER);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(INITIAL_COLUMN_PINNING);

  const data: OrderRow[] = React.useMemo(
    () => (grouped ? groupOrdersByStatus(ORDERS) : ORDERS),
    [grouped],
  );

  // При вложенных строках стандартная обработка выделения даёт неверное состояние
  // чекбоксов родителей, поэтому передаём обработчик из пакета.
  const handleRowSelectionChange = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable({
    columns: COLUMNS,
    data,
    getRowId,
    getSubRows,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableExpanding: true,
    state: {rowSelection, expanded, columnOrder, columnPinning},
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
  });

  const selectedCount = ORDERS.filter((order) => rowSelection[order.id]).length;

  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap="wrap">
        <Flex alignItems="center" gap={4}>
          <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
          <Text variant="body-1" color="secondary">
            Выбрано: {selectedCount}
          </Text>
        </Flex>
        <Text variant="body-1" color="secondary">
          Всего заказов: {ORDERS.length}
        </Text>
      </Flex>

      <div style={{overflow: 'auto', maxHeight: 'calc(100vh - 220px)', maxWidth: '100%'}}>
        <ColumnReorderingProvider
          table={table}
          onReorder={({columnOrder: nextOrder, columnPinning: nextPinning}) => {
            setColumnOrder(nextOrder);
            setColumnPinning(nextPinning);
          }}
        >
          <Table
            table={table}
            stickyHeader
            getGroupTitle={getGroupTitle}
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            emptyContent="Заказов нет"
          />
        </ColumnReorderingProvider>
      </div>
    </Flex>
  );
}
