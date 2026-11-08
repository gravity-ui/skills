/**
 * Публичный API виджета графика.
 *
 * Оба режима (обычный линейный график продаж и плотный временной ряд мониторинга)
 * принимают одинаковые данные и одинаковые props. Движок отрисовки выбирается
 * внутри виджета и скрыт от вызывающего кода.
 */

/** Режимы виджета. */
export type ChartMode = 'sales' | 'monitoring';

export interface ChartPoint {
  /** Метка времени в миллисекундах Unix epoch. Одна единица для обоих режимов. */
  x: number;
  /** Значение. `null` означает пропуск: линия прерывается. */
  y: number | null;
}

export interface ChartSeries {
  /** Стабильный идентификатор серии. */
  id: string;
  /** Подпись в легенде. */
  name: string;
  /** Точки серии, отсортированные по `x` по возрастанию. */
  points: ChartPoint[];
}

export interface ChartDataset {
  series: ChartSeries[];
  /** Единица измерения для легенды, например `'тыс. ₽'` или `'мс'`. */
  unit?: string;
}

/** Данные для каждого режима. Переключатель выбирает один из двух наборов. */
export type ChartDatasets = Record<ChartMode, ChartDataset>;

export interface ChartWidgetProps {
  title: string;
  datasets: ChartDatasets;
  /** Управляемый режим. Если не задан, виджет управляет режимом сам. */
  mode?: ChartMode;
  /** Начальный режим для неуправляемого использования. По умолчанию `'sales'`. */
  defaultMode?: ChartMode;
  onModeChange?: (mode: ChartMode) => void;
  /** Высота области графика в пикселях. По умолчанию 360. */
  height?: number;
}

/** Серия с назначенным цветом. Её получает движок отрисовки. */
export interface EngineSeries extends ChartSeries {
  color: string;
}

/** Контракт, который выполняет каждый движок отрисовки. */
export interface ChartEngineProps {
  series: EngineSeries[];
}
