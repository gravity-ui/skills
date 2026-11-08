/** Режимы виджета: каждый режим соответствует своему движку графиков. */
export type ChartMode = 'sales' | 'monitoring';

export const CHART_MODES: readonly ChartMode[] = ['sales', 'monitoring'];

/** Точка ряда: [timestamp в мс, значение]. `null` — разрыв в данных. */
export type TimePoint = readonly [number, number | null];

/** Единая модель ряда для обоих режимов. */
export interface TimeSeries {
  id: string;
  name: string;
  points: readonly TimePoint[];
  /** Цвет закрепляется за сущностью, а не за позицией ряда в массиве. */
  color?: string;
}

export type ValueFormatter = (value: number) => string;

/** Публичный API виджета — один и тот же для любого режима. */
export interface ChartWidgetProps {
  /** Данные по режимам: виджет сам выбирает нужный набор. */
  data: Record<ChartMode, readonly TimeSeries[]>;
  /** Controlled-режим. Если не задан — виджет сам хранит состояние. */
  mode?: ChartMode;
  defaultMode?: ChartMode;
  onModeChange?: (mode: ChartMode) => void;
  /** Высота области графика в px. */
  height?: number;
  /** Форматирование значений по режимам (ось и тултип). */
  formatValue?: Partial<Record<ChartMode, ValueFormatter>>;
  /** Заголовки вкладок переключателя. */
  labels?: Partial<Record<ChartMode, string>>;
  className?: string;
}

/** Контракт, который реализует каждый лениво загружаемый движок. */
export interface EngineProps {
  series: readonly TimeSeries[];
  height: number;
  formatValue: ValueFormatter;
}
