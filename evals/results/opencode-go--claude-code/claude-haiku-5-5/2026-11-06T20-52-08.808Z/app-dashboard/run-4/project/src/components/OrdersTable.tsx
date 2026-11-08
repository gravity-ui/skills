import { Fragment, useMemo, useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent, ReactNode } from 'react';
import { ChevronDown, ChevronRight, Grip } from '@gravity-ui/icons';
import { Button, Checkbox, Icon, Label, Switch, Text } from '@gravity-ui/uikit';
import {
  STATUS_META,
  STATUS_ORDER,
  formatDate,
  formatRub,
  pluralizeOrders,
  type Order,
  type OrderStatus,
} from '../data/orders';
import {
  DEFAULT_COLUMN_ORDER,
  groupByStatus,
  moveItem,
  selectRange,
  selectionState,
  setIds,
  shiftItem,
  type ColumnId,
} from '../lib/table';

interface ColumnDef {
  title: string;
  align: 'left' | 'right';
  render: (order: Order) => ReactNode;
}

const COLUMNS: Record<ColumnId, ColumnDef> = {
  id: { title: 'Номер', align: 'left', render: (o) => o.id },
  customer: { title: 'Клиент', align: 'left', render: (o) => o.customer },
  city: { title: 'Город', align: 'left', render: (o) => o.city },
  items: { title: 'Позиции', align: 'right', render: (o) => o.items },
  amount: { title: 'Сумма', align: 'right', render: (o) => formatRub(o.amount) },
  status: {
    title: 'Статус',
    align: 'left',
    render: (o) => (
      <Label theme={STATUS_META[o.status].theme} size="s">
        {STATUS_META[o.status].label}
      </Label>
    ),
  },
  createdAt: { title: 'Дата', align: 'left', render: (o) => formatDate(o.createdAt) },
};

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [dragColumn, setDragColumn] = useState<ColumnId | null>(null);
  const [dropColumn, setDropColumn] = useState<ColumnId | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [grouped, setGrouped] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<OrderStatus>>(() => new Set());
  // Shift-состояние запоминаем при mousedown/click по строке, потому что onUpdate у чекбокса
  // приходит без события мыши.
  const shiftPressed = useRef(false);

  const groups = useMemo(() => groupByStatus(orders, STATUS_ORDER), [orders]);

  // Строки в порядке отображения: по ним считаются «выделить все» и Shift-диапазон.
  const visibleIds = useMemo(() => {
    const rows = grouped
      ? groups.filter((g) => !collapsedGroups.has(g.status)).flatMap((g) => g.orders)
      : orders;
    return rows.map((o) => o.id);
  }, [grouped, groups, collapsedGroups, orders]);

  const headerState = selectionState(selected, visibleIds);

  const applyRowSelection = (orderId: string, on: boolean) => {
    const useRange = shiftPressed.current && anchorId !== null && visibleIds.includes(anchorId);
    shiftPressed.current = false;
    setSelected((prev) =>
      useRange ? selectRange(prev, visibleIds, anchorId, orderId, on) : setIds(prev, [orderId], on),
    );
    setAnchorId(orderId);
  };

  const toggleGroup = (status: OrderStatus) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const resetDrag = () => {
    setDragColumn(null);
    setDropColumn(null);
  };

  const renderDataRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr
        key={order.id}
        className={isSelected ? 'is-selected' : undefined}
        onClick={(e) => {
          // Клики по чекбоксу обрабатывает сам чекбокс.
          if ((e.target as HTMLElement).closest('.cell-check')) return;
          shiftPressed.current = e.shiftKey;
          applyRowSelection(order.id, !isSelected);
        }}
      >
        <td className="cell-check" onMouseDown={(e) => (shiftPressed.current = e.shiftKey)}>
          <Checkbox
            checked={isSelected}
            onUpdate={(on) => applyRowSelection(order.id, on)}
            controlProps={{ 'aria-label': `Выбрать заказ ${order.id}` }}
          />
        </td>
        {columnOrder.map((id) => {
          const column = COLUMNS[id];
          return (
            <td key={id} className={column.align === 'right' ? 'num' : undefined}>
              {column.render(order)}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderGroup = (group: { status: OrderStatus; orders: Order[] }) => {
    const meta = STATUS_META[group.status];
    const isCollapsed = collapsedGroups.has(group.status);
    const ids = group.orders.map((o) => o.id);
    const groupState = selectionState(selected, ids);
    const total = group.orders.reduce((sum, o) => sum + o.amount, 0);

    return (
      <Fragment key={group.status}>
        <tr className="group-row">
          <td className="cell-check" onMouseDown={(e) => (shiftPressed.current = e.shiftKey)}>
            <Checkbox
              checked={groupState === 'all'}
              indeterminate={groupState === 'some'}
              onUpdate={(on) => setSelected((prev) => setIds(prev, ids, on))}
              controlProps={{ 'aria-label': `Выбрать все заказы: ${meta.label}` }}
            />
          </td>
          <td colSpan={columnOrder.length}>
            <div className="group-cell">
              <button
                type="button"
                className="group-toggle"
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? 'Развернуть' : 'Свернуть'} группу «${meta.label}»`}
                onClick={() => toggleGroup(group.status)}
              >
                <Icon data={isCollapsed ? ChevronRight : ChevronDown} size={14} />
              </button>
              <Label theme={meta.theme} size="s">
                {meta.label}
              </Label>
              <span className="group-meta">
                {pluralizeOrders(group.orders.length)} · {formatRub(total)}
              </span>
            </div>
          </td>
        </tr>
        {!isCollapsed && group.orders.map(renderDataRow)}
      </Fragment>
    );
  };

  return (
    <section className="table-card" aria-label="Таблица заказов">
      <div className="table-toolbar">
        <div className="table-heading">
          <Text variant="subheader-2">Заказы</Text>
          <Text variant="body-2" color="secondary">
            {pluralizeOrders(orders.length)}
          </Text>
        </div>
        <div className="table-actions">
          {selected.size > 0 && (
            <>
              <Text variant="body-2">Выбрано: {selected.size}</Text>
              <Button view="flat" size="s" onClick={() => setSelected(new Set())}>
                Сбросить выбор
              </Button>
            </>
          )}
          <Switch checked={grouped} onUpdate={setGrouped} content="По статусу" />
        </div>
      </div>

      <div className="table-scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="cell-check">
                <Checkbox
                  checked={headerState === 'all'}
                  indeterminate={headerState === 'some'}
                  onUpdate={(on) => setSelected((prev) => setIds(prev, visibleIds, on))}
                  controlProps={{ 'aria-label': 'Выбрать все видимые заказы' }}
                />
              </th>
              {columnOrder.map((id) => {
                const column = COLUMNS[id];
                const classes = [
                  column.align === 'right' ? 'num' : '',
                  dragColumn === id ? 'is-dragging' : '',
                  dropColumn === id && dragColumn !== id ? 'is-drop-target' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <th
                    key={id}
                    className={classes}
                    draggable
                    tabIndex={0}
                    title="Перетащите, чтобы изменить порядок. Alt + ← / → — с клавиатуры"
                    onDragStart={(e: DragEvent<HTMLTableCellElement>) => {
                      setDragColumn(id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', id);
                    }}
                    onDragOver={(e: DragEvent<HTMLTableCellElement>) => {
                      if (!dragColumn) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dropColumn !== id) setDropColumn(id);
                    }}
                    onDrop={(e: DragEvent<HTMLTableCellElement>) => {
                      e.preventDefault();
                      if (dragColumn && dragColumn !== id) {
                        setColumnOrder((prev) => moveItem(prev, dragColumn, id));
                      }
                      resetDrag();
                    }}
                    onDragEnd={resetDrag}
                    onKeyDown={(e: KeyboardEvent<HTMLTableCellElement>) => {
                      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                        e.preventDefault();
                        const delta = e.key === 'ArrowLeft' ? -1 : 1;
                        setColumnOrder((prev) => shiftItem(prev, id, delta));
                      }
                    }}
                  >
                    <span className="th-content">
                      <Icon data={Grip} size={12} />
                      {column.title}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={columnOrder.length + 1} className="empty-cell">
                  Заказов пока нет
                </td>
              </tr>
            )}
            {grouped
              ? groups.map(renderGroup)
              : orders.map(renderDataRow)}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <Text variant="caption-2" color="secondary">
          Перетащите заголовок колонки, чтобы изменить порядок. Shift + клик выделяет диапазон строк.
        </Text>
      </div>
    </section>
  );
}
