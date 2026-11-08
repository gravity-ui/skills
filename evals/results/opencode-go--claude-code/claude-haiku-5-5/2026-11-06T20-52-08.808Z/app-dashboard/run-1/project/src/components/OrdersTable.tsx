import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent, ReactNode } from 'react';
import { Button, Icon, Label, Select } from '@gravity-ui/uikit';
import { ChevronDown, ChevronRight, Grip } from '@gravity-ui/icons';
import { ORDER_STATUSES, PAYMENT_LABELS, STATUS_META } from '../data/orders';
import type { Order, OrderStatus } from '../data/orders';
import { formatDate, formatMoney } from '../lib/format';

type ColumnId = 'number' | 'customer' | 'date' | 'status' | 'items' | 'payment' | 'total';
type Grouping = 'none' | 'status';

interface ColumnDef {
  id: ColumnId;
  title: string;
  align?: 'end';
  numeric?: boolean;
  render: (order: Order) => ReactNode;
}

const COLUMNS: ColumnDef[] = [
  { id: 'number', title: 'Номер', render: (o) => `#${o.id}` },
  { id: 'customer', title: 'Клиент', render: (o) => o.customer },
  { id: 'date', title: 'Дата', numeric: true, render: (o) => formatDate(o.createdAt) },
  {
    id: 'status',
    title: 'Статус',
    render: (o) => (
      <Label theme={STATUS_META[o.status].theme} size="s">
        {STATUS_META[o.status].label}
      </Label>
    ),
  },
  { id: 'items', title: 'Товаров', align: 'end', numeric: true, render: (o) => o.items },
  { id: 'payment', title: 'Оплата', render: (o) => PAYMENT_LABELS[o.payment] },
  { id: 'total', title: 'Сумма', align: 'end', numeric: true, render: (o) => formatMoney(o.total) },
];

const COLUMN_BY_ID = Object.fromEntries(COLUMNS.map((c) => [c.id, c])) as Record<ColumnId, ColumnDef>;
const DEFAULT_COLUMN_ORDER: ColumnId[] = COLUMNS.map((c) => c.id);

const GROUPING_OPTIONS = [
  { value: 'none', content: 'Без группировки' },
  { value: 'status', content: 'По статусу' },
];

interface Section {
  key: string;
  status: OrderStatus | null;
  rows: Order[];
}

function SelectBox({
  checked,
  indeterminate = false,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="select-box"
      checked={checked}
      aria-label={label}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [columnIds, setColumnIds] = useState<ColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [grouping, setGrouping] = useState<Grouping>('none');
  const [collapsed, setCollapsed] = useState<ReadonlySet<OrderStatus>>(() => new Set());

  const anchorId = useRef<string | null>(null);
  const focusAfterMove = useRef<ColumnId | null>(null);
  const headerCells = useRef<Partial<Record<ColumnId, HTMLTableCellElement | null>>>({});

  const columns = columnIds.map((id) => COLUMN_BY_ID[id]);
  const columnCount = columns.length + 1;

  const sections = useMemo<Section[]>(
    () =>
      grouping === 'status'
        ? ORDER_STATUSES.map((status) => ({
            key: status,
            status,
            rows: orders.filter((o) => o.status === status),
          })).filter((section) => section.rows.length > 0)
        : [{ key: 'all', status: null, rows: orders }],
    [orders, grouping],
  );

  // Порядок id, как на экране: свёрнутые группы не участвуют (нужно для выделения диапазоном).
  const visibleIds = useMemo(
    () =>
      sections.flatMap((section) =>
        section.status && collapsed.has(section.status) ? [] : section.rows.map((o) => o.id),
      ),
    [sections, collapsed],
  );

  const selectedInOrders = orders.reduce((count, o) => count + (selected.has(o.id) ? 1 : 0), 0);
  const allSelected = orders.length > 0 && selectedInOrders === orders.length;
  const someSelected = selectedInOrders > 0 && !allSelected;

  const setMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  // Клик — переключить строку; Shift+клик — выделить диапазон от последней выбранной строки.
  const pickRow = (id: string, extend: boolean) => {
    const anchor = anchorId.current;
    if (extend && anchor !== null && visibleIds.includes(anchor) && visibleIds.includes(id)) {
      const [from, to] = [visibleIds.indexOf(anchor), visibleIds.indexOf(id)].sort((a, b) => a - b);
      setMany(visibleIds.slice(from, to + 1), !selected.has(id));
      return;
    }
    setMany([id], !selected.has(id));
    anchorId.current = id;
  };

  const toggleGroup = (status: OrderStatus) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  const moveColumn = (from: number, to: number) => {
    if (from === to || to < 0 || to >= columnIds.length) return;
    setColumnIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  // Вернуть фокус на перемещённую колонку (иначе после перестановки DOM-узел теряет фокус).
  useEffect(() => {
    const id = focusAfterMove.current;
    if (id) {
      headerCells.current[id]?.focus();
      focusAfterMove.current = null;
    }
  }, [columnIds]);

  const resetDrag = () => {
    setDragFrom(null);
    setDropAt(null);
  };

  const onDragStart = (event: DragEvent<HTMLTableCellElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnIds[index]); // нужно Firefox для старта drag
    setDragFrom(index);
  };

  const onDragOver = (event: DragEvent<HTMLTableCellElement>, index: number) => {
    if (dragFrom === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dropAt !== index) setDropAt(index);
  };

  const onDrop = (event: DragEvent<HTMLTableCellElement>, index: number) => {
    if (dragFrom === null) return;
    event.preventDefault();
    moveColumn(dragFrom, index);
    resetDrag();
  };

  const onHeaderKeyDown = (event: KeyboardEvent<HTMLTableCellElement>, index: number) => {
    if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    const to = index + (event.key === 'ArrowLeft' ? -1 : 1);
    if (to < 0 || to >= columnIds.length) return;
    focusAfterMove.current = columnIds[index];
    moveColumn(index, to);
  };

  const dropClass = (index: number) => {
    if (dragFrom === null || dropAt !== index || dropAt === dragFrom) return undefined;
    return dragFrom < index ? 'drop-after' : 'drop-before';
  };

  const renderRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr
        key={order.id}
        className={isSelected ? 'is-selected' : undefined}
        aria-selected={isSelected}
        onClick={(event) => pickRow(order.id, event.shiftKey)}
      >
        <td
          className="cell-select"
          onClick={(event) => {
            // Клик по чекбоксу обрабатываем здесь, иначе он дойдёт до строки и переключит её дважды.
            event.stopPropagation();
            pickRow(order.id, event.shiftKey);
          }}
        >
          <input
            type="checkbox"
            className="select-box"
            checked={isSelected}
            readOnly
            aria-label={`Выбрать заказ #${order.id}`}
          />
        </td>
        {columns.map((col) => (
          <td
            key={col.id}
            className={[col.align === 'end' && 'align-end', col.numeric && 'num'].filter(Boolean).join(' ') || undefined}
          >
            {col.render(order)}
          </td>
        ))}
      </tr>
    );
  };

  const renderGroupHeader = (status: OrderStatus, rows: Order[]) => {
    const ids = rows.map((o) => o.id);
    const selectedInGroup = ids.filter((id) => selected.has(id)).length;
    const groupTotal = rows.reduce((sum, o) => sum + o.total, 0);
    const isCollapsed = collapsed.has(status);

    return (
      <tr className="group-row">
        <td colSpan={columnCount}>
          <div className="group-row__content">
            <SelectBox
              label={`Выбрать все заказы со статусом «${STATUS_META[status].label}»`}
              checked={selectedInGroup === ids.length}
              indeterminate={selectedInGroup > 0 && selectedInGroup < ids.length}
              onChange={(on) => setMany(ids, on)}
            />
            <button
              type="button"
              className="group-row__toggle"
              aria-expanded={!isCollapsed}
              onClick={() => toggleGroup(status)}
            >
              <Icon data={isCollapsed ? ChevronRight : ChevronDown} size={16} />
              <span className="group-row__title">{STATUS_META[status].label}</span>
              <span className="group-row__meta">
                {rows.length} · {formatMoney(groupTotal)}
              </span>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="orders">
      <div className="orders__toolbar">
        <Select
          size="m"
          label="Группировка:"
          value={[grouping]}
          options={GROUPING_OPTIONS}
          onUpdate={([value]) => {
            if (value) setGrouping(value as Grouping);
          }}
        />
        <span className="orders__count">
          {selected.size > 0 ? `Выбрано: ${selectedInOrders}` : `Заказов: ${orders.length}`}
        </span>
        {selectedInOrders > 0 && (
          <Button view="flat" size="s" onClick={() => setSelected(new Set())}>
            Снять выделение
          </Button>
        )}
      </div>

      <div className="orders__scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="cell-select">
                <SelectBox
                  label="Выбрать все заказы"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(on) => setMany(
                    orders.map((o) => o.id),
                    on,
                  )}
                />
              </th>
              {columns.map((col, index) => {
                const classes = [
                  'is-draggable',
                  col.align === 'end' && 'align-end',
                  dragFrom === index && 'is-dragging',
                  dropClass(index),
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <th
                    key={col.id}
                    ref={(el) => {
                      headerCells.current[col.id] = el;
                    }}
                    className={classes}
                    draggable
                    tabIndex={0}
                    aria-description="Перетащите, чтобы переместить колонку. Или Alt + стрелки."
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDrop={(e) => onDrop(e, index)}
                    onDragEnd={resetDrag}
                    onKeyDown={(e) => onHeaderKeyDown(e, index)}
                  >
                    <span className="th-content">
                      {col.title}
                      <Icon data={Grip} size={12} className="th-grip" />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="empty-row">
                  Заказов пока нет
                </td>
              </tr>
            )}
            {sections.map((section) => (
              <Fragment key={section.key}>
                {section.status && renderGroupHeader(section.status, section.rows)}
                {section.status && collapsed.has(section.status) ? null : section.rows.map(renderRow)}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
