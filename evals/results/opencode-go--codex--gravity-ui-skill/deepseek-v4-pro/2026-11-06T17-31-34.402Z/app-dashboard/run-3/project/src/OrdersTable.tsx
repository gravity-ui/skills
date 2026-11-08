import React from 'react';
import {
  Table,
  useTable,
  useRowSelectionFixedHandler,
  selectionColumn,
  ColumnReorderingProvider,
} from '@gravity-ui/table';
import type { ColumnDef } from '@gravity-ui/table';
import type { ExpandedState, RowSelectionState, GroupingState } from '@gravity-ui/table/tanstack';
import { getGroupedRowModel } from '@tanstack/react-table';
import { Text } from '@gravity-ui/uikit';
import type { Order } from './data';

export interface OrderGroup {
  id: string;
  status: string;
  items: Order[];
}

type RowData = OrderGroup | Order;

function isGroup(item: RowData): item is OrderGroup {
  return 'items' in item;
}

const columns: ColumnDef<RowData>[] = [
  selectionColumn as ColumnDef<RowData>,
  { accessorKey: 'id', header: '№', size: 80, enableColumnReordering: true },
  { accessorKey: 'customer', header: 'Клиент', size: 200, enableColumnReordering: true },
  { accessorKey: 'date', header: 'Дата', size: 120, enableColumnReordering: true },
  { accessorKey: 'amount', header: 'Сумма, ₽', size: 130, enableColumnReordering: true, cell: ({ getValue }) => {
    const val = getValue<number>();
    return val != null ? val.toLocaleString('ru-RU') : '';
  }},
  { accessorKey: 'product', header: 'Товар', size: 200, enableColumnReordering: true },
  { accessorKey: 'quantity', header: 'Кол-во', size: 90, enableColumnReordering: true },
  { accessorKey: 'status', header: 'Статус', size: 140, enableColumnReordering: true },
];

function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  const statusMap = new Map<string, Order[]>();
  for (const order of orders) {
    const group = statusMap.get(order.status) ?? [];
    group.push(order);
    statusMap.set(order.status, group);
  }
  return Array.from(statusMap.entries()).map(([status, items]) => ({
    id: `group-${status}`,
    status,
    items,
  }));
}

function getGroupTitle(row: { original: RowData }) {
  const original = row.original;
  if (isGroup(original)) {
    return `${original.status} (${original.items.length})`;
  }
  return '';
}

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const groupedData = React.useMemo(() => groupOrdersByStatus(orders), [orders]);

  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>(['status']);

  const handleRowSelectionChange = useRowSelectionFixedHandler<RowData>({
    rowSelection,
    setRowSelection,
    tableData: groupedData,
    getSubRows: (item) => (isGroup(item) ? item.items : undefined),
    getRowId: (item) => (isGroup(item) ? item.id : String(item.id)),
  });

  const table = useTable({
    columns,
    data: groupedData,
    getRowId: (item) => (isGroup(item) ? item.id : String(item.id)),
    getSubRows: (item) => (isGroup(item) ? item.items : undefined),
    enableExpanding: true,
    onExpandedChange: setExpanded,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    enableGrouping: true,
    getGroupedRowModel: getGroupedRowModel(),
    onGroupingChange: setGrouping,
    state: {
      expanded,
      rowSelection,
      grouping,
    },
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 0' }}>
        <Text variant="subheader-1">Заказы</Text>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ColumnReorderingProvider table={table}>
          <Table table={table} stickyHeader getGroupTitle={getGroupTitle} />
        </ColumnReorderingProvider>
      </div>
    </div>
  );
}
