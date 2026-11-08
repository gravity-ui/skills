// Mock data for the demo dashboard. Replace with real sources as needed.

export type KpiMetric = 'revenue' | 'orders' | 'conversion' | 'users';

export interface KpiData {
  label: string;
  value: string;
  /** Relative change vs. previous period, in percent. */
  delta: number;
}

export const KPI_DATA: Record<KpiMetric, KpiData> = {
  revenue: {label: 'Выручка за месяц', value: '4 820 000 ₽', delta: 12.4},
  orders: {label: 'Заказы', value: '1 284', delta: 5.1},
  conversion: {label: 'Конверсия', value: '3,8 %', delta: -0.6},
  users: {label: 'Активные пользователи', value: '18 540', delta: 8.9},
};

export const REVENUE_BY_MONTH: {month: string; revenue: number}[] = [
  {month: 'Янв', revenue: 3.1},
  {month: 'Фев', revenue: 3.4},
  {month: 'Мар', revenue: 3.2},
  {month: 'Апр', revenue: 3.9},
  {month: 'Май', revenue: 4.1},
  {month: 'Июн', revenue: 3.8},
  {month: 'Июл', revenue: 4.3},
  {month: 'Авг', revenue: 4.0},
  {month: 'Сен', revenue: 4.6},
  {month: 'Окт', revenue: 4.4},
  {month: 'Ноя', revenue: 4.8},
];

export const ORDERS_BY_CHANNEL: {channel: string; orders: number}[] = [
  {channel: 'Сайт', orders: 540},
  {channel: 'Приложение', orders: 420},
  {channel: 'Маркетплейс', orders: 230},
  {channel: 'Партнёры', orders: 94},
];

export interface ActivityEntry {
  time: string;
  text: string;
}

export const RECENT_ACTIVITY: ActivityEntry[] = [
  {time: '10:42', text: 'Новый заказ №1284 на 12 400 ₽'},
  {time: '10:17', text: 'Обновлён прайс-лист для партнёров'},
  {time: '09:58', text: 'Закрыт инцидент «задержка оплаты»'},
  {time: '09:31', text: 'Запущена кампания «Осень 2026»'},
  {time: '09:05', text: 'Новый пользователь из раздела «Бизнес»'},
];
