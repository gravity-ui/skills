import React from 'react';
import {Button, Checkbox, Icon, Label, Switch, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronRight, Grip} from '@gravity-ui/icons';

import {ORDERS, STATUS_META, STATUS_ORDER} from './data';
import type {Order, OrderStatus} from './data';

type ColumnId = 'id' | 'customer' | 'status' | 'total' | 'createdAt' | 'city' | 'payment';

interface Column {
  id: ColumnId;
  title: string;
  align?: 'end';
  render: (order: Order) => React.ReactNode;
}

const money = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});
const dateTime = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC'});

const COLUMNS: Record<ColumnId, Column> = {
  id: {id: 'id', title: 'Заказ', render: (o) => <Text variant="body-1">{o.id}</Text>},
  customer: {id: 'customer', title: 'Клиент', render: (o) => o.customer},
  status: {
    id: 'status',
    title: 'Статус',
    render: (o) => <Label theme={STATUS_META[o.status].theme}>{STATUS_META[o.status].title}</Label>,
  },
  total: {id: 'total', title: 'Сумма', align: 'end', render: (o) => money.format(o.total)},
  createdAt: {id: 'createdAt', title: 'Создан', render: (o) => dateTime.format(new Date(o.createdAt))},
  city: {id: 'city', title: 'Город', render: (o) => o.city},
  payment: {id: 'payment', title: 'Оплата', render: (o) => o.payment},
};

const DEFAULT_ORDER: ColumnId[] = ['id', 'customer', 'status', 'total', 'createdAt', 'city', 'payment'];

// Элемент занимает позицию целевой колонки: при движении вправо оказывается после неё, влево — перед.
function moveItem<T>(list: T[], from: T, to: T): T[] {
  if (from === to) return list;
  const next = list.filter((x) => x !== from);
  next.splice(list.indexOf(to), 0, from);
  return next;
}

export function OrdersTable() {
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(DEFAULT_ORDER);
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());
  const [grouped, setGrouped] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<ReadonlySet<OrderStatus>>(new Set());
  const [dragId, setDragId] = React.useState<ColumnId | null>(null);
  const [overId, setOverId] = React.useState<ColumnId | null>(null);
  const [announcement, setAnnouncement] = React.useState('');
  const headerRefs = React.useRef(new Map<ColumnId, HTMLButtonElement>());

  const columns = columnOrder.map((id) => COLUMNS[id]);
  const colSpan = columns.length + 1;

  const groups = React.useMemo(
    () =>
      STATUS_ORDER.map((status) => {
        const items = ORDERS.filter((o) => o.status === status);
        return {status, items, total: items.reduce((s, o) => s + o.total, 0)};
      }).filter((g) => g.items.length > 0),
    [],
  );

  const allIds = React.useMemo(() => ORDERS.map((o) => o.id), []);
  const allSelected = selected.size === allIds.length;
  const someSelected = selected.size > 0 && !allSelected;

  const setMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const toggleGroup = (status: OrderStatus) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (!next.delete(status)) next.add(status);
      return next;
    });

  const reorder = (from: ColumnId, to: ColumnId) => {
    setColumnOrder((prev) => moveItem(prev, from, to));
  };

  const onHeaderKeyDown = (e: React.KeyboardEvent, id: ColumnId) => {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    const index = columnOrder.indexOf(id);
    const target = columnOrder[index + (e.key === 'ArrowLeft' ? -1 : 1)];
    if (!target) return;
    reorder(id, target);
    setAnnouncement(`Колонка «${COLUMNS[id].title}» перемещена на позицию ${columnOrder.indexOf(target) + 1}`);
    // Фокус остаётся на кнопке заголовка после перерисовки.
    requestAnimationFrame(() => headerRefs.current.get(id)?.focus());
  };

  const renderRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr key={order.id} className="orders__row" data-selected={isSelected}>
        <td className="orders__cell orders__cell_check">
          <Checkbox
            size="m"
            checked={isSelected}
            onUpdate={(on) => setMany([order.id], on)}
            controlProps={{'aria-label': `Выбрать заказ ${order.id}`}}
          />
        </td>
        {columns.map((col) => (
          <td key={col.id} className="orders__cell" data-align={col.align}>
            {col.render(order)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <section className="orders" aria-labelledby="orders-title">
      <header className="orders__toolbar">
        <div>
          <Text as="h1" variant="header-1" id="orders-title">
            Заказы
          </Text>
          <Text color="secondary">
            {selected.size > 0 ? `Выбрано ${selected.size} из ${ORDERS.length}` : `Всего ${ORDERS.length}`}
          </Text>
        </div>
        <div className="orders__toolbar-actions">
          {selected.size > 0 && (
            <Button view="flat" onClick={() => setSelected(new Set())}>
              Сбросить выделение
            </Button>
          )}
          <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        </div>
      </header>

      <div className="orders__scroll">
        <table className="orders__table">
          <thead>
            <tr>
              <th className="orders__th orders__cell_check">
                <Checkbox
                  size="m"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onUpdate={(on) => setMany(allIds, on)}
                  controlProps={{'aria-label': 'Выбрать все заказы'}}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className="orders__th"
                  data-align={col.align}
                  data-dragging={dragId === col.id}
                  data-over={overId === col.id && dragId !== col.id ? (columnOrder.indexOf(dragId!) < columnOrder.indexOf(col.id) ? 'after' : 'before') : undefined}
                  draggable
                  onDragStart={(e) => {
                    setDragId(col.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', col.id);
                  }}
                  onDragOver={(e) => {
                    if (!dragId) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (overId !== col.id) setOverId(col.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId) reorder(dragId, col.id);
                    setDragId(null);
                    setOverId(null);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                >
                  <button
                    type="button"
                    className="orders__th-btn"
                    ref={(el) => {
                      if (el) headerRefs.current.set(col.id, el);
                      else headerRefs.current.delete(col.id);
                    }}
                    title="Перетащите, чтобы переместить колонку (Alt + ←/→)"
                    onKeyDown={(e) => onHeaderKeyDown(e, col.id)}
                  >
                    <Icon data={Grip} size={14} className="orders__grip" />
                    {col.title}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {grouped
              ? groups.map(({status, items, total}) => {
                  const isCollapsed = collapsedGroups.has(status);
                  const ids = items.map((o) => o.id);
                  const selectedInGroup = ids.filter((id) => selected.has(id)).length;
                  const meta = STATUS_META[status];
                  return (
                    <React.Fragment key={status}>
                      <tr className="orders__group">
                        <td className="orders__cell orders__cell_check">
                          <Checkbox
                            size="m"
                            checked={selectedInGroup === ids.length}
                            indeterminate={selectedInGroup > 0 && selectedInGroup < ids.length}
                            onUpdate={(on) => setMany(ids, on)}
                            controlProps={{'aria-label': `Выбрать все заказы со статусом «${meta.title}»`}}
                          />
                        </td>
                        <td className="orders__cell" colSpan={colSpan - 1}>
                          <button
                            type="button"
                            className="orders__group-btn"
                            aria-expanded={!isCollapsed}
                            onClick={() => toggleGroup(status)}
                          >
                            <Icon data={isCollapsed ? ChevronRight : ChevronDown} size={16} />
                            <Label theme={meta.theme}>{meta.title}</Label>
                            <Text color="secondary">
                              {items.length} · {money.format(total)}
                            </Text>
                          </button>
                        </td>
                      </tr>
                      {!isCollapsed && items.map(renderRow)}
                    </React.Fragment>
                  );
                })
              : ORDERS.map(renderRow)}
          </tbody>
        </table>
      </div>
      <div className="visually-hidden" aria-live="polite">
        {announcement}
      </div>
    </section>
  );
}
