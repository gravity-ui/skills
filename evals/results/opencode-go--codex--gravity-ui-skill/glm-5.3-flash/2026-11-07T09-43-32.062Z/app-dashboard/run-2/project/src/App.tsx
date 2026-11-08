import React from 'react';

import {Button, Checkbox, Flex, Label, Select, Text} from '@gravity-ui/uikit';
import {ColumnReorderingProvider, Table, useRowSelectionFixedHandler, useTable} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState, GroupingState, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Gear, House, ListCheck, Person, ShoppingCart} from '@gravity-ui/icons';

import './App.css';
import {orderStatusLabels, orders, type Order, type OrderStatus} from './ordersData';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const sections: Array<{id: SectionId; title: string; icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;}> = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Person},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

const statusLenses: Record<OrderStatus, 'info' | 'warning' | 'success' | 'danger' | 'normal'> = {
  new: 'info',
  processing: 'warning',
  shipped: 'normal',
  completed: 'success',
  cancelled: 'danger',
};

const statusOptions = Object.entries(orderStatusLabels).map(([value, content]) => ({value, content}));

const selectionColumn: ColumnDef<Order, unknown> = {
  id: '_select',
  header: ({table}) => (
    <Checkbox
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({row}) => (
    <Checkbox
      checked={row.getIsSelected()}
      indeterminate={row.getIsSomeSelected()}
      disabled={!row.getCanSelect()}
      onChange={row.getToggleSelectedHandler()}
    />
  ),
  size: 40,
  minSize: 40,
  enableResizing: false,
  enableSorting: false,
};

export function App() {
  const [activeSection, setActiveSection] = React.useState<SectionId>('orders');
  const [collapsed, setCollapsed] = React.useState(false);
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

  const columns = React.useMemo<ColumnDef<Order>[]>(
    () => [
      selectionColumn,
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Статус',
        cell: ({getValue, row}) =>
          row.getIsGrouped() ? (
            `${orderStatusLabels[getValue<OrderStatus>()]} · ${row.subRows.length}`
          ) : (
            <Label theme={statusLenses[getValue<OrderStatus>()]} className="dashboard__status">
              {orderStatusLabels[getValue<OrderStatus>()]}
            </Label>
          ),
        enableGrouping: true,
      },
      {id: 'id', accessorKey: 'id', header: 'Заказ', size: 120},
      {id: 'customer', accessorKey: 'customer', header: 'Клиент'},
      {
        id: 'amount',
        accessorKey: 'amount',
        header: 'Сумма',
        cell: ({getValue, row}) =>
          row.getIsGrouped() ? null : `${getValue<number>().toLocaleString('ru-RU')} ₽`,
      },
      {id: 'createdAt', accessorKey: 'createdAt', header: 'Создан'},
    ],
    [],
  );

  const fixedRowSelectionHandler = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: orders,
    getSubRows: () => undefined,
    getRowId: (order) => order.id,
  });

  const table = useTable({
    columns,
    data: orders,
    getRowId: (order) => order.id,
    enableGrouping: true,
    enableExpanding: grouping.length > 0,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSubRowSelection: true,
    enableSorting: true,
    onRowSelectionChange: fixedRowSelectionHandler,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    state: {grouping, expanded, rowSelection, columnOrder},
    onColumnOrderChange: setColumnOrder,
    getRowCanExpand: grouping.length > 0 ? () => true : undefined,
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <div className="dashboard">
      <aside className={collapsed ? 'dashboard__aside dashboard__aside_collapsed' : 'dashboard__aside'}>
        <div className="dashboard__aside-inner">
          <div className="dashboard__top">
            {!collapsed && <div className="dashboard__title">Админка</div>}
            <Button view="flat-secondary" size="s" onClick={() => setCollapsed(!collapsed)}>
              <ListCheck />
            </Button>
          </div>
          <nav className="dashboard__nav">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  size="m"
                  view={activeSection === section.id ? 'normal' : 'flat'}
                  className="dashboard__nav-item"
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon />
                  {!collapsed && <span className="dashboard__nav-label">{section.title}</span>}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="dashboard__main">
        <h1 className="dashboard__heading">Заказы</h1>
        <div className="dashboard__toolbar">
          <Flex gap="4" alignItems="center">
            <Text variant="body-2">Группировка по статусу</Text>
            <Select
              size="m"
              width={180}
              value={grouping}
              options={statusOptions}
              onUpdate={(value) => {
                setGrouping(value as GroupingState);
                setExpanded({});
              }}
            />
          </Flex>
          <Button view="outlined" size="m" disabled={selectedCount === 0}>
            Выбрано: {selectedCount}
          </Button>
        </div>
        <div className="dashboard__table-card">
          <ColumnReorderingProvider
            table={table}
            onReorder={({columnOrder: nextColumnOrder}) => setColumnOrder(nextColumnOrder)}
          >
            <Table table={table} />
          </ColumnReorderingProvider>
        </div>
      </main>
    </div>
  );
}
