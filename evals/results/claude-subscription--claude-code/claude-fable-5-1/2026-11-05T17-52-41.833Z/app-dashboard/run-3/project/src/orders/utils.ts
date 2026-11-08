import { STATUS_ORDER, type Order, type OrderStatus } from './types';

export type DropSide = 'before' | 'after';

/**
 * Returns a new column order with `sourceId` placed before/after `targetId`.
 * Unknown ids or a no-op move return the original array (same reference).
 */
export function moveColumn(order: string[], sourceId: string, targetId: string, side: DropSide): string[] {
  if (sourceId === targetId) return order;
  const from = order.indexOf(sourceId);
  const targetIndex = order.indexOf(targetId);
  if (from === -1 || targetIndex === -1) return order;

  const next = order.filter((id) => id !== sourceId);
  let to = next.indexOf(targetId);
  if (side === 'after') to += 1;
  if (to === from) return order;
  next.splice(to, 0, sourceId);
  return next;
}

/** Moves a column one position to the left or right; stays put at the edges. */
export function shiftColumn(order: string[], id: string, direction: -1 | 1): string[] {
  const index = order.indexOf(id);
  const neighbour = order[index + direction];
  if (index === -1 || neighbour === undefined) return order;
  return moveColumn(order, id, neighbour, direction === -1 ? 'before' : 'after');
}

export interface OrderGroup {
  status: OrderStatus;
  orders: Order[];
  total: number;
}

/** Groups orders by status in the canonical STATUS_ORDER; empty statuses are skipped. */
export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  const byStatus = new Map<OrderStatus, Order[]>();
  for (const order of orders) {
    const bucket = byStatus.get(order.status);
    if (bucket) bucket.push(order);
    else byStatus.set(order.status, [order]);
  }
  return STATUS_ORDER.filter((status) => byStatus.has(status)).map((status) => {
    const groupOrders = byStatus.get(status)!;
    return {
      status,
      orders: groupOrders,
      total: groupOrders.reduce((sum, o) => sum + o.total, 0),
    };
  });
}

/** Russian plural forms: pluralize(5, ['заказ', 'заказа', 'заказов']) → 'заказов'. */
export function pluralize(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

const moneyFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatMoney = (value: number) => moneyFormat.format(value);
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

function csvCell(value: string | number): string {
  const str = String(value);
  return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/** Semicolon-separated CSV (Excel-friendly for ru locale). */
export function ordersToCsv(orders: Order[]): string {
  const header = ['id', 'customer', 'city', 'createdAt', 'itemsCount', 'total', 'payment', 'status'];
  const rows = orders.map((o) =>
    [o.id, o.customer, o.city, o.createdAt, o.itemsCount, o.total, o.payment, o.status].map(csvCell).join(';'),
  );
  return [header.join(';'), ...rows].join('\n');
}
