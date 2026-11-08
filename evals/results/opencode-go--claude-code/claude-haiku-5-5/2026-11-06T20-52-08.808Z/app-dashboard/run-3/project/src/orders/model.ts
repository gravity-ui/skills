import type { IconData } from '@gravity-ui/uikit';
import { CircleCheckFill, CircleInfoFill, CircleXmarkFill, Clock, Rocket } from '@gravity-ui/icons';

/** Статусы в порядке прохождения заказа: в этом порядке идут группы в таблице. */
export const ORDER_STATUSES = ['new', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  customer: string;
  city: string;
  itemsCount: number;
  /** Сумма заказа в рублях. */
  amount: number;
  createdAt: Date;
  status: OrderStatus;
}

type LabelTheme = 'info' | 'warning' | 'utility' | 'success' | 'danger';

/**
 * Статус всегда показывается и цветом, и иконкой, и подписью:
 * цвет сам по себе не передаёт смысл.
 */
export const STATUS_META: Record<OrderStatus, { label: string; theme: LabelTheme; icon: IconData }> = {
  new: { label: 'Новый', theme: 'info', icon: CircleInfoFill },
  processing: { label: 'В обработке', theme: 'warning', icon: Clock },
  shipped: { label: 'Отправлен', theme: 'utility', icon: Rocket },
  delivered: { label: 'Доставлен', theme: 'success', icon: CircleCheckFill },
  cancelled: { label: 'Отменён', theme: 'danger', icon: CircleXmarkFill },
};

const rubFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

// Даты генерируются в UTC, поэтому и форматируем в UTC, чтобы не сдвигать день по часовому поясу.
const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatAmount = (value: number): string => rubFormat.format(value);
export const formatDate = (value: Date): string => dateFormat.format(value);
