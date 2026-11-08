import React, {useMemo, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {
  ColumnReorderingProvider,
  Table,
  useRowSelectionFixedHandler,
  useTable,
} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Checkbox, Label, Text} from '@gravity-ui/uikit';
import {Gear, House, Person, ShoppingCart} from '@gravity-ui/icons';

type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';

interface Order {
  id: string;
  number: string;
  customer: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

const statusLabels: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В работе',
  shipped: 'Отправлен',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

const statusThemes: Record<
  OrderStatus,
  'info' | 'success' | 'warning' | 'danger' | 'normal'
> = {
  new: 'info',
  processing: 'warning',
  shipped: 'normal',
  completed: 'success',
  cancelled: 'danger',
};

const orders: Order[] = [
  {id: '1', number: 'ORD-1042', customer: 'Анна Смирнова', status: 'processing', total: 24800, createdAt: '07.11.2026'},
  {id: '2', number: 'ORD-1041', customer: 'Игорь Волков', status: 'new', total: 8400, createdAt: '06.11.2026'},
  {id: '3', number: 'ORD-1039', customer: 'Мария Кузнецова', status: 'completed', total: 53200, createdAt: '04.11.2026'},
  {id: '4', number: 'ORD-1036', customer: 'Дмитрий Орлов', status: 'shipped', total: 12750, createdAt: '01.11.2026'},
  {id: '5', number: 'ORD-1034', customer: 'Ольга Иванова', status: 'cancelled', total: 5900, createdAt: '30.10.2026'},
  {id: '6', number: 'ORD-1031', customer: 'Пётр Соколов', status: 'processing', total: 41300, createdAt: '28.10.2026'},
  {id: '7', number: 'ORD-1028', customer: 'Елена Морозова', status: 'completed', total: 9600, createdAt: '25.10.2026'},
  {id: '8', number: 'ORD-1024', customer: 'Артем Лебедев', status: 'new', total: 18700, createdAt: '22.10.2026'},
];

const formatMoney = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const columns: ColumnDef<Order>[] = [
  {
    id: '_select',
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
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableResizing: false,
    enableSorting: false,
  },
  {accessorKey: 'number', header: 'Номер', size: 140},
  {accessorKey: 'customer', header: 'Покупатель', size: 220},
  {
    accessorKey: 'status',
    header: 'Статус',
    size: 160,
    cell: ({getValue}) => {
      const status = getValue<OrderStatus>();
      return <Label theme={statusThemes[status]}>{statusLabels[status]}</Label>;
    },
  },
  {
    accessorKey: 'total',
    header: 'Сумма',
    size: 140,
    cell: ({getValue}) => formatMoney.format(getValue<number>()),
  },
  {accessorKey: 'createdAt', header: 'Создан', size: 140},
];

const menuItems = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Person},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function getGroupTitle(row: Row<Order>) {
  const status = row.original as Order | undefined;
  return status?.status ? statusLabels[status.status] : row.id;
}

export function App() {
  const [compact, setCompact] = useState(false);
  const [activeSection, setActiveSection] = useState('orders');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const fixedRowSelectionHandler = useRowSelectionFixedHandler({
    rowSelection,
    setRowSelection,
    tableData: orders,
    getSubRows: () => undefined,
    getRowId: (order: Order) => order.id,
  });

  const table = useTable({
    columns,
    data: orders,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableGrouping: true,
    enableExpanding: true,
    enableSorting: true,
    getRowId: (order) => order.id,
    onRowSelectionChange: fixedRowSelectionHandler,
    onExpandedChange: setExpanded,
    state: {
      rowSelection,
      grouping: ['status'],
      expanded,
    },
  });

  const selectedCount = useMemo(
    () => Object.keys(rowSelection).length,
    [rowSelection],
  );

  return (
    <AsideHeader
      logo={{text: 'Админка', href: '#'}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems.map((item) => ({
        ...item,
        current: item.id === activeSection,
        onItemClick: () => setActiveSection(item.id),
      }))}
      renderContent={() => (
        <main
          style={{
            minHeight: '100vh',
            padding: '24px 32px 40px',
            backgroundColor: 'var(--g-color-base-generic-xlight)',
          }}
        >
          <div style={{maxWidth: 1240, margin: '0 auto'}}>
            <Text variant="header-1">Заказы</Text>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '16px 0',
              }}
            >
              <Text color="secondary">
                Выбрано заказов: {selectedCount}. Колонки можно перетаскивать, группы — сворачивать.
              </Text>
            </div>
            <div
              style={{
                backgroundColor: 'var(--g-color-base-background)',
                borderRadius: 12,
                border: '1px solid var(--g-color-line-generic)',
                padding: 16,
              }}
            >
              <ColumnReorderingProvider table={table}>
                <Table table={table} getGroupTitle={getGroupTitle} />
              </ColumnReorderingProvider>
            </div>
          </div>
        </main>
      )}
    />
  );
}
