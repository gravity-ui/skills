import type { Order, OrderStatus } from '../data/orders';
import { STATUS_ORDER } from '../data/orders';

/** Move column `fromId` so that it lands at the position of `toId`. */
export function reorderColumns(order: string[], fromId: string, toId: string): string[] {
  if (fromId === toId) return order;
  const from = order.indexOf(fromId);
  const to = order.indexOf(toId);
  if (from === -1 || to === -1) return order;
  const next = order.slice();
  next.splice(from, 1);
  next.splice(to, 0, fromId);
  return next;
}

export interface OrderGroup {
  status: OrderStatus;
  orders: Order[];
  total: number;
}

/** Group orders by status in canonical status order; empty groups are omitted. */
export function groupByStatus(orders: Order[]): OrderGroup[] {
  const map = new Map<OrderStatus, Order[]>();
  for (const order of orders) {
    const list = map.get(order.status);
    if (list) list.push(order);
    else map.set(order.status, [order]);
  }
  return STATUS_ORDER.filter((s) => map.has(s)).map((status) => {
    const list = map.get(status)!;
    return { status, orders: list, total: list.reduce((sum, o) => sum + o.amount, 0) };
  });
}

export function filterOrders(orders: Order[], query: string): Order[] {
  const q = query.trim().toLowerCase();
  if (!q) return orders;
  return orders.filter(
    (o) =>
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q),
  );
}

export const formatMoney = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
}).format;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
