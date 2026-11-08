import React from 'react';
import {Button, Checkbox, Icon, Label, Switch, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronRight, Grip, TrashBin} from '@gravity-ui/icons';

import {
  Order,
  OrderStatus,
  ORDERS,
  STATUS_META,
  STATUS_ORDER,
  formatDate,
  formatRub,
} from '../data/orders';

type ColumnId = 'id' | 'customer' | 'city' | 'date' | 'items' | 'amount' | 'status';

interface ColumnDef {
  id: ColumnId;
  title: string;
  align?: 'left' | 'right' | 'center';
  width?: number;
  render: (order: Order) => React.ReactNode;
}

const COLUMNS: Record<ColumnId, ColumnDef> = {
  id: {
    id: 'id',
    title: '№ заказа',
    width: 100,
    render: (o) => <Text color="secondary">#{o.id}</Text>,
  },
  customer: {id: 'customer', title: 'Клиент', render: (o) => o.customer},
  city: {id: 'city', title: 'Город', render: (o) => o.city},
  date: {id: 'date', title: 'Дата', width: 120, render: (o) => formatDate(o.date)},
  items: {
    id: 'items',
    title: 'Позиции',
    align: 'right',
    width: 90,
    render: (o) => o.items,
  },
  amount: {
    id: 'amount',
    title: 'Сумма',
    align: 'right',
    width: 140,
    render: (o) => formatRub(o.amount),
  },
  status: {
    id: 'status',
    title: 'Статус',
    width: 140,
    render: (o) => (
      <Label theme={STATUS_META[o.status].theme}>{STATUS_META[o.status].title}</Label>
    ),
  },
};

const DEFAULT_ORDER: ColumnId[] = [
  'id',
  'customer',
  'city',
  'date',
  'items',
  'amount',
  'status',
];

interface OrderGroup {
  status: OrderStatus;
  orders: Order[];
  total: number;
}

export function OrdersTable() {
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(DEFAULT_ORDER);
  const [selected, setSelected] = React.useState<ReadonlySet<number>>(new Set());
  const [grouped, setGrouped] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<ReadonlySet<OrderStatus>>(
    new Set(),
  );
  const [dragId, setDragId] = React.useState<ColumnId | null>(null);
  const [overId, setOverId] = React.useState<ColumnId | null>(null);
  const lastClickedId = React.useRef<number | null>(null);

  const columns = columnOrder.map((id) => COLUMNS[id]);

  const groups = React.useMemo<OrderGroup[]>(() => {
    return STATUS_ORDER.map((status) => {
      const orders = ORDERS.filter((o) => o.status === status);
      return {
        status,
        orders,
        total: orders.reduce((sum, o) => sum + o.amount, 0),
      };
    }).filter((g) => g.orders.length > 0);
  }, []);

  // Flat list of currently visible rows — needed for shift-range selection.
  const visibleOrders = React.useMemo<Order[]>(() => {
    if (!grouped) return ORDERS;
    return groups.flatMap((g) => (collapsedGroups.has(g.status) ? [] : g.orders));
  }, [grouped, groups, collapsedGroups]);

  /* ── selection ─────────────────────────────────────────── */

  const toggleOne = (order: Order, shiftKey: boolean) => {
    const next = new Set(selected);
    if (shiftKey && lastClickedId.current !== null) {
      const ids = visibleOrders.map((o) => o.id);
      const from = ids.indexOf(lastClickedId.current);
      const to = ids.indexOf(order.id);
      if (from !== -1 && to !== -1) {
        const [a, b] = from < to ? [from, to] : [to, from];
        for (let i = a; i <= b; i += 1) next.add(ids[i]);
      } else {
        next.has(order.id) ? next.delete(order.id) : next.add(order.id);
      }
    } else {
      next.has(order.id) ? next.delete(order.id) : next.add(order.id);
    }
    lastClickedId.current = order.id;
    setSelected(next);
  };

  const allSelected = ORDERS.length > 0 && selected.size === ORDERS.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(ORDERS.map((o) => o.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const toggleGroup = (status: OrderStatus) => {
    const next = new Set(collapsedGroups);
    next.has(status) ? next.delete(status) : next.add(status);
    setCollapsedGroups(next);
  };

  const selectedTotal = React.useMemo(
    () => ORDERS.filter((o) => selected.has(o.id)).reduce((s, o) => s + o.amount, 0),
    [selected],
  );

  /* ── column drag & drop ────────────────────────────────── */

  const reorderColumns = (from: ColumnId, to: ColumnId) => {
    setColumnOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(from);
      const toIdx = next.indexOf(to);
      if (fromIdx === -1 || toIdx === -1) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, from);
      return next;
    });
  };

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  /* ── render ────────────────────────────────────────────── */

  const renderRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr
        key={order.id}
        className={isSelected ? 'orders-row orders-row_selected' : 'orders-row'}
        onClick={(e) => toggleOne(order, e.shiftKey)}
      >
        <td className="orders-cell orders-cell_check" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onUpdate={() => toggleOne(order, false)}
            aria-label={`Выбрать заказ #${order.id}`}
          />
        </td>
        {columns.map((col) => (
          <td
            key={col.id}
            className="orders-cell"
            style={{textAlign: col.align ?? 'left'}}
          >
            {col.render(order)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="orders">
      <div className="orders__toolbar">
        <div className="orders__toolbar-left">
          <Switch
            checked={grouped}
            onUpdate={setGrouped}
            content="Группировать по статусу"
          />
          {selected.size > 0 && (
            <Text color="secondary" className="orders__selection-info">
              Выбрано: {selected.size} · на {formatRub(selectedTotal)}
            </Text>
          )}
        </div>
        <div className="orders__toolbar-right">
          {selected.size > 0 && (
            <Button view="flat-danger" onClick={clearSelection}>
              <Icon data={TrashBin} size={16} />
              Снять выделение
            </Button>
          )}
          <Text color="secondary">Всего заказов: {ORDERS.length}</Text>
        </div>
      </div>

      <div className="orders__scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="orders-head orders-head_check">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onUpdate={toggleAll}
                  aria-label="Выбрать все заказы"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  draggable
                  className={[
                    'orders-head',
                    'orders-head_draggable',
                    dragId === col.id ? 'orders-head_dragging' : '',
                    overId === col.id && dragId !== col.id ? 'orders-head_drop-target' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{width: col.width, textAlign: col.align ?? 'left'}}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', col.id);
                    setDragId(col.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (overId !== col.id) setOverId(col.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from =
                      dragId ?? (e.dataTransfer.getData('text/plain') as ColumnId);
                    if (from && from !== col.id) reorderColumns(from, col.id);
                    endDrag();
                  }}
                  onDragEnd={endDrag}
                  title="Перетащите, чтобы изменить порядок колонок"
                >
                  <span className="orders-head__content">
                    <Icon data={Grip} size={14} className="orders-head__grip" />
                    {col.title}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped
              ? groups.map((group) => {
                  const collapsed = collapsedGroups.has(group.status);
                  return (
                    <React.Fragment key={group.status}>
                      <tr
                        className="orders-group-row"
                        onClick={() => toggleGroup(group.status)}
                      >
                        <td colSpan={columns.length + 1}>
                          <span className="orders-group-row__content">
                            <Icon
                              data={collapsed ? ChevronRight : ChevronDown}
                              size={16}
                            />
                            <Label theme={STATUS_META[group.status].theme}>
                              {STATUS_META[group.status].title}
                            </Label>
                            <Text color="secondary">
                              {group.orders.length} заказов · {formatRub(group.total)}
                            </Text>
                          </span>
                        </td>
                      </tr>
                      {!collapsed && group.orders.map(renderRow)}
                    </React.Fragment>
                  );
                })
              : ORDERS.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
