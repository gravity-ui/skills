/**
 * Единый публичный API виджета визуализации.
 *
 * Один и тот же <VizWidget> обслуживает оба режима — «продажи» и «мониторинг» —
 * через одинаковый контракт данных (WidgetSeries) и одинаковый контракт движка
 * (EngineProps). Конкретный движок графика подключается лениво (React.lazy +
 * динамический import), поэтому код SVG- и canvas-движков попадает в отдельные
 * чанки и загружается только при первом показе соответствующего режима.
 */

export type WidgetMode = 'sales' | 'monitoring';

/** Одна точка временного ряда. t — unix-время в миллисекундах. */
export interface DataPoint {
  t: number;
  v: number;
}

export interface WidgetSeries {
  /** Стабильный идентификатор серии (цвет привязан к нему, а не к порядку). */
  id: string;
  /** Имя для легенды / подписи. */
  name: string;
  /** Фиксированный слот категориальной палитры (1 — синий, 2 — оранжевый, …). */
  colorSlot: number;
  points: DataPoint[];
}

/** Конфигурация одного режима виджета. */
export interface ModeConfig {
  /** Подпись на переключателе режимов. */
  label: string;
  series: WidgetSeries[];
  /** Форматирование значения (в тултипе, таблице, подписях). */
  formatValue: (v: number) => string;
  /** Форматирование метки времени. */
  formatTime: (t: number) => string;
  /** Доступное описание графика для screen readers. */
  ariaLabel: string;
  /** Шаг прореживания строк в табличном представлении (каждая N-я точка). */
  tableSample?: number;
}

/**
 * Контракт движка графика. Виджет нормализует данные режима в этот набор
 * пропсов и передаёт их выбранному движку — движки взаимозаменяемы.
 */
export interface EngineProps {
  series: WidgetSeries[];
  height: number;
  formatTime: (t: number) => string;
  formatValue: (v: number) => string;
  ariaLabel: string;
  /** 'light' | 'dark' — сигнал движку перерисоваться (canvas читает CSS-переменные). */
  themeKey: string;
}

export interface VizWidgetProps {
  title: string;
  subtitle?: string;
  /** Конфигурация обоих режимов — единая точка входа данных. */
  modes: Record<WidgetMode, ModeConfig>;
  /** Контролируемый режим. Если не задан — виджет управляет режимом сам. */
  mode?: WidgetMode;
  defaultMode?: WidgetMode;
  onModeChange?: (mode: WidgetMode) => void;
  height?: number;
}
