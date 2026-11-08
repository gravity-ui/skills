import type { LabelProps } from '@gravity-ui/uikit';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  city: string;
  /** ISO date string */
  createdAt: string;
  itemsCount: number;
  /** Amount in rubles */
  total: number;
  payment: string;
  status: OrderStatus;
}

/** Order in which status groups are displayed. */
export const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_META: Record<OrderStatus, { title: string; theme: NonNullable<LabelProps['theme']> }> = {
  new: { title: 'Новый', theme: 'info' },
  processing: { title: 'В обработке', theme: 'warning' },
  shipped: { title: 'Отправлен', theme: 'utility' },
  delivered: { title: 'Доставлен', theme: 'success' },
  cancelled: { title: 'Отменён', theme: 'danger' },
};
