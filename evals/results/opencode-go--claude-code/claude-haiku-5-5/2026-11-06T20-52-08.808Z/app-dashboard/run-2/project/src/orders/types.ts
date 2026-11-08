export const ORDER_STATUSES = [
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  customer: string;
  email: string;
  city: string;
  createdAt: Date;
  status: OrderStatus;
  itemsCount: number;
  total: number;
}
