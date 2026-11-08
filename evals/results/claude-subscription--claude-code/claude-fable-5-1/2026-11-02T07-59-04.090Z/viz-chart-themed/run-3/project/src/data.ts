export interface Series {
  /** Stable identifier — color follows this, never the row index. */
  id: string;
  name: string;
  values: number[];
}

export interface ChartData {
  title: string;
  unit: string;
  categories: string[];
  series: Series[];
}

/** Monthly active users by platform, thousands. */
export const activeUsers: ChartData = {
  title: 'Активные пользователи по платформам',
  unit: 'тыс.',
  categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  series: [
    {
      id: 'web',
      name: 'Веб',
      values: [182, 190, 204, 211, 226, 238, 231, 244, 262, 275, 289, 301],
    },
    {
      id: 'mobile',
      name: 'Мобильное приложение',
      values: [96, 108, 121, 139, 152, 171, 185, 198, 207, 219, 228, 236],
    },
    {
      id: 'api',
      name: 'API',
      values: [41, 44, 47, 52, 55, 61, 66, 68, 72, 79, 83, 88],
    },
  ],
};
