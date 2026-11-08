// Demo data for the dashboard widgets. Replace with real data sources.

export type KpiMetricId = 'revenue' | 'orders' | 'customers' | 'avgCheck';

export interface KpiMetric {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
}

export const KPI_METRICS: Record<KpiMetricId, KpiMetric> = {
  revenue: {title: 'Выручка', value: '4,82 млн ₽', delta: '+12,4%', positive: true},
  orders: {title: 'Заказы', value: '1 284', delta: '+4,1%', positive: true},
  customers: {title: 'Новые клиенты', value: '326', delta: '−2,7%', positive: false},
  avgCheck: {title: 'Средний чек', value: '3 752 ₽', delta: '+1,9%', positive: true},
};

export const REVENUE_BY_MONTH: {month: string; revenue: number}[] = [
  {month: 'Янв', revenue: 310},
  {month: 'Фев', revenue: 335},
  {month: 'Мар', revenue: 362},
  {month: 'Апр', revenue: 348},
  {month: 'Май', revenue: 391},
  {month: 'Июн', revenue: 420},
  {month: 'Июл', revenue: 404},
  {month: 'Авг', revenue: 437},
  {month: 'Сен', revenue: 452},
  {month: 'Окт', revenue: 468},
  {month: 'Ноя', revenue: 489},
  {month: 'Дек', revenue: 512},
];

export interface ActivityEvent {
  time: string;
  text: string;
}

export const RECENT_EVENTS: ActivityEvent[] = [
  {time: '10:42', text: 'Заказ №1284 оплачен'},
  {time: '10:17', text: 'Новый клиент зарегистрировался'},
  {time: '09:55', text: 'Возврат по заказу №1269'},
  {time: '09:31', text: 'Обновлён каталог: 14 товаров'},
  {time: '09:08', text: 'Заказ №1281 отправлен'},
  {time: '08:46', text: 'Выгрузка отчёта за вчера завершена'},
];
