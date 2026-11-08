import type {ProgressTheme} from '@gravity-ui/uikit';

// Демо-данные для виджетов. В реальном приложении их заменяет загрузка с сервера.

export type MetricData = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

export type ProgressData = {
  title: string;
  rows: {name: string; value: number; theme: ProgressTheme}[];
};

export type ListData = {
  title: string;
  items: {id: string; title: string; meta: string}[];
};

export const REVENUE: MetricData = {
  label: 'Выручка за месяц',
  value: '4,82 млн ₽',
  delta: '+12,4% к прошлому месяцу',
  positive: true,
};

export const ORDERS: MetricData = {
  label: 'Заказы',
  value: '1 286',
  delta: '−3,1% к прошлому месяцу',
  positive: false,
};

export const AVERAGE_CHECK: MetricData = {
  label: 'Средний чек',
  value: '3 748 ₽',
  delta: '+5,0% к прошлому месяцу',
  positive: true,
};

export const CHANNELS: ProgressData = {
  title: 'Каналы продаж',
  rows: [
    {name: 'Сайт', value: 58, theme: 'info'},
    {name: 'Мобильное приложение', value: 32, theme: 'success'},
    {name: 'Маркетплейсы', value: 17, theme: 'warning'},
    {name: 'Офлайн-магазины', value: 9, theme: 'misc'},
  ],
};

export const RECENT_EVENTS: ListData = {
  title: 'Последние события',
  items: [
    {id: 'e1', title: 'Заказ #48213 оплачен', meta: '10:42'},
    {id: 'e2', title: 'Новый клиент зарегистрирован', meta: '10:17'},
    {id: 'e3', title: 'Возврат по заказу #48190', meta: '09:58'},
    {id: 'e4', title: 'Поставка на склад №2 принята', meta: '09:31'},
    {id: 'e5', title: 'Обновлён прайс-лист', meta: 'вчера'},
  ],
};
