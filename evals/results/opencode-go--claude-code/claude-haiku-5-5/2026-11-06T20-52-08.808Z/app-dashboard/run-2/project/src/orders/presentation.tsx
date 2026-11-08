import { Box, CircleCheck, CircleXmark, Clock, CirclePlus } from '@gravity-ui/icons';
import type { IconData, LabelProps } from '@gravity-ui/uikit';
import type { OrderStatus } from './types';

export interface StatusMeta {
  label: string;
  /** Uikit Label theme. Status is always shown as icon + text, never by color alone. */
  theme: NonNullable<LabelProps['theme']>;
  icon: IconData;
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  new: { label: 'Новый', theme: 'info', icon: CirclePlus },
  processing: { label: 'В обработке', theme: 'warning', icon: Clock },
  shipped: { label: 'Отправлен', theme: 'utility', icon: Box },
  delivered: { label: 'Доставлен', theme: 'success', icon: CircleCheck },
  cancelled: { label: 'Отменён', theme: 'danger', icon: CircleXmark },
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatMoney(value: number): string {
  return currencyFormatter.format(value);
}
