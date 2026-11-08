export interface LineSeries {
  /** Stable id — color is bound to it, never to the series' position. */
  id: string;
  name: string;
  values: number[];
}

export interface LineChartData {
  title: string;
  subtitle: string;
  /** Unit shown in the tooltip and table header. */
  unit: string;
  categories: string[];
  series: LineSeries[];
}

export const activeUsersByPlatform: LineChartData = {
  title: 'Активные пользователи по платформам',
  subtitle: 'Тысяч пользователей в месяц, 2025 год',
  unit: 'тыс.',
  categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  series: [
    { id: 'web', name: 'Web', values: [412, 428, 451, 447, 476, 498, 489, 503, 531, 548, 572, 596] },
    { id: 'ios', name: 'iOS', values: [238, 246, 259, 271, 284, 297, 305, 318, 322, 339, 354, 371] },
    { id: 'android', name: 'Android', values: [301, 309, 304, 326, 341, 338, 357, 369, 384, 392, 401, 418] },
  ],
};
