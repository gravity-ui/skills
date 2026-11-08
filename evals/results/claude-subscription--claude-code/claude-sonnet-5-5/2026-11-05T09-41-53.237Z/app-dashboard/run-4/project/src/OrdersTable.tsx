import React from 'react';
import { Button, Checkbox, Icon, Label, Switch, Text } from '@gravity-ui/uikit';
import { ChevronDown, ChevronRight, Grip } from '@gravity-ui/icons';
import { ORDERS, STATUS_META, STATUS_ORDER, type Order, type OrderStatus } from './data';

type ColumnId = 'id' | 'customer' | 'status' | 'date' | 'items' | 'city' | 'total';

interface Column {
  id: ColumnId;
  title: string;
  align?: 'right';
  render: (o: Order) => React.ReactNode;
}

const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

const COLUMNS: Record<ColumnId, Column> = {
  id: { id: 'id', title: '№ заказа', render: (o) => <Text variant="code-1">#{o.id}</Text> },
  customer: { id: 'customer', title: 'Клиент', render: (o) => o.customer },
  status: {
    id: 'status',
    title: 'Статус',
    render: (o) => (
      <Label theme={STATUS_META[o.status].theme} size="s">
        {STATUS_META[o.status].title}
      </Label>
    ),
  },
  date: { id: 'date', title: 'Дата', render: (o) => dateFmt.format(new Date(o.date)) },
  items: { id: 'items', title: 'Товаров', align: 'right', render: (o) => o.items },
  city: { id: 'city', title: 'Город', render: (o) => o.city },
  total: { id: 'total', title: 'Сумма', align: 'right', render: (o) => money.format(o.total) },
};

const DEFAULT_ORDER: ColumnId[] = ['id', 'customer', 'status', 'date', 'items', 'city', 'total'];

type DropTarget = { id: ColumnId; side: 'before' | 'after' } | null;

function moveColumn(order: ColumnId[], from: ColumnId, to: ColumnId, side: 'before' | 'after'): ColumnId[] {
  if (from === to) return order;
  const without = order.filter((c) => c !== from);
  const idx = without.indexOf(to) + (side === 'after' ? 1 : 0);
  return [...without.slice(0, idx), from, ...without.slice(idx)];
}

export function OrdersTable() {
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(DEFAULT_ORDER);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [grouped, setGrouped] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<OrderStatus>>(() => new Set());
  const [dragging, setDragging] = React.useState<ColumnId | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget>(null);

  const columns = columnOrder.map((id) => COLUMNS[id]);
  const colSpan = columns.length + 1;

  const groups = React.useMemo(
    () =>
      STATUS_ORDER.map((status) => ({ status, rows: ORDERS.filter((o) => o.status === status) })).filter(
        (g) => g.rows.length > 0,
      ),
    [],
  );

  const toggleIds = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const selectionState = (ids: string[]) => {
    const n = ids.filter((id) => selected.has(id)).length;
    return { checked: n > 0 && n === ids.length, indeterminate: n > 0 && n < ids.length };
  };

  const allIds = ORDERS.map((o) => o.id);
  const all = selectionState(allIds);

  const toggleGroup = (status: OrderStatus) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (!next.delete(status)) next.add(status);
      return next;
    });

  // --- перетаскивание колонок ---
  const onDragOver = (e: React.DragEvent<HTMLTableCellElement>, id: ColumnId) => {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
    setDropTarget((prev) => (prev?.id === id && prev.side === side ? prev : { id, side }));
  };

  const endDrag = () => {
    setDragging(null);
    setDropTarget(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragging && dropTarget) setColumnOrder((o) => moveColumn(o, dragging, dropTarget.id, dropTarget.side));
    endDrag();
  };

  // Клавиатурная альтернатива: Alt + ←/→ на заголовке.
  const onHeaderKeyDown = (e: React.KeyboardEvent, id: ColumnId) => {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    const i = columnOrder.indexOf(id);
    const j = e.key === 'ArrowLeft' ? i - 1 : i + 1;
    if (j < 0 || j >= columnOrder.length) return;
    setColumnOrder((o) => moveColumn(o, id, o[j], e.key === 'ArrowLeft' ? 'before' : 'after'));
  };

  const renderRow = (o: Order) => {
    const isSelected = selected.has(o.id);
    return (
      <tr
        key={o.id}
        className={`orders__row${isSelected ? ' orders__row_selected' : ''}`}
        aria-selected={isSelected}
        onClick={() => toggleIds([o.id], !isSelected)}
      >
        <td className="orders__cell orders__cell_check" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            size="m"
            checked={isSelected}
            onUpdate={(v) => toggleIds([o.id], v)}
            aria-label={`Выбрать заказ ${o.id}`}
          />
        </td>
        {columns.map((c) => (
          <td key={c.id} className={`orders__cell${c.align ? ' orders__cell_right' : ''}`}>
            {c.render(o)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <section className="orders">
      <header className="orders__toolbar">
        <div className="orders__title">
          <Text variant="header-1" as="h1">
            Заказы
          </Text>
          <Text variant="body-2" color="secondary">
            {ORDERS.length} заказов
          </Text>
        </div>
        <div className="orders__tools">
          {selected.size > 0 && (
            <div className="orders__selection" role="status">
              <Text variant="body-2">Выбрано: {selected.size}</Text>
              <Button view="flat" size="s" onClick={() => setSelected(new Set())}>
                Снять выделение
              </Button>
            </div>
          )}
          <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        </div>
      </header>

      <div className="orders__scroll">
        <table className="orders__table" aria-rowcount={ORDERS.length}>
          <thead>
            <tr>
              <th className="orders__th orders__th_check" scope="col">
                <Checkbox
                  size="m"
                  checked={all.checked}
                  indeterminate={all.indeterminate}
                  onUpdate={(v) => toggleIds(allIds, v)}
                  aria-label="Выбрать все заказы"
                />
              </th>
              {columns.map((c) => {
                const drop = dropTarget?.id === c.id && dragging !== c.id ? dropTarget.side : null;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    tabIndex={0}
                    draggable
                    title="Перетащите, чтобы изменить порядок (или Alt + ←/→)"
                    className={[
                      'orders__th',
                      c.align ? 'orders__th_right' : '',
                      dragging === c.id ? 'orders__th_dragging' : '',
                      drop ? `orders__th_drop-${drop}` : '',
                    ].join(' ')}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', c.id);
                      setDragging(c.id);
                    }}
                    onDragOver={(e) => onDragOver(e, c.id)}
                    onDrop={onDrop}
                    onDragEnd={endDrag}
                    onKeyDown={(e) => onHeaderKeyDown(e, c.id)}
                  >
                    <span className="orders__th-inner">
                      <Icon data={Grip} size={14} className="orders__grip" />
                      {c.title}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {grouped ? (
            groups.map(({ status, rows }) => {
              const ids = rows.map((r) => r.id);
              const sel = selectionState(ids);
              const open = !collapsedGroups.has(status);
              const sum = rows.reduce((s, r) => s + r.total, 0);
              return (
                <tbody key={status}>
                  <tr className="orders__group">
                    <td className="orders__cell orders__cell_check">
                      <Checkbox
                        size="m"
                        checked={sel.checked}
                        indeterminate={sel.indeterminate}
                        onUpdate={(v) => toggleIds(ids, v)}
                        aria-label={`Выбрать все заказы со статусом «${STATUS_META[status].title}»`}
                      />
                    </td>
                    <td colSpan={colSpan - 1} className="orders__cell">
                      <button
                        type="button"
                        className="orders__group-toggle"
                        aria-expanded={open}
                        onClick={() => toggleGroup(status)}
                      >
                        <Icon data={open ? ChevronDown : ChevronRight} size={16} />
                        <Label theme={STATUS_META[status].theme} size="s">
                          {STATUS_META[status].title}
                        </Label>
                        <Text color="secondary">
                          {rows.length} · {money.format(sum)}
                        </Text>
                      </button>
                    </td>
                  </tr>
                  {open && rows.map(renderRow)}
                </tbody>
              );
            })
          ) : (
            <tbody>{ORDERS.map(renderRow)}</tbody>
          )}
        </table>
      </div>
    </section>
  );
}
