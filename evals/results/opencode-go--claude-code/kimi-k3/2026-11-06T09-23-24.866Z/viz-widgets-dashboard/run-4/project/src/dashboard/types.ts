export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WidgetType = 'kpi' | 'line' | 'bar' | 'mix';

export type MetricKey = 'revenue' | 'users' | 'conv' | 'churn';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  rect: Rect;
  /** For kpi widgets: which metric to show */
  metric?: MetricKey;
  /** Chart widgets can flip to their table view */
  view?: 'chart' | 'table';
}

export const GRID_COLS = 12;
export const GRID_ROW_H = 64;
export const GRID_GAP = 12;

export const MIN_SIZE: Record<WidgetType, {w: number; h: number}> = {
  kpi: {w: 3, h: 2},
  line: {w: 4, h: 4},
  bar: {w: 4, h: 4},
  mix: {w: 4, h: 3},
};

export const WIDGET_TITLES: Record<WidgetType, string> = {
  kpi: 'Показатель',
  line: 'Динамика выручки',
  bar: 'Выручка по категориям',
  mix: 'Структура по каналам',
};

export const KPI_TITLES: Record<MetricKey, string> = {
  revenue: 'Выручка',
  users: 'Активные пользователи',
  conv: 'Конверсия',
  churn: 'Отток',
};

export function widgetTitle(w: WidgetInstance): string {
  return w.type === 'kpi' && w.metric ? KPI_TITLES[w.metric] : WIDGET_TITLES[w.type];
}

export const DEFAULT_WIDGETS: WidgetInstance[] = [
  {id: 'kpi-revenue', type: 'kpi', metric: 'revenue', rect: {x: 0, y: 0, w: 3, h: 2}},
  {id: 'kpi-users', type: 'kpi', metric: 'users', rect: {x: 3, y: 0, w: 3, h: 2}},
  {id: 'kpi-conv', type: 'kpi', metric: 'conv', rect: {x: 6, y: 0, w: 3, h: 2}},
  {id: 'kpi-churn', type: 'kpi', metric: 'churn', rect: {x: 9, y: 0, w: 3, h: 2}},
  {id: 'line-1', type: 'line', rect: {x: 0, y: 2, w: 7, h: 5}},
  {id: 'bar-1', type: 'bar', rect: {x: 7, y: 2, w: 5, h: 5}},
  {id: 'mix-1', type: 'mix', rect: {x: 0, y: 7, w: 12, h: 3}},
];
