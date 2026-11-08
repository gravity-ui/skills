export type SeriesId = 'web' | 'ios' | 'android';

export interface Series {
  id: SeriesId;
  name: string;
  values: number[];
}

/** Активные пользователи по платформам, тыс. чел., по месяцам. */
export const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const SERIES: Series[] = [
  { id: 'web', name: 'Web', values: [48, 51, 55, 54, 60, 66, 63, 70, 76, 81, 88, 92] },
  { id: 'ios', name: 'iOS', values: [22, 25, 27, 31, 34, 36, 41, 44, 47, 52, 57, 61] },
  { id: 'android', name: 'Android', values: [12, 14, 15, 17, 20, 21, 25, 27, 30, 31, 35, 38] },
];

export const UNIT = 'тыс.';
