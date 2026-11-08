import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { Checkbox, Icon, Label } from '@gravity-ui/uikit';
import { ChevronDown, ChevronRight } from '@gravity-ui/icons';
import { groupOrdersByStatus, moveItem } from '../orders/grouping';
import { STATUS_META, formatDate, formatMoney } from '../orders/presentation';
import type { Order, OrderStatus } from '../orders/types';
import './OrdersTable.css';

type ColumnId = 'number' | 'customer' | 'status' | 'date' | 'city' | 'items' | 'total';

interface ColumnDef {
  title: string;
  align: 'start' | 'end';
  render: (order: Order) => ReactNode;
}

const COLUMNS: Record<ColumnId, ColumnDef> = {
  number: {
    title: 'Номер',
    align: 'start',
    render: (o) => <span className="tabular">#{o.id}</span>,
  },
  customer: {
    title: 'Клиент',
    align: 'start',
    render: (o) => (
      <div className="cell-stack">
        <span>{o.customer}</span>
        <span className="cell-secondary">{o.email}</span>
      </div>
    ),
  },
  status: {
    title: 'Статус',
    align: 'start',
    render: (o) => <StatusLabel status={o.status} />,
  },
  date: {
    title: 'Дата',
    align: 'start',
    render: (o) => formatDate(o.createdAt),
  },
  city: {
    title: 'Город',
    align: 'start',
    render: (o) => o.city,
  },
  items: {
    title: 'Позиций',
    align: 'end',
    render: (o) => <span className="tabular">{o.itemsCount}</span>,
  },
  total: {
    title: 'Сумма',
    align: 'end',
    render: (o) => <span className="tabular">{formatMoney(o.total)}</span>,
  },
};

const DEFAULT_COLUMN_ORDER: ColumnId[] = ['number', 'customer', 'status', 'date', 'city', 'items', 'total'];

interface Section {
  /** `null` for the flat (ungrouped) list. */
  status: OrderStatus | null;
  orders: Order[];
}

export interface OrdersTableProps {
  orders: Order[];
  grouped: boolean;
  selectedIds: ReadonlySet<string>;
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
}

// The row's own click handler owns selection, so the checkbox itself must not swallow clicks.
// `pointer-events: none` (see CSS) routes mouse clicks to the cell; keyboard Space still bubbles
// a click from the focused input up to the row.
const noop = () => {};

function setMany(prev: Set<string>, ids: string[], selected: boolean): Set<string> {
  const next = new Set(prev);
  for (const id of ids) {
    if (selected) next.add(id);
    else next.delete(id);
  }
  return next;
}

export function OrdersTable({ orders, grouped, selectedIds, setSelectedIds }: OrdersTableProps) {
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [dragColumn, setDragColumn] = useState<ColumnId | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: ColumnId; side: 'before' | 'after' } | null>(null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<OrderStatus>>(() => new Set());
  const anchorId = useRef<string | null>(null);

  const sections = useMemo<Section[]>(
    () =>
      grouped
        ? groupOrdersByStatus(orders).map((g) => ({ status: g.status, orders: g.orders }))
        : [{ status: null, orders }],
    [orders, grouped],
  );

  // Rows that can currently be reached on screen, in order. Used for Shift-range selection.
  const visibleIds = useMemo(
    () =>
      sections.flatMap((section) =>
        section.status && collapsed.has(section.status) ? [] : section.orders.map((o) => o.id),
      ),
    [sections, collapsed],
  );

  function handleRowClick(event: MouseEvent, id: string) {
    const anchor = anchorId.current;
    if (event.shiftKey && anchor !== null) {
      const from = visibleIds.indexOf(anchor);
      const to = visibleIds.indexOf(id);
      if (from !== -1 && to !== -1) {
        const [start, end] = from < to ? [from, to] : [to, from];
        const range = visibleIds.slice(start, end + 1);
        setSelectedIds((prev) => setMany(prev, range, true));
        return;
      }
    }
    anchorId.current = id;
    setSelectedIds((prev) => setMany(prev, [id], !prev.has(id)));
  }

  function toggleCollapsed(status: OrderStatus) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  const allOrderIds = orders.map((o) => o.id);
  const selectedCount = allOrderIds.filter((id) => selectedIds.has(id)).length;
  const allSelected = orders.length > 0 && selectedCount === orders.length;

  function toggleAll() {
    setSelectedIds((prev) => setMany(prev, allOrderIds, !allSelected));
  }

  function toggleSection(section: Section) {
    const ids = section.orders.map((o) => o.id);
    const sectionAll = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => setMany(prev, ids, !sectionAll));
  }

  // ----- Column reordering: mouse drag-and-drop, or Alt+Arrow from the keyboard -----

  function handleDragStart(event: DragEvent, id: ColumnId) {
    event.dataTransfer.effectAllowed = 'move';
    // Firefox won't start a drag without some data set.
    event.dataTransfer.setData('text/plain', id);
    setDragColumn(id);
  }

  function handleDragOver(event: DragEvent, id: ColumnId) {
    if (dragColumn === null || dragColumn === id) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const side = columnOrder.indexOf(dragColumn) < columnOrder.indexOf(id) ? 'after' : 'before';
    setDropTarget((prev) => (prev?.id === id && prev.side === side ? prev : { id, side }));
  }

  function resetDrag() {
    setDragColumn(null);
    setDropTarget(null);
  }

  function handleDrop(event: DragEvent, id: ColumnId) {
    event.preventDefault();
    if (dragColumn !== null && dragColumn !== id) {
      const from = dragColumn;
      setColumnOrder((prev) => moveItem(prev, from, id));
    }
    resetDrag();
  }

  function handleHeaderKeyDown(event: KeyboardEvent, id: ColumnId) {
    if (!event.altKey) return;
    const index = columnOrder.indexOf(id);
    const neighbor =
      event.key === 'ArrowLeft' ? columnOrder[index - 1]
      : event.key === 'ArrowRight' ? columnOrder[index + 1]
      : undefined;
    if (neighbor === undefined) return;
    event.preventDefault();
    setColumnOrder((prev) => moveItem(prev, id, neighbor));
  }

  const columnCount = columnOrder.length + 1; // + selection column

  return (
    <div className="orders-table-scroll">
      <table className="orders-table" aria-label="Заказы">
        <colgroup>
          <col className="col-select" />
          {columnOrder.map((id) => (
            <col key={id} className={`col-${id}`} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="select-cell" onClick={toggleAll}>
              <span className="select-control">
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onUpdate={noop}
                  controlProps={{ 'aria-label': 'Выбрать все заказы' }}
                />
              </span>
            </th>
            {columnOrder.map((id) => {
              const column = COLUMNS[id];
              const classes = [
                'column-header',
                column.align === 'end' ? 'align-end' : '',
                dragColumn === id ? 'is-dragging' : '',
                dropTarget?.id === id ? `is-drop-${dropTarget.side}` : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <th
                  key={id}
                  scope="col"
                  className={classes}
                  draggable
                  tabIndex={0}
                  aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
                  title="Перетащите, чтобы переставить колонку (или Alt + ← / →)"
                  onDragStart={(e) => handleDragStart(e, id)}
                  onDragOver={(e) => handleDragOver(e, id)}
                  onDragLeave={() => setDropTarget((prev) => (prev?.id === id ? null : prev))}
                  onDrop={(e) => handleDrop(e, id)}
                  onDragEnd={resetDrag}
                  onKeyDown={(e) => handleHeaderKeyDown(e, id)}
                >
                  {column.title}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="empty-cell">
                Заказов нет
              </td>
            </tr>
          )}

          {sections.map((section) => {
            const isCollapsed = section.status !== null && collapsed.has(section.status);
            const sectionSelected = section.orders.filter((o) => selectedIds.has(o.id)).length;
            const sectionAll = sectionSelected === section.orders.length && section.orders.length > 0;

            return (
              <Fragment key={section.status ?? 'flat'}>
                {section.status !== null && (
                  <tr className="group-row">
                    <td className="select-cell" onClick={() => toggleSection(section)}>
                      <span className="select-control">
                        <Checkbox
                          checked={sectionAll}
                          indeterminate={sectionSelected > 0 && !sectionAll}
                          onUpdate={noop}
                          controlProps={{ 'aria-label': `Выбрать все заказы со статусом «${STATUS_META[section.status].label}»` }}
                        />
                      </span>
                    </td>
                    <td colSpan={columnOrder.length}>
                      <button
                        type="button"
                        className="group-toggle"
                        aria-expanded={!isCollapsed}
                        onClick={() => toggleCollapsed(section.status!)}
                      >
                        <Icon data={isCollapsed ? ChevronRight : ChevronDown} size={14} />
                        <StatusLabel status={section.status} />
                        <span className="group-count">{section.orders.length}</span>
                      </button>
                    </td>
                  </tr>
                )}

                {!isCollapsed &&
                  section.orders.map((order) => {
                    const selected = selectedIds.has(order.id);
                    return (
                      <tr
                        key={order.id}
                        className={selected ? 'is-selected' : undefined}
                        onClick={(e) => handleRowClick(e, order.id)}
                      >
                        <td className="select-cell">
                          <span className="select-control">
                            <Checkbox checked={selected} onUpdate={noop} controlProps={{ 'aria-label': `Выбрать заказ #${order.id}` }} />
                          </span>
                        </td>
                        {columnOrder.map((id) => (
                          <td key={id} className={COLUMNS[id].align === 'end' ? 'align-end' : undefined}>
                            {COLUMNS[id].render(order)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusLabel({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Label theme={meta.theme} size="s" icon={<Icon data={meta.icon} size={12} />}>
      {meta.label}
    </Label>
  );
}
