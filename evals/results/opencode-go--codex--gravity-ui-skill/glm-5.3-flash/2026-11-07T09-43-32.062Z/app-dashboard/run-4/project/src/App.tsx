import React, {useMemo, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Gear, House, Persons, Receipt} from '@gravity-ui/icons';
import {Flex, Label, Text} from '@gravity-ui/uikit';
import {
  ColumnReorderingProvider,
  RangedSelectionCheckbox,
  Table,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState} from '@tanstack/react-table';
import type {ColumnDef as GravityColumnDef} from '@gravity-ui/table';
import {getGroupedOrders, isOrderGroup, type OrderRow, type OrderStatus} from './orders';

const navigationSections = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: Receipt},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

const statusThemes: Record<OrderStatus, 'info' | 'success' | 'warning' | 'normal' | 'danger'> = {
  'Новый': 'info',
  'Оплачен': 'success',
  'Отправлен': 'warning',
  'Доставлен': 'normal',
  'Отменен': 'danger',
};

export function App() {
  const [compact, setCompact] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('orders');
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const data = useMemo(getGroupedOrders, []);
  const handleRowSelection = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: data,
    getSubRows: (item) => (isOrderGroup(item) ? item.orders : undefined),
    getRowId: (item) => item.id,
  });

  const tableColumns = useMemo(
    (): GravityColumnDef<OrderRow>[] => [
      {
        id: '_select',
        header: '',
        size: 44,
        enableResizing: false,
        enableSorting: false,
        enableColumnReordering: false,
        cell: (context) => (
          <RangedSelectionCheckbox
            cellContext={context}
            checked={context.row.getIsSelected()}
            disabled={!context.row.getCanSelect()}
            indeterminate={context.row.getIsSomeSelected()}
          />
        ),
      },
      {accessorKey: 'number', header: 'Номер', size: 130},
      {accessorKey: 'customer', header: 'Клиент', size: 210},
      {accessorKey: 'createdAt', header: 'Дата', size: 120},
      {accessorKey: 'total', header: 'Сумма', size: 120},
      {
        accessorKey: 'status',
        header: 'Статус',
        size: 150,
        cell: (context) => (
          <Label theme={statusThemes[context.getValue<OrderStatus>()]}>{context.getValue<OrderStatus>()}</Label>
        ),
      },
    ],
    [],
  );

  const table = useTable({
    columns: tableColumns,
    data,
    enableExpanding: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (item) => item.id,
    getSubRows: (item) => (isOrderGroup(item) ? item.orders : undefined),
    onRowSelectionChange: handleRowSelection,
    onExpandedChange: setExpanded,
    state: {expanded, rowSelection, columnOrder},
  });

  const menuItems = useMemo(
    () =>
      navigationSections.map((section) => ({
        ...section,
        current: section.id === activeSectionId,
        onItemClick: () => setActiveSectionId(section.id),
      })),
    [activeSectionId],
  );

  return (
    <AsideHeader
      logo={{text: 'Админка', href: '#'}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={() => (
        <Flex direction="column" style={{minHeight: '100vh', minWidth: 0}}>
          <Flex direction="column" style={{padding: '24px 24px 0', minWidth: 0}}>
            <Text variant="header-2">Заказы</Text>
            <Text color="secondary">
              Строки можно выделять, колонки перетаскивать, данные сгруппированы по статусам.
            </Text>
          </Flex>
          <div style={{flex: 1, minHeight: 0, padding: 24}}>
            <ColumnReorderingProvider
              table={table}
              onReorder={({columnOrder: nextOrder}) => setColumnOrder(nextOrder)}
            >
              <div style={{overflowX: 'auto', border: '1px solid var(--g-color-line-generic)', borderRadius: 12}}>
                <Table
                  table={table}
                  getIsGroupHeaderRow={(row: Row<OrderRow>) => isOrderGroup(row.original)}
                  getGroupTitle={(row: Row<OrderRow>) =>
                    isOrderGroup(row.original) ? `${row.original.status} · ${row.original.count}` : ''}
                />
              </div>
            </ColumnReorderingProvider>
          </div>
        </Flex>
      )}
    />
  );
}
