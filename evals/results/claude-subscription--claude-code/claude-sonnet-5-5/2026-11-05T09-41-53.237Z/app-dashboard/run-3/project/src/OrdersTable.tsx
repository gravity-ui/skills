import React from 'react';
import {Button, Checkbox, Icon, Label, Switch, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronRight, Grip} from '@gravity-ui/icons';
import {ORDERS, STATUS_META, STATUS_ORDER, type Order} from './orders';

type ColumnId = 'id' | 'customer' | 'date' | 'items' | 'amount' | 'payment' | 'status';

const money = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});
const dateFmt = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'});

interface Column {
  id: ColumnId;
  title: string;
  align?: 'end';
  minWidth: number;
  render: (order: Order) => React.ReactNode;
}

const COLUMNS: Record<ColumnId, Column> = {
  id: {id: 'id', title: 'Заказ', minWidth: 100, render: (o) => <Text variant="body-2">{o.id}</Text>},
  customer: {id: 'customer', title: 'Клиент', minWidth: 200, render: (o) => o.customer},
  date: {id: 'date', title: 'Дата', minWidth: 150, render: (o) => dateFmt.format(new Date(o.date))},
  items: {id: 'items', title: 'Позиций', align: 'end', minWidth: 110, render: (o) => o.items},
  amount: {id: 'amount', title: 'Сумма', align: 'end', minWidth: 130, render: (o) => money.format(o.amount)},
  payment: {id: 'payment', title: 'Оплата', minWidth: 120, render: (o) => o.payment},
  status: {
    id: 'status',
    title: 'Статус',
    minWidth: 150,
    render: (o) => (
      <Label theme={STATUS_META[o.status].theme} size="m">
        {STATUS_META[o.status].title}
      </Label>
    ),
  },
};

const DEFAULT_ORDER: ColumnId[] = ['id', 'customer', 'date', 'items', 'amount', 'payment', 'status'];

function move<T>(list: T[], from: number, to: number) {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function OrdersTable() {
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(DEFAULT_ORDER);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [grouped, setGrouped] = React.useState(true);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(() => new Set());
  const [dragId, setDragId] = React.useState<ColumnId | null>(null);
  const [overId, setOverId] = React.useState<ColumnId | null>(null);
  const [announcement, setAnnouncement] = React.useState('');

  const orders = ORDERS;
  const colSpan = columnOrder.length;

  const groups = React.useMemo(
    () =>
      STATUS_ORDER.map((status) => {
        const rows = orders.filter((o) => o.status === status);
        return {status, rows, total: rows.reduce((sum, o) => sum + o.amount, 0)};
      }).filter((g) => g.rows.length > 0),
    [orders],
  );

  // ---- selection -----------------------------------------------------------
  const selectionState = (rows: Order[]) => {
    const count = rows.filter((o) => selected.has(o.id)).length;
    return {checked: count > 0 && count === rows.length, indeterminate: count > 0 && count < rows.length};
  };

  const setRows = (rows: Order[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((o) => (on ? next.add(o.id) : next.delete(o.id)));
      return next;
    });

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const toggleGroup = (status: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (!next.delete(status)) next.add(status);
      return next;
    });

  const all = selectionState(orders);

  // ---- column reordering ---------------------------------------------------
  const moveColumn = (id: ColumnId, to: number) => {
    const from = columnOrder.indexOf(id);
    if (to < 0 || to >= columnOrder.length || to === from) return;
    setColumnOrder(move(columnOrder, from, to));
    setAnnouncement(`Колонка «${COLUMNS[id].title}»: позиция ${to + 1} из ${columnOrder.length}`);
  };

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  const renderRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr
        key={order.id}
        className={`orders__row${isSelected ? ' orders__row_selected' : ''}`}
        aria-selected={isSelected}
        onClick={() => toggleRow(order.id)}
      >
        <td className="orders__cell orders__cell_select" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            size="m"
            checked={isSelected}
            onChange={() => toggleRow(order.id)}
            controlProps={{'aria-label': `Выбрать заказ ${order.id}`}}
          />
        </td>
        {columnOrder.map((id) => (
          <td key={id} className={`orders__cell${COLUMNS[id].align ? ' orders__cell_end' : ''}`}>
            {COLUMNS[id].render(order)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <section className="orders" aria-label="Таблица заказов">
      <div className="orders__toolbar">
        <Text variant="body-2" color="secondary" aria-live="polite">
          Выбрано {selected.size} из {orders.length}
        </Text>
        <Button view="flat" size="m" disabled={selected.size === 0} onClick={() => setSelected(new Set())}>
          Сбросить выбор
        </Button>
        <span className="orders__spacer" />
        <Switch size="m" checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
      </div>

      <div className="orders__scroll">
        <table className="orders__table">
          <thead>
            <tr>
              <th className="orders__th orders__th_select" scope="col">
                <Checkbox
                  size="m"
                  checked={all.checked}
                  indeterminate={all.indeterminate}
                  onChange={(e) => setRows(orders, e.target.checked)}
                  controlProps={{'aria-label': 'Выбрать все заказы'}}
                />
              </th>
              {columnOrder.map((id, index) => {
                const col = COLUMNS[id];
                const dropClass =
                  dragId && overId === id && dragId !== id
                    ? columnOrder.indexOf(dragId) < index
                      ? ' orders__th_drop-after'
                      : ' orders__th_drop-before'
                    : '';
                return (
                  <th
                    key={id}
                    scope="col"
                    style={{minWidth: col.minWidth}}
                    className={`orders__th${col.align ? ' orders__th_end' : ''}${
                      dragId === id ? ' orders__th_dragging' : ''
                    }${dropClass}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', id);
                      setDragId(id);
                    }}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (overId !== id) setOverId(id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId && dragId !== id) moveColumn(dragId, index);
                      endDrag();
                    }}
                    onDragEnd={endDrag}
                  >
                    <div className="orders__th-inner">
                      <button
                        type="button"
                        className="orders__grip"
                        aria-label={`Переместить колонку «${col.title}». Стрелки влево и вправо меняют позицию`}
                        title="Перетащите или нажмите ←/→"
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            moveColumn(id, index - 1);
                          } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            moveColumn(id, index + 1);
                          }
                        }}
                      >
                        <Icon data={Grip} size={14} />
                      </button>
                      <span>{col.title}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {grouped ? (
            groups.map(({status, rows, total}) => {
              const isCollapsed = collapsedGroups.has(status);
              const sel = selectionState(rows);
              const meta = STATUS_META[status];
              return (
                <tbody key={status}>
                  <tr className="orders__group">
                    <td className="orders__cell orders__cell_select">
                      <Checkbox
                        size="m"
                        checked={sel.checked}
                        indeterminate={sel.indeterminate}
                        onChange={(e) => setRows(rows, e.target.checked)}
                        controlProps={{'aria-label': `Выбрать все заказы со статусом «${meta.title}»`}}
                      />
                    </td>
                    <td className="orders__cell orders__group-cell" colSpan={colSpan}>
                      <button
                        type="button"
                        className="orders__group-toggle"
                        aria-expanded={!isCollapsed}
                        onClick={() => toggleGroup(status)}
                      >
                        <Icon data={isCollapsed ? ChevronRight : ChevronDown} size={16} />
                        <Label theme={meta.theme} size="m">
                          {meta.title}
                        </Label>
                        <Text variant="body-2" color="secondary">
                          {rows.length} · {money.format(total)}
                        </Text>
                      </button>
                    </td>
                  </tr>
                  {isCollapsed ? null : rows.map(renderRow)}
                </tbody>
              );
            })
          ) : (
            <tbody>{orders.map(renderRow)}</tbody>
          )}
        </table>
      </div>

      <div className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </div>
    </section>
  );
}
