import { ORDER_STATUSES, type Order, type OrderStatus } from './model';

export interface StatusGroup {
  status: OrderStatus;
  orders: Order[];
}

/** Группирует заказы по статусу. Порядок групп фиксирован, пустые группы пропускаются. */
export function groupByStatus(orders: readonly Order[]): StatusGroup[] {
  return ORDER_STATUSES.map((status) => ({
    status,
    orders: orders.filter((order) => order.status === status),
  })).filter((group) => group.orders.length > 0);
}

/**
 * Переносит `from` на место `to`. Если тащим вправо, элемент встаёт за `to`;
 * если влево, перед ним. Возвращает новый массив.
 */
export function moveItem<T>(items: readonly T[], from: T, to: T): T[] {
  const fromIndex = items.indexOf(from);
  const toIndex = items.indexOf(to);
  const next = [...items];
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return next;
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}

export function toggleId(selected: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

export function setIds(selected: ReadonlySet<string>, ids: readonly string[], on: boolean): Set<string> {
  const next = new Set(selected);
  for (const id of ids) {
    if (on) {
      next.add(id);
    } else {
      next.delete(id);
    }
  }
  return next;
}

export type CheckState = 'none' | 'some' | 'all';

/** Состояние «общего» чекбокса: ничего, часть или всё выбрано. */
export function checkState(ids: readonly string[], selected: ReadonlySet<string>): CheckState {
  const count = ids.filter((id) => selected.has(id)).length;
  if (count === 0) return 'none';
  return count === ids.length ? 'all' : 'some';
}
