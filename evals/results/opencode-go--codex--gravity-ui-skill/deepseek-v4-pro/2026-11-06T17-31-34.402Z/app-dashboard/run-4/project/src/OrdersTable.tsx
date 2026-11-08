import React from 'react';
import {Table, useTable, ColumnReorderingProvider, selectionColumn} from '@gravity-ui/table';
import type {ColumnDef, Row, RowSelectionState, GroupingState} from '@gravity-ui/table/tanstack';

interface Order {
  id: string;
  number: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
  items: number;
}

const statusLabels: Record<string, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

function getGroupTitle(row: Row<Order>) {
  const raw = row.getValue('status') as string;
  return statusLabels[raw] ?? raw;
}

const mockOrders: Order[] = [
  {id: '1', number: 'ORD-001', customer: 'ООО "Ромашка"', date: '06.11.2026', amount: '125 000 ₽', status: 'new', items: 12},
  {id: '2', number: 'ORD-002', customer: 'ИП Иванов И.И.', date: '05.11.2026', amount: '43 200 ₽', status: 'processing', items: 5},
  {id: '3', number: 'ORD-003', customer: 'АО "ТехноПром"', date: '05.11.2026', amount: '890 000 ₽', status: 'shipped', items: 48},
  {id: '4', number: 'ORD-004', customer: 'ООО "Вектор"', date: '04.11.2026', amount: '67 500 ₽', status: 'new', items: 8},
  {id: '5', number: 'ORD-005', customer: 'ООО "Старт"', date: '03.11.2026', amount: '12 300 ₽', status: 'delivered', items: 2},
  {id: '6', number: 'ORD-006', customer: 'ИП Петров А.С.', date: '02.11.2026', amount: '340 000 ₽', status: 'processing', items: 23},
  {id: '7', number: 'ORD-007', customer: 'АО "Альфа"', date: '01.11.2026', amount: '560 000 ₽', status: 'shipped', items: 31},
  {id: '8', number: 'ORD-008', customer: 'ООО "Дельта"', date: '31.10.2026', amount: '89 100 ₽', status: 'delivered', items: 14},
  {id: '9', number: 'ORD-009', customer: 'ИП Сидоров В.К.', date: '30.10.2026', amount: '4 500 ₽', status: 'cancelled', items: 1},
  {id: '10', number: 'ORD-010', customer: 'АО "МегаСтрой"', date: '29.10.2026', amount: '1 200 000 ₽', status: 'new', items: 64},
  {id: '11', number: 'ORD-011', customer: 'ООО "Гамма"', date: '28.10.2026', amount: '56 000 ₽', status: 'processing', items: 7},
  {id: '12', number: 'ORD-012', customer: 'ООО "Зенит"', date: '27.10.2026', amount: '234 500 ₽', status: 'shipped', items: 19},
];

const columns: ColumnDef<Order>[] = [
  selectionColumn as ColumnDef<Order>,
  {accessorKey: 'number', header: 'Номер заказа', size: 140},
  {accessorKey: 'customer', header: 'Клиент', size: 220},
  {accessorKey: 'date', header: 'Дата', size: 120},
  {accessorKey: 'amount', header: 'Сумма', size: 130},
  {accessorKey: 'items', header: 'Товаров', size: 100},
  {
    accessorKey: 'status',
    header: 'Статус',
    size: 160,
    enableGrouping: true,
    cell: (info) => {
      const value = info.getValue<string>();
      return statusLabels[value] ?? value;
    },
  },
];

export function OrdersTable() {
  const [data] = React.useState<Order[]>(mockOrders);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>(['status']);

  const getRowId = React.useCallback((order: Order) => order.id, []);

  const table = useTable({
    columns,
    data,
    getRowId,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableGrouping: true,
    enableExpanding: true,
    enableSorting: false,
    enableColumnResizing: false,
    groupedColumnMode: 'reorder',
    state: {
      rowSelection,
      grouping,
    },
    onRowSelectionChange: setRowSelection,
    onGroupingChange: setGrouping,
  });

  return (
    <div style={{width: '100%', overflowX: 'auto'}}>
      <ColumnReorderingProvider table={table}>
        <Table
          table={table}
          size="m"
          stickyHeader
          getGroupTitle={getGroupTitle}
          getIsGroupHeaderRow={(row) => row.getIsGrouped()}
        />
      </ColumnReorderingProvider>
    </div>
  );
}
