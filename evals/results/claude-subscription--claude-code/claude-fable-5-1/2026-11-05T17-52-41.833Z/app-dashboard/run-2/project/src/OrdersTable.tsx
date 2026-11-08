import * as React from 'react';
import {
  ActionsPanel,
  Button,
  Checkbox,
  Icon,
  Label,
  Switch,
  Table,
  Text,
  TextInput,
  withTableSettings,
  withTableSorting,
} from '@gravity-ui/uikit';
import type {
  TableColumnConfig,
  TableSettingsData,
  TableSortState,
  WithTableSortingProps,
} from '@gravity-ui/uikit';
import { ChevronDown, ChevronRight, Grip, Magnifier } from '@gravity-ui/icons';
import {
  PAYMENT_TITLE,
  STATUS_META,
  STATUS_ORDER,
  formatDate,
  formatMoney,
  pluralize,
} from './orders';
import type { Order, OrderStatus } from './orders';
import './OrdersTable.css';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type GroupRow = {
  kind: 'group';
  key: string;
  status: OrderStatus;
  orders: Order[];
  collapsed: boolean;
};
type OrderRow = { kind: 'order'; key: string; order: Order };
type Row = GroupRow | OrderRow;

type DropSide = 'before' | 'after';

interface ColumnDef {
  id: string;
  title: string;
  width?: number;
  align?: 'start' | 'end';
  primary?: boolean;
  defaultSortOrder?: 'asc' | 'desc';
  accessor: (order: Order) => string | number;
  render?: (order: Order) => React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Column definitions                                                  */
/* ------------------------------------------------------------------ */

const COLUMNS: ColumnDef[] = [
  { id: 'id', title: '№ заказа', width: 120, primary: true, accessor: (o) => o.id },
  {
    id: 'customer',
    title: 'Клиент',
    width: 220,
    accessor: (o) => o.customer,
    render: (o) => (
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
    id: 'createdAt',
    title: 'Дата',
    width: 130,
    defaultSortOrder: 'desc',
    accessor: (o) => o.createdAt,
    render: (o) => formatDate(o.createdAt),
  },
  {
    id: 'status',
    title: 'Статус',
    width: 130,
    accessor: (o) => STATUS_ORDER.indexOf(o.status),
    render: (o) => <StatusLabel status={o.status} />,
  },
  { id: 'items', title: 'Товаров', width: 80, align: 'end', accessor: (o) => o.items },
  {
    id: 'total',
    title: 'Сумма',
    width: 120,
    align: 'end',
    defaultSortOrder: 'desc',
    accessor: (o) => o.total,
    render: (o) => formatMoney(o.total),
  },
  { id: 'payment', title: 'Оплата', width: 100, accessor: (o) => PAYMENT_TITLE[o.payment] },
  { id: 'city', title: 'Город', width: 160, accessor: (o) => o.city },
];

const DEFAULT_SETTINGS: TableSettingsData = COLUMNS.map((c) => ({ id: c.id, isSelected: true }));
const DEFAULT_SORT: TableSortState = [{ column: 'createdAt', order: 'desc' }];
/** Must match `selectionColumnId` of uikit so the settings popup skips this column. */
const SELECTION_COLUMN_ID = '_selection';

const EnhancedTable = withTableSettings<Row, WithTableSortingProps>({ sortable: true })(
  withTableSorting<Row>(Table),
);

export function StatusLabel({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Label theme={meta.theme} size="xs">
      {meta.title}
    </Label>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface OrdersTableProps {
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
}

export function OrdersTable({ orders, onOrdersChange }: OrdersTableProps) {
  const [query, setQuery] = React.useState('');
  const [grouped, setGrouped] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<OrderStatus>>(() => new Set());
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [settings, setSettings] = React.useState<TableSettingsData>(DEFAULT_SETTINGS);
  const [sortState, setSortState] = React.useState<TableSortState>(DEFAULT_SORT);
  const [dragOver, setDragOver] = React.useState<{ id: string; side: DropSide } | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const dragSourceRef = React.useRef<string | null>(null);
  const lastToggledIndexRef = React.useRef<number | null>(null);

  /* ---------- data: filter → sort → group ---------- */

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.id, o.customer, o.email, o.city].some((v) => v.toLowerCase().includes(q)),
    );
  }, [orders, query]);

  const sorted = React.useMemo(() => {
    if (sortState.length === 0) return filtered;
    const comparators = sortState
      .map((s) => ({ column: COLUMNS.find((c) => c.id === s.column), order: s.order }))
      .filter((s) => s.column);
    return [...filtered].sort((a, b) => {
      for (const { column, order } of comparators) {
        const va = column!.accessor(a);
        const vb = column!.accessor(b);
        const r =
          typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : String(va).localeCompare(String(vb), 'ru');
        if (r !== 0) return order === 'asc' ? r : -r;
      }
      return 0;
    });
  }, [filtered, sortState]);

  const rows = React.useMemo<Row[]>(() => {
    if (!grouped) {
      return sorted.map((order) => ({ kind: 'order', key: order.id, order }));
    }
    const result: Row[] = [];
    for (const status of STATUS_ORDER) {
      const groupOrders = sorted.filter((o) => o.status === status);
      if (groupOrders.length === 0) continue;
      const collapsed = collapsedGroups.has(status);
      result.push({ kind: 'group', key: `group:${status}`, status, orders: groupOrders, collapsed });
      if (!collapsed) {
        for (const order of groupOrders) result.push({ kind: 'order', key: order.id, order });
      }
    }
    return result;
  }, [sorted, grouped, collapsedGroups]);

  /** Ids of order rows currently visible, in display order (used for shift-range selection). */
  const visibleOrderIds = React.useMemo(
    () => rows.filter((r): r is OrderRow => r.kind === 'order').map((r) => r.order.id),
    [rows],
  );

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredIds = React.useMemo(() => filtered.map((o) => o.id), [filtered]);
  const selectedInFiltered = filteredIds.filter((id) => selectedSet.has(id)).length;

  /* ---------- selection ---------- */

  const toggleOrder = React.useCallback(
    (id: string, shiftKey: boolean) => {
      const position = visibleOrderIds.indexOf(id);
      const last = lastToggledIndexRef.current;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        const shouldSelect = !next.has(id);
        if (shiftKey && last !== null && last >= 0 && position >= 0) {
          const [from, to] = last < position ? [last, position] : [position, last];
          for (const rangeId of visibleOrderIds.slice(from, to + 1)) {
            if (shouldSelect) next.add(rangeId);
            else next.delete(rangeId);
          }
        } else if (shouldSelect) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return Array.from(next);
      });
      lastToggledIndexRef.current = position;
    },
    [visibleOrderIds],
  );

  const setManySelected = React.useCallback((ids: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return Array.from(next);
    });
  }, []);

  const toggleGroup = React.useCallback((status: OrderStatus) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  const applyStatus = (status: OrderStatus) => {
    onOrdersChange(orders.map((o) => (selectedSet.has(o.id) ? { ...o, status } : o)));
    setSelectedIds([]);
  };

  /* ---------- column drag & drop ---------- */

  const moveColumn = React.useCallback((sourceId: string, targetId: string, side: DropSide) => {
    setSettings((prev) => {
      const source = prev.find((s) => s.id === sourceId);
      if (!source || sourceId === targetId) return prev;
      const without = prev.filter((s) => s.id !== sourceId);
      const targetIndex = without.findIndex((s) => s.id === targetId);
      if (targetIndex === -1) return prev;
      const insertAt = side === 'before' ? targetIndex : targetIndex + 1;
      return [...without.slice(0, insertAt), source, ...without.slice(insertAt)];
    });
  }, []);

  const resetDrag = React.useCallback(() => {
    dragSourceRef.current = null;
    setDraggingId(null);
    setDragOver(null);
  }, []);

  /** Resolve the header cell under the pointer to a data column id + drop side. */
  const resolveDropTarget = (event: React.DragEvent): { id: string; side: DropSide } | null => {
    const th = (event.target as Element | null)?.closest?.('th');
    if (!th) return null;
    const handle = th.querySelector<HTMLElement>('[data-column-id]');
    const id = handle?.dataset.columnId;
    if (!id) return null;
    const rect = th.getBoundingClientRect();
    const side: DropSide = event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
    return { id, side };
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    const source = dragSourceRef.current;
    if (!source) return;
    const target = resolveDropTarget(event);
    if (!target || target.id === source) {
      setDragOver(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOver((prev) => (prev && prev.id === target.id && prev.side === target.side ? prev : target));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const source = dragSourceRef.current;
    const target = resolveDropTarget(event);
    if (source && target && target.id !== source) {
      event.preventDefault();
      moveColumn(source, target.id, target.side);
    }
    resetDrag();
  };

  /* ---------- columns ---------- */

  const firstVisibleColumnId = React.useMemo(
    () => settings.find((s) => s.isSelected !== false && COLUMNS.some((c) => c.id === s.id))?.id ?? COLUMNS[0].id,
    [settings],
  );

  const columns = React.useMemo<TableColumnConfig<Row>[]>(() => {
    const allFilteredSelected = filteredIds.length > 0 && selectedInFiltered === filteredIds.length;

    const selectionColumn: TableColumnConfig<Row> = {
      id: SELECTION_COLUMN_ID,
      className: 'orders-table__checkbox-cell',
      meta: { selectedAlways: true },
      name: () => (
        <Checkbox
          size="l"
          className="orders-table__checkbox"
          checked={allFilteredSelected}
          indeterminate={selectedInFiltered > 0 && !allFilteredSelected}
          disabled={filteredIds.length === 0}
          onUpdate={(checked) => setManySelected(filteredIds, checked)}
          controlProps={{ 'aria-label': 'Выбрать все заказы' }}
        />
      ),
      template: (row) => {
        if (row.kind === 'group') {
          const ids = row.orders.map((o) => o.id);
          const count = ids.filter((id) => selectedSet.has(id)).length;
          const all = count === ids.length;
          return (
            <Checkbox
              size="l"
              className="orders-table__checkbox"
              checked={all}
              indeterminate={count > 0 && !all}
              onUpdate={(checked) => setManySelected(ids, checked)}
              controlProps={{ 'aria-label': `Выбрать все заказы со статусом «${STATUS_META[row.status].title}»` }}
            />
          );
        }
        const id = row.order.id;
        return (
          <Checkbox
            size="l"
            className="orders-table__checkbox"
            checked={selectedSet.has(id)}
            onChange={(event) => toggleOrder(id, (event.nativeEvent as MouseEvent).shiftKey)}
            controlProps={{ 'aria-label': `Выбрать заказ ${id}` }}
          />
        );
      },
    };

    const dataColumns: TableColumnConfig<Row>[] = COLUMNS.map((col) => {
      const dropSide = dragOver?.id === col.id ? dragOver.side : undefined;
      const isDragging = draggingId === col.id;
      const cellClass = [
        'orders-table__col',
        dropSide ? `orders-table__col_drop_${dropSide}` : '',
        isDragging ? 'orders-table__col_dragging' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: col.id,
        width: col.width,
        align: col.align,
        primary: col.primary,
        className: cellClass,
        meta: { sort: true, defaultSortOrder: col.defaultSortOrder, displayName: col.title },
        name: () => (
          <div
            className="orders-table__header"
            data-column-id={col.id}
            draggable
            title="Перетащите, чтобы изменить порядок колонок"
            onDragStart={(event) => {
              dragSourceRef.current = col.id;
              setDraggingId(col.id);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', col.id);
            }}
            onDragEnd={resetDrag}
          >
            <Icon data={Grip} size={12} className="orders-table__grip" />
            <span>{col.title}</span>
          </div>
        ),
        template: (row) => {
          if (row.kind === 'group') {
            if (col.id !== firstVisibleColumnId) return <span className="orders-table__group-filler" />;
            const count = row.orders.length;
            const total = row.orders.reduce((sum, o) => sum + o.total, 0);
            return (
              <div className="orders-table__group">
                <Icon data={row.collapsed ? ChevronRight : ChevronDown} size={16} className="orders-table__group-chevron" />
                <StatusLabel status={row.status} />
                <Text variant="body-1" color="secondary">
                  {count} {pluralize(count, ['заказ', 'заказа', 'заказов'])} · {formatMoney(total)}
                </Text>
              </div>
            );
          }
          return col.render ? col.render(row.order) : col.accessor(row.order);
        },
      };
    });

    return [selectionColumn, ...dataColumns];
  }, [
    filteredIds,
    selectedInFiltered,
    selectedSet,
    setManySelected,
    toggleOrder,
    dragOver,
    draggingId,
    resetDrag,
    firstVisibleColumnId,
  ]);

  /* ---------- row handlers ---------- */

  const getRowDescriptor = React.useCallback(
    (row: Row) => ({
      id: row.key,
      interactive: true,
      classNames: (row.kind === 'group'
        ? ['orders-table__group-row', row.collapsed && 'orders-table__group-row_collapsed']
        : ['orders-table__row', selectedSet.has(row.order.id) && 'orders-table__row_selected']
      ).filter((c): c is string => Boolean(c)),
    }),
    [selectedSet],
  );

  const handleRowClick = (row: Row, _index: number, event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('.orders-table__checkbox')) return;
    if (row.kind === 'group') {
      toggleGroup(row.status);
      return;
    }
    toggleOrder(row.order.id, event.shiftKey);
  };

  const allCollapsed = grouped && STATUS_ORDER.every((s) => collapsedGroups.has(s));

  /* ---------- render ---------- */

  return (
    <div className="orders-table">
      <div className="orders-table__toolbar">
        <TextInput
          className="orders-table__search"
          size="m"
          placeholder="Поиск по номеру, клиенту, городу"
          value={query}
          onUpdate={setQuery}
          hasClear
          startContent={<Icon data={Magnifier} size={16} className="orders-table__search-icon" />}
        />
        <Switch size="m" checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        {grouped && (
          <Button
            view="flat"
            size="m"
            onClick={() => setCollapsedGroups(allCollapsed ? new Set() : new Set(STATUS_ORDER))}
          >
            {allCollapsed ? 'Развернуть все' : 'Свернуть все'}
          </Button>
        )}
        <div className="orders-table__spacer" />
        <Text color="secondary" variant="body-1">
          {filtered.length === orders.length
            ? `${orders.length} ${pluralize(orders.length, ['заказ', 'заказа', 'заказов'])}`
            : `Найдено ${filtered.length} из ${orders.length}`}
        </Text>
      </div>

      <div
        className={`orders-table__body${draggingId ? ' orders-table__body_dragging' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={(event) => {
          // Browsers often report relatedTarget=null while moving between cells,
          // so fall back to the pointer position to detect leaving the table.
          const rect = event.currentTarget.getBoundingClientRect();
          const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
          if (!inside) setDragOver(null);
        }}
      >
        <EnhancedTable
          data={rows}
          columns={columns}
          width="max"
          verticalAlign="middle"
          edgePadding
          emptyMessage="Ничего не найдено"
          getRowDescriptor={getRowDescriptor}
          onRowClick={handleRowClick}
          sortState={sortState}
          onSortStateChange={setSortState}
          settings={settings}
          updateSettings={async (next) => setSettings(next)}
          defaultSettings={DEFAULT_SETTINGS}
          showResetButton
          aria-label="Таблица заказов"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="orders-table__actions">
          <ActionsPanel
            renderNote={() => `Выбрано: ${selectedIds.length}`}
            onClose={() => setSelectedIds([])}
            actions={[
              {
                id: 'deliver',
                button: {
                  props: {
                    children: 'Отметить доставленными',
                    view: 'normal-contrast',
                    onClick: () => applyStatus('delivered'),
                  },
                },
                dropdown: { item: { text: 'Отметить доставленными', action: () => applyStatus('delivered') } },
              },
              {
                id: 'ship',
                button: {
                  props: {
                    children: 'Отправить',
                    view: 'flat-contrast',
                    onClick: () => applyStatus('shipped'),
                  },
                },
                dropdown: { item: { text: 'Отправить', action: () => applyStatus('shipped') } },
              },
              {
                id: 'cancel',
                button: {
                  props: {
                    children: 'Отменить заказы',
                    view: 'flat-contrast',
                    onClick: () => applyStatus('cancelled'),
                  },
                },
                dropdown: { item: { text: 'Отменить заказы', action: () => applyStatus('cancelled'), theme: 'danger' } },
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
