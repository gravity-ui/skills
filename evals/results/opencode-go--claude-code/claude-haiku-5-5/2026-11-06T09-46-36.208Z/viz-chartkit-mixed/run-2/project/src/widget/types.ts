/** Режим виджета: какой движок отрисовывает одни и те же данные. */
export type ChartMode = 'sales' | 'monitoring';

export interface SeriesPoint {
  /** Unix-время в миллисекундах. */
  t: number;
  /** Значение; `null` — измерения не было, рисуется разрыв линии. */
  v: number | null;
}

export interface Series {
  /** Стабильный идентификатор: от него зависит цвет серии. */
  id: string;
  name: string;
  /** Точки по возрастанию `t`. */
  points: readonly SeriesPoint[];
}

/**
 * Единый API виджета. Набор пропсов одинаков для обоих режимов:
 * меняется только движок, который рисует данные.
 */
export interface ChartWidgetProps {
  title: string;
  series: readonly Series[];
  /** Управляемый режим. Если не задан — виджет хранит режим сам. */
  mode?: ChartMode;
  /** Начальный режим для неуправляемого использования. По умолчанию `sales`. */
  defaultMode?: ChartMode;
  onModeChange?: (mode: ChartMode) => void;
  /** Полная высота области графика, включая полосу подписей оси X. */
  height?: number;
  formatValue?: (value: number) => string;
}
