import { ArrowRotateLeft, ChevronDown, ChevronRight, Grip, Magnifier } from '@gravity-ui/icons';
import {
  ActionsPanel,
  Button,
  Icon,
  Label,
  Select,
  Switch,
  Table,
  TableSortIndicator,
  Text,
  TextInput,
  withTableSelection,
  type ActionsPanelProps,
  type TableColumnConfig,
} from '@gravity-ui/uikit';
import * as React from 'react';
import {
  PAYMENT_TITLE,
  STATUS_META,
  STATUS_ORDER,
  formatDate,
  formatMoney,
  type Order,
  type OrderStatus,
} from '../data/orders';
import { moveColumn, restoreColumnOrder, type DropSide } from './columnOrder';
import './OrdersTable.css';

const SelectableTable = withTableSelection<Order>(Table);
type ActionsPanelItem = ActionsPanelProps['actions'][number];

type ColumnId = 'number' | 'customer' | 'status' | 'items' | 'total' | 'payment' | 'city' | 'createdAt';
type SortOrder = 'asc' | 'desc';
interface SortState {
  column: ColumnId;
  order: SortOrder;
}
interface ColumnDef {
  id: ColumnId;
  title: string;
  width?: number;
  align?: 'start' | 'end';
  primary?: boolean;
  sortable?: boolean;
  defaultSortOrder?: SortOrder;
  template?: (order: Order) => React.ReactNode;
  compare?: (a: Order, b: Order) => number;
}

const byString = (key: keyof Order) => (a: Order, b: Order) => String(a[key]).localeCompare(String(b[key]), 'ru');
const byNumber = (key: keyof Order) => (a: Order, b: Order) => Number(a[key]) - Number(b[key]);

const COLUMN_DEFS: ColumnDef[] = [
  { id: 'number', title: 'Номер', width: 96, primary: true, sortable: true, compare: byString('number') },
  {
    id: 'customer',
    title: 'Клиент',
    width: 240,
    sortable: true,
    compare: byString('customer'),
    template: (o) => (
      <div className="orders-table__customer">
        <Text variant="body-1" ellipsis>
          {o.customer}
        </Text>
        <Text variant="caption-2" color="secondary" ellipsis>
          {o.email}
        </Text>
      </div>
    ),
  },
  {
    id: 'status',
    title: 'Статус',
    width: 140,
    sortable: true,
    compare: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    template: (o) => <Label theme={STATUS_META[o.status].theme}>{STATUS_META[o.status].title}</Label>,
  },
  { id: 'items', title: 'Позиций', width: 90, align: 'end', sortable: true, compare: byNumber('items') },
  {
    id: 'total',
    title: 'Сумма',
    width: 120,
    align: 'end',
    sortable: true,
    defaultSortOrder: 'desc',
    compare: byNumber('total'),
    template: (o) => <span className="orders-table__money">{formatMoney(o.total)}</span>,
  },
  { id: 'payment', title: 'Оплата', width: 110, template: (o) => PAYMENT_TITLE[o.payment] },
  { id: 'city', title: 'Город', width: 170, sortable: true, compare: byString('city') },
  {
    id: 'createdAt',
    title: 'Создан',
    width: 130,
    sortable: true,
    defaultSortOrder: 'desc',
    compare: byString('createdAt'),
    template: (o) => formatDate(o.createdAt),
  },
];

export const DEFAULT_COLUMN_ORDER: ColumnId[] = COLUMN_DEFS.map((c) => c.id);
const COLUMN_ORDER_STORAGE_KEY = 'admin.orders.columnOrder';

function loadColumnOrder(): ColumnId[] {
  try {
    const raw = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
    return raw ? restoreColumnOrder(JSON.parse(raw), DEFAULT_COLUMN_ORDER) : DEFAULT_COLUMN_ORDER;
  } catch {
    return DEFAULT_COLUMN_ORDER;
  }
}

interface DragState {
  source: ColumnId | null;
  target: ColumnId | null;
  side: DropSide;
}
const IDLE_DRAG: DragState = { source: null, target: null, side: 'before' };

interface HeaderCellProps {
  column: ColumnDef;
  sortOrder?: SortOrder;
  dragging: boolean;
  onSort: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onKeyboardMove: (direction: -1 | 1) => void;
}

function HeaderCell({
  column,
  sortOrder,
  dragging,
  onSort,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onKeyboardMove,
}: HeaderCellProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      onKeyboardMove(e.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSort();
    }
  };

  return (
    <div
      className={[
        'orders-table__head',
        column.align === 'end' ? 'orders-table__head_align_end' : '',
        column.sortable ? 'orders-table__head_sortable' : '',
        dragging ? 'orders-table__head_dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      draggable
      aria-sort={sortOrder ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
      title={`${column.title}. Перетащите, чтобы изменить порядок колонок${column.sortable ? ', нажмите для сортировки' : ''}. Alt+←/→ — переместить с клавиатуры`}
      onClick={column.sortable ? onSort : undefined}
      onKeyDown={handleKeyDown}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="orders-table__grip" aria-hidden>
        <Icon data={Grip} size={12} />
      </span>
      <span className="orders-table__head-title">{column.title}</span>
      {column.sortable && (
        <span className={`orders-table__sort${sortOrder ? ' orders-table__sort_active' : ''}`}>
          <TableSortIndicator order={sortOrder} />
        </span>
      )}
    </div>
  );
}

interface OrdersTableProps {
  orders: Order[];
  onOrdersChange: (next: Order[]) => void;
}

export function OrdersTable({ orders, onOrdersChange }: OrdersTableProps) {
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus[]>([]);
  const [groupByStatus, setGroupByStatus] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<OrderStatus>>(() => new Set());
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<SortState | null>({ column: 'createdAt', order: 'desc' });
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(loadColumnOrder);
  const [drag, setDrag] = React.useState<DragState>(IDLE_DRAG);

  React.useEffect(() => {
    try {
      localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(columnOrder));
    } catch {
      // Storage may be unavailable (private mode, quota); the order still works for the session.
    }
  }, [columnOrder]);

  // Drop selection entries whose orders no longer exist (e.g. after deletion).
  React.useEffect(() => {
    const existing = new Set(orders.map((o) => o.id));
    setSelectedIds((prev) => (prev.every((id) => existing.has(id)) ? prev : prev.filter((id) => existing.has(id))));
  }, [orders]);

  /* ---------- filtering + sorting ---------- */

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter.length > 0 && !statusFilter.includes(o.status)) return false;
      if (!q) return true;
      return [o.number, o.customer, o.email, o.city].some((v) => v.toLowerCase().includes(q));
    });
  }, [orders, query, statusFilter]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const def = COLUMN_DEFS.find((c) => c.id === sort.column);
    if (!def?.compare) return filtered;
    const compare = def.compare;
    const sign = sort.order === 'asc' ? 1 : -1;
    return filtered.slice().sort((a, b) => sign * compare(a, b));
  }, [filtered, sort]);

  const groups = React.useMemo(() => {
    if (!groupByStatus) return null;
    return STATUS_ORDER.map((status) => ({
      status,
      rows: sorted.filter((o) => o.status === status),
    })).filter((g) => g.rows.length > 0);
  }, [sorted, groupByStatus]);

  /* ---------- header interactions ---------- */

  const toggleSort = React.useCallback((column: ColumnDef) => {
    setSort((prev) => {
      const stack: (SortOrder | null)[] =
        column.defaultSortOrder === 'desc' ? ['desc', 'asc', null] : ['asc', 'desc', null];
      const currentIndex = prev?.column === column.id ? stack.indexOf(prev.order) : -1;
      const next = stack[(currentIndex + 1) % stack.length];
      return next ? { column: column.id, order: next } : null;
    });
  }, []);

  const handleKeyboardMove = React.useCallback((id: ColumnId, direction: -1 | 1) => {
    setColumnOrder((prev) => {
      const index = prev.indexOf(id);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      return moveColumn(prev, id, prev[targetIndex], direction < 0 ? 'before' : 'after');
    });
  }, []);

  const columns = React.useMemo<TableColumnConfig<Order>[]>(
    () =>
      columnOrder.map((id) => {
        const def = COLUMN_DEFS.find((c) => c.id === id)!;
        const isDropTarget = drag.target === id && drag.source !== id;
        const classNames = ['orders-table__col'];
        if (isDropTarget) classNames.push(`orders-table__col_drop_${drag.side}`);
        if (drag.source === id) classNames.push('orders-table__col_source');

        return {
          id,
          width: def.width,
          align: def.align,
          primary: def.primary,
          className: classNames.join(' '),
          template: def.template ?? ((o: Order) => String(o[id])),
          name: () => (
            <HeaderCell
              column={def}
              sortOrder={sort?.column === id ? sort.order : undefined}
              dragging={drag.source === id}
              onSort={() => toggleSort(def)}
              onKeyboardMove={(direction) => handleKeyboardMove(id, direction)}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', id);
                setDrag({ source: id, target: null, side: 'before' });
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const rect = e.currentTarget.getBoundingClientRect();
                const side: DropSide = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
                setDrag((prev) =>
                  prev.target === id && prev.side === side ? prev : { ...prev, target: id, side },
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                const source = (e.dataTransfer.getData('text/plain') || drag.source) as ColumnId | '';
                const rect = e.currentTarget.getBoundingClientRect();
                const side: DropSide = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
                if (source && DEFAULT_COLUMN_ORDER.includes(source)) {
                  setColumnOrder((prev) => moveColumn(prev, source, id, side));
                }
                setDrag(IDLE_DRAG);
              }}
              onDragEnd={() => setDrag(IDLE_DRAG)}
            />
          ),
        };
      }),
    [columnOrder, drag, sort, toggleSort, handleKeyboardMove],
  );

  /* ---------- selection + bulk actions ---------- */

  const toggleRow = React.useCallback((order: Order) => {
    setSelectedIds((prev) => (prev.includes(order.id) ? prev.filter((id) => id !== order.id) : [...prev, order.id]));
  }, []);

  const updateSelected = (patch: (o: Order) => Order) => {
    const ids = new Set(selectedIds);
    onOrdersChange(orders.map((o) => (ids.has(o.id) ? patch(o) : o)));
    setSelectedIds([]);
  };

  const bulkActions: ActionsPanelItem[] = [
    {
      id: 'ship',
      button: { props: { children: 'Отправить', onClick: () => updateSelected((o) => ({ ...o, status: 'shipped' })) } },
      dropdown: { item: { text: 'Отправить', action: () => updateSelected((o) => ({ ...o, status: 'shipped' })) } },
    },
    {
      id: 'deliver',
      button: {
        props: { children: 'Доставлено', onClick: () => updateSelected((o) => ({ ...o, status: 'delivered' })) },
      },
      dropdown: { item: { text: 'Доставлено', action: () => updateSelected((o) => ({ ...o, status: 'delivered' })) } },
    },
    {
      id: 'cancel',
      button: { props: { children: 'Отменить', onClick: () => updateSelected((o) => ({ ...o, status: 'cancelled' })) } },
      dropdown: { item: { text: 'Отменить', action: () => updateSelected((o) => ({ ...o, status: 'cancelled' })) } },
    },
    {
      id: 'delete',
      collapsed: true,
      button: { props: { children: 'Удалить' } },
      dropdown: {
        item: {
          text: 'Удалить',
          theme: 'danger',
          action: () => {
            const ids = new Set(selectedIds);
            onOrdersChange(orders.filter((o) => !ids.has(o.id)));
            setSelectedIds([]);
          },
        },
      },
    },
  ];

  const toggleGroup = (status: OrderStatus) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  const renderTable = (rows: Order[], label: string) => (
    <SelectableTable
      data={rows}
      columns={columns}
      getRowDescriptor={(o) => ({ id: o.id })}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      onRowClick={toggleRow}
      width="max"
      verticalAlign="middle"
      className="orders-table__grid"
      emptyMessage="Заказы не найдены"
      aria-label={label}
    />
  );

  const isDefaultOrder = columnOrder.every((id, i) => id === DEFAULT_COLUMN_ORDER[i]);

  return (
    <div className={`orders-table${drag.source ? ' orders-table_dragging' : ''}`}>
      <div className="orders-table__toolbar">
        <TextInput
          size="m"
          placeholder="Поиск по номеру, клиенту, городу"
          value={query}
          onUpdate={setQuery}
          hasClear
          startContent={<Icon data={Magnifier} size={16} className="orders-table__search-icon" />}
          className="orders-table__search"
        />
        <Select
          size="m"
          multiple
          hasClear
          placeholder="Все статусы"
          value={statusFilter}
          onUpdate={(v) => setStatusFilter(v as OrderStatus[])}
          options={STATUS_ORDER.map((s) => ({ value: s, content: STATUS_META[s].title }))}
          width={200}
        />
        <Switch size="m" checked={groupByStatus} onUpdate={setGroupByStatus}>
          Группировать по статусу
        </Switch>
        <div className="orders-table__toolbar-spacer" />
        <Text variant="body-1" color="secondary">
          {selectedIds.length > 0 ? `Выбрано ${selectedIds.length} из ${filtered.length}` : `Заказов: ${filtered.length}`}
        </Text>
        {!isDefaultOrder && (
          <Button view="flat-secondary" size="m" onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}>
            <Icon data={ArrowRotateLeft} size={16} />
            Сбросить колонки
          </Button>
        )}
      </div>

      {groups ? (
        <div className="orders-table__groups">
          {groups.length === 0 && (
            <div className="orders-table__empty">
              <Text color="secondary">Заказы не найдены</Text>
            </div>
          )}
          {groups.map(({ status, rows }) => {
            const collapsed = collapsedGroups.has(status);
            const selectedInGroup = rows.filter((o) => selectedIds.includes(o.id)).length;
            const sum = rows.reduce((acc, o) => acc + o.total, 0);
            return (
              <section key={status} className="orders-table__group" aria-label={STATUS_META[status].title}>
                <div
                  role="button"
                  tabIndex={0}
                  className="orders-table__group-header"
                  onClick={() => toggleGroup(status)}
                  aria-expanded={!collapsed}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGroup(status);
                    }
                  }}
                >
                  <Icon data={collapsed ? ChevronRight : ChevronDown} size={16} />
                  <Label theme={STATUS_META[status].theme} size="m">
                    {STATUS_META[status].title}
                  </Label>
                  <Text variant="subheader-1">{rows.length}</Text>
                  <Text variant="body-1" color="secondary">
                    {formatMoney(sum)}
                  </Text>
                  {selectedInGroup > 0 && (
                    <Text variant="body-1" color="info">
                      выбрано {selectedInGroup}
                    </Text>
                  )}
                </div>
                {!collapsed && renderTable(rows, `Заказы: ${STATUS_META[status].title}`)}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="orders-table__single">{renderTable(sorted, 'Заказы')}</div>
      )}

      {selectedIds.length > 0 && (
        <div className="orders-table__actions">
          <ActionsPanel
            actions={bulkActions}
            onClose={() => setSelectedIds([])}
            renderNote={() => `Выбрано: ${selectedIds.length}`}
          />
        </div>
      )}
    </div>
  );
}
