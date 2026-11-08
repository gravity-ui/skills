
import React from 'react';

import {ColumnReorderingProvider, Table, selectionColumn, useRowSelectionFixedHandler, useTable} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {AsideHeader} from '@gravity-ui/navigation';
import {House, Person, Receipt, Sliders} from '@gravity-ui/icons';
import {Box, Text} from '@gravity-ui/uikit';

import './App.css';

type OrderStatus = 'new' | 'paid' | 'shipped' | 'completed';

type Order = {
  id: string;
  number: string;
  customer: string;
  amount: number;
  date: string;
  status: OrderStatus;
};

type OrderGroup = {
  id: string;
  status: OrderStatus;
  orders: Order[];
};

const statusTitles: Record<OrderStatus, string> = {
  new: 'Новые',
  paid: 'Оплачены',
  shipped: 'Отправлены',
  completed: 'Завершены',
};

const orders: Order[] = [
  {id: '1', number: 'ORD-1042', customer: 'Анна Ковалёва', amount: 18400, date: '2026-11-05', status: 'new'},
  {id: '2', number: 'ORD-1043', customer: 'Дмитрий Соколов', amount: 9250, date: '2026-11-06', status: 'new'},
  {id: '3', number: 'ORD-1037', customer: 'Мария Егорова', amount: 26700, date: '2026-11-02', status: 'paid'},
  {id: '4', number: 'ORD-1038', customer: 'Игорь Лебедев', amount: 5300, date: '2026-11-03', status: 'paid'},
  {id: '5', number: 'ORD-1031', customer: 'Olga Ivanova', amount: 41200, date: '2026-10-29', status: 'shipped'},
  {id: '6', number: 'ORD-1034', customer: 'Pavel Morozov', amount: 12750, date: '2026-10-31', status: 'shipped'},
  {id: '7', number: 'ORD-1019', customer: 'Sergey Kuznetsov', amount: 33900, date: '2026-10-24', status: 'completed'},
  {id: '8', number: 'ORD-1022', customer: 'Elena Petrova', amount: 7600, date: '2026-10-25', status: 'completed'},
];

const orderGroups: OrderGroup[] = Object.entries(statusTitles).map(([status, title]) => ({
  id: `status-${status}`,
  status: status as OrderStatus,
  orders: orders.filter((order) => order.status === status),
}));

const columns: ColumnDef<OrderGroup | Order>[] = [
  selectionColumn as ColumnDef<OrderGroup | Order>,
  {accessorKey: 'number', header: 'Номер', size: 140},
  {accessorKey: 'customer', header: 'Клиент', size: 240},
  {accessorKey: 'date', header: 'Дата', size: 130},
  {
    accessorKey: 'amount',
    header: 'Сумма',
    size: 140,
    cell: (context) => formatAmount(context.getValue<number>()),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    size: 160,
    cell: (context) => statusTitles[context.getValue<OrderStatus>()],
  },
];

const getGroupTitle = (row: Row<OrderGroup | Order>) => {
  const value = row.original as OrderGroup;
  const count = value.orders.length;
  return `${statusTitles[value.status]} · ${count}`;
};

const formatAmount = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
}).format;

const menuItems = [
  {id: 'home', title: 'Главная', icon: House, current: true},
  {id: 'users', title: 'Пользователи', icon: Person},
  {id: 'orders', title: 'Заказы', icon: Receipt, current: true},
  {id: 'settings', title: 'Настройки', icon: Sliders},
];

export function App() {
  const [expanded, setExpanded] = React.useState<ExpandedState>(
    Object.fromEntries(orderGroups.map((group) => [group.id, true])),
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

  const [compact, setCompact] = React.useState(false);

  const handleRowSelectionChange = useRowSelectionFixedHandler<OrderGroup | Order>({
    rowSelection,
    setRowSelection,
    tableData: orderGroups,
    getSubRows: (item) => ('orders' in item ? item.orders : undefined),
    getRowId: (item) => item.id,
  });

  const table = useTable({
    columns,
    data: orderGroups,
    getRowId: (item) => item.id,
    enableExpanding: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getSubRows: (item) => ('orders' in item ? item.orders : undefined),
    onExpandedChange: setExpanded,
    onRowSelectionChange: handleRowSelectionChange,
    state: {expanded, rowSelection, columnOrder},
  });

  return (
    <AsideHeader
      logo={{text: 'Админцентр', href: '#'}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={() => (
        <main className="dashboard">
          <Box className="dashboard-header">
            <Text variant="header-1">Заказы</Text>
            <Text variant="body-1" color="secondary">
              Строки можно выделять, колонки перетаскивать, а заказы сгруппированы по статусу.
            </Text>
          </Box>
          <ColumnReorderingProvider table={table} onReorder={({columnOrder: nextOrder}) => setColumnOrder(nextOrder)}>
            <Table
              table={table}
              getIsGroupHeaderRow={(row) => 'orders' in row.original}
              getGroupTitle={getGroupTitle}
            />
          </ColumnReorderingProvider>
        </main>
      )}
    />
  );
}
