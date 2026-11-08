import { ORDER_STATUSES, type Order, type OrderStatus } from './types';

export interface OrderGroup {
  status: OrderStatus;
  orders: Order[];
}

/**
 * Groups orders by status in the canonical status order.
 * Statuses without orders are omitted, so the table never shows empty groups.
 */
export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  const buckets = new Map<OrderStatus, Order[]>(ORDER_STATUSES.map((status) => [status, []]));
  for (const order of orders) {
    buckets.get(order.status)?.push(order);
  }
  return ORDER_STATUSES.flatMap((status) => {
    const groupOrders = buckets.get(status) ?? [];
    return groupOrders.length > 0 ? [{ status, orders: groupOrders }] : [];
  });
}

/**
 * Returns a copy of `items` with `from` moved to the position currently held by `to`.
 * Returns the same array when nothing changes.
 */
export function moveItem<T>(items: readonly T[], from: T, to: T): T[] {
  const fromIndex = items.indexOf(from);
  const toIndex = items.indexOf(to);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return items as T[];
  }
  const next = items.slice();
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}
