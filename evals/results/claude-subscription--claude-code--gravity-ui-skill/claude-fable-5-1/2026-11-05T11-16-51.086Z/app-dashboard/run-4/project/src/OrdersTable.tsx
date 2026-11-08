import * as React from 'react';

import {
  ColumnReorderingProvider,
  Table,
  selectionColumn,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState, SortingState} from '@gravity-ui/table/tanstack';
import {Magnifier} from '@gravity-ui/icons';
import {Button, Flex, Icon, Label, Switch, Text, TextInput} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {
  STATUS_TITLES,
  generateOrders,
  groupOrdersByStatus,
  isOrderGroup,
} from './data/orders';
import type {Order, OrderStatus, OrdersRow} from './data/orders';

const STATUS_THEMES: Record<OrderStatus, LabelProps['theme']> = {
  new: 'info',
  processing: 'warning',
  shipped: 'utility',
  delivered: 'success',
  cancelled: 'danger',
};

const currencyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const SELECTION_COLUMN_ID = '_select';

function orderValue<T>(row: OrdersRow, pick: (order: Order) => T): T | undefined {
  return isOrderGroup(row) ? undefined : pick(row);
}

const columns: ColumnDef<OrdersRow>[] = [
  {...(selectionColumn as ColumnDef<OrdersRow>), enableColumnReordering: false},
  {
    id: 'number',
    header: 'Номер',
    accessorFn: (row) => orderValue(row, (order) => order.number),
    size: 140,
    withNestingStyles: true,
    showTreeDepthIndicators: false,
    cell: ({getValue}) => <Text variant="body-1">{getValue<string | undefined>()}</Text>,
  },
  {
    id: 'customer',
    header: 'Клиент',
    accessorFn: (row) => orderValue(row, (order) => order.customer),
    size: 220,
  },
  {
    id: 'status',
    header: 'Статус',
    accessorFn: (row) => row.status,
    size: 150,
    cell: ({getValue}) => {
      const status = getValue<OrderStatus>();
      return (
        <Label theme={STATUS_THEMES[status]} size="xs">
          {STATUS_TITLES[status]}
        </Label>
      );
    },
  },
  {
    id: 'city',
    header: 'Город',
    accessorFn: (row) => orderValue(row, (order) => order.city),
    size: 180,
  },
  {
    id: 'items',
    header: 'Позиций',
    accessorFn: (row) => orderValue(row, (order) => order.items),
    size: 110,
  },
  {
    id: 'total',
    header: 'Сумма',
    accessorFn: (row) => orderValue(row, (order) => order.total),
    size: 140,
    cell: ({getValue}) => {
      const total = getValue<number | undefined>();
      return total === undefined ? null : currencyFormat.format(total);
    },
  },
  {
    id: 'createdAt',
    header: 'Создан',
    accessorFn: (row) => orderValue(row, (order) => order.createdAt),
    size: 180,
    cell: ({getValue}) => {
      const createdAt = getValue<string | undefined>();
      return createdAt === undefined ? null : dateFormat.format(new Date(createdAt));
    },
  },
];

const COLUMN_PINNING = {left: [SELECTION_COLUMN_ID]};

const getRowId = (row: OrdersRow) => row.id;
const getSubRows = (row: OrdersRow) => (isOrderGroup(row) ? row.orders : undefined);
const getIsGroupHeaderRow = (row: Row<OrdersRow>) => isOrderGroup(row.original);
const getGroupTitle = (row: Row<OrdersRow>) => STATUS_TITLES[row.original.status];

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('input, label, button, a'));

export function OrdersTable() {
  const [orders] = React.useState(() => generateOrders());
  const [search, setSearch] = React.useState('');
  const [grouped, setGrouped] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

  const filteredOrders = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return orders;
    }
    return orders.filter(
      (order) =>
        order.number.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.city.toLowerCase().includes(query),
    );
  }, [orders, search]);

  const data = React.useMemo<OrdersRow[]>(
    () => (grouped ? groupOrdersByStatus(filteredOrders) : filteredOrders),
    [filteredOrders, grouped],
  );

  // Keeps the parent (group) checkbox state consistent when rows are grouped.
  const handleRowSelectionChange = useRowSelectionFixedHandler({
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
    enableSorting: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnPinning: true,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      expanded,
      rowSelection,
      columnOrder,
      columnPinning: COLUMN_PINNING,
    },
  });

  const selectedCount = table
    .getSelectedRowModel()
    .flatRows.filter((row) => !isOrderGroup(row.original)).length;

  const handleGroupedChange = (value: boolean) => {
    setGrouped(value);
    setExpanded(true);
    // Group ids are not meaningful outside grouped mode, keep only order ids.
    setRowSelection((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => id.startsWith('order-'))),
    );
  };

  const handleRowClick = React.useCallback(
    (row: Row<OrdersRow>, event: React.MouseEvent<HTMLTableRowElement>) => {
      if (isOrderGroup(row.original) || isInteractiveTarget(event.target)) {
        return;
      }
      row.toggleSelected();
    },
    [],
  );

  const rowClassName = React.useCallback(
    (row?: Row<OrdersRow>) => (row?.getIsSelected() ? 'orders-table__row_selected' : ''),
    [],
  );

  return (
    <div className="orders-table">
      <Flex alignItems="center" gap={3} wrap className="orders-table__toolbar">
        <TextInput
          size="m"
          placeholder="Поиск по номеру, клиенту или городу"
          value={search}
          onUpdate={setSearch}
          hasClear
          startContent={<Icon data={Magnifier} size={16} />}
          className="orders-table__search"
        />
        <Switch
          size="m"
          checked={grouped}
          onUpdate={handleGroupedChange}
          content="Группировать по статусу"
        />
        <Flex alignItems="center" gap={2} className="orders-table__toolbar-end">
          {columnOrder.length > 0 && (
            <Button view="flat" size="m" onClick={() => setColumnOrder([])}>
              Сбросить порядок колонок
            </Button>
          )}
          <Text variant="body-1" color="secondary">
            Выбрано: {selectedCount} из {filteredOrders.length}
          </Text>
          <Button
            view="outlined"
            size="m"
            disabled={selectedCount === 0}
            onClick={() => setRowSelection({})}
          >
            Снять выделение
          </Button>
        </Flex>
      </Flex>

      <div className="orders-table__scroll">
        <ColumnReorderingProvider
          table={table}
          onReorder={({columnOrder: nextOrder}) => setColumnOrder(nextOrder)}
        >
          <Table
            table={table}
            size="m"
            stickyHeader
            className="orders-table__table"
            rowClassName={rowClassName}
            onRowClick={handleRowClick}
            getIsGroupHeaderRow={getIsGroupHeaderRow}
            getGroupTitle={getGroupTitle}
            emptyContent={
              <Text variant="body-2" color="secondary">
                Заказы не найдены
              </Text>
            }
          />
        </ColumnReorderingProvider>
      </div>
    </div>
  );
}
