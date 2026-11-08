// Implement the requested feature here (and may add sibling files).
import React, { useMemo, useState } from 'react';
import { Button, Flex, Label, SegmentedRadioGroup, Switch, Table, Checkbox } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';
import { House, Person, ShoppingCart, Receipt, Gear, ChevronLeft, ChevronRight } from '@gravity-ui/icons';
import './dashboard.css';

interface Order {
  id: string;
  order: string;
  customer: string;
  amount: number;
  status: StatusKey;
  createdAt: string;
}

type StatusKey = 'new' | 'processing' | 'paid' | 'shipped' | 'done';

type LabelTheme = 'normal' | 'info' | 'danger' | 'warning' | 'success' | 'utility' | 'unknown' | 'clear';

const STATUSES: Record<StatusKey, { label: string; theme: LabelTheme }> = {
  new: { label: 'Новый', theme: 'info' },
  processing: { label: 'В работе', theme: 'warning' },
  paid: { label: 'Оплачен', theme: 'normal' },
  shipped: { label: 'Отправлен', theme: 'success' },
  done: { label: 'Завершен', theme: 'success' },
};

const ORDERS: Order[] = [
  { id: '1', order: '#10241', customer: 'Алина Соколова', amount: 12400, status: 'new', createdAt: '2026-11-07' },
  { id: '2', order: '#10240', customer: 'Марк Иванов', amount: 4800, status: 'processing', createdAt: '2026-11-06' },
  { id: '3', order: '#10239', customer: 'Полина Орлова', amount: 21500, status: 'paid', createdAt: '2026-11-06' },
  { id: '4', order: '#10238', customer: 'Дмитрий Ветров', amount: 7600, status: 'shipped', createdAt: '2026-11-05' },
  { id: '5', order: '#10237', customer: 'Егор Смирнов', amount: 9900, status: 'done', createdAt: '2026-11-05' },
  { id: '6', order: '#10236', customer: 'Ирина Громова', amount: 34000, status: 'new', createdAt: '2026-11-04' },
  { id: '7', order: '#10235', customer: 'Артем Кузнецов', amount: 5200, status: 'processing', createdAt: '2026-11-03' },
];

interface ColumnDef {
  id: keyof Omit<Order, 'id'>;
  name: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { id: 'order', name: 'Заказ' },
  { id: 'customer', name: 'Клиент' },
  { id: 'amount', name: 'Сумма' },
  { id: 'createdAt', name: 'Дата' },
  { id: 'status', name: 'Статус' },
];

type NavKey = 'home' | 'users' | 'orders' | 'settings';

const NAV_ITEMS: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  { key: 'home', label: 'Главная', icon: <House /> },
  { key: 'users', label: 'Пользователи', icon: <Person /> },
  { key: 'orders', label: 'Заказы', icon: <ShoppingCart /> },
  { key: 'settings', label: 'Настройки', icon: <Gear /> },
];

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [nav, setNav] = useState<NavKey>('orders');
  const [columns, setColumns] = useState(ALL_COLUMNS);
  const [selected, setSelected] = useState<string[]>([]);
  const [grouping, setGrouping] = useState<'none' | 'by-status'>('none');
  const [dragging, setDragging] = useState<keyof Omit<Order, 'id'> | null>(null);
  const [dropTarget, setDropTarget] = useState<keyof Omit<Order, 'id'> | null>(null);

  const moveColumn = (from: NonNullable<typeof dragging>, to: NonNullable<typeof dropTarget>) => {
    if (from === to) return;
    const fromIndex = columns.findIndex((col) => col.id === from);
    const toIndex = columns.findIndex((col) => col.id === to);
    const moved = columns[fromIndex];
    const next = [...columns];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setColumns(next);
    setDragging(null);
    setDropTarget(null);
  };

  const rowSelectionState = selected.length ? (selected.length === ORDERS.length ? 'all' : 'some') : 'none';
  const toggleAllRows = () => setSelected(rowSelectionState === 'all' ? [] : ORDERS.map((o) => o.id));
  const toggleRow = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((sid) => sid !== id) : [...selected, id]);

  const dataTableColumns: TableColumnConfig<Order>[] = [
    {
      id: '__select',
      name: () => (
        <Checkbox
          checked={rowSelectionState !== 'none'}
          indeterminate={rowSelectionState === 'some'}
          onChange={toggleAllRows}
        />
      ),
      template: (item) => (
        <Checkbox checked={selected.includes(item.id)} onChange={() => toggleRow(item.id)} />
      ),
      width: 44,
    },
    ...columns.map((col) => ({
      id: col.id,
      name: () => (
        <span
          className={dragging === col.id ? 'order-column-dragged' : ''}
          draggable
          onDragStart={() => setDragging(col.id)}
          onDragOver={(e) => { e.preventDefault(); setDropTarget(col.id); }}
          onDrop={() => dragging && moveColumn(dragging, col.id)}
          onDragEnd={() => { setDragging(null); setDropTarget(null); }}
        >
          {col.name}
        </span>
      ),
      template:
        col.id === 'status'
          ? (item: Order) => <Label theme={STATUSES[item.status].theme}>{STATUSES[item.status].label}</Label>
          : col.id === 'amount'
            ? (item: Order) => `${item.amount.toLocaleString('ru-RU')} ₽`
            : undefined,
    })),
  ];

  const navLabels = (key: NavKey) => NAV_ITEMS.find((item) => item.key === key)?.label ?? '';

  const ordersByStatus = useMemo(() => {
    if (grouping === 'none') return null;
    return (['new', 'processing', 'paid', 'shipped', 'done'] as StatusKey[])
      .map((status) => ({ status, orders: ORDERS.filter((order) => order.status === status) }))
      .filter((group) => group.orders.length > 0);
  }, [grouping]);

  return (
    <Flex className="admin-shell">
      <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <Button view="flat" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          {!collapsed && <span className="admin-brand">Admin</span>}
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item ${nav === item.key ? 'admin-nav-item--active' : ''}`}
              onClick={() => setNav(item.key)}
              title={item.label}
            >
              {item.icon}
              {!collapsed && <span className="admin-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-toolbar">
          <div>
            <h1 className="admin-toolbar-title">{navLabels(nav)}</h1>
            <div className="admin-subtitle">Заказы клиентов · {ORDERS.length} записей</div>
          </div>
          <Flex gap="6" alignItems="center">
            <SegmentedRadioGroup
              value={grouping}
              onUpdate={(value) => setGrouping(value)}
              options={[
                { value: 'none', content: 'Плоский список' },
                { value: 'by-status', content: 'По статусам' },
              ]}
            />
          </Flex>
        </div>

        <div className="admin-table-card">
          <Flex alignItems="center" justifyContent="space-between" className="admin-subtitle" style={{ marginBottom: 12 }}>
            <span>Перетащите заголовки колонок, чтобы изменить порядок.</span>
            {selected.length > 0 && <Label theme="success">Выбрано: {selected.length}</Label>}
          </Flex>

          {grouping === 'none' ? (
            <Table<Order>
              columns={dataTableColumns}
              data={ORDERS}
              onRowClick={(item) => toggleRow(item.id)}
              getRowDescriptor={(item) => ({ id: item.id, classNames: selected.includes(item.id) ? ['order-row--selected'] : [] })}
              emptyMessage="Нет данных"
              stickyHorizontalScroll
            />
          ) : (
            ordersByStatus?.map(({ status, orders }) => (
              <div key={status} className="order-group">
                <div className="order-group-header">
                  <Label theme={STATUSES[status].theme}>{STATUSES[status].label}</Label>
                  <span className="admin-subtitle">{orders.length}</span>
                </div>
                <Table<Order>
                  columns={dataTableColumns}
                  data={orders}
                  onRowClick={(item) => toggleRow(item.id)}
                  getRowDescriptor={(item) => ({ id: item.id, classNames: selected.includes(item.id) ? ['order-row--selected'] : [] })}
                  emptyMessage="Нет заказов"
                  stickyHorizontalScroll
                />
              </div>
            ))
          )}

          <div className="admin-footer">
            <span>{selected.length ? `Выделено ${selected.length} из ${ORDERS.length}` : 'Нет активного выделения'}</span>
            <span>Группировка: {grouping === 'none' ? 'нет' : 'по статусу'}</span>
          </div>
        </div>
      </main>
    </Flex>
  );
}
