import type { Order, OrderStatus } from '../data/orders';

export type ColumnId = 'id' | 'customer' | 'city' | 'items' | 'amount' | 'status' | 'createdAt';

export const DEFAULT_COLUMN_ORDER: ColumnId[] = [
  'id',
  'customer',
  'city',
  'items',
  'amount',
  'status',
  'createdAt',
];

export interface StatusGroup {
  status: OrderStatus;
  orders: Order[];
}

/** Группирует заказы по статусу в заданном порядке. Пустые группы не возвращаются. */
export function groupByStatus(
  orders: readonly Order[],
  statuses: readonly OrderStatus[],
): StatusGroup[] {
  return statuses
    .map((status) => ({ status, orders: orders.filter((o) => o.status === status) }))
    .filter((group) => group.orders.length > 0);
}

/** Переносит `item` на место `target`. Если `item` стоит левее, он уходит правее `target`, и наоборот. */
export function moveItem<T>(items: readonly T[], item: T, target: T): T[] {
  const from = items.indexOf(item);
  const to = items.indexOf(target);
  if (from === -1 || to === -1 || from === to) return [...items];
  const next = [...items];
  next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Сдвигает `item` на одну позицию влево (delta = -1) или вправо (delta = 1). У края ничего не делает. */
export function shiftItem<T>(items: readonly T[], item: T, delta: -1 | 1): T[] {
  const from = items.indexOf(item);
  const neighbour = from + delta;
  if (from === -1 || neighbour < 0 || neighbour >= items.length) return [...items];
  return moveItem(items, item, items[neighbour]);
}

export type SelectionState = 'none' | 'some' | 'all';

export function selectionState(selected: ReadonlySet<string>, ids: readonly string[]): SelectionState {
  let count = 0;
  for (const id of ids) if (selected.has(id)) count += 1;
  if (count === 0) return 'none';
  return count === ids.length ? 'all' : 'some';
}

/** Возвращает новое множество, где `ids` выделены (`on = true`) или сняты (`on = false`). */
export function setIds(selected: ReadonlySet<string>, ids: readonly string[], on: boolean): Set<string> {
  const next = new Set(selected);
  for (const id of ids) {
    if (on) next.add(id);
    else next.delete(id);
  }
  return next;
}

/**
 * Выделение диапазона видимых строк от якоря до цели (Shift-клик).
 * Если якорь не видим (например, его группу свернули), выделяется только цель.
 */
export function selectRange(
  selected: ReadonlySet<string>,
  visibleIds: readonly string[],
  anchorId: string,
  targetId: string,
  on: boolean,
): Set<string> {
  const anchor = visibleIds.indexOf(anchorId);
  const target = visibleIds.indexOf(targetId);
  if (anchor === -1 || target === -1) return setIds(selected, [targetId], on);
  const from = Math.min(anchor, target);
  const to = Math.max(anchor, target);
  return setIds(selected, visibleIds.slice(from, to + 1), on);
}
