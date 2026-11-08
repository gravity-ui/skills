/** Режимы виджета: каждый режим обслуживается своим графическим движком. */
export type TimeSeriesMode = 'sales' | 'monitoring';

export interface TimeSeriesSeries {
  id: string;
  name: string;
  /** Значения, выровненные по `timeline`; `null` — пропуск данных. */
  values: Array<number | null>;
}

/** Единый формат данных для обоих режимов. */
export interface TimeSeriesData {
  /** Метки времени, мс (UTC epoch), по возрастанию. */
  timeline: number[];
  series: TimeSeriesSeries[];
  /** Единица измерения для подписей оси и тултипа, например «₽» или «%». */
  unit?: string;
}

export interface TimeSeriesWidgetProps {
  /** Данные по режимам — виджет сам выбирает набор под активный режим. */
  data: Record<TimeSeriesMode, TimeSeriesData>;
  /** Controlled-режим. Если не задан — виджет хранит режим сам. */
  mode?: TimeSeriesMode;
  defaultMode?: TimeSeriesMode;
  onModeChange?: (mode: TimeSeriesMode) => void;
  title?: string;
  /** Высота области графика, px. */
  height?: number;
}

export type ThemeName = 'light' | 'dark';
