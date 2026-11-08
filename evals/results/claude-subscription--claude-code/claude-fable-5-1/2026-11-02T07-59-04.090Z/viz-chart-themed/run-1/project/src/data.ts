// Демо-данные: заказы по каналам за последние 12 месяцев.
export type Series = { id: string; name: string; values: number[] };

export const CATEGORIES = [
  'Ноя 2025',
  'Дек',
  'Янв 2026',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
];

export const SERIES: Series[] = [
  { id: 'web', name: 'Веб', values: [2140, 2630, 1980, 2210, 2560, 2890, 3120, 3340, 3210, 3580, 3920, 4260] },
  { id: 'ios', name: 'iOS', values: [1210, 1480, 1190, 1320, 1510, 1690, 1840, 2010, 2170, 2290, 2460, 2610] },
  { id: 'android', name: 'Android', values: [880, 1040, 910, 1010, 1130, 1290, 1420, 1500, 1610, 1760, 1870, 1990] },
];

export const CHART_TITLE = 'Заказы по каналам';
export const CHART_SUBTITLE = 'Штук в месяц, ноябрь 2025 — октябрь 2026';

const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
export const formatNumber = (n: number) => formatter.format(n);
