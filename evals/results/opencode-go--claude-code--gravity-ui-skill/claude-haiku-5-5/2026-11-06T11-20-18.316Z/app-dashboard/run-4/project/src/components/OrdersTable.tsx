import React from 'react';
import {
  ColumnReorderingProvider,
  Table,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
// The package's own ColumnDef adds `enableColumnReordering`, so it comes from the root entry.
import type {ColumnDef} from '@gravity-ui/table';
import type {
  CellContext,
  ExpandedState,
  HeaderContext,
  RowSelectionState,
} from '@gravity-ui/table/tanstack';
import {ChevronDown, ChevronRight} from '@gravity-ui/icons';
import {Button, Checkbox, Flex, Icon, Label, Switch, Text} from '@gravity-ui/uikit';

import {
  ORDER_STATUS_META,
  ORDER_STATUSES,
  formatAmount,
  formatDate,
  type Order,
  type OrderStatus,
} from '../data/orders';

import './OrdersTable.css';

/** A synthetic row that holds all orders with the same status (grouping mode only). */
interface StatusGroup {
  id: string;
  status: OrderStatus;
  items: Order[];
}

type TableRow = Order | StatusGroup;

const isStatusGroup = (row: TableRow): row is StatusGroup => 'items' in row;

function groupByStatus(orders: Order[]): StatusGroup[] {
  return ORDER_STATUSES.map((status) => ({
    id: `status:${status}`,
    status,
    items: orders.filter((order) => order.status === status),
  })).filter((group) => group.items.length > 0);
}

// Module-level so their identity is stable (required by useRowSelectionFixedHandler).
const getRowId = (row: TableRow) => row.id;
const getSubRows = (row: TableRow) => (isStatusGroup(row) ? row.items : undefined);

/** Renders a cell only for order rows; group rows are drawn by `renderGroupHeader`. */
const orderCell =
  (render: (order: Order) => React.ReactNode) =>
  ({row}: CellContext<TableRow, unknown>) =>
    isStatusGroup(row.original) ? null : render(row.original);

const columns: ColumnDef<TableRow>[] = [
  {
    id: 'select',
    size: 48,
    minSize: 48,
    enableColumnReordering: false,
    header: ({table}: HeaderContext<TableRow, unknown>) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onUpdate={(checked) => table.toggleAllRowsSelected(checked)}
      />
    ),
    cell: ({row}: CellContext<TableRow, unknown>) =>
      isStatusGroup(row.original) ? null : (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onUpdate={(checked) => row.toggleSelected(checked)}
        />
      ),
  },
  {
    id: 'number',
    header: 'Заказ',
    size: 120,
    cell: orderCell((order) => order.id),
  },
  {
    id: 'customer',
    header: 'Клиент',
    size: 220,
    cell: orderCell((order) => order.customer),
  },
  {
    id: 'amount',
    header: 'Сумма',
    size: 150,
    cell: orderCell((order) => (
      <span className="orders-table__amount">{formatAmount(order.amount)}</span>
    )),
  },
  {
    id: 'status',
    header: 'Статус',
    size: 170,
    cell: orderCell((order) => {
      const meta = ORDER_STATUS_META[order.status];
      return (
        <Label theme={meta.theme} size="s">
          {meta.title}
        </Label>
      );
    }),
  },
  {
    id: 'createdAt',
    header: 'Дата',
    size: 150,
    cell: orderCell((order) => formatDate(order.createdAt)),
  },
];

export interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({orders}: OrdersTableProps) {
  const [grouped, setGrouped] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>(true);

  const data = React.useMemo<TableRow[]>(
    () => (grouped ? groupByStatus(orders) : orders),
    [grouped, orders],
  );

  // With nested rows, the plain setter leaves parent checkboxes in a wrong state,
  // so selection changes go through this handler (see @gravity-ui/table docs).
  const handleRowSelectionChange = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows,
    getRowId,
  });

  const table = useTable<TableRow>({
    columns,
    data,
    getRowId,
    getSubRows,
    enableSorting: false,
    enableExpanding: true,
    // Keeps the selection column on the left: pinned columns can only be reordered
    // inside their own pin group, so no other column can be dropped in front of it.
    initialState: {columnPinning: {left: ['select']}},
    state: {rowSelection, expanded},
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
  });

  const selectedCount = orders.reduce(
    (count, order) => count + (rowSelection[order.id] ? 1 : 0),
    0,
  );

  return (
    <Flex direction="column" gap={4} style={{minWidth: 0}}>
      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
        <Switch checked={grouped} onUpdate={setGrouped}>
          Группировать по статусу
        </Switch>
        <Flex alignItems="center" gap={3}>
          <Text variant="body-1">Выбрано: {selectedCount}</Text>
          {selectedCount > 0 && (
            <Button view="flat" size="s" onClick={() => setRowSelection({})}>
              Сбросить
            </Button>
          )}
        </Flex>
      </Flex>

      <ColumnReorderingProvider table={table}>
        <div className="orders-table__scroll">
          <Table
            table={table}
            size="m"
            stickyHeader
            emptyContent="Заказов нет"
            getIsGroupHeaderRow={(row) => isStatusGroup(row.original)}
            rowClassName={(row) =>
              row?.getIsSelected() ? 'orders-table__row_selected' : ''
            }
            renderGroupHeader={({row, className}) => {
              if (!isStatusGroup(row.original)) {
                return null;
              }
              const group = row.original;
              const meta = ORDER_STATUS_META[group.status];
              return (
                <Flex alignItems="center" gap={2} className={className}>
                  <Button view="flat" size="s" onClick={row.getToggleExpandedHandler()}>
                    <Icon data={row.getIsExpanded() ? ChevronDown : ChevronRight} size={16} />
                  </Button>
                  <Label theme={meta.theme} size="s">
                    {meta.title}
                  </Label>
                  <Text variant="body-1" color="secondary">
                    {group.items.length}
                  </Text>
                </Flex>
              );
            }}
          />
        </div>
      </ColumnReorderingProvider>
    </Flex>
  );
}
