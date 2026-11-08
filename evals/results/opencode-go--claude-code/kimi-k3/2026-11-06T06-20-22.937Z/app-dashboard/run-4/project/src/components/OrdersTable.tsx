import React from 'react';
import {Button, Checkbox, Icon, Label, Switch, Text} from '@gravity-ui/uikit';
import {ArrowRotateLeft, ChevronDown, ChevronRight, Grip} from '@gravity-ui/icons';

import {
  ORDER_STATUSES,
  ORDERS,
  STATUS_BY_ID,
  formatAmount,
  formatDate,
  type Order,
  type OrderStatus,
} from '../data/orders';

type ColumnId = 'id' | 'customer' | 'city' | 'date' | 'items' | 'amount' | 'status';

interface ColumnDef {
  id: ColumnId;
  title: string;
  align?: 'left' | 'right';
  render: (order: Order) => React.ReactNode;
}

const COLUMNS: Record<ColumnId, ColumnDef> = {
  id: {id: 'id', title: '№ заказа', render: (o) => o.id},
  customer: {
    id: 'customer',
    title: 'Клиент',
    render: (o) => (
      <span className="orders-table__customer">
        <span className="orders-table__customer-name">{o.customer}</span>
        <span className="orders-table__customer-email">{o.email}</span>
      </span>
    ),
  },
  city: {id: 'city', title: 'Город', render: (o) => o.city},
  date: {id: 'date', title: 'Дата', render: (o) => formatDate(o.date)},
  items: {id: 'items', title: 'Товары', align: 'right', render: (o) => o.items},
  amount: {
    id: 'amount',
    title: 'Сумма',
    align: 'right',
    render: (o) => <span className="orders-table__amount">{formatAmount(o.amount)}</span>,
  },
  status: {
    id: 'status',
    title: 'Статус',
    render: (o) => {
      const meta = STATUS_BY_ID[o.status];
      return <Label theme={meta.theme}>{meta.title}</Label>;
    },
  },
};

const DEFAULT_COLUMN_ORDER: ColumnId[] = ['id', 'customer', 'city', 'date', 'items', 'amount', 'status'];

const sortedOrders = [...ORDERS].sort((a, b) => b.date.localeCompare(a.date));

export function OrdersTable() {
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [draggedId, setDraggedId] = React.useState<ColumnId | null>(null);
  const [dropTarget, setDropTarget] = React.useState<{id: ColumnId; before: boolean} | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [groupByStatus, setGroupByStatus] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<OrderStatus>>(() => new Set());

  const columns = columnOrder.map((id) => COLUMNS[id]);
  const columnOrderChanged = columnOrder.some((id, i) => id !== DEFAULT_COLUMN_ORDER[i]);

  // ---- selection ----
  const allSelected = selected.size === sortedOrders.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(sortedOrders.map((o) => o.id)) : new Set());
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ---- column drag & drop ----
  const handleDragStart = (e: React.DragEvent, id: ColumnId) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: ColumnId) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) {
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const before = e.clientX < rect.left + rect.width / 2;
    e.dataTransfer.dropEffect = 'move';
    setDropTarget((prev) =>
      prev && prev.id === id && prev.before === before ? prev : {id, before},
    );
  };

  const handleDrop = (e: React.DragEvent, id: ColumnId) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const before = e.clientX < rect.left + rect.width / 2;
      setColumnOrder((prev) => {
        const next = prev.filter((c) => c !== draggedId);
        let index = next.indexOf(id);
        if (!before) {
          index += 1;
        }
        next.splice(index, 0, draggedId);
        return next;
      });
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  // ---- grouping ----
  const toggleGroup = (status: OrderStatus) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const renderRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr
        key={order.id}
        className={`orders-table__row${isSelected ? ' orders-table__row_selected' : ''}`}
        onClick={() => toggleRow(order.id)}
      >
        <td className="orders-table__cell orders-table__cell_checkbox" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            size="l"
            checked={isSelected}
            onUpdate={() => toggleRow(order.id)}
            aria-label={`Выбрать заказ ${order.id}`}
          />
        </td>
        {columns.map((col) => (
          <td
            key={col.id}
            className="orders-table__cell"
            style={{textAlign: col.align ?? 'left'}}
          >
            {col.render(order)}
          </td>
        ))}
      </tr>
    );
  };

  const renderGroup = (status: OrderStatus, rows: Order[]) => {
    if (rows.length === 0) {
      return null;
    }
    const meta = STATUS_BY_ID[status];
    const collapsed = collapsedGroups.has(status);
    const total = rows.reduce((sum, o) => sum + o.amount, 0);
    return (
      <React.Fragment key={status}>
        <tr className="orders-table__group-row">
          <td colSpan={columns.length + 1} className="orders-table__group-cell">
            <button
              type="button"
              className="orders-table__group-header"
              onClick={() => toggleGroup(status)}
              aria-expanded={!collapsed}
            >
              <Icon
                data={collapsed ? ChevronRight : ChevronDown}
                size={16}
                className="orders-table__group-chevron"
              />
              <Label theme={meta.theme}>{meta.title}</Label>
              <Text variant="body-2" color="secondary">
                {rows.length} {pluralize(rows.length, 'заказ', 'заказа', 'заказов')} ·{' '}
                {formatAmount(total)}
              </Text>
            </button>
          </td>
        </tr>
        {!collapsed && rows.map(renderRow)}
      </React.Fragment>
    );
  };

  return (
    <div className="orders-table__wrapper">
      <div className="orders-table__toolbar">
        <div className="orders-table__toolbar-left">
          <Text variant="subheader-2">
            Заказы <span className="orders-table__muted">({sortedOrders.length})</span>
          </Text>
          {selected.size > 0 && (
            <div className="orders-table__selection">
              <Text variant="body-2" color="info">
                Выбрано: {selected.size}
              </Text>
              <Button view="flat-info" size="s" onClick={() => setSelected(new Set())}>
                Снять выделение
              </Button>
            </div>
          )}
        </div>
        <div className="orders-table__toolbar-right">
          {columnOrderChanged && (
            <Button
              view="flat"
              size="m"
              title="Вернуть порядок колонок по умолчанию"
              onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}
            >
              <Icon data={ArrowRotateLeft} size={16} />
              Сбросить колонки
            </Button>
          )}
          <Switch
            size="l"
            checked={groupByStatus}
            onUpdate={setGroupByStatus}
            content="Группировать по статусу"
          />
        </div>
      </div>

      <div className="orders-table__scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="orders-table__th orders-table__th_checkbox">
                <Checkbox
                  size="l"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onUpdate={toggleAll}
                  aria-label="Выбрать все заказы"
                />
              </th>
              {columns.map((col) => {
                const isDragged = draggedId === col.id;
                const isDropBefore = dropTarget?.id === col.id && dropTarget.before;
                const isDropAfter = dropTarget?.id === col.id && !dropTarget.before;
                return (
                  <th
                    key={col.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, col.id)}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    onDragEnd={handleDragEnd}
                    className={[
                      'orders-table__th',
                      'orders-table__th_draggable',
                      isDragged ? 'orders-table__th_dragged' : '',
                      isDropBefore ? 'orders-table__th_drop-before' : '',
                      isDropAfter ? 'orders-table__th_drop-after' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{textAlign: col.align ?? 'left'}}
                    title="Перетащите, чтобы изменить порядок колонок"
                  >
                    <span className="orders-table__th-inner">
                      <Icon data={Grip} size={14} className="orders-table__grip" />
                      {col.title}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groupByStatus
              ? ORDER_STATUSES.map(({id}) =>
                  renderGroup(
                    id,
                    sortedOrders.filter((o) => o.status === id),
                  ),
                )
              : sortedOrders.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }
  return many;
}
