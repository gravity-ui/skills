import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties, DragEvent, MouseEvent, ReactNode } from 'react';
import {
  Flex,
  Label,
  SegmentedRadioGroup,
  Table,
  Text,
} from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';
import {
  Files,
  Gear,
  House,
  ListCheck,
  Person,
  ShoppingCart,
} from '@gravity-ui/icons';
import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

type OrderStatus = 'new' | 'processing' | 'done' | 'canceled';

interface Order {
  id: string;
  number: string;
  customer: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
}

interface GroupHeader extends Order {
  __group: OrderStatus;
}

type OrderRow = Order | GroupHeader;

type ColumnId = Exclude<keyof Order, 'status'>;

interface DashboardColumn {
  id: ColumnId;
  name: string;
  width: number | string;
  align?: 'start' | 'end';
  render: (order: Order) => ReactNode;
}

const navItems: { id: SectionId; title: string; icon: typeof House }[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'users', title: 'Пользователи', icon: Person },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

const orderStatuses: Record<OrderStatus, string> = {
  new: 'Новые',
  processing: 'В работе',
  done: 'Завершённые',
  canceled: 'Отменённые',
};

const statusOrder: OrderStatus[] = ['new', 'processing', 'done', 'canceled'];

const statusLabels: Record<OrderStatus, { tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  new: { tone: 'info' },
  processing: { tone: 'warning' },
  done: { tone: 'success' },
  canceled: { tone: 'danger' },
};

const orders: Order[] = [
  { id: '1', number: 'ORD-10241', customer: 'Анна Соколова', createdAt: '2026-11-03', total: 18400, status: 'new' },
  { id: '2', number: 'ORD-10242', customer: 'ООО «Северный путь»', createdAt: '2026-11-03', total: 56200, status: 'processing' },
  { id: '3', number: 'ORD-10243', customer: 'Игорь Мельник', createdAt: '2026-11-02', total: 8900, status: 'done' },
  { id: '4', number: 'ORD-10244', customer: 'Мария Клименко', createdAt: '2026-11-02', total: 24150, status: 'canceled' },
  { id: '5', number: 'ORD-10245', customer: 'Сергей Романов', createdAt: '2026-11-01', total: 31800, status: 'processing' },
  { id: '6', number: 'ORD-10246', customer: 'ТехноСервис', createdAt: '2026-11-01', total: 12990, status: 'new' },
  { id: '7', number: 'ORD-10247', customer: 'Дмитрий Волков', createdAt: '2026-10-31', total: 46000, status: 'done' },
  { id: '8', number: 'ORD-10248', customer: 'Ольга Кравец', createdAt: '2026-10-31', total: 7250, status: 'canceled' },
];

const columns: DashboardColumn[] = [
  { id: 'number', name: 'Номер', width: 140, render: (order) => order.number },
  { id: 'customer', name: 'Покупатель', width: 240, render: (order) => order.customer },
  { id: 'createdAt', name: 'Дата', width: 120, render: (order) => order.createdAt },
  { id: 'total', name: 'Сумма', width: 130, align: 'end', render: (order) => `${order.total.toLocaleString('ru-RU')} ₽` },
];

const defaultColumnOrder: ColumnId[] = columns.map((column) => column.id);

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function getSectionHeader(id: SectionId) {
  if (id === 'home') {
    return 'Обзор';
  }
  if (id === 'users') {
    return 'Пользователи';
  }
  if (id === 'orders') {
    return 'Заказы';
  }
  return 'Настройки';
}

function isGroupRow(row: OrderRow): row is GroupHeader {
  return '__group' in row;
}

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('orders');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [grouping, setGrouping] = useState<'none' | 'status'>('status');
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(defaultColumnOrder);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);
  const [draggingColumn, setDraggingColumn] = useState<ColumnId | null>(null);

  const orderedColumns = useMemo(
    () => columnOrder.map((id) => columns.find((column) => column.id === id)!),
    [columnOrder],
  );

  const rowsByStatus = useMemo(() => {
    if (grouping === 'none') {
      return orders.map((order) => [order]);
    }
    return statusOrder.map((status) =>
      orders.filter((order) => order.status === status),
    );
  }, [grouping]);

  const tableData = useMemo<OrderRow[]>(() => {
    if (grouping === 'none') {
      return orders.map((order) => ({ ...order }));
    }
    return rowsByStatus.flatMap((statusRows) => {
      const status = statusRows[0]?.status as OrderStatus;
      return [
        {
          id: `group-${status}`,
          number: '',
          customer: '',
          createdAt: '',
          total: 0,
          status,
          __group: status,
        },
        ...statusRows,
      ];
    });
  }, [grouping, rowsByStatus]);

  const clearSelection = useCallback(() => {
    setSelectedRowIds([]);
    setLastSelectedIndex(null);
  }, []);

  const handleRowClick = useCallback(
    (row: OrderRow, index: number, event: MouseEvent<HTMLTableRowElement>) => {
      if (isGroupRow(row)) {
        return;
      }

      const isRangeSelect = event.shiftKey;
      const isMultiSelect = event.metaKey || event.ctrlKey;
      const isAlreadySelected = selectedRowIds.includes(row.id);
      let nextSelectedIds: string[];

      if (isRangeSelect && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = tableData
          .slice(start, end + 1)
          .filter((item) => !isGroupRow(item))
          .map((item) => item.id);
        nextSelectedIds = isAlreadySelected
          ? selectedRowIds.filter((id) => !rangeIds.includes(id))
          : Array.from(new Set([...selectedRowIds, ...rangeIds]));
      } else if (isMultiSelect) {
        nextSelectedIds = isAlreadySelected
          ? selectedRowIds.filter((id) => id !== row.id)
          : [...selectedRowIds, row.id];
      } else {
        nextSelectedIds = [row.id];
      }

      setSelectedRowIds(nextSelectedIds);
      setLastSelectedIndex(index);
    },
    [tableData, lastSelectedIndex, selectedRowIds],
  );

  const handleHeaderDragStart = useCallback((columnId: ColumnId, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', columnId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingColumn(columnId);
  }, []);

  const handleHeaderDragOver = useCallback((columnId: ColumnId, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleHeaderDrop = useCallback(
    (targetColumnId: ColumnId) => {
      if (!draggingColumn || draggingColumn === targetColumnId) {
        setDraggingColumn(null);
        setDragOverColumn(null);
        return;
      }

      setColumnOrder((currentOrder) => {
        const sourceIndex = currentOrder.indexOf(draggingColumn);
        const targetIndex = currentOrder.indexOf(targetColumnId);
        const nextOrder = [...currentOrder];
        nextOrder.splice(sourceIndex, 1);
        nextOrder.splice(targetIndex, 0, draggingColumn);
        return nextOrder;
      });

      setDraggingColumn(null);
      setDragOverColumn(null);
    },
    [draggingColumn],
  );

  const handleHeaderDragEnd = useCallback(() => {
    setDraggingColumn(null);
    setDragOverColumn(null);
  }, []);

  const resetColumnOrder = useCallback(() => setColumnOrder(defaultColumnOrder), []);
  const selectAllVisible = useCallback(
    () => setSelectedRowIds(orders.map((order) => order.id)),
    [],
  );

  const isRowSelected = (order: Order) => selectedRowIds.includes(order.id);

  const tableColumns: TableColumnConfig<OrderRow>[] = orderedColumns.map((column) => ({
    id: column.id,
    name: () => (
      <div
        className={`orders-table__header${draggingColumn === column.id ? ' orders-table__header_dragging' : ''}${dragOverColumn === column.id ? ' orders-table__header_drop-target' : ''}`}
        draggable
        onDragStart={(event) => handleHeaderDragStart(column.id, event)}
        onDragOver={(event) => handleHeaderDragOver(column.id, event)}
        onDrop={() => handleHeaderDrop(column.id)}
        onDragEnd={handleHeaderDragEnd}
        title="Перетащите, чтобы изменить порядок колонок"
      >
        <span className="orders-table__header-name">{column.name}</span>
        <span aria-hidden className="orders-table__drag-handle">⋮⋮</span>
      </div>
    ),
    align: column.align,
    width: column.width,
    template: (row) =>
      isGroupRow(row)
        ? column.id === 'number'
          ? `${orderStatuses[row.__group]} · ${rowsByStatus.find((statusRows) => statusRows[0]?.status === row.__group)?.length || 0} заказов`
          : ''
        : column.render(row),
  }));

  tableColumns.unshift({
    id: 'status',
    name: 'Статус',
    width: 170,
    template: (row) =>
      isGroupRow(row) ? (
        <Label theme={statusLabels[row.__group].tone}>
          {orderStatuses[row.__group]}
        </Label>
      ) : (
        <Label theme={statusLabels[row.status].tone}>{orderStatuses[row.status]}</Label>
      ),
  });

  const selectedSummary = selectedRowIds.length
    ? `Выбрано заказов: ${selectedRowIds.length}`
    : 'Кликните строку, Shift — диапазон, Ctrl/Cmd — добавить';

  const sectionContent = activeSection === 'orders' ? (
    <div className="orders-panel">
      <div className="orders-panel__toolbar">
        <SegmentedRadioGroup
          value={grouping}
          onUpdate={(value) => setGrouping(value as typeof grouping)}
        >
          <SegmentedRadioGroup.Option value="status">По статусу</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="none">Без групп</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
        <div className="orders-panel__toolbar-actions">
          <button type="button" className="dashboard-button" onClick={selectAllVisible}>
            Выбрать все
          </button>
          <button type="button" className="dashboard-button" onClick={clearSelection}>
            Снять выбор
          </button>
          <button type="button" className="dashboard-button dashboard-button_ghost" onClick={resetColumnOrder}>
            Сбросить колонки
          </button>
        </div>
      </div>
      <div className="orders-panel__hint">{selectedSummary}</div>
      <div className="orders-table-wrap">
        <Table
          className="orders-table"
          data={tableData}
          columns={tableColumns}
          getRowId={(row) => row.id}
          getRowDescriptor={(row) => ({
            classNames: [isRowSelected(row) ? 'orders-table__row_selected' : ''],
            interactive: true,
          })}
          onRowClick={handleRowClick}
          emptyMessage="Заказов нет"
          width="max"
        />
      </div>
    </div>
  ) : (
    <div className="placeholder-panel">
      <Text variant="body-1">
        Раздел «{getSectionHeader(activeSection)}» доступен как часть навигации.
      </Text>
    </div>
  );

  return (
    <div className={`dashboard${collapsed ? ' dashboard_nav-collapsed' : ''}`}>
      <aside className="dashboard-sidebar" aria-label="Основная навигация">
        <button
          type="button"
          className="dashboard-brand"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          <Files className="dashboard-brand__icon" />
          <span className="dashboard-brand__text">Админка</span>
        </button>
        <nav className="dashboard-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`dashboard-nav__item${activeSection === item.id ? ' dashboard-nav__item_active' : ''}`}
                onClick={() => setActiveSection(item.id)}
                title={collapsed ? item.title : undefined}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <Icon className="dashboard-nav__icon" />
                <span className="dashboard-nav__text">{item.title}</span>
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          className="dashboard-collapse"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          <span className="dashboard-collapse__arrow" aria-hidden>{collapsed ? '›' : '‹'}</span>
          <span className="dashboard-collapse__text">Свернуть</span>
        </button>
      </aside>
      <main className="dashboard-content">
        <header className="dashboard-header">
          <Text variant="header-2">{getSectionHeader(activeSection)}</Text>
          <Text color="secondary">{grouping === 'status' ? 'Группировка: статус заказа' : 'Группировка выключена'}</Text>
        </header>
        {sectionContent}
      </main>
    </div>
  );
}
