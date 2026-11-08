import { useMemo, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Button, Checkbox, Icon, Label, Switch } from '@gravity-ui/uikit';
import { ChevronDown, ChevronRight, Grip } from '@gravity-ui/icons';
import { STATUS_META, formatAmount, formatDate, type Order, type OrderStatus } from './model';
import { checkState, groupByStatus, moveItem, setIds, toggleId, type StatusGroup } from './tableLogic';

type ColumnId = 'number' | 'customer' | 'city' | 'items' | 'amount' | 'date' | 'status';

interface ColumnDef {
  id: ColumnId;
  title: string;
  numeric?: boolean;
  render: (order: Order) => ReactNode;
}

const COLUMNS: ColumnDef[] = [
  { id: 'number', title: 'Заказ', render: (o) => <span className="cell-mono">#{o.id}</span> },
  { id: 'customer', title: 'Клиент', render: (o) => o.customer },
  { id: 'city', title: 'Город', render: (o) => o.city },
  { id: 'items', title: 'Позиции', numeric: true, render: (o) => o.itemsCount },
  { id: 'amount', title: 'Сумма', numeric: true, render: (o) => formatAmount(o.amount) },
  { id: 'date', title: 'Дата', render: (o) => formatDate(o.createdAt) },
  { id: 'status', title: 'Статус', render: (o) => <OrderStatusLabel status={o.status} /> },
];

const COLUMN_BY_ID = new Map(COLUMNS.map((column) => [column.id, column]));
const DEFAULT_COLUMN_ORDER: ColumnId[] = COLUMNS.map((column) => column.id);

export function OrderStatusLabel({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Label theme={meta.theme} size="s" icon={<Icon data={meta.icon} size={12} />}>
      {meta.label}
    </Label>
  );
}

interface OrdersTableProps {
  orders: readonly Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [grouped, setGrouped] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<OrderStatus>>(() => new Set());
  const [dragId, setDragId] = useState<ColumnId | null>(null);
  const [dropId, setDropId] = useState<ColumnId | null>(null);

  const allIds = useMemo(() => orders.map((order) => order.id), [orders]);
  const groups = useMemo(() => groupByStatus(orders), [orders]);
  const allState = checkState(allIds, selected);
  const columnsChanged = columnOrder.some((id, index) => id !== DEFAULT_COLUMN_ORDER[index]);

  const toggleGroupCollapsed = (status: OrderStatus) => {
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

  const resetDrag = () => {
    setDragId(null);
    setDropId(null);
  };

  const handleDragStart = (event: DragEvent<HTMLTableCellElement>, id: ColumnId) => {
    event.dataTransfer.effectAllowed = 'move';
    // Firefox не начинает перетаскивание без данных в dataTransfer.
    event.dataTransfer.setData('text/plain', id);
    setDragId(id);
  };

  const handleDragOver = (event: DragEvent<HTMLTableCellElement>, id: ColumnId) => {
    if (dragId === null || dragId === id) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropId(id);
  };

  const handleDrop = (event: DragEvent<HTMLTableCellElement>, id: ColumnId) => {
    event.preventDefault();
    if (dragId !== null && dragId !== id) {
      setColumnOrder((prev) => moveItem(prev, dragId, id));
    }
    resetDrag();
  };

  // Клавиатурный аналог перетаскивания: Alt + стрелки.
  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLTableCellElement>, id: ColumnId) => {
    if (!event.altKey) return;
    const offset = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (offset === 0) return;
    event.preventDefault();
    setColumnOrder((prev) => {
      const index = prev.indexOf(id);
      const neighbour = prev[index + offset];
      return neighbour === undefined ? prev : moveItem(prev, id, neighbour);
    });
  };

  const dropSide = (id: ColumnId): 'before' | 'after' | null => {
    if (dragId === null || dropId !== id) return null;
    return columnOrder.indexOf(dragId) < columnOrder.indexOf(id) ? 'after' : 'before';
  };

  const renderRow = (order: Order) => {
    const isSelected = selected.has(order.id);
    return (
      <tr key={order.id} className={isSelected ? 'is-selected' : undefined} aria-selected={isSelected}>
        <td className="cell-check">
          <Checkbox
            checked={isSelected}
            onUpdate={() => setSelected((prev) => toggleId(prev, order.id))}
            controlProps={{ 'aria-label': `Выбрать заказ #${order.id}` }}
          />
        </td>
        {columnOrder.map((id) => {
          const column = COLUMN_BY_ID.get(id)!;
          return (
            <td key={id} className={column.numeric ? 'is-numeric' : undefined}>
              {column.render(order)}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderGroup = (group: StatusGroup) => {
    const collapsed = collapsedGroups.has(group.status);
    const ids = group.orders.map((order) => order.id);
    const state = checkState(ids, selected);
    return (
      <tbody key={group.status}>
        <tr className="group-row">
          <td className="cell-check">
            <Checkbox
              checked={state === 'all'}
              indeterminate={state === 'some'}
              onUpdate={() => setSelected((prev) => setIds(prev, ids, state !== 'all'))}
              controlProps={{ 'aria-label': `Выбрать все заказы: ${STATUS_META[group.status].label}` }}
            />
          </td>
          <td colSpan={columnOrder.length}>
            <button
              type="button"
              className="group-toggle"
              aria-expanded={!collapsed}
              onClick={() => toggleGroupCollapsed(group.status)}
            >
              <Icon data={collapsed ? ChevronRight : ChevronDown} size={16} />
              <OrderStatusLabel status={group.status} />
              <span className="group-count">{group.orders.length}</span>
            </button>
          </td>
        </tr>
        {!collapsed && group.orders.map(renderRow)}
      </tbody>
    );
  };

  return (
    <section className="orders-table">
      <div className="orders-toolbar">
        <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        <div className="orders-toolbar__right">
          <span>Заказов: {orders.length}</span>
          {selected.size > 0 && (
            <>
              <span>Выбрано: {selected.size}</span>
              <Button view="flat" size="s" onClick={() => setSelected(new Set())}>
                Снять выделение
              </Button>
            </>
          )}
          {columnsChanged && (
            <Button view="flat" size="s" onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}>
              Сбросить порядок колонок
            </Button>
          )}
        </div>
      </div>

      <div className="orders-table__scroll">
        <table className="orders-table__table" aria-label="Заказы">
          <thead>
            <tr>
              <th scope="col" className="cell-check">
                <Checkbox
                  checked={allState === 'all'}
                  indeterminate={allState === 'some'}
                  onUpdate={() => setSelected((prev) => setIds(prev, allIds, allState !== 'all'))}
                  controlProps={{ 'aria-label': 'Выбрать все заказы' }}
                />
              </th>
              {columnOrder.map((id) => {
                const column = COLUMN_BY_ID.get(id)!;
                const side = dropSide(id);
                const classNames = [
                  column.numeric ? 'is-numeric' : '',
                  dragId === id ? 'is-dragging' : '',
                  side ? `is-drop-${side}` : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <th
                    key={id}
                    scope="col"
                    className={classNames}
                    draggable
                    tabIndex={0}
                    title="Перетащите, чтобы поменять колонки местами. Или Alt + ← / →"
                    onDragStart={(event) => handleDragStart(event, id)}
                    onDragOver={(event) => handleDragOver(event, id)}
                    onDrop={(event) => handleDrop(event, id)}
                    onDragEnd={resetDrag}
                    onKeyDown={(event) => handleHeaderKeyDown(event, id)}
                  >
                    <span className="th-content">
                      <Icon data={Grip} size={12} className="grip" />
                      {column.title}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {grouped ? (
            groups.map(renderGroup)
          ) : (
            <tbody>{orders.map(renderRow)}</tbody>
          )}

          {orders.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={columnOrder.length + 1} className="orders-table__empty">
                  Заказов нет
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </section>
  );
}
